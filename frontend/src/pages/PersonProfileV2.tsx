import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Avatar,
  Badge,
  Button,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  Grid,
  GridItem,
  Divider,
} from '@chakra-ui/react';
import {
  FaCross,
  FaBirthdayCake,
  FaMapMarkerAlt,
  FaBriefcase,
  FaEnvelope,
  FaUsers,
  FaRing,
  FaEdit,
  FaArrowLeft,
  FaBook,
  FaMale,
  FaFemale,
  FaUser,
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface Person {
  personID: number;
  firstName: string;
  lastName: string;
  sex: string;
  birthday: string | null;
  deathDate: string | null;
  alive: boolean;
  photoUrl: string | null;
  email: string | null;
  activity: string | null;
  notes: string | null;
  cityName: string | null;
  fatherID: number | null;
  motherID: number | null;
  fatherName: string | null;
  motherName: string | null;
}

interface Child {
  personID: number;
  firstName: string;
  lastName: string;
  birthday: string | null;
  deathDate?: string | null;
  alive: boolean;
  sex: string;
}

interface Wedding {
  weddingID: number;
  spouseID: number;
  spouseName: string;
  weddingDate: string | null;
  divorceDate: string | null;
  stillMarried: boolean;
}

const PersonProfileV2 = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const { t } = useTranslation();

  const [person, setPerson] = useState<Person | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [loading, setLoading] = useState(true);
  const [canEditProfile, setCanEditProfile] = useState(false);

  const isCurrentUser = user?.idPerson === parseInt(id || '0');

  useEffect(() => {
    loadPersonData();
  }, [id]);

  useEffect(() => {
    if (!person || !user) {
      setCanEditProfile(false);
      return;
    }

    const checkEditPermissions = async () => {
      try {
        const currentUserResponse = await api.get(`/persons/${user.idPerson}`);
        const currentUserPerson = currentUserResponse.data;

        const isOwnProfile = person.personID === user.idPerson;
        const isChildOfParent = 
          (currentUserPerson.fatherID === person.personID || 
           currentUserPerson.motherID === person.personID);
        const isAdmin = user.role === 'Admin';

        setCanEditProfile(isOwnProfile || isChildOfParent || isAdmin);
      } catch (error) {
        console.error('Erreur vérification permissions:', error);
        setCanEditProfile(isCurrentUser);
      }
    };

    checkEditPermissions();
  }, [person, user]);

  const loadPersonData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/persons/${id}`);
      setPerson(response.data);

      const childrenResponse = await api.get(`/persons/${id}/children`);
      setChildren(childrenResponse.data || []);

      const weddingsResponse = await api.get(`/persons/${id}/weddings`);
      setWeddings(weddingsResponse.data || []);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.response?.data || t('personProfile.unableToLoadProfile'),
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate: string | null, deathDate: string | null = null, isAlive: boolean = true) => {
    if (!birthDate) return null;
    
    if (!isAlive && !deathDate) {
      return null;
    }
    
    const birth = new Date(birthDate);
    const end = deathDate ? new Date(deathDate) : new Date();
    let age = end.getFullYear() - birth.getFullYear();
    const monthDiff = end.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString();
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={20} textAlign="center">
        <Spinner size="xl" color="primary.500" thickness="4px" />
        <Text mt={4} color="gray.600">{t('personProfile.loadingProfile')}</Text>
      </Container>
    );
  }

  if (!person) {
    return (
      <Container maxW="container.xl" py={20}>
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          {t('personProfile.personNotFound')}
        </Alert>
      </Container>
    );
  }

  const age = calculateAge(person.birthday, person.deathDate, person.alive);
  const birthYear = person.birthday ? new Date(person.birthday).getFullYear() : null;
  const deathYear = person.deathDate ? new Date(person.deathDate).getFullYear() : null;

  return (
    <Box minH="100vh" bg="gray.50">
      {/* 🎨 Bannière Dégradée Style EditMemberV2 */}
      <Box
        bgGradient={person.alive 
          ? 'linear(to-r, primary.400, secondary.500)' 
          : 'linear(to-r, gray.600, gray.400)'}
        color="white"
        pb={24}
        pt={8}
        position="relative"
      >
        <Container maxW="container.xl">
          <Button
            leftIcon={<FaArrowLeft />}
            variant="glass"
            color="white"
            borderColor="whiteAlpha.400"
            _hover={{ bg: 'whiteAlpha.200', borderColor: 'whiteAlpha.600' }}
            onClick={() => navigate(-1)}
            mb={6}
          >
            {t('personProfile.back')}
          </Button>

          {/* Header avec Badges */}
          <HStack spacing={6} justify="space-between" align="start">
            <VStack align="start" spacing={2}>
              <Heading size="2xl" fontFamily="heading" textShadow="0 2px 10px rgba(0,0,0,0.2)">
                {person.firstName} {person.lastName.toUpperCase()}
              </Heading>
              <HStack spacing={3} flexWrap="wrap">
                {isCurrentUser && (
                  <Badge colorScheme="yellow" fontSize="sm" px={3} py={1} borderRadius="md">
                    ⭐ {t('personProfile.itsYou')}
                  </Badge>
                )}
                <Badge 
                  colorScheme={person.alive ? 'green' : 'gray'} 
                  fontSize="sm" 
                  px={3} 
                  py={1}
                  borderRadius="md"
                >
                  {person.alive ? '💚 Vivant' : '✝️ Décédé'}
                </Badge>
                {age !== null && (
                  <Badge colorScheme="blue" fontSize="sm" px={3} py={1} borderRadius="md">
                    {age} ans
                  </Badge>
                )}
              </HStack>
            </VStack>

            {canEditProfile && (
              <Button
                leftIcon={<FaEdit />}
                variant="solid"
                bg="white"
                color="primary.700"
                shadow="md"
                _hover={{ bg: 'gray.50', shadow: 'lg', transform: 'translateY(-2px)' }}
                onClick={() => navigate(`/edit-member/${person.personID}`)}
              >
                {t('personProfile.editProfile')}
              </Button>
            )}
          </HStack>
        </Container>
      </Box>

      {/* 📸 Photo de Profil Centrée (comme EditMemberV2) */}
      <Container maxW="container.xl" position="relative" mt="-16">
        <HStack justify="center" mb={8}>
          <Box position="relative">
            <Avatar
              size="2xl"
              name={`${person.firstName} ${person.lastName}`}
              src={person.photoUrl || undefined}
              bg={person.sex === 'M' ? 'accent.male' : 'accent.female'}
              filter={!person.alive ? 'grayscale(80%)' : 'none'}
              borderWidth={6}
              borderColor="white"
              boxShadow="2xl"
              boxSize="160px"
            />
            {!person.alive && (
              <Box 
                position="absolute" 
                top="50%" 
                left="50%" 
                transform="translate(-50%, -50%)"
                bg="blackAlpha.600"
                borderRadius="full"
                p={3}
              >
                <Icon as={FaCross} boxSize={8} color="white" />
              </Box>
            )}
            <Icon
              as={person.sex === 'M' ? FaMale : FaFemale}
              position="absolute"
              bottom={2}
              right={2}
              boxSize={8}
              bg={person.sex === 'M' ? 'blue.500' : 'pink.500'}
              color="white"
              borderRadius="full"
              p={1.5}
              borderWidth={3}
              borderColor="white"
            />
          </Box>
        </HStack>

        {/* 📑 Onglets (comme EditMemberV2) */}
        <Card shadow="xl" borderRadius="xl" overflow="hidden">
          <CardBody p={0}>
            <Tabs colorScheme="primary" variant="enclosed">
              <TabList px={6} pt={4} borderBottomWidth={2} borderColor="gray.200">
                <Tab fontWeight="semibold" _selected={{ color: 'primary.600', borderColor: 'primary.600' }}>
                  <Icon as={FaUser} mr={2} />
                  Informations
                </Tab>
                <Tab fontWeight="semibold" _selected={{ color: 'primary.600', borderColor: 'primary.600' }}>
                  <Icon as={FaMapMarkerAlt} mr={2} />
                  Localisation
                </Tab>
                <Tab fontWeight="semibold" _selected={{ color: 'primary.600', borderColor: 'primary.600' }}>
                  <Icon as={FaBriefcase} mr={2} />
                  Profession
                </Tab>
                <Tab fontWeight="semibold" _selected={{ color: 'primary.600', borderColor: 'primary.600' }}>
                  <Icon as={FaUsers} mr={2} />
                  Famille
                </Tab>
                <Tab fontWeight="semibold" _selected={{ color: 'primary.600', borderColor: 'primary.600' }}>
                  <Icon as={FaBook} mr={2} />
                  Notes
                </Tab>
              </TabList>

              <TabPanels>
                {/* ONGLET 1: INFORMATIONS */}
                <TabPanel px={8} py={6}>
                  <VStack spacing={6} align="stretch">
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                      <GridItem>
                        <HStack spacing={3} p={4} bg="purple.50" borderRadius="md">
                          <Icon as={FaBirthdayCake} color="primary.500" boxSize={6} />
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm" color="gray.600" fontWeight="medium">
                              Date de naissance
                            </Text>
                            <Text fontSize="lg" fontWeight="semibold">
                              {formatDate(person.birthday)}
                            </Text>
                            {birthYear && (
                              <Text fontSize="sm" color="gray.500">
                                En {birthYear}
                              </Text>
                            )}
                          </VStack>
                        </HStack>
                      </GridItem>

                      {!person.alive && (
                        <GridItem>
                          <HStack spacing={3} p={4} bg="gray.100" borderRadius="md">
                            <Icon as={FaCross} color="gray.600" boxSize={6} />
                            <VStack align="start" spacing={0}>
                              <Text fontSize="sm" color="gray.600" fontWeight="medium">
                                Date de décès
                              </Text>
                              <Text fontSize="lg" fontWeight="semibold">
                                {formatDate(person.deathDate)}
                              </Text>
                              {deathYear && (
                                <Text fontSize="sm" color="gray.500">
                                  En {deathYear}
                                </Text>
                              )}
                            </VStack>
                          </HStack>
                        </GridItem>
                      )}

                      {person.email && (
                        <GridItem>
                          <HStack spacing={3} p={4} bg="blue.50" borderRadius="md">
                            <Icon as={FaEnvelope} color="blue.500" boxSize={6} />
                            <VStack align="start" spacing={0}>
                              <Text fontSize="sm" color="gray.600" fontWeight="medium">
                                Email
                              </Text>
                              <Text fontSize="md" fontWeight="semibold" wordBreak="break-word">
                                {person.email}
                              </Text>
                            </VStack>
                          </HStack>
                        </GridItem>
                      )}
                    </Grid>
                  </VStack>
                </TabPanel>

                {/* ONGLET 2: LOCALISATION */}
                <TabPanel px={8} py={6}>
                  <VStack spacing={6} align="stretch">
                    {person.cityName ? (
                      <HStack spacing={4} p={6} bg="green.50" borderRadius="lg" borderWidth={1} borderColor="green.200">
                        <Icon as={FaMapMarkerAlt} color="green.600" boxSize={8} />
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" color="gray.600" fontWeight="medium">
                            Ville de résidence
                          </Text>
                          <Text fontSize="2xl" fontWeight="bold" color="green.700">
                            {person.cityName}
                          </Text>
                        </VStack>
                      </HStack>
                    ) : (
                      <Alert status="info" borderRadius="lg">
                        <AlertIcon />
                        Aucune localisation renseignée
                      </Alert>
                    )}
                  </VStack>
                </TabPanel>

                {/* ONGLET 3: PROFESSION */}
                <TabPanel px={8} py={6}>
                  <VStack spacing={6} align="stretch">
                    {person.activity ? (
                      <HStack spacing={4} p={6} bg="orange.50" borderRadius="lg" borderWidth={1} borderColor="orange.200">
                        <Icon as={FaBriefcase} color="orange.600" boxSize={8} />
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" color="gray.600" fontWeight="medium">
                            Activité professionnelle
                          </Text>
                          <Text fontSize="2xl" fontWeight="bold" color="orange.700">
                            {person.activity}
                          </Text>
                        </VStack>
                      </HStack>
                    ) : (
                      <Alert status="info" borderRadius="lg">
                        <AlertIcon />
                        Aucune profession renseignée
                      </Alert>
                    )}
                  </VStack>
                </TabPanel>

                {/* ONGLET 4: FAMILLE */}
                <TabPanel px={8} py={6}>
                  <VStack spacing={8} align="stretch">
                    {/* Parents */}
                    <Box>
                      <Heading size="md" mb={4} color="primary.700">
                        👨‍👩‍👦 Parents
                      </Heading>
                      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                        <Card variant="elevated" borderRadius="md">
                          <CardBody>
                            <HStack spacing={3}>
                              <Icon as={FaMale} color="blue.500" boxSize={6} />
                              <VStack align="start" spacing={0}>
                                <Text fontSize="xs" color="gray.500">Père</Text>
                                <Text fontWeight="semibold" fontSize="lg">
                                  {person.fatherName || '-'}
                                </Text>
                              </VStack>
                            </HStack>
                          </CardBody>
                        </Card>

                        <Card variant="elevated" borderRadius="md">
                          <CardBody>
                            <HStack spacing={3}>
                              <Icon as={FaFemale} color="pink.500" boxSize={6} />
                              <VStack align="start" spacing={0}>
                                <Text fontSize="xs" color="gray.500">Mère</Text>
                                <Text fontWeight="semibold" fontSize="lg">
                                  {person.motherName || '-'}
                                </Text>
                              </VStack>
                            </HStack>
                          </CardBody>
                        </Card>
                      </Grid>
                    </Box>

                    <Divider />

                    {/* Mariages */}
                    <Box>
                      <Heading size="md" mb={4} color="primary.700">
                        💍 Mariages ({weddings.length})
                      </Heading>
                      {weddings.length > 0 ? (
                        <VStack spacing={3} align="stretch">
                          {weddings.map((wedding) => (
                            <Card key={wedding.weddingID} variant="elevated" borderRadius="md">
                              <CardBody>
                                <HStack justify="space-between">
                                  <HStack spacing={3}>
                                    <Icon as={FaRing} color="pink.500" boxSize={5} />
                                    <VStack align="start" spacing={0}>
                                      <Text fontWeight="semibold">{wedding.spouseName}</Text>
                                      <Text fontSize="sm" color="gray.600">
                                        Marié le {formatDate(wedding.weddingDate)}
                                      </Text>
                                      {wedding.divorceDate && (
                                        <Text fontSize="sm" color="red.500">
                                          Divorcé le {formatDate(wedding.divorceDate)}
                                        </Text>
                                      )}
                                    </VStack>
                                  </HStack>
                                  <Badge colorScheme={wedding.stillMarried ? 'green' : 'gray'}>
                                    {wedding.stillMarried ? 'Marié' : 'Divorcé'}
                                  </Badge>
                                </HStack>
                              </CardBody>
                            </Card>
                          ))}
                        </VStack>
                      ) : (
                        <Alert status="info" borderRadius="lg">
                          <AlertIcon />
                          Aucun mariage enregistré
                        </Alert>
                      )}
                    </Box>

                    <Divider />

                    {/* Enfants */}
                    <Box>
                      <Heading size="md" mb={4} color="primary.700">
                        👶 Enfants ({children.length})
                      </Heading>
                      {children.length > 0 ? (
                        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={3}>
                          {children.map((child) => (
                            <Card 
                              key={child.personID} 
                              variant="elevated" 
                              borderRadius="md"
                              cursor="pointer"
                              _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
                              transition="all 0.2s"
                              onClick={() => navigate(`/person/${child.personID}`)}
                            >
                              <CardBody>
                                <HStack spacing={3}>
                                  <Icon 
                                    as={child.sex === 'M' ? FaMale : FaFemale} 
                                    color={child.sex === 'M' ? 'blue.500' : 'pink.500'} 
                                    boxSize={5} 
                                  />
                                  <VStack align="start" spacing={0} flex={1}>
                                    <Text fontWeight="semibold">
                                      {child.firstName} {child.lastName}
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">
                                      {child.birthday 
                                        ? `${calculateAge(child.birthday, child.deathDate, child.alive) || '-'} ans` 
                                        : '-'}
                                    </Text>
                                  </VStack>
                                  {!child.alive && (
                                    <Icon as={FaCross} color="gray.400" boxSize={4} />
                                  )}
                                </HStack>
                              </CardBody>
                            </Card>
                          ))}
                        </Grid>
                      ) : (
                        <Alert status="info" borderRadius="lg">
                          <AlertIcon />
                          Aucun enfant enregistré
                        </Alert>
                      )}
                    </Box>
                  </VStack>
                </TabPanel>

                {/* ONGLET 5: NOTES */}
                <TabPanel px={8} py={6}>
                  <VStack spacing={4} align="stretch">
                    {person.notes ? (
                      <Box p={6} bg="yellow.50" borderRadius="lg" borderWidth={1} borderColor="yellow.200">
                        <HStack spacing={3} mb={3}>
                          <Icon as={FaBook} color="yellow.600" boxSize={6} />
                          <Heading size="sm" color="yellow.800">Notes biographiques</Heading>
                        </HStack>
                        <Text color="gray.700" lineHeight="tall" whiteSpace="pre-wrap">
                          {person.notes}
                        </Text>
                      </Box>
                    ) : (
                      <Alert status="info" borderRadius="lg">
                        <AlertIcon />
                        Aucune note disponible
                      </Alert>
                    )}
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>
      </Container>

      <Box h={20} /> {/* Spacer */}
    </Box>
  );
};

export default PersonProfileV2;
