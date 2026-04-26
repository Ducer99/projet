import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Avatar,
  Badge,
  Card,
  CardBody,
  Input,
  IconButton,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Divider,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  Image,
  Wrap,
  WrapItem,
  Spinner,
} from '@chakra-ui/react';
import {
  SearchIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowBackIcon,
  ArrowForwardIcon,
  InfoIcon,
  ViewIcon,
  CloseIcon,
} from '@chakra-ui/icons';
import { FaHome, FaMap } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import FamilyTreeToolbar from '../components/FamilyTreeToolbar';

// Types
interface Person {
  personID: number;
  firstName: string;
  lastName: string;
  birthday?: string; // Changé de birthDate à birthday pour correspondre à l'API
  birthDate?: string; // Garde les deux pour compatibilité
  deathDate?: string;
  fatherID?: number;
  motherID?: number;
  photoUrl?: string;
  isDeceased?: boolean;
  alive?: boolean; // Ajout de la propriété alive de l'API
  gender?: 'M' | 'F' | 'male' | 'female';
  sex?: 'M' | 'F';
  notes?: string;
}

interface Marriage {
  marriageID: number;
  husbandID: number;
  wifeID: number;
  marriageDate?: string;
  marriagePlace?: string;
  divorceDate?: string;
  status: string;
}

interface NavigationHistory {
  personID: number;
  personName: string;
}

// Barre horizontale couple : ──💍── entre deux cartes avec tirets au milieu
const CoupleRow = ({ left, right }: { left: React.ReactNode; right: React.ReactNode }) => {
  const hasBoth = left && right;
  return (
    <Box position="relative" display="flex" alignItems="center" justifyContent="center">
      {left}
      {hasBoth && (
        <Box
          mx={2}
          height="2px"
          width="32px"
          flexShrink={0}
          position="relative"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {/* Ligne horizontale tiretée */}
          <Box
            position="absolute"
            left={0} right={0}
            height="2px"
            bgGradient="repeating-linear(to-r, #9F7AEA 0px, #9F7AEA 6px, transparent 6px, transparent 12px)"
          />
          {/* Anneau central */}
          <Box
            position="relative"
            zIndex={1}
            fontSize="10px"
            lineHeight="1"
            userSelect="none"
          >
            💍
          </Box>
        </Box>
      )}
      {right}
    </Box>
  );
};

