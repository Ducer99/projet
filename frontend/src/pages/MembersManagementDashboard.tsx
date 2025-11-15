import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Text,
  Button,
  useToast,
  HStack,
  VStack,
  Icon,
  Badge,
  Tooltip,
  Avatar,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Grid,
  GridItem,
  StatGroup,
  Stat,
  StatLabel,
  StatNumber,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUserPlus, 
  FaUserEdit, 
  FaLock, 
  FaArrowLeft, 
  FaTrash, 
  FaSearch,
  FaSortUp,
  FaSortDown,
  FaSort,
  FaFilter,
  FaEye,
  FaChevronDown,
  FaCrown,
  FaRing,
  FaUserFriends,
  FaCheck,
  FaStar,
  FaUser
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import api from '../services/api';
import { Person } from '../types';
import { useAuth } from '../contexts/AuthContext';

const MotionBox = motion(Box);

interface PersonWithPermissions extends Person {
  canEdit?: boolean;
  isCreator?: boolean;
  familyLineage?: 'MAIN' | 'SPOUSE' | 'BRANCH';
  mainFamilyName?: string;
  createdBy?: number;
  createdAt?: string;
}

type SortField = 'fullName' | 'age' | 'status' | 'sex' | 'lineage';
type SortDirection = 'asc' | 'desc';

interface FilterOptions {
  search: string;
  sex: string;
  status: string;
  lineage: string;
  ageMin: string;
  ageMax: string;
}

