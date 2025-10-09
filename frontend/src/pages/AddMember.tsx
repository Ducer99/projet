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
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const personData = {
        ...formData,
        birthday: formData.birthday ? new Date(formData.birthday).toISOString() : null,
        deathDate: formData.deathDate ? new Date(formData.deathDate).toISOString() : null,
        cityID: formData.cityID || 1 // Par défaut ville ID 1
      };

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
                      placeholder={t('addMemberForm.firstNamePlaceholder')}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>{t('addMemberForm.lastName')}</FormLabel>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder={t('addMemberForm.lastNamePlaceholder')}
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
                    placeholder={t('addMemberForm.emailPlaceholder')}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>{t('addMemberForm.activity')}</FormLabel>
                  <Input
                    value={formData.activity}
                    onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                    placeholder={t('addMemberForm.activityPlaceholder')}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>{t('addMemberForm.photoUrl')}</FormLabel>
                  <Input
                    value={formData.photoUrl}
                    onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                    placeholder={t('addMemberForm.photoUrlPlaceholder')}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>{t('addMemberForm.notes')}</FormLabel>
                  <Input
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder={t('addMemberForm.notesPlaceholder')}
                  />
                </FormControl>

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
