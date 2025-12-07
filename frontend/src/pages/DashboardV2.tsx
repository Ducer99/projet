// @ts-nocheck
import { Box, Container, Heading, Text, VStack, Button, Grid, GridItem, Code, HStack, Icon, useToast, Divider } from '@chakra-ui/react';
import { useNavigate, Link } from 'react-router-dom';
import { FaCopy, FaKey, FaUsers, FaSitemap, FaHeart, FaCalendar, FaMale, FaFemale, FaPollH } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import LanguageDebug from '../components/LanguageDebug';
import { motion } from 'framer-motion';
import { Card, Badge } from '../components/ui';
import { getFamilyGradient, getFamilySolidColor } from '../utils/colorUtils';
import { slideUp, staggerChildren, staggerItem, scaleIn } from '../utils/animationUtils';

// ==================== INTERFACES ====================
interface FamilyInfo {
  familyID: number;
  familyName: string;
  description: string;
  createdDate: string;
  userRole: string;
  inviteCode: string | null;
  canRegenerateCode: boolean;
}

interface UpcomingEvent {
  eventID: number;
  title: string;
  description: string;
  startDate: string;
  eventType: string;
  isRecurring: boolean;
  daysUntil: number;
  dateLabel: string;
}

interface Marriage {
  weddingID: number;
  manName: string;
  womanName: string;
  patrilinealFamilyName: string;
  status: string;
  weddingDate: string;
  unionCount: number;
  unionTypes: string;
}

interface FamilyMember {
  personID: number;
  firstName: string;
  lastName: string;
  sex: string;
  birthday: string | null;
  alive: boolean;
  photoUrl: string | null;
}

interface FamilyStats {
  membersCount: number;
  generationsCount: number;
  photosCount: number;
  eventsCount: number;
  marriagesCount: number;
}

// ==================== HELPER FUNCTIONS ====================
const getEventEmoji = (type: string): string => {
  const emojis: Record<string, string> = {
    birthday: '🎂',
    death: '🕊️',
    marriage: '💍',
    party: '🎉',
    other: '📅'
  };
  return emojis[type] || '📅';
};

const getEventGradient = (type: string): string => {
  const gradients: Record<string, string> = {
    birthday: 'linear-gradient(135deg, #f857a6 0%, #ff5858 100%)',
    death: 'linear-gradient(135deg, #8e9eab 0%, #eef2f3 100%)',
    marriage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    party: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    other: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };
  return gradients[type] || gradients.other;
};

const getStatusEmoji = (status: string): string => {
  const emojis: Record<string, string> = {
    active: '💚',
    divorced: '💔',
    widowed: '🕊️'
  };
  return emojis[status] || '💍';
};

const getStatusConfig = (status: string) => {
  const configs: Record<string, { gradient: string; label: string; emoji: string }> = {
    active: {
      gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
      label: 'Actif',
      emoji: '💚'
    },
    divorced: {
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      label: 'Divorcé',
      emoji: '💔'
    },
    widowed: {
      gradient: 'linear-gradient(135deg, #8e9eab 0%, #eef2f3 100%)',
      label: 'Veuvage',
      emoji: '🕊️'
    }
  };
  return configs[status] || {
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    label: status,
    emoji: '💍'
  };
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('fr-FR');
};

