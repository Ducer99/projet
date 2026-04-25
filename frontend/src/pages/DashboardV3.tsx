import { Box, Container, Heading, Text, VStack, Button, Grid, Code, HStack, Icon, useToast, Flex, Circle } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaCopy, FaKey, FaUsers, FaHeart, FaCalendar, FaMale, FaFemale, FaPlus, FaImage, FaLink } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
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
    borderRadius="2xl"
    p={6}
    shadow="card"
    cursor={onClick ? 'pointer' : 'default'}
    onClick={onClick}
    transition="all 0.25s ease"
    _hover={onClick ? {
      shadow: 'float',
      transform: 'translateY(-3px)'
    } : {}}
    border="1px solid"
    borderColor="purple.50"
  >
    <HStack spacing={4}>
      <Circle size="52px" bg={iconBgColor} shadow="card" border="1px solid" borderColor="purple.50">
        <Icon as={icon} color={iconColor} boxSize={5} />
      </Circle>
      <VStack align="start" spacing={0}>
        <Text fontSize="2xl" fontWeight="800" color="#1A162E" lineHeight="1.1" letterSpacing="-0.03em">
          {value}
        </Text>
        <Text fontSize="sm" color="purple.400" fontWeight="600" letterSpacing="-0.01em">
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
  const { user } = useAuth();
  const toast = useToast();
  const { t } = useTranslation();

  // États
  const [familyInfo, setFamilyInfo] = useState<FamilyInfo | null>(null);
  const [loadingRegen, setLoadingRegen] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [marriages, setMarriages] = useState<Marriage[]>([]);
  const [familyStats, setFamilyStats] = useState<FamilyStats | null>(null);
  const fetchedRef = useRef(false);

  // Charger les données — guard contre le double-appel React 18 Strict Mode
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
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
      toast({ title: t('dashboard.codeCopied'), status: 'success', duration: 2000 });
    }
  };

  const copyInviteLink = () => {
    if (familyInfo?.inviteCode) {
      const link = `${window.location.origin}/register?code=${familyInfo.inviteCode}`;
      navigator.clipboard.writeText(link);
      toast({ title: 'Lien copié !', description: 'Envoyez ce lien à vos proches — le code sera pré-rempli automatiquement.', status: 'success', duration: 3000 });
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


  return (
    <Box minH="100vh" bg="transparent" pb={{ base: "90px", md: 0 }}> {/* Padding bottom pour bottom nav */}
      <Container maxW="6xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* ==================== HERO BANNER ==================== */}
          <MotionBox
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            bgGradient="linear(135deg, purple.900, purple.700)"
            borderRadius="2xl"
            p={{ base: 6, md: 10 }}
            color="white"
            position="relative"
            overflow="hidden"
          >
            {/* Cercles décoratifs */}
            <Box position="absolute" top="-50px" right="-50px" w="220px" h="220px" borderRadius="full" bg="whiteAlpha.100" />
            <Box position="absolute" bottom="-30px" right="120px" w="130px" h="130px" borderRadius="full" bg="whiteAlpha.100" />
            <Box position="absolute" top="30px" right="200px" w="60px" h="60px" borderRadius="full" bg="whiteAlpha.100" />

            <Flex justify="space-between" align="center" flexWrap="wrap" gap={4} position="relative" zIndex={1}>
              <VStack align="start" spacing={2}>
                {familyInfo?.familyName && (
                  <HStack spacing={2}>
                    <Icon as={FaUsers} boxSize={3} opacity={0.7} />
                    <Text fontSize="xs" opacity={0.75} fontWeight="600" letterSpacing="0.08em" textTransform="uppercase">
                      {familyInfo.familyName}
                    </Text>
                  </HStack>
                )}
                <Heading size="2xl" fontWeight="800" letterSpacing="-0.03em" color="white" lineHeight="1.1">
                  {t('dashboard.welcome', { name: user?.personName?.split(' ')[0] || user?.userName || '' })} 👋
                </Heading>
                {familyStats && (
                  <HStack spacing={5} mt={1} opacity={0.9}>
                    <HStack spacing={1.5}>
                      <Icon as={FaUsers} boxSize={3.5} />
                      <Text fontSize="sm" fontWeight="600">
                        {familyStats.membersCount} {t('dashboard.members')}
                      </Text>
                    </HStack>
                    <HStack spacing={1.5}>
                      <Icon as={FaHeart} boxSize={3.5} />
                      <Text fontSize="sm" fontWeight="600">
                        {familyStats.marriagesCount} {t('dashboard.unions')}
                      </Text>
                    </HStack>
                    <HStack spacing={1.5}>
                      <Icon as={FaCalendar} boxSize={3.5} />
                      <Text fontSize="sm" fontWeight="600">
                        {familyStats.eventsCount} {t('dashboard.events')}
                      </Text>
                    </HStack>
                  </HStack>
                )}
              </VStack>

              <Button
                leftIcon={<Icon as={FaUsers} />}
                bg="whiteAlpha.200"
                color="white"
                borderRadius="xl"
                border="1px solid"
                borderColor="whiteAlpha.300"
                _hover={{ bg: 'whiteAlpha.300', transform: 'translateY(-1px)' }}
                backdropFilter="blur(10px)"
                fontWeight="600"
                size="md"
                display={{ base: 'none', sm: 'flex' }}
                onClick={() => navigate('/persons')}
              >
                {t('navigation.members')}
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
              shadow="card" border="1px solid" borderColor="purple.50"
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
                  onClick={copyInviteLink}
                  leftIcon={<FaLink />}
                  colorScheme="green"
                  borderRadius="xl"
                >
                  Copier le lien
                </Button>
                <Button
                  size="md"
                  onClick={regenerateCode}
                  isLoading={loadingRegen}
                  variant="outline"
                  borderColor="purple.300"
                  color="purple.600"
                  borderRadius="xl"
                  _hover={{ bg: 'purple.50' }}
                >
                  Régénérer
                </Button>
              </HStack>

              {/* QR Code */}
              <Box mt={5} pt={4} borderTop="1px solid" borderColor="purple.100">
                <Text fontSize="sm" color="gray.500" mb={3} fontWeight="600">
                  QR Code d'invitation — à partager ou imprimer
                </Text>
                <HStack spacing={6} align="flex-start">
                  <Box id="family-qr-code" p={3} bg="white" border="1px solid" borderColor="purple.200" borderRadius="xl" shadow="sm">
                    <QRCodeSVG
                      value={`${window.location.origin}/register?code=${familyInfo.inviteCode}`}
                      size={140}
                      fgColor="#6B21A8"
                      bgColor="#FFFFFF"
                      level="M"
                    />
                  </Box>
                  <VStack align="flex-start" spacing={2} justify="center">
                    <Text fontSize="xs" color="gray.600" maxW="220px">
                      Scannez ce QR code pour rejoindre la famille directement — sans avoir à saisir le code manuellement.
                    </Text>
                    <Button
                      size="sm"
                      colorScheme="purple"
                      variant="outline"
                      borderRadius="lg"
                      onClick={() => {
                        const svg = document.querySelector('#family-qr-code svg') as SVGSVGElement;
                        if (!svg) return;
                        const data = new XMLSerializer().serializeToString(svg);
                        const blob = new Blob([data], { type: 'image/svg+xml' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `invitation-famille-${familyInfo.familyName}.svg`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      Télécharger le QR code
                    </Button>
                  </VStack>
                </HStack>
              </Box>
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
                onClick={() => navigate('/persons')}
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
            shadow="card" border="1px solid" borderColor="purple.50"
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
              shadow="card" border="1px solid" borderColor="purple.50"
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
