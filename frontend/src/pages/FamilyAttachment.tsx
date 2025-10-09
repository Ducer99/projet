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
  RadioGroup,
  Radio,
  Stack,
  Progress,
  Icon,
  HStack,
} from '@chakra-ui/react';
import { FaHome, FaKey } from 'react-icons/fa';
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
      const response = await api.post('/auth/attach-family', {
        action,
        familyName: action === 'create' ? familyName : undefined,
        inviteCode: action === 'join' ? inviteCode : undefined,
      });

      const { token } = response.data;
      localStorage.setItem('token', token);

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
                  <FormLabel fontSize="lg" fontWeight="semibold">
                    {t('family.whatDoYouWantToDo')}
                  </FormLabel>
                  <RadioGroup value={action} onChange={(value) => setAction(value as 'create' | 'join')}>
                    <Stack spacing={4}>
                      <Box
                        p={4}
                        borderWidth={2}
                        borderColor={action === 'create' ? 'purple.500' : 'gray.200'}
                        borderRadius="lg"
                        cursor="pointer"
                        onClick={() => setAction('create')}
                        transition="all 0.2s"
                        _hover={{ borderColor: 'purple.300' }}
                      >
                        <HStack>
                          <Radio value="create" size="lg" colorScheme="purple" />
                          <Icon as={FaHome} color="purple.500" boxSize={5} />
                          <VStack align="start" spacing={0} flex={1}>
                            <Text fontWeight="semibold">{t('family.createNewFamily')}</Text>
                            <Text fontSize="sm" color="gray.600">
                              {t('family.youWillBeAdmin')}
                            </Text>
                          </VStack>
                        </HStack>
                      </Box>

                      <Box
                        p={4}
                        borderWidth={2}
                        borderColor={action === 'join' ? 'purple.500' : 'gray.200'}
                        borderRadius="lg"
                        cursor="pointer"
                        onClick={() => setAction('join')}
                        transition="all 0.2s"
                        _hover={{ borderColor: 'purple.300' }}
                      >
                        <HStack>
                          <Radio value="join" size="lg" colorScheme="purple" />
                          <Icon as={FaKey} color="purple.500" boxSize={5} />
                          <VStack align="start" spacing={0} flex={1}>
                            <Text fontWeight="semibold">{t('family.joinExistingFamily')}</Text>
                            <Text fontSize="sm" color="gray.600">
                              {t('family.useInviteCode')}
                            </Text>
                          </VStack>
                        </HStack>
                      </Box>
                    </Stack>
                  </RadioGroup>
                </FormControl>

                {action === 'create' && (
                  <FormControl isRequired>
                    <FormLabel>{t('family.familyName')}</FormLabel>
                    <Input
                      value={familyName}
                      onChange={(e) => setFamilyName(e.target.value)}
                      placeholder={t('family.familyNamePlaceholder')}
                      size="lg"
                    />
                    <Text fontSize="sm" color="gray.600" mt={1}>
                      {t('family.nameVisibleToAll')}
                    </Text>
                  </FormControl>
                )}

                {action === 'join' && (
                  <FormControl isRequired>
                    <FormLabel>{t('family.invitationCode')}</FormLabel>
                    <Input
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      placeholder={t('family.inviteCodePlaceholder')}
                      size="lg"
                      textTransform="uppercase"
                    />
                    <Text fontSize="sm" color="gray.600" mt={1}>
                      {t('family.askMemberForCode')}
                    </Text>
                  </FormControl>
                )}

                <VStack spacing={3} w="100%">
                  <Button
                    type="submit"
                    colorScheme="purple"
                    size="lg"
                    w="100%"
                    isLoading={isLoading}
                    loadingText={t('family.configuring')}
                    isDisabled={!action}
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
