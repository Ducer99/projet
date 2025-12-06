import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
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
  AlertTitle,
  AlertDescription,
  useToast,
  Progress,
  Icon,
  HStack,
  FormHelperText,
} from '@chakra-ui/react';
import { FaHome, FaUsers } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

export default function FamilyAttachment() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [action, setAction] = useState<'create' | 'join' | ''>('');
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!action) {
      setError(t('family.pleaseChooseOption'));
      return;
    }

    if (action === 'create' && !familyName) {
      setError(t('family.pleaseEnterFamilyName'));
      return;
    }

    if (action === 'join' && !inviteCode) {
      setError(t('family.pleaseEnterInviteCode'));
      return;
    }

    setIsLoading(true);

    try {
      let response;
      
      // 🎯 Appels API différenciés selon l'action
      if (action === 'create') {
        // POST /api/families/create
        response = await api.post('/families/create', {
          familyName: familyName.trim(),
        });
      } else {
        // POST /api/families/join
        response = await api.post('/families/join', {
          inviteCode: inviteCode.trim().toUpperCase(),
        });
      }

      const { token } = response.data;
      if (token) {
        localStorage.setItem('token', token);
      }

      toast({
        title: t('family.familyConfigured'),
        description: action === 'create' 
          ? t('family.familyCreatedSuccess') 
          : t('family.joinedFamily'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || t('family.familyConfigurationError');
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

  const handleSkip = () => {
    toast({
      title: t('family.configurationPostponed'),
      description: t('family.canConfigureLater'),
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    navigate('/dashboard');
  };

  return (
    <Box
      minH="100vh"
      bgGradient="linear(to-br, purple.600, purple.800)"
      py={12}
    >
      <Container maxW="2xl">
        <VStack spacing={8}>
          <VStack spacing={2}>
            <Heading color="white" size="2xl">
              {t('family.familyConfiguration')}
            </Heading>
            <Text color="whiteAlpha.800" fontSize="lg">
              {t('family.createOrJoinFamily')}
            </Text>
          </VStack>

          <Box w="100%" px={4}>
            <Progress value={100} colorScheme="green" borderRadius="full" />
            <Text color="whiteAlpha.700" fontSize="sm" mt={2} textAlign="center">
              {t('family.step3of3')}
            </Text>
          </Box>

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
              <VStack spacing={6}>
                <FormControl isRequired>
                  <FormLabel fontSize="lg" fontWeight="semibold" mb={4}>
                    {t('family.whatDoYouWantToDo')}
                  </FormLabel>
                  
                  {/* 🎨 SELECTABLE CARDS - Design Premium */}
                  <VStack spacing={4} w="100%">
                    {/* Carte "Créer une famille" */}
                    <Box
                      p={5}
                      borderWidth={action === 'create' ? '2px' : '1px'}
                      borderColor={action === 'create' ? '#7C3AED' : '#E5E7EB'}
                      bg={action === 'create' ? '#F5F3FF' : 'white'}
                      borderRadius="12px"
                      cursor="pointer"
                      onClick={() => setAction('create')}
                      transition="all 0.2s ease-in-out"
                      boxShadow={action === 'create' ? '0 4px 6px -1px rgba(124, 58, 237, 0.1)' : 'none'}
                      _hover={{ 
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 12px -2px rgba(124, 58, 237, 0.15)',
                      }}
                      w="100%"
                    >
                      <HStack spacing={4} align="flex-start">
                        <Icon 
                          as={FaHome} 
                          boxSize={8} 
                          color={action === 'create' ? '#7C3AED' : 'gray.500'}
                          mt={1}
                        />
                        <VStack align="start" spacing={1} flex={1}>
                          <Text 
                            fontWeight="bold" 
                            fontSize="lg"
                            color={action === 'create' ? '#7C3AED' : 'gray.800'}
                          >
                            {t('family.createNewFamily')}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {t('family.youWillBeAdmin')}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>

                    {/* Carte "Rejoindre une famille" */}
                    <Box
                      p={5}
                      borderWidth={action === 'join' ? '2px' : '1px'}
                      borderColor={action === 'join' ? '#7C3AED' : '#E5E7EB'}
                      bg={action === 'join' ? '#F5F3FF' : 'white'}
                      borderRadius="12px"
                      cursor="pointer"
                      onClick={() => setAction('join')}
                      transition="all 0.2s ease-in-out"
                      boxShadow={action === 'join' ? '0 4px 6px -1px rgba(124, 58, 237, 0.1)' : 'none'}
                      _hover={{ 
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 12px -2px rgba(124, 58, 237, 0.15)',
                      }}
                      w="100%"
                    >
                      <HStack spacing={4} align="flex-start">
                        <Icon 
                          as={FaUsers} 
                          boxSize={8} 
                          color={action === 'join' ? '#7C3AED' : 'gray.500'}
                          mt={1}
                        />
                        <VStack align="start" spacing={1} flex={1}>
                          <Text 
                            fontWeight="bold" 
                            fontSize="lg"
                            color={action === 'join' ? '#7C3AED' : 'gray.800'}
                          >
                            {t('family.joinExistingFamily')}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {t('family.useInviteCode')}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  </VStack>
                </FormControl>

                {/* 📝 CHAMPS DYNAMIQUES - Affichage conditionnel */}
                {action === 'create' && (
                  <FormControl isRequired>
                    <FormLabel fontWeight="medium" color="gray.700">
                      {t('family.familyName')}
                    </FormLabel>
                    <Input
                      value={familyName}
                      onChange={(e) => setFamilyName(e.target.value)}
                      placeholder="Ex: Famille Dupont"
                      size="lg"
                      borderColor="gray.300"
                      _hover={{ borderColor: 'purple.400' }}
                      _focus={{
                        borderColor: 'purple.500',
                        boxShadow: '0 0 0 1px #7C3AED',
                      }}
                    />
                    <FormHelperText fontSize="xs" color="gray.500">
                      {t('family.nameVisibleToAll')}
                    </FormHelperText>
                  </FormControl>
                )}

                {action === 'join' && (
                  <FormControl isRequired>
                    <FormLabel fontWeight="medium" color="gray.700">
                      {t('family.invitationCode')}
                    </FormLabel>
                    <Input
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      placeholder="DUPONT2024"
                      size="lg"
                      textTransform="uppercase"
                      borderColor="gray.300"
                      _hover={{ borderColor: 'purple.400' }}
                      _focus={{
                        borderColor: 'purple.500',
                        boxShadow: '0 0 0 1px #7C3AED',
                      }}
                    />
                    <FormHelperText fontSize="xs" color="gray.500">
                      {t('family.askMemberForCode')}
                    </FormHelperText>
                  </FormControl>
                )}

                {/* 🎯 BOUTON DYNAMIQUE - Texte adaptatif */}
                <VStack spacing={3} w="100%">
                  <Button
                    type="submit"
                    colorScheme="purple"
                    size="lg"
                    w="100%"
                    isLoading={isLoading}
                    loadingText={action === 'create' ? t('family.creating') : t('family.joining')}
                    isDisabled={!action || (action === 'create' && !familyName) || (action === 'join' && !inviteCode)}
                    leftIcon={<Icon as={action === 'create' ? FaHome : FaUsers} />}
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'lg',
                    }}
                    transition="all 0.2s"
                  >
                    {action === 'create' && t('family.createFamily')}
                    {action === 'join' && t('family.joinFamily')}
                    {!action && t('family.chooseOption')}
                  </Button>

                  <Button
                    variant="ghost"
                    size="lg"
                    w="100%"
                    onClick={handleSkip}
                  >
                    {t('family.skipForNow')}
                  </Button>
                </VStack>
              </VStack>
            </form>
          </Box>

          <Alert
            status="info"
            variant="subtle"
            borderRadius="lg"
            bg="whiteAlpha.200"
            color="white"
          >
            <AlertIcon color="white" />
            <Box>
              <AlertTitle>{t('family.needHelp')}</AlertTitle>
              <AlertDescription>
                {t('family.canConfigureFromSettings')}
              </AlertDescription>
            </Box>
          </Alert>
        </VStack>
      </Container>
    </Box>
  );
}
