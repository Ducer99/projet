import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  VStack,
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
  HStack,
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
  Badge
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaUserEdit, FaMale, FaFemale, FaCamera, FaSkullCrossbones } from 'react-icons/fa';
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

export default function MyProfile() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // États UX avancés
  const [age, setAge] = useState<number | null>(null);
  const [sameAsBirth, setSameAsBirth] = useState(false);
  const [birthCountry, setBirthCountry] = useState('');
  const [birthCity, setBirthCity] = useState('');
  const [residenceCountry, setResidenceCountry] = useState('');
  const [residenceCity, setResidenceCity] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  // 🎯 UX: Calcul automatique de l'âge (Nielsen #1 - Feedback immédiat)
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

  // 🎯 UX: Auto-capitalisation prénom (Nielsen #4 - Cohérence)
  const handleFirstNameChange = (value: string) => {
    const capitalized = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    setProfile(profile ? { ...profile, firstName: capitalized } : null);
  };

  // 🎯 UX: Auto-majuscules nom (Nielsen #4)
  const handleLastNameChange = (value: string) => {
    setProfile(profile ? { ...profile, lastName: value.toUpperCase() } : null);
  };

  // 🎯 UX: Gestion date naissance avec calcul âge
  const handleBirthDateChange = (value: string) => {
    setProfile(profile ? { ...profile, birthday: value } : null);
    if (value) {
      setAge(calculateAge(value));
    }
  };

  // 🎯 UX: Switch vivant/décédé (Norman - Mapping naturel)
  const handleAliveChange = (isDeceased: boolean) => {
    setProfile(profile ? {
      ...profile,
      alive: !isDeceased,
      deathDate: isDeceased ? profile.deathDate : undefined
    } : null);
  };

  // 🎯 UX: Checkbox "Même lieu de naissance" (Nielsen #7 - Efficacité)
  const handleSameAsBirthChange = (checked: boolean) => {
    setSameAsBirth(checked);
    if (checked) {
      setResidenceCountry(birthCountry);
      setResidenceCity(birthCity);
    }
  };

  // 🎯 UX: Upload photo depuis galerie (Norman - Visibilité)
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
      
      // Initialiser les champs UX
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

    // 🎯 UX: Validation champs obligatoires (Nielsen #5 - Prévention erreur)
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
      <Container maxW="container.md" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color="purple.500" />
          <Text>{t('myProfile.loadingProfile')}</Text>
        </VStack>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container maxW="container.md" py={8}>
        <Alert status="error">
          <AlertIcon />
          {t('myProfile.profileNotFound')}
        </Alert>
      </Container>
    );
  }

  return (
    <Box minH="100vh" bg="linear-gradient(135deg, #f5f7fa 0%, #e8f0e8 100%)" py={12}>
      <Container maxW="800px">
        {/* 🎨 CARTE DESIGN: Layout vertical centré, coins arrondis 24px */}
        <Card
          bg="linear-gradient(135deg, #fef5e7 0%, #f0f4f0 100%)"
          borderRadius="24px"
          boxShadow="2xl"
          overflow="hidden"
        >
          <CardBody p={8}>
            <VStack spacing={8} align="stretch">
              {/* 🎯 AVATAR avec halo de statut */}
              <VStack spacing={4}>
                <Box position="relative">
                  {/* Halo: Vert = vivant, Gris + ✝️ = décédé */}
                  <Box
                    position="absolute"
                    inset="-8px"
                    borderRadius="full"
                    bg={profile.alive ? 
                      "radial-gradient(circle, rgba(72, 187, 120, 0.3) 0%, transparent 70%)" : 
                      "radial-gradient(circle, rgba(160, 174, 192, 0.4) 0%, transparent 70%)"
                    }
                    filter="blur(12px)"
                  />
                  
                  {/* Photo de profil - 150px circulaire */}
                  <Avatar
                    size="2xl"
                    name={`${profile.firstName} ${profile.lastName}`}
                    src={profile.photoUrl || undefined}
                    bg={profile.alive ? "green.400" : "gray.400"}
                    boxSize="150px"
                    border="4px solid white"
                    cursor="pointer"
                    onClick={() => fileInputRef.current?.click()}
                    position="relative"
                    _hover={{ transform: 'scale(1.05)', transition: 'all 0.3s' }}
                  />
                  
                  {/* Icône caméra overlay */}
                  <Box
                    position="absolute"
                    bottom="8px"
                    right="8px"
                    bg="purple.500"
                    borderRadius="full"
                    p={2}
                    cursor="pointer"
                    onClick={() => fileInputRef.current?.click()}
                    _hover={{ bg: 'purple.600' }}
                  >
                    <Icon as={FaCamera} color="white" boxSize={4} />
                  </Box>
                  
                  {/* Input file caché */}
                  <Input
                    type="file"
                    accept="image/*"
                    display="none"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                  />
                  
                  {/* Badge décédé avec ✝️ et dates */}
                  {!profile.alive && (
                    <Badge
                      position="absolute"
                      top="-12px"
                      left="50%"
                      transform="translateX(-50%)"
                      colorScheme="gray"
                      fontSize="sm"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      <HStack spacing={1}>
                        <Icon as={FaSkullCrossbones} />
                        <Text>{t('myProfile.deceased')}</Text>
                      </HStack>
                    </Badge>
                  )}
                </Box>

                {/* Nom complet */}
                <VStack spacing={1}>
                  <Heading size="lg" color="gray.800" textAlign="center">
                    {profile.firstName} {profile.lastName}
                  </Heading>
                  {age !== null && (
                    <Text color="gray.600" fontSize="md">
                      {t('myProfile.yearsOld', { age })} {!profile.alive && profile.deathDate && (
                        <Text as="span" fontSize="sm" color="gray.500">
                          (†{new Date(profile.deathDate).getFullYear()})
                        </Text>
                      )}
                    </Text>
                  )}
                </VStack>
              </VStack>

              {/* Alerte de clarification */}
              <Alert
                status="info"
                variant="left-accent"
                borderRadius="lg"
                bg="purple.50"
                borderColor="purple.300"
              >
                <AlertIcon />
                <AlertDescription fontSize="sm">
                  <Text fontWeight="bold" mb={1}>👤 {t('myProfile.yourPersonalProfile')}</Text>
                  <Text>
                    {t('myProfile.aboutYouOnly')}{' '}
                    <strong>{t('myProfile.yourInfoOnly')}</strong>.{' '}
                    {t('myProfile.manageOthersGoToDashboard')}
                  </Text>
                </AlertDescription>
              </Alert>

              <Divider />

              {/* FORMULAIRE */}
              <form onSubmit={handleSubmit}>
                <VStack spacing={6} align="stretch">
                  {/* Informations de base */}
                  <Heading size="md" color="purple.600">
                    📋 {t('myProfile.basicInfo')}
                  </Heading>

                  <HStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>{t('myProfile.firstName')}</FormLabel>
                      <Input
                        value={profile.firstName}
                        onChange={(e) => handleFirstNameChange(e.target.value)}
                        borderColor={!profile.firstName ? 'red.500' : 'gray.200'}
                        borderWidth={!profile.firstName ? '2px' : '1px'}
                      />
                      <FormHelperText fontSize="xs">{t('myProfile.autoCapitalFirst')}</FormHelperText>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>{t('myProfile.lastName')}</FormLabel>
                      <Input
                        value={profile.lastName}
                        onChange={(e) => handleLastNameChange(e.target.value)}
                        borderColor={!profile.lastName ? 'red.500' : 'gray.200'}
                        borderWidth={!profile.lastName ? '2px' : '1px'}
                      />
                      <FormHelperText fontSize="xs">{t('myProfile.autoUppercase')}</FormHelperText>
                    </FormControl>
                  </HStack>

                  {/* Sexe - H/F uniquement */}
                  <FormControl isRequired>
                    <FormLabel>{t('myProfile.gender')}</FormLabel>
                    <RadioGroup
                      value={profile.sex}
                      onChange={(value) => setProfile({ ...profile, sex: value })}
                    >
                      <Stack direction="row" spacing={8}>
                        <Radio value="M">
                          <HStack>
                            <Icon as={FaMale} color="blue.500" />
                            <Text>👨 {t('myProfile.male')}</Text>
                          </HStack>
                        </Radio>
                        <Radio value="F">
                          <HStack>
                            <Icon as={FaFemale} color="pink.500" />
                            <Text>👩 {t('myProfile.female')}</Text>
                          </HStack>
                        </Radio>
                      </Stack>
                    </RadioGroup>
                    <FormHelperText fontSize="xs">{t('myProfile.claritySimplicity')}</FormHelperText>
                  </FormControl>

                  {/* Date de naissance OBLIGATOIRE */}
                  <FormControl isRequired>
                    <FormLabel>{t('myProfile.birthdate')}</FormLabel>
                    <Input
                      type="date"
                      value={profile.birthday}
                      onChange={(e) => handleBirthDateChange(e.target.value)}
                      borderColor={!profile.birthday ? 'red.500' : 'gray.200'}
                      borderWidth={!profile.birthday ? '2px' : '1px'}
                    />
                    <FormHelperText fontSize="xs" color="red.500">
                      {!profile.birthday && `⚠️ ${t('myProfile.requiredField')}`}
                    </FormHelperText>
                  </FormControl>

                  {/* Âge automatique (lecture seule) */}
                  {age !== null && (
                    <FormControl>
                      <FormLabel>{t('myProfile.age')}</FormLabel>
                      <Input
                        value={t('myProfile.yearsOld', { age })}
                        isReadOnly
                        bg="gray.50"
                        cursor="not-allowed"
                      />
                      <FormHelperText fontSize="xs">{t('myProfile.autoCalculated')}</FormHelperText>
                    </FormControl>
                  )}

                  {/* Switch Vivant / Décédé */}
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb={0}>{t('myProfile.isDeceased')}</FormLabel>
                    <Switch
                      isChecked={!profile.alive}
                      onChange={(e) => handleAliveChange(e.target.checked)}
                      colorScheme="gray"
                      size="lg"
                    />
                    <FormHelperText ml={4} fontSize="xs">
                      {t('myProfile.enableIfDeceased')}
                    </FormHelperText>
                  </FormControl>

                  {/* Date de décès (conditionnelle) */}
                  {!profile.alive && (
                    <FormControl>
                      <FormLabel>{t('myProfile.deathDate')}</FormLabel>
                      <Input
                        type="date"
                        value={profile.deathDate || ''}
                        onChange={(e) => setProfile({ ...profile, deathDate: e.target.value })}
                      />
                      <FormHelperText fontSize="xs">{t('myProfile.visibleOnlyIfDeceased')}</FormHelperText>
                    </FormControl>
                  )}

                  <Divider />

                  {/* Localisation */}
                  <Heading size="md" color="purple.600">
                    📍 {t('myProfile.location')}
                  </Heading>

                  <HStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>{t('myProfile.birthCountry')}</FormLabel>
                      <Input
                        value={birthCountry}
                        onChange={(e) => setBirthCountry(e.target.value)}
                        borderColor={!birthCountry ? 'red.500' : 'gray.200'}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>{t('myProfile.birthCity')}</FormLabel>
                      <Input
                        value={birthCity}
                        onChange={(e) => setBirthCity(e.target.value)}
                        borderColor={!birthCity ? 'red.500' : 'gray.200'}
                      />
                    </FormControl>
                  </HStack>

                  {/* Checkbox "Même lieu" */}
                  {profile.alive && (
                    <>
                      <Checkbox
                        isChecked={sameAsBirth}
                        onChange={(e) => handleSameAsBirthChange(e.target.checked)}
                        colorScheme="purple"
                      >
                        📍 {t('myProfile.stillInBirthPlace')}
                      </Checkbox>

                      {!sameAsBirth && (
                        <HStack spacing={4}>
                          <FormControl>
                            <FormLabel>{t('myProfile.residenceCountry')}</FormLabel>
                            <Input
                              value={residenceCountry}
                              onChange={(e) => setResidenceCountry(e.target.value)}
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel>{t('myProfile.residenceCity')}</FormLabel>
                            <Input
                              value={residenceCity}
                              onChange={(e) => setResidenceCity(e.target.value)}
                            />
                          </FormControl>
                        </HStack>
                      )}
                    </>
                  )}

                  <Divider />

                  {/* Profession (visible si âge ≥ 18) */}
                  {age !== null && age >= 18 && (
                    <>
                      <Heading size="md" color="purple.600">
                        💼 {t('myProfile.profession')}
                      </Heading>
                      <FormControl>
                        <FormLabel>{t('myProfile.professionalActivity')}</FormLabel>
                        <Input
                          value={profile.activity || ''}
                          onChange={(e) => setProfile({ ...profile, activity: e.target.value })}
                        />
                        <FormHelperText fontSize="xs">
                          {t('myProfile.visibleIfOver18')}
                        </FormHelperText>
                      </FormControl>
                    </>
                  )}

                  {/* Parents (lecture seule, liens cliquables) */}
                  {(profile.fatherName || profile.motherName) && (
                    <>
                      <Divider />
                      <Heading size="md" color="purple.600">
                        👨‍👩‍👦 {t('myProfile.parents')}
                      </Heading>
                      
                      <Alert status="info" variant="subtle" borderRadius="md">
                        <AlertIcon />
                        <Box>
                          <Text fontWeight="bold" mb={1}>
                            {profile.fatherName && `${t('myProfile.father')}: ${profile.fatherName}`}
                          </Text>
                          <Text fontWeight="bold">
                            {profile.motherName && `${t('myProfile.mother')}: ${profile.motherName}`}
                          </Text>
                          <Text fontSize="sm" mt={2} color="gray.600">
                            {t('myProfile.modifyParentsContactAdmin')}
                          </Text>
                        </Box>
                      </Alert>
                    </>
                  )}

                  {/* Autres informations */}
                  <Divider />
                  <Heading size="md" color="purple.600">
                    ℹ️ {t('myProfile.otherInfo')}
                  </Heading>

                  <FormControl>
                    <FormLabel>{t('myProfile.email')}</FormLabel>
                    <Input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>{t('myProfile.notesBio')}</FormLabel>
                    <Input
                      value={profile.notes || ''}
                      onChange={(e) => setProfile({ ...profile, notes: e.target.value })}
                    />
                  </FormControl>

                  {/* Boutons d'action */}
                  <HStack spacing={4} pt={6}>
                    <Button
                      variant="outline"
                      colorScheme="gray"
                      onClick={() => navigate('/dashboard')}
                      flex={1}
                      size="lg"
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                      type="submit"
                      colorScheme="purple"
                      isLoading={saving}
                      loadingText={t('myProfile.saving')}
                      flex={1}
                      size="lg"
                      leftIcon={<Icon as={FaUserEdit} />}
                    >
                      {t('myProfile.saveChanges')}
                    </Button>
                  </HStack>
                </VStack>
              </form>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
}
