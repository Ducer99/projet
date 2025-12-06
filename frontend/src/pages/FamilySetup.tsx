import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Text,
  VStack,
  useToast,
  Code,
  HStack,
  Icon,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaKey, FaUsers } from 'react-icons/fa';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface CreateFamilyData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  familyName: string;
  sex: string;
  birthday?: string;
  activity?: string;
}

interface JoinFamilyData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  inviteCode: string;
  sex: string;
  birthday?: string;
  activity?: string;
}

const FamilySetup = () => {
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const navigate = useNavigate();
  const toast = useToast();
  const { login } = useAuth();

  // Formulaire Créer Famille
  const [createData, setCreateData] = useState<CreateFamilyData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    familyName: '',
    sex: 'M',
  });

  // Formulaire Rejoindre Famille
  const [joinData, setJoinData] = useState<JoinFamilyData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    inviteCode: '',
    sex: 'M',
  });

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/create-family', createData);
      
      const { token, user } = response.data;
      
      // Stocker le token et les infos utilisateur
      login(token, user);
      
      // Afficher le code d'invitation
      setInviteCode(user.inviteCode);
      setShowSuccess(true);

      toast({
        title: '🎉 Famille créée avec succès !',
        description: `Votre code d'invitation : ${user.inviteCode}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Redirection après 3 secondes
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de créer la famille',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/join-family', joinData);
      
      const { token, user } = response.data;
      
      // Stocker le token et les infos utilisateur
      login(token, user);

      toast({
        title: '🎊 Bienvenue dans la famille !',
        description: `Vous avez rejoint la famille ${user.familyName}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Redirection vers le dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Code d\'invitation invalide',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteCode);
    toast({
      title: 'Code copié !',
      description: 'Le code a été copié dans le presse-papiers',
      status: 'info',
      duration: 2000,
    });
  };

  if (showSuccess && inviteCode) {
    return (
      <Container maxW="lg" py={12}>
        <VStack spacing={8}>
          <Alert
            status="success"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            height="300px"
            borderRadius="lg"
          >
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="2xl">
              Famille créée avec succès ! 🎉
            </AlertTitle>
            <AlertDescription maxWidth="sm" mt={4}>
              <Text mb={4}>Partagez ce code pour inviter des membres :</Text>
              <HStack spacing={3} justify="center">
                <Code fontSize="3xl" p={4} colorScheme="green" borderRadius="md">
                  {inviteCode}
                </Code>
                <Button onClick={copyToClipboard} colorScheme="green" size="sm">
                  Copier
                </Button>
              </HStack>
              <Text mt={6} fontSize="sm" color="gray.600">
                Redirection vers le dashboard...
              </Text>
            </AlertDescription>
          </Alert>
        </VStack>
      </Container>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="2xl" py={8}>
        <VStack spacing={8}>
        <Box textAlign="center">
          <Icon as={FaUsers} boxSize={16} color="blue.500" mb={4} />
          <Heading size="xl" mb={2}>Configuration Famille</Heading>
          <Text color="gray.600">
            Créez votre famille ou rejoignez une famille existante
          </Text>
        </Box>

        <Box w="100%" bg="white" p={8} borderRadius="lg" shadow="md">
          <RadioGroup onChange={(value) => setMode(value as 'create' | 'join')} value={mode}>
            <Stack direction={{ base: 'column', md: 'row' }} spacing={4} mb={6}>
              <Box
                flex={1}
                p={6}
                borderWidth={2}
                borderRadius="lg"
                borderColor={mode === 'create' ? 'blue.500' : 'gray.200'}
                bg={mode === 'create' ? 'blue.50' : 'white'}
                cursor="pointer"
                onClick={() => setMode('create')}
                transition="all 0.2s"
              >
                <Radio value="create" size="lg" colorScheme="blue" mb={3}>
                  <HStack spacing={2}>
                    <Icon as={FaHome} />
                    <Text fontWeight="bold">Créer une famille</Text>
                  </HStack>
                </Radio>
                <Text fontSize="sm" color="gray.600" ml={6}>
                  Devenez le fondateur et obtenez un code d'invitation
                </Text>
              </Box>

              <Box
                flex={1}
                p={6}
                borderWidth={2}
                borderRadius="lg"
                borderColor={mode === 'join' ? 'blue.500' : 'gray.200'}
                bg={mode === 'join' ? 'blue.50' : 'white'}
                cursor="pointer"
                onClick={() => setMode('join')}
                transition="all 0.2s"
              >
                <Radio value="join" size="lg" colorScheme="blue" mb={3}>
                  <HStack spacing={2}>
                    <Icon as={FaKey} />
                    <Text fontWeight="bold">Rejoindre une famille</Text>
                  </HStack>
                </Radio>
                <Text fontSize="sm" color="gray.600" ml={6}>
                  Utilisez un code d'invitation pour rejoindre
                </Text>
              </Box>
            </Stack>
          </RadioGroup>

          <Divider my={6} />

          {mode === 'create' ? (
            <form onSubmit={handleCreateFamily}>
              <VStack spacing={4}>
                <Heading size="md" alignSelf="start">
                  Créer votre famille
                </Heading>

                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={createData.email}
                    onChange={(e) => setCreateData({ ...createData, email: e.target.value })}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Mot de passe</FormLabel>
                  <Input
                    type="password"
                    value={createData.password}
                    onChange={(e) => setCreateData({ ...createData, password: e.target.value })}
                  />
                </FormControl>

                <HStack w="100%" spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Prénom</FormLabel>
                    <Input
                      value={createData.firstName}
                      onChange={(e) => setCreateData({ ...createData, firstName: e.target.value })}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Nom</FormLabel>
                    <Input
                      value={createData.lastName}
                      onChange={(e) => setCreateData({ ...createData, lastName: e.target.value })}
                    />
                  </FormControl>
                </HStack>

                <FormControl isRequired>
                  <FormLabel>Nom de la famille</FormLabel>
                  <Input
                    value={createData.familyName}
                    onChange={(e) => setCreateData({ ...createData, familyName: e.target.value })}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Sexe</FormLabel>
                  <RadioGroup
                    value={createData.sex}
                    onChange={(value) => setCreateData({ ...createData, sex: value })}
                  >
                    <Stack direction="row" spacing={4}>
                      <Radio value="M">Homme</Radio>
                      <Radio value="F">Femme</Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  w="100%"
                  isLoading={loading}
                  leftIcon={<Icon as={FaHome} />}
                >
                  Créer ma famille
                </Button>
              </VStack>
            </form>
          ) : (
            <form onSubmit={handleJoinFamily}>
              <VStack spacing={4}>
                <Heading size="md" alignSelf="start">
                  Rejoindre une famille
                </Heading>

                <FormControl isRequired>
                  <FormLabel>Code d'invitation</FormLabel>
                  <Input
                    value={joinData.inviteCode}
                    onChange={(e) => setJoinData({ ...joinData, inviteCode: e.target.value.toUpperCase() })}
                    textTransform="uppercase"
                    fontSize="lg"
                    textAlign="center"
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Format : XXX-NNNN (ex: DUP-1234)
                  </Text>
                </FormControl>

                <Divider my={2} />

                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={joinData.email}
                    onChange={(e) => setJoinData({ ...joinData, email: e.target.value })}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Mot de passe</FormLabel>
                  <Input
                    type="password"
                    value={joinData.password}
                    onChange={(e) => setJoinData({ ...joinData, password: e.target.value })}
                  />
                </FormControl>

                <HStack w="100%" spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Prénom</FormLabel>
                    <Input
                      value={joinData.firstName}
                      onChange={(e) => setJoinData({ ...joinData, firstName: e.target.value })}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Nom</FormLabel>
                    <Input
                      value={joinData.lastName}
                      onChange={(e) => setJoinData({ ...joinData, lastName: e.target.value })}
                    />
                  </FormControl>
                </HStack>

                <FormControl isRequired>
                  <FormLabel>Sexe</FormLabel>
                  <RadioGroup
                    value={joinData.sex}
                    onChange={(value) => setJoinData({ ...joinData, sex: value })}
                  >
                    <Stack direction="row" spacing={4}>
                      <Radio value="M">Homme</Radio>
                      <Radio value="F">Femme</Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="green"
                  size="lg"
                  w="100%"
                  isLoading={loading}
                  leftIcon={<Icon as={FaKey} />}
                >
                  Rejoindre la famille
                </Button>
              </VStack>
            </form>
          )}
        </Box>

        <Button variant="link" onClick={() => navigate('/login')}>
          Déjà inscrit ? Se connecter
        </Button>
      </VStack>
    </Container>
    </Box>
  );
};

export default FamilySetup;
