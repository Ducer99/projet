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
  useBreakpointValue,
  SimpleGrid,
} from '@chakra-ui/react';
import MemberCard from '../components/MemberCard';
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
  FaUser,
  FaProjectDiagram,
  FaFileExcel
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
  const fetchedRef = useRef(false);

  // Responsive: basculer entre cartes (mobile) et tableau (desktop)
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchPersons();
  }, []);

  // Fonction de gestion des permissions selon le modèle "Créateur OU Sujet"
  const canEditPerson = (person: Person): boolean => {
    if (!user) return false;
    
    // ✅ Règle 1 (PRIORITAIRE): Admin - Les administrateurs ont accès total à TOUT
    // Correction Bug: L'admin doit être vérifié EN PREMIER
    if (user.role === 'Admin' || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      return true;
    }
    
    // Règle 2: Créateur du Fichier - L'utilisateur qui a créé la fiche
    if ((person as any).createdBy === user.idPerson) {
      return true;
    }
    
    // Règle 3: Membre lui-même - La personne décrite dans la fiche peut modifier ses propres infos
    if (person.personID === user.idPerson) {
      return true;
    }
    
    // Aucune autre permission
    return false;
  };

  const canDeletePerson = (person: PersonWithPermissions): boolean => {
    if (!user) return false;

    // Les administrateurs peuvent tout supprimer
    if (user.role === 'Admin' || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
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
      // Utiliser Promise.all car determineFamilyLineage et getMainFamilyName sont async
      const enrichedPersons = await Promise.all(
        response.data.map(async (person) => {
          const lineage = await determineFamilyLineage(person, response.data);
          const mainFamilyName = await getMainFamilyName(person, response.data, lineage);
          
          return {
            ...person,
            familyLineage: lineage,
            mainFamilyName: mainFamilyName,
            canEdit: canEditPerson(person), // Permissions basées sur les rôles réels
            isCreator: (person as any).createdBy === user?.idPerson // Vérifie si l'utilisateur a créé cette personne
          };
        })
      );
      
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
  
  const determineFamilyLineage = async (person: PersonWithPermissions, allPersons: PersonWithPermissions[]): Promise<'MAIN' | 'SPOUSE' | 'BRANCH'> => {
    // 🏷️ RÈGLE MÉTIER STRICTE : Distinction Sang (LIGNÉE) vs Alliance (CONJOINT)
    
    console.log(`🔍 Classification de ${person.firstName} ${person.lastName} (ID: ${person.personID})`);
    
    // Cas A : LIGNÉE PRINCIPALE - Membre lié par le sang
    // Condition 1 : A des parents enregistrés dans l'arbre
    if (person.fatherID || person.motherID) {
      console.log(`   ✅ MAIN - A des parents (Father: ${person.fatherID}, Mother: ${person.motherID})`);
      return 'MAIN';
    }
    
    // Cas B : Personne sans parents mais avec enfants
    // → Il faut distinguer RACINE (sang) vs CONJOINT (alliance)
    const children = allPersons.filter(p => 
      p.fatherID === person.personID || p.motherID === person.personID
    );
    
    if (children.length > 0) {
      // Vérifier si cette personne est la RACINE DE SANG ou un CONJOINT
      // Logique : Si les enfants ont un autre parent qui a LUI-MÊME des parents dans l'arbre,
      // alors cette personne est un CONJOINT (entrée par mariage)
      
      const firstChild = children[0];
      let otherParentID: number | null = null;
      
      if (person.sex === 'M' && firstChild.motherID) {
        otherParentID = firstChild.motherID;
      } else if (person.sex === 'F' && firstChild.fatherID) {
        otherParentID = firstChild.fatherID;
      }
      
      if (otherParentID) {
        const otherParent = allPersons.find(p => p.personID === otherParentID);
        console.log(`   → Autre parent: ${otherParent?.firstName} ${otherParent?.lastName} (Parents: Father=${otherParent?.fatherID}, Mother=${otherParent?.motherID})`);
        
        if (otherParent && (otherParent.fatherID || otherParent.motherID)) {
          // L'autre parent a des parents dans l'arbre = il/elle est de la lignée principale
          // Donc cette personne est un CONJOINT
          console.log(`   ✅ SPOUSE - L'autre parent (${otherParent.firstName}) a des parents = cette personne est entrée par mariage`);
          return 'SPOUSE';
        }
        
        // CAS SPÉCIAL : COUPLE RACINE (ni la personne ni le partenaire n'ont de parents)
        if (otherParent && !otherParent.fatherID && !otherParent.motherID) {
          // RÈGLE MÉTIER : Le Patriarche (Homme) est la Lignée Principale, la Femme est Conjointe
          if (person.sex === 'M') {
            console.log(`   ✅ MAIN - Patriarche (Homme racine dans un couple fondateur)`);
            return 'MAIN'; // Homme = Richard (Jaune)
          } else {
            console.log(`   ✅ SPOUSE - Conjointe du Patriarche (Femme dans un couple fondateur)`);
            return 'SPOUSE'; // Femme = Rebecca (Rose)
          }
        }
      }
      
      // Si on arrive ici, cette personne est une racine solitaire (pas de partenaire identifié)
      console.log(`   ✅ MAIN - Racine de l'arbre (pas de partenaire détecté)`);
      return 'MAIN';
    }
    
    // Cas C : Personne sans parents ni enfants
    // → Vérifier d'abord si un mariage existe
    console.log(`   → Personne sans parents ni enfants, vérification des mariages...`);
    
    try {
      const response = await api.get(`/marriages/person/${person.personID}/active`);
      
      if (response.data && response.data.length > 0) {
        // Un mariage actif existe → Cette personne est un CONJOINT
        const activeMarriage = response.data[0];
        console.log(`   ✅ SPOUSE - Mariage actif trouvé avec ${activeMarriage.partnerName}`);
        return 'SPOUSE';
      }
    } catch (error) {
      console.log(`   ⚠️ Erreur lors de la vérification des mariages:`, error);
    }
    
    // Pas de mariage trouvé → Par défaut MAIN (profil isolé en attente de complétion)
    console.log(`   ⚠️ MAIN (par défaut) - Ni parents ni enfants ni mariage (profil isolé ou en attente de complétion)`);
    return 'MAIN';
  };

  const getSpouseName = async (person: PersonWithPermissions, allPersons: PersonWithPermissions[]): Promise<string | null> => {
    // Pour un CONJOINT, chercher le NOM DE FAMILLE du partenaire
    // Priorité 1 : Via les Unions/Mariages déclarés (API)
    // Priorité 2 : Via les enfants communs (fallback)
    
    console.log(`🔍 getSpouseName pour ${person.firstName} ${person.lastName} (ID: ${person.personID})`);
    
    // MÉTHODE 1 : Chercher via l'API des mariages actifs
    try {
      console.log(`   → Recherche dans les unions actives (API)...`);
      const response = await api.get(`/marriages/person/${person.personID}/active`);
      
      if (response.data && response.data.length > 0) {
        // Prendre la première union active
        const activeMarriage = response.data[0];
        const partnerFullName = activeMarriage.partnerName; // "Prénom NomDeFamille"
        
        // Extraire le nom de famille : tout sauf le premier mot (prénom)
        const nameParts = partnerFullName.trim().split(' ');
        const partnerLastName = nameParts.slice(1).join(' '); // Prend tout après le prénom
        
        console.log(`   ✅ Partenaire trouvé via API: ${partnerFullName} → Retourne: ${partnerLastName}`);
        return partnerLastName;
      }
      
      console.log(`   → Pas d'union active trouvée dans l'API, tentative via enfants...`);
    } catch (error) {
      console.log(`   ⚠️ Erreur API mariages:`, error);
      console.log(`   → Tentative via enfants...`);
    }
    
    // MÉTHODE 2 (FALLBACK) : Chercher via les enfants communs
    const childrenOfPerson = allPersons.filter(p => 
      p.fatherID === person.personID || p.motherID === person.personID
    );
    
    console.log(`   → Enfants trouvés: ${childrenOfPerson.length}`, childrenOfPerson.map(c => `${c.firstName} ${c.lastName}`));
    
    if (childrenOfPerson.length === 0) {
      console.log(`   ❌ Pas d'enfants non plus, impossible de déterminer le conjoint`);
      return null;
    }
    
    // Prendre le premier enfant et regarder qui est l'autre parent
    const firstChild = childrenOfPerson[0];
    console.log(`   → Premier enfant: ${firstChild.firstName} ${firstChild.lastName} (Father: ${firstChild.fatherID}, Mother: ${firstChild.motherID})`);
    
    if (person.sex === 'M') {
      // Si la personne est un homme, chercher la mère des enfants (son épouse)
      if (firstChild.motherID) {
        const spouse = allPersons.find(p => p.personID === firstChild.motherID);
        if (spouse) {
          console.log(`   ✅ Épouse trouvée via enfants: ${spouse.firstName} ${spouse.lastName} → Retourne: ${spouse.lastName}`);
          return spouse.lastName;
        }
      }
    } else if (person.sex === 'F') {
      // Si la personne est une femme, chercher le père des enfants (son époux)
      if (firstChild.fatherID) {
        const spouse = allPersons.find(p => p.personID === firstChild.fatherID);
        if (spouse) {
          console.log(`   ✅ Époux trouvé via enfants: ${spouse.firstName} ${spouse.lastName} → Retourne: ${spouse.lastName}`);
          return spouse.lastName;
        }
      }
    }
    
    console.log(`   ❌ Conjoint non trouvé (données incohérentes)`);
    return null;
  };

  const getMainFamilyName = async (
    person: PersonWithPermissions, 
    allPersons: PersonWithPermissions[], 
    lineage: 'MAIN' | 'SPOUSE' | 'BRANCH'
  ): Promise<string> => {
    // Pour un CONJOINT : Afficher "Conjoint de [Nom du Partenaire]"
    if (lineage === 'SPOUSE') {
      const spouseName = await getSpouseName(person, allPersons);
      if (spouseName) {
        console.log(`📛 mainFamilyName pour ${person.firstName}: "${spouseName}" (partenaire)`);
        return spouseName; // Retourne juste le nom, le label "Conjoint de" sera ajouté dans le badge
      }
      console.log(`⚠️ mainFamilyName pour ${person.firstName}: "${person.lastName}" (FALLBACK - conjoint non trouvé)`);
      return person.lastName; // Fallback si conjoint introuvable
    }
    
    // Pour LIGNÉE PRINCIPALE : Retourner le nom de famille
    console.log(`📛 mainFamilyName pour ${person.firstName}: "${person.lastName}" (lignée principale)`);
    return person.lastName;
  };

  // ============ CALCULATION HELPERS ============
  
  const calculateAge = (birthday: string | undefined, deathDate?: string | null, isAlive?: boolean): number | null => {
    if (!birthday) return null;
    
    // 🏥 RÈGLE MÉTIER : Pour les personnes décédées sans date de décès connue,
    // ne pas calculer l'âge actuel (évite "150 ans" pour quelqu'un mort il y a longtemps)
    if (isAlive === false && !deathDate) {
      return null; // Retourne null pour afficher "Âge inconnu"
    }
    
    try {
      const birthDate = new Date(birthday);
      
      // Si décédé : calculer l'âge au moment du décès
      // Si vivant : calculer l'âge actuel
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
        const age = calculateAge(person.birthday, person.deathDate, person.alive);
        return age !== null && age >= minAge;
      });
    }

    if (filters.ageMax) {
      const maxAge = parseInt(filters.ageMax);
      filtered = filtered.filter(person => {
        const age = calculateAge(person.birthday, person.deathDate, person.alive);
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
          aValue = calculateAge(a.birthday, a.deathDate, a.alive) || 0;
          bValue = calculateAge(b.birthday, b.deathDate, b.alive) || 0;
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
        const age = calculateAge(p.birthday, p.deathDate, p.alive);
        return sum + (age || 0);
      }, 0) / persons.filter(p => calculateAge(p.birthday, p.deathDate, p.alive) !== null).length
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

  const handleViewInTree = (personID: number) => {
    // Navigation vers l'arbre avec focus sur la personne sélectionnée
    navigate(`/family-tree?focusId=${personID}`);
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
    const age = calculateAge(person.birthday, person.deathDate, person.alive);
    
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
        {person.mainFamilyName && person.familyLineage === 'SPOUSE' && (
          <Text fontSize="xs" color="whiteAlpha.900" fontWeight="500">
            {/* Pour les conjoints, mainFamilyName contient le nom du partenaire */}
            de {person.mainFamilyName}
          </Text>
        )}
        {person.mainFamilyName && person.familyLineage !== 'SPOUSE' && (
          <Text fontSize="xs" color="whiteAlpha.900" fontWeight="500">
            {/* Pour la lignée principale, afficher le nom de famille */}
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
          <Spinner size="xl" color="#8B5CF6" thickness="4px" />
          <Text color="gray.600">{t('common.loading')}</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Box minH="100vh" bg="transparent">
      {/* Header gradient */}
      <Box
        bgGradient="linear(to-r, purple.900, purple.700)"
        py={6}
        position="sticky"
        top={0}
        zIndex={10}
        shadow="header"
      >
        <Container maxW="container.xl">
          <VStack align="stretch" spacing={4}>
            <HStack justify="space-between" align="center" flexWrap="wrap" gap={3}>
              <HStack spacing={4}>
                <Box w="48px" h="48px" borderRadius="xl" bg="whiteAlpha.200" display="flex" alignItems="center" justifyContent="center" border="1px solid" borderColor="whiteAlpha.300">
                  <Icon as={FaUserFriends} color="white" boxSize={5} />
                </Box>
                <VStack align="start" spacing={0}>
                  <Heading size="lg" color="white" fontWeight="700">
                    {t('members.managementDashboard')}
                  </Heading>
                  <Text fontSize="sm" color="whiteAlpha.700">
                    {filteredAndSortedPersons.length} {t('members.filteredResults')} / {persons.length} {t('members.totalMembers')}
                  </Text>
                </VStack>
              </HStack>

              <HStack spacing={2} flexWrap="wrap">
                <Button
                  bg="whiteAlpha.200"
                  color="white"
                  border="1px solid"
                  borderColor="whiteAlpha.300"
                  leftIcon={<FaUserPlus />}
                  onClick={handleAddPerson}
                  _hover={{ bg: 'whiteAlpha.300', transform: 'translateY(-1px)' }}
                  size="md"
                  fontWeight="600"
                >
                  {t('members.addMember')}
                </Button>

                <Button
                  bg="whiteAlpha.200"
                  color="white"
                  border="1px solid"
                  borderColor="whiteAlpha.300"
                  leftIcon={<FaFileExcel />}
                  onClick={() => navigate('/import-members')}
                  _hover={{ bg: 'whiteAlpha.300', transform: 'translateY(-1px)' }}
                  size="md"
                  fontWeight="600"
                >
                  Import Excel
                </Button>

                <Button
                  variant="ghost"
                  color="whiteAlpha.900"
                  leftIcon={<FaLock />}
                  onClick={() => navigate(`/person/${user?.idPerson}`)}
                  _hover={{ bg: 'whiteAlpha.200' }}
                  size="md"
                >
                  {t('members.myProfile')}
                </Button>

                <Button
                  variant="ghost"
                  color="whiteAlpha.700"
                  leftIcon={<FaArrowLeft />}
                  onClick={() => navigate('/')}
                  _hover={{ bg: 'whiteAlpha.200' }}
                  size="md"
                >
                  {t('common.back')}
                </Button>
              </HStack>
            </HStack>

            {/* Statistiques rapides */}
            <StatGroup bg="whiteAlpha.150" borderRadius="xl" p={4}>
              <Stat>
                <StatLabel color="whiteAlpha.700">{t('members.totalMembers')}</StatLabel>
                <StatNumber color="white">{statistics.total}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel color="whiteAlpha.700">{t('members.alive')}</StatLabel>
                <StatNumber color="green.300">{statistics.alive}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel color="whiteAlpha.700">{t('members.deceased')}</StatLabel>
                <StatNumber color="whiteAlpha.600">{statistics.deceased}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel color="whiteAlpha.700">{t('members.mainLineage')}</StatLabel>
                <StatNumber color="yellow.300">{statistics.mainLineage}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel color="whiteAlpha.700">{t('members.averageAge')}</StatLabel>
                <StatNumber color="white">{Math.round(statistics.averageAge) || 0} {t('common.years')}</StatNumber>
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
                <Icon as={FaFilter} color="#8B5CF6" />
                <Text fontWeight="600" color="#1A162E">{t('members.filtersAndSearch')}</Text>
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
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    bg="white"
                    border="1px solid #E8E6F0"
                  />
                </InputGroup>
              </GridItem>

              {/* Filtre sexe */}
              <GridItem>
                <Select
                  value={filters.sex}
                  onChange={(e) => setFilters(prev => ({ ...prev, sex: e.target.value }))}
                  bg="white"
                  border="1px solid #E8E6F0"
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
                  border="1px solid #E8E6F0"
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
                  border="1px solid #E8E6F0"
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
                  type="number"
                  min="0"
                  max="150"
                  value={filters.ageMin}
                  onChange={(e) => setFilters(prev => ({ ...prev, ageMin: e.target.value }))}
                  bg="white"
                  border="1px solid #E8E6F0"
                />
              </GridItem>
            </Grid>
          </VStack>
        </MotionBox>
      </Container>

      {/* Liste responsive: Cartes sur mobile, Tableau sur desktop */}
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
          {isMobile ? (
            // Vue mobile: Grille de cartes
            <Box p={4}>
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                {filteredAndSortedPersons.map((person) => (
                  <MemberCard
                    key={person.personID}
                    member={{
                      ...person,
                      birthday: person.birthday || null,
                      deathDate: person.deathDate || null,
                      photoUrl: person.photoUrl || null,
                    }}
                    onEdit={person.canEdit ? handleEditPerson : undefined}
                    onView={handleViewProfile}
                    showLineageBadge={true}
                  />
                ))}
              </SimpleGrid>
              
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
          ) : (
            // Vue desktop: Tableau
            <Box overflowX="auto">
              <Table variant="simple">
              <Thead bg="#F5F3FF">
                <Tr>
                  <Th>{t('members.photo')}</Th>
                  
                  {/* En-tête cliquable Nom complet */}
                  <Th 
                    cursor="pointer" 
                    _hover={{ bg: '#EDE9FE' }}
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
                    _hover={{ bg: '#EDE9FE' }}
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
                    _hover={{ bg: '#EDE9FE' }}
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
                    _hover={{ bg: '#EDE9FE' }}
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
                    _hover={{ bg: '#EDE9FE' }}
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
                    _hover={{ bg: '#F5F3FF' }}
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
                            ? 'purple.300'
                            : '#8B5CF6'
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
                        <Text 
                          fontWeight="500" 
                          color={calculateAge(person.birthday, person.deathDate, person.alive) ? "gray.900" : "gray.400"}
                        >
                          {calculateAge(person.birthday, person.deathDate, person.alive) 
                            ? `${calculateAge(person.birthday, person.deathDate, person.alive)} ${t('common.years')}`
                            : '-'
                          }
                        </Text>
                        {person.birthday && (
                          <Text fontSize="xs" color="gray.600">
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
                        {/* Bouton Voir dans l'Arbre */}
                        <Tooltip label={t('members.viewInTree')}>
                          <IconButton
                            aria-label="View in tree"
                            size="sm"
                            bg="green.50"
                            color="green.600"
                            icon={<FaProjectDiagram />}
                            onClick={() => handleViewInTree(person.personID)}
                            _hover={{
                              bg: 'green.100',
                            }}
                          />
                        </Tooltip>

                        {/* Bouton Voir */}
                        <Tooltip label={t('members.viewProfile')}>
                          <IconButton
                            aria-label="View profile"
                            size="sm"
                            bg="#F5F3FF"
                            color="purple.900"
                            icon={<FaEye />}
                            onClick={() => handleViewProfile(person.personID)}
                            _hover={{
                              bg: '#EDE9FE',
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
                          <Tooltip label={t('members.creatorRuleTooltip')}>
                            <Badge colorScheme="green" fontSize="xs" display="flex" alignItems="center">
                              <Icon as={FaCheck} mr={1} />
                              {t('common.creator')}
                            </Badge>
                          </Tooltip>
                        )}

                        {person.personID === user?.idPerson && !person.isCreator && (
                          <Tooltip label={t('members.memberRuleTooltip')}>
                            <Badge colorScheme="purple" fontSize="xs" display="flex" alignItems="center">
                              <Icon as={FaUser} mr={1} />
                              {t('members.yourself')}
                            </Badge>
                          </Tooltip>
                        )}

                        {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && !person.isCreator && person.personID !== user?.idPerson && person.canEdit && (
                          <Tooltip label={t('members.adminRuleTooltip')}>
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
          )}
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
                    bg="#F5F3FF"
                    p={3}
                    borderRadius="md"
                    border="1px solid #E8E6F0"
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
                        <Text 
                          fontSize="xs" 
                          color={calculateAge(personToDelete.birthday, personToDelete.deathDate, personToDelete.alive) ? "#6E6890" : "gray.400"}
                        >
                          {calculateAge(personToDelete.birthday, personToDelete.deathDate, personToDelete.alive)
                            ? `${calculateAge(personToDelete.birthday, personToDelete.deathDate, personToDelete.alive)} ${t('common.years')}`
                            : '-'
                          }
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
