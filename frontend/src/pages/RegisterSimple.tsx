import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Alert,
  AlertIcon,
  InputGroup,
  InputRightElement,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

export default function RegisterSimple() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email || !password || !confirmPassword) {
      setError(t('auth.allFieldsRequired'));
      return;
    }

    if (!validateEmail(email)) {
      setError(t('auth.invalidEmail'));
      return;
    }

    if (!validatePassword(password)) {
      setError(t('auth.passwordMinLength'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/register-simple', {
        email,
        password,
      });

      const { token } = response.data;

      // Stocker le token
      localStorage.setItem('token', token);

      toast({
        title: t('auth.accountCreated'),
        description: t('auth.completeProfile'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Rediriger vers la complétion du profil
      navigate('/complete-profile');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || t('auth.registerError');
      setError(errorMessage);
      toast({
        title: t('common.error'),
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      bgGradient="linear(to-br, purple.600, purple.800)"
      py={12}
    >
      <Container maxW="md">
        <VStack spacing={8}>
          <VStack spacing={2}>
            <Heading color="white" size="2xl">
              {t('auth.createAccount')}
            </Heading>
            <Text color="whiteAlpha.800" fontSize="lg">
              {t('auth.startFamilyTree')}
            </Text>
          </VStack>

          <Box
            bg="white"
            p={8}
            borderRadius="xl"
            boxShadow="2xl"
            w="100%"
          >
            {error && (
              <Alert status="error" borderRadius="md" mb={4}>
                <AlertIcon />
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>{t('auth.email')}</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('auth.emailPlaceholder')}
                    size="lg"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>{t('auth.password')}</FormLabel>
                  <InputGroup size="lg">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('auth.passwordPlaceholder')}
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showPassword ? t('auth.hide') : t('auth.show')}
                        icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={() => setShowPassword(!showPassword)}
                        variant="ghost"
                        size="sm"
                      />
                    </InputRightElement>
                  </InputGroup>
                  <Text fontSize="sm" color="gray.600" mt={1}>
                    {t('auth.minCharacters')}
                  </Text>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>{t('auth.confirmPassword')}</FormLabel>
                  <InputGroup size="lg">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t('auth.passwordPlaceholder')}
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showConfirmPassword ? t('auth.hide') : t('auth.show')}
                        icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        variant="ghost"
                        size="sm"
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="purple"
                  size="lg"
                  w="100%"
                  isLoading={isLoading}
                  loadingText={t('auth.creatingAccount')}
                >
                  {t('auth.createMyAccount')}
                </Button>

                <Text color="gray.600" textAlign="center">
                  {t('auth.alreadyHaveAccountQuestion')}{' '}
                  <Link to="/login">
                    <Text as="span" color="purple.600" fontWeight="semibold">
                      {t('auth.signIn')}
                    </Text>
                  </Link>
                </Text>
              </VStack>
            </form>
          </Box>

          <Text color="whiteAlpha.700" fontSize="sm" textAlign="center" maxW="md">
            {t('auth.step1of3')}
            <br />
            {t('auth.step1Description')}
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}
