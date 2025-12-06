import { Box, Container, Heading, Text, VStack, Button, Grid, Code, HStack, Icon, useToast, Flex, Circle } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaCopy, FaKey, FaUsers, FaHeart, FaCalendar, FaMale, FaFemale, FaPlus, FaImage } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import BottomNavigation from '../components/BottomNavigation';

// ==================== MOTION COMPONENTS ====================
const MotionBox = motion(Box);

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
  status: string;
  weddingDate: string;
}

interface FamilyStats {
  membersCount: number;
  generationsCount: number;
  photosCount: number;
  eventsCount: number;
  marriagesCount: number;
  maleCount?: number;
  femaleCount?: number;
}

// ==================== SOFT UI STAT CARD ====================
interface StatCardProps {
  icon: any;
  iconColor: string;
  iconBgColor: string;
  label: string;
  value: string | number;
  onClick?: () => void;
}

const StatCard = ({ icon, iconColor, iconBgColor, label, value, onClick }: StatCardProps) => (
  <MotionBox
    bg="white"
    borderRadius="16px"
    p={6}
    shadow="sm"
    cursor={onClick ? 'pointer' : 'default'}
    onClick={onClick}
    transition="all 0.2s"
    _hover={onClick ? {
      shadow: 'md',
      transform: 'translateY(-2px)'
    } : {}}
    whileHover={onClick ? { scale: 1.02 } : {}}
  >
    <HStack spacing={4}>
      {/* Icône dans cercle coloré (bg-opacity-10) */}
      <Circle
        size="48px"
        bg={iconBgColor}
      >
        <Icon as={icon} color={iconColor} boxSize={5} />
      </Circle>
      
      <VStack align="start" spacing={0}>
        {/* Chiffre en gros et noir */}
        <Text
          fontSize="2xl"
          fontWeight="bold"
          color="gray.900"
          lineHeight="1.2"
        >
          {value}
        </Text>
        {/* Label en gris */}
        <Text
          fontSize="sm"
          color="gray.500"
          fontWeight="500"
        >
          {label}
        </Text>
      </VStack>
    </HStack>
  </MotionBox>
);

