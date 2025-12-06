import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Switch,
  VStack,
  HStack,
  useToast,
  RadioGroup,
  Radio,
  Stack,
  Text,
  Checkbox,
  CheckboxGroup,
  Avatar,
  Spinner,
  Flex,
  Badge,
  Icon,
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBackIcon, InfoIcon } from '@chakra-ui/icons';
import api from '../services/api';
import { CreateEventDto, UpdateEventDto, Person } from '../types';

const EventForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [members, setMembers] = useState<Person[]>([]);

  // Formulaire
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [eventType, setEventType] = useState<'birth' | 'marriage' | 'death' | 'birthday' | 'party' | 'other'>('party');
  const [location, setLocation] = useState('');
  const [visibility, setVisibility] = useState<'family' | 'private'>('family');
  const [isRecurring, setIsRecurring] = useState(false);
  const [participantIDs, setParticipantIDs] = useState<number[]>([]);

  // Charger les membres de la famille
  const loadMembers = async () => {
    try {
      setLoadingMembers(true);
      const response = await api.get<Person[]>('/persons');
      setMembers(response.data);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les membres',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoadingMembers(false);
    }
  };

  // Charger l'événement en mode édition
  const loadEvent = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await api.get(`/events/${id}`);
      const event = response.data;

      setTitle(event.title);
      setDescription(event.description || '');
      setStartDate(event.startDate.split('T')[0]);
      setEndDate(event.endDate ? event.endDate.split('T')[0] : '');
      setEventType(event.eventType);
      setLocation(event.location || '');
      setVisibility(event.visibility);
      setIsRecurring(event.isRecurring);
      setParticipantIDs(event.participants?.map((p: any) => p.personID) || []);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de charger l\'événement',
        status: 'error',
        duration: 3000,
      });
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
    if (isEditMode) {
      loadEvent();
    }
  }, [id]);

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!title.trim()) {
      toast({
        title: 'Titre requis',
        status: 'warning',
        duration: 2000,
      });
      return;
    }

    if (!startDate) {
      toast({
        title: 'Date de début requise',
        status: 'warning',
        duration: 2000,
      });
      return;
    }

    if (endDate && endDate < startDate) {
      toast({
        title: 'Date invalide',
        description: 'La date de fin doit être après la date de début',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      setLoading(true);

      if (isEditMode) {
        // Modification
        const updateDto: UpdateEventDto = {
          title: title.trim(),
          description: description.trim(),
          startDate,
          endDate: endDate || undefined,
          eventType,
          location: location.trim(),
          visibility,
          isRecurring,
        };

        await api.put(`/events/${id}`, updateDto);

        toast({
          title: '✅ Événement modifié',
          status: 'success',
          duration: 2000,
        });
      } else {
        // Création
        const createDto: CreateEventDto = {
          title: title.trim(),
          description: description.trim(),
          startDate,
          endDate: endDate || undefined,
          eventType,
          location: location.trim(),
          visibility,
          isRecurring,
          participantIDs: participantIDs.length > 0 ? participantIDs : undefined,
        };

        await api.post('/events', createDto);

        toast({
          title: '✅ Événement créé',
          status: 'success',
          duration: 2000,
        });
      }

      navigate('/events');
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Une erreur est survenue',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <Container maxW="container.md" py={8}>
        <Flex justify="center" align="center" minH="300px">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <Button
        leftIcon={<ArrowBackIcon />}
        variant="ghost"
        onClick={() => navigate('/events')}
        mb={4}
      >
        Retour au calendrier
      </Button>

      <Box bg="white" p={8} borderRadius="lg" shadow="md">
        <Heading size="lg" mb={6} color="blue.700">
          {isEditMode ? '✏️ Modifier l\'événement' : '➕ Nouvel événement'}
        </Heading>

        <form onSubmit={handleSubmit}>
          <VStack spacing={5} align="stretch">
            {/* Titre */}
            <FormControl isRequired>
              <FormLabel>Titre de l'événement</FormLabel>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={150}
              />
            </FormControl>

            {/* Type d'événement */}
            <FormControl isRequired>
              <FormLabel>Type d'événement</FormLabel>
              <Select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as any)}
              >
                <option value="birthday">🎂 Anniversaire</option>
                <option value="party">🎉 Fête / Célébration</option>
                <option value="marriage">💍 Mariage</option>
                <option value="birth">👶 Naissance</option>
                <option value="death">🕊️ Décès</option>
                <option value="other">📅 Autre</option>
              </Select>
            </FormControl>

            {/* Dates */}
            <HStack align="start" spacing={4}>
              <FormControl isRequired flex={1}>
                <FormLabel>Date de début</FormLabel>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </FormControl>

              <FormControl flex={1}>
                <FormLabel>Date de fin (optionnel)</FormLabel>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </FormControl>
            </HStack>

            {/* Lieu */}
            <FormControl>
              <FormLabel>Lieu</FormLabel>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </FormControl>

            {/* Description */}
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </FormControl>

            {/* Visibilité - IMPORTANT */}
            <FormControl>
              <FormLabel>
                <HStack>
                  <Text>Qui peut voir cet événement ?</Text>
                  <Icon as={InfoIcon} color="blue.500" />
                </HStack>
              </FormLabel>
              <RadioGroup value={visibility} onChange={(val) => setVisibility(val as 'family' | 'private')}>
                <Stack spacing={3}>
                  <Radio value="family" colorScheme="green">
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold">👨‍👩‍👧‍👦 Toute la famille</Text>
                      <Text fontSize="sm" color="gray.600">
                        Tous les membres de votre famille peuvent voir cet événement
                      </Text>
                    </VStack>
                  </Radio>
                  <Radio value="private" colorScheme="orange">
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold">🔒 Privé</Text>
                      <Text fontSize="sm" color="gray.600">
                        Seulement vous et les participants invités peuvent voir
                      </Text>
                    </VStack>
                  </Radio>
                </Stack>
              </RadioGroup>
              {visibility === 'private' && (
                <Badge colorScheme="orange" mt={2}>
                  Événement privé - seuls vous et les participants le verront
                </Badge>
              )}
            </FormControl>

            {/* Événement récurrent */}
            <FormControl>
              <HStack justify="space-between">
                <FormLabel mb={0}>Événement récurrent (chaque année)</FormLabel>
                <Switch
                  isChecked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  colorScheme="blue"
                />
              </HStack>
              <Text fontSize="sm" color="gray.600" mt={1}>
                Utile pour les anniversaires et célébrations annuelles
              </Text>
            </FormControl>

            {/* Participants (uniquement en création) */}
            {!isEditMode && (
              <FormControl>
                <FormLabel>Participants (optionnel)</FormLabel>
                {loadingMembers ? (
                  <Spinner size="sm" />
                ) : (
                  <CheckboxGroup
                    value={participantIDs.map(String)}
                    onChange={(values) => setParticipantIDs(values.map(Number))}
                  >
                    <Stack spacing={2} maxH="300px" overflowY="auto" p={2} borderWidth={1} borderRadius="md">
                      {members.map((member) => (
                        <Checkbox key={member.personID} value={String(member.personID)}>
                          <HStack>
                            <Avatar size="xs" src={member.photoUrl} name={`${member.firstName} ${member.lastName}`} />
                            <Text>{member.firstName} {member.lastName}</Text>
                          </HStack>
                        </Checkbox>
                      ))}
                    </Stack>
                  </CheckboxGroup>
                )}
                <Text fontSize="sm" color="gray.600" mt={2}>
                  Les participants peuvent toujours voir l'événement même s'il est privé
                </Text>
              </FormControl>
            )}

            {/* Récapitulatif visibilité */}
            {visibility === 'private' && participantIDs.length > 0 && (
              <Box p={4} bg="orange.50" borderRadius="md" borderWidth={1} borderColor="orange.200">
                <Text fontWeight="bold" color="orange.700" mb={2}>
                  🔒 Qui verra cet événement privé :
                </Text>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm">✓ Vous (créateur)</Text>
                  <Text fontSize="sm">✓ Les {participantIDs.length} participant(s) sélectionné(s)</Text>
                  <Text fontSize="sm" color="gray.600">✗ Les autres membres de la famille ne le verront pas</Text>
                </VStack>
              </Box>
            )}

            {/* Boutons */}
            <HStack spacing={4} pt={4}>
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={loading}
                loadingText={isEditMode ? 'Modification...' : 'Création...'}
                flex={1}
              >
                {isEditMode ? '💾 Enregistrer' : '✅ Créer l\'événement'}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/events')}
                isDisabled={loading}
              >
                Annuler
              </Button>
            </HStack>
          </VStack>
        </form>
      </Box>
    </Container>
  );
};

export default EventForm;
