import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  PinInput,
  PinInputField,
  useToast,
  Icon,
  Circle,
  Flex,
  Divider,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaCheckCircle, FaRedoAlt, FaLock } from 'react-icons/fa';

const MotionBox = motion(Box);
const MotionCircle = motion(Circle);

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [verified, setVerified] = useState(false);

  const email = location.state?.email;

  useEffect(() => {
    if (!email) navigate('/register');
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async () => {
    if (code.length !== 6) return;

    try {
      setLoading(true);
      const response = await api.post('/auth/verify-email', { email, code });

      try {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } catch { /* storage quota */ }

      setVerified(true);

      setTimeout(() => {
        navigate('/complete-profile');
      }, 1800);

    } catch (error: any) {
      setCode('');
      toast({
        title: 'Code invalide',
        description: error.response?.data?.message || 'Code incorrect ou expiré',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      await api.post('/auth/resend-verification-code', { email });
      setCountdown(60);
      setCode('');
      toast({
        title: '📧 Code renvoyé',
        description: 'Consultez votre boîte mail (et les spams)',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de renvoyer le code',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setResending(false);
    }
  };

  if (!email) return null;

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
              Vérification email
            </Heading>
            <Text color="whiteAlpha.800" fontSize="lg">
              Entrez le code reçu pour activer votre compte
            </Text>
          </MotionBox>

          {/* Card */}
          <MotionBox
            w="100%"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Box bg="white" borderRadius="xl" boxShadow="2xl" overflow="hidden">

              {/* Top band */}
              <Box bgGradient="linear(to-r, purple.500, purple.700)" px={8} py={6}>
                <HStack spacing={4}>
                  <MotionCircle
                    size="56px"
                    bg="whiteAlpha.200"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
                  >
                    <Icon as={FaEnvelope} color="white" fontSize="22px" />
                  </MotionCircle>
                  <Box>
                    <Text color="white" fontWeight="bold" fontSize="lg">
                      Code envoyé à
                    </Text>
                    <Text color="whiteAlpha.900" fontSize="sm" noOfLines={1}>
                      {email}
                    </Text>
                  </Box>
                </HStack>
              </Box>

              <Box px={8} py={8}>
                <AnimatePresence mode="wait">
                  {!verified ? (
                    <MotionBox
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <VStack spacing={7}>

                        {/* PIN inputs */}
                        <VStack spacing={3} w="100%">
                          <Text
                            fontWeight="semibold"
                            color="gray.700"
                            fontSize="md"
                            textAlign="center"
                          >
                            Code à 6 chiffres
                          </Text>

                          <HStack justify="center" spacing={3}>
                            <PinInput
                              size="lg"
                              value={code}
                              onChange={setCode}
                              onComplete={handleVerify}
                              otp
                              type="number"
                              focusBorderColor="purple.500"
                            >
                              {[...Array(6)].map((_, i) => (
                                <PinInputField
                                  key={i}
                                  bg="purple.50"
                                  borderColor="purple.200"
                                  borderWidth="2px"
                                  borderRadius="lg"
                                  fontSize="2xl"
                                  fontWeight="bold"
                                  color="purple.700"
                                  w="48px"
                                  h="56px"
                                  _hover={{ borderColor: 'purple.400' }}
                                  _focus={{
                                    borderColor: 'purple.500',
                                    bg: 'white',
                                    boxShadow: '0 0 0 3px var(--chakra-colors-purple-100)',
                                  }}
                                />
                              ))}
                            </PinInput>
                          </HStack>
                        </VStack>

                        {/* Verify button */}
                        <Button
                          w="100%"
                          size="lg"
                          colorScheme="purple"
                          leftIcon={<Icon as={FaLock} />}
                          onClick={handleVerify}
                          isLoading={loading}
                          loadingText="Vérification..."
                          isDisabled={code.length !== 6}
                          borderRadius="lg"
                          fontSize="md"
                          py={6}
                          bgGradient="linear(to-r, purple.500, purple.700)"
                          _hover={{
                            bgGradient: 'linear(to-r, purple.900, purple.700)',
                            transform: 'translateY(-1px)',
                            boxShadow: 'lg',
                          }}
                          transition="all 0.2s"
                        >
                          Vérifier mon email
                        </Button>

                        <Divider />

                        {/* Resend */}
                        <VStack spacing={2} w="100%">
                          <Text fontSize="sm" color="gray.500">
                            Vous n'avez pas reçu le code ?
                          </Text>
                          <Button
                            variant="ghost"
                            colorScheme="purple"
                            size="sm"
                            leftIcon={<Icon as={FaRedoAlt} />}
                            onClick={handleResend}
                            isLoading={resending}
                            isDisabled={countdown > 0}
                          >
                            {countdown > 0
                              ? `Renvoyer dans ${countdown}s`
                              : 'Renvoyer le code'}
                          </Button>
                        </VStack>

                      </VStack>
                    </MotionBox>
                  ) : (
                    <MotionBox
                      key="success"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      <VStack spacing={4} py={6}>
                        <MotionCircle
                          size="80px"
                          bg="green.100"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                        >
                          <Icon as={FaCheckCircle} color="green.500" fontSize="36px" />
                        </MotionCircle>
                        <Heading size="md" color="green.600">
                          Email vérifié !
                        </Heading>
                        <Text color="gray.500" textAlign="center">
                          Redirection vers votre profil...
                        </Text>
                      </VStack>
                    </MotionBox>
                  )}
                </AnimatePresence>
              </Box>
            </Box>
          </MotionBox>

          {/* Step indicator */}
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <HStack spacing={3} justify="center">
              {[
                { label: 'Compte', done: true },
                { label: 'Email', active: true },
                { label: 'Profil', done: false },
              ].map((step, i) => (
                <Flex key={i} align="center" gap={2}>
                  {i > 0 && (
                    <Box w="24px" h="1px" bg={step.done ? 'white' : 'whiteAlpha.400'} />
                  )}
                  <HStack spacing={1}>
                    <Circle
                      size="22px"
                      bg={step.done ? 'white' : step.active ? 'white' : 'whiteAlpha.300'}
                      borderWidth={step.active ? '2px' : '0'}
                      borderColor="white"
                    >
                      {step.done ? (
                        <Icon as={FaCheckCircle} color="purple.600" fontSize="12px" />
                      ) : (
                        <Text
                          fontSize="10px"
                          fontWeight="bold"
                          color={step.active ? 'purple.600' : 'whiteAlpha.700'}
                        >
                          {i + 1}
                        </Text>
                      )}
                    </Circle>
                    <Text
                      fontSize="xs"
                      color={step.done || step.active ? 'white' : 'whiteAlpha.600'}
                      fontWeight={step.active ? 'bold' : 'normal'}
                    >
                      {step.label}
                    </Text>
                  </HStack>
                </Flex>
              ))}
            </HStack>
            <Text color="whiteAlpha.700" fontSize="xs" textAlign="center" mt={2}>
              Étape 2 sur 3
            </Text>
          </MotionBox>

        </VStack>
      </Container>
    </Box>
  );
};

export default VerifyEmail;