const calculateAverageAge = (members: FamilyMember[]): number => {
  const livingMembersWithBirthday = members.filter(m => m.birthday && m.alive);
  if (livingMembersWithBirthday.length === 0) return 0;

  const totalAge = livingMembersWithBirthday.reduce((acc, m) => {
    const age = Math.floor((Date.now() - new Date(m.birthday!).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    return acc + age;
  }, 0);

  return Math.round(totalAge / livingMembersWithBirthday.length);
};

// ==================== COMPOSANT PRINCIPAL ====================
const DashboardV2 = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const toast = useToast();
  const { t } = useTranslation();

  // États
  const [familyInfo, setFamilyInfo] = useState<FamilyInfo | null>(null);
  const [loadingRegen, setLoadingRegen] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [marriages, setMarriages] = useState<Marriage[]>([]);
  const [loadingMarriages, setLoadingMarriages] = useState(true);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [stats, setStats] = useState<FamilyStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Chargement des données
  useEffect(() => {
    if (user) {
      loadFamilyInfo();
      loadUpcomingEvents();
      loadMarriages();
      loadMembers();
      loadFamilyStats();
    }
  }, [user]);

  const loadFamilyInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await api.get('/auth/family-info');
      setFamilyInfo(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des infos famille:', error);
    }
  };

  const loadUpcomingEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      setLoadingEvents(true);
      const response = await api.get<UpcomingEvent[]>('/events/upcoming?days=90');
      setUpcomingEvents(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const loadMarriages = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user?.familyID) return;
      setLoadingMarriages(true);
      const response = await api.get<Marriage[]>(`/marriages/family/${user.familyID}`);
      setMarriages(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des mariages:', error);
    } finally {
      setLoadingMarriages(false);
    }
  };

  const loadMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      setLoadingMembers(true);
      const response = await api.get<FamilyMember[]>('/persons');
      setMembers(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des membres:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const loadFamilyStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      setLoadingStats(true);
      const response = await api.get<FamilyStats>('/auth/family-stats');
      setStats(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const copyToClipboard = () => {
    if (familyInfo?.inviteCode) {
      navigator.clipboard.writeText(familyInfo.inviteCode);
      toast({
        title: 'Code copié !',
        description: 'Le code a été copié dans le presse-papiers',
        status: 'success',
        duration: 2000,
      });
    }
  };

  const regenerateCode = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir régénérer le code ? L\'ancien code sera invalidé.')) {
      return;
    }

    setLoadingRegen(true);
    try {
      const response = await api.post('/auth/regenerate-invite-code');
      setFamilyInfo(prev => prev ? { ...prev, inviteCode: response.data.newInviteCode } : null);

      toast({
        title: 'Code régénéré !',
        description: `Nouveau code : ${response.data.newInviteCode}`,
        status: 'success',
        duration: 5000,
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de régénérer le code',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoadingRegen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Composants animés
  const MotionBox = motion(Box);
  const MotionVStack = motion(VStack);

  // Calculs pour les statistiques
  const maleCount = members.filter(m => m.sex === 'M').length;
  const femaleCount = members.filter(m => m.sex === 'F').length;
  const averageAge = calculateAverageAge(members);

  return (
    <Container maxW="container.xl" py={8}>
      <MotionVStack
        spacing={6}
        align="stretch"
        variants={staggerChildren}
        initial="hidden"
        animate="visible"
      >
        {/* ==================== HEADER ==================== */}
        <MotionBox
          variants={slideUp}
          background={getFamilyGradient(user?.familyID || 1)}
          p={8}
          borderRadius="var(--radius-2xl)"
          color="white"
          position="relative"
          overflow="hidden"
          boxShadow="var(--shadow-xl)"
        >
          <Box position="relative" zIndex={1}>
            <Heading
              size="xl"
              mb={2}
              fontFamily="var(--font-secondary)"
              fontWeight="var(--font-bold)"
            >
              {t('dashboard.welcome', { name: user?.personName?.split(' ')[0] || user?.userName || 'Utilisateur' })}
            </Heading>
            <Text fontSize="lg" opacity={0.95} fontWeight="var(--font-medium)">
              {familyInfo?.familyName || t('dashboard.yourFamily')}
            </Text>
          </Box>

          {/* Bouton Déconnexion */}
          <Button
            position="absolute"
            top={4}
            right={4}
            size="sm"
            onClick={handleLogout}
            bg="whiteAlpha.300"
            color="white"
            backdropFilter="blur(10px)"
            borderRadius="var(--radius-lg)"
            _hover={{
              bg: 'whiteAlpha.400',
              transform: 'scale(1.05)'
            }}
          >
            {t('common.logout')}
          </Button>
        </MotionBox>

        {/* ==================== CODE D'INVITATION (ADMIN) ==================== */}
        {familyInfo?.canRegenerateCode && familyInfo.inviteCode && (
          <MotionBox variants={slideUp}>
            <Card
              variant="elevated"
              padding="lg"
              hover
              borderTopColor={getFamilyGradient(user?.familyID || 1)}
              animate
            >
              <HStack mb={3}>
                <Icon as={FaKey} color={getFamilySolidColor(user?.familyID || 1)} boxSize={5} />
                <Heading size="sm" color="var(--text-primary)" fontFamily="var(--font-secondary)">
                  🔐 {t('dashboard.inviteCode')}
                </Heading>
              </HStack>
              <Text fontSize="sm" color="var(--text-secondary)" mb={3}>
                {t('dashboard.inviteCodeDescription')}
              </Text>
              <HStack spacing={3}>
                <Code
                  flex={1}
                  p={3}
                  fontSize="lg"
                  fontWeight="bold"
                  bg="var(--bg-elevated)"
                  color={getFamilySolidColor(user?.familyID || 1)}
                  borderRadius="var(--radius-lg)"
                  textAlign="center"
                >
                  {familyInfo.inviteCode}
                </Code>
                <Button
                  size="sm"
                  onClick={copyToClipboard}
                  leftIcon={<FaCopy />}
                  bg={getFamilyGradient(user?.familyID || 1)}
                  color="white"
                  borderRadius="var(--radius-xl)"
                  _hover={{
                    transform: 'scale(1.05)',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                >
                  {t('common.copy')}
                </Button>
                <Button
                  size="sm"
                  onClick={regenerateCode}
                  isLoading={loadingRegen}
                  variant="outline"
                  borderColor={getFamilySolidColor(user?.familyID || 1)}
                  color={getFamilySolidColor(user?.familyID || 1)}
                  borderRadius="var(--radius-xl)"
                  _hover={{
                    transform: 'scale(1.05)',
                    bg: 'var(--family-primary-light)'
                  }}
                >
                  🔄
                </Button>
              </HStack>
            </Card>
          </MotionBox>
        )}

        {/* ==================== GRILLE 3 COLONNES ==================== */}
        <Grid templateColumns={{ base: '1fr', lg: 'repeat(3, 1fr)' }} gap={6}>
          
          {/* ========== COLONNE 1: NAVIGATION ========== */}
          <GridItem>
            <Card
              variant="elevated"
              padding="lg"
              hover
              animate
              borderTopColor={getFamilyGradient(user?.familyID || 1)}
            >
              <Heading
                size="sm"
                color="var(--text-primary)"
                mb={5}
                fontFamily="var(--font-secondary)"
              >
                ⚡ {t('dashboard.mainActions')}
              </Heading>
              <VStack spacing={3} align="stretch">
                {/* Arbre Dynamique */}
                <Link to="/family-tree" style={{ textDecoration: 'none' }}>
                  <MotionBox
                    variants={scaleIn}
                    whileHover={{
                      y: -4,
                      boxShadow: 'var(--shadow-xl)',
                      transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
                    }}
                    whileTap={{ scale: 0.98 }}
                    background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    color="white"
                    p={5}
                    borderRadius="var(--radius-xl)"
                    cursor="pointer"
                    boxShadow="var(--shadow-md)"
                  >
                    <Icon as={FaSitemap} boxSize={6} mb={2} />
                    <Text fontWeight="bold" fontSize="md" mb={1}>
                      🚀 {t('dashboard.familyTree')}
                    </Text>
                    <Text fontSize="xs" opacity={0.9}>
                      {t('dashboard.exploreFamily')}
                    </Text>
                  </MotionBox>
                </Link>

                {/* Membres */}
                <Link to="/persons" style={{ textDecoration: 'none' }}>
                  <MotionBox
                    variants={scaleIn}
                    whileHover={{
                      y: -4,
                      boxShadow: 'var(--shadow-xl)',
                      transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
                    }}
                    whileTap={{ scale: 0.98 }}
                    background={getFamilyGradient(user?.familyID || 1)}
                    color="white"
                    p={5}
                    borderRadius="var(--radius-xl)"
                    cursor="pointer"
                    boxShadow="var(--shadow-md)"
                  >
                    <Icon as={FaUsers} boxSize={6} mb={2} />
                    <Text fontWeight="bold" fontSize="md" mb={1}>
                      {t('dashboard.members')}
                    </Text>
                    <Text fontSize="xs" opacity={0.9}>
                      {t('dashboard.manageMembers')}
                    </Text>
                  </MotionBox>
                </Link>

                {/* Événements */}
                <Link to="/events" style={{ textDecoration: 'none' }}>
                  <MotionBox
                    variants={scaleIn}
                    whileHover={{
                      y: -4,
                      boxShadow: 'var(--shadow-xl)',
                      transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
                    }}
                    whileTap={{ scale: 0.98 }}
                    bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    color="white"
                    p={5}
                    borderRadius="var(--radius-xl)"
                    cursor="pointer"
                    boxShadow="var(--shadow-md)"
                  >
                    <Icon as={FaCalendar} boxSize={6} mb={2} />
                    <Text fontWeight="bold" fontSize="md" mb={1}>
                      {t('dashboard.events')}
                    </Text>
                    <Text fontSize="xs" opacity={0.9}>
                      {t('dashboard.upcomingEvents')}
                    </Text>
                  </MotionBox>
                </Link>

                {/* Mariages */}
                <Link to="/weddings" style={{ textDecoration: 'none' }}>
                  <MotionBox
                    variants={scaleIn}
                    whileHover={{
                      y: -4,
                      boxShadow: 'var(--shadow-xl)',
                      transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
                    }}
                    whileTap={{ scale: 0.98 }}
                    bg="linear-gradient(135deg, #f857a6 0%, #ff5858 100%)"
                    color="white"
                    p={5}
                    borderRadius="var(--radius-xl)"
                    cursor="pointer"
                    boxShadow="var(--shadow-md)"
                  >
                    <Icon as={FaHeart} boxSize={6} mb={2} />
                    <Text fontWeight="bold" fontSize="md" mb={1}>
                      💍 {t('dashboard.marriages')}
                    </Text>
                    <Text fontSize="xs" opacity={0.9}>
                      {t('dashboard.familyUnions')}
                    </Text>
                  </MotionBox>
                </Link>

                {/* Sondages */}
                <Link to="/polls" style={{ textDecoration: 'none' }}>
                  <MotionBox
                    variants={scaleIn}
                    whileHover={{
                      y: -4,
                      boxShadow: 'var(--shadow-xl)',
                      transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
                    }}
                    whileTap={{ scale: 0.98 }}
                    bg="linear-gradient(135deg, #A3B18A 0%, #8B9A7A 100%)"
                    color="white"
                    p={5}
                    borderRadius="var(--radius-xl)"
                    cursor="pointer"
                    boxShadow="var(--shadow-md)"
                  >
                    <Icon as={FaPollH} boxSize={6} mb={2} />
                    <Text fontWeight="bold" fontSize="md" mb={1}>
                      🗳️ {t('dashboard.polls')}
                    </Text>
                    <Text fontSize="xs" opacity={0.9}>
                      {t('dashboard.familyPolls')}
                    </Text>
                  </MotionBox>
                </Link>
              </VStack>
            </Card>
          </GridItem>

          {/* ========== COLONNE 2: STATISTIQUES FUSIONNÉES ========== */}
          <GridItem>
            <Card
              variant="elevated"
              padding="lg"
              hover
              borderTopColor={getFamilyGradient(user?.familyID || 1)}
              animate
            >
              <Heading
                size="sm"
                color="var(--text-primary)"
                mb={5}
                fontFamily="var(--font-secondary)"
              >
                📊 {t('dashboard.statistics')}
              </Heading>

              {loadingStats ? (
                <Text fontSize="sm" color="var(--text-secondary)" textAlign="center" py={8}>
                  {t('dashboard.loadingStats')}
                </Text>
              ) : stats ? (
                <VStack spacing={6} align="stretch">
                  {/* 🎨 Compteurs Glassmorphism - Grid 2x2 responsive */}
                  <Grid templateColumns={{ base: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)' }} gap={4}>
                    {/* Membres */}
                    <Box
                      bg="rgba(139, 92, 246, 0.1)"
                      backdropFilter="blur(10px)"
                      border="1px solid"
                      borderColor="rgba(139, 92, 246, 0.2)"
                      borderRadius="md"
                      p={4}
                      transition="all 0.2s"
                      _hover={{ 
                        transform: 'translateY(-2px)', 
                        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)' 
                      }}
                    >
                      <HStack spacing={3}>
                        <Icon as={FaUsers} color="primary.500" boxSize={6} />
                        <VStack align="start" spacing={0} flex={1}>
                          <Text fontSize="xs" color="gray.600" fontWeight="medium">
                            {t('dashboard.member', { count: stats.membersCount })}
                          </Text>
                          <Text fontSize="2xl" fontWeight="bold" color="primary.700">
                            {stats.membersCount}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>

                    {/* Générations */}
                    <Box
                      bg="rgba(99, 102, 241, 0.1)"
                      backdropFilter="blur(10px)"
                      border="1px solid"
                      borderColor="rgba(99, 102, 241, 0.2)"
                      borderRadius="md"
                      p={4}
                      transition="all 0.2s"
                      _hover={{ 
                        transform: 'translateY(-2px)', 
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)' 
                      }}
                    >
                      <HStack spacing={3}>
                        <Icon as={FaSitemap} color="secondary.500" boxSize={6} />
                        <VStack align="start" spacing={0} flex={1}>
                          <Text fontSize="xs" color="gray.600" fontWeight="medium">
                            {t('dashboard.generation', { count: stats.generationsCount })}
                          </Text>
                          <Text fontSize="2xl" fontWeight="bold" color="secondary.700">
                            {stats.generationsCount}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>

                    {/* Mariages */}
                    <Box
                      bg="rgba(249, 168, 212, 0.15)"
                      backdropFilter="blur(10px)"
                      border="1px solid"
                      borderColor="rgba(249, 168, 212, 0.3)"
                      borderRadius="md"
                      p={4}
                      transition="all 0.2s"
                      _hover={{ 
                        transform: 'translateY(-2px)', 
                        boxShadow: '0 4px 12px rgba(249, 168, 212, 0.2)' 
                      }}
                    >
                      <HStack spacing={3}>
                        <Icon as={FaHeart} color="pink.500" boxSize={6} />
                        <VStack align="start" spacing={0} flex={1}>
                          <Text fontSize="xs" color="gray.600" fontWeight="medium">
                            Mariages
                          </Text>
                          <Text fontSize="2xl" fontWeight="bold" color="pink.600">
                            {stats.marriagesCount}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>

                    {/* Événements */}
                    <Box
                      bg="rgba(134, 239, 172, 0.15)"
                      backdropFilter="blur(10px)"
                      border="1px solid"
                      borderColor="rgba(134, 239, 172, 0.3)"
                      borderRadius="md"
                      p={4}
                      transition="all 0.2s"
                      _hover={{ 
                        transform: 'translateY(-2px)', 
                        boxShadow: '0 4px 12px rgba(134, 239, 172, 0.2)' 
                      }}
                    >
                      <HStack spacing={3}>
                        <Icon as={FaCalendar} color="green.500" boxSize={6} />
                        <VStack align="start" spacing={0} flex={1}>
                          <Text fontSize="xs" color="gray.600" fontWeight="medium">
                            {t('dashboard.events')}
                          </Text>
                          <Text fontSize="2xl" fontWeight="bold" color="green.600">
                            {stats.eventsCount}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  </Grid>

                  <Divider borderColor="var(--border-subtle)" />

                  {/* 👥 Répartition par sexe - Cards modernes */}
                  <VStack spacing={3}>
                    <Text fontSize="sm" fontWeight="semibold" color="var(--text-primary)">
                      👥 Répartition par sexe
                    </Text>
                    <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)' }} gap={3} width="100%">
                      {/* Hommes */}
                      <Box
                        bg="rgba(147, 197, 253, 0.1)"
                        backdropFilter="blur(10px)"
                        border="1px solid"
                        borderColor="rgba(147, 197, 253, 0.3)"
                        borderRadius="md"
                        p={4}
                      >
                        <HStack spacing={3}>
                          <Icon as={FaMale} color="blue.500" boxSize={6} />
                          <VStack align="start" spacing={0} flex={1}>
                            <Text fontSize="xs" color="gray.600" fontWeight="medium">
                              {maleCount > 1 ? 'Hommes' : 'Homme'}
                            </Text>
                            <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                              {maleCount}
                            </Text>
                          </VStack>
                        </HStack>
                      </Box>

                      {/* Femmes */}
                      <Box
                        bg="rgba(249, 168, 212, 0.1)"
                        backdropFilter="blur(10px)"
                        border="1px solid"
                        borderColor="rgba(249, 168, 212, 0.3)"
                        borderRadius="md"
                        p={4}
                      >
                        <HStack spacing={3}>
                          <Icon as={FaFemale} color="pink.500" boxSize={6} />
                          <VStack align="start" spacing={0} flex={1}>
                            <Text fontSize="xs" color="gray.600" fontWeight="medium">
                              {femaleCount > 1 ? 'Femmes' : 'Femme'}
                            </Text>
                            <Text fontSize="2xl" fontWeight="bold" color="pink.600">
                              {femaleCount}
                            </Text>
                          </VStack>
                        </HStack>
                      </Box>
                    </Grid>
                  </VStack>

                  {/* 📊 Âge moyen - Card moderne */}
                  {averageAge > 0 && (
                    <>
                      <Divider borderColor="var(--border-subtle)" />
                      <Box
                        bg="rgba(139, 92, 246, 0.08)"
                        backdropFilter="blur(10px)"
                        border="1px solid"
                        borderColor="rgba(139, 92, 246, 0.15)"
                        borderRadius="md"
                        p={4}
                      >
                        <HStack spacing={3}>
                          <Icon as={FaPollH} color="primary.500" boxSize={6} />
                          <VStack align="start" spacing={0} flex={1}>
                            <Text fontSize="xs" color="gray.600" fontWeight="medium">
                              📊 Âge moyen
                            </Text>
                            <Text fontSize="2xl" fontWeight="bold" color="primary.700">
                              {averageAge} ans
                            </Text>
                          </VStack>
                        </HStack>
                      </Box>
                    </>
                  )}
                </VStack>
              ) : (
                <Text fontSize="sm" color="var(--text-secondary)" textAlign="center" py={8}>
                  {t('dashboard.errorLoadingStats')}
                </Text>
              )}
            </Card>
          </GridItem>

          {/* ========== COLONNE 3: ACTUALITÉS FUSIONNÉES ========== */}
          <GridItem>
            <Card
              variant="elevated"
              padding="lg"
              hover
              borderTopColor="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              animate
            >
              <Heading
                size="sm"
                color="var(--text-primary)"
                mb={5}
                fontFamily="var(--font-secondary)"
              >
                📰 Actualités et Événements
              </Heading>

              <VStack spacing={6} align="stretch">
                {/* SECTION 1: Prochains événements (Anniversaires) */}
                <Box>
                  <HStack mb={3} justify="space-between">
                    <Text fontSize="sm" fontWeight="semibold" color="var(--text-primary)">
                      🎉 Prochains événements (90 jours)
                    </Text>
                  </HStack>

                  {loadingEvents ? (
                    <Text fontSize="sm" color="var(--text-secondary)" textAlign="center" py={4}>
                      {t('common.loading')}
                    </Text>
                  ) : upcomingEvents.length === 0 ? (
                    <Text fontSize="sm" color="var(--text-secondary)" textAlign="center" py={4}>
                      {t('dashboard.noEvents')}
                    </Text>
                  ) : (
                    <VStack spacing={3} align="stretch">
                      {upcomingEvents.slice(0, 3).map((event) => {
                        const emoji = getEventEmoji(event.eventType);
                        const gradient = getEventGradient(event.eventType);

                        return (
                          <MotionBox
                            key={event.eventID}
                            variants={staggerItem}
                            whileHover={{
                              scale: 1.02,
                              boxShadow: 'var(--shadow-lg)',
                              transition: { duration: 0.2 }
                            }}
                            p={3}
                            borderRadius="lg"
                            background={gradient}
                            cursor="pointer"
                            onClick={() => navigate('/events')}
                          >
                            <HStack justify="space-between" align="start">
                              <HStack spacing={2} flex={1}>
                                <Box
                                  fontSize="xl"
                                  bg="whiteAlpha.200"
                                  backdropFilter="blur(10px)"
                                  p={2}
                                  borderRadius="md"
                                >
                                  {emoji}
                                </Box>
                                <VStack align="start" spacing={0} flex={1}>
                                  <Text fontWeight="bold" fontSize="sm" color="white">
                                    {event.title}
                                  </Text>
                                  {event.description && (
                                    <Text fontSize="xs" color="whiteAlpha.900" noOfLines={1}>
                                      {event.description}
                                    </Text>
                                  )}
                                </VStack>
                              </HStack>
                              <Badge
                                variant="default"
                                size="sm"
                                bg="whiteAlpha.300"
                                color="white"
                                backdropFilter="blur(10px)"
                              >
                                {event.dateLabel}
                              </Badge>
                            </HStack>
                          </MotionBox>
                        );
                      })}
                    </VStack>
                  )}

                  <Button
                    mt={3}
                    width="full"
                    size="sm"
                    background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    color="white"
                    fontWeight="var(--font-semibold)"
                    borderRadius="var(--radius-lg)"
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'var(--shadow-lg)'
                    }}
                    onClick={() => navigate('/events')}
                  >
                    {t('dashboard.viewAllEvents')}
                  </Button>
                </Box>

                {/* SÉPARATEUR VISUEL */}
                <Divider borderColor="var(--border-subtle)" borderWidth="2px" />

                {/* SECTION 2: Mariages de la famille */}
                <Box>
                  <HStack mb={3} justify="space-between">
                    <Text fontSize="sm" fontWeight="semibold" color="var(--text-primary)">
                      💍 {t('dashboard.familyMarriages')}
                    </Text>
                  </HStack>

                  {loadingMarriages ? (
                    <Text fontSize="sm" color="var(--text-secondary)" textAlign="center" py={4}>
                      {t('common.loading')}
                    </Text>
                  ) : marriages.length === 0 ? (
                    <Text fontSize="sm" color="var(--text-secondary)" textAlign="center" py={4}>
                      {t('dashboard.noMarriages')}
                    </Text>
                  ) : (
                    <VStack spacing={3} align="stretch">
                      {marriages.slice(0, 3).map((marriage) => {
                        const config = getStatusConfig(marriage.status);

                        return (
                          <MotionBox
                            key={marriage.weddingID}
                            variants={staggerItem}
                            whileHover={{
                              scale: 1.02,
                              boxShadow: 'var(--shadow-lg)',
                              transition: { duration: 0.2 }
                            }}
                            p={3}
                            borderRadius="lg"
                            background={config.gradient}
                            cursor="pointer"
                          >
                            <VStack align="stretch" spacing={2}>
                              <HStack justify="space-between">
                                <HStack spacing={2}>
                                  <Icon as={FaHeart} color="whiteAlpha.900" boxSize={3} />
                                  <Text fontWeight="bold" fontSize="sm" color="white" noOfLines={1}>
                                    {marriage.manName} & {marriage.womanName}
                                  </Text>
                                </HStack>
                                <Badge
                                  variant="default"
                                  size="sm"
                                  bg="whiteAlpha.300"
                                  color="white"
                                  backdropFilter="blur(10px)"
                                >
                                  {config.emoji} {config.label}
                                </Badge>
                              </HStack>
                              <HStack spacing={2} fontSize="xs" color="whiteAlpha.900" flexWrap="wrap">
                                <HStack spacing={1}>
                                  <Text>📅</Text>
                                  <Text>{formatDate(marriage.weddingDate)}</Text>
                                </HStack>
                                <Text>•</Text>
                                <HStack spacing={1}>
                                  <Text>🏛️</Text>
                                  <Text noOfLines={1}>{marriage.patrilinealFamilyName}</Text>
                                </HStack>
                              </HStack>
                              {marriage.unionCount > 0 && (
                                <HStack
                                  spacing={2}
                                  p={2}
                                  bg="whiteAlpha.200"
                                  borderRadius="md"
                                  fontSize="xs"
                                  backdropFilter="blur(10px)"
                                >
                                  <Text fontWeight="semibold" color="white">
                                    {marriage.unionCount} union{marriage.unionCount > 1 ? 's' : ''}
                                  </Text>
                                  <Text color="whiteAlpha.800">•</Text>
                                  <Text color="whiteAlpha.900" noOfLines={1}>
                                    {marriage.unionTypes}
                                  </Text>
                                </HStack>
                              )}
                            </VStack>
                          </MotionBox>
                        );
                      })}
                    </VStack>
                  )}

                  {marriages.length > 3 && (
                    <Button
                      mt={3}
                      width="full"
                      size="sm"
                      background="linear-gradient(135deg, #f857a6 0%, #ff5858 100%)"
                      color="white"
                      fontWeight="var(--font-semibold)"
                      borderRadius="var(--radius-lg)"
                      _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow: 'var(--shadow-lg)'
                      }}
                    >
                      {t('dashboard.viewAllMarriages')} ({marriages.length})
                    </Button>
                  )}
                </Box>
              </VStack>
            </Card>
          </GridItem>
        </Grid>

        {/* Heritage Box - En bas */}
        <MotionBox
          variants={scaleIn}
          whileHover={{ scale: 1.02 }}
          background="linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
          borderRadius="var(--radius-2xl)"
          p={8}
          textAlign="center"
          boxShadow="var(--shadow-md)"
          cursor="default"
        >
          <Icon as={FaHeart} boxSize={10} color="orange.600" mb={3} />
          <Heading
            size="sm"
            color="gray.800"
            mb={2}
            fontFamily="var(--font-secondary)"
            fontWeight="var(--font-bold)"
          >
            {t('dashboard.yourFamilyHeritage')}
          </Heading>
          <Text fontSize="var(--text-xs)" color="gray.700" lineHeight="tall">
            {t('dashboard.heritageDescription')}
          </Text>
        </MotionBox>
      </MotionVStack>

      {/* Debug Component - Temporary */}
      <LanguageDebug />
    </Container>
  );
};

export default DashboardV2;
