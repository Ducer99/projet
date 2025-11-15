import React, { useState, useEffect } from 'react';
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
  useColorModeValue,
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
} from '@chakra-ui/react';
import { 
  SearchIcon, 
  ChevronUpIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ArrowBackIcon,
  ArrowForwardIcon,
  InfoIcon,
  ViewIcon
} from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

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
  gender?: 'M' | 'F' | 'male' | 'female'; // Ajout du genre
  sex?: 'M' | 'F'; // Ajout de la propriété sex de l'API
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
  
  // States
  const [persons, setPersons] = useState<Person[]>([]);
  const [marriages, setMarriages] = useState<Marriage[]>([]);
  const [focusPersonID, setFocusPersonID] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSiblings, setShowSiblings] = useState(false);
  const [loopDetectionEnabled] = useState(true);
  const [detectedLoops, setDetectedLoops] = useState<number[][]>([]);
  const [navigationHistory, setNavigationHistory] = useState<NavigationHistory[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [stats, setStats] = useState({
    totalPersons: 0,
    totalMarriages: 0,
    polygamousPersons: 0,
    generations: 0
  });
  
  const { isOpen: isUnionModalOpen, onOpen: onUnionModalOpen, onClose: onUnionModalClose } = useDisclosure();
  const { isOpen: isStatsModalOpen, onOpen: onStatsModalOpen, onClose: onStatsModalClose } = useDisclosure();
  const [selectedUnion, setSelectedUnion] = useState<Marriage | null>(null);
  
  // Colors with gender distinction and clean up unused variables
  
  // Gender-specific colors
  const getGenderColors = (gender: 'M' | 'F' | 'unknown', isMainFocus: boolean = false) => {
    const colors = useColorModeValue(
      {
        // Light mode colors
        male: {
          bg: isMainFocus ? 'blue.50' : 'blue.50',
          border: isMainFocus ? 'blue.500' : 'blue.300',
          accent: 'blue.600',
          avatarBg: '4299e1'
        },
        female: {
          bg: isMainFocus ? 'pink.50' : 'pink.50', 
          border: isMainFocus ? 'pink.500' : 'pink.300',
          accent: 'pink.600',
          avatarBg: 'ed64a6'
        },
        unknown: {
          bg: isMainFocus ? 'gray.50' : 'white',
          border: isMainFocus ? 'gray.500' : 'gray.300',
          accent: 'gray.600',
          avatarBg: '718096'
        }
      },
      {
        // Dark mode colors
        male: {
          bg: isMainFocus ? 'blue.900' : 'blue.800',
          border: isMainFocus ? 'blue.300' : 'blue.500',
          accent: 'blue.300',
          avatarBg: '4299e1'
        },
        female: {
          bg: isMainFocus ? 'pink.900' : 'pink.800',
          border: isMainFocus ? 'pink.300' : 'pink.500', 
          accent: 'pink.300',
          avatarBg: 'ed64a6'
        },
        unknown: {
          bg: isMainFocus ? 'gray.900' : 'gray.800',
          border: isMainFocus ? 'gray.300' : 'gray.500',
          accent: 'gray.300',
          avatarBg: '718096'
        }
      }
    );
    
    switch(gender) {
      case 'M': return colors.male;
      case 'F': return colors.female; 
      default: return colors.unknown;
    }
  };

  // Load data
  useEffect(() => {
    fetchPersons();
    fetchMarriages();
  }, []);

  // Calculate stats whenever data changes
  useEffect(() => {
    calculateStats();
  }, [persons, marriages]);

  const fetchPersons = async () => {
    try {
      const response = await api.get('/persons');
      const personsData = response.data || [];
      
      setPersons(personsData);
      
      console.log('Persons loaded:', personsData);
      
      // Définir automatiquement le premier focus sur la première personne disponible
      // Mais pas sur l'utilisateur connecté, plutôt sur Ruben ou la première personne logique
      if (personsData.length > 0 && focusPersonID === null) {
        // Chercher Ruben en priorité
        const ruben = personsData.find((p: Person) => 
          p.firstName?.toLowerCase().includes('ruben') || 
          p.lastName?.toLowerCase().includes('kamo')
        );
        
        // Sinon, chercher une personne sans parents (racine de l'arbre)
        const rootPerson = personsData.find((p: Person) => !p.fatherID && !p.motherID);
        
        // Sinon, prendre la première personne
        const targetPerson = ruben || rootPerson || personsData[0];
        
        setFocusPersonID(targetPerson.personID);
        console.log('Auto-focus set to:', targetPerson);
      }
    } catch (error) {
      console.error('Error fetching persons:', error);
    }
  };

  const fetchMarriages = async () => {
    // Pour l'instant, nous détectons les unions via les enfants communs
    // L'API des mariages sera intégrée plus tard
    setMarriages([]);
  };

  // Navigation functions
  const navigateToFocus = (personID: number) => {
    const person = persons.find(p => p.personID === personID);
    if (!person) return;

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

    setStats({
      totalPersons,
      totalMarriages,
      polygamousPersons,
      generations: maxGeneration + 1
    });

    // 🛡️ Détection automatique des boucles lors du calcul des stats
    if (loopDetectionEnabled) {
      detectGenealogicalLoops();
    }

    console.log(`📊 Stats corrigées: ${totalPersons} personnes, ${totalMarriages} unions, ${polygamousPersons} polygames`);
    
    // 🔍 DEBUG DÉTAILLÉ DES MÉTRIQUES
    if (polygamousPersons > 0) {
      polygamousCount.forEach((spouseSet, personID) => {
        const person = persons.find(p => p.personID === personID);
        console.log(`🔄 Polygame détecté: ${person?.firstName} ${person?.lastName} avec ${spouseSet.size} conjoints`);
      });
    }
  };

  // 🛡️ ALGORITHME DE DÉTECTION DE BOUCLES GÉNÉALOGIQUES
  const detectGenealogicalLoops = () => {
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
      console.warn("🛡️ Boucles généalogiques détectées:", loops);
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
    
    const fullSiblings = allSiblings.filter(s => 
      s.fatherID === person.fatherID && 
      s.motherID === person.motherID &&
      s.fatherID && s.motherID
    );
    
    const paternalHalfSiblings = allSiblings.filter(s => 
      person.fatherID && s.fatherID === person.fatherID && 
      s.motherID !== person.motherID
    );
    
    const maternalHalfSiblings = allSiblings.filter(s => 
      person.motherID && s.motherID === person.motherID && 
      s.fatherID !== person.fatherID
    );
    
    return {
      all: allSiblings,
      full: fullSiblings,
      paternalHalf: paternalHalfSiblings,
      maternalHalf: maternalHalfSiblings,
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
      console.warn(`⚠️ Incohérence de dates pour ${person.firstName} ${person.lastName}: décès avant naissance`);
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

  // Group children by mother/union
  const getChildrenByUnion = (person: Person) => {
    const children = getChildren(person);
    const childrenByUnion = new Map<number | string, {
      mother: Person | null;
      children: Person[];
      unionInfo: any;
    }>();
    
    children.forEach(child => {
      let motherID: number | string = 'unknown';
      let mother: Person | null = null;
      
      if (child.fatherID === person.personID && child.motherID) {
        motherID = child.motherID;
        mother = persons.find(p => p.personID === child.motherID) || null;
      } else if (child.motherID === person.personID && child.fatherID) {
        motherID = child.fatherID;
        mother = persons.find(p => p.personID === child.fatherID) || null;
      }
      
      if (!childrenByUnion.has(motherID)) {
        childrenByUnion.set(motherID, {
          mother,
          children: [],
          unionInfo: mother ? getMarriageDetails(person.personID, mother.personID) : null
        });
      }
      
      childrenByUnion.get(motherID)!.children.push(child);
    });
    
    return Array.from(childrenByUnion.values());
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

  // Render person card
  const renderPersonCard = (person: Person, isMainFocus = false, relationship = '') => {
    const age = calculateAge(person);
    const birthDateStr = getBirthDate(person);
    const dateValidation = validatePersonDates(birthDateStr, person.deathDate);
    const gender = getGender(person);
    const colors = getGenderColors(gender, isMainFocus);
    
    return (
      <Card
        key={person.personID}
        bg={colors.bg}
        borderColor={colors.border}
        borderWidth={isMainFocus ? "3px" : "2px"}
        cursor="pointer"
        onClick={() => !isMainFocus && navigateToFocus(person.personID)}
        transition="all 0.2s"
        _hover={{ transform: 'scale(1.02)', shadow: 'md' }}
        minW="200px"
        maxW="250px"
      >
        <CardBody p={3}>
          <VStack spacing={2}>
            {/* 📸 PHOTO DE PROFIL AVEC COULEUR DE GENRE */}
            <Avatar 
              src={person.photoUrl || `https://ui-avatars.com/api/?name=${person.firstName}+${person.lastName}&background=${colors.avatarBg}&color=white&size=128`}
              name={`${person.firstName} ${person.lastName}`}
              size="lg"
              showBorder
              borderColor={colors.border}
              borderWidth="3px"
            />
            
            <VStack spacing={1}>
              {/* 🎨 NOM AVEC ICÔNE DE GENRE COLORÉE */}
              <HStack spacing={1}>
                {gender === 'M' && <Text color={colors.accent} fontWeight="bold" fontSize="lg">♂</Text>}
                {gender === 'F' && <Text color={colors.accent} fontWeight="bold" fontSize="lg">♀</Text>}
                <Text fontWeight="bold" fontSize="sm" textAlign="center">
                  {person.firstName} {person.lastName}
                </Text>
                {gender === 'M' && <Text color={colors.accent} fontWeight="bold" fontSize="lg">♂</Text>}
                {gender === 'F' && <Text color={colors.accent} fontWeight="bold" fontSize="lg">♀</Text>}
              </HStack>
              
              {/* 🎯 ÂGE ET STATUT VITAL AMÉLIORÉ */}
              {age !== null ? (
                <Text fontSize="xs" color="gray.500">
                  {person.isDeceased || person.deathDate ? 
                    `${t('familyTree.deceasedAtAge')} ${age} ${t('familyTree.years')}` : 
                    `${age} ${t('familyTree.years')}`
                  }
                </Text>
              ) : (
                birthDateStr ? (
                  <Text fontSize="xs" color="red.500">
                    {t('familyTree.ageInconsistentDates')}
                  </Text>
                ) : (
                  <Text fontSize="xs" color="gray.400" fontStyle="italic">
                    {t('familyTree.unknownBirthDate')}
                  </Text>
                )
              )}
              
              {/* 📅 DATES DE VIE */}
              {birthDateStr && (
                <Text fontSize="xs" color="gray.500">
                  {new Date(birthDateStr).getFullYear()}
                  {person.deathDate && ` - ${new Date(person.deathDate).getFullYear()}`}
                  {!dateValidation.isValid && (
                    <Text fontSize="xs" color="red.500" mt={1}>
                      ⚠️ {t('familyTree.inconsistentDates')}
                    </Text>
                  )}
                </Text>
              )}
              
              {/* 🏷️ BADGES DE RÔLE STANDARDISÉS */}
              <VStack spacing={1}>
                {/* Badge de genre */}
                {gender !== 'unknown' && (
                  <Badge 
                    colorScheme={gender === 'M' ? 'blue' : 'pink'} 
                    fontSize="10px"
                    variant="solid"
                  >
                    {gender === 'M' ? `♂ ${t('familyTree.male')}` : `♀ ${t('familyTree.female')}`}
                  </Badge>
                )}
                
                {/* Badge de décès */}
                {(person.isDeceased || person.deathDate) && (
                  <Badge colorScheme="gray" fontSize="10px">
                    ✝️ {t('familyTree.deceased')}
                  </Badge>
                )}
                
                {/* Badge de relation */}
                {relationship && (
                  <Badge 
                    colorScheme={relationship.includes('Demi') ? 'orange' : 'blue'} 
                    fontSize="10px"
                  >
                    {relationship.toUpperCase()}
                  </Badge>
                )}
                
                {/* Badge de focus */}
                {isMainFocus && (
                  <Badge colorScheme="green" fontSize="10px">
                    🎯 {t('familyTree.focus')}
                  </Badge>
                )}
                
                {/* Badge de boucle */}
                {isPersonInLoop(person.personID) && (
                  <Badge colorScheme="red" fontSize="10px">
                    ⚠️ {t('familyTree.loop')}
                  </Badge>
                )}
              </VStack>
            </VStack>
          </VStack>
        </CardBody>
      </Card>
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

  console.log('Current focus person:', focusPerson);

  const father = getFather(focusPerson);
  const mother = getMother(focusPerson);
  const spouses = getSpouses(focusPerson);
  const children = getChildren(focusPerson);
  const siblings = getSiblings(focusPerson);
  const siblingAnalysis = getFullSiblingsAnalysis(focusPerson);

  // 🛡️ Détection et affichage des boucles si présentes
  const isPersonInLoop = (personID: number) => {
    return detectedLoops.some(loop => loop.includes(personID));
  };

  return (
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
            <HStack>
              <SearchIcon />
              <Input
                placeholder={t('familyTree.searchPerson')}
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

        {/* Family tree layout */}
        <Box w="full" position="relative">
          {/* Parents row */}
          {(father || mother) && (
            <HStack justify="center" spacing={8} mb={6}>
              <VStack>
                <Text fontSize="sm" color="gray.500" mb={2}>
                  <ChevronUpIcon /> {t('familyTree.parents')}
                </Text>
                <HStack spacing={6}>
                  {father && renderPersonCard(father, false, t('familyTree.father'))}
                  {mother && renderPersonCard(mother, false, t('familyTree.mother'))}
                </HStack>
              </VStack>
            </HStack>
          )}

          {/* Siblings row (if enabled) - ENHANCED */}
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
              </VStack>
            </HStack>
          )}

          {/* Main row: Spouses + Focus + Children */}
          <HStack spacing={8} align="start" justify="center" wrap="wrap">
            {/* Spouses column with enhanced union display */}
            {spouses.length > 0 && (
              <VStack spacing={4}>
                <Text fontSize="sm" color="gray.500">
                  <ChevronLeftIcon /> {t('familyTree.spouses')} ({spouses.length})
                </Text>
                <VStack spacing={4}>
                  {spouses.map((spouse, index) => {
                    const unionChildren = getChildrenByUnion(focusPerson)
                      .find(union => union.mother?.personID === spouse.personID)?.children || [];
                    
                    return (
                      <VStack key={spouse.personID} spacing={2} p={3} 
                        bg={getGender(spouse) === 'M' ? 'blue.25' : getGender(spouse) === 'F' ? 'pink.25' : 'gray.25'} 
                        borderRadius="md" 
                        borderWidth="1px"
                        borderColor={getGender(spouse) === 'M' ? 'blue.200' : getGender(spouse) === 'F' ? 'pink.200' : 'gray.200'}
                      >
                        {/* Spouse card */}
                        <VStack spacing={2}>
                          {renderPersonCard(spouse, false, `${t('familyTree.spouse')} ${index + 1}`)}
                          
                          {/* Union details */}
                          <VStack spacing={1}>
                            {renderUnionIndicator(spouse, focusPerson)}
                            
                            {/* Children count for this union */}
                            {unionChildren.length > 0 && (
                              <Badge colorScheme="green" fontSize="xs">
                                {unionChildren.length} {t('familyTree.childTogether')}
                              </Badge>
                            )}
                            
                            {/* Quick access to children of this union */}
                            {unionChildren.length > 0 && (
                              <Button
                                size="xs"
                                variant="outline"
                                colorScheme="green"
                                onClick={() => {
                                  // Focus sur le premier enfant de cette union
                                  navigateToFocus(unionChildren[0].personID);
                                }}
                              >
                                👶 {t('familyTree.viewChildren')} ({unionChildren.length})
                              </Button>
                            )}
                          </VStack>
                        </VStack>
                      </VStack>
                    );
                  })}
                </VStack>
              </VStack>
            )}

            {/* Focus person */}
            <VStack spacing={4}>
              <VStack spacing={1}>
                <Text fontSize="sm" color="gray.500">
                  ● Focus
                </Text>
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

            {/* Children column with union grouping */}
            {children.length > 0 && (
              <VStack spacing={4}>
                <Text fontSize="sm" color="gray.500">
                  <ChevronRightIcon /> {t('familyTree.children')} ({children.length})
                </Text>
                
                {/* Group children by union/mother */}
                <VStack spacing={4}>
                  {getChildrenByUnion(focusPerson).map((unionGroup, unionIndex) => (
                    <VStack key={unionIndex} spacing={3} p={3} bg="gray.50" borderRadius="md" borderWidth="1px">
                      {/* Union header with mother info */}
                      {unionGroup.mother && (
                        <VStack spacing={1}>
                          <Text fontSize="xs" fontWeight="bold" color="purple.600">
                            {t('familyTree.unionWith')} {unionGroup.mother.firstName} {unionGroup.mother.lastName}
                          </Text>
                          {unionGroup.unionInfo && (
                            <Tooltip label={t('familyTree.clickForUnionDetails')} placement="top">
                              <Button
                                size="xs"
                                variant="outline"
                                colorScheme="purple"
                                onClick={() => showUnionDetails(unionGroup.mother!, focusPerson)}
                              >
                                💍 {t('familyTree.unionDetails')}
                              </Button>
                            </Tooltip>
                          )}
                        </VStack>
                      )}
                      
                      {/* Children of this union */}
                      <VStack spacing={2}>
                        {unionGroup.children.map(child => {
                          const relationInfo = getChildRelationInfo(child, focusPerson);
                          return (
                            <VStack key={child.personID} spacing={1}>
                              {renderPersonCard(child, false, t('familyTree.child'))}
                              
                              {/* Mother badge */}
                              {relationInfo.motherInfo && (
                                <Badge colorScheme="pink" fontSize="xs">
                                  {t('familyTree.motherLabel')} {relationInfo.motherInfo}
                                </Badge>
                              )}
                              
                              {/* Half-sibling badge */}
                              {relationInfo.relationType === 'half' && (
                                <Badge colorScheme="orange" fontSize="xs">
                                  {t('familyTree.halfSibling')}
                                </Badge>
                              )}
                            </VStack>
                          );
                        })}
                      </VStack>
                    </VStack>
                  ))}
                </VStack>
              </VStack>
            )}
          </HStack>
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
    </Container>
  );
};

export default FamilyTreeEnhanced;
