import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  useToast,
  HStack,
  Icon,
  Text,
  Alert,
  AlertIcon,
  Divider,
  Card,
  CardBody,
  CardHeader,
  Textarea,
  Switch,
  Tooltip,
  Avatar,
  Flex
} from '@chakra-ui/react';
import { FaHeart, FaArrowLeft, FaUsers, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

interface Person {
  personID: number;
  firstName: string;
  lastName: string;
  sex: string;
  birthDate?: string;
  photoUrl?: string;
  isMarried?: boolean;
  currentSpouses?: string[];
}

interface ExistingUnion {
  weddingID: number;
  spouseName: string;
  weddingDate: string;
  status: string;
}

const WeddingForm = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(false);
  const [persons, setPersons] = useState<Person[]>([]);
  const [selectedManUnions, setSelectedManUnions] = useState<ExistingUnion[]>([]);
  const [selectedWomanUnions, setSelectedWomanUnions] = useState<ExistingUnion[]>([]);
  const [showPolygamyWarning, setShowPolygamyWarning] = useState(false);
  const [formData, setFormData] = useState({
    manID: '',
    womanID: '',
    weddingDate: '',
    location: '',
    notes: '',
    unionType: 'civile',
    unionLocation: '',
    isFormalMarriage: true,
    acknowledgePolygamy: false
  });

  useEffect(() => {
    loadPersons();
    if (id) {
      loadWedding();
    }
  }, [id]);

  const loadPersons = async () => {
    if (!user?.familyID) return;
    
    try {
      const response = await api.get(`/persons/family/${user.familyID}`);
      setPersons(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des membres:', error);
    }
  };

  const loadWedding = async () => {
    try {
      const response = await api.get(`/marriages/${id}`);
      const wedding = response.data;
      setFormData({
        manID: wedding.manID,
        womanID: wedding.womanID,
        weddingDate: wedding.weddingDate.split('T')[0],
        location: wedding.location || '',
        notes: wedding.notes || '',
        unionType: wedding.unions?.[0]?.unionType || 'civile',
        unionLocation: wedding.unions?.[0]?.location || '',
        isFormalMarriage: wedding.isFormalMarriage ?? true,
        acknowledgePolygamy: false
      });
    } catch (error) {
      console.error('Erreur lors du chargement du mariage:', error);
    }
  };

  // Vérifier les unions existantes lors de la sélection d'une personne
  const checkExistingUnions = async (personId: string, isMan: boolean) => {
    if (!personId) return;
    
    try {
      const response = await api.get(`/marriages/person/${personId}/active`);
      const unions = response.data || [];
      
      if (isMan) {
        setSelectedManUnions(unions);
      } else {
        setSelectedWomanUnions(unions);
      }
      
      // Afficher l'avertissement de polygamie si nécessaire
      if (unions.length > 0) {
        setShowPolygamyWarning(true);
      } else {
        setShowPolygamyWarning(false);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des unions existantes:', error);
    }
  };

  const handlePersonSelection = (personId: string, isMan: boolean) => {
    if (isMan) {
      setFormData({ ...formData, manID: personId });
    } else {
      setFormData({ ...formData, womanID: personId });
    }
    
    checkExistingUnions(personId, isMan);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.manID || !formData.womanID || !formData.weddingDate) {
      toast({
        title: t('common.error'),
        description: t('common.requiredFields'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Vérification de la polygamie
    if (showPolygamyWarning && !formData.acknowledgePolygamy) {
      toast({
        title: t('common.warning'),
        description: t('weddings.polygamyRequired'),
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      
      if (id) {
        // Update existing wedding
        await api.put(`/marriages/${id}`, {
          manID: parseInt(formData.manID),
          womanID: parseInt(formData.womanID),
          weddingDate: formData.weddingDate,
          location: formData.location,
          notes: formData.notes,
          isFormalMarriage: formData.isFormalMarriage
        });
      } else {
        // Create new wedding
        const weddingData = {
          manID: parseInt(formData.manID),
          womanID: parseInt(formData.womanID),
          weddingDate: formData.weddingDate,
          location: formData.location,
          notes: formData.notes,
          patrilinealFamilyID: user?.familyID,
          isFormalMarriage: formData.isFormalMarriage
        };

        const weddingResponse = await api.post('/marriages', weddingData);

        // Add union si c'est une union formelle ou si spécifié
        if (formData.isFormalMarriage || formData.unionType) {
          await api.post(`/marriages/${weddingResponse.data.weddingID}/unions`, {
            unionType: formData.unionType,
            unionDate: formData.weddingDate,
            location: formData.unionLocation || formData.location,
            validated: true,
            isPolygamous: showPolygamyWarning
          });
        }
      }

      toast({
        title: t('common.success'),
        description: id ? t('common.modifiedSuccess') : t('common.createdSuccess'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      navigate('/weddings');
    } catch (error: any) {
      console.error('Erreur:', error);
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || t('common.unexpectedError'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const men = persons.filter(p => p.sex === 'M');
  const women = persons.filter(p => p.sex === 'F');

  const selectedMan = men.find(m => m.personID.toString() === formData.manID);
  const selectedWoman = women.find(w => w.personID.toString() === formData.womanID);

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="container.lg">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Flex justify="space-between" align="center">
            <Button
              leftIcon={<FaArrowLeft />}
              variant="ghost"
              onClick={() => navigate('/weddings')}
            >
              {t('common.back')}
            </Button>
            <HStack>
              <Icon as={FaHeart} boxSize={6} color="pink.500" />
              <Heading size="lg" color="gray.700">
                {id ? t('weddings.editUnionTitle') : t('weddings.createNewUnionTitle')}
              </Heading>
            </HStack>
            <Box w="150px" /> {/* Spacer */}
          </Flex>

          {/* Information sur la polygamie */}
          {showPolygamyWarning && (
            <Alert status="warning" borderRadius="md">
              <AlertIcon as={FaExclamationTriangle} />
              <Box>
                <Text fontWeight="bold">{t('weddings.polygamyDetected')}</Text>
                <Text fontSize="sm">
                  {t('weddings.polygamyExplanation')}
                </Text>
                {(selectedManUnions.length > 0 || selectedWomanUnions.length > 0) && (
                  <VStack mt={2} spacing={1} align="start">
                    {selectedManUnions.length > 0 && (
                      <Text fontSize="xs" color="gray.600">
                        {selectedMan?.firstName} {t('weddings.hasActiveUnions', { count: selectedManUnions.length })}
                      </Text>
                    )}
                    {selectedWomanUnions.length > 0 && (
                      <Text fontSize="xs" color="gray.600">
                        {selectedWoman?.firstName} {t('weddings.hasActiveUnions', { count: selectedWomanUnions.length })}
                      </Text>
                    )}
                  </VStack>
                )}
              </Box>
            </Alert>
          )}

          {/* Form */}
          <Card>
            <CardHeader>
              <Heading size="md" color="gray.700">
                <HStack>
                  <Icon as={FaUsers} color="pink.500" />
                  <Text>{t('weddings.unionInformation')}</Text>
                </HStack>
              </Heading>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit}>
                <VStack spacing={6}>
                  {/* Type d'union */}
                  <Card bg="blue.50" borderColor="blue.200" w="full">
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <HStack justify="space-between">
                          <Text fontWeight="bold" color="blue.700">{t('weddings.unionTypeLabel')}</Text>
                          <Tooltip label={t('weddings.unionTypeTooltip')}>
                            <Icon as={FaInfoCircle} color="blue.500" cursor="help" />
                          </Tooltip>
                        </HStack>
                        <HStack>
                          <Switch
                            colorScheme="blue"
                            isChecked={formData.isFormalMarriage}
                            onChange={(e) => setFormData({ ...formData, isFormalMarriage: e.target.checked })}
                          />
                          <Text>
                            {formData.isFormalMarriage ? t('weddings.formalMarriage') : t('weddings.informalUnion')}
                          </Text>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>

                  <HStack spacing={6} align="start" w="full">
                    {/* Sélection de l'époux */}
                    <FormControl isRequired flex={1}>
                      <FormLabel>
                        <HStack>
                          <Text>{t('weddings.spouseMale')}</Text>
                          {selectedMan && (
                            <Avatar size="xs" name={selectedMan.firstName} src={selectedMan.photoUrl} />
                          )}
                        </HStack>
                      </FormLabel>
                      <Select
                        value={formData.manID}
                        onChange={(e) => handlePersonSelection(e.target.value, true)}
                      >
                        {men.map((man) => (
                          <option key={man.personID} value={man.personID}>
                            {man.firstName} {man.lastName}
                            {man.isMarried ? ` ${t('weddings.alreadyMarried')}` : ''}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Sélection de l'épouse */}
                    <FormControl isRequired flex={1}>
                      <FormLabel>
                        <HStack>
                          <Text>{t('weddings.spouseFemale')}</Text>
                          {selectedWoman && (
                            <Avatar size="xs" name={selectedWoman.firstName} src={selectedWoman.photoUrl} />
                          )}
                        </HStack>
                      </FormLabel>
                      <Select
                        value={formData.womanID}
                        onChange={(e) => handlePersonSelection(e.target.value, false)}
                      >
                        {women.map((woman) => (
                          <option key={woman.personID} value={woman.personID}>
                            {woman.firstName} {woman.lastName}
                            {woman.isMarried ? ` ${t('weddings.alreadyMarriedFemale')}` : ''}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  </HStack>

                  {/* Aperçu du couple */}
                  {selectedMan && selectedWoman && (
                    <Card bg="pink.50" borderColor="pink.200" w="full">
                      <CardBody>
                        <HStack justify="center" spacing={4}>
                          <VStack>
                            <Avatar 
                              size="md" 
                              name={selectedMan.firstName} 
                              src={selectedMan.photoUrl}
                            />
                            <Text fontSize="sm" fontWeight="medium">
                              {selectedMan.firstName} {selectedMan.lastName}
                            </Text>
                          </VStack>
                          <Icon as={FaHeart} color="pink.500" boxSize={8} />
                          <VStack>
                            <Avatar 
                              size="md" 
                              name={selectedWoman.firstName} 
                              src={selectedWoman.photoUrl}
                            />
                            <Text fontSize="sm" fontWeight="medium">
                              {selectedWoman.firstName} {selectedWoman.lastName}
                            </Text>
                          </VStack>
                        </HStack>
                      </CardBody>
                    </Card>
                  )}

                  <HStack spacing={6} w="full">
                    {/* Date */}
                    <FormControl isRequired flex={1}>
                      <FormLabel>
                        {formData.isFormalMarriage ? t('weddings.marriageDate') : t('weddings.unionStartDate')}
                      </FormLabel>
                      <Input
                        type="date"
                        value={formData.weddingDate}
                        onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                      />
                    </FormControl>

                    {/* Type d'union (si formelle) */}
                    {formData.isFormalMarriage && (
                      <FormControl flex={1}>
                        <FormLabel>{t('weddings.ceremonyType')}</FormLabel>
                        <Select
                          value={formData.unionType}
                          onChange={(e) => setFormData({ ...formData, unionType: e.target.value })}
                        >
                          <option value="civile">{t('weddings.civilUnion')}</option>
                          <option value="religieuse">{t('weddings.religiousUnion')}</option>
                          <option value="coutumière">{t('weddings.customType')}</option>
                          <option value="traditionnelle">{t('weddings.traditionalUnion')}</option>
                          <option value="autre">{t('weddings.otherType')}</option>
                        </Select>
                      </FormControl>
                    )}
                  </HStack>

                  <FormControl>
                    <FormLabel>{t('weddings.location')}</FormLabel>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>{t('weddings.notes')}</FormLabel>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                    />
                  </FormControl>

                  {/* Confirmation de polygamie */}
                  {showPolygamyWarning && (
                    <Card bg="yellow.50" borderColor="yellow.300" w="full">
                      <CardBody>
                        <HStack align="start" spacing={3}>
                          <Switch
                            colorScheme="yellow"
                            isChecked={formData.acknowledgePolygamy}
                            onChange={(e) => setFormData({ ...formData, acknowledgePolygamy: e.target.checked })}
                          />
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold" color="yellow.700">
                              {t('weddings.polygamyAcknowledgeText')}
                            </Text>
                            <Text fontSize="sm" color="yellow.600">
                              {t('weddings.polygamySystemNote')}
                            </Text>
                          </VStack>
                        </HStack>
                      </CardBody>
                    </Card>
                  )}

                  <Divider />

                  <HStack spacing={4} w="full" pt={4}>
                    <Button
                      flex={1}
                      variant="outline"
                      onClick={() => navigate('/weddings')}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                      flex={1}
                      colorScheme="pink"
                      type="submit"
                      isLoading={loading}
                      isDisabled={showPolygamyWarning && !formData.acknowledgePolygamy}
                    >
                      {id ? t('weddings.editUnion') : t('weddings.createUnion')}
                    </Button>
                  </HStack>
                </VStack>
              </form>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default WeddingForm;