const MembersManagementDashboard = () => {
  const [persons, setPersons] = useState<PersonWithPermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('fullName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    sex: 'all',
    status: 'all',
    lineage: 'all',
    ageMin: '',
    ageMax: ''
  });
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();
  const { user } = useAuth();

  // État pour la suppression
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [personToDelete, setPersonToDelete] = useState<PersonWithPermissions | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetchPersons();
  }, []);

  // Fonction de gestion des permissions selon le modèle "Créateur OU Sujet"
  const canEditPerson = (person: Person): boolean => {
    if (!user) return false;
    
    // Règle 1: Créateur du Fichier - L'utilisateur qui a créé la fiche
    if ((person as any).createdBy === user.idPerson) {
      return true;
    }
    
    // Règle 2: Membre lui-même - La personne décrite dans la fiche peut modifier ses propres infos
    if (person.personID === user.idPerson) {
      return true;
    }
    
    // Règle 3 (Optionnel): Admin - Les administrateurs ont accès total
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      return true;
    }
    
    // Aucune autre permission
    return false;
  };

  const canDeletePerson = (person: PersonWithPermissions): boolean => {
    if (!user) return false;
    
    // Seuls les super administrateurs peuvent supprimer
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }
    
    // Les administrateurs peuvent supprimer leurs propres créations
    if (user.role === 'ADMIN' && person.createdBy === user.idPerson) {
      return true;
    }
    
    // Les utilisateurs normaux peuvent supprimer seulement leurs créations récentes (moins de 24h)
    if (person.createdBy === user.idPerson && person.createdAt) {
      const creationTime = new Date(person.createdAt).getTime();
      const now = Date.now();
      const hoursSinceCreation = (now - creationTime) / (1000 * 60 * 60);
      
      return hoursSinceCreation < 24; // Suppression autorisée pendant 24h
    }
    
    return false;
  };

  const fetchPersons = async () => {
    try {
      setLoading(true);
      const response = await api.get<Person[]>('/persons');
      
      // Enrichir avec les informations de lignée et les permissions réelles
      const enrichedPersons = response.data.map(person => ({
        ...person,
        familyLineage: determineFamilyLineage(person, response.data),
        mainFamilyName: getMainFamilyName(person),
        canEdit: canEditPerson(person), // Permissions basées sur les rôles réels
        isCreator: (person as any).createdBy === user?.idPerson // Vérifie si l'utilisateur a créé cette personne
      }));
      
      setPersons(enrichedPersons);
    } catch (error: any) {
      console.error('Error fetching persons:', error);
      
      // Mode fallback avec données mock pour démonstration des règles de permissions
      const currentUserId = user?.idPerson || 1; // ID de l'utilisateur connecté
      
      const mockPersons: PersonWithPermissions[] = [
        // Cas 1: Fiche créée PAR l'utilisateur connecté (Règle Créateur)
        {
          personID: 1,
          firstName: 'Jean',
          lastName: 'DUPONT',
          sex: 'M',
          birthday: '1970-01-15',
          alive: true,
          email: 'jean.dupont@email.com',
          activity: 'Ingénieur',
          photoUrl: '',
          cityID: 1,
          familyID: 1,
          familyLineage: 'MAIN',
          mainFamilyName: 'DUPONT',
          canEdit: true, // Créé par l'utilisateur connecté
          isCreator: true,
          createdBy: currentUserId
        },
        // Cas 2: Fiche DE l'utilisateur connecté lui-même (Règle Membre lui-même)
        {
          personID: currentUserId,
          firstName: 'Vous',
          lastName: 'UTILISATEUR',
          sex: 'M',
          birthday: '1990-06-15',
          alive: true,
          email: 'vous@email.com', // Email par défaut pour la démo
          activity: 'Développeur',
          photoUrl: '',
          cityID: 1,
          familyID: 1,
          familyLineage: 'MAIN',
          mainFamilyName: 'UTILISATEUR',
          canEdit: true, // Sa propre fiche
          isCreator: false,
          createdBy: 999 // Créé par quelqu'un d'autre, mais c'est lui-même
        },
        // Cas 3: Fiche créée par quelqu'un d'autre, pas l'utilisateur connecté (PAS d'accès)
        {
          personID: 3,
          firstName: 'Marie',
          lastName: 'MARTIN',
          sex: 'F',
          birthday: '1975-06-20',
          alive: true,
          email: 'marie.martin@email.com',
          activity: 'Médecin',
          photoUrl: '',
          cityID: 1,
          familyID: 1,
          familyLineage: 'SPOUSE',
          mainFamilyName: 'MARTIN',
          canEdit: false, // Créé par quelqu'un d'autre, pas l'utilisateur
          isCreator: false,
          createdBy: 999
        },
        // Cas 4: Admin peut tout éditer (même si créé par quelqu'un d'autre - Règle Admin)
        {
          personID: 4,
          firstName: 'Sophie',
          lastName: 'ADMIN_TEST',
          sex: 'F',
          birthday: '1945-12-05',
          deathDate: '2020-08-15',
          alive: false,
          email: '',
          activity: 'Retraitée',
          photoUrl: '',
          cityID: 1,
          familyID: 1,
          familyLineage: 'SPOUSE',
          mainFamilyName: 'ADMIN_TEST',
          canEdit: (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'), // Admins peuvent tout éditer
          isCreator: false,
          createdBy: 999
        }
      ];
      
      setPersons(mockPersons);
      
      toast({
        title: t('common.error'),
        description: 'Mode démo avec données d\'exemple',
        status: 'warning',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // ============ LIGNÉE/RELATION LOGIC ============
  
  const determineFamilyLineage = (person: PersonWithPermissions, allPersons: PersonWithPermissions[]): 'MAIN' | 'SPOUSE' | 'BRANCH' => {
    // Logique simplifiée - dans un vrai système, on analyserait les relations
    // Pour l'instant, on considère que les personnes avec le même nom de famille sont lignée principale
    if (!allPersons || allPersons.length === 0) return 'MAIN';
    
    const familyNames = allPersons.map(p => p.lastName).filter(Boolean);
    if (familyNames.length === 0) return 'MAIN';
    
    const familyNameCounts = familyNames.reduce((acc, name) => {
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommonName = Object.keys(familyNameCounts).reduce((a, b) => 
      familyNameCounts[a] > familyNameCounts[b] ? a : b
    );
    
    if (person.lastName === mostCommonName) return 'MAIN';
    // Pour simplifier, on considère les autres comme conjoints
    return 'SPOUSE';
  };

  const getMainFamilyName = (person: PersonWithPermissions): string => {
    // Retourne le nom de famille principal auquel la personne appartient
    return person.lastName;
  };

  // ============ CALCULATION HELPERS ============
  
  const calculateAge = (birthday: string | undefined, deathDate?: string | null): number | null => {
    if (!birthday) return null;
    
    try {
      const birthDate = new Date(birthday);
      const endDate = deathDate ? new Date(deathDate) : new Date();
      
      const age = endDate.getFullYear() - birthDate.getFullYear();
      const monthDiff = endDate.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birthDate.getDate())) {
        return age - 1;
      }
      
      return age;
    } catch (error) {
      console.warn('Error calculating age:', error);
      return null;
    }
  };

  // ============ FILTERING & SORTING ============
  
  const filteredAndSortedPersons = useMemo(() => {
    let filtered = [...persons];

    // Filtrage par recherche textuelle
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(person => 
        `${person.firstName} ${person.lastName}`.toLowerCase().includes(search) ||
        person.email?.toLowerCase().includes(search) ||
        person.activity?.toLowerCase().includes(search)
      );
    }

    // Filtrage par sexe
    if (filters.sex !== 'all') {
      filtered = filtered.filter(person => person.sex === filters.sex);
    }

    // Filtrage par statut
    if (filters.status !== 'all') {
      filtered = filtered.filter(person => 
        filters.status === 'alive' ? person.alive : !person.alive
      );
    }

    // Filtrage par lignée
    if (filters.lineage !== 'all') {
      filtered = filtered.filter(person => person.familyLineage === filters.lineage);
    }

    // Filtrage par âge
    if (filters.ageMin) {
      const minAge = parseInt(filters.ageMin);
      filtered = filtered.filter(person => {
        const age = calculateAge(person.birthday, person.deathDate);
        return age !== null && age >= minAge;
      });
    }

    if (filters.ageMax) {
      const maxAge = parseInt(filters.ageMax);
      filtered = filtered.filter(person => {
        const age = calculateAge(person.birthday, person.deathDate);
        return age !== null && age <= maxAge;
      });
    }

    // Tri
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'fullName':
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'age':
          aValue = calculateAge(a.birthday, a.deathDate) || 0;
          bValue = calculateAge(b.birthday, b.deathDate) || 0;
          break;
        case 'status':
          aValue = a.alive ? 'alive' : 'deceased';
          bValue = b.alive ? 'alive' : 'deceased';
          break;
        case 'sex':
          aValue = a.sex;
          bValue = b.sex;
          break;
        case 'lineage':
          aValue = a.familyLineage;
          bValue = b.familyLineage;
          break;
        default:
          aValue = a.firstName;
          bValue = b.firstName;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [persons, filters, sortField, sortDirection]);

  // ============ STATISTICS ============
  
  const statistics = useMemo(() => {
    return {
      total: persons.length,
      alive: persons.filter(p => p.alive).length,
      deceased: persons.filter(p => !p.alive).length,
      males: persons.filter(p => p.sex === 'M').length,
      females: persons.filter(p => p.sex === 'F').length,
      mainLineage: persons.filter(p => p.familyLineage === 'MAIN').length,
      spouses: persons.filter(p => p.familyLineage === 'SPOUSE').length,
      averageAge: persons.reduce((sum, p) => {
        const age = calculateAge(p.birthday, p.deathDate);
        return sum + (age || 0);
      }, 0) / persons.filter(p => calculateAge(p.birthday, p.deathDate) !== null).length
    };
  }, [persons]);

  // ============ SORT HANDLERS ============
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return FaSort;
    return sortDirection === 'asc' ? FaSortUp : FaSortDown;
  };

  // ============ HANDLERS ============

  const handleAddPerson = () => {
    navigate('/add-member');
  };

  const handleEditPerson = (personID: number) => {
    navigate(`/edit-member/${personID}`);
  };

  const handleViewProfile = (personID: number) => {
    navigate(`/person/${personID}`);
  };

  const handleDeleteClick = (person: PersonWithPermissions) => {
    setPersonToDelete(person);
    onOpen();
  };

  const handleDeleteConfirm = async () => {
    if (!personToDelete) return;

    try {
      await api.delete(`/persons/${personToDelete.personID}`);
      
      toast({
        title: t('common.success'),
        description: t('members.deleteSuccess'),
        status: 'success',
        duration: 3000,
      });
      
      fetchPersons();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || t('members.deleteError'),
        status: 'error',
        duration: 5000,
      });
    } finally {
      onClose();
      setPersonToDelete(null);
    }
  };

  const handleFilterReset = () => {
    setFilters({
      search: '',
      sex: 'all',
      status: 'all',
      lineage: 'all',
      ageMin: '',
      ageMax: ''
    });
  };

  // ============ FORMAT HELPERS ============

  const getStatusBadge = (person: PersonWithPermissions) => {
    const age = calculateAge(person.birthday, person.deathDate);
    
    if (person.alive) {
      return (
        <HStack spacing={2}>
          <Box
            w="8px"
            h="8px"
            borderRadius="full"
            bg="green.400"
            boxShadow="0 0 0 2px rgba(34, 197, 94, 0.2)"
          />
          <VStack spacing={0} align="start">
            <Text fontSize="sm" fontWeight="500" color="green.700">
              {person.sex === 'M' ? t('common.alive_m') : t('common.alive_f')}
            </Text>
            {age && (
              <Text fontSize="xs" color="gray.500">
                {age} {t('common.years')}
              </Text>
            )}
          </VStack>
        </HStack>
      );
    } else {
      return (
        <HStack spacing={2}>
          <Box
            w="8px"
            h="8px"
            borderRadius="full"
            bg="gray.400"
            boxShadow="0 0 0 2px rgba(107, 114, 128, 0.2)"
          />
          <VStack spacing={0} align="start">
            <Text fontSize="sm" fontWeight="500" color="gray.600">
              {person.sex === 'M' ? t('common.deceased_m') : t('common.deceased_f')}
            </Text>
            {age && (
              <Text fontSize="xs" color="gray.500">
                {t('familyTree.deceasedAtAge')} {age} {t('common.years')}
              </Text>
            )}
          </VStack>
        </HStack>
      );
    }
  };

  const getLineageBadge = (person: PersonWithPermissions) => {
    const lineageConfig = {
      MAIN: { 
        icon: FaCrown, 
        color: 'yellow', 
        label: t('members.mainLineage'),
        bg: 'yellow.400', // Plus foncé pour meilleur contraste
        borderColor: 'yellow.500',
        textColor: 'white' // Texte blanc pour contraste maximum
      },
      SPOUSE: { 
        icon: FaRing, 
        color: 'pink', 
        label: t('members.spouse'),
        bg: 'pink.400', // Plus foncé pour meilleur contraste
        borderColor: 'pink.500',
        textColor: 'white' // Texte blanc pour contraste maximum
      },
      BRANCH: { 
        icon: FaUserFriends, 
        color: 'blue', 
        label: t('members.branch'),
        bg: 'blue.400', // Plus foncé pour meilleur contraste
        borderColor: 'blue.500',
        textColor: 'white' // Texte blanc pour contraste maximum
      }
    };

    const config = lineageConfig[person.familyLineage || 'BRANCH'];

    return (
      <HStack 
        spacing={2} 
        px={3} 
        py={1} 
        bg={config.bg}
        border="1px solid"
        borderColor={config.borderColor}
        borderRadius="full"
      >
        <Icon as={config.icon} color="white" fontSize="sm" />
        <Text fontSize="xs" fontWeight="600" color={config.textColor}>
          {config.label}
        </Text>
        {person.mainFamilyName && (
          <Text fontSize="xs" color="whiteAlpha.900" fontWeight="500">
            {person.mainFamilyName}
          </Text>
        )}
      </HStack>
    );
  };

  // ============ RENDER ============

  if (loading) {
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" color="var(--emotional-sage)" thickness="4px" />
          <Text color="gray.600">{t('common.loading')}</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Box minH="100vh" bg="var(--bg-primary)">
      {/* Header avec palette émotionnelle */}
      <Box
        background="var(--gradient-beige)"
        borderBottom="1px solid var(--border-color)"
        py={6}
        position="sticky"
        top={0}
        zIndex={10}
        backdropFilter="blur(10px)"
      >
        <Container maxW="container.xl">
          <VStack align="stretch" spacing={4}>
            <HStack justify="space-between" align="center">
              <HStack spacing={4}>
                <Box
                  w="4px"
                  h="40px"
                  background="var(--gradient-sage)"
                  borderRadius="full"
                />
                <VStack align="start" spacing={0}>
                  <Heading
                    size="lg"
                    color="var(--text-primary)"
                    fontWeight="600"
                  >
                    {t('members.managementDashboard')}
                  </Heading>
                  <HStack spacing={2} color="var(--text-secondary)">
                    <Text fontSize="sm">
                      {filteredAndSortedPersons.length} {t('members.filteredResults')} / {persons.length} {t('members.totalMembers')}
                    </Text>
                  </HStack>
                </VStack>
              </HStack>

              <HStack spacing={3}>
                <Button
                  background="var(--gradient-sage)"
                  color="white"
                  leftIcon={<FaUserPlus />}
                  onClick={handleAddPerson}
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 16px rgba(163, 177, 138, 0.3)',
                  }}
                  transition="all 0.3s ease"
                  size="md"
                  fontWeight="500"
                >
                  {t('members.addMember')}
                </Button>

                <Button
                  bg="white"
                  border="1px solid var(--border-color)"
                  leftIcon={<FaLock />}
                  onClick={() => navigate(`/person/${user?.idPerson}`)}
                  _hover={{
                    bg: 'var(--emotional-beige-light)',
                    transform: 'translateY(-2px)',
                  }}
                  transition="all 0.3s ease"
                  size="md"
                >
                  {t('members.myProfile')}
                </Button>

                <Button
                  bg="white"
                  border="1px solid var(--border-color)"
                  leftIcon={<FaArrowLeft />}
                  onClick={() => navigate('/')}
                  _hover={{
                    bg: 'gray.50',
                  }}
                  size="md"
                >
                  {t('common.back')}
                </Button>
              </HStack>
            </HStack>

            {/* Statistiques rapides */}
            <StatGroup bg="white" borderRadius="12px" p={4} boxShadow="0 2px 8px rgba(0,0,0,0.04)">
              <Stat>
                <StatLabel>{t('members.totalMembers')}</StatLabel>
                <StatNumber>{statistics.total}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>{t('members.alive')}</StatLabel>
                <StatNumber color="green.500">{statistics.alive}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>{t('members.deceased')}</StatLabel>
                <StatNumber color="gray.500">{statistics.deceased}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>{t('members.mainLineage')}</StatLabel>
                <StatNumber color="yellow.500">{statistics.mainLineage}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>{t('members.averageAge')}</StatLabel>
                <StatNumber>{Math.round(statistics.averageAge) || 0} {t('common.years')}</StatNumber>
              </Stat>
            </StatGroup>
          </VStack>
        </Container>
      </Box>

      {/* Filtres et recherche */}
      <Container maxW="container.xl" py={4}>
        <MotionBox
          bg="white"
          borderRadius="16px"
          boxShadow="0 2px 8px rgba(0,0,0,0.04)"
          p={6}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <HStack spacing={2}>
                <Icon as={FaFilter} color="var(--emotional-sage)" />
                <Text fontWeight="600" color="var(--text-primary)">{t('members.filtersAndSearch')}</Text>
              </HStack>
              <Button size="sm" variant="outline" onClick={handleFilterReset}>
                {t('members.resetFilters')}
              </Button>
            </HStack>

            <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' }} gap={4}>
              {/* Recherche textuelle */}
              <GridItem colSpan={{ base: 1, md: 2, lg: 2 }}>
                <InputGroup>
                  <InputLeftElement>
                    <Icon as={FaSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder={t('members.searchPlaceholder')}
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    bg="white"
                    border="1px solid var(--border-color)"
                  />
                </InputGroup>
              </GridItem>

              {/* Filtre sexe */}
              <GridItem>
                <Select
                  value={filters.sex}
                  onChange={(e) => setFilters(prev => ({ ...prev, sex: e.target.value }))}
                  bg="white"
                  border="1px solid var(--border-color)"
                >
                  <option value="all">{t('members.allGenders')}</option>
                  <option value="M">{t('common.male')}</option>
                  <option value="F">{t('common.female')}</option>
                </Select>
              </GridItem>

              {/* Filtre statut */}
              <GridItem>
                <Select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  bg="white"
                  border="1px solid var(--border-color)"
                >
                  <option value="all">{t('members.allStatuses')}</option>
                  <option value="alive">{t('common.alive')}</option>
                  <option value="deceased">{t('common.deceased')}</option>
                </Select>
              </GridItem>

              {/* Filtre lignée */}
              <GridItem>
                <Select
                  value={filters.lineage}
                  onChange={(e) => setFilters(prev => ({ ...prev, lineage: e.target.value }))}
                  bg="white"
                  border="1px solid var(--border-color)"
                >
                  <option value="all">{t('members.allLineages')}</option>
                  <option value="MAIN">{t('members.mainLineage')}</option>
                  <option value="SPOUSE">{t('members.spouse')}</option>
                  <option value="BRANCH">{t('members.branch')}</option>
                </Select>
              </GridItem>

              {/* Filtre âge minimum */}
              <GridItem>
                <Input
                  placeholder={t('members.minAge')}
                  type="number"
                  min="0"
                  max="150"
                  value={filters.ageMin}
                  onChange={(e) => setFilters(prev => ({ ...prev, ageMin: e.target.value }))}
                  bg="white"
                  border="1px solid var(--border-color)"
                />
              </GridItem>
            </Grid>
          </VStack>
        </MotionBox>
      </Container>

      {/* Table des membres améliorée */}
      <Container maxW="container.xl" pb={8}>
        <MotionBox
          bg="white"
          borderRadius="16px"
          boxShadow="0 2px 8px rgba(0,0,0,0.04)"
          overflow="hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead bg="var(--emotional-beige-light)">
                <Tr>
                  <Th>{t('members.photo')}</Th>
                  
                  {/* En-tête cliquable Nom complet */}
                  <Th 
                    cursor="pointer" 
                    _hover={{ bg: 'var(--emotional-beige)' }}
                    onClick={() => handleSort('fullName')}
                  >
                    <HStack spacing={2}>
                      <Text>{t('members.fullName')}</Text>
                      <Icon as={getSortIcon('fullName')} />
                    </HStack>
                  </Th>
                  
                  {/* En-tête cliquable Âge */}
                  <Th 
                    cursor="pointer" 
                    _hover={{ bg: 'var(--emotional-beige)' }}
                    onClick={() => handleSort('age')}
                  >
                    <HStack spacing={2}>
                      <Text>{t('members.age')}</Text>
                      <Icon as={getSortIcon('age')} />
                    </HStack>
                  </Th>
                  
                  {/* En-tête cliquable Statut */}
                  <Th 
                    cursor="pointer" 
                    _hover={{ bg: 'var(--emotional-beige)' }}
                    onClick={() => handleSort('status')}
                  >
                    <HStack spacing={2}>
                      <Text>{t('members.status')}</Text>
                      <Icon as={getSortIcon('status')} />
                    </HStack>
                  </Th>
                  
                  {/* En-tête cliquable Sexe */}
                  <Th 
                    cursor="pointer" 
                    _hover={{ bg: 'var(--emotional-beige)' }}
                    onClick={() => handleSort('sex')}
                  >
                    <HStack spacing={2}>
                      <Text>{t('members.sex')}</Text>
                      <Icon as={getSortIcon('sex')} />
                    </HStack>
                  </Th>

                  {/* En-tête cliquable Lignée */}
                  <Th 
                    cursor="pointer" 
                    _hover={{ bg: 'var(--emotional-beige)' }}
                    onClick={() => handleSort('lineage')}
                  >
                    <HStack spacing={2}>
                      <Text>{t('members.lineage')}</Text>
                      <Icon as={getSortIcon('lineage')} />
                    </HStack>
                  </Th>

                  <Th textAlign="right">{t('members.quickActions')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredAndSortedPersons.map((person) => (
                  <Tr
                    key={person.personID}
                    _hover={{ bg: 'var(--emotional-ivory)' }}
                    transition="background 0.2s ease"
                  >
                    {/* Photo */}
                    <Td>
                      <Avatar
                        size="md"
                        name={`${person.firstName} ${person.lastName}`}
                        src={person.photoUrl}
                        border="2px solid"
                        borderColor={
                          person.sex === 'F'
                            ? 'var(--emotional-lavender)'
                            : 'var(--emotional-sage)'
                        }
                      />
                    </Td>

                    {/* Nom complet */}
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="600" color="gray.900"> {/* Noir très foncé pour contraste maximum */}
                          {person.firstName} {person.lastName}
                        </Text>
                        {person.activity && (
                          <Text fontSize="xs" color="gray.600"> {/* Gris foncé au lieu de gris clair */}
                            {person.activity}
                          </Text>
                        )}
                      </VStack>
                    </Td>

                    {/* Âge calculé */}
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="500" color="gray.900"> {/* Noir très foncé pour contraste maximum */}
                          {calculateAge(person.birthday, person.deathDate) || t('members.unknownAge')}
                          {calculateAge(person.birthday, person.deathDate) && ` ${t('common.years')}`}
                        </Text>
                        {person.birthday && (
                          <Text fontSize="xs" color="gray.600"> {/* Gris foncé au lieu de gris clair */}
                            {new Date(person.birthday).toLocaleDateString('fr-FR')}
                          </Text>
                        )}
                      </VStack>
                    </Td>

                    {/* Statut avec âge */}
                    <Td>{getStatusBadge(person)}</Td>

                    {/* Sexe */}
                    <Td>
                      <Badge
                        colorScheme={person.sex === 'M' ? 'blue' : 'pink'}
                        variant="subtle"
                      >
                        {person.sex === 'M' ? t('common.male') : t('common.female')}
                      </Badge>
                    </Td>

                    {/* Lignée/Relation */}
                    <Td>{getLineageBadge(person)}</Td>

                    {/* Actions rapides */}
                    <Td>
                      <HStack spacing={1} justify="flex-end">
                        {/* Bouton Voir */}
                        <Tooltip label={t('members.viewProfile')}>
                          <IconButton
                            aria-label="View profile"
                            size="sm"
                            bg="var(--emotional-beige-light)"
                            color="var(--emotional-brown)"
                            icon={<FaEye />}
                            onClick={() => handleViewProfile(person.personID)}
                            _hover={{
                              bg: 'var(--emotional-beige)',
                            }}
                          />
                        </Tooltip>

                        {/* Bouton Modifier ou Indicateur de permissions */}
                        {person.canEdit ? (
                          <Tooltip label={t('members.editTooltip')}>
                            <IconButton
                              aria-label="Edit person"
                              size="sm"
                              bg="blue.50"
                              color="blue.600"
                              icon={<FaUserEdit />}
                              onClick={() => handleEditPerson(person.personID)}
                              _hover={{
                                bg: 'blue.100',
                              }}
                            />
                          </Tooltip>
                        ) : (
                          <Tooltip label={t('members.noPermission')}>
                            <IconButton
                              aria-label="No permission"
                              size="sm"
                              bg="gray.50"
                              color="gray.400"
                              icon={<FaLock />}
                              isDisabled
                              cursor="not-allowed"
                            />
                          </Tooltip>
                        )}

                        {/* Badges de statut utilisateur et règles de permissions */}
                        {person.isCreator && (
                          <Tooltip label="Règle Créateur : Vous avez créé cette fiche">
                            <Badge colorScheme="green" fontSize="xs" display="flex" alignItems="center">
                              <Icon as={FaCheck} mr={1} />
                              {t('common.creator')}
                            </Badge>
                          </Tooltip>
                        )}

                        {person.personID === user?.idPerson && !person.isCreator && (
                          <Tooltip label="Règle Membre : Votre propre fiche">
                            <Badge colorScheme="purple" fontSize="xs" display="flex" alignItems="center">
                              <Icon as={FaUser} mr={1} />
                              Vous-même
                            </Badge>
                          </Tooltip>
                        )}

                        {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && !person.isCreator && person.personID !== user?.idPerson && person.canEdit && (
                          <Tooltip label="Règle Admin : Accès administrateur">
                            <Badge colorScheme="orange" fontSize="xs" display="flex" alignItems="center">
                              <Icon as={FaStar} mr={1} />
                              {t('common.admin')}
                            </Badge>
                          </Tooltip>
                        )}

                        {/* Menu d'actions supplémentaires */}
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            aria-label="More actions"
                            size="sm"
                            bg="gray.50"
                            color="gray.600"
                            icon={<FaChevronDown />}
                            _hover={{
                              bg: 'gray.100',
                            }}
                          />
                          <MenuList>
                            <MenuItem icon={<FaEye />} onClick={() => handleViewProfile(person.personID)}>
                              {t('members.viewProfile')}
                            </MenuItem>
                            {person.canEdit && (
                              <MenuItem icon={<FaUserEdit />} onClick={() => handleEditPerson(person.personID)}>
                                {t('members.editPerson')}
                              </MenuItem>
                            )}
                            {canDeletePerson(person) && (
                              <>
                                <Divider />
                                <MenuItem 
                                  icon={<FaTrash />} 
                                  color="red.600"
                                  onClick={() => handleDeleteClick(person)}
                                >
                                  {t('common.delete')}
                                </MenuItem>
                              </>
                            )}
                          </MenuList>
                        </Menu>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            
            {filteredAndSortedPersons.length === 0 && (
              <VStack py={8} spacing={4}>
                <Text color="gray.500" fontSize="lg">{t('members.noResults')}</Text>
                <Text color="gray.400" fontSize="sm">{t('members.tryDifferentFilters')}</Text>
                <Button variant="outline" onClick={handleFilterReset}>
                  {t('members.resetFilters')}
                </Button>
              </VStack>
            )}
          </Box>
        </MotionBox>
      </Container>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {t('members.deleteConfirmTitle')}
            </AlertDialogHeader>

            <AlertDialogBody>
              <VStack align="stretch" spacing={4}>
                <Text>
                  {t('members.deleteConfirmMessage')}{' '}
                  <strong>
                    {personToDelete?.firstName} {personToDelete?.lastName}
                  </strong>
                  ?
                </Text>

                {personToDelete && (
                  <Box
                    bg="var(--emotional-beige-light)"
                    p={3}
                    borderRadius="md"
                    border="1px solid var(--border-color)"
                  >
                    <HStack spacing={3}>
                      <Avatar
                        size="sm"
                        name={`${personToDelete.firstName} ${personToDelete.lastName}`}
                        src={personToDelete.photoUrl}
                      />
                      <VStack align="start" spacing={0} flex={1}>
                        <Text fontWeight="600" fontSize="sm">
                          {personToDelete.firstName} {personToDelete.lastName}
                        </Text>
                        <Text fontSize="xs" color="var(--text-secondary)">
                          {calculateAge(personToDelete.birthday, personToDelete.deathDate)} {t('common.years')}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                )}
              </VStack>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                {t('common.cancel')}
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                {t('common.delete')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default MembersManagementDashboard;
