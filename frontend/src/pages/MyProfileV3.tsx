import { useState, useEffect, useRef, FormEvent } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Card,
  CardBody,
  Spinner,
  Text,
  Avatar,
  Divider,
  Alert,
  AlertIcon,
  AlertDescription,
  Icon,
  Switch,
  FormHelperText,
  Radio,
  RadioGroup,
  Stack,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Grid,
  GridItem,
  Textarea,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaMale, 
  FaFemale, 
  FaCamera, 
  FaUser,
  FaBriefcase,
  FaUsers,
  FaInfoCircle,
  FaArrowLeft,
  FaEnvelope,
  FaSave,
  FaDownload,
  FaTrash,
  FaShieldAlt
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../services/api';

const MotionBox = motion(Box);

interface ProfileData {
  personID: number;
  firstName: string;
  lastName: string;
  sex: string;
  birthday: string;
  email: string;
  activity: string;
  photoUrl: string;
  notes: string;
  cityID: number;
  cityName?: string;
  countryName?: string;
  alive: boolean;
  deathDate?: string;
  fatherName?: string;
  motherName?: string;
}

export default function MyProfileV3() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [age, setAge] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // 2FA
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);

  // Photo upload
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
    api.get('/auth/2fa-status').then(res => setTwoFactorEnabled(res.data.twoFactorEnabled)).catch(() => {});
  }, []);

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const loadProfile = async () => {
    try {
      const response = await api.get('/persons/me');
      const data = {
        ...response.data,
        birthday: response.data.birthday ? response.data.birthday.split('T')[0] : '',
        deathDate: response.data.deathDate ? response.data.deathDate.split('T')[0] : ''
      };
      setProfile(data);
      
      if (data.birthday) setAge(calculateAge(data.birthday));
      
      setLoading(false);
    } catch (error: any) {
      console.error('Erreur:', error);
      toast({
        title: t('common.error'),
        description: t('myProfile.cannotLoadProfile'),
        status: 'error',
        duration: 5000,
      });
      setLoading(false);
    }
  };

  // Handle file selection and preview
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: t('common.error'),
          description: 'Veuillez sélectionner un fichier image',
          status: 'error',
          duration: 3000,
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: t('common.error'),
          description: 'L\'image ne doit pas dépasser 5 MB',
          status: 'error',
          duration: 3000,
        });
        return;
      }

      setPhotoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleToggle2FA = async (enable: boolean) => {
    setTwoFactorLoading(true);
    try {
      await api.post('/auth/toggle-2fa', { enable });
      setTwoFactorEnabled(enable);
      toast({
        title: enable ? 'Double authentification activée' : 'Double authentification désactivée',
        description: enable ? 'Un code vous sera envoyé par email à chaque connexion.' : '2FA désactivé.',
        status: 'success',
        duration: 4000,
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de modifier le paramètre 2FA.',
        status: 'error',
        duration: 4000,
      });
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    if (!profile.firstName || !profile.lastName || !profile.sex || !profile.birthday) {
      toast({
        title: t('myProfile.missingRequiredFields'),
        description: t('myProfile.requiredFieldsDesc'),
        status: 'error',
        duration: 4000,
      });
      return;
    }

    setSaving(true);
    try {
      // Résoudre le cityID depuis le nom tapé (find or create)
      let finalCityID = profile.cityID;
      if (profile.cityName?.trim()) {
        const cityRes = await api.post('/persons/cities', { name: profile.cityName.trim() });
        finalCityID = cityRes.data.cityID;
      }

      // Use FormData for photo upload compatibility
      const formData = new FormData();

      // Add photo file if changed
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      // Add all other fields
      formData.append('firstName', profile.firstName);
      formData.append('lastName', profile.lastName);
      formData.append('sex', profile.sex);
      if (profile.birthday) formData.append('birthday', profile.birthday);
      formData.append('deathDate', profile.deathDate || '');
      formData.append('alive', profile.alive ? 'true' : 'false');
      if (profile.email) formData.append('email', profile.email);
      if (profile.activity) formData.append('activity', profile.activity);
      if (profile.notes) formData.append('notes', profile.notes);
      formData.append('cityID', String(finalCityID));
      
      // Keep existing photoUrl if no new photo
      if (!photoFile && profile.photoUrl) {
        formData.append('photoUrl', profile.photoUrl);
      }

      const response = await api.put('/persons/me', formData);

      toast({
        title: t('myProfile.profileUpdated'),
        description: response.data.message || t('myProfile.changesSaved'),
        status: 'success',
        duration: 3000,
      });

      await loadProfile();
      setPhotoFile(null);
      setPhotoPreview('');
    } catch (error: any) {
      console.error('Erreur:', error);
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || t('myProfile.updateError'),
        status: 'error',
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="#F3F4F6">
        <VStack spacing={4}>
          <Spinner size="xl" color="purple.500" thickness="4px" />
          <Text color="gray.600">{t('myProfile.loadingProfile')}</Text>
        </VStack>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Container maxW="container.md" py={8}>
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          {t('myProfile.profileNotFound')}
        </Alert>
      </Container>
    );
  }

  return (
    <Box minH="100vh" bg="transparent" py={8}>
      <Container maxW="5xl">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Main Card with Gradient Header - Modern Profile Card Design */}
          <Card
            shadow="xl"
            borderRadius="2xl"
            overflow="hidden"
            bg="white"
            border="1px solid"
            borderColor="purple.100"
          >
            {/* 🎨 GRADIENT BANNER HEADER - "Wow Factor" */}
            <Box
              bgGradient="linear(135deg, purple.900 0%, purple.700 55%, purple.500 100%)"
              h="160px"
              position="relative"
            >
              {/* Back Button Floating on Gradient */}
              <Tooltip label={t('common.back')}>
                <IconButton
                  aria-label="Back"
                  icon={<FaArrowLeft />}
                  onClick={() => navigate('/dashboard')}
                  position="absolute"
                  top={4}
                  left={4}
                  bg="whiteAlpha.300"
                  backdropFilter="blur(10px)"
                  color="white"
                  _hover={{ 
                    bg: 'whiteAlpha.500',
                    transform: 'scale(1.05)'
                  }}
                  _active={{ bg: 'whiteAlpha.600' }}
                  size="lg"
                  borderRadius="full"
                  transition="all 0.2s"
                />
              </Tooltip>
              
              {/* Avatar Floating Over Banner - Center Aligned & CLICKABLE */}
              <Box
                position="absolute"
                bottom="-60px"
                left="50%"
                transform="translateX(-50%)"
                cursor="pointer"
                onClick={handleAvatarClick}
                role="button"
                aria-label="Changer la photo de profil"
              >
                {/* Avatar with Hover Overlay Effect */}
                <Box
                  position="relative"
                  borderRadius="full"
                  overflow="hidden"
                  _hover={{
                    transform: 'scale(1.05)',
                    '&::after': {
                      opacity: 1,
                    },
                  }}
                  _after={{
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bg: 'blackAlpha.500',
                    opacity: 0,
                    transition: 'opacity 0.3s',
                    pointerEvents: 'none',
                  }}
                  transition="transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                >
                  <Avatar 
                    size="2xl" 
                    src={photoPreview || profile.photoUrl} 
                    name={`${profile.firstName} ${profile.lastName}`}
                    filter={!profile.alive ? 'grayscale(100%)' : 'none'}
                    opacity={!profile.alive ? 0.8 : 1}
                    border="6px solid white"
                    shadow="0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
                  />
                </Box>
                
                {/* Hidden file input */}
                <Input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  display="none"
                />
                
                {/* Camera Icon Overlay - Modern Upload Badge */}
                <Box
                  position="absolute"
                  bottom={2}
                  right={2}
                  bg="purple.600"
                  borderRadius="full"
                  p={3}
                  _hover={{
                    bg: 'purple.700',
                    transform: 'scale(1.1)',
                  }}
                  transition="all 0.2s"
                  boxShadow="0 4px 12px rgba(109, 40, 217, 0.5)"
                  border="3px solid white"
                  pointerEvents="none"
                >
                  <Icon as={FaCamera} color="white" boxSize={4} />
                </Box>
              </Box>
            </Box>

            <CardBody pt="80px" px={8} pb={0}>
              {/* Profile Info Header - Center Aligned */}
              <VStack spacing={3} mb={8}>
                <Heading size="xl" color="#1F2937" fontWeight="700" textAlign="center">
                  {profile.firstName} {profile.lastName}
                </Heading>
                <HStack spacing={3}>
                  <Badge 
                    colorScheme={profile.alive ? 'green' : 'red'} 
                    fontSize="sm" 
                    px={4} 
                    py={1} 
                    borderRadius="full"
                    fontWeight="600"
                  >
                    {profile.alive ? '🌱 Vivant(e)' : '🕊️ Décédé(e)'}
                  </Badge>
                  {age !== null && (
                    <Badge 
                      colorScheme="purple"
                      fontSize="sm"
                      px={4} 
                      py={1} 
                      borderRadius="full"
                      fontWeight="600"
                    >
                      {age} ans
                    </Badge>
                  )}
                </HStack>
              </VStack>

              {/* Alerte Info */}
              <Alert
                status="info"
                variant="left-accent"
                borderRadius="lg"
                mb={6}
                bg="purple.50"
                borderColor="purple.400"
              >
                <AlertIcon />
                <AlertDescription fontSize="sm">
                  <Text fontWeight="bold" mb={1}>
                    👤 {t('myProfile.yourPersonalProfile')}
                  </Text>
                  <Text>
                    {t('myProfile.aboutYouOnly')}{' '}
                    <strong>{t('myProfile.yourInfoOnly')}</strong>.{' '}
                    {t('myProfile.manageOthersGoToDashboard')}
                  </Text>
                </AlertDescription>
              </Alert>

              <Divider mb={6} borderColor="#E5E7EB" />
            </CardBody>

            <CardBody p={0}>
              <form onSubmit={handleSubmit}>
                <Tabs 
                  index={activeTab} 
                  onChange={setActiveTab}
                  colorScheme="purple"
                  variant="soft-rounded"
                >
                  <TabList 
                    position="sticky"
                    top="70px"
                    zIndex={900}
                    bg="white"
                    px={8} 
                    pt={4} 
                    pb={4}
                    gap={2}
                    borderBottom="2px solid"
                    borderColor="#E5E7EB"
                    boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                    transition="all 0.3s"
                    overflowX="auto"
                    css={{
                      '&::-webkit-scrollbar': {
                        height: '4px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: '#CBD5E0',
                        borderRadius: '4px',
                      },
                    }}
                  >
                    <Tab 
                      fontWeight="600"
                      fontSize="md"
                      px={6}
                      py={3}
                      borderRadius="10px"
                      color="#4B5563"
                      whiteSpace="nowrap"
                      _selected={{ 
                        color: 'white',
                        bg: 'purple.600',
                        shadow: '0 4px 12px rgba(109, 40, 217, 0.35)'
                      }}
                      _hover={{ bg: 'purple.50' }}
                      transition="all 0.2s"
                    >
                      <Icon as={FaUser} mr={2} />
                      {t('myProfile.tabGeneral')}
                    </Tab>
                    <Tab 
                      fontWeight="600"
                      fontSize="md"
                      px={6}
                      py={3}
                      borderRadius="10px"
                      color="#4B5563"
                      whiteSpace="nowrap"
                      _selected={{ 
                        color: 'white',
                        bg: 'purple.600',
                        shadow: '0 4px 12px rgba(109, 40, 217, 0.35)'
                      }}
                      _hover={{ bg: 'purple.50' }}
                      transition="all 0.2s"
                    >
                      <Icon as={FaEnvelope} mr={2} />
                      {t('myProfile.tabContact')}
                    </Tab>
                    <Tab
                      fontWeight="600"
                      fontSize="md"
                      px={6}
                      py={3}
                      borderRadius="10px"
                      color="#4B5563"
                      whiteSpace="nowrap"
                      _selected={{
                        color: 'white',
                        bg: 'purple.600',
                        shadow: '0 4px 12px rgba(109, 40, 217, 0.35)'
                      }}
                      _hover={{ bg: 'purple.50' }}
                      transition="all 0.2s"
                    >
                      <Icon as={FaInfoCircle} mr={2} />
                      {t('myProfile.tabBiography')}
                    </Tab>
                    <Tab
                      fontWeight="600"
                      fontSize="md"
                      px={6}
                      py={3}
                      borderRadius="10px"
                      color="#4B5563"
                      whiteSpace="nowrap"
                      _selected={{
                        color: 'white',
                        bg: 'purple.600',
                        shadow: '0 4px 12px rgba(109, 40, 217, 0.35)'
                      }}
                      _hover={{ bg: 'purple.50' }}
                      transition="all 0.2s"
                    >
                      <Icon as={FaShieldAlt} mr={2} />
                      Sécurité
                    </Tab>
                    {(profile.fatherName || profile.motherName) && (
                      <Tab 
                        fontWeight="600"
                        fontSize="md"
                        px={6}
                        py={3}
                        borderRadius="10px"
                        color="#4B5563"
                        whiteSpace="nowrap"
                        _selected={{ 
                          color: 'white',
                          bg: '#6366F1',
                          shadow: '0 4px 6px -1px rgba(99, 102, 241, 0.4)'
                        }}
                        _hover={{ bg: 'purple.50' }}
                        transition="all 0.2s"
                      >
                        <Icon as={FaUsers} mr={2} />
                        {t('myProfile.parents')}
                      </Tab>
                    )}
                  </TabList>

                  <TabPanels>
                    {/* TAB 1: GÉNÉRAL */}
                    <TabPanel px={8} py={6}>
                      <VStack spacing={6} align="stretch">
                        {/* Grid 2 colonnes pour inputs courts */}
                        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                          <GridItem>
                            <FormControl isRequired>
                              <FormLabel fontWeight="600" color="#374151">
                                {t('myProfile.firstName')}
                              </FormLabel>
                              <Input
                                value={profile.firstName}
                                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                h="48px"
                                borderRadius="8px"
                                borderColor="#D1D5DB"
                                _hover={{ borderColor: '#9CA3AF' }}
                                _focus={{ 
                                  borderColor: '#6366F1',
                                  boxShadow: '0 0 0 1px #6366F1'
                                }}
                              />
                            </FormControl>
                          </GridItem>

                          <GridItem>
                            <FormControl isRequired>
                              <FormLabel fontWeight="600" color="#374151">
                                {t('myProfile.lastName')}
                              </FormLabel>
                              <Input
                                value={profile.lastName}
                                onChange={(e) => setProfile({ ...profile, lastName: e.target.value.toUpperCase() })}
                                h="48px"
                                borderRadius="8px"
                                borderColor="#D1D5DB"
                                textTransform="uppercase"
                                _hover={{ borderColor: '#9CA3AF' }}
                                _focus={{ 
                                  borderColor: '#6366F1',
                                  boxShadow: '0 0 0 1px #6366F1'
                                }}
                              />
                            </FormControl>
                          </GridItem>
                        </Grid>

                        <FormControl isRequired>
                          <FormLabel fontWeight="600" color="#374151">
                            {t('myProfile.gender')}
                          </FormLabel>
                          <RadioGroup
                            value={profile.sex}
                            onChange={(value) => setProfile({ ...profile, sex: value })}
                          >
                            <Stack direction={{ base: 'column', sm: 'row' }} spacing={6}>
                              <Radio value="M" colorScheme="blue" size="lg">
                                <HStack spacing={2}>
                                  <Icon as={FaMale} color="blue.500" boxSize={5} />
                                  <Text fontWeight="500">{t('myProfile.male')}</Text>
                                </HStack>
                              </Radio>
                              <Radio value="F" colorScheme="pink" size="lg">
                                <HStack spacing={2}>
                                  <Icon as={FaFemale} color="pink.500" boxSize={5} />
                                  <Text fontWeight="500">{t('myProfile.female')}</Text>
                                </HStack>
                              </Radio>
                            </Stack>
                          </RadioGroup>
                        </FormControl>

                        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                          <GridItem>
                            <FormControl isRequired>
                              <FormLabel fontWeight="600" color="#374151">
                                {t('myProfile.birthdate')}
                              </FormLabel>
                              <Input
                                type="date"
                                value={profile.birthday}
                                onChange={(e) => {
                                  setProfile({ ...profile, birthday: e.target.value });
                                  if (e.target.value) setAge(calculateAge(e.target.value));
                                }}
                                h="48px"
                                borderRadius="8px"
                                borderColor="#D1D5DB"
                                _hover={{ borderColor: '#9CA3AF' }}
                                _focus={{ 
                                  borderColor: '#6366F1',
                                  boxShadow: '0 0 0 1px #6366F1'
                                }}
                              />
                            </FormControl>
                          </GridItem>

                          <GridItem>
                            <FormControl>
                              <FormLabel fontWeight="600" color="#374151">
                                Ville de naissance
                              </FormLabel>
                              <Input
                                value={profile.cityName || ''}
                                h="48px"
                                borderRadius="8px"
                                onChange={e => setProfile({ ...profile, cityName: e.target.value })}
                              />
                            </FormControl>
                          </GridItem>
                        </Grid>

                        <Divider />

                        <FormControl display="flex" alignItems="center" justifyContent="space-between">
                          <Box>
                            <FormLabel mb={0} fontWeight="600" color="#374151">
                              {t('myProfile.isDeceased')}
                            </FormLabel>
                            <FormHelperText fontSize="xs" mt={1}>
                              Activer si la personne est décédée
                            </FormHelperText>
                          </Box>
                          <Switch
                            isChecked={!profile.alive}
                            onChange={(e) => setProfile({ 
                              ...profile, 
                              alive: !e.target.checked,
                              deathDate: e.target.checked ? profile.deathDate : undefined
                            })}
                            colorScheme="gray"
                            size="lg"
                          />
                        </FormControl>

                        {!profile.alive && (
                          <FormControl>
                            <FormLabel fontWeight="600" color="#374151">
                              {t('myProfile.deathDate')}
                            </FormLabel>
                            <Input
                              type="date"
                              value={profile.deathDate || ''}
                              onChange={(e) => setProfile({ ...profile, deathDate: e.target.value })}
                              h="48px"
                              borderRadius="8px"
                              borderColor="#D1D5DB"
                              _hover={{ borderColor: '#9CA3AF' }}
                              _focus={{ 
                                borderColor: '#6366F1',
                                boxShadow: '0 0 0 1px #6366F1'
                              }}
                            />
                          </FormControl>
                        )}
                      </VStack>
                    </TabPanel>

                    {/* TAB 2: CONTACT */}
                    <TabPanel px={8} py={6}>
                      <VStack spacing={6} align="stretch">
                        <FormControl>
                          <FormLabel fontWeight="600" color="#374151">
                            <Icon as={FaEnvelope} mr={2} color="purple.500" />
                            {t('myProfile.email')}
                          </FormLabel>
                          <Input
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            h="48px"
                            borderRadius="8px"
                            borderColor="#D1D5DB"
                            _hover={{ borderColor: '#9CA3AF' }}
                            _focus={{ 
                              borderColor: '#6366F1',
                              boxShadow: '0 0 0 1px #6366F1'
                            }}
                          />
                          <FormHelperText fontSize="sm">
                            📧 Email de contact visible par votre famille
                          </FormHelperText>
                        </FormControl>

                        {age !== null && age >= 18 && (
                          <FormControl>
                            <FormLabel fontWeight="600" color="#374151">
                              <Icon as={FaBriefcase} mr={2} color="purple.500" />
                              {t('myProfile.professionalActivity')}
                            </FormLabel>
                            <Input
                              value={profile.activity || ''}
                              onChange={(e) => setProfile({ ...profile, activity: e.target.value })}
                              h="48px"
                              borderRadius="8px"
                              borderColor="#D1D5DB"
                              _hover={{ borderColor: '#9CA3AF' }}
                              _focus={{ 
                                borderColor: '#6366F1',
                                boxShadow: '0 0 0 1px #6366F1'
                              }}
                            />
                            <FormHelperText fontSize="sm">
                              💼 Votre profession ou activité principale
                            </FormHelperText>
                          </FormControl>
                        )}

                        <Alert status="info" borderRadius="md">
                          <AlertIcon />
                          <Box>
                            <Text fontWeight="bold" fontSize="sm">
                              🌍 Localisation
                            </Text>
                            <Text fontSize="sm" mt={1}>
                              Ville: <strong>{profile.cityName || 'Non renseignée'}</strong>
                            </Text>
                            <Text fontSize="sm">
                              Pays: <strong>{profile.countryName || 'Non renseigné'}</strong>
                            </Text>
                            <Text fontSize="xs" color="gray.600" mt={2}>
                              💡 Pour modifier votre ville/pays, contactez un administrateur
                            </Text>
                          </Box>
                        </Alert>
                      </VStack>
                    </TabPanel>

                    {/* TAB 3: BIOGRAPHIE */}
                    <TabPanel px={8} py={6}>
                      <VStack spacing={6} align="stretch">
                        <FormControl>
                          <FormLabel fontWeight="600" color="#374151">
                            <Icon as={FaInfoCircle} mr={2} color="purple.500" />
                            {t('myProfile.notesBio')}
                          </FormLabel>
                          <Textarea
                            value={profile.notes || ''}
                            onChange={(e) => setProfile({ ...profile, notes: e.target.value })}
                            rows={8}
                            resize="vertical"
                            borderRadius="8px"
                            borderColor="#D1D5DB"
                            _hover={{ borderColor: '#9CA3AF' }}
                            _focus={{ 
                              borderColor: '#6366F1',
                              boxShadow: '0 0 0 1px #6366F1'
                            }}
                          />
                          <FormHelperText fontSize="sm">
                            📝 Partagez votre histoire avec votre famille
                          </FormHelperText>
                        </FormControl>

                        <Card bg="purple.50" borderColor="purple.200" borderWidth="2px">
                          <CardBody>
                            <VStack spacing={3} align="start">
                              <Heading size="sm" color="purple.700">
                                💡 Suggestions de biographie
                              </Heading>
                              <Text fontSize="sm" color="gray.700">
                                • Votre parcours professionnel<br />
                                • Vos passions et hobbies<br />
                                • Souvenirs marquants<br />
                                • Valeurs importantes pour vous<br />
                                • Anecdotes familiales
                              </Text>
                            </VStack>
                          </CardBody>
                        </Card>
                      </VStack>
                    </TabPanel>

                    {/* TAB 4: SÉCURITÉ */}
                    <TabPanel px={8} py={6}>
                      <VStack spacing={6} align="stretch">
                        <Alert status="info" borderRadius="lg" bg="purple.50" borderColor="purple.300" variant="left-accent">
                          <AlertIcon />
                          <AlertDescription fontSize="sm">
                            <Text fontWeight="bold" mb={1}>🔐 Double authentification (2FA)</Text>
                            <Text>
                              Quand activée, un code à 6 chiffres sera envoyé à votre email à chaque connexion.
                            </Text>
                          </AlertDescription>
                        </Alert>

                        <Card border="1px solid" borderColor={twoFactorEnabled ? 'green.200' : 'gray.200'} bg={twoFactorEnabled ? 'green.50' : 'white'}>
                          <CardBody>
                            <FormControl display="flex" alignItems="center" justifyContent="space-between">
                              <Box>
                                <HStack spacing={2} mb={1}>
                                  <Icon as={FaShieldAlt} color={twoFactorEnabled ? 'green.500' : 'gray.400'} />
                                  <Text fontWeight="700" color="#374151">
                                    Double authentification
                                  </Text>
                                  {twoFactorEnabled && (
                                    <Badge colorScheme="green" borderRadius="full" px={2} fontSize="xs">Activée</Badge>
                                  )}
                                </HStack>
                                <Text fontSize="sm" color="gray.500">
                                  {twoFactorEnabled
                                    ? 'Votre compte est protégé. Un code email est requis à chaque connexion.'
                                    : 'Renforcez la sécurité de votre compte avec un code email.'}
                                </Text>
                              </Box>
                              <Switch
                                isChecked={twoFactorEnabled}
                                onChange={(e) => handleToggle2FA(e.target.checked)}
                                isDisabled={twoFactorLoading}
                                colorScheme="green"
                                size="lg"
                              />
                            </FormControl>
                          </CardBody>
                        </Card>

                        <Card bg="gray.50" borderColor="gray.200" borderWidth="1px">
                          <CardBody>
                            <VStack spacing={2} align="start">
                              <Heading size="sm" color="gray.700">💡 Comment ça fonctionne ?</Heading>
                              <Text fontSize="sm" color="gray.600">
                                1. Vous saisissez votre email et mot de passe normalement.<br />
                                2. Un code à 6 chiffres est envoyé à votre adresse email.<br />
                                3. Vous saisissez le code pour finaliser la connexion.<br />
                                4. Le code expire après 10 minutes.
                              </Text>
                            </VStack>
                          </CardBody>
                        </Card>
                      </VStack>
                    </TabPanel>

                    {/* TAB 5: PARENTS (conditionnel) */}
                    {(profile.fatherName || profile.motherName) && (
                      <TabPanel px={8} py={6}>
                        <VStack spacing={6} align="stretch">
                          <Alert status="info" borderRadius="md">
                            <AlertIcon />
                            <Box>
                              <Text fontWeight="bold" fontSize="lg" mb={2}>
                                👨‍👩‍👦 {t('myProfile.yourParents')}
                              </Text>
                              {profile.fatherName && (
                                <Text mb={1}>
                                  <strong>{t('myProfile.father')}:</strong> {profile.fatherName}
                                </Text>
                              )}
                              {profile.motherName && (
                                <Text mb={3}>
                                  <strong>{t('myProfile.mother')}:</strong> {profile.motherName}
                                </Text>
                              )}
                              <Text fontSize="sm" color="gray.600">
                                🔒 {t('myProfile.modifyParentsContactAdmin')}
                              </Text>
                            </Box>
                          </Alert>

                          <Card bg="purple.50" borderColor="purple.200" borderWidth="2px">
                            <CardBody>
                              <VStack spacing={3} align="start">
                                <Heading size="sm" color="purple.700">
                                  💡 {t('myProfile.whyCantModifyParents')}
                                </Heading>
                                <Text fontSize="sm" color="gray.700">
                                  {t('myProfile.parentsExplanation')}
                                </Text>
                              </VStack>
                            </CardBody>
                          </Card>
                        </VStack>
                      </TabPanel>
                    )}
                  </TabPanels>
                </Tabs>

                {/* Section RGPD */}
                <Box px={{ base: 4, md: 6 }} pb={4}>
                  <Divider mb={4} />
                  <HStack spacing={3} wrap="wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme="purple"
                      leftIcon={<Icon as={FaDownload} />}
                      onClick={async () => {
                        try {
                          const res = await api.get('/auth/export');
                          const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'mes-donnees-familytree.json';
                          a.click();
                          URL.revokeObjectURL(url);
                        } catch {
                          toast({ title: 'Erreur lors de l\'export', status: 'error', duration: 3000 });
                        }
                      }}
                    >
                      Exporter mes données
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme="red"
                      leftIcon={<Icon as={FaTrash} />}
                      onClick={async () => {
                        if (!window.confirm('Supprimer définitivement votre compte ? Cette action est irréversible.')) return;
                        try {
                          await api.delete('/auth/account');
                          localStorage.clear();
                          window.location.href = '/login';
                        } catch {
                          toast({ title: 'Erreur lors de la suppression', status: 'error', duration: 3000 });
                        }
                      }}
                    >
                      Supprimer mon compte
                    </Button>
                    <Text fontSize="xs" color="gray.400">
                      <Link to="/privacy" style={{ color: '#8B5CF6' }}>Politique de confidentialité</Link>
                    </Text>
                  </HStack>
                </Box>

                {/* Boutons d'action (sticky en bas) */}
                <Box
                  p={{ base: 4, md: 6 }}
                  bg="gray.50"
                  borderTop="1px solid"
                  borderColor="gray.200"
                >
                  <HStack
                    spacing={4}
                    justify="flex-end"
                    direction={{ base: 'column', sm: 'row' }}
                    w="full"
                  >
                    <Button
                      variant="outline"
                      colorScheme="gray"
                      onClick={() => navigate('/dashboard')}
                      size="lg"
                      w={{ base: 'full', sm: 'auto' }}
                      minW="140px"
                      h="48px"
                      borderRadius="8px"
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                      type="submit"
                      colorScheme="purple"
                      isLoading={saving}
                      loadingText="Enregistrement..."
                      size="lg"
                      w={{ base: 'full', sm: 'auto' }}
                      minW="180px"
                      h="48px"
                      borderRadius="8px"
                      leftIcon={<Icon as={FaSave} />}
                      boxShadow="lg"
                      _hover={{ transform: 'translateY(-2px)', boxShadow: '2xl' }}
                      transition="all 0.2s"
                    >
                      {t('myProfile.saveChanges')}
                    </Button>
                  </HStack>
                </Box>
              </form>
            </CardBody>
          </Card>
        </MotionBox>
      </Container>
    </Box>
  );
}
