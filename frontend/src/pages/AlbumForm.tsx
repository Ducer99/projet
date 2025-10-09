import {
  Box,
  Container,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  useToast,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  RadioGroup,
  Radio,
  HStack
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

interface Event {
  eventID: number;
  title: string;
}

const AlbumForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventID, setEventID] = useState('');
  const [visibility, setVisibility] = useState('family');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await api.get<Event[]>('/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Erreur chargement événements:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le titre est obligatoire',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/albums', {
        title,
        description: description || null,
        eventID: eventID ? parseInt(eventID) : null,
        visibility
      });

      toast({
        title: 'Album créé !',
        description: 'Vous pouvez maintenant ajouter des photos',
        status: 'success',
        duration: 3000,
      });

      navigate(`/albums/${response.data.albumID}`);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de créer l\'album',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      {/* Breadcrumb */}
      <Breadcrumb mb={6} fontSize="sm" color="gray.600">
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/albums">Albums</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>Nouvel album</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      {/* Form */}
      <Box bg="white" p={8} borderRadius="xl" boxShadow="md">
        <Heading size="lg" mb={6} color="gray.800">
          📸 Créer un nouvel album
        </Heading>

        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            {/* Titre */}
            <FormControl isRequired>
              <FormLabel>Titre de l'album</FormLabel>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Mariage de Paul & Léa - 2023"
                size="lg"
              />
            </FormControl>

            {/* Description */}
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez cet album (optionnel)..."
                rows={4}
              />
            </FormControl>

            {/* Événement lié */}
            <FormControl>
              <FormLabel>Lié à un événement (optionnel)</FormLabel>
              <Select
                value={eventID}
                onChange={(e) => setEventID(e.target.value)}
                placeholder="Sélectionner un événement"
              >
                {events.map((event) => (
                  <option key={event.eventID} value={event.eventID}>
                    {event.title}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Visibilité */}
            <FormControl>
              <FormLabel>Visibilité</FormLabel>
              <RadioGroup value={visibility} onChange={setVisibility}>
                <VStack align="flex-start" spacing={3}>
                  <Radio value="family" size="lg">
                    <Box>
                      <Box fontWeight="medium">👨‍👩‍👧‍👦 Famille</Box>
                      <Box fontSize="sm" color="gray.600">
                        Tous les membres de la famille peuvent voir
                      </Box>
                    </Box>
                  </Radio>
                  <Radio value="private" size="lg">
                    <Box>
                      <Box fontWeight="medium">🔒 Privé</Box>
                      <Box fontSize="sm" color="gray.600">
                        Seulement vous pouvez voir
                      </Box>
                    </Box>
                  </Radio>
                  <Radio value="custom" size="lg">
                    <Box>
                      <Box fontWeight="medium">🔐 Personnalisé</Box>
                      <Box fontSize="sm" color="gray.600">
                        Choisir les membres autorisés
                      </Box>
                    </Box>
                  </Radio>
                </VStack>
              </RadioGroup>
            </FormControl>

            {/* Buttons */}
            <HStack spacing={4} pt={4}>
              <Button
                colorScheme="gray"
                variant="outline"
                onClick={() => navigate('/albums')}
                flex={1}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                colorScheme="orange"
                isLoading={loading}
                loadingText="Création..."
                flex={1}
                size="lg"
              >
                Créer l'album
              </Button>
            </HStack>
          </VStack>
        </form>
      </Box>
    </Container>
  );
};

export default AlbumForm;
