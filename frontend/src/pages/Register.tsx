import { useState } from 'react';
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
  useToast,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    setIsLoading(true);

    try {
      const response = await api.post('/auth/register', {
        email,
        password,
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      toast({
        title: t('auth.accountCreated'),
        description: t('auth.completeProfile'),
        status: 'success',
        duration: 3000,
      });

      navigate('/complete-profile');
    } catch (error: any) {
      toast({
        title: t('auth.registerError'),
        description: error.response?.data?.message || t('auth.errorOccurred'),
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="md" centerContent py={20}>
      <Box w="100%" p={8} borderWidth={1} borderRadius="lg" boxShadow="lg">
        <VStack spacing={6}>
          <Heading size="xl">{t('auth.registration')}</Heading>
          <Text color="gray.600">{t('auth.createNewAccount')}</Text>
          
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
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

              <FormControl isRequired>
                <FormLabel>{t('auth.password')}</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.choosePassword')}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>{t('auth.confirmPassword')}</FormLabel>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                />
                <Text fontSize="sm" color="gray.500" mt={1}>
                  {t('auth.atLeast6Characters')}
                </Text>
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                width="100%"
                isLoading={isLoading}
              >
                {t('auth.signUpButton')}
              </Button>

              <Text fontSize="sm">
                {t('auth.alreadyHaveAccountQuestion')}{' '}
                <ChakraLink as={Link} to="/login" color="blue.500">
                  {t('auth.signIn')}
                </ChakraLink>
              </Text>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Container>
  );
};

export default Register;
