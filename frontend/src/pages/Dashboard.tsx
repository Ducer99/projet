import { Box, Container, Heading, Text, VStack, Button, Grid, GridItem, Code, HStack, Icon, useToast } from '@chakra-ui/react';
import { useNavigate, Link } from 'react-router-dom';
import { FaCopy, FaKey, FaUsers, FaSitemap, FaHeart, FaUserEdit, FaCalendar, FaMale, FaFemale, FaPollH } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import LanguageDebug from '../components/LanguageDebug';
import { motion } from 'framer-motion';
import { Card, Avatar, Badge } from '../components/ui';
import { getFamilyGradient, getFamilySolidColor } from '../utils/colorUtils';
import { slideUp, staggerChildren, staggerItem, scaleIn } from '../utils/animationUtils'; 

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

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const toast = useToast();
  const { t } = useTranslation();
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
      if (!token) {
        console.warn('⚠️ [Dashboard] Pas de token disponible');
        return;
      }
      console.log('🔵 [Dashboard] Loading family info...');
      const response = await api.get('/auth/family-info');
      console.log('✅ [Dashboard] Family info loaded:', response.data);
      setFamilyInfo(response.data);
    } catch (error: any) {
      console.error('❌ [Dashboard] Erreur lors du chargement des infos famille:', error);
      console.error('   Status:', error.response?.status);
      console.error('   Message:', error.response?.data);
      // Ne pas propager l'erreur - laisser l'utilisateur accéder au dashboard même sans infos famille
    }
  };

  const loadUpcomingEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('Pas de token disponible');
        return;
      }
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
      if (!token || !user?.familyID) {
        console.warn('Pas de token ou d\'ID famille disponible');
        return;
      }
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
      if (!token) {
        console.warn('Pas de token disponible');
        return;
      }
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
      if (!token) {
        console.warn('Pas de token disponible');
        return;
      }
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
        title: t('dashboard.codeRegenerated'),
        description: t('dashboard.newCode', { code: response.data.newInviteCode }),
        status: 'success',
        duration: 5000,
      });
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || t('dashboard.regenerateError'),
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

  // Créer des composants animés
  const MotionBox = motion(Box);
  const MotionVStack = motion(VStack);

  return (
    <Container maxW="container.xl" py={8}>
      <MotionVStack 
        spacing={6} 
        align="stretch"
        variants={staggerChildren}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome Header - Design Apple × Notion - STICKY */}
        <MotionBox
          variants={slideUp}
          background={getFamilyGradient(user?.familyID || 1)}
          p={8}
          borderRadius="var(--radius-2xl)"
          color="white"
          position="sticky"
          top={0}
          zIndex={100}
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
            <Text 
              fontSize="var(--text-lg)" 
              opacity={0.95} 
              fontWeight="var(--font-medium)"
            >
              {t('dashboard.subtitle')}
            </Text>
          </Box>
          
          {/* Boutons en haut à droite avec effet glass */}
          <HStack 
            position="absolute" 
            top={4} 
            right={4}
            spacing={2}
          >
            <Button 
              leftIcon={<Icon as={FaUserEdit} />}
              bg="whiteAlpha.200"
              backdropFilter="blur(10px)"
              color="white"
              onClick={() => navigate('/my-profile')}
              size="sm"
              borderRadius="var(--radius-xl)"
              _hover={{ 
                bg: 'whiteAlpha.300',
                transform: 'scale(1.05)',
                transition: 'all 0.2s'
              }}
            >
              {t('navigation.profile')}
            </Button>
            <Button 
              bg="whiteAlpha.200"
              backdropFilter="blur(10px)"
              color="white"
              onClick={handleLogout}
              size="sm"
              borderRadius="var(--radius-xl)"
              border="1px solid"
              borderColor="whiteAlpha.400"
              _hover={{ 
                bg: 'whiteAlpha.300',
                transform: 'scale(1.05)',
                transition: 'all 0.2s'
              }}
            >
              {t('navigation.logout')}
            </Button>
          </HStack>
        </MotionBox>

        {/* Main Grid */}
        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
          {/* Left Column */}
          <GridItem>
            <MotionVStack 
              spacing={6} 
              align="stretch"
              variants={staggerChildren}
            >
              {/* Invite Code - Admin only - REDESIGNED */}
              {familyInfo?.canRegenerateCode && familyInfo.inviteCode && (
                <Card
                  variant="elevated"
                  padding="lg"
                  hover
                  borderTopColor={getFamilyGradient(user?.familyID || 1)}
                  animate
                >
                  <HStack mb={3}>
                    <Icon as={FaKey} color={getFamilySolidColor(user?.familyID || 1)} boxSize={5} />
                    <Heading 
                      size="sm" 
                      color="var(--text-primary)"
                      fontFamily="var(--font-secondary)"
                    >
                      {t('dashboard.inviteCode')} - {t('dashboard.myFamily')} {user?.familyName}
                    </Heading>
                  </HStack>
                  <Text color="var(--text-secondary)" mb={4} fontSize="sm">
                    {t('dashboard.shareCode')}
                  </Text>
                  <HStack spacing={3}>
                    <Code 
                      fontSize="lg" 
                      p={2} 
                      px={4} 
                      borderRadius="var(--radius-lg)" 
                      bg="var(--family-primary-light)"
                      color={getFamilySolidColor(user?.familyID || 1)}
                      fontWeight="bold"
                      fontFamily="var(--font-mono)"
                    >
                      {familyInfo.inviteCode}
                    </Code>
                    <Button
                      size="sm"
                      leftIcon={<Icon as={FaCopy} />}
                      onClick={copyToClipboard}
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
              )}

              {/* Actions principales - REDESIGNED */}
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
                  🏠 {t('dashboard.mainActions')}
                </Heading>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                  {/* Arbre Généalogique Dynamique */}
                  <Link to="/family-tree-dynamic" style={{ textDecoration: 'none' }}>
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
                      <Text fontWeight="bold" fontSize="md" mb={1}>🚀 {t('dashboard.dynamicTree')}</Text>
                      <Text fontSize="xs" opacity={0.9}>{t('dashboard.dynamicTreeDescription')}</Text>
                    </MotionBox>
                  </Link>

                  {/* Liste Membres */}
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
                      <Text fontWeight="bold" fontSize="md" mb={1}>{t('dashboard.members')}</Text>
                      <Text fontSize="xs" opacity={0.9}>{t('dashboard.manageMembers')}</Text>
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
                      <Text fontWeight="bold" fontSize="md" mb={1}>{t('dashboard.events')}</Text>
                      <Text fontSize="xs" opacity={0.9}>{t('dashboard.upcomingEvents')}</Text>
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
                      <Text fontWeight="bold" fontSize="md" mb={1}>💍 {t('dashboard.marriages')}</Text>
                      <Text fontSize="xs" opacity={0.9}>{t('dashboard.familyUnions')}</Text>
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
                      <Text fontWeight="bold" fontSize="md" mb={1}>🗳️ {t('dashboard.polls')}</Text>
                      <Text fontSize="xs" opacity={0.9}>{t('dashboard.familyPolls')}</Text>
                    </MotionBox>
                  </Link>

                  {/* 🆕 NOUVEAU - Tableau de Bord de Gestion */}
                  <Link to="/members-dashboard" style={{ textDecoration: 'none' }}>
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
                      position="relative"
                    >
                      {/* Badge "Nouveau" */}
                      <Box
                        position="absolute"
                        top="-8px"
                        right="-8px"
                        bg="red.500"
                        color="white"
                        fontSize="xs"
                        px={2}
                        py={1}
                        borderRadius="full"
                        fontWeight="bold"
                        boxShadow="md"
                      >
                        NEW
                      </Box>
                      <Icon as={FaUsers} boxSize={6} mb={2} />
                      <Text fontWeight="bold" fontSize="md" mb={1}>📊 {t('members.managementDashboard')}</Text>
                      <Text fontSize="xs" opacity={0.9}>{t('dashboard.advancedMemberManagement')}</Text>
                    </MotionBox>
                  </Link>
                </Grid>
              </Card>

              {/* Aperçu de votre famille - REDESIGNED */}
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
                  📊 {t('dashboard.familyOverview')}
                </Heading>
                {loadingStats ? (
                  <Text fontSize="sm" color="var(--text-secondary)" textAlign="center" py={4}>
                    {t('dashboard.loadingStats')}
                  </Text>
                ) : stats ? (
                  <VStack spacing={6}>
                    {/* Statistiques principales avec nouveau design */}
                    <Grid templateColumns="repeat(4, 1fr)" gap={4} width="100%">
                      <VStack spacing={1}>
                        <Text 
                          fontSize="var(--text-display-lg)" 
                          fontWeight="var(--font-bold)" 
                          color={getFamilySolidColor(user?.familyID || 1)}
                        >
                          {stats.membersCount}
                        </Text>
                        <Text 
                          fontSize="var(--text-xs)" 
                          color="var(--text-secondary)" 
                          textAlign="center"
                        >
                          {t('dashboard.member', { count: stats.membersCount })}
                        </Text>
                      </VStack>
                      <VStack spacing={1}>
                        <Text 
                          fontSize="var(--text-display-lg)" 
                          fontWeight="var(--font-bold)" 
                          color={getFamilySolidColor(user?.familyID || 1)}
                        >
                          {stats.generationsCount}
                        </Text>
                        <Text 
                          fontSize="var(--text-xs)" 
                          color="var(--text-secondary)" 
                          textAlign="center"
                        >
                          {t('dashboard.generation', { count: stats.generationsCount })}
                        </Text>
                      </VStack>
                      <VStack spacing={1}>
                        <Text 
                          fontSize="var(--text-display-lg)" 
                          fontWeight="var(--font-bold)" 
                          color={getFamilySolidColor(user?.familyID || 1)}
                        >
                          {stats.photosCount}
                        </Text>
                        <Text 
                          fontSize="var(--text-xs)" 
                          color="var(--text-secondary)" 
                          textAlign="center"
                        >
                          {t('dashboard.photo', { count: stats.photosCount })}
                        </Text>
                      </VStack>
                      <VStack spacing={1}>
                        <Text 
                          fontSize="var(--text-display-lg)" 
                          fontWeight="var(--font-bold)" 
                          color={getFamilySolidColor(user?.familyID || 1)}
                        >
                          {stats.eventsCount}
                        </Text>
                        <Text 
                          fontSize="var(--text-xs)" 
                          color="var(--text-secondary)" 
                          textAlign="center"
                        >
                          {t('dashboard.event', { count: stats.eventsCount })}
                        </Text>
                      </VStack>
                    </Grid>

                    {/* Répartition Hommes/Femmes - Design amélioré */}
                    <Box width="100%" pt={4} borderTop="1px solid" borderColor="var(--border-light)">
                      <Text 
                        fontSize="var(--text-xs)" 
                        fontWeight="var(--font-semibold)" 
                        color="var(--text-secondary)" 
                        mb={3} 
                        textAlign="center"
                      >
                        👥 {t('dashboard.genderDistribution')}
                      </Text>
                      <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                        <MotionBox
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          <VStack 
                            spacing={1} 
                            p={3} 
                            bg="var(--gender-male-bg)" 
                            borderRadius="var(--radius-xl)"
                            border="2px solid"
                            borderColor="var(--gender-male-border)"
                          >
                            <Text 
                              fontSize="var(--text-h2)" 
                              fontWeight="var(--font-bold)" 
                              color="var(--gender-male-text)"
                            >
                              {members.filter(m => m.sex === 'M').length}
                            </Text>
                            <Text 
                              fontSize="var(--text-xs)" 
                              color="var(--gender-male-text)"
                              fontWeight="var(--font-medium)"
                            >
                              👨 {t('dashboard.men')}
                            </Text>
                          </VStack>
                        </MotionBox>
                        <MotionBox
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          <VStack 
                            spacing={1} 
                            p={3} 
                            bg="var(--gender-female-bg)" 
                            borderRadius="var(--radius-xl)"
                            border="2px solid"
                            borderColor="var(--gender-female-border)"
                          >
                            <Text 
                              fontSize="var(--text-h2)" 
                              fontWeight="var(--font-bold)" 
                              color="var(--gender-female-text)"
                            >
                              {members.filter(m => m.sex === 'F').length}
                            </Text>
                            <Text 
                              fontSize="var(--text-xs)" 
                              color="var(--gender-female-text)"
                              fontWeight="var(--font-medium)"
                            >
                              👩 {t('dashboard.women')}
                            </Text>
                          </VStack>
                        </MotionBox>
                      </Grid>
                    </Box>
                  </VStack>
                ) : (
                  <Text fontSize="sm" color="var(--text-secondary)" textAlign="center" py={4}>
                    {t('dashboard.errorLoadingStats')}
                  </Text>
                )}
              </Card>
            </MotionVStack>
          </GridItem>

          {/* Right Column */}
          <GridItem>
            <MotionVStack 
              spacing={6} 
              align="stretch"
              variants={staggerChildren}
              initial="hidden"
              animate="visible"
            >
              {/* Membres récents - REDESIGNED */}
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
                  👥 {t('members.title')}
                </Heading>
                
                {loadingMembers ? (
                  <Text fontSize="var(--text-sm)" color="var(--text-secondary)" textAlign="center" py={4}>
                    {t('common.loading')}
                  </Text>
                ) : members.length === 0 ? (
                  <Text fontSize="var(--text-sm)" color="var(--text-secondary)" textAlign="center" py={4}>
                    {t('dashboard.noMembers')}
                  </Text>
                ) : (
                  <MotionVStack 
                    spacing={3} 
                    align="stretch"
                    variants={staggerChildren}
                  >
                    {members.slice(0, 5).map((member) => (
                      <MotionBox
                        key={member.personID}
                        variants={staggerItem}
                        whileHover={{ 
                          x: 4, 
                          boxShadow: 'var(--shadow-md)',
                          transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
                        }}
                        whileTap={{ scale: 0.98 }}
                        p={3}
                        borderRadius="var(--radius-lg)"
                        borderLeft="3px solid"
                        borderLeftColor={member.sex === 'M' ? 'var(--gender-male-border)' : 'var(--gender-female-border)'}
                        bg="var(--bg-secondary)"
                        cursor="pointer"
                        onClick={() => navigate(`/person/${member.personID}`)}
                      >
                        <HStack spacing={3} align="start">
                          <Avatar
                            src={member.photoUrl || undefined}
                            name={`${member.firstName} ${member.lastName}`}
                            size="md"
                            gender={member.sex as 'M' | 'F'}
                            status={member.alive ? 'alive' : 'deceased'}
                            showBorder
                          />
                          
                          <VStack align="start" flex={1} spacing={1}>
                            <HStack spacing={2}>
                              <Text 
                                fontWeight="var(--font-semibold)" 
                                fontSize="var(--text-sm)" 
                                color="var(--text-primary)"
                              >
                                {member.firstName} {member.lastName}
                              </Text>
                              {member.sex === 'M' ? (
                                <Icon as={FaMale} color="var(--gender-male-border)" boxSize={3} />
                              ) : (
                                <Icon as={FaFemale} color="var(--gender-female-border)" boxSize={3} />
                              )}
                            </HStack>
                            {member.birthday && (
                              <Text fontSize="var(--text-xs)" color="var(--text-secondary)">
                                📅 {new Date(member.birthday).toLocaleDateString('fr-FR')}
                              </Text>
                            )}
                          </VStack>
                          
                          <VStack align="end" spacing={1}>
                            {!member.alive && (
                              <Badge variant="default" size="sm">
                                {t('members.deceased')}
                              </Badge>
                            )}
                            {member.birthday && member.alive && (
                              <Badge 
                                variant={member.sex === 'M' ? 'gender-male' : 'gender-female'} 
                                size="sm"
                              >
                                {t('dashboard.yearsOld', { count: Math.floor((Date.now() - new Date(member.birthday).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) })}
                              </Badge>
                            )}
                          </VStack>
                        </HStack>
                      </MotionBox>
                    ))}
                  </MotionVStack>
                )}
                
                <Button 
                  mt={4}
                  width="full"
                  size="sm"
                  background={getFamilyGradient(user?.familyID || 1)}
                  color="white"
                  fontWeight="var(--font-semibold)"
                  borderRadius="var(--radius-lg)"
                  _hover={{ 
                    transform: 'translateY(-2px)',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                  onClick={() => navigate('/persons')}
                >
                  {t('dashboard.viewAllMembers')}
                </Button>
              </Card>

              {/* Prochains événements - REDESIGNED */}
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
                  🎉 {t('dashboard.upcomingEvents')} (90 {t('common.days')})
                </Heading>
                
                {loadingEvents ? (
                  <Text fontSize="var(--text-sm)" color="var(--text-secondary)" textAlign="center" py={4}>
                    {t('common.loading')}
                  </Text>
                ) : upcomingEvents.length === 0 ? (
                  <Text fontSize="var(--text-sm)" color="var(--text-secondary)" textAlign="center" py={4}>
                    {t('dashboard.noEvents')}
                  </Text>
                ) : (
                  <MotionVStack 
                    spacing={3} 
                    align="stretch"
                    variants={staggerChildren}
                  >
                    {upcomingEvents.slice(0, 5).map((event) => {
                      const eventGradients: Record<string, string> = {
                        birthday: 'linear-gradient(135deg, #f857a6 0%, #ff5858 100%)',
                        death: 'linear-gradient(135deg, #8e9eab 0%, #eef2f3 100%)',
                        marriage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        party: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                        other: getFamilyGradient(user?.familyID || 1)
                      };
                      
                      const eventEmojis: Record<string, string> = {
                        birthday: '🎂',
                        death: '🕊️',
                        marriage: '💍',
                        party: '🎉',
                        other: '📅'
                      };
                      
                      const gradient = eventGradients[event.eventType] || getFamilyGradient(user?.familyID || 1);
                      const emoji = eventEmojis[event.eventType] || '📅';
                      
                      return (
                        <MotionBox
                          key={event.eventID}
                          variants={staggerItem}
                          whileHover={{ 
                            scale: 1.02,
                            boxShadow: 'var(--shadow-lg)',
                            transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
                          }}
                          whileTap={{ scale: 0.98 }}
                          p={4}
                          borderRadius="var(--radius-xl)"
                          background={gradient}
                          cursor="pointer"
                          onClick={() => navigate('/events')}
                        >
                          <HStack justify="space-between" align="start" spacing={3}>
                            <HStack spacing={3} flex={1}>
                              <Box
                                fontSize="2xl"
                                bg="whiteAlpha.200"
                                backdropFilter="blur(10px)"
                                p={2}
                                borderRadius="var(--radius-lg)"
                              >
                                {emoji}
                              </Box>
                              <VStack align="start" spacing={1} flex={1}>
                                <Text 
                                  fontWeight="var(--font-bold)" 
                                  fontSize="var(--text-sm)" 
                                  color="white"
                                >
                                  {event.title}
                                </Text>
                                {event.description && (
                                  <Text 
                                    fontSize="var(--text-xs)" 
                                    color="whiteAlpha.900" 
                                    noOfLines={1}
                                  >
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
                  </MotionVStack>
                )}
                
                <Button 
                  mt={4}
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
              </Card>

              {/* Mariages de la famille - REDESIGNED */}
              <Card
                variant="elevated"
                padding="lg"
                hover
                borderTopColor="linear-gradient(135deg, #f857a6 0%, #ff5858 100%)"
                animate
              >
                <Heading 
                  size="sm" 
                  color="var(--text-primary)" 
                  mb={5}
                  fontFamily="var(--font-secondary)"
                >
                  💍 {t('dashboard.familyMarriages')}
                </Heading>
                
                {loadingMarriages ? (
                  <Text fontSize="var(--text-sm)" color="var(--text-secondary)" textAlign="center" py={4}>
                    {t('common.loading')}
                  </Text>
                ) : marriages.length === 0 ? (
                  <Text fontSize="var(--text-sm)" color="var(--text-secondary)" textAlign="center" py={4}>
                    {t('dashboard.noMarriages')}
                  </Text>
                ) : (
                  <MotionVStack 
                    spacing={3} 
                    align="stretch"
                    variants={staggerChildren}
                  >
                    {marriages.slice(0, 3).map((marriage) => {
                      const statusConfig: Record<string, { gradient: string; label: string; emoji: string }> = {
                        active: { 
                          gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', 
                          label: t('dashboard.marriageStatus.active'),
                          emoji: '💚'
                        },
                        divorced: { 
                          gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', 
                          label: t('dashboard.marriageStatus.divorced'),
                          emoji: '💔'
                        },
                        widowed: { 
                          gradient: 'linear-gradient(135deg, #8e9eab 0%, #eef2f3 100%)', 
                          label: t('dashboard.marriageStatus.widowed'),
                          emoji: '🕊️'
                        }
                      };
                      
                      const config = statusConfig[marriage.status] || {
                        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        label: marriage.status,
                        emoji: '💍'
                      };
                      
                      return (
                        <MotionBox
                          key={marriage.weddingID}
                          variants={staggerItem}
                          whileHover={{ 
                            scale: 1.02,
                            boxShadow: 'var(--shadow-lg)',
                            transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
                          }}
                          whileTap={{ scale: 0.98 }}
                          p={4}
                          borderRadius="var(--radius-xl)"
                          background={config.gradient}
                          cursor="pointer"
                        >
                          <VStack align="stretch" spacing={3}>
                            {/* Header avec noms et statut */}
                            <HStack justify="space-between" align="start">
                              <HStack spacing={2} flex={1}>
                                <Icon 
                                  as={FaHeart} 
                                  color="whiteAlpha.900" 
                                  boxSize={4} 
                                />
                                <Text 
                                  fontWeight="var(--font-bold)" 
                                  fontSize="var(--text-sm)" 
                                  color="white"
                                  noOfLines={1}
                                >
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
                            
                            {/* Informations détaillées */}
                            <VStack align="start" spacing={2}>
                              <HStack 
                                spacing={2} 
                                fontSize="var(--text-xs)" 
                                color="whiteAlpha.900"
                                flexWrap="wrap"
                              >
                                <HStack spacing={1}>
                                  <Text>📅</Text>
                                  <Text>{new Date(marriage.weddingDate).toLocaleDateString('fr-FR')}</Text>
                                </HStack>
                                <Text>•</Text>
                                <HStack spacing={1}>
                                  <Text>🏛️</Text>
                                  <Text>{marriage.patrilinealFamilyName}</Text>
                                </HStack>
                              </HStack>
                              
                              {marriage.unionCount > 0 && (
                                <HStack 
                                  spacing={2} 
                                  p={2}
                                  bg="whiteAlpha.200"
                                  borderRadius="var(--radius-md)"
                                  fontSize="var(--text-xs)"
                                  backdropFilter="blur(10px)"
                                  width="full"
                                >
                                  <Text fontWeight="var(--font-semibold)" color="white">
                                    {t('dashboard.unionCount', { count: marriage.unionCount })}
                                  </Text>
                                  <Text color="whiteAlpha.800">•</Text>
                                  <Text color="whiteAlpha.900" noOfLines={1}>
                                    {marriage.unionTypes}
                                  </Text>
                                </HStack>
                              )}
                            </VStack>
                          </VStack>
                        </MotionBox>
                      );
                    })}
                  </MotionVStack>
                )}
                
                {marriages.length > 3 && (
                  <Button 
                    mt={4}
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
              </Card>

              {/* Heritage Box - REDESIGNED */}
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
                <Text 
                  fontSize="var(--text-xs)" 
                  color="gray.700" 
                  lineHeight="tall"
                >
                  {t('dashboard.heritageDescription')}
                </Text>
              </MotionBox>
            </MotionVStack>
          </GridItem>
        </Grid>
      </MotionVStack>
      
      {/* 🔍 Debug Component - Temporary */}
      <LanguageDebug />
    </Container>
  );
};

export default Dashboard;
