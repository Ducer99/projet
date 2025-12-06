import { useState } from 'react';
import {
  Container,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  useToast,
  Card,
  CardBody,
  HStack,
  Text,
  Icon,
  Alert,
  AlertIcon,
  AlertDescription
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus } from 'react-icons/fa';
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
    cityID: 0
  });
  
  // États pour la saisie manuelle des parents
  const [fatherMode, setFatherMode] = useState<'select' | 'manual'>('manual');
  const [motherMode, setMotherMode] = useState<'select' | 'manual'>('manual');
  const [fatherFirstName, setFatherFirstName] = useState('');
  const [fatherLastName, setFatherLastName] = useState('');
  const [motherFirstName, setMotherFirstName] = useState('');
  const [motherLastName, setMotherLastName] = useState('');
  
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const personData: any = {
        ...formData,
        birthday: formData.birthday ? new Date(formData.birthday).toISOString() : null,
        deathDate: formData.deathDate ? new Date(formData.deathDate).toISOString() : null,
        cityID: formData.cityID || 1 // Par défaut ville ID 1
      };

      // Gestion des parents selon le mode
      if (fatherMode === 'manual' && (fatherFirstName || fatherLastName)) {
        personData.fatherFirstName = fatherFirstName;
        personData.fatherLastName = fatherLastName;
        delete personData.fatherID;
      }
      
      if (motherMode === 'manual' && (motherFirstName || motherLastName)) {
        personData.motherFirstName = motherFirstName;
        personData.motherLastName = motherLastName;
        delete personData.motherID;
      }

      await api.post('/persons', personData);

      toast({
        title: t('addMemberForm.successTitle'),
        description: t('addMemberForm.successMessage', { 
          firstName: formData.firstName, 
          lastName: formData.lastName 
        }),
        status: 'success',
        duration: 3000,
      });

      navigate('/members');
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout:', error);
      toast({
        title: t('addMemberForm.errorTitle'),
        description: error.response?.data?.message || t('addMemberForm.errorMessage'),
        status: 'error',
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        {/* En-tête */}
        <HStack spacing={3}>
          <Icon as={FaUserPlus} boxSize={8} color="green.500" />
          <Heading size="lg" color="gray.800">
            {t('addMemberForm.title')}
          </Heading>
        </HStack>

        <Text color="gray.600" fontSize="lg">
          {t('addMemberForm.subtitle')}
        </Text>

        {/* Alerte de clarification */}
        <Alert 
          status="info" 
          variant="left-accent"
          borderRadius="lg"
          bg="blue.50"
          borderColor="blue.300"
        >
          <AlertIcon />
          <AlertDescription fontSize="sm">
            <Text fontWeight="bold" mb={1}>{t('addMemberForm.infoTitle')}</Text>
            <Text>
              {t('addMemberForm.infoDescription')}
            </Text>
          </AlertDescription>
        </Alert>

        {/* Formulaire */}
        <Card>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <Heading size="md" color="gray.700" alignSelf="flex-start">
                  {t('addMemberForm.personalInfo')}
                </Heading>

                <HStack spacing={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>{t('addMemberForm.firstName')}</FormLabel>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>{t('addMemberForm.lastName')}</FormLabel>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </FormControl>
                </HStack>

                <HStack spacing={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>{t('addMemberForm.sex')}</FormLabel>
                    <Select
                      value={formData.sex}
                      onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                    >
                      <option value="M">{t('addMemberForm.male')}</option>
                      <option value="F">{t('addMemberForm.female')}</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>{t('addMemberForm.birthday')}</FormLabel>
                    <Input
                      type="date"
                      value={formData.birthday}
                      onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                    />
                  </FormControl>
                </HStack>

                <FormControl>
                  <FormLabel>{t('addMemberForm.email')}</FormLabel>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>{t('addMemberForm.activity')}</FormLabel>
                  <Input
                    value={formData.activity}
                    onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>{t('addMemberForm.photoUrl')}</FormLabel>
                  <Input
                    value={formData.photoUrl}
                    onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>{t('addMemberForm.notes')}</FormLabel>
                  <Input
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </FormControl>

                {/* Section Parents */}
                <Heading size="md" color="gray.700" alignSelf="flex-start" pt={4}>
                  {t('editMember.parentsSection')}
                </Heading>

                {/* Père */}
                <Card bg="blue.50" borderColor="blue.200" borderWidth={1}>
                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between">
                        <Text fontWeight="bold" color="blue.700">
                          👨 {t('editMember.father')}
                        </Text>
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            variant={fatherMode === 'select' ? 'solid' : 'outline'}
                            colorScheme="blue"
                            onClick={() => setFatherMode('select')}
                          >
                            {t('editMember.selectFromList')}
                          </Button>
                          <Button
                            size="sm"
                            variant={fatherMode === 'manual' ? 'solid' : 'outline'}
                            colorScheme="blue"
                            onClick={() => setFatherMode('manual')}
                          >
                            {t('editMember.enterManually')}
                          </Button>
                        </HStack>
                      </HStack>

                      {fatherMode === 'select' ? (
                        <FormControl>
                          <Select
                            value={formData.fatherID || ''}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              fatherID: e.target.value ? parseInt(e.target.value) : null 
                            })}
                          >
                            {/* Liste des pères potentiels - à implémenter si nécessaire */}
                          </Select>
                        </FormControl>
                      ) : (
                        <VStack spacing={3}>
                          <HStack spacing={3} w="full">
                            <FormControl>
                              <FormLabel fontSize="sm">{t('editMember.firstName')}</FormLabel>
                              <Input
                                value={fatherFirstName}
                                onChange={(e) => setFatherFirstName(e.target.value)}
                                bg="white"
                              />
                            </FormControl>
                            <FormControl>
                              <FormLabel fontSize="sm">{t('editMember.lastName')}</FormLabel>
                              <Input
                                value={fatherLastName}
                                onChange={(e) => setFatherLastName(e.target.value)}
                                bg="white"
                              />
                            </FormControl>
                          </HStack>
                          <Text fontSize="xs" color="blue.600">
                            ℹ️ {t('editMember.placeholderWillBeCreated')}
                          </Text>
                        </VStack>
                      )}
                    </VStack>
                  </CardBody>
                </Card>

                {/* Mère */}
                <Card bg="pink.50" borderColor="pink.200" borderWidth={1}>
                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between">
                        <Text fontWeight="bold" color="pink.700">
                          👩 {t('editMember.mother')}
                        </Text>
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            variant={motherMode === 'select' ? 'solid' : 'outline'}
                            colorScheme="pink"
                            onClick={() => setMotherMode('select')}
                          >
                            {t('editMember.selectFromList')}
                          </Button>
                          <Button
                            size="sm"
                            variant={motherMode === 'manual' ? 'solid' : 'outline'}
                            colorScheme="pink"
                            onClick={() => setMotherMode('manual')}
                          >
                            {t('editMember.enterManually')}
                          </Button>
                        </HStack>
                      </HStack>

                      {motherMode === 'select' ? (
                        <FormControl>
                          <Select
                            value={formData.motherID || ''}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              motherID: e.target.value ? parseInt(e.target.value) : null 
                            })}
                          >
                            {/* Liste des mères potentielles - à implémenter si nécessaire */}
                          </Select>
                        </FormControl>
                      ) : (
                        <VStack spacing={3}>
                          <HStack spacing={3} w="full">
                            <FormControl>
                              <FormLabel fontSize="sm">{t('editMember.firstName')}</FormLabel>
                              <Input
                                value={motherFirstName}
                                onChange={(e) => setMotherFirstName(e.target.value)}
                                bg="white"
                              />
                            </FormControl>
                            <FormControl>
                              <FormLabel fontSize="sm">{t('editMember.lastName')}</FormLabel>
                              <Input
                                value={motherLastName}
                                onChange={(e) => setMotherLastName(e.target.value)}
                                bg="white"
                              />
                            </FormControl>
                          </HStack>
                          <Text fontSize="xs" color="pink.600">
                            ℹ️ {t('editMember.placeholderWillBeCreated')}
                          </Text>
                        </VStack>
                      )}
                    </VStack>
                  </CardBody>
                </Card>

                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">{t('addMemberForm.alive')}</FormLabel>
                  <Select
                    value={formData.alive ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, alive: e.target.value === 'true' })}
                    w="auto"
                  >
                    <option value="true">{t('addMemberForm.aliveYes')}</option>
                    <option value="false">{t('addMemberForm.aliveNo')}</option>
                  </Select>
                </FormControl>

                {/* 🕊️ Message explicatif selon le statut */}
                {formData.alive ? (
                  <Alert 
                    status="info" 
                    variant="left-accent"
                    borderRadius="md"
                    bg="blue.50"
                  >
                    <AlertIcon />
                    <AlertDescription fontSize="sm">
                      {t('addMemberForm.aliveInfo') || 
                        '✅ Cette personne pourra s\'inscrire et réclamer son profil plus tard.'}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert 
                    status="warning" 
                    variant="left-accent"
                    borderRadius="md"
                    bg="orange.50"
                  >
                    <AlertIcon />
                    <AlertDescription fontSize="sm">
                      {t('addMemberForm.deceasedInfo') || 
                        '🕊️ Un profil commémoratif sera créé. Cette personne ne pourra pas s\'inscrire.'}
                    </AlertDescription>
                  </Alert>
                )}

                {!formData.alive && (
                  <FormControl>
                    <FormLabel>{t('addMemberForm.deathDate')}</FormLabel>
                    <Input
                      type="date"
                      value={formData.deathDate}
                      onChange={(e) => setFormData({ ...formData, deathDate: e.target.value })}
                    />
                  </FormControl>
                )}

                <HStack spacing={4} w="full" pt={4}>
                  <Button
                    variant="outline"
                    colorScheme="gray"
                    onClick={() => navigate('/members')}
                    flex={1}
                  >
                    {t('addMemberForm.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    colorScheme="purple"
                    isLoading={saving}
                    loadingText={t('addMemberForm.submitting')}
                    flex={1}
                    leftIcon={<FaUserPlus />}
                  >
                    {t('addMemberForm.submit')}
                  </Button>
                </HStack>
              </VStack>
            </form>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
}