const FamilyTreeEnhanced: React.FC = () => {
  // Translation hook
  const { t } = useTranslation();
  
  // Helper function to get birth date from person object
  const getBirthDate = (person: Person): string | undefined => {
    return person.birthday || person.birthDate;
  };

  // Helper function to get gender from person object
  const getGender = (person: Person): 'M' | 'F' | 'unknown' => {
    if (person.sex) return person.sex;
    if (person.gender === 'M' || person.gender === 'male') return 'M';
    if (person.gender === 'F' || person.gender === 'female') return 'F';
    return 'unknown';
  };
  
  // React Router
  const location = useLocation();
  const navigate = useNavigate();
  
  const fetchedRef = useRef(false);

  // States
  const [persons, setPersons] = useState<Person[]>([]);
  const [marriages, setMarriages] = useState<Marriage[]>([]);
  const [focusPersonID, setFocusPersonID] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSiblings, setShowSiblings] = useState(false);
  const [detectedLoops, setDetectedLoops] = useState<number[][]>([]);
  const [navigationHistory, setNavigationHistory] = useState<NavigationHistory[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [stats, setStats] = useState({
    totalPersons: 0,
    totalMarriages: 0,
    polygamousPersons: 0,
    generations: 0
  });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [unionPage, setUnionPage] = useState(0);
  const [showMinimap, setShowMinimap] = useState(false);
  const [drawerPerson, setDrawerPerson] = useState<Person | null>(null);
  const [drawerPhotos, setDrawerPhotos] = useState<any[]>([]);
  const [drawerPhotosLoading, setDrawerPhotosLoading] = useState(false);
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();
  const treeRef = useRef<HTMLDivElement>(null);

  const myPersonID: number | null = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}').idPerson ?? null; } catch { return null; }
  })();

  const openDrawer = async (person: Person) => {
    setDrawerPerson(person);
    setDrawerPhotos([]);
    onDrawerOpen();
    setDrawerPhotosLoading(true);
    try {
      const res = await api.get(`/photos/person/${person.personID}`);
      setDrawerPhotos(res.data || []);
    } catch {
      setDrawerPhotos([]);
    } finally {
      setDrawerPhotosLoading(false);
    }
  };
  
  const { isOpen: isUnionModalOpen, onOpen: onUnionModalOpen, onClose: onUnionModalClose } = useDisclosure();
  const { isOpen: isStatsModalOpen, onOpen: onStatsModalOpen, onClose: onStatsModalClose } = useDisclosure();
  const [selectedUnion, setSelectedUnion] = useState<Marriage | null>(null);
  
  // Colors with gender distinction and clean up unused variables
  // ⚠️ NOTE: getGenderColors() supprimée car remplacée par le nouveau design moderne avec bordure colorée

  // Load data — useRef guard évite le double appel en React 18 Strict Mode
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    console.log('🌳 [Tree] Chargement initial des données...');
    fetchPersons();
    fetchMarriages();
  }, []);

  // Calculate stats + boucles en un seul cycle quand les données changent
  useEffect(() => {
    if (persons.length === 0) return;
    calculateStats();
    detectGenealogicalLoops();
  }, [persons, marriages]);

  // 🔍 Log des relations quand le focus change (une seule fois par changement)
  useEffect(() => {
    if (!focusPersonID || persons.length === 0) return;
    const fp = persons.find(p => p.personID === focusPersonID);
    if (!fp) return;
    const fa = fp.fatherID ? persons.find(p => p.personID === fp.fatherID) : null;
    const mo = fp.motherID ? persons.find(p => p.personID === fp.motherID) : null;
    const ch = persons.filter(p => p.fatherID === fp.personID || p.motherID === fp.personID);
    const sp = getSpouses(fp);
    const sib = getSiblings(fp);
    console.group(`🔍 [Tree] Focus: #${fp.personID} ${fp.firstName} ${fp.lastName}`);
    console.log('  fatherID:', fp.fatherID ?? '—', fa ? `→ ${fa.firstName} ${fa.lastName}` : '(non trouvé)');
    console.log('  motherID:', fp.motherID ?? '—', mo ? `→ ${mo.firstName} ${mo.lastName}` : '(non trouvé)');
    console.log('  Conjoints:', sp.length, sp.map(s => `#${s.personID} ${s.firstName} ${s.lastName}`));
    console.log('  Enfants:', ch.length, ch.map(c => `#${c.personID} ${c.firstName} ${c.lastName}`));
    console.log('  Frères/sœurs:', sib.length, sib.map(s => `#${s.personID} ${s.firstName} ${s.lastName}`));
    if (detectedLoops.length > 0) console.warn('  ⚠️ Boucles:', detectedLoops);
    console.groupEnd();
  }, [focusPersonID, persons]);

  // 🎯 Détection du paramètre focusId dans l'URL pour centrer sur une personne spécifique
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const focusId = searchParams.get('focusId');
    
    if (focusId && persons.length > 0) {
      const personId = parseInt(focusId, 10);
      console.log(`🔗 [Tree] focusId URL détecté: ${personId}`);
      const person = persons.find(p => p.personID === personId);

      if (person) {
        console.log(`🔗 [Tree] Focus via URL → ${person.firstName} ${person.lastName}`);
        setFocusPersonID(personId);
        setNavigationHistory([{ personID: personId, personName: `${person.firstName} ${person.lastName}` }]);
        setCurrentHistoryIndex(0);
      } else {
        console.warn(`⚠️ [Tree] focusId=${personId} non trouvé dans les ${persons.length} personnes`);
      }
    }
  }, [location.search, persons]);

  const fetchPersons = async () => {
    try {
      const response = await api.get('/persons');
      const personsData = response.data || [];
      setPersons(personsData);

      // Focus sur la personne de l'utilisateur connecté via idPerson
      if (personsData.length > 0 && focusPersonID === null) {
        let loggedInUser: any = {};
        try { loggedInUser = JSON.parse(localStorage.getItem('user') || '{}'); } catch {}
        console.log('🔑 [Tree] User localStorage:', loggedInUser);

        const idPerson = loggedInUser.idPerson;
        console.log(`🎯 [Tree] idPerson depuis localStorage: ${idPerson}`);

        const targetPerson = (idPerson && personsData.find((p: Person) => p.personID === idPerson))
          || personsData[0];

        console.log(`🎯 [Tree] Focus initial → #${targetPerson.personID} ${targetPerson.firstName} ${targetPerson.lastName}`);
        setFocusPersonID(targetPerson.personID);
        setNavigationHistory([{ personID: targetPerson.personID, personName: `${targetPerson.firstName} ${targetPerson.lastName}` }]);
        setCurrentHistoryIndex(0);
      }
    } catch (err) {
      console.error('❌ [Tree] Erreur fetchPersons:', err);
    }
  };

  const fetchMarriages = async () => {
    try {
      let loggedInUser: any = {};
      try { loggedInUser = JSON.parse(localStorage.getItem('user') || '{}'); } catch {}
      const familyID = loggedInUser.familyID;
      if (!familyID) return;

      const response = await api.get(`/marriages/family/${familyID}`);
      // Mapping API (weddingID/manID/womanID) → interface locale (marriageID/husbandID/wifeID)
      const mapped: Marriage[] = (response.data || []).map((w: any) => ({
        marriageID: w.weddingID,
        husbandID: w.manID,
        wifeID: w.womanID,
        marriageDate: w.weddingDate,
        divorceDate: w.divorceDate,
        status: w.status,
      }));
      setMarriages(mapped);
    } catch (err) {
      console.error('❌ [Tree] Erreur fetchMarriages:', err);
      setMarriages([]);
    }
  };

  // Navigation functions
  const navigateToFocus = (personID: number) => {
    const person = persons.find(p => p.personID === personID);
    if (!person) {
      console.warn(`⚠️ [Tree] navigateToFocus: personne #${personID} introuvable`);
      return;
    }
    console.log(`🔀 [Tree] Navigation → #${personID} ${person.firstName} ${person.lastName}`);

    // Add to navigation history
    const newHistoryEntry = {
      personID,
      personName: `${person.firstName} ${person.lastName}`
    };
    
    const newHistory = navigationHistory.slice(0, currentHistoryIndex + 1);
    newHistory.push(newHistoryEntry);
    setNavigationHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
    
    setFocusPersonID(personID);
    setUnionPage(0); // reset pagination quand on change de focus
  };

  const navigateBack = () => {
    if (currentHistoryIndex > 0) {
      setCurrentHistoryIndex(currentHistoryIndex - 1);
      setFocusPersonID(navigationHistory[currentHistoryIndex - 1].personID);
    }
  };

  const navigateForward = () => {
    if (currentHistoryIndex < navigationHistory.length - 1) {
      setCurrentHistoryIndex(currentHistoryIndex + 1);
      setFocusPersonID(navigationHistory[currentHistoryIndex + 1].personID);
    }
  };

  // Calculate statistics
  const calculateStats = () => {
    console.log(`📊 [Tree] calculateStats — ${persons.length} personnes, ${marriages.length} mariages`);
    const totalPersons = persons.length;
    
    // 🔧 CORRECTION BUG POLYGAMIE - Calcul basé sur les enfants avec différents partenaires
    const polygamousCount = new Map<number, Set<number>>();
    persons.forEach(person => {
      const spouses = getSpouses(person);
      if (spouses.length > 1) {
        polygamousCount.set(person.personID, new Set(spouses.map(s => s.personID)));
      }
    });
    
    const polygamousPersons = polygamousCount.size;
    
    // � CORRECTION BUG UNIONS - Compter les unions réelles (entier)
    const uniqueUnions = new Set<string>();
    persons.forEach(person => {
      const spouses = getSpouses(person);
      spouses.forEach(spouse => {
        // Créer une clé unique pour chaque union (IDs triés pour éviter doublons)
        const unionKey = [person.personID, spouse.personID].sort().join('-');
        uniqueUnions.add(unionKey);
      });
    });
    
    const totalMarriages = uniqueUnions.size; // Entier, pas de division par 2
    
    // Calculate generations (simplified)
    let maxGeneration = 0;
    const calculateGeneration = (personID: number, generation: number = 0): number => {
      const person = persons.find(p => p.personID === personID);
      if (!person) return generation;
      
      const children = persons.filter(p => p.fatherID === personID || p.motherID === personID);
      if (children.length === 0) return generation;
      
      return Math.max(...children.map(child => calculateGeneration(child.personID, generation + 1)));
    };
    
    // Find root persons (no parents)
    const rootPersons = persons.filter(p => !p.fatherID && !p.motherID);
    rootPersons.forEach(root => {
      maxGeneration = Math.max(maxGeneration, calculateGeneration(root.personID));
    });

    console.log(`📊 [Tree] Stats → ${totalPersons} personnes, ${totalMarriages} unions, ${polygamousPersons} polygames, ${maxGeneration + 1} générations`);
    setStats({
      totalPersons,
      totalMarriages,
      polygamousPersons,
      generations: maxGeneration + 1
    });
  };

  // 🛡️ ALGORITHME DE DÉTECTION DE BOUCLES GÉNÉALOGIQUES
  const detectGenealogicalLoops = () => {
    console.log('🛡️ [Tree] Détection des boucles généalogiques...');
    const loops: number[][] = [];
    const visitedGlobal = new Set<number>();
    
    const dfsDetectLoop = (startID: number): number[] | null => {
      const visited = new Set<number>();
      const path: number[] = [];
      
      const dfs = (personID: number): number[] | null => {
        if (visited.has(personID)) {
          // Boucle détectée - retourner le chemin de la boucle
          const loopStartIndex = path.indexOf(personID);
          return path.slice(loopStartIndex);
        }
        
        if (visitedGlobal.has(personID)) return null;
        
        visited.add(personID);
        path.push(personID);
        
        const person = persons.find(p => p.personID === personID);
        if (person) {
          // Vérifier les relations parentales
          if (person.fatherID) {
            const loop = dfs(person.fatherID);
            if (loop) return loop;
          }
          if (person.motherID) {
            const loop = dfs(person.motherID);
            if (loop) return loop;
          }
          
          // Vérifier les enfants
          const children = persons.filter(p => 
            p.fatherID === personID || p.motherID === personID
          );
          for (const child of children) {
            const loop = dfs(child.personID);
            if (loop) return loop;
          }
        }
        
        path.pop();
        visited.delete(personID);
        return null;
      };
      
      return dfs(startID);
    };
    
    // Tester chaque personne comme point de départ
    for (const person of persons) {
      if (!visitedGlobal.has(person.personID)) {
        const loop = dfsDetectLoop(person.personID);
        if (loop && loop.length > 2) { // Ignorer les boucles triviales
          loops.push(loop);
          // Marquer toutes les personnes de cette boucle comme visitées
          loop.forEach(id => visitedGlobal.add(id));
        }
      }
    }
    
    setDetectedLoops(loops);
    if (loops.length > 0) {
      console.warn(`🛡️ [Tree] ${loops.length} boucle(s) détectée(s):`, loops);
    } else {
      console.log('🛡️ [Tree] Aucune boucle généalogique détectée');
    }
    
    return loops;
  };

  // Get person relationships
  const getFocusPerson = () => focusPersonID ? persons.find(p => p.personID === focusPersonID) : null;
  
  const getFather = (person: Person) => 
    person.fatherID ? persons.find(p => p.personID === person.fatherID) : null;
  
  const getMother = (person: Person) => 
    person.motherID ? persons.find(p => p.personID === person.motherID) : null;
  
  const getChildren = (person: Person) => 
    persons.filter(p => p.fatherID === person.personID || p.motherID === person.personID);
  
  const getSiblings = (person: Person) => 
    persons.filter(p => 
      p.personID !== person.personID && 
      ((person.fatherID && p.fatherID === person.fatherID) || 
       (person.motherID && p.motherID === person.motherID))
    );

  // 🚶‍♂️ NAVIGATION FRATRIE COMPLÈTE AVEC DÉTECTION AVANCÉE
  const getFullSiblingsAnalysis = (person: Person) => {
    const allSiblings = getSiblings(person);
    
    // Frère/sœur complet(e) : même père ET même mère (les deux connus)
    // null = inconnu ≠ "parent différent" → ne pas classer comme demi-frère si l'un est null
    const fullSiblings = allSiblings.filter(s => {
      const sameFather = person.fatherID && s.fatherID && s.fatherID === person.fatherID;
      const sameMother = person.motherID && s.motherID && s.motherID === person.motherID;
      return sameFather && sameMother;
    });

    // Demi-frère paternel : même père ET mère EXPLICITEMENT différente (les deux non-null et différentes)
    const paternalHalfSiblings = allSiblings.filter(s =>
      person.fatherID && s.fatherID && s.fatherID === person.fatherID &&
      s.motherID != null && person.motherID != null && s.motherID !== person.motherID
    );

    // Demi-frère maternel : même mère ET père EXPLICITEMENT différent (les deux non-null et différents)
    const maternalHalfSiblings = allSiblings.filter(s =>
      person.motherID && s.motherID && s.motherID === person.motherID &&
      s.fatherID != null && person.fatherID != null && s.fatherID !== person.fatherID
    );
    
    // Frères/sœurs avec lien partiel (un seul parent connu, l'autre null = inconnu)
    const partialSiblings = allSiblings.filter(s =>
      !fullSiblings.includes(s) &&
      !paternalHalfSiblings.includes(s) &&
      !maternalHalfSiblings.includes(s)
    );

    return {
      all: allSiblings,
      full: fullSiblings,
      paternalHalf: paternalHalfSiblings,
      maternalHalf: maternalHalfSiblings,
      partial: partialSiblings,
      totalCount: allSiblings.length,
      hasComplexRelations: paternalHalfSiblings.length > 0 || maternalHalfSiblings.length > 0
    };
  };
  
  const getSpouses = (person: Person) => {
    const spouseIDs = new Set<number>();
    
    // Get spouses through marriages
    marriages.forEach(marriage => {
      if (marriage.husbandID === person.personID) {
        spouseIDs.add(marriage.wifeID);
      } else if (marriage.wifeID === person.personID) {
        spouseIDs.add(marriage.husbandID);
      }
    });
    
    // Get spouses through shared children
    const children = getChildren(person);
    children.forEach(child => {
      if (child.fatherID === person.personID && child.motherID) {
        spouseIDs.add(child.motherID);
      } else if (child.motherID === person.personID && child.fatherID) {
        spouseIDs.add(child.fatherID);
      }
    });
    
    return Array.from(spouseIDs).map(id => persons.find(p => p.personID === id)).filter(Boolean) as Person[];
  };

  // Get marriage details between two persons
  const getMarriageDetails = (person1ID: number, person2ID: number) => {
    // D'abord, chercher dans les vrais mariages
    const realMarriage = marriages.find(m => 
      (m.husbandID === person1ID && m.wifeID === person2ID) ||
      (m.husbandID === person2ID && m.wifeID === person1ID)
    );
    
    if (realMarriage) {
      return realMarriage;
    }
    
    // Si pas de mariage officiel, créer un mariage simulé basé sur les enfants communs
    const sharedChildren = persons.filter(child => 
      (child.fatherID === person1ID && child.motherID === person2ID) ||
      (child.fatherID === person2ID && child.motherID === person1ID)
    );
    
    if (sharedChildren.length > 0) {
      // Trouver la date de naissance de l'enfant le plus ancien pour estimer la date de mariage
      const oldestChild = sharedChildren.reduce((oldest, child) => {
        const childBirthDate = getBirthDate(child);
        const oldestBirthDate = getBirthDate(oldest);
        
        if (!childBirthDate) return oldest;
        if (!oldestBirthDate) return child;
        return new Date(childBirthDate) < new Date(oldestBirthDate) ? child : oldest;
      });
      
      let estimatedMarriageDate = null;
      const oldestChildBirthDate = getBirthDate(oldestChild);
      if (oldestChildBirthDate) {
        const birthDate = new Date(oldestChildBirthDate);
        estimatedMarriageDate = new Date(birthDate.getFullYear() - 1, birthDate.getMonth(), birthDate.getDate()).toISOString().split('T')[0];
      }
      
      return {
        marriageID: 0, // ID simulé
        husbandID: person1ID,
        wifeID: person2ID,
        marriageDate: estimatedMarriageDate || undefined,
        marriagePlace: t('familyTree.placeNotSpecified'),
        divorceDate: undefined,
        status: 'active'
      };
    }
    
    return null;
  };

  const calculateAge = (person: Person) => {
    const birthDateStr = getBirthDate(person);
    if (!birthDateStr) return null;
    
    const birth = new Date(birthDateStr);
    const end = person.deathDate ? new Date(person.deathDate) : new Date();
    
    // 🚨 VALIDATION DE COHÉRENCE DES DATES
    if (person.deathDate && new Date(person.deathDate) < birth) {
      return null;
    }
    
    const age = end.getFullYear() - birth.getFullYear();
    const monthDiff = end.getMonth() - birth.getMonth();
    const dayDiff = end.getDate() - birth.getDate();
    
    // Ajustement précis de l'âge
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      return age - 1;
    }
    
    return age;
  };

  // 🎯 VALIDATION DE DATES POUR NOUVEAU MEMBRE
  const validatePersonDates = (birthDate?: string, deathDate?: string) => {
    if (!birthDate || !deathDate) return { isValid: true, message: '' };
    
    const birth = new Date(birthDate);
    const death = new Date(deathDate);
    
    if (death < birth) {
      return {
        isValid: false,
        message: t('familyTree.deathDateBeforeBirth')
      };
    }
    
    return { isValid: true, message: '' };
  };

  // Get child relationship type and mother info
  const getChildRelationInfo = (child: Person, focusPerson: Person) => {
    const spouses = getSpouses(focusPerson);
    
    let motherInfo = null;
    let relationType = null;
    
    // Déterminer la mère de cet enfant
    if (child.fatherID === focusPerson.personID && child.motherID) {
      const mother = persons.find(p => p.personID === child.motherID);
      motherInfo = mother ? `${mother.firstName} ${mother.lastName}` : t('familyTree.unknown');
    } else if (child.motherID === focusPerson.personID && child.fatherID) {
      motherInfo = `${focusPerson.firstName} ${focusPerson.lastName}`;
    }
    
    // Déterminer le type de relation (demi-fratrie)
    if (spouses.length > 1) {
      let otherParentID: number | undefined;
      if (child.fatherID === focusPerson.personID) {
        otherParentID = child.motherID;
      } else if (child.motherID === focusPerson.personID) {
        otherParentID = child.fatherID;
      }
      
      if (otherParentID) {
        const isFromSecondarySpouse = spouses.some((spouse, index) => 
          index > 0 && spouse.personID === otherParentID
        );
        relationType = isFromSecondarySpouse ? 'half' : null;
      }
    }
    
    return { motherInfo, relationType };
  };

  // Group children by union, sorted by wedding date then children by birthday
  const getChildrenByUnion = (person: Person) => {
    const children = getChildren(person);
    const childrenByUnion = new Map<number | string, {
      mother: Person | null;
      children: Person[];
      unionInfo: any;
      unionDate: Date | null;
      unionID: number;
    }>();

    children.forEach(child => {
      let coParentID: number | string = 'unknown';
      let coParent: Person | null = null;

      if (child.fatherID === person.personID && child.motherID) {
        coParentID = child.motherID;
        coParent = persons.find(p => p.personID === child.motherID) || null;
      } else if (child.motherID === person.personID && child.fatherID) {
        coParentID = child.fatherID;
        coParent = persons.find(p => p.personID === child.fatherID) || null;
      }

      if (!childrenByUnion.has(coParentID)) {
        const unionInfo = coParent ? getMarriageDetails(person.personID, coParent.personID) : null;
        // Date de l'union pour le tri : sentinel 1900 → null
        let unionDate: Date | null = null;
        if (unionInfo?.marriageDate) {
          const d = new Date(unionInfo.marriageDate);
          if (d.getFullYear() > 1900) unionDate = d;
        }
        const unionID = unionInfo?.marriageID ?? (typeof coParentID === 'number' ? coParentID : 999999);
        childrenByUnion.set(coParentID, { mother: coParent, children: [], unionInfo, unionDate, unionID });
      }

      childrenByUnion.get(coParentID)!.children.push(child);
    });

    // Trier les enfants de chaque union : dates connues ASC, dates inconnues (null) en dernier.
    // Les jumeaux (même date exacte) gardent l'ordre d'insertion (personID ASC) — il n'existe
    // pas de règle universelle pour le rang des jumeaux. Ne pas modifier sans décision de l'admin famille.
    childrenByUnion.forEach(group => {
      group.children.sort((a, b) => {
        const hasA = !!a.birthday;
        const hasB = !!b.birthday;
        if (hasA && hasB) return new Date(a.birthday!).getTime() - new Date(b.birthday!).getTime();
        if (hasA) return -1;  // date connue avant inconnue
        if (hasB) return 1;
        return a.personID - b.personID; // les deux inconnus : ordre d'insertion
      });
    });

    // Trier les unions : date ASC (unions sans date vont à la fin), fallback unionID
    return Array.from(childrenByUnion.values()).sort((a, b) => {
      if (a.unionDate && b.unionDate) return a.unionDate.getTime() - b.unionDate.getTime();
      if (a.unionDate) return -1;
      if (b.unionDate) return 1;
      return a.unionID - b.unionID;
    });
  };

  // Search functionality
  const getFilteredPersons = () => {
    if (!searchTerm) return persons;
    return persons.filter(person =>
      `${person.firstName} ${person.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // 🔍 RECHERCHE ET AUTO-FOCUS AMÉLIORÉ
  const handleSearchAndFocus = (person: Person) => {
    navigateToFocus(person.personID);
    setSearchTerm(''); // Clear search after selection
  };

  const searchResults = getFilteredPersons();

  // Show union modal
  const showUnionDetails = (spouse: Person, focusPerson: Person) => {
    const marriage = getMarriageDetails(spouse.personID, focusPerson.personID);
    setSelectedUnion(marriage || null);
    onUnionModalOpen();
  };

  // Zoom functions
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 1.5));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleExport = () => {
    // Cette fonction sera gérée par le FamilyTreeToolbar
  };

  // Render person card - 🎨 DESIGN MODERNE (Style Miro/Figma)
  const renderPersonCard = (person: Person, isMainFocus = false, relationship = '') => {
    const age = calculateAge(person);
    const birthDateStr = getBirthDate(person);
    const dateValidation = validatePersonDates(birthDateStr, person.deathDate);
    const gender = getGender(person);
    
    // 🎨 Couleurs subtiles selon le genre
    const genderColor = gender === 'M' ? '#3B82F6' : gender === 'F' ? '#EC4899' : '#9CA3AF';
    const genderColorLight = gender === 'M' ? '#DBEAFE' : gender === 'F' ? '#FCE7F3' : '#F3F4F6';
    
    const tooltipLabel = (
      <VStack spacing={0.5} p={1} align="start">
        <Text fontWeight="700" fontSize="sm">{person.firstName} {person.lastName}</Text>
        {birthDateStr && (
          <Text fontSize="xs">🎂 {new Date(birthDateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
        )}
        {person.deathDate && (
          <Text fontSize="xs">✝ {new Date(person.deathDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
        )}
        {age !== null && (
          <Text fontSize="xs">{person.deathDate ? `Vécu ${age} ans` : `${age} ans`}</Text>
        )}
        {!birthDateStr && !person.deathDate && (
          <Text fontSize="xs" color="gray.400">Aucune date renseignée</Text>
        )}
      </VStack>
    );

    return (
      <Tooltip label={tooltipLabel} placement="top" hasArrow openDelay={400} bg="gray.800" color="white" borderRadius="lg">
      <Card
        key={person.personID}
        bg="white"
        borderWidth="0"
        borderLeftWidth="4px"
        borderLeftColor={genderColor}
        cursor="pointer"
        onClick={() => openDrawer(person)}
        transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{ 
          transform: 'translateY(-2px)', 
          shadow: 'xl',
          borderLeftWidth: '6px',
        }}
        shadow="lg"
        minW="180px"
        maxW="220px"
        borderRadius="xl"
        overflow="visible"
        position="relative"
        {...(isMainFocus && {
          shadow: '2xl',
          borderLeftWidth: '6px',
          ring: 2,
          ringColor: genderColor,
        })}
      >
        <CardBody p={4}>
          <VStack spacing={3} align="center">
            {/* 📸 PHOTO/AVATAR EN PREMIER PLAN */}
            <Box position="relative">
              <Avatar 
                src={person.photoUrl || `https://ui-avatars.com/api/?name=${person.firstName}+${person.lastName}&background=${gender === 'M' ? '3B82F6' : gender === 'F' ? 'EC4899' : '9CA3AF'}&color=white&size=128`}
                name={`${person.firstName} ${person.lastName}`}
                size="xl"
                bg={genderColorLight}
                border="3px solid white"
                shadow="md"
              />
              {/* Icône de genre discrète */}
              {gender !== 'unknown' && (
                <Box
                  position="absolute"
                  bottom="-4px"
                  right="-4px"
                  bg={genderColor}
                  borderRadius="full"
                  w="28px"
                  h="28px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  border="2px solid white"
                  shadow="sm"
                >
                  <Text color="white" fontSize="14px" fontWeight="bold">
                    {gender === 'M' ? '♂' : '♀'}
                  </Text>
                </Box>
              )}
              {/* Badge focus */}
              {isMainFocus && (
                <Box
                  position="absolute"
                  top="-6px"
                  left="-6px"
                  bg="green.500"
                  borderRadius="full"
                  w="24px"
                  h="24px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  border="2px solid white"
                  shadow="md"
                >
                  <Text color="white" fontSize="12px">
                    🎯
                  </Text>
                </Box>
              )}
            </Box>
            
            {/* NOM COMPLET EN GRAS */}
            <VStack spacing={0.5} w="100%">
              <Text 
                fontWeight="700" 
                fontSize="md" 
                textAlign="center"
                color="gray.800"
                lineHeight="1.2"
              >
                {person.firstName}
              </Text>
              <Text 
                fontWeight="700" 
                fontSize="md" 
                textAlign="center"
                color="gray.800"
                lineHeight="1.2"
              >
                {person.lastName}
              </Text>
            </VStack>
            
            {/* DATES (Naissance - Décès) EN PETIT GRIS */}
            <VStack spacing={0} w="100%">
              {birthDateStr && (
                <HStack spacing={1} fontSize="xs" color="gray.500">
                  <Text>
                    {new Date(birthDateStr).toLocaleDateString('fr-FR', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </Text>
                  {person.deathDate && (
                    <>
                      <Text>-</Text>
                      <Text>
                        {new Date(person.deathDate).toLocaleDateString('fr-FR', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </Text>
                    </>
                  )}
                </HStack>
              )}
              
              {/* Âge */}
              {age !== null && (
                <Text fontSize="xs" color="gray.400">
                  {person.isDeceased || person.deathDate ? 
                    `✝ ${age} ans` : 
                    `${age} ans`
                  }
                </Text>
              )}
              
              {/* Badge relation (discret) */}
              {relationship && (
                <Text 
                  fontSize="2xs" 
                  color="gray.400" 
                  textTransform="uppercase" 
                  fontWeight="600"
                  mt={1}
                >
                  {relationship}
                </Text>
              )}
            </VStack>
            
            {/* Alerte dates incohérentes (si nécessaire) */}
            {!dateValidation.isValid && (
              <Text fontSize="2xs" color="red.500" textAlign="center">
                ⚠️ Dates incohérentes
              </Text>
            )}
            
            {/* Badge boucle (si applicable) */}
            {isPersonInLoop(person.personID) && (
              <Badge colorScheme="red" fontSize="2xs" variant="subtle">
                ⚠️ Boucle détectée
              </Badge>
            )}
          </VStack>
        </CardBody>
      </Card>
      </Tooltip>
    );
  };

  // Render union indicator
  const renderUnionIndicator = (spouse: Person, focusPerson: Person) => {
    const marriage = getMarriageDetails(spouse.personID, focusPerson.personID);
    
    return (
      <Tooltip label={t('familyTree.clickToSeeUnionDetails')} placement="top">
        <Box
          bg="pink.100"
          borderColor="pink.300"
          borderWidth="2px"
          borderRadius="full"
          p={2}
          cursor="pointer"
          onClick={() => showUnionDetails(spouse, focusPerson)}
          _hover={{ bg: 'pink.200' }}
        >
          <Text fontSize="xs" fontWeight="bold" color="pink.600">
            💍 {marriage?.marriageDate ? new Date(marriage.marriageDate).getFullYear() : t('familyTree.union')}
          </Text>
        </Box>
      </Tooltip>
    );
  };

  const focusPerson = getFocusPerson();
  
  if (!focusPerson) {
    return (
      <Container maxW="6xl" py={8}>
        <VStack spacing={4}>
          <Text fontSize="lg">
            {focusPersonID === null ? t('familyTree.loadingData') : t('familyTree.personNotFound')}
          </Text>
          <Text color="gray.500">
            {persons.length === 0 
              ? "Chargement en cours..." 
              : focusPersonID === null 
                ? t('familyTree.automaticFirstPersonSelection')
                : `${persons.length} personnes disponibles, mais ID ${focusPersonID} non trouvé.`}
          </Text>
          {persons.length > 0 && focusPersonID !== null && (
            <VStack spacing={2}>
              <Button onClick={() => setFocusPersonID(persons[0].personID)} colorScheme="blue">
                Aller à la première personne
              </Button>
              <Text fontSize="sm" color="gray.400">
                Personnes disponibles : {persons.map(p => `${p.firstName} ${p.lastName}`).join(', ')}
              </Text>
            </VStack>
          )}
        </VStack>
      </Container>
    );
  }

  const father = getFather(focusPerson);
  const mother = getMother(focusPerson);
  const spouses = getSpouses(focusPerson);
  const children = getChildren(focusPerson);
  const siblings = getSiblings(focusPerson);
  const siblingAnalysis = getFullSiblingsAnalysis(focusPerson);

  // Grands-parents
  const paternalGrandfather = father ? getFather(father) : null;
  const paternalGrandmother = father ? getMother(father) : null;
  const maternalGrandfather = mother ? getFather(mother) : null;
  const maternalGrandmother = mother ? getMother(mother) : null;
  const hasGrandparents = paternalGrandfather || paternalGrandmother || maternalGrandfather || maternalGrandmother;

  // 🛡️ Détection et affichage des boucles si présentes
  const isPersonInLoop = (personID: number) => {
    return detectedLoops.some(loop => loop.includes(personID));
  };

  return (
    <Box
      bg="#F9FAFB"
      bgImage="radial-gradient(circle, #E5E7EB 1px, transparent 1px)"
      bgSize="20px 20px"
      minH="100vh"
      position="relative"
    >
      <Container maxW="8xl" py={6}>
        <VStack spacing={6}>
        {/* Header with navigation and search */}
        <HStack w="full" justify="space-between" wrap="wrap" spacing={4}>
          <VStack spacing={2} align="start">
            <HStack spacing={2}>
              <Tooltip label={t('familyTree.previousPageInHistory')} placement="bottom">
                <IconButton
                  aria-label={t('familyTree.previous')}
                  icon={<ArrowBackIcon />}
                  onClick={navigateBack}
                  isDisabled={currentHistoryIndex <= 0}
                  size="sm"
                  colorScheme="blue"
                />
              </Tooltip>
              <Tooltip label="Page suivante dans l'historique" placement="bottom">
                <IconButton
                  aria-label={t('familyTree.next')}
                  icon={<ArrowForwardIcon />}
                  onClick={navigateForward}
                  isDisabled={currentHistoryIndex >= navigationHistory.length - 1}
                  size="sm"
                  colorScheme="blue"
                />
              </Tooltip>
              <Text fontSize="sm" color="gray.500" fontWeight="semibold">
                📍 {currentHistoryIndex + 1}/{navigationHistory.length || 1}
              </Text>
            </HStack>
            
            {/* 🧭 AFFICHAGE DU CHEMIN DE NAVIGATION */}
            {navigationHistory.length > 0 && (
              <Text fontSize="xs" color="blue.600">
                {t('familyTree.historyLabel')} {navigationHistory[currentHistoryIndex]?.personName || t('familyTree.beginning')}
              </Text>
            )}
          </VStack>

          <HStack spacing={4}>
            {myPersonID && (
              <Tooltip label="Centrer sur moi" placement="bottom">
                <IconButton
                  aria-label="Centrer sur moi"
                  icon={<FaHome />}
                  size="sm"
                  colorScheme="purple"
                  variant="outline"
                  onClick={() => navigateToFocus(myPersonID)}
                  isDisabled={focusPersonID === myPersonID}
                />
              </Tooltip>
            )}
            <HStack>
              <SearchIcon />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="sm"
                maxW="250px"
              />
            </HStack>
            
            <Button
              leftIcon={<ViewIcon />}
              onClick={() => setShowSiblings(!showSiblings)}
              size="sm"
              colorScheme={showSiblings ? "blue" : "gray"}
              variant={showSiblings ? "solid" : "outline"}
            >
              {showSiblings ? t('familyTree.hide') : t('familyTree.showSiblings')}
              {siblingAnalysis.totalCount > 0 && (
                <Badge ml={2} colorScheme={showSiblings ? "white" : "blue"}>
                  {siblingAnalysis.totalCount}
                </Badge>
              )}
            </Button>

            <Tooltip label={t('familyTree.detailedStatisticsTooltip')} placement="bottom">
              <Button
                leftIcon={<InfoIcon />}
                onClick={onStatsModalOpen}
                size="sm"
                colorScheme="purple"
                variant="outline"
              >
                {t('familyTree.stats')}
              </Button>
            </Tooltip>
          </HStack>
        </HStack>

        {/* Quick Stats */}
        <StatGroup w="full">
          <Stat>
            <StatLabel>👥 {t('familyTree.persons')}</StatLabel>
            <StatNumber>{stats.totalPersons}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>💍 {t('familyTree.unions')}</StatLabel>
            <StatNumber>{stats.totalMarriages}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>🔄 {t('familyTree.polygamous')}</StatLabel>
            <StatNumber>{stats.polygamousPersons}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>📈 {t('familyTree.generations')}</StatLabel>
            <StatNumber>{stats.generations}</StatNumber>
          </Stat>
          {detectedLoops.length > 0 && (
            <Stat>
              <StatLabel>⚠️ {t('familyTree.loops')}</StatLabel>
              <StatNumber color="red.500">{detectedLoops.length}</StatNumber>
            </Stat>
          )}
        </StatGroup>

        {/* Family tree layout with background pattern and zoom */}
        <Box
          ref={treeRef}
          w="full"
          position="relative"
          bg="gray.50"
          backgroundImage="radial-gradient(circle, #E2E8F0 1px, transparent 1px)"
          backgroundSize="20px 20px"
          borderRadius="md"
          p={6}
          transform={`scale(${zoomLevel})`}
          transformOrigin="top center"
          transition="transform 0.3s ease"
        >
          {/* Grandparents row */}
          {hasGrandparents && (
            <VStack spacing={0} mb={0}>
              <Text fontSize="xs" color="gray.400" mb={2} fontWeight="600" letterSpacing="wider" textTransform="uppercase">
                {t('familyTree.grandparents') || 'Grands-parents'}
              </Text>
              <HStack justify="center" spacing={12} wrap="wrap">
                {/* Paternal side */}
                {(paternalGrandfather || paternalGrandmother) && (
                  <VStack spacing={2}>
                    <Text fontSize="xs" color="blue.400" fontWeight="600">
                      {t('familyTree.paternalLine') || 'Côté paternel'}
                    </Text>
                    <CoupleRow
                      left={paternalGrandfather ? renderPersonCard(paternalGrandfather, false, t('familyTree.grandfather') || 'Grand-père') : null}
                      right={paternalGrandmother ? renderPersonCard(paternalGrandmother, false, t('familyTree.grandmother') || 'Grand-mère') : null}
                    />
                  </VStack>
                )}
                {/* Maternal side */}
                {(maternalGrandfather || maternalGrandmother) && (
                  <VStack spacing={2}>
                    <Text fontSize="xs" color="pink.400" fontWeight="600">
                      {t('familyTree.maternalLine') || 'Côté maternel'}
                    </Text>
                    <CoupleRow
                      left={maternalGrandfather ? renderPersonCard(maternalGrandfather, false, t('familyTree.grandfather') || 'Grand-père') : null}
                      right={maternalGrandmother ? renderPersonCard(maternalGrandmother, false, t('familyTree.grandmother') || 'Grand-mère') : null}
                    />
                  </VStack>
                )}
              </HStack>
              {/* Connecteur vers parents */}
              <Box w="2px" h="32px" bg="gray.300" mt={2} />
            </VStack>
          )}

          {/* Parents row — toutes les unions du père, mère du focus mise en évidence */}
          {(father || mother) && (
            <VStack spacing={0} mb={0}>
              <Text fontSize="sm" color="gray.500" mb={2}>
                <ChevronUpIcon /> {t('familyTree.parents')}
              </Text>
              {(() => {
                if (!father) {
                  // Pas de père connu : afficher juste la mère
                  return <CoupleRow left={null} right={renderPersonCard(mother!, false, t('familyTree.mother'))} />;
                }

                // Toutes les unions du père (via mariages + enfants partagés)
                const fatherUnions = getChildrenByUnion(father);
                // Ajouter les conjointes du père sans enfants communs
                const fatherSpouses = getSpouses(father);
                const coveredSpouseIDs = new Set(fatherUnions.map(u => u.mother?.personID).filter(Boolean));
                const spousesWithoutChildren = fatherSpouses.filter(s => !coveredSpouseIDs.has(s.personID));

                type ParentUnion = { wife: Person | null; children: Person[] };
                const allFatherUnions: ParentUnion[] = [
                  ...fatherUnions.map(u => ({ wife: u.mother, children: u.children })),
                  ...spousesWithoutChildren.map(s => ({ wife: s, children: [] })),
                ];

                // Si le père n'a qu'une union et c'est la mère du focus → vue simple
                if (allFatherUnions.length <= 1) {
                  return <CoupleRow
                    left={renderPersonCard(father, false, t('familyTree.father'))}
                    right={mother ? renderPersonCard(mother, false, t('familyTree.mother')) : null}
                  />;
                }

                // Père polygame :
                //   Femmes gauche ←  tiret  — Père —  tiret  → Femmes droite
                // On répartit les femmes : moitié gauche, moitié droite
                const leftWives  = allFatherUnions.slice(0, Math.ceil(allFatherUnions.length / 2));
                const rightWives = allFatherUnions.slice(Math.ceil(allFatherUnions.length / 2));

                const renderWifeColumn = (u: { wife: Person | null; children: Person[] }, side: 'left' | 'right') => {
                  const isFocusUnion = u.wife?.personID === mother?.personID;
                  const label = isFocusUnion ? t('familyTree.mother') : 'Femme';
                  return (
                    <VStack
                      key={u.wife?.personID ?? 'no-wife'}
                      spacing={1} align="center" p={1}
                      borderRadius="xl"
                      border="2px solid"
                      borderColor={isFocusUnion ? 'purple.400' : 'transparent'}
                      bg={isFocusUnion ? 'purple.50' : 'transparent'}
                    >
                      {u.wife && renderPersonCard(u.wife, false, label)}
                    </VStack>
                  );
                };

                // Lien tiret horizontal entre père et une femme
                const Dash = () => (
                  <Box
                    w="28px" h="2px" flexShrink={0} alignSelf="center" mt="-20px"
                    bgGradient="repeating-linear(to-r, #9F7AEA 0px, #9F7AEA 5px, transparent 5px, transparent 10px)"
                  />
                );

                return (
                  <HStack spacing={0} align="flex-start" justify="center" wrap="wrap">
                    {/* Femmes gauche + tirets */}
                    {leftWives.length > 0 && (
                      <HStack spacing={0} align="flex-start">
                        {leftWives.map(u => (
                          <HStack key={u.wife?.personID ?? 'left'} spacing={0} align="flex-start">
                            {renderWifeColumn(u, 'left')}
                            <Dash />
                          </HStack>
                        ))}
                      </HStack>
                    )}

                    {/* Père — centre */}
                    {renderPersonCard(father, false, t('familyTree.father'))}

                    {/* Tirets + Femmes droite */}
                    {rightWives.length > 0 && (
                      <HStack spacing={0} align="flex-start">
                        {rightWives.map(u => (
                          <HStack key={u.wife?.personID ?? 'right'} spacing={0} align="flex-start">
                            <Dash />
                            {renderWifeColumn(u, 'right')}
                          </HStack>
                        ))}
                      </HStack>
                    )}
                  </HStack>
                );
              })()}
              {/* Connecteur vers focus */}
              <Box w="2px" h="32px" bg="gray.300" mt={2} />
            </VStack>
          )}

          {showSiblings && siblings.length > 0 && (
            <HStack justify="center" spacing={8} mb={6}>
              <VStack>
                <VStack spacing={1}>
                  <Text fontSize="sm" color="gray.500">
                    {t('familyTree.siblings')} ({siblingAnalysis.totalCount})
                  </Text>
                  {siblingAnalysis.hasComplexRelations && (
                    <Badge colorScheme="orange" fontSize="xs">
                      {t('familyTree.complexRelationsDetected')}
                    </Badge>
                  )}
                </VStack>

                {/* Frères et sœurs complets */}
                {siblingAnalysis.full.length > 0 && (
                  <VStack spacing={2}>
                    <Text fontSize="xs" color="blue.600" fontWeight="semibold">
                      {t('familyTree.fullSiblings')} ({siblingAnalysis.full.length})
                    </Text>
                    <HStack spacing={4} wrap="wrap" justify="center">
                      {siblingAnalysis.full.map(sibling => (
                        <VStack key={sibling.personID} spacing={1}>
                          {renderPersonCard(sibling, false, t('familyTree.sibling'))}
                          {isPersonInLoop(sibling.personID) && (
                            <Badge colorScheme="red" fontSize="xs">⚠️ {t('familyTree.loop')}</Badge>
                          )}
                        </VStack>
                      ))}
                    </HStack>
                  </VStack>
                )}

                {/* Demi-frères/sœurs paternels */}
                {siblingAnalysis.paternalHalf.length > 0 && (
                  <VStack spacing={2}>
                    <Text fontSize="xs" color="purple.600" fontWeight="semibold">
                      {t('familyTree.paternalHalfSiblings')} ({siblingAnalysis.paternalHalf.length})
                    </Text>
                    <HStack spacing={4} wrap="wrap" justify="center">
                      {siblingAnalysis.paternalHalf.map(sibling => (
                        <VStack key={sibling.personID} spacing={1}>
                          {renderPersonCard(sibling, false, t('familyTree.halfSiblingPaternal'))}
                          {isPersonInLoop(sibling.personID) && (
                            <Badge colorScheme="red" fontSize="xs">⚠️ {t('familyTree.loop')}</Badge>
                          )}
                        </VStack>
                      ))}
                    </HStack>
                  </VStack>
                )}

                {/* Demi-frères/sœurs maternels */}
                {siblingAnalysis.maternalHalf.length > 0 && (
                  <VStack spacing={2}>
                    <Text fontSize="xs" color="pink.600" fontWeight="semibold">
                      {t('familyTree.maternalHalfSiblings')} ({siblingAnalysis.maternalHalf.length})
                    </Text>
                    <HStack spacing={4} wrap="wrap" justify="center">
                      {siblingAnalysis.maternalHalf.map(sibling => (
                        <VStack key={sibling.personID} spacing={1}>
                          {renderPersonCard(sibling, false, t('familyTree.halfSiblingMaternal'))}
                          {isPersonInLoop(sibling.personID) && (
                            <Badge colorScheme="red" fontSize="xs">⚠️ {t('familyTree.loop')}</Badge>
                          )}
                        </VStack>
                      ))}
                    </HStack>
                  </VStack>
                )}

                {/* Frères/sœurs avec lien partiel (un seul parent connu) — affichés comme frères normaux */}
                {siblingAnalysis.partial.length > 0 && (
                  <VStack spacing={2}>
                    {siblingAnalysis.full.length === 0 && siblingAnalysis.paternalHalf.length === 0 && siblingAnalysis.maternalHalf.length === 0 ? (
                      <Text fontSize="xs" color="blue.600" fontWeight="semibold">
                        Frères/Sœurs ({siblingAnalysis.partial.length})
                      </Text>
                    ) : (
                      <Text fontSize="xs" color="gray.500" fontWeight="semibold">
                        Lien partiel ({siblingAnalysis.partial.length})
                      </Text>
                    )}
                    <HStack spacing={4} wrap="wrap" justify="center">
                      {siblingAnalysis.partial.map(sibling => (
                        <VStack key={sibling.personID} spacing={1}>
                          {renderPersonCard(sibling, false, t('familyTree.sibling'))}
                        </VStack>
                      ))}
                    </HStack>
                  </VStack>
                )}
              </VStack>
            </HStack>
          )}

          {/* Main row: unions paginées 2 à la fois + Focus centré */}
          {(() => {
            const unionGroups = getChildrenByUnion(focusPerson);
            // On reconstitue les unions triées (même ordre que getChildrenByUnion)
            // Chaque "union" = { spouse, children, unionInfo, unionDate, unionID }
            // On fusionne spouses sans enfants (conjoints sans enfants communs)
            const spousesByID = new Set(unionGroups.map(g => g.mother?.personID).filter(Boolean));
            const spousesWithoutChildren = spouses.filter(s => !spousesByID.has(s.personID));

            // Construire la liste complète des unions dans l'ordre
            type UnionSlot = {
              spouse: Person;
              children: Person[];
              unionInfo: any;
              unionNumber: number;
            };

            const allUnions: UnionSlot[] = [
              ...unionGroups.map((g, i) => ({
                spouse: g.mother!,
                children: g.children,
                unionInfo: g.unionInfo,
                unionNumber: i + 1,
              })).filter(u => u.spouse),
              ...spousesWithoutChildren.map((s, i) => ({
                spouse: s,
                children: [],
                unionInfo: getMarriageDetails(focusPerson.personID, s.personID),
                unionNumber: unionGroups.length + i + 1,
              })),
            ];

            const UNIONS_PER_PAGE = 2;
            const totalPages = allUnions.length > 0 ? Math.ceil(allUnions.length / UNIONS_PER_PAGE) : 0;
            const safePage = Math.min(unionPage, Math.max(0, totalPages - 1));
            const visibleUnions = allUnions.slice(safePage * UNIONS_PER_PAGE, safePage * UNIONS_PER_PAGE + UNIONS_PER_PAGE);

            return (
              <VStack spacing={4} w="full">
                {/* Pagination indicator */}
                {totalPages > 1 && (
                  <HStack spacing={3} justify="center">
                    <IconButton
                      aria-label="Unions précédentes"
                      icon={<ChevronLeftIcon />}
                      size="sm"
                      colorScheme="purple"
                      variant="outline"
                      isDisabled={safePage === 0}
                      onClick={() => setUnionPage(p => Math.max(0, p - 1))}
                    />
                    <Text fontSize="sm" color="gray.600" fontWeight="600">
                      Unions {safePage * UNIONS_PER_PAGE + 1}–{Math.min((safePage + 1) * UNIONS_PER_PAGE, allUnions.length)} / {allUnions.length}
                    </Text>
                    <IconButton
                      aria-label="Unions suivantes"
                      icon={<ChevronRightIcon />}
                      size="sm"
                      colorScheme="purple"
                      variant="outline"
                      isDisabled={safePage >= totalPages - 1}
                      onClick={() => setUnionPage(p => Math.min(totalPages - 1, p + 1))}
                    />
                  </HStack>
                )}

                <HStack spacing={6} align="start" justify="center" wrap="wrap">
                  {/* Unions gauche (conjoint(e)s de la page courante) */}
                  {visibleUnions.length > 0 && (
                    <VStack spacing={4} minW="180px">
                      <Text fontSize="sm" color="gray.500" fontWeight="600">
                        <ChevronLeftIcon /> {t('familyTree.spouses')} {totalPages > 1 ? `(${allUnions.length})` : `(${allUnions.length})`}
                      </Text>
                      {visibleUnions.map((u) => (
                        <VStack
                          key={u.spouse.personID}
                          spacing={2}
                          p={3}
                          bg={getGender(u.spouse) === 'F' ? 'pink.50' : 'blue.50'}
                          borderRadius="xl"
                          borderWidth="1px"
                          borderColor={getGender(u.spouse) === 'F' ? 'pink.200' : 'blue.200'}
                        >
                          <Badge colorScheme="purple" fontSize="xs">
                            {u.unionNumber === 1 ? '1ère union' : `${u.unionNumber}ème union`}
                          </Badge>
                          {renderPersonCard(u.spouse, false, t('familyTree.spouse'))}
                          <VStack spacing={1}>
                            {renderUnionIndicator(u.spouse, focusPerson)}
                            {u.children.length > 0 && (
                              <Badge colorScheme="green" fontSize="xs">
                                {u.children.length} enfant{u.children.length > 1 ? 's' : ''} ensemble
                              </Badge>
                            )}
                          </VStack>
                        </VStack>
                      ))}
                    </VStack>
                  )}

                  {/* Focus person — toujours centré */}
                  <VStack spacing={4} minW="180px">
                    <VStack spacing={1}>
                      <Text fontSize="sm" color="gray.500" fontWeight="600">● Focus</Text>
                      {detectedLoops.length > 0 && (
                        <Badge colorScheme="red" fontSize="xs">
                          🛡️ {detectedLoops.length} {detectedLoops.length > 1 ? t('familyTree.loopsDetected') : t('familyTree.loopDetected')}
                        </Badge>
                      )}
                    </VStack>
                    <VStack spacing={2}>
                      {renderPersonCard(focusPerson, true)}
                      {isPersonInLoop(focusPerson.personID) && (
                        <Badge colorScheme="red" fontSize="xs">
                          ⚠️ {t('familyTree.personInGenealogicalLoop')}
                        </Badge>
                      )}
                    </VStack>
                  </VStack>

                  {/* Enfants des unions visibles — groupés par union */}
                  {visibleUnions.some(u => u.children.length > 0) && (
                    <VStack spacing={4} minW="180px">
                      <Text fontSize="sm" color="gray.500" fontWeight="600">
                        <ChevronRightIcon /> {t('familyTree.children')} ({children.length})
                      </Text>
                      {visibleUnions.filter(u => u.children.length > 0).map((u) => (
                        <VStack key={u.spouse.personID} spacing={3} p={3} bg="gray.50" borderRadius="xl" borderWidth="1px">
                          <HStack spacing={2}>
                            <Badge colorScheme="purple" fontSize="xs">{u.unionNumber === 1 ? '1ère union' : `${u.unionNumber}ème union`}</Badge>
                            <Text fontSize="xs" fontWeight="bold" color="purple.600">
                              avec {u.spouse.firstName}
                            </Text>
                            {u.unionInfo && (
                              <Tooltip label={t('familyTree.clickForUnionDetails')} placement="top">
                                <Button size="xs" variant="ghost" colorScheme="purple"
                                  onClick={() => showUnionDetails(u.spouse, focusPerson)}>
                                  💍
                                </Button>
                              </Tooltip>
                            )}
                          </HStack>
                          <VStack spacing={2}>
                            {u.children.map((child, ci) => (
                              <VStack key={child.personID} spacing={1}>
                                <Badge
                                  colorScheme={child.birthday ? 'gray' : 'orange'}
                                  fontSize="xs"
                                  variant="outline"
                                  title={child.birthday ? undefined : 'Date de naissance inconnue — rang indéterminé'}
                                >
                                  {child.birthday
                                    ? `${ci + 1}${ci === 0 ? 'er' : 'ème'} enfant`
                                    : '? enfant'}
                                </Badge>
                                {renderPersonCard(child, false, t('familyTree.child'))}
                              </VStack>
                            ))}
                          </VStack>
                        </VStack>
                      ))}
                      {/* Enfants sans parent connu (fatherID ou motherID non renseigné) */}
                      {(() => {
                        const assignedChildren = new Set(visibleUnions.flatMap(u => u.children.map(c => c.personID)));
                        const unassigned = children.filter(c => !assignedChildren.has(c.personID));
                        if (unassigned.length === 0 || visibleUnions.length === 0) return null;
                        return (
                          <VStack spacing={2} p={3} bg="orange.50" borderRadius="xl" borderWidth="1px" borderColor="orange.200">
                            <Text fontSize="xs" fontWeight="bold" color="orange.600">Autres enfants</Text>
                            {unassigned.map(child => renderPersonCard(child, false, t('familyTree.child')))}
                          </VStack>
                        );
                      })()}
                    </VStack>
                  )}

                  {/* Pas de conjoint mais des enfants */}
                  {allUnions.length === 0 && children.length > 0 && (
                    <VStack spacing={4} minW="180px">
                      <Text fontSize="sm" color="gray.500" fontWeight="600">
                        <ChevronRightIcon /> {t('familyTree.children')} ({children.length})
                      </Text>
                      {[...children].sort((a, b) => {
                        const hasA = !!a.birthday;
                        const hasB = !!b.birthday;
                        if (hasA && hasB) return new Date(a.birthday!).getTime() - new Date(b.birthday!).getTime();
                        if (hasA) return -1;
                        if (hasB) return 1;
                        return a.personID - b.personID;
                      }).map((child, ci) => (
                        <VStack key={child.personID} spacing={1}>
                          <Badge
                            colorScheme={child.birthday ? 'gray' : 'orange'}
                            fontSize="xs"
                            variant="outline"
                            title={child.birthday ? undefined : 'Date de naissance inconnue — rang indéterminé'}
                          >
                            {child.birthday
                              ? `${ci + 1}${ci === 0 ? 'er' : 'ème'} enfant`
                              : '? enfant'}
                          </Badge>
                          {renderPersonCard(child, false, t('familyTree.child'))}
                        </VStack>
                      ))}
                    </VStack>
                  )}
                </HStack>
              </VStack>
            );
          })()}
        </Box>

        {/* Search Results */}
        {searchTerm && (
          <Box w="full" mt={8}>
            <VStack spacing={4}>
              <Text fontSize="lg" fontWeight="bold">
                🔍 {t('familyTree.searchResults')} "{searchTerm}"
              </Text>
              
              {searchResults.length === 0 ? (
                <Text color="gray.500">{t('familyTree.noPersonFound')}</Text>
              ) : (
                <>
                  <Text fontSize="sm" color="gray.600">
                    {searchResults.length} {searchResults.length > 1 ? t('familyTree.personsFoundPlural') : t('familyTree.personsFound')}. 
                    {t('familyTree.clickToFocus')}.
                  </Text>
                  
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={4}>
                    {searchResults.map(person => (
                      <Box 
                        key={person.personID}
                        onClick={() => handleSearchAndFocus(person)}
                        cursor="pointer"
                        transition="all 0.2s"
                        _hover={{ transform: 'scale(1.02)' }}
                      >
                        {renderPersonCard(person, false, t('familyTree.searchResult'))}
                      </Box>
                    ))}
                  </SimpleGrid>
                </>
              )}
            </VStack>
          </Box>
        )}

        {/* ── Panneau latéral personne ── */}
        <Drawer isOpen={isDrawerOpen} placement="right" onClose={onDrawerClose} size="md">
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            {drawerPerson && (() => {
              const p = drawerPerson;
              const g = getGender(p);
              const genderColor = g === 'M' ? '#3B82F6' : g === 'F' ? '#EC4899' : '#9CA3AF';
              const birthStr = getBirthDate(p);
              const age = calculateAge(p);
              const father = getFather(p);
              const mother = getMother(p);
              const spouseList = getSpouses(p);
              const childrenList = getChildren(p);
              return (
                <>
                  <DrawerHeader borderBottomWidth="0" pb={0}>
                    {/* Bandeau photo + nom */}
                    <VStack spacing={3} align="center" pt={2} pb={4}
                      bgGradient={`linear(to-b, ${g === 'M' ? 'blue.50' : g === 'F' ? 'pink.50' : 'gray.50'}, white)`}
                    >
                      <Avatar
                        src={p.photoUrl || undefined}
                        name={`${p.firstName} ${p.lastName}`}
                        size="2xl"
                        bg={g === 'M' ? 'blue.400' : g === 'F' ? 'pink.400' : 'gray.400'}
                        border="4px solid white"
                        boxShadow="lg"
                      />
                      <VStack spacing={0}>
                        <Text fontWeight="800" fontSize="xl" color="gray.800" textAlign="center">
                          {p.firstName} {p.lastName}
                        </Text>
                        {birthStr && (
                          <Text fontSize="sm" color="gray.500">
                            🎂 {new Date(birthStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            {age !== null && ` · ${age} ans`}
                          </Text>
                        )}
                        {p.deathDate && (
                          <Text fontSize="sm" color="gray.400">
                            ✝ {new Date(p.deathDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </Text>
                        )}
                      </VStack>
                    </VStack>
                  </DrawerHeader>

                  <DrawerBody pt={0}>
                    <VStack spacing={5} align="stretch">

                      {/* Actions */}
                      <HStack spacing={3}>
                        <Button
                          flex="1" size="sm" colorScheme="purple" variant="solid"
                          onClick={() => { onDrawerClose(); navigateToFocus(p.personID); }}
                        >
                          Centrer l'arbre
                        </Button>
                        <Button
                          flex="1" size="sm" colorScheme="gray" variant="outline"
                          onClick={() => navigate(`/person/${p.personID}`)}
                        >
                          Profil complet →
                        </Button>
                      </HStack>

                      <Divider />

                      {/* Famille proche */}
                      <Box>
                        <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb={2}>
                          Famille proche
                        </Text>
                        <VStack spacing={1} align="stretch">
                          {father && (
                            <HStack justify="space-between" py={1}>
                              <Text fontSize="sm" color="gray.500">Père</Text>
                              <Text
                                fontSize="sm" fontWeight="600" color="blue.600" cursor="pointer"
                                _hover={{ textDecoration: 'underline' }}
                                onClick={() => openDrawer(father)}
                              >
                                {father.firstName} {father.lastName}
                              </Text>
                            </HStack>
                          )}
                          {mother && (
                            <HStack justify="space-between" py={1}>
                              <Text fontSize="sm" color="gray.500">Mère</Text>
                              <Text
                                fontSize="sm" fontWeight="600" color="pink.600" cursor="pointer"
                                _hover={{ textDecoration: 'underline' }}
                                onClick={() => openDrawer(mother)}
                              >
                                {mother.firstName} {mother.lastName}
                              </Text>
                            </HStack>
                          )}
                          {spouseList.length > 0 && (
                            <HStack justify="space-between" py={1} align="start">
                              <Text fontSize="sm" color="gray.500">
                                {spouseList.length > 1 ? 'Conjoints' : 'Conjoint(e)'}
                              </Text>
                              <VStack spacing={0} align="end">
                                {spouseList.map(s => (
                                  <Text
                                    key={s.personID}
                                    fontSize="sm" fontWeight="600"
                                    color={getGender(s) === 'M' ? 'blue.600' : 'pink.600'}
                                    cursor="pointer"
                                    _hover={{ textDecoration: 'underline' }}
                                    onClick={() => openDrawer(s)}
                                  >
                                    {s.firstName} {s.lastName}
                                  </Text>
                                ))}
                              </VStack>
                            </HStack>
                          )}
                          {childrenList.length > 0 && (
                            <HStack justify="space-between" py={1}>
                              <Text fontSize="sm" color="gray.500">Enfants</Text>
                              <Badge colorScheme="green" fontSize="sm">{childrenList.length}</Badge>
                            </HStack>
                          )}
                        </VStack>
                      </Box>

                      {/* Notes / biographie */}
                      {p.notes && (
                        <>
                          <Divider />
                          <Box>
                            <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb={2}>
                              Notes
                            </Text>
                            <Text fontSize="sm" color="gray.700" whiteSpace="pre-wrap">{p.notes}</Text>
                          </Box>
                        </>
                      )}

                      {/* Photos de l'album */}
                      <Divider />
                      <Box>
                        <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb={2}>
                          Photos
                        </Text>
                        {drawerPhotosLoading ? (
                          <HStack justify="center" py={4}><Spinner size="sm" color="purple.400" /></HStack>
                        ) : drawerPhotos.length === 0 ? (
                          <Text fontSize="sm" color="gray.400" textAlign="center" py={2}>Aucune photo dans les albums</Text>
                        ) : (
                          <Wrap spacing={2}>
                            {drawerPhotos.slice(0, 12).map(photo => (
                              <WrapItem key={photo.photoID}>
                                <Image
                                  src={photo.thumbnailUrl || photo.url}
                                  alt={photo.title || ''}
                                  w="80px" h="80px"
                                  objectFit="cover"
                                  borderRadius="lg"
                                  cursor="pointer"
                                  onClick={() => navigate(`/albums/${photo.albumID}`)}
                                  _hover={{ opacity: 0.85 }}
                                />
                              </WrapItem>
                            ))}
                          </Wrap>
                        )}
                      </Box>

                    </VStack>
                  </DrawerBody>
                </>
              );
            })()}
          </DrawerContent>
        </Drawer>

        {/* Union Details Modal */}
        <Modal isOpen={isUnionModalOpen} onClose={onUnionModalClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{t('familyTree.unionDetails')}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {selectedUnion ? (
                <VStack spacing={4} align="stretch">
                  {selectedUnion.marriageID === 0 && (
                    <Box bg="yellow.50" p={3} borderRadius="md" border="1px solid" borderColor="yellow.200">
                      <Text fontSize="sm" color="yellow.800" fontWeight="semibold">
                        {t('familyTree.estimatedInformation')}
                      </Text>
                    </Box>
                  )}
                  
                  <Box>
                    <Text fontWeight="bold">{t('familyTree.marriageDate')}</Text>
                    <Text>{selectedUnion.marriageDate ? 
                      new Date(selectedUnion.marriageDate).toLocaleDateString('fr-FR') + 
                      (selectedUnion.marriageID === 0 ? ` ${t('familyTree.estimated')}` : '') : 
                      t('familyTree.notSpecified')
                    }</Text>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="bold">{t('familyTree.marriagePlace')}</Text>
                    <Text>{selectedUnion.marriagePlace || t('familyTree.notSpecified')}</Text>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="bold">{t('familyTree.statusLabel')}</Text>
                    <Badge colorScheme={selectedUnion.status === 'active' ? 'green' : 'red'}>
                      {selectedUnion.status === 'active' ? t('familyTree.married') : t('familyTree.divorced')}
                    </Badge>
                  </Box>
                  
                  {selectedUnion.divorceDate && (
                    <Box>
                      <Text fontWeight="bold">{t('familyTree.divorceDate')}:</Text>
                      <Text>{new Date(selectedUnion.divorceDate).toLocaleDateString('fr-FR')}</Text>
                    </Box>
                  )}
                </VStack>
              ) : (
                <Text>{t('familyTree.noDataAvailable')}</Text>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Stats Modal */}
        <Modal isOpen={isStatsModalOpen} onClose={onStatsModalClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{t('familyTree.detailedFamilyStatistics')}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <SimpleGrid columns={2} spacing={6}>
                <Stat>
                  <StatLabel>{t('familyTree.totalPersons')}</StatLabel>
                  <StatNumber>{stats.totalPersons}</StatNumber>
                </Stat>
                
                <Stat>
                  <StatLabel>{t('familyTree.totalMarriages')}</StatLabel>
                  <StatNumber>{stats.totalMarriages}</StatNumber>
                </Stat>
                
                <Stat>
                  <StatLabel>{t('familyTree.polygamousPersons')}</StatLabel>
                  <StatNumber>{stats.polygamousPersons}</StatNumber>
                </Stat>
                
                <Stat>
                  <StatLabel>{t('familyTree.numberOfGenerations')}</StatLabel>
                  <StatNumber>{stats.generations}</StatNumber>
                </Stat>
              </SimpleGrid>
              
              <Divider my={6} />
              
              <VStack spacing={4} align="stretch">
                <Text fontWeight="bold" fontSize="lg">{t('familyTree.genealogicalAnalysis')}</Text>
                
                <Box>
                  <Text fontWeight="semibold">{t('familyTree.polygamyRate')}</Text>
                  <Text>{((stats.polygamousPersons / stats.totalPersons) * 100).toFixed(1)}%</Text>
                </Box>
                
                <Box>
                  <Text fontWeight="semibold">{t('familyTree.averageMarriagesPerPerson')}</Text>
                  <Text>{stats.totalPersons > 0 ? (stats.totalMarriages * 2 / stats.totalPersons).toFixed(1) : 0}</Text>
                </Box>
                
                <Box>
                  <Text fontWeight="semibold">{t('familyTree.genealogicalDepth')}</Text>
                  <Text>{stats.generations} {t('familyTree.generationLevels')}</Text>
                </Box>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>

      {/* Floating Toolbar */}
      <FamilyTreeToolbar
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onExport={handleExport}
        treeRef={treeRef}
      />

      {/* Minimap toggle button */}
      {!showMinimap && (
        <Tooltip label="Vue d'ensemble" placement="right">
          <IconButton
            aria-label="Ouvrir la minimap"
            icon={<FaMap />}
            size="md"
            colorScheme="purple"
            variant="outline"
            bg="white"
            position="fixed"
            bottom="20px"
            left="20px"
            zIndex={1000}
            boxShadow="0 4px 12px rgba(139,92,246,0.15)"
            onClick={() => setShowMinimap(true)}
          />
        </Tooltip>
      )}

      {/* Minimap panel */}
      {showMinimap && (
        <Box
          position="fixed"
          bottom="20px"
          left="20px"
          zIndex={1000}
          bg="white"
          borderRadius="xl"
          border="1px solid"
          borderColor="purple.200"
          boxShadow="0 4px 20px rgba(139,92,246,0.2)"
          p={3}
          w="300px"
          maxH="280px"
          display="flex"
          flexDirection="column"
        >
          <HStack justify="space-between" mb={2}>
            <Text fontSize="xs" fontWeight="700" color="purple.700">
              🗺️ Vue d'ensemble ({persons.length})
            </Text>
            <IconButton
              aria-label="Fermer"
              icon={<CloseIcon />}
              size="xs"
              variant="ghost"
              colorScheme="gray"
              onClick={() => setShowMinimap(false)}
            />
          </HStack>
          <Box overflowY="auto" flex="1">
            <Box display="flex" flexWrap="wrap" gap="6px">
              {persons.map(p => {
                const g = getGender(p);
                const isFocus = p.personID === focusPersonID;
                const isMe = p.personID === myPersonID;
                return (
                  <Tooltip key={p.personID} label={`${p.firstName} ${p.lastName}`} placement="top" hasArrow>
                    <Box
                      w="54px"
                      cursor="pointer"
                      onClick={() => navigateToFocus(p.personID)}
                      borderRadius="lg"
                      border="2px solid"
                      borderColor={isFocus ? 'purple.500' : isMe ? 'green.400' : g === 'M' ? 'blue.200' : g === 'F' ? 'pink.200' : 'gray.200'}
                      bg={isFocus ? 'purple.50' : isMe ? 'green.50' : 'white'}
                      boxShadow={isFocus ? '0 0 0 2px rgba(159,122,234,0.4)' : 'none'}
                      p={1}
                      textAlign="center"
                      transition="all 0.15s"
                      _hover={{ transform: 'scale(1.1)', zIndex: 1 }}
                    >
                      <Avatar
                        size="xs"
                        name={`${p.firstName} ${p.lastName}`}
                        src={p.photoUrl || undefined}
                        bg={g === 'M' ? 'blue.400' : g === 'F' ? 'pink.400' : 'gray.400'}
                      />
                      <Text fontSize="2xs" noOfLines={1} color="gray.700" lineHeight="1.3" mt="1px">
                        {p.firstName}
                      </Text>
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>
          </Box>
        </Box>
      )}
    </Container>
    </Box>
  );
};

export default FamilyTreeEnhanced;
