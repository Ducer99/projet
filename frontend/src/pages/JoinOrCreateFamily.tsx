import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  Input,
  FormControl,
  FormLabel,
  useToast,
  Icon,
  Card,
  CardBody,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { FaUsers, FaPlus, FaKey, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const JoinOrCreateFamily: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();

  const [choice, setChoice] = useState<'join' | 'create' | null>(null);
  const [familyName, setFamilyName] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateFamily = async () => {
    if (!familyName.trim()) {
      toast({
        title: t('error'),
        description: 'Veuillez entrer le nom de votre famille',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post(
        '/families/create',
        { familyName: familyName.trim() }
      );

      toast({
        title: 'Famille créée ! 🎉',
        description: `Bienvenue dans la famille ${familyName}`,
        status: 'success',
        duration: 4000,
        isClosable: true,
      });

      // Mettre à jour le localStorage avec la nouvelle familyID
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        userData.FamilyID = response.data.familyID;
        localStorage.setItem('user', JSON.stringify(userData));
      } catch {
        localStorage.removeItem('user');
      }

      // Rediriger vers le dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de créer la famille',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinFamily = async () => {
    if (!invitationCode.trim()) {
      toast({
        title: t('error'),
        description: 'Veuillez entrer votre code d\'invitation',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post(
        '/families/join',
        { invitationCode: invitationCode.trim() }
      );

      toast({
        title: 'Vous avez rejoint la famille ! 🎉',
        description: `Bienvenue dans ${response.data.familyName}`,
        status: 'success',
        duration: 4000,
        isClosable: true,
      });

      // Mettre à jour le localStorage avec la nouvelle familyID
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        userData.FamilyID = response.data.familyID;
        userData.FamilyName = response.data.familyName;
        localStorage.setItem('user', JSON.stringify(userData));
      } catch {
        localStorage.removeItem('user');
      }

      // Rediriger vers le dashboard
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
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setChoice(null);
    setFamilyName('');
    setInvitationCode('');
  };

  return (
    <Box minH="100vh" bg="transparent">
      <Container maxW="container.md" py={20}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={3} textAlign="center">
            <Icon as={FaUsers} boxSize={16} color="purple.600" />
            <Heading size="2xl" bgGradient="linear(to-r, purple.600, purple.500)" bgClip="text">
              Bienvenue ! 🎉
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="500px">
              Vous êtes maintenant connecté(e). Pour continuer, choisissez comment rejoindre l'arbre généalogique.
            </Text>
          </VStack>

          {/* Choix initial ou formulaire */}
          {!choice ? (
            <>
              {/* Option 1 : Rejoindre une famille */}
              <Card
                cursor="pointer"
                onClick={() => setChoice('join')}
                transition="all 0.3s"
                _hover={{
                  transform: 'translateY(-4px)',
                  shadow: 'xl',
                  borderColor: 'purple.500',
                }}
                borderWidth={2}
                borderColor="transparent"
              >
                <CardBody>
                  <Flex align="center" gap={4}>
                    <Icon as={FaKey} boxSize={10} color="purple.500" />
                    <Box flex="1">
                      <Heading size="md" mb={2}>
                        💌 J'ai un code d'invitation
                      </Heading>
                      <Text color="gray.600">
                        Un membre de votre famille vous a envoyé un lien ou un code ? Collez-le ici pour les rejoindre.
                      </Text>
                    </Box>
                    <Icon as={FaArrowRight} color="purple.500" />
                  </Flex>
                </CardBody>
              </Card>

              {/* Option 2 : Créer une famille */}
              <Card
                cursor="pointer"
                onClick={() => setChoice('create')}
                transition="all 0.3s"
                _hover={{
                  transform: 'translateY(-4px)',
                  shadow: 'xl',
                  borderColor: 'purple.600',
                }}
                borderWidth={2}
                borderColor="transparent"
              >
                <CardBody>
                  <Flex align="center" gap={4}>
                    <Icon as={FaPlus} boxSize={10} color="purple.600" />
                    <Box flex="1">
                      <Heading size="md" mb={2}>
                        🌳 Créer une nouvelle famille
                      </Heading>
                      <Text color="gray.600">
                        Commencez votre propre arbre généalogique. Vous serez le premier membre et pourrez inviter d'autres personnes.
                      </Text>
                    </Box>
                    <Icon as={FaArrowRight} color="purple.600" />
                  </Flex>
                </CardBody>
              </Card>
            </>
          ) : (
            <>
              {/* Formulaire de création de famille */}
              {choice === 'create' && (
                <Card>
                  <CardBody>
                    <VStack spacing={6} align="stretch">
                      <Box>
                        <Heading size="lg" mb={2}>
                          🌳 Créer votre famille
                        </Heading>
                        <Text color="gray.600">
                          Choisissez le nom de votre famille (vous pourrez le modifier plus tard)
                        </Text>
                      </Box>

                      <FormControl isRequired>
                        <FormLabel>Nom de la famille</FormLabel>
                        <Input
                          size="lg"
                          value={familyName}
                          onChange={(e) => setFamilyName(e.target.value)}
                          autoFocus
                        />
                      </FormControl>

                      <Flex gap={3}>
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={handleReset}
                          isDisabled={isLoading}
                        >
                          Retour
                        </Button>
                        <Button
                          flex="1"
                          size="lg"
                          bgGradient="linear(to-r, purple.600, purple.500)"
                          color="white"
                          _hover={{
                            bgGradient: 'linear(to-r, purple.700, purple.600)',
                            transform: 'translateY(-2px)',
                            shadow: 'lg',
                          }}
                          onClick={handleCreateFamily}
                          isLoading={isLoading}
                          loadingText="Création..."
                        >
                          Créer ma famille
                        </Button>
                      </Flex>
                    </VStack>
                  </CardBody>
                </Card>
              )}

              {/* Formulaire de rejoindre une famille */}
              {choice === 'join' && (
                <Card>
                  <CardBody>
                    <VStack spacing={6} align="stretch">
                      <Box>
                        <Heading size="lg" mb={2}>
                          💌 Rejoindre une famille
                        </Heading>
                        <Text color="gray.600">
                          Collez le code d'invitation ou le lien reçu par email
                        </Text>
                      </Box>

                      <FormControl isRequired>
                        <FormLabel>Code d'invitation</FormLabel>
                        <InputGroup size="lg">
                          <InputLeftElement>
                            <Icon as={FaKey} color="gray.400" />
                          </InputLeftElement>
                          <Input
                            value={invitationCode}
                            onChange={(e) => setInvitationCode(e.target.value)}
                            autoFocus
                          />
                        </InputGroup>
                      </FormControl>

                      <Flex gap={3}>
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={handleReset}
                          isDisabled={isLoading}
                        >
                          Retour
                        </Button>
                        <Button
                          flex="1"
                          size="lg"
                          bgGradient="linear(to-r, purple.500, purple.600)"
                          color="white"
                          _hover={{
                            bgGradient: 'linear(to-r, purple.600, purple.700)',
                            transform: 'translateY(-2px)',
                            shadow: 'lg',
                          }}
                          onClick={handleJoinFamily}
                          isLoading={isLoading}
                          loadingText="Connexion..."
                        >
                          Rejoindre la famille
                        </Button>
                      </Flex>
                    </VStack>
                  </CardBody>
                </Card>
              )}
            </>
          )}

          {/* Message d'aide */}
          <Box textAlign="center" pt={4}>
            <Text fontSize="sm" color="gray.500">
              Vous pourrez toujours changer de famille plus tard dans les paramètres
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default JoinOrCreateFamily;
