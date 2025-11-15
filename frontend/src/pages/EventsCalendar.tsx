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
  Td
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon, AddIcon, EditIcon, DeleteIcon, CalendarIcon, ViewIcon, ExternalLinkIcon } from '@chakra-ui/icons';
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
  
  // ============ NAVIGATION VERS PROFIL ============
  
  const extractPersonFromEvent = (event: Event): Person | null => {
    if (!event.title) return null;
    
    // Rechercher la personne concernée par l'événement
    // Pour les anniversaires: "ANNIVERSAIRE DE Martin GAMO" -> chercher "Martin GAMO"
    // Pour les mariages: "MARIAGE DE Jean ET Marie" -> prendre le premier nom
    
    const title = event.title.toUpperCase();
    
    // Nettoyer le titre pour extraire les noms
    const cleanTitle = title
      .replace('ANNIVERSAIRE DE ', '')
      .replace('MARIAGE DE ', '')
      .replace('DÉCÈS DE ', '')
      .replace('NAISSANCE DE ', '')
      .replace(' ET ', ' ') // Pour les mariages
      .trim();
    
    // Chercher une correspondance avec une personne existante
    const foundPerson = persons.find(person => {
      const fullName = `${person.firstName} ${person.lastName}`.toUpperCase();
      return cleanTitle.includes(fullName) || fullName.includes(cleanTitle.split(' ')[0]);
    });
    
    return foundPerson || null;
  };

  const navigateToPersonProfile = (person: Person) => {
    navigate(`/person/${person.personID}`);
    onClose(); // Fermer la modal
  };
  
  // ============ GESTION VUE AGENDA ============
  
  const getUpcomingEvents = () => {
    const now = new Date();
    const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    
    // Filtrer et trier les événements
    let filteredEvents = [...events];
    
    // Appliquer les filtres actifs
    filteredEvents = filteredEvents.filter(event => {
      // Filtre par type d'événement
      if (filterType && event.eventType !== filterType) {
        return false;
      }
      
      // Filtre par membre spécifique
      if (filterMember) {
        const person = persons.find(p => p.personID.toString() === filterMember);
        if (person) {
          const personName = `${person.firstName} ${person.lastName}`.toUpperCase();
          if (!event.title.toUpperCase().includes(personName)) {
            return false;
          }
        }
      }
      
      // Filtre par lignée
      if (filterLineage && filterLineage !== 'ALL') {
        const person = extractPersonFromEvent(event);
        if (person) {
          const mainFamilyNames = ['KAMO', 'YAMO', 'NGUIDUM']; // Adapter selon votre famille
          const personFamilyName = person.lastName.toUpperCase();
          
          if (filterLineage === 'MAIN' && !mainFamilyNames.includes(personFamilyName)) {
            return false;
          }
          if (filterLineage === 'SPOUSE' && mainFamilyNames.includes(personFamilyName)) {
            return false;
          }
        }
      }
      
      return true;
    });
    
    // Générer les événements futurs (incluant récurrence)
    const upcomingEvents: any[] = [];
    const currentYear = now.getFullYear();
    
    filteredEvents.forEach(event => {
      const eventDate = new Date(event.startDate);
      
      if (event.isRecurring) {
        // Pour les événements récurrents, créer les instances futures
        for (let year = currentYear; year <= currentYear + 1; year++) {
          const recurringDate = new Date(year, eventDate.getMonth(), eventDate.getDate());
          
          if (recurringDate >= now && recurringDate <= in90Days) {
            upcomingEvents.push({
              ...event,
              startDate: recurringDate.toISOString(),
              isRecurringInstance: true,
              originalDate: event.startDate
            });
          }
        }
      } else {
        // Pour les événements non-récurrents
        if (eventDate >= now && eventDate <= in90Days) {
          upcomingEvents.push(event);
        }
      }
    });
    
    // Trier par date (chronologique)
    return upcomingEvents.sort((a, b) => {
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);
      return dateA.getTime() - dateB.getTime();
    });
  };

  // ============ NAVIGATION ET ÉVÉNEMENTS ============
  
  // Couleurs par type d'événement (ORDRE CORRIGÉ)
  const EVENT_COLORS: Record<string, { bg: string; color: string; emoji: string; label: string }> = {
    birthday: { bg: 'pink.50', color: 'pink.600', emoji: '🎂', label: t('events.types.birthday') },
    marriage: { bg: 'blue.50', color: 'blue.600', emoji: '💍', label: t('events.types.marriage') },
    birth: { bg: 'green.50', color: 'green.600', emoji: '�', label: t('events.types.birth') },
    death: { bg: 'gray.100', color: 'gray.600', emoji: '�️', label: t('events.types.death') },
    party: { bg: 'purple.50', color: 'purple.600', emoji: '🎉', label: t('events.types.party') },
    other: { bg: 'orange.50', color: 'orange.600', emoji: '📅', label: t('events.types.other') },
  };

  const MONTHS = [
    t('events.months.january'), t('events.months.february'), t('events.months.march'),
    t('events.months.april'), t('events.months.may'), t('events.months.june'),
    t('events.months.july'), t('events.months.august'), t('events.months.september'),
    t('events.months.october'), t('events.months.november'), t('events.months.december')
  ];

  const DAYS = [
    t('events.days.sun'), t('events.days.mon'), t('events.days.tue'),
    t('events.days.wed'), t('events.days.thu'), t('events.days.fri'), t('events.days.sat')
  ];

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
        title: t('common.error'),
        description: error.response?.data?.message || t('events.errorLoading'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
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
          const mainFamilyNames = ['DUPONT', 'MARTIN', 'NGUIDUM', 'KAMO YAMO']; // À adapter selon vos données
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

  // Ouvrir le détail d'un événement
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    onOpen();
  };

    const handleDeleteEvent = async (eventID: number) => {
    if (!window.confirm(`⚠️ ${t('events.confirmDelete')}`)) {
      return;
    }

    try {
      await api.delete(`/events/${eventID}`);
      toast({
        title: t('common.success'),
        description: t('events.deleted'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      loadEvents();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || t('events.errorDeleting'),
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
          📅 {t('events.title')}
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
          <Tooltip 
            label="💡 Les anniversaires et mariages se répètent automatiquement chaque année !" 
            placement="bottom"
            hasArrow
          >
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              onClick={() => navigate('/events/new')}
            >
              {t('events.addEvent')}
            </Button>
          </Tooltip>
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

      {/* Filtres par type */}
      <HStack mb={4} spacing={2} flexWrap="wrap">
        <Button
          size="sm"
          variant={filterType === null ? 'solid' : 'outline'}
          colorScheme="gray"
          onClick={() => setFilterType(null)}
        >
          {t('events.types.other')}
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
                          <Tooltip key={event.eventID} label={event.title} placement="top">
                            <Badge
                              bg={config.bg}
                              color={config.color}
                              fontSize="xs"
                              px={1}
                              cursor="pointer"
                              onClick={() => handleEventClick(event)}
                              _hover={{ opacity: 0.8 }}
                              isTruncated
                            >
                              {config.emoji} {event.title}
                            </Badge>
                          </Tooltip>
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
        <Box>
          {/* ========== VUE AGENDA CHRONOLOGIQUE ========== */}
          <VStack align="stretch" spacing={4}>
            <HStack justify="space-between" align="center">
              <Heading size="md" color="blue.600">
                📅 Événements à venir (90 prochains jours)
              </Heading>
              <Text fontSize="sm" color="gray.500">
                Vue chronologique pour planification
              </Text>
            </HStack>

            {/* Table des événements chronologique */}
            <Box borderWidth={1} borderRadius="lg" overflow="hidden" bg="white">
              <Table variant="simple" size="sm">
                <Thead bg="blue.50">
                  <Tr>
                    <Th color="blue.700" fontWeight="bold">📅 Date</Th>
                    <Th color="blue.700" fontWeight="bold">🎯 Événement</Th>
                    <Th color="blue.700" fontWeight="bold">📝 Type</Th>
                    <Th color="blue.700" fontWeight="bold">👥 Participant(s)</Th>
                    <Th color="blue.700" fontWeight="bold">⚡ Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {(() => {
                    const upcomingEvents = getUpcomingEvents();
                    
                    if (upcomingEvents.length === 0) {
                      return (
                        <Tr>
                          <Td colSpan={5} textAlign="center" py={8}>
                            <VStack spacing={2}>
                              <Text color="gray.500" fontSize="lg">📭 {t('events.noUpcomingEvents')}</Text>
                              <Text color="gray.400" fontSize="sm">
                                {t('events.noUpcomingEventsDescription')}
                              </Text>
                            </VStack>
                          </Td>
                        </Tr>
                      );
                    }

                    return upcomingEvents.map((event, index) => {
                      const config = EVENT_COLORS[event.eventType] || EVENT_COLORS.other;
                      const eventDate = new Date(event.startDate);
                      const isToday = eventDate.toDateString() === new Date().toDateString();
                      const person = extractPersonFromEvent(event);
                      
                      return (
                        <Tr 
                          key={`${event.eventID}-${index}`}
                          bg={isToday ? 'blue.50' : index % 2 === 0 ? 'gray.50' : 'white'}
                          _hover={{ bg: 'blue.100', cursor: 'pointer' }}
                          onClick={() => handleEventClick(event)}
                        >
                          {/* DATE */}
                          <Td fontWeight={isToday ? 'bold' : 'normal'}>
                            <VStack align="start" spacing={0}>
                              <Text color={isToday ? 'blue.600' : 'gray.700'}>
                                {eventDate.toLocaleDateString('fr-FR', { 
                                  weekday: 'short',
                                  day: '2-digit', 
                                  month: 'short' 
                                })}
                              </Text>
                              {isToday && (
                                <Badge colorScheme="blue" size="sm">AUJOURD'HUI</Badge>
                              )}
                            </VStack>
                          </Td>

                          {/* ÉVÉNEMENT */}
                          <Td>
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="bold" color="gray.800" fontSize="md">
                                {event.title}
                              </Text>
                              {event.location && (
                                <Text fontSize="sm" color="gray.500">
                                  📍 {event.location}
                                </Text>
                              )}
                              {event.description && (
                                <Text fontSize="xs" color="gray.400" noOfLines={1}>
                                  {event.description}
                                </Text>
                              )}
                            </VStack>
                          </Td>

                          {/* TYPE */}
                          <Td>
                            <Badge 
                              bg={config.bg} 
                              color={config.color}
                              px={2} 
                              py={1}
                              borderRadius="md"
                            >
                              {config.emoji} {config.label}
                            </Badge>
                          </Td>

                          {/* PARTICIPANTS */}
                          <Td>
                            <HStack spacing={2}>
                              {person ? (
                                <Tooltip label={`Voir le profil de ${person.firstName} ${person.lastName}`}>
                                  <HStack 
                                    spacing={2}
                                    cursor="pointer"
                                    _hover={{ bg: 'blue.50' }}
                                    px={2}
                                    py={1}
                                    borderRadius="md"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigateToPersonProfile(person);
                                    }}
                                  >
                                    <Avatar 
                                      size="xs" 
                                      src={person.photoUrl} 
                                      name={`${person.firstName} ${person.lastName}`} 
                                    />
                                    <Text fontSize="sm" fontWeight="medium">
                                      {person.firstName} {person.lastName}
                                    </Text>
                                  </HStack>
                                </Tooltip>
                              ) : (
                                <Text fontSize="sm" color="gray.500">
                                  Participants à définir
                                </Text>
                              )}
                            </HStack>
                          </Td>

                          {/* ACTIONS */}
                          <Td>
                            <HStack spacing={1}>
                              <Tooltip label="Voir les détails">
                                <IconButton
                                  icon={<ViewIcon />}
                                  size="xs"
                                  colorScheme="blue"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEventClick(event);
                                  }}
                                  aria-label="Voir détails"
                                />
                              </Tooltip>
                              
                              {person && (
                                <Tooltip label={`Profil de ${person.firstName}`}>
                                  <IconButton
                                    icon={<ExternalLinkIcon />}
                                    size="xs"
                                    colorScheme="green"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigateToPersonProfile(person);
                                    }}
                                    aria-label="Voir profil"
                                  />
                                </Tooltip>
                              )}
                            </HStack>
                          </Td>
                        </Tr>
                      );
                    });
                  })()}
                </Tbody>
              </Table>
            </Box>

            {/* Statistiques de la vue agenda */}
            <HStack justify="space-between" align="center" p={4} bg="gray.50" borderRadius="md">
              <Text fontSize="sm" color="gray.600">
                🔍 <strong>{getUpcomingEvents().length}</strong> événement(s) à venir dans les 90 prochains jours
              </Text>
              <HStack spacing={4}>
                <Text fontSize="xs" color="gray.500">
                  💡 Cliquez sur un événement pour voir les détails
                </Text>
                <Text fontSize="xs" color="gray.500">
                  👤 Cliquez sur un participant pour voir son profil
                </Text>
              </HStack>
            </HStack>
          </VStack>
        </Box>
      )}

      {/* Modal de détail d'événement */}
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

                {selectedEvent.participants && selectedEvent.participants.length > 0 && (
                  <Box>
                    <Text fontWeight="bold" color="gray.600" mb={2}>
                      👥 Participants ({selectedEvent.participants.length})
                    </Text>
                    <Wrap>
                      {selectedEvent.participants.map(p => (
                        <WrapItem key={p.eventParticipantID}>
                          <HStack 
                            spacing={2} 
                            bg="gray.50" 
                            px={3} 
                            py={1} 
                            borderRadius="full"
                            cursor="pointer"
                            _hover={{ bg: 'blue.50', transform: 'scale(1.02)' }}
                            onClick={() => {
                              const person = persons.find(person => 
                                `${person.firstName} ${person.lastName}` === p.personName
                              );
                              if (person) navigateToPersonProfile(person);
                            }}
                          >
                            <Avatar size="xs" src={p.personPhotoUrl} name={p.personName} />
                            <Text fontSize="sm">{p.personName}</Text>
                            {p.status === 'confirmed' && <Text fontSize="xs">✅</Text>}
                            {p.status === 'declined' && <Text fontSize="xs">❌</Text>}
                            <ExternalLinkIcon boxSize={3} color="blue.500" />
                          </HStack>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Box>
                )}

                {selectedEvent.photoCount && selectedEvent.photoCount > 0 && (
                  <Box>
                    <Text fontWeight="bold" color="gray.600">📸 Photos ({selectedEvent.photoCount})</Text>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <HStack spacing={2}>
              {/* Bouton pour naviguer vers le profil de la personne */}
              {selectedEvent && (() => {
                const person = extractPersonFromEvent(selectedEvent);
                return person ? (
                  <Button
                    leftIcon={<ExternalLinkIcon />}
                    colorScheme="green"
                    variant="solid"
                    onClick={() => navigateToPersonProfile(person)}
                  >
                    👤 Voir {person.firstName}
                  </Button>
                ) : null;
              })()}
              
              <Button
                leftIcon={<EditIcon />}
                colorScheme="blue"
                onClick={() => navigate(`/events/edit/${selectedEvent?.eventID}`)}
              >
                {t('common.edit')}
              </Button>
              <Button
                leftIcon={<DeleteIcon />}
                colorScheme="red"
                variant="outline"
                onClick={() => selectedEvent && handleDeleteEvent(selectedEvent.eventID)}
              >
                {t('common.delete')}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default EventsCalendar;
