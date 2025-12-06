import { useState } from 'react';
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
  Link as ChakraLink,
  Icon,
  Flex,
  Divider,
  Tooltip,
} from '@chakra-ui/react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { FaUsers, FaGoogle } from 'react-icons/fa';

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
      const response = await login(email, password);
      
      toast({
        title: t('auth.welcomeBack'),
        description: t('auth.welcomeBackDescription'),
        status: 'success',
        duration: 3000,
      });

      // 🚀 Smart Redirect Flow: Vérifier si l'utilisateur a besoin d'un Family Onboarding
      if (response?.needsFamilyOnboarding === true) {
        navigate('/family-attachment');
      } else {
        navigate('/dashboard');
      }
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

  // ⏸️ EN PAUSE - Gestion du login Google OAuth
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
      // Envoyer le token Google au backend pour validation
      const response = await api.post('/auth/google', {
        token: credentialResponse.credential,
      });

      // Sauvegarder le token JWT et les infos utilisateur
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      toast({
        title: t('auth.welcomeBack'),
        description: 'Connexion réussie avec Google !',
        status: 'success',
        duration: 3000,
      });

      // Smart Redirect Flow
      const needsFamilyOnboarding = response.data.needsFamilyOnboarding || false;
      
      if (needsFamilyOnboarding) {
        navigate('/family-attachment');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: t('auth.error'),
        description: error.response?.data?.message || 'Erreur lors de la connexion Google',
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
      description: 'Échec de la connexion Google',
      status: 'error',
      duration: 5000,
    });
  };
  */

  return (
    <Flex minH="100vh" overflow="hidden">
      {/* Partie Gauche - Image avec Overlay */}
      <Box
        flex="1"
        position="relative"
        display={{ base: 'none', md: 'block' }}
        bgImage="url('https://images.unsplash.com/photo-1475503572774-15a45e5d60b9?q=80&w=2070&auto=format&fit=crop')"
        bgSize="cover"
        bgPosition="center"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgGradient: 'linear(to-br, rgba(99, 102, 241, 0.85), rgba(139, 92, 246, 0.75))',
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
            Connectez-vous pour explorer votre histoire familiale
          </Text>

          {/* Features */}
          <VStack spacing={4} mt={12} align="flex-start" maxW="400px">
            <HStack spacing={3}>
              <Box w="8px" h="8px" borderRadius="full" bg="white" />
              <Text fontSize="md">Arbre généalogique interactif</Text>
            </HStack>
            <HStack spacing={3}>
              <Box w="8px" h="8px" borderRadius="full" bg="white" />
              <Text fontSize="md">Albums photos partagés</Text>
            </HStack>
            <HStack spacing={3}>
              <Box w="8px" h="8px" borderRadius="full" bg="white" />
              <Text fontSize="md">Événements familiaux</Text>
            </HStack>
            <HStack spacing={3}>
              <Box w="8px" h="8px" borderRadius="full" bg="white" />
              <Text fontSize="md">Collaboration en temps réel</Text>
            </HStack>
          </VStack>
        </Flex>
      </Box>

      {/* Partie Droite - Formulaire (Centrage Vertical Parfait) */}
      <Flex
        flex="1"
        bg="white"
        h="100vh"
        align="center"
        justify="center"
        px={{ base: 6, md: 12 }}
        overflow="hidden"
      >
        <VStack spacing={8} w="100%" maxW="400px">
          {/* En-tête */}
          <VStack spacing={2} w="100%" align="flex-start">
            <Heading size="xl" color="gray.800" fontWeight="bold">
              Bon retour parmi nous !
            </Heading>
          <Text color="gray.600" fontSize="md">
            Connectez-vous pour accéder à votre espace famille
          </Text>
        </VStack>

        {/* Bouton Google OAuth - Visible mais désactivé (en développement) */}
        <Tooltip 
          label="🚧 Connexion Google bientôt disponible" 
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
              Continuer avec Google
            </Button>
          </Box>
        </Tooltip>

        {/* Divider */}
        <HStack w="100%" spacing={4}>
          <Divider borderColor="gray.300" />
          <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
            ou par email
          </Text>
          <Divider borderColor="gray.300" />
        </HStack>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <VStack spacing={5} w="100%">
              <FormControl isRequired>
                <FormLabel color="gray.700" fontWeight="medium" fontSize="sm">
                  {t('auth.email')}
                </FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                <Flex justify="space-between" align="center" mb={2}>
                  <FormLabel color="gray.700" fontWeight="medium" fontSize="sm" mb={0}>
                    {t('auth.password')}
                  </FormLabel>
                  <ChakraLink
                    as={Link}
                    to="/forgot-password"
                    fontSize="xs"
                    color="primary.500"
                    fontWeight="medium"
                    _hover={{ color: 'primary.600', textDecoration: 'underline' }}
                  >
                    Mot de passe oublié ?
                  </ChakraLink>
                </Flex>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

              <Button
                type="submit"
                w="100%"
                h="48px"
                bgGradient="linear(to-r, primary.500, secondary.500)"
                color="white"
                fontWeight="semibold"
                borderRadius="8px"
                isLoading={isLoading}
                loadingText={t('auth.loggingIn')}
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
                {t('auth.loginButton')}
              </Button>
            </VStack>
          </form>

          {/* Lien vers inscription */}
          <Text fontSize="sm" color="gray.600">
            Nouveau sur Kinship Haven ?{' '}
            <ChakraLink
              as={Link}
              to="/register"
              color="primary.500"
              fontWeight="medium"
              _hover={{ color: 'primary.600', textDecoration: 'underline' }}
            >
              Créer un compte
            </ChakraLink>
          </Text>

          {/* Footer légal */}
          <Text fontSize="xs" color="gray.500" textAlign="center" mt={4}>
            En vous connectant, vous acceptez nos{' '}
            <ChakraLink color="primary.500" fontWeight="medium">
              Conditions d'utilisation
            </ChakraLink>
          </Text>
        </VStack>
      </Flex>
    </Flex>
  );
};

export default Login;
