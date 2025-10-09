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
  Icon
} from '@chakra-ui/react';
import { FaHeart, FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface Person {
  personID: number;
  firstName: string;
  lastName: string;
  sex: string;
}

const WeddingForm = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [loading, setLoading] = useState(false);
  const [persons, setPersons] = useState<Person[]>([]);
  const [formData, setFormData] = useState({
    manID: '',
    womanID: '',
    weddingDate: '',
    location: '',
    notes: '',
    unionType: 'civile',
    unionLocation: ''
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
        unionLocation: wedding.unions?.[0]?.location || ''
      });
    } catch (error) {
      console.error('Erreur lors du chargement du mariage:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.manID || !formData.womanID || !formData.weddingDate) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      
      if (id) {
        // Update existing wedding
        await api.put(`/weddings/${id}`, {
          manID: parseInt(formData.manID),
          womanID: parseInt(formData.womanID),
          weddingDate: formData.weddingDate,
          location: formData.location,
          notes: formData.notes
        });
      } else {
        // Create new wedding
        const weddingResponse = await api.post('/weddings', {
          manID: parseInt(formData.manID),
          womanID: parseInt(formData.womanID),
          weddingDate: formData.weddingDate,
          location: formData.location,
          notes: formData.notes,
          patrilinealFamilyID: user?.familyID
        });

        // Add union
        await api.post(`/marriages/${weddingResponse.data.weddingID}/unions`, {
          unionType: formData.unionType,
          unionDate: formData.weddingDate,
          location: formData.unionLocation || formData.location,
          validated: true
        });
      }

      toast({
        title: 'Succès',
        description: id ? 'Mariage modifié avec succès' : 'Mariage créé avec succès',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      navigate('/weddings');
    } catch (error: any) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Une erreur est survenue',
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

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="container.md">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <HStack>
            <Button
              leftIcon={<FaArrowLeft />}
              variant="ghost"
              onClick={() => navigate('/weddings')}
            >
              Retour
            </Button>
            <HStack flex={1} justify="center">
              <Icon as={FaHeart} boxSize={6} color="pink.500" />
              <Heading size="lg" color="gray.700">
                {id ? 'Modifier le mariage' : 'Nouveau mariage'}
              </Heading>
            </HStack>
          </HStack>

          {/* Form */}
          <Box bg="white" borderRadius="xl" p={8} shadow="sm">
            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                <FormControl isRequired>
                  <FormLabel>Époux</FormLabel>
                  <Select
                    placeholder="Sélectionner l'époux"
                    value={formData.manID}
                    onChange={(e) => setFormData({ ...formData, manID: e.target.value })}
                  >
                    {men.map((man) => (
                      <option key={man.personID} value={man.personID}>
                        {man.firstName} {man.lastName}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Épouse</FormLabel>
                  <Select
                    placeholder="Sélectionner l'épouse"
                    value={formData.womanID}
                    onChange={(e) => setFormData({ ...formData, womanID: e.target.value })}
                  >
                    {women.map((woman) => (
                      <option key={woman.personID} value={woman.personID}>
                        {woman.firstName} {woman.lastName}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Date du mariage</FormLabel>
                  <Input
                    type="date"
                    value={formData.weddingDate}
                    onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Type d'union</FormLabel>
                  <Select
                    value={formData.unionType}
                    onChange={(e) => setFormData({ ...formData, unionType: e.target.value })}
                  >
                    <option value="coutumière">Coutumière</option>
                    <option value="civile">Civile</option>
                    <option value="religieuse">Religieuse</option>
                    <option value="traditionnelle">Traditionnelle</option>
                    <option value="autre">Autre</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Lieu</FormLabel>
                  <Input
                    placeholder="Ville, pays..."
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Notes</FormLabel>
                  <Input
                    placeholder="Notes supplémentaires..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </FormControl>

                <HStack spacing={4} w="full" pt={4}>
                  <Button
                    flex={1}
                    variant="outline"
                    onClick={() => navigate('/weddings')}
                  >
                    Annuler
                  </Button>
                  <Button
                    flex={1}
                    colorScheme="pink"
                    type="submit"
                    isLoading={loading}
                  >
                    {id ? 'Modifier' : 'Créer'}
                  </Button>
                </HStack>
              </VStack>
            </form>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default WeddingForm;
