import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Button,
  Grid,
  Text,
  Badge,
  HStack,
  VStack,
  Spinner,
  useToast,
  IconButton,
  Flex,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Avatar,
  Wrap,
  WrapItem,
  Tooltip,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon, AddIcon, EditIcon, DeleteIcon, ViewIcon, CalendarIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { Event, Person } from '../types';

const EventsCalendar = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterMember, setFilterMember] = useState<string>('');
  const [filterLineage, setFilterLineage] = useState<string>('');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Couleurs par type d'événement (correction duplication Other)
  const EVENT_COLORS: Record<string, { bg: string; color: string; emoji: string; label: string }> = {
    birthday: { bg: 'pink.50', color: 'pink.600', emoji: '🎂', label: 'Anniversaire' },
    marriage: { bg: 'blue.50', color: 'blue.600', emoji: '💍', label: 'Mariage' },
    death: { bg: 'gray.100', color: 'gray.600', emoji: '🕊️', label: 'Décès' },
    birth: { bg: 'green.50', color: 'green.600', emoji: '👶', label: 'Naissance' },
    party: { bg: 'purple.50', color: 'purple.600', emoji: '🎉', label: 'Fête' },
    other: { bg: 'orange.50', color: 'orange.600', emoji: '📅', label: 'Autre' },
  };

  const MONTHS = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  // Charger les événements et les personnes
  const loadEvents = async () => {
    try {
      setLoading(true);
      const [eventsResponse, personsResponse] = await Promise.all([
        api.get<Event[]>('/events'),
        api.get<Person[]>('/persons')
      ]);
      setEvents(eventsResponse.data);
      setPersons(personsResponse.data);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Erreur lors du chargement',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      
      // Mode mock pour démonstration
      setEvents([
        {
          eventID: 1,
          title: 'Anniversaire de Martin GAMO',
          eventType: 'birthday',
          startDate: '2024-01-15',
          isRecurring: true,
          location: 'Paris',
          description: '25ème anniversaire'
        },
        {
          eventID: 2,
          title: 'Mariage de Jean et Marie',
          eventType: 'marriage',
          startDate: '2024-02-14',
          isRecurring: true,
          location: 'Église Sainte-Marie'
        }
      ] as Event[]);
      
      setPersons([
        { personID: 1, firstName: 'Martin', lastName: 'GAMO', sex: 'M', alive: true, birthday: '1999-01-15', cityID: 1, familyID: 1 },
        { personID: 2, firstName: 'Jean', lastName: 'DUPONT', sex: 'M', alive: true, birthday: '1980-02-14', cityID: 1, familyID: 1 },
        { personID: 3, firstName: 'Marie', lastName: 'MARTIN', sex: 'F', alive: true, birthday: '1985-03-20', cityID: 1, familyID: 1 },
        { personID: 4, firstName: 'Gisele', lastName: 'NGUIDUM', sex: 'F', alive: true, birthday: '1970-06-10', cityID: 1, familyID: 1 }
      ] as Person[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Navigation mois
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Générer les jours du calendrier
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Jours vides avant le 1er du mois
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  // Événements d'un jour donné avec filtres améliorés
  const getEventsForDay = (date: Date | null) => {
    if (!date) return [];

    const dateStr = date.toISOString().split('T')[0];
    
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      
      // Filtre par type si actif
      if (filterType && event.eventType !== filterType) return false;
      
      // Filtre par membre spécifique
      if (filterMember) {
        const person = persons.find(p => p.personID.toString() === filterMember);
        if (person && !event.title.toLowerCase().includes(`${person.firstName} ${person.lastName}`.toLowerCase())) {
          return false;
        }
      }
      
      // Filtre par lignée/branche
      if (filterLineage) {
        const eventPersons = persons.filter(p => 
          event.title.toLowerCase().includes(`${p.firstName} ${p.lastName}`.toLowerCase())
        );
        const hasLineageMatch = eventPersons.some(p => {
          // Logique simplifiée pour déterminer la lignée basée sur le nom de famille
          const mainFamilyNames = ['DUPONT', 'MARTIN', 'GAMO', 'NGUIDUM']; 
          if (filterLineage === 'MAIN') {
            return mainFamilyNames.includes(p.lastName.toUpperCase());
          }
          return !mainFamilyNames.includes(p.lastName.toUpperCase());
        });
        if (!hasLineageMatch) return false;
      }
      
      // Pour les événements récurrents (anniversaires), comparer uniquement le jour et le mois
      if (event.isRecurring) {
        return (
          eventDate.getDate() === date.getDate() &&
          eventDate.getMonth() === date.getMonth()
        );
      }
      
      // Pour les événements non-récurrents, comparer la date exacte
      return eventDate.toISOString().split('T')[0] === dateStr;
    });
  };

  // Obtenir les événements à venir pour la vue liste
  const getUpcomingEvents = () => {
    const now = new Date();
    const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      
      // Filtres
      if (filterType && event.eventType !== filterType) return false;
      if (filterMember) {
        const person = persons.find(p => p.personID.toString() === filterMember);
        if (person && !event.title.toLowerCase().includes(`${person.firstName} ${person.lastName}`.toLowerCase())) {
          return false;
        }
      }
      
      // Pour les événements récurrents, chercher la prochaine occurrence
      if (event.isRecurring) {
        const thisYear = now.getFullYear();
        const nextYear = thisYear + 1;
        
        // Vérifier cette année
        const thisYearDate = new Date(thisYear, eventDate.getMonth(), eventDate.getDate());
        if (thisYearDate >= now && thisYearDate <= in90Days) return true;
        
        // Vérifier l'année prochaine
        const nextYearDate = new Date(nextYear, eventDate.getMonth(), eventDate.getDate());
        if (nextYearDate <= in90Days) return true;
        
        return false;
      }
      
      // Pour les événements non-récurrents
      return eventDate >= now && eventDate <= in90Days;
    }).sort((a, b) => {
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);
      return dateA.getTime() - dateB.getTime();
    });
  };

  // Ouvrir le détail d'un événement
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    onOpen();
  };

  const handleDeleteEvent = async (eventID: number) => {
    if (!window.confirm('⚠️ Supprimer cet événement ?')) {
      return;
    }

    try {
      await api.delete(`/events/${eventID}`);
      toast({
        title: 'Succès',
        description: 'Événement supprimé',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      loadEvents();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Erreur lors de la suppression',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const calendarDays = generateCalendarDays();
  const today = new Date().toDateString();

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Flex justify="center" align="center" minH="400px">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg" color="blue.700">
          📅 Événements Familiaux
        </Heading>
        <HStack spacing={3}>
          <Button
            leftIcon={<ViewIcon />}
            variant={viewMode === 'calendar' ? 'solid' : 'outline'}
            colorScheme="blue"
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            Vue Calendrier
          </Button>
          <Button
            leftIcon={<CalendarIcon />}
            variant={viewMode === 'list' ? 'solid' : 'outline'}
            colorScheme="blue"
            size="sm"
            onClick={() => setViewMode('list')}
          >
            Vue Agenda
          </Button>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={() => navigate('/events/new')}
          >
            Ajouter Événement
          </Button>
        </HStack>
      </Flex>

      {/* Filtres avancés */}
      <VStack align="stretch" spacing={4} mb={6}>
        {/* Filtres par type */}
        <HStack spacing={2} flexWrap="wrap">
          <Text fontWeight="600" color="blue.700">Filtres:</Text>
          <Button
            size="sm"
            variant={filterType === null ? 'solid' : 'outline'}
            colorScheme="gray"
            onClick={() => setFilterType(null)}
          >
            Tous les types
          </Button>
          {Object.entries(EVENT_COLORS).map(([type, config]) => (
            <Button
              key={type}
              size="sm"
              variant={filterType === type ? 'solid' : 'outline'}
              colorScheme={config.color.split('.')[0]}
              onClick={() => setFilterType(type)}
            >
              {config.emoji} {config.label}
            </Button>
          ))}
        </HStack>

        {/* Filtres spécifiques à la généalogie */}
        <HStack spacing={4} flexWrap="wrap">
          {/* Filtre par membre */}
          <Box>
            <Text fontSize="sm" fontWeight="500" mb={1}>Par Membre:</Text>
            <Select
              placeholder="Tous les membres"
              value={filterMember}
              onChange={(e) => setFilterMember(e.target.value)}
              size="sm"
              minW="200px"
            >
              {persons.map(person => (
                <option key={person.personID} value={person.personID.toString()}>
                  {person.firstName} {person.lastName}
                </option>
              ))}
            </Select>
          </Box>

          {/* Filtre par lignée */}
          <Box>
            <Text fontSize="sm" fontWeight="500" mb={1}>Par Lignée:</Text>
            <Select
              placeholder="Toutes les lignées"
              value={filterLineage}
              onChange={(e) => setFilterLineage(e.target.value)}
              size="sm"
              minW="180px"
            >
              <option value="MAIN">Lignée Principale</option>
              <option value="SPOUSE">Conjoints</option>
              <option value="BRANCH">Branches</option>
            </Select>
          </Box>

          {/* Bouton de réinitialisation */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setFilterType(null);
              setFilterMember('');
              setFilterLineage('');
            }}
          >
            Réinitialiser
          </Button>
        </HStack>
      </VStack>

      {/* Contenu selon la vue */}
      {viewMode === 'calendar' ? (
        <>
          {/* Navigation du mois */}
          <Flex justify="space-between" align="center" mb={4}>
            <IconButton
              icon={<ChevronLeftIcon />}
              onClick={goToPreviousMonth}
              aria-label="Mois précédent"
              variant="ghost"
            />
            <Heading size="md" color="blue.600">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Heading>
            <IconButton
              icon={<ChevronRightIcon />}
              onClick={goToNextMonth}
              aria-label="Mois suivant"
              variant="ghost"
            />
          </Flex>

          {/* Grille du calendrier */}
          <Box borderWidth={1} borderRadius="lg" overflow="hidden" bg="white">
            {/* Jours de la semaine */}
            <Grid templateColumns="repeat(7, 1fr)" bg="blue.50">
              {DAYS.map((day: string) => (
                <Box key={day} p={2} textAlign="center" fontWeight="bold" color="blue.700">
                  {day}
                </Box>
              ))}
            </Grid>

            {/* Jours du mois */}
            <Grid templateColumns="repeat(7, 1fr)" gap={0}>
              {calendarDays.map((date, index) => {
                const dayEvents = getEventsForDay(date);
                const isToday = date?.toDateString() === today;

                return (
                  <Box
                    key={index}
                    minH="120px"
                    p={2}
                    borderWidth={1}
                    borderColor="gray.100"
                    bg={date ? (isToday ? 'blue.50' : 'white') : 'gray.50'}
                    position="relative"
                  >
                    {date && (
                      <>
                        <Text
                          fontWeight={isToday ? 'bold' : 'normal'}
                          color={isToday ? 'blue.600' : 'gray.600'}
                          fontSize="sm"
                        >
                          {date.getDate()}
                        </Text>
                        <VStack spacing={1} mt={2} align="stretch">
                          {dayEvents.slice(0, 3).map(event => {
                            const config = EVENT_COLORS[event.eventType] || EVENT_COLORS.other;
                            return (
                              <Popover key={event.eventID} placement="top">
                                <PopoverTrigger>
                                  <Badge
                                    bg={config.bg}
                                    color={config.color}
                                    fontSize="xs"
                                    px={1}
                                    cursor="pointer"
                                    _hover={{ opacity: 0.8 }}
                                    isTruncated
                                  >
                                    {config.emoji} {event.title}
                                  </Badge>
                                </PopoverTrigger>
                                <PopoverContent>
                                  <PopoverArrow />
                                  <PopoverCloseButton />
                                  <PopoverHeader fontWeight="600">
                                    {config.emoji} {event.title}
                                  </PopoverHeader>
                                  <PopoverBody>
                                    <VStack align="start" spacing={2}>
                                      <Text fontSize="sm">
                                        📅 {new Date(event.startDate).toLocaleDateString('fr-FR')}
                                      </Text>
                                      {event.location && (
                                        <Text fontSize="sm">📍 {event.location}</Text>
                                      )}
                                      <HStack spacing={2}>
                                        <Button size="xs" onClick={() => handleEventClick(event)}>
                                          Détails
                                        </Button>
                                        <Button 
                                          size="xs" 
                                          variant="outline" 
                                          onClick={() => {
                                            // Lien vers la fiche du membre
                                            const person = persons.find(p => 
                                              event.title.toLowerCase().includes(`${p.firstName} ${p.lastName}`.toLowerCase())
                                            );
                                            if (person) {
                                              navigate(`/person/${person.personID}`);
                                            }
                                          }}
                                        >
                                          👤 Profil
                                        </Button>
                                      </HStack>
                                    </VStack>
                                  </PopoverBody>
                                </PopoverContent>
                              </Popover>
                            );
                          })}
                          {dayEvents.length > 3 && (
                            <Text fontSize="xs" color="gray.500">
                              +{dayEvents.length - 3} autres
                            </Text>
                          )}
                        </VStack>
                      </>
                    )}
                  </Box>
                );
              })}
            </Grid>
          </Box>
        </>
      ) : (
        /* Vue Agenda/Liste */
        <Box borderWidth={1} borderRadius="lg" overflow="hidden" bg="white">
          <Box bg="blue.50" p={4}>
            <Heading size="md" color="blue.700">
              🗓️ Événements à venir (90 prochains jours)
            </Heading>
          </Box>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Événement</Th>
                <Th>Type</Th>
                <Th>Participant(s)</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {getUpcomingEvents().map(event => {
                const config = EVENT_COLORS[event.eventType] || EVENT_COLORS.other;
                const eventPersons = persons.filter(p => 
                  event.title.toLowerCase().includes(`${p.firstName} ${p.lastName}`.toLowerCase())
                );
                
                return (
                  <Tr key={event.eventID}>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="600">
                          {new Date(event.startDate).toLocaleDateString('fr-FR')}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {new Date(event.startDate).toLocaleDateString('fr-FR', { 
                            weekday: 'long' 
                          })}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Text fontWeight="500">{event.title}</Text>
                      {event.location && (
                        <Text fontSize="xs" color="gray.500">📍 {event.location}</Text>
                      )}
                    </Td>
                    <Td>
                      <Badge bg={config.bg} color={config.color}>
                        {config.emoji} {config.label}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack spacing={1}>
                        {eventPersons.slice(0, 3).map(person => (
                          <Tooltip key={person.personID} label={`${person.firstName} ${person.lastName}`}>
                            <Avatar 
                              size="sm" 
                              name={`${person.firstName} ${person.lastName}`}
                              src={person.photoUrl}
                            />
                          </Tooltip>
                        ))}
                        {eventPersons.length > 3 && (
                          <Text fontSize="xs" color="gray.500">+{eventPersons.length - 3}</Text>
                        )}
                      </HStack>
                    </Td>
                    <Td>
                      <HStack spacing={1}>
                        <IconButton
                          icon={<ViewIcon />}
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEventClick(event)}
                          aria-label="Voir détails"
                        />
                        {eventPersons.length > 0 && (
                          <IconButton
                            icon={<EditIcon />}
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/person/${eventPersons[0].personID}`)}
                            aria-label="Voir profil"
                          />
                        )}
                      </HStack>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* Modal de détail d'événement amélioré */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedEvent && (
              <HStack>
                <Text>{EVENT_COLORS[selectedEvent.eventType]?.emoji}</Text>
                <Text>{selectedEvent.title}</Text>
              </HStack>
            )}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedEvent && (
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontWeight="bold" color="gray.600">Type</Text>
                  <Badge colorScheme={EVENT_COLORS[selectedEvent.eventType]?.color.split('.')[0]}>
                    {selectedEvent.eventType}
                  </Badge>
                </Box>

                <Box>
                  <Text fontWeight="bold" color="gray.600">Date</Text>
                  <Text>{new Date(selectedEvent.startDate).toLocaleDateString('fr-FR')}</Text>
                  {selectedEvent.endDate && (
                    <Text fontSize="sm" color="gray.500">
                      → {new Date(selectedEvent.endDate).toLocaleDateString('fr-FR')}
                    </Text>
                  )}
                </Box>

                {selectedEvent.location && (
                  <Box>
                    <Text fontWeight="bold" color="gray.600">📍 Lieu</Text>
                    <Text>{selectedEvent.location}</Text>
                  </Box>
                )}

                {selectedEvent.description && (
                  <Box>
                    <Text fontWeight="bold" color="gray.600">Description</Text>
                    <Text>{selectedEvent.description}</Text>
                  </Box>
                )}

                {/* Lien vers le profil du membre */}
                {(() => {
                  const person = persons.find(p => 
                    selectedEvent.title.toLowerCase().includes(`${p.firstName} ${p.lastName}`.toLowerCase())
                  );
                  return person ? (
                    <Box>
                      <Text fontWeight="bold" color="gray.600" mb={2}>👤 Membre concerné</Text>
                      <HStack 
                        spacing={3} 
                        bg="blue.50" 
                        p={3} 
                        borderRadius="md"
                        cursor="pointer"
                        _hover={{ bg: 'blue.100' }}
                        onClick={() => navigate(`/person/${person.personID}`)}
                      >
                        <Avatar size="sm" name={`${person.firstName} ${person.lastName}`} src={person.photoUrl} />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="500">{person.firstName} {person.lastName}</Text>
                          <Text fontSize="sm" color="gray.600">Cliquez pour voir le profil</Text>
                        </VStack>
                      </HStack>
                    </Box>
                  ) : null;
                })()}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <HStack spacing={2}>
              <Button
                leftIcon={<EditIcon />}
                colorScheme="blue"
                onClick={() => navigate(`/events/edit/${selectedEvent?.eventID}`)}
              >
                Modifier
              </Button>
              <Button
                leftIcon={<DeleteIcon />}
                colorScheme="red"
                variant="outline"
                onClick={() => selectedEvent && handleDeleteEvent(selectedEvent.eventID)}
              >
                Supprimer
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default EventsCalendar;
