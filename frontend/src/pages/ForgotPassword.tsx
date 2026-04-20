import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Heading,
  Text,
  useToast,
  Container,
  Icon,
  Circle,
  Flex,
  InputGroup,
  InputRightElement,
  IconButton,
  PinInput,
  PinInputField,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaKey, FaLock, FaCheckCircle, FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const MotionBox = motion(Box);
const MotionCircle = motion(Circle);

const STEPS = [
  { label: 'Email', icon: FaEnvelope },
  { label: 'Code', icon: FaKey },
  { label: 'Mot de passe', icon: FaLock },
];

export default function ForgotPassword() {
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setStep(2);
      toast({
        title: 'Email envoyé',
        description: 'Vérifiez votre boîte mail (et les spams)',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } catch (error: any) {
      toast({
        title: 'Email introuvable',
        description: error.response?.data?.message || 'Aucun compte associé à cet email',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast({ title: 'Code incomplet', description: 'Entrez le code à 6 chiffres reçu par email', status: 'error', duration: 3000, position: 'top' });
      return;
    }
    setStep(3);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: 'Les mots de passe ne correspondent pas', status: 'error', duration: 3000, position: 'top' });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: 'Minimum 6 caractères requis', status: 'error', duration: 3000, position: 'top' });
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, verificationCode: code, newPassword });
      setDone(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (error: any) {
      toast({
        title: 'Code invalide ou expiré',
        description: error.response?.data?.message || 'Vérifiez le code ou recommencez depuis le début',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bgGradient="linear(to-br, purple.900, purple.700)" py={12}>
      <Container maxW="md">
        <VStack spacing={8}>

          {/* Header */}
          <MotionBox
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            textAlign="center"
          >
            <Heading color="white" size="2xl" mb={2}>
              {t('auth.forgotPasswordTitle')}
            </Heading>
            <Text color="whiteAlpha.800" fontSize="lg">
              Récupérez l'accès à votre compte
            </Text>
          </MotionBox>

          {/* Step indicator */}
          <MotionBox initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <HStack spacing={3} justify="center">
              {STEPS.map((s, i) => {
                const stepNum = i + 1;
                const isDone = step > stepNum || done;
                const isActive = step === stepNum && !done;
                return (
                  <Flex key={i} align="center" gap={2}>
                    {i > 0 && (
                      <Box w="24px" h="1px" bg={isDone ? 'white' : 'whiteAlpha.400'} />
                    )}
                    <HStack spacing={1}>
                      <Circle
                        size="28px"
                        bg={isDone ? 'white' : isActive ? 'white' : 'whiteAlpha.300'}
                        borderWidth={isActive ? '2px' : '0'}
                        borderColor="white"
                      >
                        {isDone ? (
                          <Icon as={FaCheckCircle} color="purple.600" fontSize="14px" />
                        ) : (
                          <Icon as={s.icon} color={isActive ? 'purple.600' : 'whiteAlpha.700'} fontSize="12px" />
                        )}
                      </Circle>
                      <Text
                        fontSize="xs"
                        color={isDone || isActive ? 'white' : 'whiteAlpha.600'}
                        fontWeight={isActive ? 'bold' : 'normal'}
                      >
                        {s.label}
                      </Text>
                    </HStack>
                  </Flex>
                );
              })}
            </HStack>
          </MotionBox>

          {/* Card */}
          <MotionBox
            w="100%"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Box bg="white" borderRadius="xl" boxShadow="2xl" overflow="hidden">
              {/* Top banner */}
              <Box bgGradient="linear(to-r, purple.500, purple.700)" px={8} py={5}>
                <HStack spacing={4}>
                  <MotionCircle
                    size="48px"
                    bg="whiteAlpha.200"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
                  >
                    <Icon
                      as={done ? FaCheckCircle : STEPS[step - 1]?.icon || FaLock}
                      color="white"
                      fontSize="20px"
                    />
                  </MotionCircle>
                  <Box>
                    <Text color="white" fontWeight="bold" fontSize="lg">
                      {done ? 'Mot de passe réinitialisé !' : ['Entrez votre email', 'Code de vérification', 'Nouveau mot de passe'][step - 1]}
                    </Text>
                    <Text color="whiteAlpha.800" fontSize="sm">
                      {done ? 'Redirection vers la connexion...' : `Étape ${step} sur 3`}
                    </Text>
                  </Box>
                </HStack>
              </Box>

              <Box px={8} py={8}>
                <AnimatePresence mode="wait">
                  {done ? (
                    <MotionBox
                      key="done"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      <VStack spacing={4} py={4}>
                        <MotionCircle
                          size="80px"
                          bg="green.100"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                        >
                          <Icon as={FaCheckCircle} color="green.500" fontSize="36px" />
                        </MotionCircle>
                        <Heading size="md" color="green.600">Mot de passe modifié !</Heading>
                        <Text color="gray.500" textAlign="center">
                          Vous allez être redirigé vers la connexion...
                        </Text>
                      </VStack>
                    </MotionBox>

                  ) : step === 1 ? (
                    <MotionBox key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <form onSubmit={handleEmailSubmit}>
                        <VStack spacing={5}>
                          <FormControl isRequired>
                            <FormLabel color="gray.700" fontWeight="medium" fontSize="sm">
                              {t('auth.email')}
                            </FormLabel>
                            <Input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="vous@exemple.com"
                              h="48px"
                              borderRadius="8px"
                              borderColor="gray.300"
                              _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                            />
                          </FormControl>
                          <Button
                            type="submit"
                            w="100%"
                            h="48px"
                            bgGradient="linear(to-r, purple.500, purple.700)"
                            color="white"
                            fontWeight="semibold"
                            borderRadius="8px"
                            isLoading={loading}
                            loadingText="Envoi en cours..."
                            _hover={{ bgGradient: 'linear(to-r, purple.600, purple.800)', transform: 'translateY(-1px)', boxShadow: 'lg' }}
                            transition="all 0.2s"
                          >
                            Envoyer le code par email
                          </Button>
                          <RouterLink to="/login">
                            <HStack color="purple.500" fontSize="sm" _hover={{ color: 'purple.700' }}>
                              <Icon as={FaArrowLeft} />
                              <Text>{t('auth.backToLogin')}</Text>
                            </HStack>
                          </RouterLink>
                        </VStack>
                      </form>
                    </MotionBox>

                  ) : step === 2 ? (
                    <MotionBox key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <form onSubmit={handleCodeSubmit}>
                        <VStack spacing={5}>
                          <Text color="gray.600" fontSize="sm" textAlign="center">
                            Un code à 6 chiffres a été envoyé à <strong>{email}</strong>.<br />
                            Vérifiez aussi vos spams.
                          </Text>
                          <FormControl isRequired>
                            <FormLabel color="gray.700" fontWeight="medium" fontSize="sm" textAlign="center">
                              Code de vérification
                            </FormLabel>
                            <HStack justify="center">
                              <PinInput
                                value={code}
                                onChange={setCode}
                                otp
                                size="lg"
                                focusBorderColor="purple.500"
                              >
                                <PinInputField />
                                <PinInputField />
                                <PinInputField />
                                <PinInputField />
                                <PinInputField />
                                <PinInputField />
                              </PinInput>
                            </HStack>
                          </FormControl>
                          <Button
                            type="submit"
                            w="100%"
                            h="48px"
                            bgGradient="linear(to-r, purple.500, purple.700)"
                            color="white"
                            fontWeight="semibold"
                            borderRadius="8px"
                            isDisabled={code.length !== 6}
                            _hover={{ bgGradient: 'linear(to-r, purple.600, purple.800)', transform: 'translateY(-1px)', boxShadow: 'lg' }}
                            transition="all 0.2s"
                          >
                            Vérifier le code
                          </Button>
                          <Button variant="ghost" colorScheme="purple" size="sm" onClick={() => setStep(1)} leftIcon={<Icon as={FaArrowLeft} />}>
                            Retour
                          </Button>
                        </VStack>
                      </form>
                    </MotionBox>

                  ) : (
                    <MotionBox key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <form onSubmit={handleResetPassword}>
                        <VStack spacing={5}>
                          <FormControl isRequired>
                            <FormLabel color="gray.700" fontWeight="medium" fontSize="sm">
                              {t('auth.newPassword')}
                            </FormLabel>
                            <InputGroup>
                              <Input
                                type={showPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Minimum 6 caractères"
                                h="48px"
                                borderRadius="8px"
                                borderColor="gray.300"
                                _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                              />
                              <InputRightElement h="48px">
                                <IconButton
                                  aria-label={showPassword ? 'Masquer' : 'Afficher'}
                                  icon={<Icon as={showPassword ? FaEyeSlash : FaEye} />}
                                  onClick={() => setShowPassword(!showPassword)}
                                  variant="ghost"
                                  size="sm"
                                  color="gray.500"
                                />
                              </InputRightElement>
                            </InputGroup>
                          </FormControl>
                          <FormControl isRequired>
                            <FormLabel color="gray.700" fontWeight="medium" fontSize="sm">
                              {t('auth.confirmPassword')}
                            </FormLabel>
                            <InputGroup>
                              <Input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Répétez le mot de passe"
                                h="48px"
                                borderRadius="8px"
                                borderColor={confirmPassword && confirmPassword !== newPassword ? 'red.400' : 'gray.300'}
                                _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                              />
                              <InputRightElement h="48px">
                                <IconButton
                                  aria-label={showConfirmPassword ? 'Masquer' : 'Afficher'}
                                  icon={<Icon as={showConfirmPassword ? FaEyeSlash : FaEye} />}
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  variant="ghost"
                                  size="sm"
                                  color="gray.500"
                                />
                              </InputRightElement>
                            </InputGroup>
                            {confirmPassword && confirmPassword !== newPassword && (
                              <Text fontSize="xs" color="red.500" mt={1}>Les mots de passe ne correspondent pas</Text>
                            )}
                          </FormControl>
                          <Button
                            type="submit"
                            w="100%"
                            h="48px"
                            bgGradient="linear(to-r, purple.500, purple.700)"
                            color="white"
                            fontWeight="semibold"
                            borderRadius="8px"
                            isLoading={loading}
                            loadingText="Réinitialisation..."
                            _hover={{ bgGradient: 'linear(to-r, purple.600, purple.800)', transform: 'translateY(-1px)', boxShadow: 'lg' }}
                            transition="all 0.2s"
                          >
                            {t('auth.resetMyPassword')}
                          </Button>
                          <Button variant="ghost" colorScheme="purple" size="sm" onClick={() => setStep(2)} leftIcon={<Icon as={FaArrowLeft} />}>
                            Retour
                          </Button>
                        </VStack>
                      </form>
                    </MotionBox>
                  )}
                </AnimatePresence>
              </Box>
            </Box>
          </MotionBox>

        </VStack>
      </Container>
    </Box>
  );
}
