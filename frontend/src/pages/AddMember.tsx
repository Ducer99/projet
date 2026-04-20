import { useState } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  useToast,
  HStack,
  Text,
  Icon,
  Flex,
  SimpleGrid,
  Divider,
  Badge,
  Textarea,
  Switch,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaMale, FaFemale, FaTimes } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

export default function AddMember() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    sex: 'M',
    birthday: '',
    email: '',
    activity: '',
    photoUrl: '',
    notes: '',
    alive: true,
    deathDate: '',
    fatherID: null as number | null,
    motherID: null as number | null,
    cityID: 0,
  });

  const [fatherFirstName, setFatherFirstName] = useState('');
  const [fatherLastName, setFatherLastName] = useState('');
  const [motherFirstName, setMotherFirstName] = useState('');
  const [motherLastName, setMotherLastName] = useState('');

  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const set = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast({ title: 'Prénom et nom obligatoires', status: 'error', duration: 3000, position: 'top' });
      return;
    }
    setSaving(true);
    try {
      const personData: any = {
        ...formData,
        birthday: formData.birthday ? new Date(formData.birthday).toISOString() : null,
        deathDate: formData.deathDate ? new Date(formData.deathDate).toISOString() : null,
        cityID: formData.cityID || 1,
      };
      if (fatherFirstName || fatherLastName) {
        personData.fatherFirstName = fatherFirstName;
        personData.fatherLastName = fatherLastName;
        delete personData.fatherID;
      }
      if (motherFirstName || motherLastName) {
        personData.motherFirstName = motherFirstName;
        personData.motherLastName = motherLastName;
        delete personData.motherID;
      }

      await api.post('/persons', personData);

      toast({
        title: `${formData.firstName} ${formData.lastName} ajouté !`,
        status: 'success',
        duration: 3000,
        position: 'top',
      });
      navigate('/persons');
    } catch (error: any) {
      toast({
        title: t('addMemberForm.errorTitle'),
        description: error.response?.data?.message || t('addMemberForm.errorMessage'),
        status: 'error',
        duration: 4000,
        position: 'top',
      });
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    h: '44px',
    borderRadius: '8px',
    borderColor: 'gray.200',
    bg: 'gray.50',
    _hover: { borderColor: 'purple.300', bg: 'white' },
    _focus: { borderColor: 'purple.500', bg: 'white', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' },
  };

  return (
    <Box minH="100vh" bg="transparent">
      {/* Header gradient */}
      <Box bgGradient="linear(to-r, purple.900, purple.700)" px={6} py={8}>
        <Container maxW="container.md">
          <HStack spacing={4}>
            <Flex
              w="56px" h="56px"
              borderRadius="xl"
              bg="whiteAlpha.200"
              align="center"
              justify="center"
            >
              <Icon as={FaUserPlus} color="white" fontSize="24px" />
            </Flex>
            <Box>
              <Heading color="white" size="lg">{t('addMemberForm.title')}</Heading>
              <Text color="whiteAlpha.800" fontSize="sm" mt={1}>
                {t('addMemberForm.subtitle')}
              </Text>
            </Box>
          </HStack>
        </Container>
      </Box>

      <Container maxW="container.md" py={8}>
        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">

            {/* Informations personnelles */}
            <Box bg="white" borderRadius="xl" shadow="card" border="1px solid" borderColor="purple.50" overflow="hidden">
              <Box px={6} py={4} borderBottomWidth={1} borderColor="gray.100">
                <HStack>
                  <Badge colorScheme="purple" borderRadius="full" px={3} py={1}>1</Badge>
                  <Text fontWeight="bold" color="gray.700">Informations personnelles</Text>
                </HStack>
              </Box>
              <Box px={6} py={6}>
                <VStack spacing={5}>
                  <SimpleGrid columns={2} spacing={4} w="100%">
                    <FormControl isRequired>
                      <FormLabel fontSize="sm" color="gray.600" fontWeight="medium">{t('addMemberForm.firstName')}</FormLabel>
                      <Input {...inputStyle} value={formData.firstName} onChange={(e) => set('firstName', e.target.value)} placeholder="Prénom" />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel fontSize="sm" color="gray.600" fontWeight="medium">{t('addMemberForm.lastName')}</FormLabel>
                      <Input {...inputStyle} value={formData.lastName} onChange={(e) => set('lastName', e.target.value)} placeholder="Nom de famille" />
                    </FormControl>
                  </SimpleGrid>

                  <SimpleGrid columns={2} spacing={4} w="100%">
                    <FormControl isRequired>
                      <FormLabel fontSize="sm" color="gray.600" fontWeight="medium">{t('addMemberForm.sex')}</FormLabel>
                      <Select {...inputStyle} value={formData.sex} onChange={(e) => set('sex', e.target.value)}>
                        <option value="M">Homme</option>
                        <option value="F">Femme</option>
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm" color="gray.600" fontWeight="medium">{t('addMemberForm.birthday')}</FormLabel>
                      <Input {...inputStyle} type="date" value={formData.birthday} onChange={(e) => set('birthday', e.target.value)} />
                    </FormControl>
                  </SimpleGrid>

                  <SimpleGrid columns={2} spacing={4} w="100%">
                    <FormControl>
                      <FormLabel fontSize="sm" color="gray.600" fontWeight="medium">{t('addMemberForm.email')}</FormLabel>
                      <Input {...inputStyle} type="email" value={formData.email} onChange={(e) => set('email', e.target.value)} placeholder="email@exemple.com" />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm" color="gray.600" fontWeight="medium">{t('addMemberForm.activity')}</FormLabel>
                      <Input {...inputStyle} value={formData.activity} onChange={(e) => set('activity', e.target.value)} placeholder="Profession, activité..." />
                    </FormControl>
                  </SimpleGrid>

                  <FormControl>
                    <FormLabel fontSize="sm" color="gray.600" fontWeight="medium">{t('addMemberForm.notes')}</FormLabel>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => set('notes', e.target.value)}
                      placeholder="Notes, biographie courte..."
                      rows={3}
                      borderRadius="8px"
                      borderColor="gray.200"
                      bg="gray.50"
                      _hover={{ borderColor: 'purple.300', bg: 'white' }}
                      _focus={{ borderColor: 'purple.500', bg: 'white', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                    />
                  </FormControl>
                </VStack>
              </Box>
            </Box>

            {/* Parents */}
            <Box bg="white" borderRadius="xl" shadow="card" border="1px solid" borderColor="purple.50" overflow="hidden">
              <Box px={6} py={4} borderBottomWidth={1} borderColor="gray.100">
                <HStack>
                  <Badge colorScheme="purple" borderRadius="full" px={3} py={1}>2</Badge>
                  <Text fontWeight="bold" color="gray.700">Parents (optionnel)</Text>
                </HStack>
              </Box>
              <Box px={6} py={6}>
                <VStack spacing={5}>
                  {/* Père */}
                  <Box w="100%" p={4} bg="blue.50" borderRadius="lg" borderWidth={1} borderColor="blue.100">
                    <HStack mb={3}>
                      <Icon as={FaMale} color="blue.500" />
                      <Text fontWeight="semibold" color="blue.700" fontSize="sm">Père</Text>
                    </HStack>
                    <SimpleGrid columns={2} spacing={3}>
                      <FormControl>
                        <FormLabel fontSize="xs" color="gray.500">Prénom</FormLabel>
                        <Input size="sm" bg="white" borderRadius="6px" value={fatherFirstName} onChange={(e) => setFatherFirstName(e.target.value)} placeholder="Prénom du père" />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="xs" color="gray.500">Nom</FormLabel>
                        <Input size="sm" bg="white" borderRadius="6px" value={fatherLastName} onChange={(e) => setFatherLastName(e.target.value)} placeholder="Nom du père" />
                      </FormControl>
                    </SimpleGrid>
                    <Text fontSize="xs" color="blue.500" mt={2}>Un placeholder sera créé s'il n'existe pas encore dans l'arbre.</Text>
                  </Box>

                  {/* Mère */}
                  <Box w="100%" p={4} bg="pink.50" borderRadius="lg" borderWidth={1} borderColor="pink.100">
                    <HStack mb={3}>
                      <Icon as={FaFemale} color="pink.500" />
                      <Text fontWeight="semibold" color="pink.700" fontSize="sm">Mère</Text>
                    </HStack>
                    <SimpleGrid columns={2} spacing={3}>
                      <FormControl>
                        <FormLabel fontSize="xs" color="gray.500">Prénom</FormLabel>
                        <Input size="sm" bg="white" borderRadius="6px" value={motherFirstName} onChange={(e) => setMotherFirstName(e.target.value)} placeholder="Prénom de la mère" />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="xs" color="gray.500">Nom</FormLabel>
                        <Input size="sm" bg="white" borderRadius="6px" value={motherLastName} onChange={(e) => setMotherLastName(e.target.value)} placeholder="Nom de la mère" />
                      </FormControl>
                    </SimpleGrid>
                    <Text fontSize="xs" color="pink.500" mt={2}>Un placeholder sera créé s'il n'existe pas encore dans l'arbre.</Text>
                  </Box>
                </VStack>
              </Box>
            </Box>

            {/* Statut */}
            <Box bg="white" borderRadius="xl" shadow="card" border="1px solid" borderColor="purple.50" overflow="hidden">
              <Box px={6} py={4} borderBottomWidth={1} borderColor="gray.100">
                <HStack>
                  <Badge colorScheme="purple" borderRadius="full" px={3} py={1}>3</Badge>
                  <Text fontWeight="bold" color="gray.700">Statut vital</Text>
                </HStack>
              </Box>
              <Box px={6} py={6}>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between" p={4} bg={formData.alive ? 'green.50' : 'orange.50'} borderRadius="lg">
                    <Box>
                      <Text fontWeight="semibold" fontSize="sm" color={formData.alive ? 'green.700' : 'orange.700'}>
                        {formData.alive ? 'En vie' : 'Décédé(e)'}
                      </Text>
                      <Text fontSize="xs" color="gray.500" mt={0.5}>
                        {formData.alive
                          ? 'Cette personne pourra réclamer son profil plus tard.'
                          : 'Un profil commémoratif sera créé.'}
                      </Text>
                    </Box>
                    <Switch
                      isChecked={formData.alive}
                      onChange={(e) => set('alive', e.target.checked)}
                      colorScheme="green"
                      size="lg"
                    />
                  </HStack>

                  {!formData.alive && (
                    <FormControl>
                      <FormLabel fontSize="sm" color="gray.600" fontWeight="medium">{t('addMemberForm.deathDate')}</FormLabel>
                      <Input {...inputStyle} type="date" value={formData.deathDate} onChange={(e) => set('deathDate', e.target.value)} />
                    </FormControl>
                  )}
                </VStack>
              </Box>
            </Box>

            <Divider />

            {/* Actions */}
            <HStack spacing={4}>
              <Button
                flex={1}
                variant="outline"
                colorScheme="gray"
                h="48px"
                borderRadius="8px"
                leftIcon={<Icon as={FaTimes} />}
                onClick={() => navigate('/persons')}
              >
                {t('addMemberForm.cancel')}
              </Button>
              <Button
                type="submit"
                flex={2}
                h="48px"
                borderRadius="8px"
                bgGradient="linear(to-r, purple.500, purple.700)"
                color="white"
                fontWeight="semibold"
                leftIcon={<Icon as={FaUserPlus} />}
                isLoading={saving}
                loadingText="Ajout en cours..."
                _hover={{ bgGradient: 'linear(to-r, purple.900, purple.700)', transform: 'translateY(-1px)', boxShadow: 'lg' }}
                transition="all 0.2s"
              >
                {t('addMemberForm.submit')}
              </Button>
            </HStack>
          </VStack>
        </form>
      </Container>
    </Box>
  );
}
