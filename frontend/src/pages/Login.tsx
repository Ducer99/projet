import { useState } from 'react';
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
  useToast,
  Link as ChakraLink,
  Icon,
} from '@chakra-ui/react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { FaHome, FaHeart } from 'react-icons/fa';
import { fadeInUp } from '../animations';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: t('auth.welcomeBack'),
        description: t('auth.welcomeBackDescription'),
        status: 'success',
        duration: 3000,
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: t('auth.loginError'),
        description: error instanceof Error ? error.message : t('auth.checkCredentials'),
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box 
      minH="100vh" 
      bgGradient="linear(to-br, primary.50, accent.warm)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={12}
    >
      <Container maxW="md">
        <VStack spacing={8} sx={{ '@keyframes fadeInUp': fadeInUp, animation: 'fadeInUp 0.6s ease-out' }}>
          {/* Logo/Icon */}
          <Box 
            p={6} 
            bg="linear-gradient(135deg, #F6D365 0%, #FDA085 100%)"
            borderRadius="full"
            boxShadow="2xl"
            transition="all 0.3s"
            _hover={{ transform: 'scale(1.05)' }}
          >
            <Icon as={FaHome} boxSize={16} color="white" />
          </Box>

          {/* Titre et sous-titre */}
          <VStack spacing={2} textAlign="center">
            <Heading 
              size="2xl" 
              color="primary.900" 
              fontFamily="heading"
              letterSpacing="tight"
            >
              {t('auth.kinsipHaven')}
            </Heading>
            <HStack spacing={2} color="primary.700">
              <Icon as={FaHeart} boxSize={4} />
              <Text fontSize="lg" fontWeight="medium">
                {t('auth.tagline')}
              </Text>
            </HStack>
          </VStack>

          {/* Formulaire de connexion */}
          <Box 
            w="100%" 
            p={8} 
            bg="white" 
            borderRadius="2xl" 
            borderWidth={2}
            borderColor="primary.200"
            boxShadow="2xl"
          >
            <VStack spacing={6}>
              <VStack spacing={1} w="100%" textAlign="center">
                <Heading size="md" color="primary.800">
                  {t('auth.loginTitle')}
                </Heading>
                <Text color="gray.600" fontSize="sm">
                  {t('auth.loginSubtitle')}
                </Text>
              </VStack>
              
              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <VStack spacing={5}>
                  <FormControl isRequired>
                    <FormLabel color="primary.800" fontWeight="semibold">
                      {t('auth.email')}
                    </FormLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('auth.emailPlaceholder')}
                      size="lg"
                      variant="heritage"
                      _placeholder={{ color: 'gray.400' }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel color="primary.800" fontWeight="semibold">
                      {t('auth.password')}
                    </FormLabel>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('auth.passwordPlaceholder')}
                      size="lg"
                      variant="heritage"
                      _placeholder={{ color: 'gray.400' }}
                    />
                  </FormControl>

                  <Button
                    type="submit"
                    variant="family"
                    width="100%"
                    size="lg"
                    isLoading={isLoading}
                    loadingText={t('auth.loggingIn')}
                  >
                    {t('auth.loginButton')}
                  </Button>

                  <ChakraLink 
                    as={Link} 
                    to="/forgot-password" 
                    color="primary.600" 
                    fontSize="sm"
                    fontWeight="medium"
                    _hover={{ color: 'primary.800', textDecoration: 'underline' }}
                  >
                    {t('auth.forgotPassword')}
                  </ChakraLink>
                </VStack>
              </form>
            </VStack>
          </Box>

          {/* Lien d'inscription */}
          <HStack 
            spacing={2} 
            p={4} 
            bg="whiteAlpha.800" 
            borderRadius="lg"
            backdropFilter="blur(10px)"
          >
            <Text fontSize="sm" color="primary.900">
              {t('auth.newFamily')}
            </Text>
            <ChakraLink 
              as={Link} 
              to="/register-simple" 
              color="primary.700"
              fontWeight="bold"
              _hover={{ color: 'primary.900', textDecoration: 'underline' }}
            >
              {t('auth.createHaven')}
            </ChakraLink>
          </HStack>
        </VStack>
      </Container>
    </Box>
  );
};

export default Login;
