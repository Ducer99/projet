import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Link as ChakraLink,
  Flex,
  Icon,
  HStack,
  Divider,
  Progress,
  Radio,
  RadioGroup,
  Stack,
  Tooltip,
} from '@chakra-ui/react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaUsers, FaArrowLeft, FaGoogle, FaHome, FaCheck } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const MotionBox = motion(Box);

const Register = () => {
  // États du formulaire
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [sex, setSex] = useState<'M' | 'F'>('M');
  const [actionChoice, setActionChoice] = useState<'create' | 'join'>('create');
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();

  const totalSteps = 3;

  // Navigation entre les étapes
  const handleNext = () => {
    // Validation Step 1
    if (currentStep === 1) {
      if (!email || !password || !confirmPassword) {
        toast({
          title: t('common.error'),
          description: 'Veuillez remplir tous les champs',
          status: 'error',
          duration: 3000,
        });
        return;
      }
      if (password !== confirmPassword) {
        toast({
          title: t('common.error'),
          description: t('auth.passwordMismatch'),
          status: 'error',
          duration: 3000,
        });
        return;
      }
      if (password.length < 6) {
        toast({
          title: t('common.error'),
          description: t('auth.passwordMinLength'),
          status: 'error',
          duration: 3000,
        });
        return;
      }
    }

    // Validation Step 2
    if (currentStep === 2) {
      if (!firstName || !lastName) {
        toast({
          title: t('common.error'),
          description: 'Veuillez remplir votre nom et prénom',
          status: 'error',
          duration: 3000,
        });
        return;
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation Step 3
    if (actionChoice === 'create' && !familyName) {
      toast({
        title: t('common.error'),
        description: 'Veuillez entrer le nom de la famille',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (actionChoice === 'join' && !inviteCode) {
      toast({
        title: t('common.error'),
        description: 'Veuillez entrer le code d\'invitation',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔵 Step 1: Creating temporary account with register-simple...');
      
      // ✅ Étape 1: Créer compte temporaire avec register-simple
      const registerResponse = await api.post('/auth/register-simple', {
        email,
        password,
        userName: `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
      });

      if (registerResponse.data.token) {
        localStorage.setItem('token', registerResponse.data.token);
        console.log('✅ Token saved, user authenticated');
      }

      console.log('🔵 Step 2: Completing profile...');
      console.log('📤 Sending profile data:', {
        firstName,
        lastName,
        sex,
        sexType: typeof sex,
        sexLength: sex.length,
        dateOfBirth: null,
        birthCity: '',
        birthCountry: '',
        activity: '',
      });
      
      // ✅ Étape 2: Compléter le profil (créer Person)
      const profileResponse = await api.post('/auth/complete-profile', {
        firstName,
        lastName,
        sex,
        dateOfBirth: null,
        birthCity: '', // Optionnel
        birthCountry: '', // Optionnel
        activity: '', // Optionnel
      });

      console.log('✅ Profile completed');
      console.log('📥 Profile response:', profileResponse.data);
      console.log('🔵 Step 3: Creating/joining family...');

      // ✅ Étape 3: Créer ou rejoindre la famille
      if (actionChoice === 'create') {
        console.log('🔵 Creating family...');
        console.log('📤 Token in localStorage:', localStorage.getItem('token') ? 'PRESENT ✅' : 'MISSING ❌');
        await api.post('/families/create', { familyName });
        console.log('✅ Family created:', familyName);
        toast({
          title: '✅ Compte créé !',
          description: `Bienvenue dans la famille ${familyName}`,
          status: 'success',
          duration: 3000,
        });
      } else {
        console.log('🔵 Joining family with code:', inviteCode.toUpperCase());
        console.log('📤 Token in localStorage:', localStorage.getItem('token') ? 'PRESENT ✅' : 'MISSING ❌');
        console.log('📤 Full token (first 20 chars):', localStorage.getItem('token')?.substring(0, 20));
        
        await api.post('/families/join', { inviteCode: inviteCode.toUpperCase() });
        console.log('✅ Family joined with code:', inviteCode);
        toast({
          title: '✅ Compte créé !',
          description: 'Vous avez rejoint la famille avec succès',
          status: 'success',
          duration: 3000,
        });
      }

      // Rediriger vers le dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        t('auth.errorOccurred');

      toast({
        title: t('auth.registerError'),
        description: errorMessage,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ⏸️ EN PAUSE - Gestion de l'inscription Google OAuth
  /*
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast({
        title: t('auth.error'),
        description: 'Token Google manquant',
        status: 'error',
        duration: 5000,
      });
      return;
    }

    setIsLoading(true);

    try {
      // Envoyer le token Google au backend pour validation et auto-register
      const response = await api.post('/auth/google', {
        token: credentialResponse.credential,
      });

      // Sauvegarder le token JWT et les infos utilisateur
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      toast({
        title: '✅ Inscription Google réussie',
        description: 'Bienvenue ! Choisissons votre famille...',
        status: 'success',
        duration: 3000,
      });

      // Les utilisateurs Google n'ont pas de FamilyID par défaut
      // Rediriger vers la page de choix famille améliorée
      setTimeout(() => {
        navigate('/family-attachment');
      }, 1500);
    } catch (error: any) {
      toast({
        title: t('auth.error'),
        description: error.response?.data?.message || 'Erreur lors de l\'inscription Google',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast({
      title: t('auth.error'),
      description: 'Échec de l\'inscription Google',
      status: 'error',
      duration: 5000,
    });
  };
  */

  // Variants d'animation
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <Flex minH="100vh" overflow="hidden">
      {/* Partie Gauche - Image avec Overlay */}
      <Box
        flex="1"
        position="relative"
        display={{ base: 'none', md: 'block' }}
        bgImage="url('https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=2070&auto=format&fit=crop')"
        bgSize="cover"
        bgPosition="center"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgGradient: 'linear(to-br, rgba(139, 92, 246, 0.85), rgba(99, 102, 241, 0.75))',
        }}
      >
        {/* Contenu sur l'image */}
        <Flex
          position="relative"
          zIndex={1}
          h="100%"
          direction="column"
          justify="center"
          align="center"
          px={12}
          color="white"
        >
          {/* Logo */}
          <HStack spacing={3} mb={8}>
            <Icon as={FaUsers} boxSize={12} />
            <Heading size="2xl" fontWeight="bold">
              Kinship Haven
            </Heading>
          </HStack>

          {/* Phrase d'accroche */}
          <Text
            fontSize="2xl"
            fontWeight="medium"
            textAlign="center"
            maxW="500px"
            lineHeight="tall"
            textShadow="0 2px 10px rgba(0,0,0,0.2)"
          >
            {t('register.hero.tagline')}
          </Text>

          {/* Statistiques ou features */}
          <HStack spacing={12} mt={12}>
            <VStack spacing={1}>
              <Text fontSize="3xl" fontWeight="bold">10,000+</Text>
              <Text fontSize="sm" opacity={0.9}>{t('register.hero.families')}</Text>
            </VStack>
            <VStack spacing={1}>
              <Text fontSize="3xl" fontWeight="bold">50,000+</Text>
              <Text fontSize="sm" opacity={0.9}>{t('register.hero.members')}</Text>
            </VStack>
            <VStack spacing={1}>
              <Text fontSize="3xl" fontWeight="bold">100+</Text>
              <Text fontSize="sm" opacity={0.9}>{t('register.hero.countries')}</Text>
            </VStack>
          </HStack>
        </Flex>
      </Box>

      {/* Partie Droite - Formulaire avec Stepper */}
      <Flex
        flex="1"
        bg="white"
        align="center"
        justify="center"
        px={{ base: 6, md: 12 }}
        py={8}
        position="relative"
      >
        <VStack spacing={8} w="100%" maxW="440px">
          {/* Bouton Retour (si step > 1) */}
          {currentStep > 1 && (
            <HStack w="100%" justify="flex-start">
              <Button
                variant="ghost"
                leftIcon={<Icon as={FaArrowLeft} />}
                onClick={handleBack}
                size="sm"
                color="gray.600"
                _hover={{ bg: 'gray.100' }}
              >
                {t('common.back')}
              </Button>
            </HStack>
          )}

          {/* Barre de Progression */}
          <VStack w="100%" spacing={3}>
            <HStack w="100%" justify="space-between">
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                {t('register.progress.step')} {currentStep} {t('register.progress.of')} {totalSteps}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {Math.round((currentStep / totalSteps) * 100)}%
              </Text>
            </HStack>
            <Progress
              value={(currentStep / totalSteps) * 100}
              w="100%"
              h="2px"
              borderRadius="full"
              colorScheme="purple"
              bg="gray.200"
            />
          </VStack>

          {/* En-tête dynamique */}
          <VStack spacing={2} w="100%" align="flex-start">
            <Heading size="xl" color="gray.800" fontWeight="bold">
              {currentStep === 1 && t('register.step1.title')}
              {currentStep === 2 && t('register.step2.title')}
              {currentStep === 3 && t('register.step3.title')}
            </Heading>
            <Text color="gray.600" fontSize="md">
              {currentStep === 1 && t('register.step1.subtitle')}
              {currentStep === 2 && t('register.step2.subtitle')}
              {currentStep === 3 && t('register.step3.subtitle')}
            </Text>
          </VStack>

          {/* Container animé pour les steps */}
          <Box w="100%" position="relative" minH="400px">
            <AnimatePresence mode="wait" custom={1}>
              {/* STEP 1 - Compte */}
              {currentStep === 1 && (
                <MotionBox
                  key="step1"
                  custom={1}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                w="100%"
              >
                <VStack spacing={6} w="100%">
                  {/* Bouton Google OAuth - Visible mais désactivé (en développement) */}
                  <Tooltip 
                    label={t('register.googleComingSoon')}
                    placement="top"
                    hasArrow
                    bg="purple.600"
                  >
                    <Box w="100%">
                      <Button
                        w="100%"
                        h="48px"
                        bg="white"
                        border="1px solid"
                        borderColor="gray.300"
                        color="gray.500"
                        leftIcon={<Icon as={FaGoogle} />}
                        fontSize="md"
                        fontWeight="500"
                        isDisabled={true}
                        cursor="not-allowed"
                        opacity={0.6}
                        _hover={{ bg: 'white' }}
                      >
                        {t('register.signUpWithGoogle')}
                      </Button>
                    </Box>
                  </Tooltip>

                  {/* Divider */}
                  <HStack w="100%" spacing={4}>
                    <Divider borderColor="gray.300" />
                    <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
                      {t('register.orWithEmail')}
                    </Text>
                    <Divider borderColor="gray.300" />
                  </HStack>

                    {/* Champs Step 1 - SANS placeholders */}
                    <VStack spacing={4} w="100%">
                      <FormControl isRequired>
                        <FormLabel color="gray.700" fontWeight="medium" fontSize="sm">
                          {t('auth.email')}
                        </FormLabel>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder=""
                          h="48px"
                          borderRadius="8px"
                          borderColor="gray.300"
                          _hover={{ borderColor: 'gray.400' }}
                          _focus={{
                            borderColor: 'primary.500',
                            boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
                          }}
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel color="gray.700" fontWeight="medium" fontSize="sm">
                          {t('auth.password')}
                        </FormLabel>
                        <Input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder=""
                          h="48px"
                          borderRadius="8px"
                          borderColor="gray.300"
                          _hover={{ borderColor: 'gray.400' }}
                          _focus={{
                            borderColor: 'primary.500',
                            boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
                          }}
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel color="gray.700" fontWeight="medium" fontSize="sm">
                          {t('auth.confirmPassword')}
                        </FormLabel>
                        <Input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder=""
                          h="48px"
                          borderRadius="8px"
                          borderColor="gray.300"
                          _hover={{ borderColor: 'gray.400' }}
                          _focus={{
                            borderColor: 'primary.500',
                            boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
                          }}
                        />
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          {t('auth.atLeast6Characters')}
                        </Text>
                      </FormControl>

                      <Button
                        w="100%"
                        h="48px"
                        bgGradient="linear(to-r, primary.500, secondary.500)"
                        color="white"
                        fontWeight="semibold"
                        borderRadius="8px"
                        onClick={handleNext}
                        _hover={{
                          bgGradient: 'linear(to-r, primary.600, secondary.600)',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 8px 16px rgba(139, 92, 246, 0.3)',
                        }}
                        _active={{
                          transform: 'translateY(0)',
                        }}
                        transition="all 0.2s"
                      >
                        {t('common.next')}
                      </Button>
                    </VStack>
                  </VStack>
                </MotionBox>
              )}

              {/* STEP 2 - Profil */}
              {currentStep === 2 && (
                <MotionBox
                  key="step2"
                  custom={1}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  w="100%"
                >
                  <VStack spacing={6} w="100%">
                    <FormControl isRequired>
                      <FormLabel color="gray.700" fontWeight="medium" fontSize="sm">
                        {t('register.step2.firstName')}
                      </FormLabel>
                      <Input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder=""
                        h="48px"
                        borderRadius="8px"
                        borderColor="gray.300"
                        _hover={{ borderColor: 'gray.400' }}
                        _focus={{
                          borderColor: 'primary.500',
                          boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
                        }}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color="gray.700" fontWeight="medium" fontSize="sm">
                        {t('register.step2.lastName')}
                      </FormLabel>
                      <Input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder=""
                        h="48px"
                        borderRadius="8px"
                        borderColor="gray.300"
                        _hover={{ borderColor: 'gray.400' }}
                        _focus={{
                          borderColor: 'primary.500',
                          boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
                        }}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color="gray.700" fontWeight="medium" fontSize="sm">
                        {t('register.step2.gender')}
                      </FormLabel>
                      <RadioGroup value={sex} onChange={(val) => setSex(val as 'M' | 'F')}>
                        <Stack direction="row" spacing={6}>
                          <Radio value="M" colorScheme="purple" size="lg">
                            <Text color="gray.700">{t('register.step2.male')}</Text>
                          </Radio>
                          <Radio value="F" colorScheme="purple" size="lg">
                            <Text color="gray.700">{t('register.step2.female')}</Text>
                          </Radio>
                        </Stack>
                      </RadioGroup>
                    </FormControl>

                    <Button
                      w="100%"
                      h="48px"
                      bgGradient="linear(to-r, primary.500, secondary.500)"
                      color="white"
                      fontWeight="semibold"
                      borderRadius="8px"
                      onClick={handleNext}
                      _hover={{
                        bgGradient: 'linear(to-r, primary.600, secondary.600)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 8px 16px rgba(139, 92, 246, 0.3)',
                      }}
                      _active={{
                        transform: 'translateY(0)',
                      }}
                      transition="all 0.2s"
                    >
                      {t('common.next')}
                    </Button>
                  </VStack>
                </MotionBox>
              )}

              {/* STEP 3 - Action */}
              {currentStep === 3 && (
                <MotionBox
                  key="step3"
                  custom={1}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  w="100%"
                >
                  <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                    <VStack spacing={6} w="100%">
                      <FormControl isRequired>
                        <FormLabel color="gray.700" fontWeight="medium" fontSize="sm" mb={4}>
                          {t('register.step3.question')}
                        </FormLabel>
                        <RadioGroup
                          value={actionChoice}
                          onChange={(val) => setActionChoice(val as 'create' | 'join')}
                        >
                          <VStack spacing={3} align="stretch">
                            {/* CARTE CRÉER - Design Premium */}
                            <Box
                              position="relative"
                              p={5}
                              borderWidth="2px"
                              borderRadius="12px"
                              borderColor={actionChoice === 'create' ? '#7C3AED' : 'gray.300'}
                              bg={actionChoice === 'create' ? '#F5F3FF' : 'white'}
                              cursor="pointer"
                              onClick={() => setActionChoice('create')}
                              transition="all 0.2s ease-in-out"
                              _hover={{ 
                                borderColor: '#7C3AED',
                                transform: 'translateY(-2px)',
                                boxShadow: actionChoice === 'create' 
                                  ? '0 8px 20px rgba(124, 58, 237, 0.25)'
                                  : '0 4px 12px rgba(124, 58, 237, 0.15)'
                              }}
                              boxShadow={actionChoice === 'create' 
                                ? '0 4px 16px rgba(124, 58, 237, 0.2)'
                                : 'none'
                              }
                            >
                              {/* Icône Check dans coin supérieur droit */}
                              {actionChoice === 'create' && (
                                <Flex
                                  position="absolute"
                                  top="12px"
                                  right="12px"
                                  w="24px"
                                  h="24px"
                                  bg="#7C3AED"
                                  borderRadius="full"
                                  align="center"
                                  justify="center"
                                  boxShadow="0 2px 8px rgba(124, 58, 237, 0.3)"
                                >
                                  <Icon as={FaCheck} color="white" boxSize={3} />
                                </Flex>
                              )}

                              {/* Contenu de la carte - SANS radio visible */}
                              <HStack spacing={4} align="flex-start" w="100%">
                                <Flex
                                  w="48px"
                                  h="48px"
                                  bg={actionChoice === 'create' ? '#7C3AED' : 'gray.100'}
                                  borderRadius="12px"
                                  align="center"
                                  justify="center"
                                  flexShrink={0}
                                  transition="all 0.2s"
                                >
                                  <Icon 
                                    as={FaHome} 
                                    boxSize={5} 
                                    color={actionChoice === 'create' ? 'white' : 'gray.600'}
                                  />
                                </Flex>
                                <VStack align="flex-start" spacing={1} flex={1}>
                                  <Text fontWeight="bold" color="gray.800" fontSize="md">
                                    {t('register.step3.createTitle')}
                                  </Text>
                                  <Text fontSize="sm" color="gray.600">
                                    {t('register.step3.createDesc')}
                                  </Text>
                                </VStack>
                              </HStack>
                              
                              {/* Radio caché mais fonctionnel */}
                              <Radio 
                                value="create" 
                                position="absolute" 
                                opacity={0} 
                                pointerEvents="none"
                              />
                            </Box>

                            {/* CARTE REJOINDRE - Design Premium */}
                            <Box
                              position="relative"
                              p={5}
                              borderWidth="2px"
                              borderRadius="12px"
                              borderColor={actionChoice === 'join' ? '#7C3AED' : 'gray.300'}
                              bg={actionChoice === 'join' ? '#F5F3FF' : 'white'}
                              cursor="pointer"
                              onClick={() => setActionChoice('join')}
                              transition="all 0.2s ease-in-out"
                              _hover={{ 
                                borderColor: '#7C3AED',
                                transform: 'translateY(-2px)',
                                boxShadow: actionChoice === 'join' 
                                  ? '0 8px 20px rgba(124, 58, 237, 0.25)'
                                  : '0 4px 12px rgba(124, 58, 237, 0.15)'
                              }}
                              boxShadow={actionChoice === 'join' 
                                ? '0 4px 16px rgba(124, 58, 237, 0.2)'
                                : 'none'
                              }
                            >
                              {/* Icône Check dans coin supérieur droit */}
                              {actionChoice === 'join' && (
                                <Flex
                                  position="absolute"
                                  top="12px"
                                  right="12px"
                                  w="24px"
                                  h="24px"
                                  bg="#7C3AED"
                                  borderRadius="full"
                                  align="center"
                                  justify="center"
                                  boxShadow="0 2px 8px rgba(124, 58, 237, 0.3)"
                                >
                                  <Icon as={FaCheck} color="white" boxSize={3} />
                                </Flex>
                              )}

                              {/* Contenu de la carte - SANS radio visible */}
                              <HStack spacing={4} align="flex-start" w="100%">
                                <Flex
                                  w="48px"
                                  h="48px"
                                  bg={actionChoice === 'join' ? '#7C3AED' : 'gray.100'}
                                  borderRadius="12px"
                                  align="center"
                                  justify="center"
                                  flexShrink={0}
                                  transition="all 0.2s"
                                >
                                  <Icon 
                                    as={FaUsers} 
                                    boxSize={5} 
                                    color={actionChoice === 'join' ? 'white' : 'gray.600'}
                                  />
                                </Flex>
                                <VStack align="flex-start" spacing={1} flex={1}>
                                  <Text fontWeight="bold" color="gray.800" fontSize="md">
                                    {t('register.step3.joinTitle')}
                                  </Text>
                                  <Text fontSize="sm" color="gray.600">
                                    {t('register.step3.joinDesc')}
                                  </Text>
                                </VStack>
                              </HStack>
                              
                              {/* Radio caché mais fonctionnel */}
                              <Radio 
                                value="join" 
                                position="absolute" 
                                opacity={0} 
                                pointerEvents="none"
                              />
                            </Box>
                          </VStack>
                        </RadioGroup>
                      </FormControl>

                      {/* Champ conditionnel selon le choix - SANS placeholder */}
                      {actionChoice === 'create' && (
                        <FormControl isRequired>
                          <FormLabel color="gray.700" fontWeight="medium" fontSize="sm">
                            {t('register.step3.familyName')}
                          </FormLabel>
                          <Input
                            value={familyName}
                            onChange={(e) => setFamilyName(e.target.value)}
                            placeholder=""
                            h="48px"
                            borderRadius="8px"
                            borderColor="gray.300"
                            _hover={{ borderColor: 'primary.400' }}
                            _focus={{
                              borderColor: 'primary.500',
                              boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
                            }}
                          />
                        </FormControl>
                      )}

                      {actionChoice === 'join' && (
                        <FormControl isRequired>
                          <FormLabel color="gray.700" fontWeight="medium" fontSize="sm">
                            {t('register.step3.inviteCode')}
                          </FormLabel>
                          <Input
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                            placeholder=""
                            h="48px"
                            borderRadius="8px"
                            borderColor="gray.300"
                            textTransform="uppercase"
                            _hover={{ borderColor: 'primary.400' }}
                            _focus={{
                              borderColor: 'primary.500',
                              boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
                            }}
                          />
                        </FormControl>
                      )}

                      {/* Bouton Dynamique selon le choix */}
                      <Button
                        type="submit"
                        w="100%"
                        h="48px"
                        bgGradient="linear(to-r, primary.500, secondary.500)"
                        color="white"
                        fontWeight="semibold"
                        borderRadius="8px"
                        isLoading={isLoading}
                        leftIcon={actionChoice === 'create' ? <Icon as={FaHome} /> : <Icon as={FaUsers} />}
                        _hover={{
                          bgGradient: 'linear(to-r, primary.600, secondary.600)',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 8px 16px rgba(139, 92, 246, 0.3)',
                        }}
                        _active={{
                          transform: 'translateY(0)',
                        }}
                        transition="all 0.2s"
                      >
                        {actionChoice === 'create' 
                          ? t('register.step3.createButton')
                          : t('register.step3.joinButton')
                        }
                      </Button>
                    </VStack>
                  </form>
                </MotionBox>
              )}
            </AnimatePresence>
          </Box>

          {/* Lien vers login */}
          <Text fontSize="sm" color="gray.600">
            {t('auth.alreadyHaveAccountQuestion')}{' '}
            <ChakraLink
              as={Link}
              to="/login"
              color="primary.500"
              fontWeight="medium"
              _hover={{ color: 'primary.600', textDecoration: 'underline' }}
            >
              {t('auth.signIn')}
            </ChakraLink>
          </Text>

          {/* Footer légal */}
          <Text fontSize="xs" color="gray.500" textAlign="center" mt={4}>
            {t('register.footer.byCreating')}{' '}
            <ChakraLink color="primary.500" fontWeight="medium">
              {t('register.footer.terms')}
            </ChakraLink>{' '}
            {t('register.footer.and')}{' '}
            <ChakraLink color="primary.500" fontWeight="medium">
              {t('register.footer.privacy')}
            </ChakraLink>
          </Text>
        </VStack>
      </Flex>
    </Flex>
  );
};

export default Register;
