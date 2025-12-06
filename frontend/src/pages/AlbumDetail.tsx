import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  Grid, 
  Image, 
  Badge, 
  HStack, 
  VStack, 
  Button, 
  Icon,
  useToast,
  Spinner,
  Center,
  IconButton,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Divider,
  Avatar,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FaHeart, 
  FaRegHeart, 
  FaChevronLeft, 
  FaChevronRight, 
  FaPlus, 
  FaEdit,
  FaImages,
  FaCalendar,
  FaMapMarkerAlt,
  FaUser
} from 'react-icons/fa';
import api from '../services/api';

interface Photo {
  photoID: number;
  url: string;
  thumbnailUrl: string | null;
  title: string | null;
  description: string | null;
  dateTaken: string | null;
  location: string | null;
  likeCount: number;
  isLikedByCurrentUser: boolean;
  taggedPersons: Array<{
    personID: number;
    name: string;
    positionX: number | null;
    positionY: number | null;
  }>;
}

interface Comment {
  commentID: number;
  content: string;
  authorName: string;
  createdAt: string;
}

interface AlbumDetail {
  albumID: number;
  title: string;
  description: string | null;
  coverPhotoUrl: string | null;
  visibility: string;
  familyID: number;
  eventID: number | null;
  eventTitle: string | null;
  createdBy: string;
  createdAt: string;
  photoCount: number;
  commentCount: number;
  photos: Photo[];
  comments: Comment[];
}

const AlbumDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [album, setAlbum] = useState<AlbumDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    loadAlbum();
  }, [id]);

  const loadAlbum = async () => {
    try {
      setLoading(true);
      const response = await api.get<AlbumDetail>(`/albums/${id}`);
      setAlbum(response.data);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger l\'album',
        status: 'error',
        duration: 3000,
      });
      navigate('/albums');
    } finally {
      setLoading(false);
    }
  };

  const handleLikePhoto = async (photoId: number) => {
    try {
      await api.post(`/photos/${photoId}/like`);
      loadAlbum(); // Recharger pour mettre à jour les likes
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de liker la photo',
        status: 'error',
        duration: 2000,
      });
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await api.post(`/albums/${id}/comments`, { content: newComment });
      setNewComment('');
      loadAlbum();
      toast({
        title: 'Commentaire ajouté',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter le commentaire',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const openLightbox = (photo: Photo, index: number) => {
    setSelectedPhoto(photo);
    setCurrentPhotoIndex(index);
    onOpen();
  };

  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (!album) return;
    
    let newIndex = currentPhotoIndex;
    if (direction === 'prev') {
      newIndex = currentPhotoIndex > 0 ? currentPhotoIndex - 1 : album.photos.length - 1;
    } else {
      newIndex = currentPhotoIndex < album.photos.length - 1 ? currentPhotoIndex + 1 : 0;
    }
    
    setCurrentPhotoIndex(newIndex);
    setSelectedPhoto(album.photos[newIndex]);
  };

  if (loading) {
    return (
      <Center h="60vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="orange.500" thickness="4px" />
          <Text color="gray.500">Chargement de l'album...</Text>
        </VStack>
      </Center>
    );
  }

  if (!album) return null;

  return (
    <Container maxW="container.xl" py={8}>
      {/* Breadcrumb */}
      <Breadcrumb mb={6} fontSize="sm" color="gray.600">
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/albums">Albums</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>{album.title}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      {/* Album Header */}
      <Box bg="white" p={8} borderRadius="xl" boxShadow="md" mb={8}>
        <HStack justify="space-between" align="flex-start" mb={4}>
          <VStack align="flex-start" spacing={2} flex={1}>
            <Heading size="xl" color="gray.800">
              {album.title}
            </Heading>
            {album.description && (
              <Text color="gray.600" fontSize="md">
                {album.description}
              </Text>
            )}
            {album.eventTitle && (
              <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
                📅 {album.eventTitle}
              </Badge>
            )}
          </VStack>
          
          <HStack spacing={3}>
            <Button
              leftIcon={<Icon as={FaPlus} />}
              colorScheme="orange"
              onClick={() => navigate(`/albums/${id}/upload`)}
            >
              Ajouter des photos
            </Button>
            <IconButton
              aria-label="Modifier"
              icon={<FaEdit />}
              colorScheme="blue"
              variant="outline"
              onClick={() => navigate(`/albums/${id}/edit`)}
            />
          </HStack>
        </HStack>

        <HStack spacing={6} color="gray.600" fontSize="sm">
          <HStack>
            <Icon as={FaImages} />
            <Text>{album.photoCount} photo{album.photoCount > 1 ? 's' : ''}</Text>
          </HStack>
          <HStack>
            <Icon as={FaUser} />
            <Text>Par {album.createdBy}</Text>
          </HStack>
          <HStack>
            <Icon as={FaCalendar} />
            <Text>{new Date(album.createdAt).toLocaleDateString('fr-FR')}</Text>
          </HStack>
        </HStack>
      </Box>

      {/* Photos Gallery */}
      {album.photos.length === 0 ? (
        <Center h="40vh" bg="white" borderRadius="xl" boxShadow="md">
          <VStack spacing={4}>
            <Icon as={FaImages} boxSize={16} color="gray.300" />
            <Heading size="md" color="gray.500">
              Aucune photo dans cet album
            </Heading>
            <Button
              leftIcon={<Icon as={FaPlus} />}
              colorScheme="orange"
              onClick={() => navigate(`/albums/${id}/upload`)}
            >
              Ajouter des photos
            </Button>
          </VStack>
        </Center>
      ) : (
        <Grid 
          templateColumns="repeat(auto-fill, minmax(250px, 1fr))" 
          gap={4}
          mb={8}
        >
          {album.photos.map((photo, index) => (
            <Box
              key={photo.photoID}
              position="relative"
              borderRadius="lg"
              overflow="hidden"
              cursor="pointer"
              onClick={() => openLightbox(photo, index)}
              transition="all 0.3s"
              _hover={{ 
                transform: 'scale(1.05)', 
                boxShadow: 'xl',
                '& > .overlay': { opacity: 1 }
              }}
              boxShadow="md"
              bg="white"
            >
              <Image
                src={photo.thumbnailUrl || photo.url}
                alt={photo.title || 'Photo'}
                w="100%"
                h="250px"
                objectFit="cover"
              />
              
              {/* Overlay on hover */}
              <Box
                className="overlay"
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bg="blackAlpha.700"
                opacity={0}
                transition="opacity 0.3s"
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                color="white"
                p={4}
              >
                <VStack spacing={2}>
                  <HStack spacing={1}>
                    <Icon as={FaHeart} color="red.400" />
                    <Text fontSize="lg" fontWeight="bold">{photo.likeCount}</Text>
                  </HStack>
                  {photo.title && (
                    <Text fontSize="sm" fontWeight="medium" textAlign="center" noOfLines={2}>
                      {photo.title}
                    </Text>
                  )}
                  {photo.taggedPersons.length > 0 && (
                    <Badge colorScheme="blue" fontSize="xs">
                      {photo.taggedPersons.length} personne{photo.taggedPersons.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </VStack>
              </Box>
            </Box>
          ))}
        </Grid>
      )}

      {/* Comments Section */}
      <Box bg="white" p={8} borderRadius="xl" boxShadow="md">
        <Heading size="md" mb={6}>
          💬 Commentaires ({album.commentCount})
        </Heading>

        {/* Add Comment */}
        <VStack spacing={3} mb={6}>
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <Button
            alignSelf="flex-end"
            colorScheme="orange"
            onClick={handleAddComment}
            isDisabled={!newComment.trim()}
          >
            Publier
          </Button>
        </VStack>

        <Divider mb={6} />

        {/* Comments List */}
        <VStack spacing={4} align="stretch">
          {album.comments.length === 0 ? (
            <Text color="gray.500" textAlign="center" py={8}>
              Aucun commentaire pour le moment
            </Text>
          ) : (
            album.comments.map((comment) => (
              <HStack key={comment.commentID} align="flex-start" spacing={4}>
                <Avatar name={comment.authorName} size="sm" />
                <Box flex={1}>
                  <HStack justify="space-between" mb={1}>
                    <Text fontWeight="bold" fontSize="sm">{comment.authorName}</Text>
                    <Text fontSize="xs" color="gray.500">
                      {new Date(comment.createdAt).toLocaleDateString('fr-FR')}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.700">
                    {comment.content}
                  </Text>
                </Box>
              </HStack>
            ))
          )}
        </VStack>
      </Box>

      {/* Lightbox Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <ModalOverlay bg="blackAlpha.900" />
        <ModalContent bg="black" m={0}>
          <ModalCloseButton 
            color="white" 
            size="lg" 
            top={4} 
            right={4}
            zIndex={2}
            _hover={{ bg: 'whiteAlpha.200' }}
          />
          <ModalBody p={0} position="relative">
            {selectedPhoto && (
              <VStack h="100vh" justify="center" spacing={0}>
                {/* Photo */}
                <Box flex={1} display="flex" alignItems="center" justifyContent="center" w="100%">
                  <Image
                    src={selectedPhoto.url}
                    alt={selectedPhoto.title || 'Photo'}
                    maxH="80vh"
                    maxW="90vw"
                    objectFit="contain"
                  />
                </Box>

                {/* Navigation Arrows */}
                <IconButton
                  aria-label="Photo précédente"
                  icon={<FaChevronLeft />}
                  position="absolute"
                  left={4}
                  top="50%"
                  transform="translateY(-50%)"
                  colorScheme="whiteAlpha"
                  size="lg"
                  onClick={() => navigatePhoto('prev')}
                  isRound
                />
                <IconButton
                  aria-label="Photo suivante"
                  icon={<FaChevronRight />}
                  position="absolute"
                  right={4}
                  top="50%"
                  transform="translateY(-50%)"
                  colorScheme="whiteAlpha"
                  size="lg"
                  onClick={() => navigatePhoto('next')}
                  isRound
                />

                {/* Photo Info */}
                <Box 
                  bg="blackAlpha.700" 
                  w="100%" 
                  p={6} 
                  color="white"
                  backdropFilter="blur(10px)"
                >
                  <HStack justify="space-between" align="flex-start">
                    <VStack align="flex-start" spacing={2}>
                      {selectedPhoto.title && (
                        <Heading size="md">{selectedPhoto.title}</Heading>
                      )}
                      {selectedPhoto.description && (
                        <Text fontSize="sm" color="whiteAlpha.800">
                          {selectedPhoto.description}
                        </Text>
                      )}
                      <HStack spacing={4} fontSize="sm">
                        {selectedPhoto.dateTaken && (
                          <HStack>
                            <Icon as={FaCalendar} />
                            <Text>{new Date(selectedPhoto.dateTaken).toLocaleDateString('fr-FR')}</Text>
                          </HStack>
                        )}
                        {selectedPhoto.location && (
                          <HStack>
                            <Icon as={FaMapMarkerAlt} />
                            <Text>{selectedPhoto.location}</Text>
                          </HStack>
                        )}
                      </HStack>
                      {selectedPhoto.taggedPersons.length > 0 && (
                        <HStack spacing={2} flexWrap="wrap">
                          {selectedPhoto.taggedPersons.map((person) => (
                            <Badge key={person.personID} colorScheme="blue">
                              {person.name}
                            </Badge>
                          ))}
                        </HStack>
                      )}
                    </VStack>

                    <Button
                      leftIcon={selectedPhoto.isLikedByCurrentUser ? <FaHeart /> : <FaRegHeart />}
                      colorScheme={selectedPhoto.isLikedByCurrentUser ? 'red' : 'whiteAlpha'}
                      onClick={() => handleLikePhoto(selectedPhoto.photoID)}
                      size="lg"
                    >
                      {selectedPhoto.likeCount}
                    </Button>
                  </HStack>
                </Box>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default AlbumDetail;