// ==================== EMPTY STATE COMPONENT ====================
interface EmptyStateProps {
  icon: any;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = ({ icon, title, description, actionLabel, onAction }: EmptyStateProps) => (
  <VStack spacing={4} py={12}>
    {/* SVG Simple (icône agrandie en cercle) */}
    <Circle size="80px" bg="gray.50">
      <Icon as={icon} boxSize={8} color="gray.300" />
    </Circle>
    
    <VStack spacing={2}>
      <Text fontSize="lg" fontWeight="600" color="gray.700">
        {title}
      </Text>
      <Text fontSize="sm" color="gray.500" textAlign="center" maxW="400px">
        {description}
      </Text>
    </VStack>
    
    {actionLabel && onAction && (
      <Button
        leftIcon={<FaPlus />}
        colorScheme="purple"
        size="md"
        onClick={onAction}
        borderRadius="xl"
        mt={2}
      >
        {actionLabel}
      </Button>
    )}
  </VStack>
);

// ==================== COMPOSANT PRINCIPAL ====================
const DashboardV3 = () => {
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
  const [familyStats, setFamilyStats] = useState<FamilyStats | null>(null);

  // Charger les données
  useEffect(() => {
    fetchFamilyInfo();
    fetchUpcomingEvents();
    fetchMarriages();
    fetchFamilyStats();
  }, []);

  const fetchFamilyInfo = async () => {
    try {
      const response = await api.get('/auth/family-info');
      setFamilyInfo(response.data);
    } catch (error) {
      console.error('Erreur chargement info famille:', error);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      setLoadingEvents(true);
      const response = await api.get('/events/upcoming?days=90');
      setUpcomingEvents(response.data);
    } catch (error) {
      console.error('Erreur chargement événements:', error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchMarriages = async () => {
    if (!user?.familyID) return;
    try {
      const response = await api.get(`/marriages/family/${user.familyID}`);
      setMarriages(response.data);
    } catch (error) {
      console.error('Erreur chargement unions:', error);
    }
  };

  const fetchFamilyStats = async () => {
    try {
      const response = await api.get('/auth/family-stats');
      setFamilyStats(response.data);
    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
    }
  };

  const copyToClipboard = () => {
    if (familyInfo?.inviteCode) {
      navigator.clipboard.writeText(familyInfo.inviteCode);
      toast({
        title: t('dashboard.codeCopied'),
        status: 'success',
        duration: 2000,
      });
    }
  };

  const regenerateCode = async () => {
    setLoadingRegen(true);
    try {
      const response = await api.post('/auth/regenerate-invite-code');
      setFamilyInfo(prev => prev ? { ...prev, inviteCode: response.data.inviteCode } : null);
      toast({
        title: t('dashboard.codeRegenerated'),
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('dashboard.errorRegeneratingCode'),
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

  return (
    <Box minH="100vh" bg="#F9FAFB" pb={{ base: "90px", md: 0 }}> {/* Padding bottom pour bottom nav */}
      <Container maxW="6xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* ==================== HEADER ACCUEIL ==================== */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
              <VStack align="start" spacing={1}>
                <Heading
                  size="xl"
                  color="gray.900"
                  fontWeight="700"
                >
                  {t('dashboard.welcome', { name: user?.personName?.split(' ')[0] || user?.userName || 'Utilisateur' })}
                </Heading>
                <Text fontSize="lg" color="gray.600" fontWeight="500">
                  {familyInfo?.familyName || t('dashboard.yourFamily')}
                </Text>
              </VStack>

              {/* Bouton Déconnexion (desktop) */}
              <Button
                display={{ base: 'none', md: 'flex' }}
                size="md"
                onClick={handleLogout}
                variant="outline"
                borderColor="gray.300"
                color="gray.700"
                borderRadius="xl"
                _hover={{
                  bg: 'gray.50',
                  borderColor: 'gray.400'
                }}
              >
                {t('common.logout')}
              </Button>
            </Flex>
          </MotionBox>

          {/* ==================== CODE D'INVITATION (ADMIN) ==================== */}
          {familyInfo?.canRegenerateCode && familyInfo.inviteCode && (
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              bg="white"
              borderRadius="16px"
              p={6}
              shadow="sm"
            >
              <HStack mb={3}>
                <Circle size="40px" bg="purple.50">
                  <Icon as={FaKey} color="purple.500" boxSize={5} />
                </Circle>
                <Heading size="md" color="gray.900" fontWeight="600">
                  🔐 {t('dashboard.inviteCode')}
                </Heading>
              </HStack>
              <Text fontSize="sm" color="gray.600" mb={4}>
                {t('dashboard.inviteCodeDescription')}
              </Text>
              <HStack spacing={3}>
                <Code
                  flex={1}
                  p={3}
                  fontSize="lg"
                  fontWeight="bold"
                  bg="purple.50"
                  color="purple.600"
                  borderRadius="lg"
                  textAlign="center"
                  border="1px dashed"
                  borderColor="purple.200"
                >
                  {familyInfo.inviteCode}
                </Code>
                <Button
                  size="md"
                  onClick={copyToClipboard}
                  leftIcon={<FaCopy />}
                  colorScheme="purple"
                  borderRadius="xl"
                >
                  {t('common.copy')}
                </Button>
                <Button
                  size="md"
                  onClick={regenerateCode}
                  isLoading={loadingRegen}
                  variant="outline"
                  borderColor="purple.300"
                  color="purple.600"
                  borderRadius="xl"
                  _hover={{
                    bg: 'purple.50'
                  }}
                >
                  Régénérer
                </Button>
              </HStack>
            </MotionBox>
          )}

          {/* ==================== STATISTIQUES (SOFT UI) ==================== */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Grid
              templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
              gap={4}
            >
              <StatCard
                icon={FaUsers}
                iconColor="blue.500"
                iconBgColor="blue.50"
                label={t('dashboard.members')}
                value={familyStats?.membersCount || 0}
                onClick={() => navigate('/members')}
              />
              <StatCard
                icon={FaHeart}
                iconColor="pink.500"
                iconBgColor="pink.50"
                label={t('dashboard.unions')}
                value={familyStats?.marriagesCount || 0}
                onClick={() => navigate('/weddings')}
              />
              <StatCard
                icon={FaCalendar}
                iconColor="purple.500"
                iconBgColor="purple.50"
                label={t('dashboard.events')}
                value={familyStats?.eventsCount || 0}
                onClick={() => navigate('/events')}
              />
              <StatCard
                icon={FaImage}
                iconColor="green.500"
                iconBgColor="green.50"
                label={t('dashboard.photos')}
                value={familyStats?.photosCount || 0}
                onClick={() => navigate('/albums')}
              />
            </Grid>
          </MotionBox>

          {/* ==================== GENRE STATISTIQUES ==================== */}
          {familyStats && (familyStats.maleCount || familyStats.femaleCount) && (
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)' }} gap={4}>
                <StatCard
                  icon={FaMale}
                  iconColor="blue.600"
                  iconBgColor="blue.50"
                  label={t('dashboard.men')}
                  value={familyStats.maleCount || 0}
                />
                <StatCard
                  icon={FaFemale}
                  iconColor="pink.600"
                  iconBgColor="pink.50"
                  label={t('dashboard.women')}
                  value={familyStats.femaleCount || 0}
                />
              </Grid>
            </MotionBox>
          )}

          {/* ==================== ÉVÉNEMENTS À VENIR ==================== */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            bg="white"
            borderRadius="16px"
            p={6}
            shadow="sm"
          >
            <HStack justify="space-between" mb={4}>
              <HStack>
                <Circle size="40px" bg="orange.50">
                  <Icon as={FaCalendar} color="orange.500" boxSize={5} />
                </Circle>
                <Heading size="md" color="gray.900" fontWeight="600">
                  {t('dashboard.upcomingEvents')}
                </Heading>
              </HStack>
              <Button
                size="sm"
                variant="ghost"
                colorScheme="purple"
                onClick={() => navigate('/events')}
              >
                {t('common.seeAll')}
              </Button>
            </HStack>

            {loadingEvents ? (
              <Text color="gray.500" textAlign="center" py={4}>
                Chargement...
              </Text>
            ) : upcomingEvents.length === 0 ? (
              <EmptyState
                icon={FaCalendar}
                title={t('dashboard.noUpcomingEvents')}
                description={t('dashboard.noUpcomingEventsDescription')}
                actionLabel={t('dashboard.planEvent')}
                onAction={() => navigate('/events/new')}
              />
            ) : (
              <VStack spacing={3} align="stretch">
                {upcomingEvents.slice(0, 3).map((event) => (
                  <Box
                    key={event.eventID}
                    p={4}
                    bg="gray.50"
                    borderRadius="lg"
                    cursor="pointer"
                    onClick={() => navigate(`/events/${event.eventID}`)}
                    _hover={{ bg: 'gray.100' }}
                    transition="all 0.2s"
                  >
                    <HStack justify="space-between">
                      <HStack spacing={3}>
                        <Text fontSize="2xl">{getEventEmoji(event.eventType)}</Text>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="600" color="gray.900">
                            {event.title}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {event.dateLabel}
                          </Text>
                        </VStack>
                      </HStack>
                      <Text fontSize="sm" color="purple.500" fontWeight="600">
                        {event.daysUntil === 0
                          ? "Aujourd'hui"
                          : `Dans ${event.daysUntil}j`}
                      </Text>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            )}
          </MotionBox>

          {/* ==================== DERNIÈRES UNIONS ==================== */}
          {marriages.length > 0 && (
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              bg="white"
              borderRadius="16px"
              p={6}
              shadow="sm"
            >
              <HStack justify="space-between" mb={4}>
                <HStack>
                  <Circle size="40px" bg="pink.50">
                    <Icon as={FaHeart} color="pink.500" boxSize={5} />
                  </Circle>
                  <Heading size="md" color="gray.900" fontWeight="600">
                    {t('dashboard.recentUnions')}
                  </Heading>
                </HStack>
                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme="purple"
                  onClick={() => navigate('/weddings')}
                >
                  {t('common.seeAll')}
                </Button>
              </HStack>

              <VStack spacing={3} align="stretch">
                {marriages.slice(0, 3).map((marriage) => (
                  <Box
                    key={marriage.weddingID}
                    p={4}
                    bg="pink.50"
                    borderRadius="lg"
                    cursor="pointer"
                    onClick={() => navigate(`/weddings/${marriage.weddingID}`)}
                    _hover={{ bg: 'pink.100' }}
                    transition="all 0.2s"
                  >
                    <HStack justify="space-between">
                      <HStack spacing={3}>
                        <Text fontSize="xl">💍</Text>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="600" color="gray.900">
                            {marriage.manName} & {marriage.womanName}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {new Date(marriage.weddingDate).toLocaleDateString('fr-FR')}
                          </Text>
                        </VStack>
                      </HStack>
                      <Text
                        fontSize="xs"
                        px={3}
                        py={1}
                        bg={marriage.status === 'active' ? 'green.100' : 'gray.100'}
                        color={marriage.status === 'active' ? 'green.700' : 'gray.700'}
                        borderRadius="full"
                        fontWeight="600"
                      >
                        {marriage.status === 'active' ? '💚 Actif' : marriage.status}
                      </Text>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </MotionBox>
          )}
        </VStack>
      </Container>

      {/* ==================== BOTTOM NAVIGATION (MOBILE) ==================== */}
      <BottomNavigation />
    </Box>
  );
};

// Helper functions
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

export default DashboardV3;
