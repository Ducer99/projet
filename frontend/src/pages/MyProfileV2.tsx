import { useState, useEffect, useRef } from 'react';
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
  Checkbox,
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
  useBreakpointValue
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUserEdit, 
  FaMale, 
  FaFemale, 
  FaCamera, 
  FaSkullCrossbones,
  FaUser,
  FaMapMarkerAlt,
  FaBriefcase,
  FaUsers,
  FaInfoCircle,
  FaArrowLeft
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

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

export default function MyProfileV2() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [age, setAge] = useState<number | null>(null);
  const [sameAsBirth, setSameAsBirth] = useState(false);
  const [birthCountry, setBirthCountry] = useState('');
  const [birthCity, setBirthCity] = useState('');
  const [residenceCountry, setResidenceCountry] = useState('');
  const [residenceCity, setResidenceCity] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const navigate = useNavigate();

  // Responsive
  const isMobile = useBreakpointValue({ base: true, md: false });
  const bannerHeight = useBreakpointValue({ base: '120px', md: '180px' });
  const avatarSize = useBreakpointValue({ base: '120px', md: '160px' });
  const gridColumns = useBreakpointValue({ base: 1, md: 2 });

  useEffect(() => {
    loadProfile();
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

  const handleFirstNameChange = (value: string) => {
    const capitalized = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    setProfile(profile ? { ...profile, firstName: capitalized } : null);
  };

  const handleLastNameChange = (value: string) => {
    setProfile(profile ? { ...profile, lastName: value.toUpperCase() } : null);
  };

  const handleBirthDateChange = (value: string) => {
    setProfile(profile ? { ...profile, birthday: value } : null);
    if (value) {
      setAge(calculateAge(value));
    }
  };

  const handleAliveChange = (isDeceased: boolean) => {
    setProfile(profile ? {
      ...profile,
      alive: !isDeceased,
      deathDate: isDeceased ? profile.deathDate : undefined
    } : null);
  };

  const handleSameAsBirthChange = (checked: boolean) => {
    setSameAsBirth(checked);
    if (checked) {
      setResidenceCountry(birthCountry);
      setResidenceCity(birthCity);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(profile ? { ...profile, photoUrl: reader.result as string } : null);
      };
      reader.readAsDataURL(file);
      
      toast({
        title: t('myProfile.photoUploaded'),
        description: t('myProfile.saveToKeep'),
        status: 'info',
        duration: 2000,
      });
    }
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
      if (data.countryName) setBirthCountry(data.countryName);
      if (data.cityName) setBirthCity(data.cityName);
      
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

  const handleSubmit = async (e: React.FormEvent) => {
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
      const updatePayload = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        sex: profile.sex,
        birthday: profile.birthday ? new Date(profile.birthday).toISOString() : null,
        email: profile.email,
        activity: profile.activity || null,
        photoUrl: profile.photoUrl || null,
        notes: profile.notes || null,
        cityID: profile.cityID,
        alive: profile.alive,
        deathDate: profile.deathDate ? new Date(profile.deathDate).toISOString() : null
      };

      const response = await api.put('/persons/me', updatePayload);

      toast({
        title: t('myProfile.profileUpdated'),
        description: response.data.message || t('myProfile.changesSaved'),
        status: 'success',
        duration: 3000,
      });

      await loadProfile();
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
      <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
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
    <Box minH="100vh" bg="gray.50" pb={10}>
      {/* 🎨 BANNIÈRE HÉRO avec Gradient */}
      <Box
        h={bannerHeight}
        bgGradient="linear(to-r, purple.500, pink.500, orange.400)"
        position="relative"
        mb={`calc(${avatarSize} / 2 + 20px)`}
      >
        {/* Bouton Retour */}
        <Container maxW="container.xl" h="full" position="relative">
          <IconButton
            aria-label="Back"
            icon={<FaArrowLeft />}
            position="absolute"
            top={4}
            left={4}
            onClick={() => navigate('/dashboard')}
            colorScheme="whiteAlpha"
            size={isMobile ? 'sm' : 'md'}
          />
          
          {/* Badge Décédé (si applicable) */}
          {!profile.alive && (
            <Badge
              position="absolute"
              top={4}
              right={4}
              colorScheme="gray"
              fontSize="md"
              px={4}
              py={2}
              borderRadius="full"
              bg="whiteAlpha.900"
            >
              <HStack spacing={2}>
                <Icon as={FaSkullCrossbones} />
                <Text>{t('myProfile.deceased')}</Text>
              </HStack>
            </Badge>
          )}
        </Container>

        {/* Avatar Chevauchant */}
        <Box
          position="absolute"
          bottom={`calc(-${avatarSize} / 2)`}
          left="50%"
          transform="translateX(-50%)"
        >
          <Box position="relative">
            {/* Halo lumineux */}
            <Box
              position="absolute"
              inset="-12px"
              borderRadius="full"
              bg={profile.alive ? 
                "radial-gradient(circle, rgba(72, 187, 120, 0.4) 0%, transparent 70%)" : 
                "radial-gradient(circle, rgba(160, 174, 192, 0.5) 0%, transparent 70%)"
              }
              filter="blur(20px)"
            />
            
            <Avatar
              size="2xl"
              name={`${profile.firstName} ${profile.lastName}`}
              src={profile.photoUrl || undefined}
              bg={profile.alive ? "green.400" : "gray.400"}
              boxSize={avatarSize}
              border="6px solid white"
              boxShadow="2xl"
              cursor="pointer"
              onClick={() => fileInputRef.current?.click()}
              _hover={{ transform: 'scale(1.05)', transition: 'all 0.3s ease' }}
            />
            
            {/* Bouton Caméra */}
            <IconButton
              aria-label="Upload photo"
              icon={<FaCamera />}
              position="absolute"
              bottom={2}
              right={2}
              borderRadius="full"
              colorScheme="purple"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              boxShadow="lg"
            />
            
            <Input
              type="file"
              accept="image/*"
              display="none"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
            />
          </Box>
        </Box>
      </Box>

      {/* Nom complet */}
      <Container maxW="container.xl" mt={4}>
        <VStack spacing={2} mb={6}>
          <Heading size={isMobile ? 'lg' : 'xl'} color="gray.800" textAlign="center">
            {profile.firstName} {profile.lastName}
          </Heading>
          {age !== null && (
            <HStack spacing={2} color="gray.600">
              <Text fontSize={isMobile ? 'md' : 'lg'}>
                {t('myProfile.yearsOld', { age })}
              </Text>
              {!profile.alive && profile.deathDate && (
                <Badge colorScheme="gray" fontSize="sm">
                  †{new Date(profile.deathDate).getFullYear()}
                </Badge>
              )}
            </HStack>
          )}
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

        {/* 📑 ONGLETS */}
        <Card borderRadius="2xl" boxShadow="xl" overflow="hidden">
          <form onSubmit={handleSubmit}>
            <Tabs colorScheme="purple" variant="enclosed" isFitted={isMobile}>
              <TabList bg="gray.50" px={{ base: 2, md: 6 }} pt={4}>
                <Tab
                  _selected={{ bg: 'white', borderBottomColor: 'transparent' }}
                  fontSize={{ base: 'xs', md: 'sm' }}
                >
                  <HStack spacing={2}>
                    <Icon as={FaUser} />
                    <Text display={{ base: 'none', sm: 'block' }}>
                      {t('myProfile.basicInfo')}
                    </Text>
                  </HStack>
                </Tab>
                <Tab
                  _selected={{ bg: 'white', borderBottomColor: 'transparent' }}
                  fontSize={{ base: 'xs', md: 'sm' }}
                >
                  <HStack spacing={2}>
                    <Icon as={FaMapMarkerAlt} />
                    <Text display={{ base: 'none', sm: 'block' }}>
                      {t('myProfile.location')}
                    </Text>
                  </HStack>
                </Tab>
                {age !== null && age >= 18 && (
                  <Tab
                    _selected={{ bg: 'white', borderBottomColor: 'transparent' }}
                    fontSize={{ base: 'xs', md: 'sm' }}
                  >
                    <HStack spacing={2}>
                      <Icon as={FaBriefcase} />
                      <Text display={{ base: 'none', sm: 'block' }}>
                        {t('myProfile.profession')}
                      </Text>
                    </HStack>
                  </Tab>
                )}
                {(profile.fatherName || profile.motherName) && (
                  <Tab
                    _selected={{ bg: 'white', borderBottomColor: 'transparent' }}
                    fontSize={{ base: 'xs', md: 'sm' }}
                  >
                    <HStack spacing={2}>
                      <Icon as={FaUsers} />
                      <Text display={{ base: 'none', sm: 'block' }}>
                        {t('myProfile.parents')}
                      </Text>
                    </HStack>
                  </Tab>
                )}
                <Tab
                  _selected={{ bg: 'white', borderBottomColor: 'transparent' }}
                  fontSize={{ base: 'xs', md: 'sm' }}
                >
                  <HStack spacing={2}>
                    <Icon as={FaInfoCircle} />
                    <Text display={{ base: 'none', sm: 'block' }}>
                      {t('myProfile.otherInfo')}
                    </Text>
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels>
                {/* TAB 1: Informations Personnelles */}
                <TabPanel p={{ base: 4, md: 8 }}>
                  <VStack spacing={6} align="stretch">
                    <Grid templateColumns={`repeat(${gridColumns}, 1fr)`} gap={4}>
                      <GridItem>
                        <FormControl isRequired>
                          <FormLabel>{t('myProfile.firstName')}</FormLabel>
                          <Input
                            value={profile.firstName}
                            onChange={(e) => handleFirstNameChange(e.target.value)}
                            borderColor={!profile.firstName ? 'red.400' : 'gray.200'}
                            borderWidth={!profile.firstName ? '2px' : '1px'}
                            _focus={{ borderColor: 'purple.400', borderWidth: '2px' }}
                          />
                          <FormHelperText fontSize="xs">
                            💡 {t('myProfile.autoCapitalFirst')}
                          </FormHelperText>
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl isRequired>
                          <FormLabel>{t('myProfile.lastName')}</FormLabel>
                          <Input
                            value={profile.lastName}
                            onChange={(e) => handleLastNameChange(e.target.value)}
                            borderColor={!profile.lastName ? 'red.400' : 'gray.200'}
                            borderWidth={!profile.lastName ? '2px' : '1px'}
                            _focus={{ borderColor: 'purple.400', borderWidth: '2px' }}
                          />
                          <FormHelperText fontSize="xs">
                            💡 {t('myProfile.autoUppercase')}
                          </FormHelperText>
                        </FormControl>
                      </GridItem>
                    </Grid>

                    <FormControl isRequired>
                      <FormLabel>{t('myProfile.gender')}</FormLabel>
                      <RadioGroup
                        value={profile.sex}
                        onChange={(value) => setProfile({ ...profile, sex: value })}
                      >
                        <Stack direction={{ base: 'column', sm: 'row' }} spacing={6}>
                          <Radio value="M" colorScheme="blue">
                            <HStack spacing={2}>
                              <Icon as={FaMale} color="blue.500" boxSize={5} />
                              <Text>👨 {t('myProfile.male')}</Text>
                            </HStack>
                          </Radio>
                          <Radio value="F" colorScheme="pink">
                            <HStack spacing={2}>
                              <Icon as={FaFemale} color="pink.500" boxSize={5} />
                              <Text>👩 {t('myProfile.female')}</Text>
                            </HStack>
                          </Radio>
                        </Stack>
                      </RadioGroup>
                      <FormHelperText fontSize="xs">
                        🎯 {t('myProfile.claritySimplicity')}
                      </FormHelperText>
                    </FormControl>

                    <Grid templateColumns={`repeat(${gridColumns}, 1fr)`} gap={4}>
                      <GridItem>
                        <FormControl isRequired>
                          <FormLabel>{t('myProfile.birthdate')}</FormLabel>
                          <Input
                            type="date"
                            value={profile.birthday}
                            onChange={(e) => handleBirthDateChange(e.target.value)}
                            borderColor={!profile.birthday ? 'red.400' : 'gray.200'}
                            borderWidth={!profile.birthday ? '2px' : '1px'}
                            _focus={{ borderColor: 'purple.400', borderWidth: '2px' }}
                          />
                          {!profile.birthday && (
                            <FormHelperText fontSize="xs" color="red.500">
                              ⚠️ {t('myProfile.requiredField')}
                            </FormHelperText>
                          )}
                        </FormControl>
                      </GridItem>

                      {age !== null && (
                        <GridItem>
                          <FormControl>
                            <FormLabel>{t('myProfile.age')}</FormLabel>
                            <Input
                              value={t('myProfile.yearsOld', { age })}
                              isReadOnly
                              bg="gray.100"
                              cursor="not-allowed"
                              fontWeight="bold"
                            />
                            <FormHelperText fontSize="xs">
                              🤖 {t('myProfile.autoCalculated')}
                            </FormHelperText>
                          </FormControl>
                        </GridItem>
                      )}
                    </Grid>

                    <Divider />

                    <FormControl display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <FormLabel mb={0}>{t('myProfile.isDeceased')}</FormLabel>
                        <FormHelperText fontSize="xs" mt={1}>
                          {t('myProfile.enableIfDeceased')}
                        </FormHelperText>
                      </Box>
                      <Switch
                        isChecked={!profile.alive}
                        onChange={(e) => handleAliveChange(e.target.checked)}
                        colorScheme="gray"
                        size="lg"
                      />
                    </FormControl>

                    {!profile.alive && (
                      <FormControl>
                        <FormLabel>{t('myProfile.deathDate')}</FormLabel>
                        <Input
                          type="date"
                          value={profile.deathDate || ''}
                          onChange={(e) => setProfile({ ...profile, deathDate: e.target.value })}
                          _focus={{ borderColor: 'purple.400', borderWidth: '2px' }}
                        />
                        <FormHelperText fontSize="xs">
                          👁️ {t('myProfile.visibleOnlyIfDeceased')}
                        </FormHelperText>
                      </FormControl>
                    )}
                  </VStack>
                </TabPanel>

                {/* TAB 2: Localisation */}
                <TabPanel p={{ base: 4, md: 8 }}>
                  <VStack spacing={6} align="stretch">
                    <Heading size="sm" color="purple.600">
                      📍 {t('myProfile.birthPlace')}
                    </Heading>
                    
                    <Grid templateColumns={`repeat(${gridColumns}, 1fr)`} gap={4}>
                      <GridItem>
                        <FormControl isRequired>
                          <FormLabel>{t('myProfile.birthCountry')}</FormLabel>
                          <Input
                            value={birthCountry}
                            onChange={(e) => setBirthCountry(e.target.value)}
                            borderColor={!birthCountry ? 'red.400' : 'gray.200'}
                            _focus={{ borderColor: 'purple.400', borderWidth: '2px' }}
                          />
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl isRequired>
                          <FormLabel>{t('myProfile.birthCity')}</FormLabel>
                          <Input
                            value={birthCity}
                            onChange={(e) => setBirthCity(e.target.value)}
                            borderColor={!birthCity ? 'red.400' : 'gray.200'}
                            _focus={{ borderColor: 'purple.400', borderWidth: '2px' }}
                          />
                        </FormControl>
                      </GridItem>
                    </Grid>

                    {profile.alive && (
                      <>
                        <Divider />
                        
                        <Checkbox
                          isChecked={sameAsBirth}
                          onChange={(e) => handleSameAsBirthChange(e.target.checked)}
                          colorScheme="purple"
                          size="lg"
                        >
                          <Text fontWeight="medium">
                            📍 {t('myProfile.stillInBirthPlace')}
                          </Text>
                        </Checkbox>

                        {!sameAsBirth && (
                          <>
                            <Heading size="sm" color="purple.600">
                              🏡 {t('myProfile.currentResidence')}
                            </Heading>
                            
                            <Grid templateColumns={`repeat(${gridColumns}, 1fr)`} gap={4}>
                              <GridItem>
                                <FormControl>
                                  <FormLabel>{t('myProfile.residenceCountry')}</FormLabel>
                                  <Input
                                    value={residenceCountry}
                                    onChange={(e) => setResidenceCountry(e.target.value)}
                                    _focus={{ borderColor: 'purple.400', borderWidth: '2px' }}
                                  />
                                </FormControl>
                              </GridItem>

                              <GridItem>
                                <FormControl>
                                  <FormLabel>{t('myProfile.residenceCity')}</FormLabel>
                                  <Input
                                    value={residenceCity}
                                    onChange={(e) => setResidenceCity(e.target.value)}
                                    _focus={{ borderColor: 'purple.400', borderWidth: '2px' }}
                                  />
                                </FormControl>
                              </GridItem>
                            </Grid>
                          </>
                        )}
                      </>
                    )}
                  </VStack>
                </TabPanel>

                {/* TAB 3: Profession (si âge >= 18) */}
                {age !== null && age >= 18 && (
                  <TabPanel p={{ base: 4, md: 8 }}>
                    <VStack spacing={6} align="stretch">
                      <Alert status="info" borderRadius="md">
                        <AlertIcon />
                        <Text fontSize="sm">
                          💼 {t('myProfile.visibleIfOver18')}
                        </Text>
                      </Alert>

                      <FormControl>
                        <FormLabel>{t('myProfile.professionalActivity')}</FormLabel>
                        <Input
                          value={profile.activity || ''}
                          onChange={(e) => setProfile({ ...profile, activity: e.target.value })}
                          size="lg"
                          _focus={{ borderColor: 'purple.400', borderWidth: '2px' }}
                        />
                        <FormHelperText fontSize="sm">
                          Ex: Ingénieur, Médecin, Enseignant, Retraité...
                        </FormHelperText>
                      </FormControl>
                    </VStack>
                  </TabPanel>
                )}

                {/* TAB 4: Parents */}
                {(profile.fatherName || profile.motherName) && (
                  <TabPanel p={{ base: 4, md: 8 }}>
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

                {/* TAB 5: Autres Informations */}
                <TabPanel p={{ base: 4, md: 8 }}>
                  <VStack spacing={6} align="stretch">
                    <FormControl>
                      <FormLabel>{t('myProfile.email')}</FormLabel>
                      <Input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        size="lg"
                        _focus={{ borderColor: 'purple.400', borderWidth: '2px' }}
                      />
                      <FormHelperText fontSize="sm">
                        📧 {t('myProfile.emailHelper')}
                      </FormHelperText>
                    </FormControl>

                    <FormControl>
                      <FormLabel>{t('myProfile.notesBio')}</FormLabel>
                      <Textarea
                        value={profile.notes || ''}
                        onChange={(e) => setProfile({ ...profile, notes: e.target.value })}
                        rows={6}
                        resize="vertical"
                        _focus={{ borderColor: 'purple.400', borderWidth: '2px' }}
                      />
                      <FormHelperText fontSize="sm">
                        📝 {t('myProfile.notesHelper')}
                      </FormHelperText>
                    </FormControl>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>

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
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  colorScheme="purple"
                  isLoading={saving}
                  loadingText={t('myProfile.saving')}
                  size="lg"
                  w={{ base: 'full', sm: 'auto' }}
                  minW="180px"
                  leftIcon={<Icon as={FaUserEdit} />}
                  boxShadow="lg"
                  _hover={{ transform: 'translateY(-2px)', boxShadow: '2xl' }}
                  transition="all 0.2s"
                >
                  {t('myProfile.saveChanges')}
                </Button>
              </HStack>
            </Box>
          </form>
        </Card>
      </Container>
    </Box>
  );
}
