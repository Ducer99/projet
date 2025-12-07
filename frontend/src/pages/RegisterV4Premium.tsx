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
  Flex,
  Icon,
  HStack,
  Progress,
  Collapse,
  InputGroup,
  InputRightElement,
  IconButton,
  Link as ChakraLink,
  Select,
} from '@chakra-ui/react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaUsers, 
  FaArrowLeft, 
  FaHome, 
  FaCheck, 
  FaArrowRight,
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

// Animation wrapper
const MotionBox = motion(Box);

const RegisterV4Premium = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();

  // Progress State
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  // Form Data States - Step 1: Security
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Form Data States - Step 2: Complete Profile
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [sex, setSex] = useState<'M' | 'F'>('M');
  const [birthDate, setBirthDate] = useState('');
  const [birthCountry, setBirthCountry] = useState('');
  const [birthCity, setBirthCity] = useState('');
  const [residenceCountry, setResidenceCountry] = useState('');
  const [residenceCity, setResidenceCity] = useState('');
  const [activity, setActivity] = useState('');
  const [phone, setPhone] = useState('');
  
  // Form Data States - Step 3: Family Attachment
  const [actionChoice, setActionChoice] = useState<'create' | 'join'>('create');
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  
  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ==================== VALIDATION & SECURITY ====================
  
  // Password Strength Calculation
  const calculatePasswordStrength = (pwd: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score: 33, label: t('register.step1.passwordWeak'), color: 'red' };
    if (score === 2 || score === 3) return { score: 66, label: t('register.step1.passwordMedium'), color: 'yellow' };
    return { score: 100, label: t('register.step1.passwordStrong'), color: 'green' };
  };

  const passwordStrength = calculatePasswordStrength(password);

  // Validation Step 1
  const validateStep1 = (): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      toast({ title: t('register.error'), description: 'Email invalide', status: 'error', duration: 3000 });
      return false;
    }
    
    if (password.length < 8) {
      toast({ title: t('register.error'), description: t('register.step1.passwordRequirements'), status: 'error', duration: 3000 });
      return false;
    }
    
    if (password !== confirmPassword) {
      toast({ title: t('register.error'), description: 'Les mots de passe ne correspondent pas', status: 'error', duration: 3000 });
      return false;
    }
    
    return true;
  };

  // Validation Step 2
  const validateStep2 = (): boolean => {
    if (!firstName.trim() || !lastName.trim()) {
      toast({ title: t('register.error'), description: t('common.requiredFields'), status: 'error', duration: 3000 });
      return false;
    }
    return true;
  };

  // Validation Step 3
  const validateStep3 = (): boolean => {
    if (actionChoice === 'create' && !familyName.trim()) {
      toast({ title: t('register.error'), description: t('family.pleaseEnterFamilyName'), status: 'error', duration: 3000 });
      return false;
    }
    if (actionChoice === 'join' && !inviteCode.trim()) {
      toast({ title: t('register.error'), description: t('family.pleaseEnterInviteCode'), status: 'error', duration: 3000 });
      return false;
    }
    return true;
  };

  // ==================== NAVIGATION ====================
  
  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // ==================== SUBMISSION ====================
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep3()) return;
    
    setIsLoading(true);
    
    // Préparation du payload complet
    const payload = {
      email: email.toLowerCase().trim(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      sex,
      birthDate: birthDate ? new Date(birthDate) : null,
      birthCountry,
      birthCity,
      residenceCountry,
      residenceCity,
      activity,
      phone
    };
    
    try {
      let response;
      
      // 🆕 SOUMISSION ATOMIQUE : 1 seule requête HTTP
      if (actionChoice === 'create') {
        console.log('🏠 Creating family with complete profile...');
        response = await api.post('/auth/create-family', {
          ...payload,
          familyName: familyName.trim()
        });
      } else {
        console.log('👥 Joining family with complete profile...');
        response = await api.post('/auth/join-family', {
          ...payload,
          inviteCode: inviteCode.trim().toUpperCase()
        });
      }
      
      // Stockage du token FINAL
      const finalToken = response.data.token;
      const userData = response.data.user;
      
      if (finalToken && userData) {
        localStorage.setItem('token', finalToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        console.log('✅ Registration successful:', userData);
      }

      // SUCCESS! 🎉
      toast({ 
        title: t('register.welcomeMessage'), 
        description: t('register.redirecting'),
        status: 'success', 
        duration: 2000 
      });
      
      // Redirection vers le Dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (error: any) {
      console.error('❌ Registration error:', error);
      
      // Gestion des erreurs (SANS FUITE D'INFOS)
      const msg = error.response?.data?.message || t('register.errorMessage');
      
      toast({ 
        title: t('register.error'), 
        description: msg, 
        status: 'error',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== RENDER ====================

  // Step Label Helper
  const getStepLabel = (step: number): string => {
    if (step === 1) return t('register.progress.account');
    if (step === 2) return t('register.progress.profile');
    return t('register.progress.family');
  };

  return (
    <Flex minH="100vh" overflow="hidden">
      
      {/* 🖼️ LEFT SIDE: Emotional Image */}
      <Box
        flex="1"
        display={{ base: 'none', lg: 'block' }}
        position="relative"
        bg="gray.900"
      >
        <Box
          position="absolute"
          top={0} left={0} right={0} bottom={0}
          bgImage="url('https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?q=80&w=2554&auto=format&fit=crop')"
          bgSize="cover"
          bgPosition="center"
          opacity={0.6}
        />
        <Flex 
          position="relative" 
          h="100%" 
          direction="column" 
          justify="flex-end" 
          p={16} 
          color="white"
          bgGradient="linear(to-t, blackAlpha.900, transparent)"
        >
          <Heading size="3xl" mb={4} letterSpacing="tight">
            {t('register.hero.title')}
          </Heading>
          <Text fontSize="xl" fontWeight="light" maxW="500px">
            "{t('register.hero.quote')}"
          </Text>
        </Flex>
      </Box>

      {/* 📝 RIGHT SIDE: Form */}
      <Flex flex="1" align="center" justify="center" bg="white" px={8} py={12}>
        <Box w="100%" maxW="480px">
          
          {/* Mobile Header */}
          <Heading 
            size="lg" 
            mb={2} 
            color="purple.600" 
            display={{ base: 'block', lg: 'none' }}
          >
            {t('register.hero.title')}
          </Heading>

          {/* Progress Stepper */}
          <Box mb={10}>
            <Flex justify="space-between" mb={2}>
              <Text 
                fontSize="xs" 
                fontWeight="bold" 
                color="gray.400" 
                letterSpacing="wider" 
                textTransform="uppercase"
              >
                {t('register.progress.step')} {currentStep} {t('register.progress.of')} {totalSteps}
              </Text>
              <Text fontSize="xs" fontWeight="bold" color="purple.600">
                {getStepLabel(currentStep)}
              </Text>
            </Flex>
            <Progress 
              value={(currentStep / totalSteps) * 100} 
              size="xs" 
              colorScheme="purple" 
              borderRadius="full" 
            />
          </Box>

          <AnimatePresence mode="wait">
            
            {/* ==================== STEP 1: ACCOUNT ==================== */}
            {currentStep === 1 && (
              <MotionBox
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Heading size="xl" mb={2}>{t('register.step1.title')}</Heading>
                <Text color="gray.500" mb={8}>{t('register.step1.subtitle')}</Text>

                <VStack spacing={5}>
                  {/* Email */}
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="bold" color="gray.700">
                      {t('register.step1.email')}
                    </FormLabel>
                    <Input 
                      type="email"
                      height="50px" 
                      fontSize="md" 
                      borderRadius="xl" 
                      bg="gray.50" 
                      border="1px solid" 
                      borderColor="gray.200"
                      _focus={{ bg: "white", borderColor: "purple.500", boxShadow: "0 0 0 1px #805AD5" }}
                      value={email} 
                      onChange={e => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                    />
                  </FormControl>

                  {/* Password */}
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="bold" color="gray.700">
                      {t('register.step1.password')}
                    </FormLabel>
                    <InputGroup>
                      <Input 
                        type={showPassword ? 'text' : 'password'}
                        height="50px" 
                        borderRadius="xl" 
                        bg="gray.50" 
                        border="1px solid" 
                        borderColor="gray.200"
                        _focus={{ bg: "white", borderColor: "purple.500", boxShadow: "0 0 0 1px #805AD5" }}
                        value={password} 
                        onChange={e => setPassword(e.target.value)}
                      />
                      <InputRightElement h="50px">
                        <IconButton
                          aria-label="Toggle password"
                          icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                          variant="ghost"
                          onClick={() => setShowPassword(!showPassword)}
                        />
                      </InputRightElement>
                    </InputGroup>
                    
                    {/* Password Strength Indicator */}
                    {password && (
                      <Box mt={2}>
                        <Flex justify="space-between" mb={1}>
                          <Text fontSize="xs" color="gray.600">
                            {t('register.step1.passwordStrength')}
                          </Text>
                          <Text fontSize="xs" fontWeight="bold" color={`${passwordStrength.color}.500`}>
                            {passwordStrength.label}
                          </Text>
                        </Flex>
                        <Progress 
                          value={passwordStrength.score} 
                          size="xs" 
                          colorScheme={passwordStrength.color}
                          borderRadius="full"
                        />
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          {t('register.step1.passwordRequirements')}
                        </Text>
                      </Box>
                    )}
                  </FormControl>

                  {/* Confirm Password */}
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="bold" color="gray.700">
                      {t('register.step1.confirmPassword')}
                    </FormLabel>
                    <InputGroup>
                      <Input 
                        type={showConfirmPassword ? 'text' : 'password'}
                        height="50px" 
                        borderRadius="xl" 
                        bg="gray.50" 
                        border="1px solid" 
                        borderColor="gray.200"
                        _focus={{ bg: "white", borderColor: "purple.500", boxShadow: "0 0 0 1px #805AD5" }}
                        value={confirmPassword} 
                        onChange={e => setConfirmPassword(e.target.value)}
                      />
                      <InputRightElement h="50px">
                        <IconButton
                          aria-label="Toggle confirm password"
                          icon={showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                          variant="ghost"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <Button 
                    w="100%" 
                    h="50px" 
                    colorScheme="purple" 
                    borderRadius="xl" 
                    fontSize="md" 
                    onClick={handleNext}
                    rightIcon={<Icon as={FaArrowRight} />}
                  >
                    {t('register.step1.continue')}
                  </Button>

                  {/* Already have account? */}
                  <Text fontSize="sm" color="gray.500">
                    {t('register.alreadyHaveAccount')}{' '}
                    <ChakraLink as={Link} to="/login" color="purple.600" fontWeight="bold">
                      {t('register.loginLink')}
                    </ChakraLink>
                  </Text>
                </VStack>
              </MotionBox>
            )}

            {/* ==================== STEP 2: COMPLETE PROFILE ==================== */}
            {currentStep === 2 && (
              <MotionBox
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Button 
                  variant="link" 
                  size="sm" 
                  mb={4} 
                  color="gray.400" 
                  onClick={handleBack} 
                  leftIcon={<FaArrowLeft />}
                >
                  {t('common.back')}
                </Button>
                
                <Heading size="xl" mb={2}>{t('register.step2.title')}</Heading>
                <Text color="gray.500" mb={8}>{t('register.step2.subtitle')}</Text>

                <VStack spacing={5}>
                  {/* Identity */}
                  <HStack spacing={4} w="100%">
                    <FormControl isRequired>
                      <FormLabel fontSize="sm" fontWeight="bold">
                        {t('register.step2.firstName')}
                      </FormLabel>
                      <Input 
                        height="50px" 
                        borderRadius="xl" 
                        bg="gray.50" 
                        value={firstName} 
                        onChange={e => setFirstName(e.target.value)}
                      />
                    </FormControl>
                    
                    <FormControl isRequired>
                      <FormLabel fontSize="sm" fontWeight="bold">
                        {t('register.step2.lastName')}
                      </FormLabel>
                      <Input 
                        height="50px" 
                        borderRadius="xl" 
                        bg="gray.50" 
                        value={lastName} 
                        onChange={e => setLastName(e.target.value)}
                      />
                    </FormControl>
                  </HStack>

                  {/* Gender & Birth Date */}
                  <HStack spacing={4} w="100%">
                    <FormControl isRequired>
                      <FormLabel fontSize="sm" fontWeight="bold">{t('register.step2.gender')}</FormLabel>
                      <Select 
                        height="50px" 
                        borderRadius="xl" 
                        bg="gray.50"
                        value={sex}
                        onChange={e => setSex(e.target.value as 'M' | 'F')}
                      >
                        <option value="M">{t('register.step2.male')}</option>
                        <option value="F">{t('register.step2.female')}</option>
                      </Select>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="bold">{t('register.step2.birthDate')}</FormLabel>
                      <Input 
                        type="date"
                        height="50px" 
                        borderRadius="xl" 
                        bg="gray.50" 
                        value={birthDate}
                        onChange={e => setBirthDate(e.target.value)}
                      />
                    </FormControl>
                  </HStack>

                  {/* Birth Location */}
                  <HStack spacing={4} w="100%">
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="bold">{t('register.step2.birthCountry')}</FormLabel>
                      <Input 
                        height="50px" 
                        borderRadius="xl" 
                        bg="gray.50" 
                        value={birthCountry}
                        onChange={e => setBirthCountry(e.target.value)}
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="bold">{t('register.step2.birthCity')}</FormLabel>
                      <Input 
                        height="50px" 
                        borderRadius="xl" 
                        bg="gray.50" 
                        value={birthCity}
                        onChange={e => setBirthCity(e.target.value)}
                      />
                    </FormControl>
                  </HStack>

                  {/* Residence Location */}
                  <HStack spacing={4} w="100%">
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="bold">{t('register.step2.residenceCountry')}</FormLabel>
                      <Input 
                        height="50px" 
                        borderRadius="xl" 
                        bg="gray.50" 
                        value={residenceCountry}
                        onChange={e => setResidenceCountry(e.target.value)}
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="bold">{t('register.step2.residenceCity')}</FormLabel>
                      <Input 
                        height="50px" 
                        borderRadius="xl" 
                        bg="gray.50" 
                        value={residenceCity}
                        onChange={e => setResidenceCity(e.target.value)}
                      />
                    </FormControl>
                  </HStack>

                  {/* Activity & Phone */}
                  <HStack spacing={4} w="100%">
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="bold">{t('register.step2.activity')}</FormLabel>
                      <Input 
                        height="50px" 
                        borderRadius="xl" 
                        bg="gray.50" 
                        value={activity}
                        onChange={e => setActivity(e.target.value)}
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="bold">{t('register.step2.phone')}</FormLabel>
                      <Input 
                        height="50px" 
                        borderRadius="xl" 
                        bg="gray.50" 
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                      />
                    </FormControl>
                  </HStack>

                  <Button 
                    w="100%" 
                    h="50px" 
                    colorScheme="purple" 
                    borderRadius="xl" 
                    onClick={handleNext}
                  >
                    {t('register.step2.next')}
                  </Button>
                </VStack>
              </MotionBox>
            )}

            {/* ==================== STEP 3: FAMILY (CARDS DESIGN) ==================== */}
            {currentStep === 3 && (
              <MotionBox
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Button 
                  variant="link" 
                  size="sm" 
                  mb={4} 
                  color="gray.400" 
                  onClick={handleBack} 
                  leftIcon={<FaArrowLeft />}
                >
                  {t('common.back')}
                </Button>
                
                <Heading size="xl" mb={2}>{t('register.step3.title')}</Heading>
                <Text color="gray.500" mb={8}>{t('register.step3.subtitle')}</Text>

                <VStack spacing={4}>
                  
                  {/* 🏠 CARD 1: CREATE */}
                  <Box 
                    w="100%" 
                    p={5} 
                    border="2px solid"
                    borderColor={actionChoice === 'create' ? 'purple.500' : 'gray.100'}
                    bg={actionChoice === 'create' ? 'purple.50' : 'white'}
                    borderRadius="2xl"
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{ borderColor: 'purple.300', transform: 'translateY(-2px)', shadow: 'md' }}
                    onClick={() => setActionChoice('create')}
                    position="relative"
                  >
                    <Flex align="center">
                      <Flex align="center" justify="center" w="50px" h="50px" bg="purple.100" borderRadius="full" color="purple.600" mr={4}>
                        <Icon as={FaHome} w={6} h={6} />
                      </Flex>
                      <Box>
                        <Text fontWeight="bold" fontSize="lg" color="gray.800">
                          {t('register.step3.createTitle')}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {t('register.step3.createDesc')}
                        </Text>
                      </Box>
                      {actionChoice === 'create' && (
                        <Icon as={FaCheck} position="absolute" top={5} right={5} color="purple.500" />
                      )}
                    </Flex>
                  </Box>

                  {/* 👥 CARD 2: JOIN */}
                  <Box 
                    w="100%" 
                    p={5} 
                    border="2px solid"
                    borderColor={actionChoice === 'join' ? 'purple.500' : 'gray.100'}
                    bg={actionChoice === 'join' ? 'purple.50' : 'white'}
                    borderRadius="2xl"
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{ borderColor: 'purple.300', transform: 'translateY(-2px)', shadow: 'md' }}
                    onClick={() => setActionChoice('join')}
                    position="relative"
                  >
                    <Flex align="center">
                      <Flex align="center" justify="center" w="50px" h="50px" bg="teal.100" borderRadius="full" color="teal.600" mr={4}>
                        <Icon as={FaUsers} w={6} h={6} />
                      </Flex>
                      <Box>
                        <Text fontWeight="bold" fontSize="lg" color="gray.800">
                          {t('register.step3.joinTitle')}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {t('register.step3.joinDesc')}
                        </Text>
                      </Box>
                      {actionChoice === 'join' && (
                        <Icon as={FaCheck} position="absolute" top={5} right={5} color="purple.500" />
                      )}
                    </Flex>
                  </Box>

                  {/* DYNAMIC FIELDS */}
                  <Box w="100%" pt={4}>
                    <Collapse in={actionChoice === 'create'} animateOpacity>
                      <FormControl isRequired>
                        <FormLabel fontWeight="bold" pl={1}>
                          {t('register.step3.familyName')}
                        </FormLabel>
                        <Input 
                          placeholder={t('register.step3.familyNamePlaceholder')}
                          height="50px" 
                          borderRadius="xl" 
                          bg="white" 
                          border="1px solid" 
                          borderColor="gray.300"
                          value={familyName} 
                          onChange={e => setFamilyName(e.target.value)}
                        />
                      </FormControl>
                    </Collapse>

                    <Collapse in={actionChoice === 'join'} animateOpacity>
                      <FormControl isRequired>
                        <FormLabel fontWeight="bold" pl={1}>
                          {t('register.step3.inviteCode')}
                        </FormLabel>
                        <Input 
                          placeholder={t('register.step3.inviteCodePlaceholder')}
                          height="50px" 
                          borderRadius="xl" 
                          bg="white" 
                          border="1px solid" 
                          borderColor="gray.300" 
                          letterSpacing="widest"
                          textTransform="uppercase"
                          value={inviteCode} 
                          onChange={e => setInviteCode(e.target.value)}
                        />
                      </FormControl>
                    </Collapse>
                  </Box>

                  <Button 
                    w="100%" 
                    h="56px" 
                    mt={4}
                    bgGradient="linear(to-r, purple.500, pink.500)" 
                    color="white" 
                    borderRadius="xl" 
                    fontSize="lg" 
                    fontWeight="bold"
                    _hover={{ bgGradient: "linear(to-r, purple.600, pink.600)", shadow: "lg" }}
                    onClick={handleSubmit}
                    isLoading={isLoading}
                  >
                    {actionChoice === 'create' 
                      ? t('register.step3.createButton')
                      : t('register.step3.joinButton')
                    }
                  </Button>

                </VStack>
              </MotionBox>
            )}

          </AnimatePresence>

        </Box>
      </Flex>
    </Flex>
  );
};

export default RegisterV4Premium;
