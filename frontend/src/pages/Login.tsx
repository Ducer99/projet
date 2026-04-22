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
} from '@chakra-ui/react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { FaUsers, FaEye, FaEyeSlash } from 'react-icons/fa';
import { InputGroup, InputRightElement, IconButton } from '@chakra-ui/react';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // 2FA state
  const [twoFactorStep, setTwoFactorStep] = useState(false);
  const [twoFactorEmail, setTwoFactorEmail] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const navigate = useNavigate();
  const { } = useAuth(); // keep context mounted for logout elsewhere
  const toast = useToast();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const data = response.data;

      // Cas 2FA : le backend demande un code avant de délivrer le token
      if (data.requiresTwoFactor) {
        setTwoFactorEmail(data.email);
        setTwoFactorStep(true);
        toast({ title: 'Code envoyé', description: 'Vérifiez votre email pour le code 2FA.', status: 'info', duration: 4000 });
        return;
      }

      // Connexion normale
      try {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      } catch { /* storage quota */ }

      toast({ title: t('auth.welcomeBack'), description: t('auth.welcomeBackDescription'), status: 'success', duration: 3000 });

      if (data.needsFamilyOnboarding) {
        navigate('/family-attachment');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: t('auth.loginError'),
        description: error.response?.data?.message || (error instanceof Error ? error.message : t('auth.checkCredentials')),
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post('/auth/verify-2fa', { email: twoFactorEmail, code: twoFactorCode });
      const data = response.data;
      try {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      } catch { /* storage quota */ }
      toast({ title: t('auth.welcomeBack'), status: 'success', duration: 3000 });
      if (data.needsFamilyOnboarding) {
        navigate('/family-attachment');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: 'Code incorrect',
        description: error.response?.data?.message || 'Vérifiez le code et réessayez.',
        status: 'error',
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return;

    setIsLoading(true);
    try {
      const response = await api.post('/auth/google', {
        token: credentialResponse.credential,
      });

      try {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } catch { /* storage quota — session active en mémoire */ }

      toast({
        title: t('auth.welcomeBack'),
        description: 'Connexion réussie avec Google !',
        status: 'success',
        duration: 3000,
      });

      if (response.data.needsFamilyOnboarding) {
        navigate('/family-attachment');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: 'Erreur Google',
        description: error.response?.data?.message || 'Erreur lors de la connexion Google',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          top: 0, left: 0, right: 0, bottom: 0,
          bgGradient: 'linear(to-br, rgba(76, 29, 149, 0.9), rgba(109, 40, 217, 0.8))',
        }}
      >
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
          <HStack spacing={3} mb={8}>
            <Icon as={FaUsers} boxSize={12} />
            <Heading size="2xl" fontWeight="bold">Kinship Haven</Heading>
          </HStack>

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

          <VStack spacing={4} mt={12} align="flex-start" maxW="400px">
            {['Arbre généalogique interactif', 'Albums photos partagés', 'Événements familiaux', 'Collaboration en temps réel'].map(f => (
              <HStack key={f} spacing={3}>
                <Box w="8px" h="8px" borderRadius="full" bg="white" />
                <Text fontSize="md">{f}</Text>
              </HStack>
            ))}
          </VStack>
        </Flex>
      </Box>

      {/* Partie Droite - Formulaire */}
      <Flex
        flex="1"
        bg="#F7F5FF"
        h="100vh"
        align="center"
        justify="center"
        px={{ base: 6, md: 12 }}
        overflow="hidden"
      >
        <Box
          bg="white"
          borderRadius="3xl"
          p={{ base: 6, md: 8 }}
          w="100%"
          maxW="440px"
          shadow="xl"
          border="1px solid"
          borderColor="purple.100"
        >
        <VStack spacing={6} w="100%">
          {/* En-tête */}
          <VStack spacing={2} w="100%" align="flex-start">
            <HStack spacing={2} mb={1}>
              <Icon as={FaUsers} color="purple.500" boxSize={5} />
              <Text fontSize="xs" fontWeight="700" color="purple.500" letterSpacing="0.08em" textTransform="uppercase">
                Family Tree
              </Text>
            </HStack>
            <Heading size="xl" color="#1A162E" fontWeight="800" letterSpacing="-0.03em">
              Bon retour parmi nous 👋
            </Heading>
            <Text color="purple.400" fontSize="md" fontWeight="500">
              Connectez-vous pour accéder à votre espace famille
            </Text>
          </VStack>

          {!twoFactorStep ? (
            <>
              {/* Bouton Google */}
              <Box w="100%" display="flex" justifyContent="center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast({ title: 'Échec connexion Google', status: 'error', duration: 3000 })}
                  theme="outline"
                  size="large"
                  text="continue_with"
                  shape="rectangular"
                  width="400"
                  locale="fr"
                />
              </Box>

              <HStack w="100%" spacing={4}>
                <Divider borderColor="gray.300" />
                <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">ou par email</Text>
                <Divider borderColor="gray.300" />
              </HStack>

              {/* Formulaire email/mot de passe */}
              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <VStack spacing={5} w="100%">
                  <FormControl isRequired>
                    <FormLabel color="#3D3856" fontWeight="600" fontSize="sm">{t('auth.email')}</FormLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      h="52px"
                      borderRadius="xl"
                      borderColor="#E8E6F0"
                      borderWidth="1.5px"
                      bg="white"
                      _hover={{ borderColor: 'purple.300' }}
                      _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 2px rgba(139, 92, 246, 0.2)' }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <Flex justify="space-between" align="center" mb={2}>
                      <FormLabel color="#3D3856" fontWeight="600" fontSize="sm" mb={0}>{t('auth.password')}</FormLabel>
                      <ChakraLink as={Link} to="/forgot-password" fontSize="xs" color="purple.600" fontWeight="600" _hover={{ color: 'purple.700', textDecoration: 'underline' }}>
                        Mot de passe oublié ?
                      </ChakraLink>
                    </Flex>
                    <InputGroup>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        h="52px"
                        borderRadius="xl"
                        borderColor="#E8E6F0"
                        borderWidth="1.5px"
                        bg="white"
                        pr="52px"
                        _hover={{ borderColor: 'purple.300' }}
                        _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 2px rgba(139, 92, 246, 0.2)' }}
                      />
                      <InputRightElement h="52px" pr={1}>
                        <IconButton
                          aria-label={showPassword ? 'Masquer' : 'Afficher'}
                          icon={<Icon as={showPassword ? FaEyeSlash : FaEye} />}
                          variant="ghost"
                          size="sm"
                          color="purple.400"
                          _hover={{ color: 'purple.600', bg: 'purple.50' }}
                          borderRadius="lg"
                          onClick={() => setShowPassword(v => !v)}
                          tabIndex={-1}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <Button
                    type="submit"
                    w="100%"
                    h="52px"
                    bgGradient="linear(to-r, purple.700, purple.500)"
                    color="white"
                    fontWeight="700"
                    borderRadius="xl"
                    fontSize="md"
                    isLoading={isLoading}
                    loadingText={t('auth.loggingIn')}
                    _hover={{ bgGradient: 'linear(to-r, purple.800, purple.600)', transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(109, 40, 217, 0.4)' }}
                    _active={{ transform: 'translateY(0)' }}
                    transition="all 0.2s"
                  >
                    {t('auth.loginButton')}
                  </Button>
                </VStack>
              </form>

              <Text fontSize="sm" color="gray.600">
                Nouveau sur Kinship Haven ?{' '}
                <ChakraLink as={Link} to="/register" color="purple.600" fontWeight="medium" _hover={{ textDecoration: 'underline' }}>
                  Créer un compte
                </ChakraLink>
              </Text>

              <Text fontSize="xs" color="gray.500" textAlign="center" mt={4}>
                En vous connectant, vous acceptez nos{' '}
                <ChakraLink color="purple.600" fontWeight="medium">Conditions d'utilisation</ChakraLink>
              </Text>
            </>
          ) : (
            /* ── Step 2FA ── */
            <form onSubmit={handleVerify2FA} style={{ width: '100%' }}>
              <VStack spacing={6} w="100%">
                <VStack spacing={1} textAlign="center">
                  <Text fontSize="3xl">🔐</Text>
                  <Heading size="md" color="#1A162E">Vérification en deux étapes</Heading>
                  <Text fontSize="sm" color="gray.500">
                    Un code à 6 chiffres a été envoyé à <strong>{twoFactorEmail}</strong>
                  </Text>
                </VStack>

                <FormControl isRequired>
                  <FormLabel color="#3D3856" fontWeight="600" fontSize="sm">Code de vérification</FormLabel>
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                    h="64px"
                    fontSize="2xl"
                    fontWeight="bold"
                    textAlign="center"
                    letterSpacing="0.5em"
                    borderRadius="xl"
                    borderColor="#E8E6F0"
                    borderWidth="1.5px"
                    autoFocus
                    _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 2px rgba(139, 92, 246, 0.2)' }}
                  />
                </FormControl>

                <Button
                  type="submit"
                  w="100%"
                  h="52px"
                  bgGradient="linear(to-r, purple.700, purple.500)"
                  color="white"
                  fontWeight="700"
                  borderRadius="xl"
                  isLoading={isLoading}
                  loadingText="Vérification..."
                  _hover={{ bgGradient: 'linear(to-r, purple.800, purple.600)', transform: 'translateY(-2px)' }}
                  transition="all 0.2s"
                >
                  Confirmer
                </Button>

                <Text
                  fontSize="sm"
                  color="purple.600"
                  cursor="pointer"
                  fontWeight="medium"
                  _hover={{ textDecoration: 'underline' }}
                  onClick={() => { setTwoFactorStep(false); setTwoFactorCode(''); }}
                >
                  ← Retour à la connexion
                </Text>
              </VStack>
            </form>
          )}
        </VStack>
        </Box>
      </Flex>
    </Flex>
  );
};

export default Login;
