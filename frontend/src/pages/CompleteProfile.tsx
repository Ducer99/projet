import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Heading,
  Text,
  Alert,
  AlertIcon,
  AlertDescription,
  Radio,
  RadioGroup,
  Stack,
  useToast,
  Progress,
  Divider,
  Icon,
  Avatar,
  Switch,
  Checkbox,
  FormHelperText,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { FaUser, FaMale, FaFemale, FaCamera } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

export default function CompleteProfile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 📋 Informations de base
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  
  // 🏥 Statut vital
  const [alive, setAlive] = useState(true);
  const [deathDate, setDeathDate] = useState('');
  const [age, setAge] = useState<number | null>(null);
  
  // 📍 Localisation naissance
  const [birthCountry, setBirthCountry] = useState('');
  const [birthCity, setBirthCity] = useState('');
  
  // 🏠 Résidence (conditionnelle si vivant)
  const [residenceCountry, setResidenceCountry] = useState('');
  const [residenceCity, setResidenceCity] = useState('');
  const [sameAsBirth, setSameAsBirth] = useState(false);
  
  // 💼 Profession (conditionnelle si âge ≥ 18)
  const [activity, setActivity] = useState('');
  
  // 👨‍👩‍👦 Informations parents (optionnel)
  const [fatherFirstName, setFatherFirstName] = useState('');
  const [fatherLastName, setFatherLastName] = useState('');
  const [motherFirstName, setMotherFirstName] = useState('');
  const [motherLastName, setMotherLastName] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  // 🎯 UX: Calcul automatique de l'âge
  const calculateAge = (birthDateValue: string): number => {
    const today = new Date();
    const birth = new Date(birthDateValue);
    let calculatedAge = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      calculatedAge--;
    }
    return calculatedAge;
  };

  // 🎯 UX: Auto-capitalisation prénom (Nielsen #4)
  const handleFirstNameChange = (value: string) => {
    const capitalized = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    setFirstName(capitalized);
  };

  // 🎯 UX: Auto-majuscules nom
  const handleLastNameChange = (value: string) => {
    setLastName(value.toUpperCase());
  };

  // 🎯 UX: Date naissance avec calcul âge automatique
  const handleBirthDateChange = (value: string) => {
    setBirthDate(value);
    if (value) {
      const calculatedAge = calculateAge(value);
      setAge(calculatedAge);
    } else {
      setAge(null);
    }
  };

  // 🎯 UX: Switch vivant/décédé
  const handleAliveChange = (isDeceased: boolean) => {
    setAlive(!isDeceased);
    if (!isDeceased) {
      setDeathDate(''); // Réinitialiser date décès si vivant
    }
  };

  // 🎯 UX: Checkbox "Même lieu de naissance"
  const handleSameAsBirthChange = (checked: boolean) => {
    setSameAsBirth(checked);
    if (checked) {
      setResidenceCountry(birthCountry);
      setResidenceCity(birthCity);
    }
  };

  // 🎯 UX: Upload photo depuis galerie
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      toast({
        title: t('profile.photoUploaded'),
        description: t('profile.photoUploadedSuccess'),
        status: 'success',
        duration: 2000,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🎯 Validation champs obligatoires
    if (!firstName || !lastName || !gender || !birthDate || !birthCountry || !birthCity) {
      toast({
        title: t('profile.missingRequiredFields'),
        description: t('profile.requiredFieldsList'),
        status: 'error',
        duration: 4000,
      });
      return;
    }

    setIsLoading(true);

    try {
      const payload: any = {
        firstName,
        lastName,
        gender: gender.toUpperCase(),
        birthDate: birthDate ? new Date(birthDate).toISOString() : null,
        birthCountry,
        birthCity,
        activity: activity || null,
        photoUrl: photoUrl || null,
        phone: phone || null,
        // 👨‍👩‍👦 Informations parents (optionnel)
        fatherFirstName: fatherFirstName || null,
        fatherLastName: fatherLastName || null,
        motherFirstName: motherFirstName || null,
        motherLastName: motherLastName || null,
      };

      const response = await api.post('/auth/complete-profile', payload);
      const { token, isActive } = response.data;
      localStorage.setItem('token', token);

      toast({
        title: t('profile.profileCompleted'),
        description: isActive ? t('profile.accountActivated') : t('profile.profileSaved'),
        status: 'success',
        duration: 3000,
      });

      navigate('/family-attachment');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || t('profile.profileCompletionError');
      toast({
        title: t('common.error'),
        description: errorMessage,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" bgGradient="linear(to-br, purple.600, purple.800)" py={12}>
      <Container maxW="3xl">
        <Card bg="white" borderRadius="2xl" boxShadow="2xl" overflow="hidden">
          <CardBody p={8}>
            <VStack spacing={6} align="stretch">
              {/* En-tête */}
              <Box textAlign="center">
                <Icon as={FaUser} boxSize={12} color="purple.600" mb={4} />
                <Heading size="xl" color="purple.800" mb={2}>
                  {t('profile.completeYourProfile')}
                </Heading>
                <Text color="gray.600">
                  {t('profile.enterPersonalInfo')}
                </Text>
              </Box>

              <Progress value={33} colorScheme="purple" borderRadius="full" />

              {/* Alerte informative */}
              <Alert status="info" borderRadius="md" variant="left-accent">
                <AlertIcon />
                <AlertDescription fontSize="sm">
                  <Text fontWeight="bold" mb={1}>{t('profile.yourPersonalProfile')}</Text>
                  <Text>
                    {t('profile.thisStepConcernsYou')}
                  </Text>
                </AlertDescription>
              </Alert>

              <form onSubmit={handleSubmit}>
                <VStack spacing={6} align="stretch">
                  {/* Photo de profil */}
                  <FormControl>
                    <FormLabel textAlign="center">{t('profile.profilePicture')}</FormLabel>
                    <VStack spacing={3}>
                      <Avatar
                        size="2xl"
                        name={`${firstName} ${lastName}`}
                        src={photoUrl || undefined}
                        bg="purple.400"
                        cursor="pointer"
                        onClick={() => fileInputRef.current?.click()}
                        _hover={{ transform: 'scale(1.05)', transition: 'all 0.3s' }}
                      />
                      <Button
                        size="sm"
                        leftIcon={<Icon as={FaCamera} />}
                        onClick={() => fileInputRef.current?.click()}
                        colorScheme="purple"
                        variant="outline"
                      >
                        {t('profile.choosePhoto')}
                      </Button>
                      <Input
                        type="file"
                        accept="image/*"
                        display="none"
                        ref={fileInputRef}
                        onChange={handlePhotoUpload}
                      />
                      <FormHelperText fontSize="xs" textAlign="center">
                        {t('profile.onePhotoFromGallery')}
                      </FormHelperText>
                    </VStack>
                  </FormControl>

                  <Divider />

                  {/* Informations de base */}
                  <Heading size="md" color="purple.600">
                    {t('profile.basicInformation')}
                  </Heading>

                  <HStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>{t('profile.firstName')}</FormLabel>
                      <Input
                        value={firstName}
                        onChange={(e) => handleFirstNameChange(e.target.value)}
                        borderColor={!firstName ? 'red.500' : 'gray.200'}
                        borderWidth={!firstName ? '2px' : '1px'}
                      />
                      <FormHelperText fontSize="xs">{t('profile.autoCapitalize')}</FormHelperText>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>{t('profile.lastName')}</FormLabel>
                      <Input
                        value={lastName}
                        onChange={(e) => handleLastNameChange(e.target.value)}
                        borderColor={!lastName ? 'red.500' : 'gray.200'}
                        borderWidth={!lastName ? '2px' : '1px'}
                      />
                      <FormHelperText fontSize="xs">{t('profile.autoUppercase')}</FormHelperText>
                    </FormControl>
                  </HStack>

                  {/* Sexe - H/F uniquement */}
                  <FormControl isRequired>
                    <FormLabel>{t('profile.gender')}</FormLabel>
                    <RadioGroup value={gender} onChange={setGender}>
                      <Stack direction="row" spacing={8}>
                        <Radio value="M">
                          <HStack>
                            <Icon as={FaMale} color="blue.500" />
                            <Text>{t('profile.male')}</Text>
                          </HStack>
                        </Radio>
                        <Radio value="F">
                          <HStack>
                            <Icon as={FaFemale} color="pink.500" />
                            <Text>{t('profile.female')}</Text>
                          </HStack>
                        </Radio>
                      </Stack>
                    </RadioGroup>
                    <FormHelperText fontSize="xs">{t('profile.clarityAndSimplicity')}</FormHelperText>
                  </FormControl>

                  {/* Date de naissance OBLIGATOIRE */}
                  <FormControl isRequired>
                    <FormLabel>{t('profile.birthDate')}</FormLabel>
                    <Input
                      type="date"
                      value={birthDate}
                      onChange={(e) => handleBirthDateChange(e.target.value)}
                      borderColor={!birthDate ? 'red.500' : 'gray.200'}
                      borderWidth={!birthDate ? '2px' : '1px'}
                      max={new Date().toISOString().split('T')[0]}
                    />
                    {!birthDate && (
                      <FormHelperText fontSize="xs" color="red.500">
                        {t('profile.requiredField')}
                      </FormHelperText>
                    )}
                  </FormControl>

                  {/* Âge automatique (lecture seule) */}
                  {age !== null && (
                    <FormControl>
                      <FormLabel>{t('profile.age')}</FormLabel>
                      <Input
                        value={t('profile.yearsOld', { count: age })}
                        isReadOnly
                        bg="gray.50"
                        cursor="not-allowed"
                      />
                      <FormHelperText fontSize="xs">{t('profile.calculatedAutomatically')}</FormHelperText>
                    </FormControl>
                  )}

                  {/* Numéro de téléphone */}
                  <FormControl>
                    <FormLabel>{t('profile.phoneNumber')}</FormLabel>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <FormHelperText fontSize="xs">{t('profile.internationalFormat')}</FormHelperText>
                  </FormControl>

                  {/* Switch Vivant / Décédé */}
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb={0}>{t('profile.deceased')}</FormLabel>
                    <Switch
                      isChecked={!alive}
                      onChange={(e) => handleAliveChange(e.target.checked)}
                      colorScheme="gray"
                      size="lg"
                    />
                    <FormHelperText ml={4} fontSize="xs">
                      {t('profile.enableIfDeceased')}
                    </FormHelperText>
                  </FormControl>

                  {/* Date de décès (conditionnelle) */}
                  {!alive && (
                    <FormControl>
                      <FormLabel>{t('profile.deathDate')}</FormLabel>
                      <Input
                        type="date"
                        value={deathDate}
                        onChange={(e) => setDeathDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                      />
                      <FormHelperText fontSize="xs">{t('profile.visibleIfDeceased')}</FormHelperText>
                    </FormControl>
                  )}

                  <Divider />

                  {/* Localisation naissance */}
                  <Heading size="md" color="purple.600">
                    {t('profile.birthPlace')}
                  </Heading>

                  <HStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>{t('profile.birthCountry')}</FormLabel>
                      <Input
                        value={birthCountry}
                        onChange={(e) => setBirthCountry(e.target.value)}
                        borderColor={!birthCountry ? 'red.500' : 'gray.200'}
                        borderWidth={!birthCountry ? '2px' : '1px'}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>{t('profile.birthCity')}</FormLabel>
                      <Input
                        value={birthCity}
                        onChange={(e) => setBirthCity(e.target.value)}
                        borderColor={!birthCity ? 'red.500' : 'gray.200'}
                        borderWidth={!birthCity ? '2px' : '1px'}
                      />
                    </FormControl>
                  </HStack>

                  {/* Résidence (visible si vivant) */}
                  {alive && (
                    <>
                      <Divider />
                      <Heading size="md" color="purple.600">
                        {t('profile.currentResidence')}
                      </Heading>

                      <Checkbox
                        isChecked={sameAsBirth}
                        onChange={(e) => handleSameAsBirthChange(e.target.checked)}
                        colorScheme="purple"
                      >
                        {t('profile.sameAsBirthPlace')}
                      </Checkbox>

                      {!sameAsBirth && (
                        <HStack spacing={4}>
                          <FormControl>
                            <FormLabel>{t('profile.residenceCountry')}</FormLabel>
                            <Input
                              value={residenceCountry}
                              onChange={(e) => setResidenceCountry(e.target.value)}
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel>{t('profile.residenceCity')}</FormLabel>
                            <Input
                              value={residenceCity}
                              onChange={(e) => setResidenceCity(e.target.value)}
                            />
                          </FormControl>
                        </HStack>
                      )}
                    </>
                  )}

                  {/* Profession (visible si âge ≥ 18) */}
                  {age !== null && age >= 18 && (
                    <>
                      <Divider />
                      <Heading size="md" color="purple.600">
                        {t('profile.profession')}
                      </Heading>

                      <FormControl>
                        <FormLabel>{t('profile.professionalActivity')}</FormLabel>
                        <Input
                          value={activity}
                          onChange={(e) => setActivity(e.target.value)}
                        />
                        <FormHelperText fontSize="xs">
                          {t('profile.visibleIfAdult')}
                        </FormHelperText>
                      </FormControl>
                    </>
                  )}

                  {/* 👨‍👩‍👦 Informations Parents (Optionnel) */}
                  <Divider />
                  <Heading size="md" color="purple.600">
                    {t('profile.parentsInfo')} <Text as="span" fontSize="sm" color="gray.500">({t('common.optional')})</Text>
                  </Heading>

                  <Alert status="info" borderRadius="md" variant="left-accent">
                    <AlertIcon />
                    <AlertDescription fontSize="sm">
                      <Text fontWeight="bold" mb={1}>{t('profile.parentsInfoTitle')}</Text>
                      <Text>
                        {t('profile.parentsInfoDescription')}
                      </Text>
                    </AlertDescription>
                  </Alert>

                  {/* Père */}
                  <Card variant="outline" borderColor="blue.200">
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        <HStack>
                          <Icon as={FaMale} color="blue.500" boxSize={5} />
                          <Heading size="sm" color="blue.700">{t('profile.father')}</Heading>
                        </HStack>
                        <HStack spacing={4}>
                          <FormControl>
                            <FormLabel fontSize="sm">{t('profile.firstName')}</FormLabel>
                            <Input
                              value={fatherFirstName}
                              onChange={(e) => setFatherFirstName(e.target.value)}
                              size="sm"
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize="sm">{t('profile.lastName')}</FormLabel>
                            <Input
                              value={fatherLastName}
                              onChange={(e) => setFatherLastName(e.target.value)}
                              size="sm"
                            />
                          </FormControl>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Mère */}
                  <Card variant="outline" borderColor="pink.200">
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        <HStack>
                          <Icon as={FaFemale} color="pink.500" boxSize={5} />
                          <Heading size="sm" color="pink.700">{t('profile.mother')}</Heading>
                        </HStack>
                        <HStack spacing={4}>
                          <FormControl>
                            <FormLabel fontSize="sm">{t('profile.firstName')}</FormLabel>
                            <Input
                              value={motherFirstName}
                              onChange={(e) => setMotherFirstName(e.target.value)}
                              size="sm"
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize="sm">{t('profile.lastName')}</FormLabel>
                            <Input
                              value={motherLastName}
                              onChange={(e) => setMotherLastName(e.target.value)}
                              size="sm"
                            />
                          </FormControl>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Alert prochaine étape */}
                  <Alert status="success" borderRadius="md" variant="subtle">
                    <AlertIcon />
                    <Box>
                      <Text fontWeight="bold">{t('profile.nextStepTitle')}</Text>
                      <Text fontSize="sm">
                        {t('profile.nextStepDescription')}
                      </Text>
                    </Box>
                  </Alert>

                  {/* Boutons */}
                  <HStack spacing={4} pt={4}>
                    <Button
                      variant="outline"
                      colorScheme="gray"
                      onClick={() => navigate('/login')}
                      flex={1}
                      size="lg"
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                      type="submit"
                      colorScheme="purple"
                      isLoading={isLoading}
                      loadingText={t('profile.saving')}
                      flex={1}
                      size="lg"
                    >
                      {t('profile.continue')}
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
