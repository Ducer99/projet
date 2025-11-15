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
  SimpleGrid,
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
} from '@chakra-ui/react';
import {
  FaCross,
  FaBirthdayCake,
  FaMapMarkerAlt,
  FaBriefcase,
  FaEnvelope,
  FaUsers,
  FaHeart,
  FaRing,
  FaEdit,
  FaArrowLeft,
  FaCalendar,
  FaBook,
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { fadeInUp } from '../animations';

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

const PersonProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const { t, i18n } = useTranslation();

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
    // Vérifier si l'utilisateur peut modifier ce profil
    if (!person || !user) {
      setCanEditProfile(false);
      return;
    }

    // Récupérer le profil de l'utilisateur actuel pour vérifier les liens de parenté
    const checkEditPermissions = async () => {
      try {
        const currentUserResponse = await api.get(`/persons/${user.idPerson}`);
        const currentUserPerson = currentUserResponse.data;

        // 1. C'est son propre profil
        const isOwnProfile = person.personID === user.idPerson;

        // 2. L'utilisateur est enfant de cette personne (placeholder ou décédé)
        const isChildOfParent = 
          (currentUserPerson.fatherID === person.personID || 
           currentUserPerson.motherID === person.personID);

        // 3. Admin (on pourrait ajouter user.role === 'Admin')
        const isAdmin = user.role === 'Admin';

        setCanEditProfile(isOwnProfile || isChildOfParent || isAdmin);
      } catch (error) {
        console.error('Erreur vérification permissions:', error);
        setCanEditProfile(isCurrentUser); // Fallback: seulement son propre profil
      }
    };

    checkEditPermissions();
  }, [person, user]);

  const loadPersonData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/persons/${id}`);
      setPerson(response.data);

      // Charger les enfants
      const childrenResponse = await api.get(`/persons/${id}/children`);
      setChildren(childrenResponse.data || []);

      // Charger les mariages
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

  const calculateAge = (birthDate: string | null, deathDate: string | null = null) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const end = deathDate ? new Date(deathDate) : new Date();
    let age = end.getFullYear() - birth.getFullYear();
    const monthDiff = end.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
      age--;
    }
    return age;
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

  const age = calculateAge(person.birthday, person.deathDate);
  const birthYear = person.birthday ? new Date(person.birthday).getFullYear() : null;
  const deathYear = person.deathDate ? new Date(person.deathDate).getFullYear() : null;

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Hero Header avec Photo et Statut */}
      <Box
        bg={person.alive ? 'linear-gradient(135deg, #F6D365 0%, #FDA085 100%)' : 'linear-gradient(90deg, gray.700 0%, gray.500 100%)'}
        color="white"
        pb={20}
        pt={8}
        position="relative"
        sx={{ '@keyframes fadeInUp': fadeInUp, animation: 'fadeInUp 0.6s ease-out' }}
      >
        <Container maxW="container.xl">
          <Button
            leftIcon={<FaArrowLeft />}
            variant="ghost"
            color="white"
            _hover={{ bg: 'whiteAlpha.200' }}
            onClick={() => navigate(-1)}
            mb={4}
          >
            {t('personProfile.back')}
          </Button>

          <HStack spacing={6} align="start">
            <Box position="relative">
              <Avatar
                size="2xl"
                name={`${person.firstName} ${person.lastName}`}
                src={person.photoUrl || undefined}
                bg={person.alive ? (person.sex === 'M' ? 'semantic.male' : 'semantic.female') : 'gray.400'}
                filter={!person.alive ? 'grayscale(100%) brightness(0.8)' : 'none'}
                borderWidth={4}
                borderColor="white"
                boxShadow="2xl"
              />
              {!person.alive && (
                <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)">
                  <Icon as={FaCross} boxSize={10} color="white" opacity={0.9} />
                </Box>
              )}
            </Box>

            <VStack align="start" spacing={2} flex={1}>
              <HStack spacing={3}>
                <Heading size="2xl" fontFamily="heading">
                  {person.firstName} {person.lastName.toUpperCase()}
                </Heading>
                {isCurrentUser && (
                  <Badge colorScheme="red" fontSize="md" px={3} py={1}>
                    {t('personProfile.itsYou')}
                  </Badge>
                )}
              </HStack>

              <HStack spacing={4}>
                {age !== null && (
                  <Badge
                    colorScheme={person.alive ? 'green' : 'gray'}
                    fontSize="md"
                    px={3}
                    py={1}
                  >
                    {t('personProfile.yearsOld', { count: age })} {!person.alive && t('personProfile.atDeath')}
                  </Badge>
                )}
                {birthYear && deathYear && (
                  <Text fontSize="lg" fontWeight="medium">
                    ✝️ {birthYear} - {deathYear}
                  </Text>
                )}
                {person.alive && person.birthday && (
                  <Text fontSize="lg" fontWeight="medium">
                    {t('personProfile.bornIn', { year: birthYear })}
                  </Text>
                )}
              </HStack>

              {canEditProfile && (
                <Button
                  leftIcon={<FaEdit />}
                  variant="solid"
                  bg="white"
                  color="primary.700"
                  _hover={{ bg: 'whiteAlpha.900' }}
                  onClick={() => navigate(`/edit-member/${person.personID}`)}
                  mt={2}
                >
                  {t('personProfile.editProfile')}
                </Button>
              )}
            </VStack>
          </HStack>
        </Container>
      </Box>

      {/* Contenu principal avec onglets */}
      <Container maxW="container.xl" mt={-10} position="relative" zIndex={1}>
        <Tabs variant="soft-rounded" colorScheme="primary">
          <TabList bg="white" p={2} borderRadius="xl" boxShadow="lg" mb={6}>
            <Tab>{t('personProfile.identityTab')}</Tab>
            <Tab>{t('personProfile.familyTab')}</Tab>
            <Tab>{t('personProfile.timelineTab')}</Tab>
            <Tab>{t('personProfile.biographyTab')}</Tab>
          </TabList>

          <TabPanels>
            {/* ONGLET 1: Identité & Vie */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Card>
                  <CardBody>
                    <Heading size="md" color="primary.700" mb={4}>
                      <Icon as={FaBirthdayCake} mr={2} />
                      {t('personProfile.mainInformation')}
                    </Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      {person.birthday && (
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" color="gray.600" fontWeight="semibold">
                            {t('personProfile.birthDate')}
                          </Text>
                          <Text fontSize="lg" color="primary.900">
                            {new Date(person.birthday).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </Text>
                        </VStack>
                      )}

                      {person.deathDate && (
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" color="gray.600" fontWeight="semibold">
                            {t('personProfile.deathDate')}
                          </Text>
                          <Text fontSize="lg" color="gray.700">
                            {new Date(person.deathDate).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </Text>
                        </VStack>
                      )}

                      {person.cityName && (
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" color="gray.600" fontWeight="semibold">
                            <Icon as={FaMapMarkerAlt} mr={1} />
                            {t('personProfile.city')}
                          </Text>
                          <Text fontSize="lg" color="primary.900">
                            {person.cityName}
                          </Text>
                        </VStack>
                      )}

                      {person.activity && (
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" color="gray.600" fontWeight="semibold">
                            <Icon as={FaBriefcase} mr={1} />
                            {t('personProfile.profession')}
                          </Text>
                          <Text fontSize="lg" color="primary.900">
                            {person.activity}
                          </Text>
                        </VStack>
                      )}

                      {person.email && (
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" color="gray.600" fontWeight="semibold">
                            <Icon as={FaEnvelope} mr={1} />
                            {t('personProfile.email')}
                          </Text>
                          <Text fontSize="lg" color="primary.900">
                            {person.email}
                          </Text>
                        </VStack>
                      )}

                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.600" fontWeight="semibold">
                          {t('personProfile.sex')}
                        </Text>
                        <Badge colorScheme={person.sex === 'M' ? 'blue' : 'pink'} fontSize="md">
                          {person.sex === 'M' ? t('personProfile.male') : t('personProfile.female')}
                        </Badge>
                      </VStack>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                {!person.alive && (
                  <Alert
                    status="info"
                    variant="subtle"
                    borderRadius="lg"
                    bg="gray.100"
                    borderLeft="4px solid"
                    borderColor="gray.500"
                  >
                    <AlertIcon />
                    <Box>
                      <Text fontWeight="bold">{t('personProfile.inMemory', { name: person.firstName })}</Text>
                      <Text fontSize="sm" color="gray.600">
                        {t('personProfile.memoryText', {
                          date: person.deathDate && new Date(person.deathDate).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US')
                        })}
                      </Text>
                    </Box>
                  </Alert>
                )}
              </VStack>
            </TabPanel>

            {/* ONGLET 2: Famille (Relations) */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                {/* Parents */}
                <Card>
                  <CardBody>
                    <Heading size="md" color="primary.700" mb={4}>
                      <Icon as={FaUsers} mr={2} />
                      {t('personProfile.parents')}
                    </Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      {person.fatherID ? (
                        <Box
                          p={4}
                          bg="blue.50"
                          borderRadius="lg"
                          borderWidth={2}
                          borderColor="semantic.male"
                          cursor="pointer"
                          transition="all 0.3s"
                          _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                          onClick={() => navigate(`/person/${person.fatherID}`)}
                        >
                          <Text fontSize="sm" color="gray.600" mb={1}>
                            {t('personProfile.father')}
                          </Text>
                          <Text fontSize="lg" fontWeight="bold" color="primary.900">
                            👨 {person.fatherName}
                          </Text>
                        </Box>
                      ) : (
                        <Box p={4} bg="gray.50" borderRadius="lg" borderWidth={1} borderColor="gray.200">
                          <Text fontSize="sm" color="gray.500">
                            {t('personProfile.fatherNotSpecified')}
                          </Text>
                        </Box>
                      )}

                      {person.motherID ? (
                        <Box
                          p={4}
                          bg="pink.50"
                          borderRadius="lg"
                          borderWidth={2}
                          borderColor="semantic.female"
                          cursor="pointer"
                          transition="all 0.3s"
                          _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                          onClick={() => navigate(`/person/${person.motherID}`)}
                        >
                          <Text fontSize="sm" color="gray.600" mb={1}>
                            {t('personProfile.mother')}
                          </Text>
                          <Text fontSize="lg" fontWeight="bold" color="primary.900">
                            👩 {person.motherName}
                          </Text>
                        </Box>
                      ) : (
                        <Box p={4} bg="gray.50" borderRadius="lg" borderWidth={1} borderColor="gray.200">
                          <Text fontSize="sm" color="gray.500">
                            {t('personProfile.motherNotSpecified')}
                          </Text>
                        </Box>
                      )}
                    </SimpleGrid>
                  </CardBody>
                </Card>

                {/* Mariages/Conjoints */}
                {weddings.length > 0 && (
                  <Card>
                    <CardBody>
                      <Heading size="md" color="primary.700" mb={4}>
                        <Icon as={FaRing} mr={2} />
                        {t('personProfile.marriage', { count: weddings.length })}
                      </Heading>
                      <VStack spacing={4} align="stretch">
                        {weddings.map((wedding) => (
                          <Box
                            key={wedding.weddingID}
                            p={4}
                            bg="purple.50"
                            borderRadius="lg"
                            borderWidth={2}
                            borderColor={wedding.stillMarried ? 'accent.heart' : 'gray.300'}
                            cursor="pointer"
                            transition="all 0.3s"
                            _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                            onClick={() => navigate(`/person/${wedding.spouseID}`)}
                          >
                            <HStack justify="space-between">
                              <VStack align="start" spacing={1}>
                                <Text fontSize="lg" fontWeight="bold" color="primary.900">
                                  💍 {wedding.spouseName}
                                </Text>
                                {wedding.weddingDate && (
                                  <Text fontSize="sm" color="gray.600">
                                    {t('personProfile.marriedOn', {
                                      date: new Date(wedding.weddingDate).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US')
                                    })}
                                  </Text>
                                )}
                                {wedding.divorceDate && (
                                  <Text fontSize="sm" color="gray.500">
                                    {t('personProfile.divorcedOn', {
                                      date: new Date(wedding.divorceDate).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US')
                                    })}
                                  </Text>
                                )}
                              </VStack>
                              <Badge colorScheme={wedding.stillMarried ? 'green' : 'gray'}>
                                {wedding.stillMarried ? t('personProfile.married') : t('personProfile.divorced')}
                              </Badge>
                            </HStack>
                          </Box>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>
                )}

                {/* Enfants */}
                {children.length > 0 && (
                  <Card>
                    <CardBody>
                      <Heading size="md" color="primary.700" mb={4}>
                        <Icon as={FaHeart} mr={2} />
                        {t('personProfile.children', { count: children.length })}
                      </Heading>
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                        {children.map((child) => (
                          <Box
                            key={child.personID}
                            p={4}
                            bg={child.sex === 'M' ? 'blue.50' : 'pink.50'}
                            borderRadius="lg"
                            borderWidth={2}
                            borderColor={
                              child.sex === 'M' ? 'semantic.male' : 'semantic.female'
                            }
                            cursor="pointer"
                            transition="all 0.3s"
                            _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                            onClick={() => navigate(`/person/${child.personID}`)}
                          >
                            <VStack align="start" spacing={1}>
                              <Text fontSize="lg" fontWeight="bold" color="primary.900">
                                {child.sex === 'M' ? '👦' : '👧'} {child.firstName}{' '}
                                {child.lastName}
                              </Text>
                              {child.birthday && (
                                <Text fontSize="sm" color="gray.600">
                                  {t('personProfile.yearsOld', { count: calculateAge(child.birthday, null) || 0 })}
                                </Text>
                              )}
                              {!child.alive && (
                                <Badge colorScheme="gray" fontSize="xs">
                                  {t('personProfile.deceasedBadge')}
                                </Badge>
                              )}
                            </VStack>
                          </Box>
                        ))}
                      </SimpleGrid>
                    </CardBody>
                  </Card>
                )}

                {!person.fatherID && !person.motherID && weddings.length === 0 && children.length === 0 && (
                  <Alert status="info" borderRadius="lg">
                    <AlertIcon />
                    {t('personProfile.noFamilyRelations')}
                  </Alert>
                )}
              </VStack>
            </TabPanel>

            {/* ONGLET 3: Chronologie (Timeline) */}
            <TabPanel>
              <Card>
                <CardBody>
                  <Heading size="md" color="primary.700" mb={6}>
                    <Icon as={FaCalendar} mr={2} />
                    {t('personProfile.timeline')}
                  </Heading>

                  <Box position="relative" pl={8}>
                    {/* Ligne verticale */}
                    <Box
                      position="absolute"
                      left={4}
                      top={0}
                      bottom={0}
                      w="2px"
                      bg="primary.300"
                    />

                    <VStack spacing={8} align="stretch">
                      {/* Naissance */}
                      {person.birthday && (
                        <HStack position="relative">
                          <Box
                            position="absolute"
                            left="-20px"
                            w="40px"
                            h="40px"
                            bg="green.500"
                            borderRadius="full"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            color="white"
                            boxShadow="md"
                          >
                            <Icon as={FaBirthdayCake} boxSize={5} />
                          </Box>
                          <Box ml={8} p={4} bg="green.50" borderRadius="lg" flex={1}>
                            <Text fontWeight="bold" color="green.800" fontSize="lg">
                              {t('personProfile.birth')}
                            </Text>
                            <Text color="gray.700">
                              {new Date(person.birthday).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </Text>
                            {person.cityName && (
                              <Text fontSize="sm" color="gray.600" mt={1}>
                                📍 {person.cityName}
                              </Text>
                            )}
                          </Box>
                        </HStack>
                      )}

                      {/* Mariages */}
                      {weddings.map((wedding) => (
                        <HStack key={wedding.weddingID} position="relative">
                          <Box
                            position="absolute"
                            left="-20px"
                            w="40px"
                            h="40px"
                            bg="purple.500"
                            borderRadius="full"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            color="white"
                            boxShadow="md"
                          >
                            <Icon as={FaRing} boxSize={5} />
                          </Box>
                          <Box ml={8} p={4} bg="purple.50" borderRadius="lg" flex={1}>
                            <Text fontWeight="bold" color="purple.800" fontSize="lg">
                              {t('personProfile.marriageWith', { name: wedding.spouseName })}
                            </Text>
                            {wedding.weddingDate && (
                              <Text color="gray.700">
                                {new Date(wedding.weddingDate).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                })}
                              </Text>
                            )}
                            {wedding.divorceDate && (
                              <Text fontSize="sm" color="gray.600" mt={2}>
                                {t('personProfile.divorceOn', {
                                  date: new Date(wedding.divorceDate).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US')
                                })}
                              </Text>
                            )}
                          </Box>
                        </HStack>
                      ))}

                      {/* Décès */}
                      {person.deathDate && (
                        <HStack position="relative">
                          <Box
                            position="absolute"
                            left="-20px"
                            w="40px"
                            h="40px"
                            bg="gray.500"
                            borderRadius="full"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            color="white"
                            boxShadow="md"
                          >
                            <Icon as={FaCross} boxSize={5} />
                          </Box>
                          <Box ml={8} p={4} bg="gray.100" borderRadius="lg" flex={1}>
                            <Text fontWeight="bold" color="gray.700" fontSize="lg">
                              {t('personProfile.death')}
                            </Text>
                            <Text color="gray.600">
                              {new Date(person.deathDate).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </Text>
                            {age !== null && (
                              <Text fontSize="sm" color="gray.500" mt={1}>
                                {t('personProfile.atAge', { age })}
                              </Text>
                            )}
                          </Box>
                        </HStack>
                      )}
                    </VStack>
                  </Box>
                </CardBody>
              </Card>
            </TabPanel>

            {/* ONGLET 4: Biographie */}
            <TabPanel>
              <Card>
                <CardBody>
                  <Heading size="md" color="primary.700" mb={4}>
                    <Icon as={FaBook} mr={2} />
                    {t('personProfile.lifeStory')}
                  </Heading>

                  {person.notes ? (
                    <Box
                      p={6}
                      bg="primary.50"
                      borderRadius="lg"
                      borderLeft="4px solid"
                      borderColor="primary.500"
                    >
                      <Text
                        fontSize="lg"
                        color="primary.900"
                        lineHeight="1.8"
                        whiteSpace="pre-wrap"
                      >
                        {person.notes}
                      </Text>
                    </Box>
                  ) : (
                    <Alert status="info" borderRadius="lg">
                      <AlertIcon />
                      <Box>
                        <Text fontWeight="bold">{t('personProfile.noBiography')}</Text>
                        <Text fontSize="sm">
                          {canEditProfile
                            ? t('personProfile.addBiographyPrompt')
                            : t('personProfile.biographyNotWritten')}
                        </Text>
                      </Box>
                    </Alert>
                  )}

                  {canEditProfile && (
                    <Button
                      leftIcon={<FaEdit />}
                      variant="heritage"
                      mt={4}
                      onClick={() => navigate(`/edit-member/${person.personID}`)}
                    >
                      {person.notes ? t('personProfile.editBiography') : t('personProfile.addBiography')}
                    </Button>
                  )}
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
};

export default PersonProfile;
