import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  PinInput,
  PinInputField,
  HStack,
  Button,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
  Icon,
  Divider
} from '@chakra-ui/react';
import { FaEnvelope, FaClock, FaCheckCircle } from 'react-icons/fa';

const VerifyEmail = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const email = location.state?.email;

  // Countdown pour renvoyer le code
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Rediriger si pas d'email
  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast({
        title: t('emailVerification.incompleteCode') || 'Code incomplet',
        description: t('emailVerification.enterAllDigits') || 'Veuillez entrer les 6 chiffres',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/auth/verify-email', {
        email,
        code
      });

      // Stocker le token
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      toast({
        title: t('emailVerification.verified') || '✅ Email vérifié !',
        description: t('emailVerification.accountActive') || 'Votre compte est maintenant actif',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Rediriger vers complete-profile
      setTimeout(() => {
        navigate('/complete-profile');
      }, 1500);

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          t('emailVerification.invalidCode') || 
                          'Code invalide ou expiré';
      
      toast({
        title: t('emailVerification.verificationError') || 'Erreur de vérification',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      // Réinitialiser le code
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      await api.post('/auth/resend-verification-code', { email });
      
      setCountdown(60); // Bloquer pendant 1 minute
      setCode(''); // Réinitialiser le code
      
      toast({
        title: t('emailVerification.codeSent') || '📧 Code renvoyé',
        description: t('emailVerification.checkEmail') || 'Consultez votre boîte mail',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          t('emailVerification.resendError') || 
                          'Impossible de renvoyer le code';
      
      toast({
        title: t('common.error') || 'Erreur',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <Box minH="100vh" bg="gray.50" py={20}>
      <Container maxW="md">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box textAlign="center">
            <Icon as={FaEnvelope} fontSize="5xl" color="purple.500" mb={4} />
            <Heading size="xl" mb={2} color="gray.800">
              {t('emailVerification.title') || 'Vérifiez votre email'}
            </Heading>
            <Text color="gray.600" fontSize="lg">
              {t('emailVerification.subtitle') || 'Un code à 6 chiffres a été envoyé à'}
            </Text>
            <Text fontWeight="bold" color="purple.600" fontSize="lg" mt={2}>
              {email}
            </Text>
          </Box>

          <Divider />

          {/* PIN Input Card */}
          <Box
            bg="white"
            p={8}
            borderRadius="xl"
            boxShadow="xl"
            border="1px solid"
            borderColor="gray.200"
          >
            <VStack spacing={6}>
              <Text fontWeight="semibold" color="gray.700" fontSize="lg">
                {t('emailVerification.enterCode') || 'Entrez le code reçu'}
              </Text>
              
              <HStack justify="center" spacing={3}>
                <PinInput
                  size="lg"
                  value={code}
                  onChange={setCode}
                  onComplete={handleVerify}
                  otp
                  type="number"
                  placeholder="·"
                >
                  <PinInputField 
                    bg="purple.50" 
                    borderColor="purple.300"
                    _hover={{ borderColor: 'purple.400' }}
                    _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                    fontSize="2xl"
                    fontWeight="bold"
                  />
                  <PinInputField 
                    bg="purple.50" 
                    borderColor="purple.300"
                    _hover={{ borderColor: 'purple.400' }}
                    _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                    fontSize="2xl"
                    fontWeight="bold"
                  />
                  <PinInputField 
                    bg="purple.50" 
                    borderColor="purple.300"
                    _hover={{ borderColor: 'purple.400' }}
                    _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                    fontSize="2xl"
                    fontWeight="bold"
                  />
                  <PinInputField 
                    bg="purple.50" 
                    borderColor="purple.300"
                    _hover={{ borderColor: 'purple.400' }}
                    _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                    fontSize="2xl"
                    fontWeight="bold"
                  />
                  <PinInputField 
                    bg="purple.50" 
                    borderColor="purple.300"
                    _hover={{ borderColor: 'purple.400' }}
                    _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                    fontSize="2xl"
                    fontWeight="bold"
                  />
                  <PinInputField 
                    bg="purple.50" 
                    borderColor="purple.300"
                    _hover={{ borderColor: 'purple.400' }}
                    _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                    fontSize="2xl"
                    fontWeight="bold"
                  />
                </PinInput>
              </HStack>

              <Button
                w="full"
                size="lg"
                leftIcon={<Icon as={FaCheckCircle} />}
                bgGradient="linear(to-r, purple.500, purple.600)"
                color="white"
                onClick={handleVerify}
                isLoading={loading}
                isDisabled={code.length !== 6}
                _hover={{
                  bgGradient: 'linear(to-r, purple.600, purple.700)',
                  transform: 'translateY(-2px)',
                  boxShadow: 'lg'
                }}
                transition="all 0.2s"
              >
                {t('emailVerification.verify') || 'Vérifier'}
              </Button>
            </VStack>
          </Box>

          {/* Info Alert */}
          <Alert 
            status="info" 
            borderRadius="lg" 
            variant="left-accent"
            bg="blue.50"
            borderColor="blue.300"
          >
            <AlertIcon as={FaClock} color="blue.500" />
            <AlertDescription color="blue.900">
              {t('emailVerification.codeValid') || 'Le code est valide pendant'}{' '}
              <strong>30 minutes</strong>
            </AlertDescription>
          </Alert>

          {/* Resend Section */}
          <Box 
            textAlign="center" 
            p={6} 
            bg="white" 
            borderRadius="lg"
            boxShadow="sm"
          >
            <Text color="gray.600" mb={3} fontWeight="medium">
              {t('emailVerification.noCode') || "Vous n'avez pas reçu le code ?"}
            </Text>
            <Button
              variant="outline"
              colorScheme="purple"
              onClick={handleResend}
              isLoading={resending}
              isDisabled={countdown > 0}
              size="md"
              _hover={{
                bg: 'purple.50',
                transform: 'translateY(-1px)'
              }}
            >
              {countdown > 0 
                ? `${t('emailVerification.resendIn') || 'Renvoyer dans'} ${countdown}s`
                : t('emailVerification.resend') || 'Renvoyer le code'
              }
            </Button>
          </Box>

          {/* Help Text */}
          <Text fontSize="sm" color="gray.500" textAlign="center">
            💡 {t('emailVerification.spamTip') || 'Pensez à vérifier votre dossier spam/courrier indésirable'}
          </Text>
        </VStack>
      </Container>
    </Box>
  );
};

export default VerifyEmail;
