// Stories - Histoires familiales
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  VStack,
  HStack,
  Text,
  Heading,
  Avatar,
  Image,
  Icon,
  Button,
  Badge,
  Flex,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaBook, FaHeart, FaComment, FaEye } from 'react-icons/fa';

const MotionBox = motion(Box);

interface Story {
  storyID: number;
  title: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  author: {
    personID: number;
    firstName: string;
    lastName: string;
    photoUrl?: string;
  };
  person?: {
    personID: number;
    firstName: string;
    lastName: string;
  };
  category: 'memory' | 'tradition' | 'recipe' | 'anecdote' | 'history';
  createdAt: string;
  likes: number;
  comments: number;
  views: number;
}

const Stories: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    // Données démo
    setStories([
      {
        storyID: 1,
        title: 'Le jardin de grand-mère Marie',
        content: `Grand-mère Marie avait un jardin extraordinaire. Chaque printemps, elle plantait des roses rouges en souvenir de son mari...`,
        excerpt: 'Un souvenir tendre du jardin fleuri de grand-mère Marie...',
        coverImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b',
        author: {
          personID: 1,
          firstName: 'Pierre',
          lastName: 'Dupont',
        },
        person: {
          personID: 2,
          firstName: 'Marie',
          lastName: 'Dupont',
        },
        category: 'memory',
        createdAt: '2024-10-01',
        likes: 12,
        comments: 5,
        views: 45,
      },
    ]);
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'memory': return 'purple';
      case 'tradition': return 'orange';
      case 'recipe': return 'green';
      case 'anecdote': return 'blue';
      case 'history': return 'red';
      default: return 'gray';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'memory': return 'Souvenir';
      case 'tradition': return 'Tradition';
      case 'recipe': return 'Recette';
      case 'anecdote': return 'Anecdote';
      case 'history': return 'Histoire';
      default: return category;
    }
  };

  const openStory = (story: Story) => {
    setSelectedStory(story);
    onOpen();
  };

  return (
    <Box bg="neutral.50" minH="100vh" py={8}>
      <Container maxW="container.xl">
        {/* Header */}
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          textAlign="center"
          mb={12}
        >
          <Icon as={FaBook} boxSize={12} color="brand.500" mb={4} />
          <Heading
            size="2xl"
            mb={3}
            bgGradient="linear(to-r, brand.500, family.secondary)"
            bgClip="text"
          >
            Histoires de Famille
          </Heading>
          <Text fontSize="lg" color="neutral.600" maxW="2xl" mx="auto">
            Partagez les souvenirs, traditions et anecdotes qui façonnent l'histoire de votre famille
          </Text>
        </MotionBox>

        {/* Bouton Nouvelle Histoire */}
        <Flex justify="center" mb={8}>
          <Button
            size="lg"
            colorScheme="orange"
            bgGradient="linear(to-r, brand.500, brand.600)"
            _hover={{ bgGradient: 'linear(to-r, brand.600, brand.700)' }}
            leftIcon={<FaBook />}
            borderRadius="full"
            boxShadow="lg"
          >
            Raconter une histoire
          </Button>
        </Flex>

        {/* Grid d'histoires */}
        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
          gap={8}
        >
          {stories.map((story, idx) => (
            <MotionBox
              key={story.storyID}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              onClick={() => openStory(story)}
              cursor="pointer"
            >
              <Box
                bg="white"
                borderRadius="2xl"
                overflow="hidden"
                boxShadow="md"
                transition="all 0.3s ease"
                _hover={{
                  transform: 'translateY(-8px)',
                  boxShadow: '2xl',
                }}
              >
                {/* Image de couverture */}
                {story.coverImage && (
                  <Box position="relative" h="200px" overflow="hidden">
                    <Image
                      src={story.coverImage}
                      alt={story.title}
                      w="full"
                      h="full"
                      objectFit="cover"
                      transition="transform 0.3s ease"
                      _hover={{ transform: 'scale(1.1)' }}
                    />
                    {/* Overlay gradient */}
                    <Box
                      position="absolute"
                      bottom={0}
                      left={0}
                      right={0}
                      h="50%"
                      bgGradient="linear(to-t, blackAlpha.700, transparent)"
                    />
                    {/* Badge catégorie */}
                    <Badge
                      position="absolute"
                      top={4}
                      right={4}
                      colorScheme={getCategoryColor(story.category)}
                      fontSize="xs"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      {getCategoryLabel(story.category)}
                    </Badge>
                  </Box>
                )}

                {/* Contenu */}
                <VStack align="stretch" p={6} spacing={3}>
                  {/* Titre */}
                  <Heading size="md" noOfLines={2} color="neutral.800">
                    {story.title}
                  </Heading>

                  {/* Excerpt */}
                  <Text fontSize="sm" color="neutral.600" noOfLines={3}>
                    {story.excerpt}
                  </Text>

                  {/* Auteur */}
                  <HStack mt={2}>
                    <Avatar
                      size="sm"
                      name={`${story.author.firstName} ${story.author.lastName}`}
                      src={story.author.photoUrl}
                    />
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" fontWeight="600">
                        {story.author.firstName} {story.author.lastName}
                      </Text>
                      {story.person && (
                        <Text fontSize="xs" color="neutral.500">
                          à propos de {story.person.firstName}
                        </Text>
                      )}
                    </VStack>
                  </HStack>

                  {/* Stats */}
                  <HStack spacing={4} pt={2} borderTop="1px" borderColor="neutral.100">
                    <HStack spacing={1}>
                      <Icon as={FaHeart} boxSize={3} color="red.400" />
                      <Text fontSize="xs" color="neutral.500">{story.likes}</Text>
                    </HStack>
                    <HStack spacing={1}>
                      <Icon as={FaComment} boxSize={3} color="blue.400" />
                      <Text fontSize="xs" color="neutral.500">{story.comments}</Text>
                    </HStack>
                    <HStack spacing={1}>
                      <Icon as={FaEye} boxSize={3} color="neutral.400" />
                      <Text fontSize="xs" color="neutral.500">{story.views}</Text>
                    </HStack>
                  </HStack>
                </VStack>
              </Box>
            </MotionBox>
          ))}
        </Grid>

        {/* Message si vide */}
        {stories.length === 0 && (
          <Box textAlign="center" py={20}>
            <Icon as={FaBook} boxSize={20} color="neutral.300" mb={4} />
            <Text fontSize="xl" color="neutral.500">
              Aucune histoire pour le moment
            </Text>
            <Text fontSize="sm" color="neutral.400" mt={2}>
              Soyez le premier à partager un souvenir familial
            </Text>
          </Box>
        )}
      </Container>

      {/* Modal détail histoire */}
      <Modal isOpen={isOpen} onClose={onClose} size="3xl">
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent borderRadius="2xl" overflow="hidden">
          <ModalCloseButton zIndex={10} color="white" />
          
          {selectedStory && (
            <ModalBody p={0}>
              {/* Image de couverture pleine largeur */}
              {selectedStory.coverImage && (
                <Box position="relative" h="300px">
                  <Image
                    src={selectedStory.coverImage}
                    alt={selectedStory.title}
                    w="full"
                    h="full"
                    objectFit="cover"
                  />
                  <Box
                    position="absolute"
                    bottom={0}
                    left={0}
                    right={0}
                    h="100%"
                    bgGradient="linear(to-t, blackAlpha.800, transparent)"
                  />
                  <VStack
                    position="absolute"
                    bottom={6}
                    left={6}
                    align="start"
                    spacing={2}
                  >
                    <Badge
                      colorScheme={getCategoryColor(selectedStory.category)}
                      fontSize="sm"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      {getCategoryLabel(selectedStory.category)}
                    </Badge>
                    <Heading size="xl" color="white">
                      {selectedStory.title}
                    </Heading>
                  </VStack>
                </Box>
              )}

              {/* Contenu */}
              <VStack align="stretch" p={8} spacing={6}>
                {/* Auteur */}
                <HStack>
                  <Avatar
                    size="md"
                    name={`${selectedStory.author.firstName} ${selectedStory.author.lastName}`}
                    src={selectedStory.author.photoUrl}
                  />
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="600">
                      {selectedStory.author.firstName} {selectedStory.author.lastName}
                    </Text>
                    <Text fontSize="sm" color="neutral.500">
                      {new Date(selectedStory.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>
                  </VStack>
                </HStack>

                {/* Texte */}
                <Text fontSize="md" lineHeight="tall" color="neutral.700" whiteSpace="pre-wrap">
                  {selectedStory.content}
                </Text>

                {/* Actions */}
                <HStack spacing={4} pt={4} borderTop="1px" borderColor="neutral.100">
                  <Button
                    leftIcon={<FaHeart />}
                    variant="ghost"
                    colorScheme="red"
                    size="sm"
                  >
                    J'aime ({selectedStory.likes})
                  </Button>
                  <Button
                    leftIcon={<FaComment />}
                    variant="ghost"
                    colorScheme="blue"
                    size="sm"
                  >
                    Commenter ({selectedStory.comments})
                  </Button>
                </HStack>
              </VStack>
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Stories;
