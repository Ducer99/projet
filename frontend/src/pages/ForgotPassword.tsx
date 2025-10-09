import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
  Container,
  Link,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Select,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

interface SecurityQuestion {
  Question: string;
  Type: string;
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();
  
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [securityQuestions, setSecurityQuestions] = useState<SecurityQuestion[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setSecurityQuestions(response.data.SecurityQuestions);
      setVerificationCode(response.data.VerificationCode);
      
      toast({
        title: 'Code de vérification généré',
        description: `Votre code est: ${response.data.VerificationCode}`,
        status: 'info',
        duration: 10000,
        isClosable: true,
      });
      
      setStep(2);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data || 'Une erreur est survenue',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/auth/verify-security-answer', {
        email,
        questionType: selectedQuestion,
        answer: securityAnswer,
      });

      toast({
        title: 'Réponse correcte !',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      setStep(3);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data || 'Réponse incorrecte',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Erreur',
        description: 'Le mot de passe doit contenir au moins 6 caractères',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', {
        email,
        verificationCode,
        newPassword,
      });

      toast({
        title: t('auth.passwordReset'),
        description: t('auth.passwordResetSuccess'),
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.response?.data || t('auth.errorOccurred'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="md" py={12}>
      <VStack spacing={8}>
        <Heading>{t('auth.forgotPasswordTitle')}</Heading>

        {step === 1 && (
          <Box w="full">
            <Alert status="info" mb={4} borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>{t('auth.accountRecovery')}</AlertTitle>
                <AlertDescription>
                  {t('auth.enterEmailToRecover')}
                </AlertDescription>
              </Box>
            </Alert>

            <form onSubmit={handleEmailSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>{t('auth.email')}</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('auth.emailPlaceholder')}
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  width="full"
                  isLoading={loading}
                >
                  {t('auth.continue')}
                </Button>

                <Link as={RouterLink} to="/login" color="blue.500">
                  {t('auth.backToLogin')}
                </Link>
              </VStack>
            </form>
          </Box>
        )}

        {step === 2 && (
          <Box w="full">
            <Alert status="warning" mb={4} borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>{t('auth.securityQuestion')}</AlertTitle>
                <AlertDescription>
                  {t('auth.answerSecurityQuestion')}
                </AlertDescription>
              </Box>
            </Alert>

            <form onSubmit={handleSecurityAnswer}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>{t('auth.chooseQuestion')}</FormLabel>
                  <Select
                    placeholder={t('auth.selectQuestion')}
                    value={selectedQuestion}
                    onChange={(e) => setSelectedQuestion(e.target.value)}
                  >
                    {securityQuestions.map((q) => (
                      <option key={q.Type} value={q.Type}>
                        {q.Question}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {selectedQuestion && (
                  <FormControl isRequired>
                    <FormLabel>{t('auth.yourAnswer')}</FormLabel>
                    <Input
                      value={securityAnswer}
                      onChange={(e) => setSecurityAnswer(e.target.value)}
                      placeholder={t('auth.enterYourAnswer')}
                    />
                  </FormControl>
                )}

                <Button
                  type="submit"
                  colorScheme="blue"
                  width="full"
                  isLoading={loading}
                  isDisabled={!selectedQuestion || !securityAnswer}
                >
                  {t('auth.verify')}
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setStep(1)}
                  width="full"
                >
                  {t('auth.back')}
                </Button>
              </VStack>
            </form>
          </Box>
        )}

        {step === 3 && (
          <Box w="full">
            <Alert status="success" mb={4} borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>{t('auth.verificationCode')}</AlertTitle>
                <AlertDescription>
                  {t('auth.codeGenerated')}
                </AlertDescription>
              </Box>
            </Alert>

            <VStack spacing={4}>
              <Text fontSize="sm" color="gray.600">
                {t('auth.yourCodeIs')}: <strong>{verificationCode}</strong>
              </Text>

              <Button
                colorScheme="green"
                width="full"
                onClick={() => setStep(4)}
              >
                {t('auth.haveCodeContinue')}
              </Button>

              <Button
                variant="ghost"
                onClick={() => setStep(1)}
                width="full"
              >
                {t('auth.startOver')}
              </Button>
            </VStack>
          </Box>
        )}

        {step === 4 && (
          <Box w="full">
            <Alert status="info" mb={4} borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>{t('auth.newPassword')}</AlertTitle>
                <AlertDescription>
                  {t('auth.createSecurePassword')}
                </AlertDescription>
              </Box>
            </Alert>

            <form onSubmit={handleResetPassword}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>{t('auth.newPassword')}</FormLabel>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t('auth.passwordPlaceholder')}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>{t('auth.confirmPassword')}</FormLabel>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('auth.retypePassword')}
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="green"
                  width="full"
                  isLoading={loading}
                >
                  {t('auth.resetMyPassword')}
                </Button>
              </VStack>
            </form>
          </Box>
        )}
      </VStack>
    </Container>
  );
}
