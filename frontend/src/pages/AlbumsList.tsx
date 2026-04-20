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
  Center
} from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaPlus, FaImages, FaCalendar, FaUser } from 'react-icons/fa';
import api from '../services/api';

interface Album {
  albumID: number;
  title: string;
  description: string;
  coverPhotoUrl: string | null;
  visibility: string;
  photoCount: number;
  createdBy: string;
  createdAt: string;
  lastPhotoDate: string | null;
}

const AlbumsList = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();
  const { t, i18n } = useTranslation();
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    try {
      setLoading(true);
      const response = await api.get<Album[]>('/albums');
      setAlbums(response.data);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('albums.cannotLoadAlbums'),
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Center h="60vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="orange.500" thickness="4px" />
          <Text color="gray.500">{t('albums.loadingAlbums')}</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg="transparent">
      {/* Header gradient */}
      <Box bgGradient="linear(to-r, purple.900, purple.700)" py={8}>
        <Container maxW="container.xl">
          <HStack justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <HStack spacing={4}>
              <Box w="52px" h="52px" borderRadius="xl" bg="whiteAlpha.200" display="flex" alignItems="center" justifyContent="center" border="1px solid" borderColor="whiteAlpha.300">
                <Icon as={FaImages} color="white" boxSize={5} />
              </Box>
              <Box>
                <Heading size="lg" color="white" fontWeight="700">{t('albums.photoAlbums')}</Heading>
                <Text color="whiteAlpha.700" fontSize="sm" mt={0.5}>
                  {t('albums.albumCount', { count: albums.length })} · {t('albums.familyMemories')}
                </Text>
              </Box>
            </HStack>
            <Button
              leftIcon={<Icon as={FaPlus} />}
              bg="whiteAlpha.200"
              color="white"
              border="1px solid"
              borderColor="whiteAlpha.300"
              _hover={{ bg: 'whiteAlpha.300', transform: 'translateY(-1px)' }}
              fontWeight="600"
              onClick={() => navigate('/albums/new')}
            >
              {t('albums.newAlbum')}
            </Button>
          </HStack>
        </Container>
      </Box>

    <Container maxW="container.xl" py={8}>

      {/* Albums Grid */}
      {albums.length === 0 ? (
        <Center h="40vh">
          <VStack spacing={4}>
            <Icon as={FaImages} boxSize={16} color="gray.300" />
            <Heading size="md" color="gray.500">
              {t('albums.noAlbumsYet')}
            </Heading>
            <Text color="gray.400" textAlign="center" maxW="md">
              {t('albums.createFirstAlbum')}
            </Text>
            <Button
              leftIcon={<Icon as={FaPlus} />}
              colorScheme="orange"
              onClick={() => navigate('/albums/new')}
              mt={4}
            >
              {t('albums.createAlbum')}
            </Button>
          </VStack>
        </Center>
      ) : (
        <Grid 
          templateColumns={{ 
            base: '1fr', 
            md: 'repeat(2, 1fr)', 
            lg: 'repeat(3, 1fr)' 
          }} 
          gap={6}
        >
          {albums.map((album) => (
            <Box
              key={album.albumID}
              borderRadius="xl"
              overflow="hidden"
              boxShadow="md"
              bg="white"
              cursor="pointer"
              onClick={() => navigate(`/albums/${album.albumID}`)}
              transition="all 0.3s"
              _hover={{ 
                transform: 'translateY(-8px)', 
                boxShadow: 'xl',
                borderColor: 'orange.500',
                borderWidth: '2px'
              }}
              borderWidth="2px"
              borderColor="transparent"
            >
              {/* Cover Image */}
              <Box 
                position="relative" 
                h="220px" 
                bg="gray.100"
                overflow="hidden"
              >
                {album.coverPhotoUrl ? (
                  <Image
                    src={album.coverPhotoUrl}
                    alt={album.title}
                    w="100%"
                    h="100%"
                    objectFit="cover"
                  />
                ) : (
                  <Center h="100%" bg="gradient-to-br from-orange.100 to-orange.200">
                    <Icon as={FaImages} boxSize={16} color="orange.300" />
                  </Center>
                )}
                
                {/* Photo Count Badge */}
                <Badge
                  position="absolute"
                  top={3}
                  right={3}
                  colorScheme="orange"
                  fontSize="md"
                  px={3}
                  py={1}
                  borderRadius="full"
                  boxShadow="md"
                >
                  <HStack spacing={1}>
                    <Icon as={FaImages} />
                    <Text>{album.photoCount}</Text>
                  </HStack>
                </Badge>

                {/* Visibility Badge */}
                {album.visibility !== 'family' && (
                  <Badge
                    position="absolute"
                    top={3}
                    left={3}
                    colorScheme={album.visibility === 'private' ? 'red' : 'blue'}
                    fontSize="sm"
                    px={2}
                    py={1}
                    borderRadius="md"
                  >
                    {album.visibility === 'private' ? t('albums.private') : t('albums.custom')}
                  </Badge>
                )}
              </Box>

              {/* Album Info */}
              <Box p={5}>
                <Heading size="md" mb={2} color="gray.800" noOfLines={1}>
                  {album.title}
                </Heading>
                
                {album.description && (
                  <Text 
                    fontSize="sm" 
                    color="gray.600" 
                    mb={3} 
                    noOfLines={2}
                    minH="40px"
                  >
                    {album.description}
                  </Text>
                )}

                <VStack spacing={2} align="stretch" mt={4}>
                  <HStack fontSize="sm" color="gray.500" spacing={2}>
                    <Icon as={FaUser} />
                    <Text>{t('albums.by', { name: album.createdBy })}</Text>
                  </HStack>
                  
                  <HStack fontSize="sm" color="gray.500" spacing={2}>
                    <Icon as={FaCalendar} />
                    <Text>
                      {t('albums.createdOn', {
                        date: new Date(album.createdAt).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })
                      })}
                    </Text>
                  </HStack>

                  {album.lastPhotoDate && (
                    <HStack fontSize="sm" color="orange.500" spacing={2} fontWeight="medium">
                      <Icon as={FaImages} />
                      <Text>
                        {t('albums.lastPhoto', {
                          date: new Date(album.lastPhotoDate).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US')
                        })}
                      </Text>
                    </HStack>
                  )}
                </VStack>
              </Box>
            </Box>
          ))}
        </Grid>
      )}
    </Container>
    </Box>
  );
};

export default AlbumsList;
