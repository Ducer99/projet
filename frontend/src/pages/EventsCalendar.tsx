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
  Tooltip
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon, AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { Event } from '../types';

const EventsCalendar = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Couleurs par type d'événement
  const EVENT_COLORS: Record<string, { bg: string; color: string; emoji: string; label: string }> = {
    birth: { bg: 'green.50', color: 'green.600', emoji: '👶', label: t('events.types.birth') },
    marriage: { bg: 'blue.50', color: 'blue.600', emoji: '💍', label: t('events.types.marriage') },
    death: { bg: 'gray.100', color: 'gray.600', emoji: '🕊️', label: t('events.types.death') },
    birthday: { bg: 'pink.50', color: 'pink.600', emoji: '🎂', label: t('events.types.birthday') },
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

  // Charger les événements
  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get<Event[]>('/events');
      setEvents(response.data);
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

  // Événements d'un jour donné
  const getEventsForDay = (date: Date | null) => {
    if (!date) return [];

    const dateStr = date.toISOString().split('T')[0];
    
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      
      // Filtre par type si actif
      if (filterType && event.eventType !== filterType) return false;
      
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
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={() => navigate('/events/new')}
        >
          {t('events.addEvent')}
        </Button>
      </Flex>

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
                          <HStack spacing={2} bg="gray.50" px={3} py={1} borderRadius="full">
                            <Avatar size="xs" src={p.personPhotoUrl} name={p.personName} />
                            <Text fontSize="sm">{p.personName}</Text>
                            {p.status === 'confirmed' && <Text fontSize="xs">✅</Text>}
                            {p.status === 'declined' && <Text fontSize="xs">❌</Text>}
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
