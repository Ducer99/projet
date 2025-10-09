// Timeline - Frise chronologique des ancêtres
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Avatar,
  Badge,
  Icon,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaBirthdayCake, FaHeart, FaRing, FaBaby, FaGraduationCap, FaHome } from 'react-icons/fa';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

interface TimelineEvent {
  id: number;
  year: number;
  date: string;
  type: 'birth' | 'death' | 'marriage' | 'child' | 'move' | 'other';
  title: string;
  description: string;
  person?: {
    personID: number;
    firstName: string;
    lastName: string;
    photoUrl?: string;
  };
  location?: string;
}

const Timeline: React.FC = () => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [selectedDecade, setSelectedDecade] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const bgColor = useColorModeValue('neutral.50', 'neutral.900');
  const cardBg = useColorModeValue('white', 'neutral.800');

  useEffect(() => {
    loadTimeline();
  }, []);

  const loadTimeline = async () => {
    try {
      // Charger les événements depuis l'API
      // const response = await api.get('/timeline');
      // setEvents(response.data);

      // Données démo
      setEvents([
        {
          id: 1,
          year: 1920,
          date: '1920-05-15',
          type: 'birth',
          title: 'Naissance de Jean Dupont',
          description: 'Premier enfant de la famille',
          person: {
            personID: 1,
            firstName: 'Jean',
            lastName: 'Dupont',
          },
          location: 'Paris, France',
        },
        {
          id: 2,
          year: 1945,
          date: '1945-08-20',
          type: 'marriage',
          title: 'Mariage de Jean & Marie',
          description: 'Union de deux familles',
          location: 'Lyon, France',
        },
      ]);
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement timeline:', error);
      setLoading(false);
    }
  };

  // Grouper par décennies
  const groupByDecade = () => {
    const decades = new Map<number, TimelineEvent[]>();
    
    events.forEach(event => {
      const decade = Math.floor(event.year / 10) * 10;
      if (!decades.has(decade)) {
        decades.set(decade, []);
      }
      decades.get(decade)!.push(event);
    });

    return Array.from(decades.entries())
      .sort((a, b) => b[0] - a[0]) // Plus récent en premier
      .map(([decade, events]) => ({
        decade,
        events: events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      }));
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'birth': return FaBirthdayCake;
      case 'death': return FaHeart;
      case 'marriage': return FaRing;
      case 'child': return FaBaby;
      case 'move': return FaHome;
      default: return FaGraduationCap;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'birth': return '#4ECDC4';
      case 'death': return '#A3A3A3';
      case 'marriage': return '#FF6B9D';
      case 'child': return '#FFA07A';
      case 'move': return '#45B7D1';
      default: return '#98D8C8';
    }
  };

  const decades = groupByDecade();

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.xl">
        {/* Header */}
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          textAlign="center"
          mb={12}
        >
          <Heading
            size="2xl"
            mb={3}
            bgGradient="linear(to-r, brand.500, family.secondary)"
            bgClip="text"
            fontWeight="700"
          >
            Voyage à travers le temps
          </Heading>
          <Text fontSize="lg" color="neutral.600" maxW="2xl" mx="auto">
            Explorez l'histoire de votre famille génération après génération
          </Text>
        </MotionBox>

        {/* Timeline */}
        <Box position="relative">
          {/* Ligne centrale verticale */}
          <Box
            position="absolute"
            left="50%"
            top={0}
            bottom={0}
            w="3px"
            bgGradient="linear(to-b, brand.300, family.secondary, brand.300)"
            transform="translateX(-50%)"
            borderRadius="full"
            display={{ base: 'none', md: 'block' }}
          />

          <VStack spacing={16} align="stretch">
            {decades.map((decadeGroup, idx) => (
              <MotionBox
                key={decadeGroup.decade}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                {/* Badge décennie */}
                <Flex justify="center" mb={8}>
                  <MotionBox
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    cursor="pointer"
                    onClick={() => setSelectedDecade(
                      selectedDecade === decadeGroup.decade ? null : decadeGroup.decade
                    )}
                  >
                    <Badge
                      fontSize="2xl"
                      px={8}
                      py={3}
                      borderRadius="full"
                      colorScheme="orange"
                      bgGradient="linear(to-r, brand.400, brand.600)"
                      color="white"
                      boxShadow="xl"
                      fontWeight="700"
                    >
                      {decadeGroup.decade}s
                    </Badge>
                  </MotionBox>
                </Flex>

                {/* Événements */}
                <VStack spacing={8}>
                  {decadeGroup.events.map((event, eventIdx) => {
                    const isLeft = eventIdx % 2 === 0;

                    return (
                      <MotionFlex
                        key={event.id}
                        w="full"
                        justify={isLeft ? 'flex-start' : 'flex-end'}
                        position="relative"
                        initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: eventIdx * 0.1 }}
                      >
                        {/* Carte événement */}
                        <Box
                          w={{ base: 'full', md: '45%' }}
                          bg={cardBg}
                          borderRadius="2xl"
                          p={6}
                          boxShadow="lg"
                          position="relative"
                          _hover={{
                            transform: 'translateY(-4px)',
                            boxShadow: '2xl',
                          }}
                          transition="all 0.3s ease"
                          borderLeft={`4px solid ${getEventColor(event.type)}`}
                        >
                          {/* Icône */}
                          <Box
                            position="absolute"
                            top="50%"
                            {...(isLeft ? { right: '-44px' } : { left: '-44px' })}
                            transform="translateY(-50%)"
                            display={{ base: 'none', md: 'block' }}
                          >
                            <Flex
                              w={12}
                              h={12}
                              borderRadius="full"
                              bg={getEventColor(event.type)}
                              align="center"
                              justify="center"
                              boxShadow="xl"
                              border="4px solid"
                              borderColor={bgColor}
                            >
                              <Icon as={getEventIcon(event.type)} color="white" boxSize={5} />
                            </Flex>
                          </Box>

                          {/* Contenu */}
                          <VStack align="stretch" spacing={3}>
                            {/* En-tête */}
                            <HStack justify="space-between" wrap="wrap">
                              <Badge colorScheme="gray" fontSize="sm" px={3} py={1} borderRadius="lg">
                                {new Date(event.date).toLocaleDateString('fr-FR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </Badge>
                              {event.location && (
                                <Text fontSize="sm" color="neutral.500" fontStyle="italic">
                                  📍 {event.location}
                                </Text>
                              )}
                            </HStack>

                            {/* Titre */}
                            <Heading size="md" color="neutral.800">
                              {event.title}
                            </Heading>

                            {/* Description */}
                            <Text color="neutral.600" fontSize="sm">
                              {event.description}
                            </Text>

                            {/* Personne */}
                            {event.person && (
                              <HStack mt={2} p={3} bg="neutral.50" borderRadius="lg">
                                <Avatar
                                  size="sm"
                                  name={`${event.person.firstName} ${event.person.lastName}`}
                                  src={event.person.photoUrl}
                                />
                                <VStack align="start" spacing={0}>
                                  <Text fontSize="sm" fontWeight="600">
                                    {event.person.firstName} {event.person.lastName}
                                  </Text>
                                </VStack>
                              </HStack>
                            )}
                          </VStack>
                        </Box>
                      </MotionFlex>
                    );
                  })}
                </VStack>
              </MotionBox>
            ))}
          </VStack>
        </Box>

        {/* Message si vide */}
        {!loading && events.length === 0 && (
          <Box textAlign="center" py={20}>
            <Text fontSize="xl" color="neutral.500">
              Aucun événement historique pour le moment
            </Text>
            <Text fontSize="sm" color="neutral.400" mt={2}>
              Les événements de votre famille apparaîtront ici
            </Text>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Timeline;
