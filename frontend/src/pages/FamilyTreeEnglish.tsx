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
import api from '../services/api';
import { t } from '../utils/translations';

// Types
interface Person {
  personID: number;
  firstName: string;
  lastName: string;
  birthDate?: string;
  deathDate?: string;
  fatherID?: number;
  motherID?: number;
  photoUrl?: string;
  isDeceased?: boolean;
  gender?: 'M' | 'F' | 'male' | 'female';
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

const FamilyTreeEnglish: React.FC = () => {
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
  
  // Language setting
  const language = 'en'; // English version
  
  // Colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const focusCardBg = useColorModeValue('blue.50', 'blue.900');
  const focusBorder = useColorModeValue('blue.500', 'blue.300');

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
      
      // Auto-set focus on first logical person
      if (personsData.length > 0 && focusPersonID === null) {
        // Look for Ruben first
        const ruben = personsData.find((p: Person) => 
          p.firstName?.toLowerCase().includes('ruben') || 
          p.lastName?.toLowerCase().includes('kamo')
        );
        
        // Otherwise, look for root person (no parents)
        const rootPerson = personsData.find((p: Person) => !p.fatherID && !p.motherID);
        
        // Otherwise, take first person
        const targetPerson = ruben || rootPerson || personsData[0];
        
        setFocusPersonID(targetPerson.personID);
        console.log('Auto-focus set to:', targetPerson);
      }
    } catch (error) {
      console.error('Error fetching persons:', error);
    }
  };

  const fetchMarriages = async () => {
    // For now, we detect unions via common children
    // Marriage API will be integrated later
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
    
    // 🔧 CORRECTED POLYGAMY BUG - Calculate based on children with different partners
    const polygamousCount = new Map<number, Set<number>>();
    persons.forEach(person => {
      const spouses = getSpouses(person);
      if (spouses.length > 1) {
        polygamousCount.set(person.personID, new Set(spouses.map(s => s.personID)));
      }
    });
    
    const polygamousPersons = polygamousCount.size;
    
    // 🔧 CORRECTED UNIONS BUG - Count real unions (integer)
    const uniqueUnions = new Set<string>();
    persons.forEach(person => {
      const spouses = getSpouses(person);
      spouses.forEach(spouse => {
        // Create unique key for each union (sorted IDs to avoid duplicates)
        const unionKey = [person.personID, spouse.personID].sort().join('-');
        uniqueUnions.add(unionKey);
      });
    });
    
    const totalMarriages = uniqueUnions.size; // Integer, no division by 2
    
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

    // 🛡️ Automatic loop detection during stats calculation
    if (loopDetectionEnabled) {
      detectGenealogicalLoops();
    }

    console.log(`📊 Corrected stats: ${totalPersons} persons, ${totalMarriages} unions, ${polygamousPersons} polygamous`);
    
    // 🔍 DETAILED METRICS DEBUG
    if (polygamousPersons > 0) {
      polygamousCount.forEach((spouseSet, personID) => {
        const person = persons.find(p => p.personID === personID);
        console.log(`🔄 Polygamous detected: ${person?.firstName} ${person?.lastName} with ${spouseSet.size} spouses`);
      });
    }
  };

  // 🛡️ GENEALOGICAL LOOP DETECTION ALGORITHM
  const detectGenealogicalLoops = () => {
    const loops: number[][] = [];
    const visitedGlobal = new Set<number>();
    
    const dfsDetectLoop = (startID: number): number[] | null => {
      const visited = new Set<number>();
      const path: number[] = [];
      
      const dfs = (personID: number): number[] | null => {
        if (visited.has(personID)) {
          // Loop detected - return loop path
          const loopStartIndex = path.indexOf(personID);
          return path.slice(loopStartIndex);
        }
        
        if (visitedGlobal.has(personID)) return null;
        
        visited.add(personID);
        path.push(personID);
        
        const person = persons.find(p => p.personID === personID);
        if (person) {
          // Check parental relationships
          if (person.fatherID) {
            const loop = dfs(person.fatherID);
            if (loop) return loop;
          }
          if (person.motherID) {
            const loop = dfs(person.motherID);
            if (loop) return loop;
          }
          
          // Check children
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
    
    // Test each person as starting point
    for (const person of persons) {
      if (!visitedGlobal.has(person.personID)) {
        const loop = dfsDetectLoop(person.personID);
        if (loop && loop.length > 2) { // Ignore trivial loops
          loops.push(loop);
          // Mark all persons in this loop as visited
          loop.forEach(id => visitedGlobal.add(id));
        }
      }
    }
    
    setDetectedLoops(loops);
    
    if (loops.length > 0) {
      console.warn("🛡️ Genealogical loops detected:", loops);
    }
    
    return loops;
  };

  // 🎨 GENDER DETECTION FUNCTION
  const getPersonGender = (person: Person): 'M' | 'F' | 'unknown' => {
    // If gender is explicitly defined
    if (person.gender) {
      return person.gender === 'male' || person.gender === 'M' ? 'M' : 'F';
    }
    
    // Deduction based on family role
    // If they're a father in a relationship
    const isAFather = persons.some(p => p.fatherID === person.personID);
    if (isAFather) return 'M';
    
    // If they're a mother in a relationship
    const isAMother = persons.some(p => p.motherID === person.personID);
    if (isAMother) return 'F';
    
    // Deduction based on name (approximation)
    const femaleNames = ['marie', 'anna', 'sarah', 'gisele', 'gisèle', 'rebecca', 'elizabeth', 'catherine'];
    const maleNames = ['jean', 'pierre', 'paul', 'ruben', 'richard', 'michel', 'david', 'daniel'];
    
    const firstName = person.firstName.toLowerCase();
    if (femaleNames.some(name => firstName.includes(name))) return 'F';
    if (maleNames.some(name => firstName.includes(name))) return 'M';
    
    return 'unknown';
  };

  // 🎨 GENDER COLORS
  const getGenderColors = (person: Person, isMainFocus: boolean = false) => {
    const gender = getPersonGender(person);
    
    if (isMainFocus) {
      return {
        bg: focusCardBg,
        border: focusBorder,
        avatarBorder: focusBorder
      };
    }
    
    switch (gender) {
      case 'M':
        return {
          bg: useColorModeValue('blue.50', 'blue.900'),
          border: useColorModeValue('blue.200', 'blue.600'),
          avatarBorder: useColorModeValue('blue.400', 'blue.300')
        };
      case 'F':
        return {
          bg: useColorModeValue('pink.50', 'pink.900'),
          border: useColorModeValue('pink.200', 'pink.600'),
          avatarBorder: useColorModeValue('pink.400', 'pink.300')
        };
      default:
        return {
          bg: cardBg,
          border: borderColor,
          avatarBorder: useColorModeValue('gray.300', 'gray.600')
        };
    }
  };

  // Calculate age with enhanced date validation
  const calculateAge = (person: Person) => {
    if (!person.birthDate) return null;
    
    const birth = new Date(person.birthDate);
    const end = person.deathDate ? new Date(person.deathDate) : new Date();
    
    // 🚨 DATE CONSISTENCY VALIDATION
    if (person.deathDate && new Date(person.deathDate) < birth) {
      console.warn(`⚠️ Date inconsistency for ${person.firstName} ${person.lastName}: death before birth`);
      return null;
    }
    
    const age = end.getFullYear() - birth.getFullYear();
    const monthDiff = end.getMonth() - birth.getMonth();
    const dayDiff = end.getDate() - birth.getDate();
    
    // Precise age adjustment
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      return age - 1;
    }
    
    return age;
  };

  // 🎯 DATE VALIDATION FOR NEW MEMBER
  const validatePersonDates = (birthDate?: string, deathDate?: string) => {
    if (!birthDate || !deathDate) return { isValid: true, message: '' };
    
    const birth = new Date(birthDate);
    const death = new Date(deathDate);
    
    if (death < birth) {
      return {
        isValid: false,
        message: t('dateValidationError', language)
      };
    }
    
    return { isValid: true, message: '' };
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

  // 🚶‍♂️ COMPLETE SIBLING NAVIGATION WITH ADVANCED DETECTION
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
    // First, look for real marriages
    const realMarriage = marriages.find(m => 
      (m.husbandID === person1ID && m.wifeID === person2ID) ||
      (m.husbandID === person2ID && m.wifeID === person1ID)
    );
    
    if (realMarriage) {
      return realMarriage;
    }
    
    // If no official marriage, create simulated marriage based on common children
    const sharedChildren = persons.filter(child => 
      (child.fatherID === person1ID && child.motherID === person2ID) ||
      (child.fatherID === person2ID && child.motherID === person1ID)
    );
    
    if (sharedChildren.length > 0) {
      // Find birth date of oldest child to estimate marriage date
      const oldestChild = sharedChildren.reduce((oldest, child) => {
        if (!child.birthDate) return oldest;
        if (!oldest.birthDate) return child;
        return new Date(child.birthDate) < new Date(oldest.birthDate) ? child : oldest;
      });
      
      let estimatedMarriageDate = null;
      if (oldestChild.birthDate) {
        const birthDate = new Date(oldestChild.birthDate);
        estimatedMarriageDate = new Date(birthDate.getFullYear() - 1, birthDate.getMonth(), birthDate.getDate()).toISOString().split('T')[0];
      }
      
      return {
        marriageID: 0, // Simulated ID
        husbandID: person1ID,
        wifeID: person2ID,
        marriageDate: estimatedMarriageDate || undefined,
        marriagePlace: t('notSpecified', language),
        divorceDate: undefined,
        status: 'active'
      };
    }
    
    return null;
  };

  // Get child relationship type and mother info
  const getChildRelationInfo = (child: Person, focusPerson: Person) => {
    const spouses = getSpouses(focusPerson);
    
    let motherInfo = null;
    let relationType = null;
    
    // Determine the mother of this child
    if (child.fatherID === focusPerson.personID && child.motherID) {
      const mother = persons.find(p => p.personID === child.motherID);
      motherInfo = mother ? `${mother.firstName} ${mother.lastName}` : t('unknown', language);
    } else if (child.motherID === focusPerson.personID && child.fatherID) {
      motherInfo = `${focusPerson.firstName} ${focusPerson.lastName}`;
    }
    
    // Determine relationship type (half-sibling)
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

  // 🔍 IMPROVED SEARCH AND AUTO-FOCUS
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
    const dateValidation = validatePersonDates(person.birthDate, person.deathDate);
    const gender = getPersonGender(person);
    const colors = getGenderColors(person, isMainFocus);
    
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
            {/* 📸 PROFILE PHOTO WITH GENDER COLOR */}
            <Avatar 
              src={person.photoUrl || `https://ui-avatars.com/api/?name=${person.firstName}+${person.lastName}&background=${gender === 'M' ? '4299e1' : gender === 'F' ? 'ed64a6' : '718096'}&color=white&size=128`}
              name={`${person.firstName} ${person.lastName}`}
              size="lg"
              showBorder
              borderColor={colors.avatarBorder}
              borderWidth="3px"
            />
            
            <VStack spacing={1}>
              {/* 🎨 NAME WITH GENDER ICON */}
              <HStack spacing={1}>
                {gender === 'M' && <Text color="blue.600" fontWeight="bold">♂</Text>}
                {gender === 'F' && <Text color="pink.600" fontWeight="bold">♀</Text>}
                <Text fontWeight="bold" fontSize="sm" textAlign="center">
                  {person.firstName} {person.lastName}
                </Text>
                {gender === 'M' && <Text color="blue.600" fontWeight="bold">♂</Text>}
                {gender === 'F' && <Text color="pink.600" fontWeight="bold">♀</Text>}
              </HStack>
              
              {/* 🎯 IMPROVED AGE AND VITAL STATUS */}
              {age !== null ? (
                <Text fontSize="xs" color="gray.500">
                  {person.isDeceased || person.deathDate ? 
                    `${t('deceasedAtAge', language)} ${age} ${t('years', language)}` : 
                    `${age} ${t('years', language)}`
                  }
                </Text>
              ) : (
                person.birthDate ? (
                  <Text fontSize="xs" color="red.500">
                    {t('ageInconsistentDates', language)}
                  </Text>
                ) : (
                  <Text fontSize="xs" color="gray.400" fontStyle="italic">
                    {t('unknownBirthDate', language)}
                  </Text>
                )
              )}
              
              {/* 📅 LIFE DATES */}
              {person.birthDate && (
                <Text fontSize="xs" color="gray.500">
                  {new Date(person.birthDate).getFullYear()}
                  {person.deathDate && ` - ${new Date(person.deathDate).getFullYear()}`}
                  {!dateValidation.isValid && (
                    <Text fontSize="xs" color="red.500" mt={1}>
                      ⚠️ {t('inconsistentDates', language)}
                    </Text>
                  )}
                </Text>
              )}
              
              {/* 🏷️ STANDARDIZED ROLE BADGES */}
              <VStack spacing={1}>
                {/* Gender badge */}
                {gender !== 'unknown' && (
                  <Badge 
                    colorScheme={gender === 'M' ? 'blue' : 'pink'} 
                    fontSize="10px"
                    variant="solid"
                  >
                    {gender === 'M' ? `♂ ${t('male', language)}` : `♀ ${t('female', language)}`}
                  </Badge>
                )}
                
                {/* Death badge */}
                {(person.isDeceased || person.deathDate) && (
                  <Badge colorScheme="gray" fontSize="10px">
                    ✝️ {t('deceased', language)}
                  </Badge>
                )}
                
                {/* Relationship badge */}
                {relationship && (
                  <Badge 
                    colorScheme={relationship.includes('Half') ? 'orange' : 'blue'} 
                    fontSize="10px"
                  >
                    {relationship.toUpperCase()}
                  </Badge>
                )}
                
                {/* Focus badge */}
                {isMainFocus && (
                  <Badge colorScheme="green" fontSize="10px">
                    🎯 {t('focus', language)}
                  </Badge>
                )}
                
                {/* Loop badge */}
                {isPersonInLoop(person.personID) && (
                  <Badge colorScheme="red" fontSize="10px">
                    ⚠️ {t('loop', language)}
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
      <Tooltip label={t('clickForUnionDetails', language)} placement="top">
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
            💍 {marriage?.marriageDate ? new Date(marriage.marriageDate).getFullYear() : t('union', language)}
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
            {focusPersonID === null ? t('loadingData', language) : t('personNotFound', language)}
          </Text>
          <Text color="gray.500">
            {persons.length === 0 
              ? t('loading', language)
              : focusPersonID === null 
                ? t('autoSelectingPerson', language)
                : `${persons.length} persons available, but ID ${focusPersonID} not found.`}
          </Text>
          {persons.length > 0 && focusPersonID !== null && (
            <VStack spacing={2}>
              <Button onClick={() => setFocusPersonID(persons[0].personID)} colorScheme="blue">
                {t('goToFirstPerson', language)}
              </Button>
              <Text fontSize="sm" color="gray.400">
                {t('availablePersons', language)} {persons.map(p => `${p.firstName} ${p.lastName}`).join(', ')}
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

  // 🛡️ Detection and display of loops if present
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
              <Tooltip label={t('previousPageInHistory', language)} placement="bottom">
                <IconButton
                  aria-label={t('previous', language)}
                  icon={<ArrowBackIcon />}
                  onClick={navigateBack}
                  isDisabled={currentHistoryIndex <= 0}
                  size="sm"
                  colorScheme="blue"
                />
              </Tooltip>
              <Tooltip label={t('nextPageInHistory', language)} placement="bottom">
                <IconButton
                  aria-label={t('next', language)}
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
            
            {/* 🧭 NAVIGATION PATH DISPLAY */}
            {navigationHistory.length > 0 && (
              <Text fontSize="xs" color="blue.600">
                {t('historyPath', language)} {navigationHistory[currentHistoryIndex]?.personName || t('start', language)}
              </Text>
            )}
          </VStack>

          <HStack spacing={4}>
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
              {showSiblings ? t('hideSiblings', language) : t('showSiblings', language)}
              {siblingAnalysis.totalCount > 0 && (
                <Badge ml={2} colorScheme={showSiblings ? "white" : "blue"}>
                  {siblingAnalysis.totalCount}
                </Badge>
              )}
            </Button>

            <Tooltip label={t('detailedStatistics', language)} placement="bottom">
              <Button
                leftIcon={<InfoIcon />}
                onClick={onStatsModalOpen}
                size="sm"
                colorScheme="purple"
                variant="outline"
              >
                {t('stats', language)}
              </Button>
            </Tooltip>
          </HStack>
        </HStack>

        {/* Quick Stats */}
        <StatGroup w="full">
          <Stat>
            <StatLabel>👥 {t('persons', language)}</StatLabel>
            <StatNumber>{stats.totalPersons}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>💍 {t('unions', language)}</StatLabel>
            <StatNumber>{stats.totalMarriages}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>🔄 {t('polygamous', language)}</StatLabel>
            <StatNumber>{stats.polygamousPersons}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>📈 {t('generations', language)}</StatLabel>
            <StatNumber>{stats.generations}</StatNumber>
          </Stat>
          {detectedLoops.length > 0 && (
            <Stat>
              <StatLabel>⚠️ {t('loops', language)}</StatLabel>
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
                  <ChevronUpIcon /> {t('parents', language)}
                </Text>
                <HStack spacing={6}>
                  {father && renderPersonCard(father, false, t('father', language))}
                  {mother && renderPersonCard(mother, false, t('mother', language))}
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
                    {t('siblings', language)} ({siblingAnalysis.totalCount})
                  </Text>
                  {siblingAnalysis.hasComplexRelations && (
                    <Badge colorScheme="orange" fontSize="xs">
                      {t('complexRelationsDetected', language)}
                    </Badge>
                  )}
                </VStack>

                {/* Full siblings */}
                {siblingAnalysis.full.length > 0 && (
                  <VStack spacing={2}>
                    <Text fontSize="xs" color="blue.600" fontWeight="semibold">
                      {t('fullSiblings', language)} ({siblingAnalysis.full.length})
                    </Text>
                    <HStack spacing={4} wrap="wrap" justify="center">
                      {siblingAnalysis.full.map(sibling => (
                        <VStack key={sibling.personID} spacing={1}>
                          {renderPersonCard(sibling, false, t('sibling', language))}
                          {isPersonInLoop(sibling.personID) && (
                            <Badge colorScheme="red" fontSize="xs">⚠️ {t('loop', language)}</Badge>
                          )}
                        </VStack>
                      ))}
                    </HStack>
                  </VStack>
                )}

                {/* Paternal half-siblings */}
                {siblingAnalysis.paternalHalf.length > 0 && (
                  <VStack spacing={2}>
                    <Text fontSize="xs" color="purple.600" fontWeight="semibold">
                      {t('paternalHalfSiblings', language)} ({siblingAnalysis.paternalHalf.length})
                    </Text>
                    <HStack spacing={4} wrap="wrap" justify="center">
                      {siblingAnalysis.paternalHalf.map(sibling => (
                        <VStack key={sibling.personID} spacing={1}>
                          {renderPersonCard(sibling, false, "Half-sibling (father)")}
                          {isPersonInLoop(sibling.personID) && (
                            <Badge colorScheme="red" fontSize="xs">⚠️ {t('loop', language)}</Badge>
                          )}
                        </VStack>
                      ))}
                    </HStack>
                  </VStack>
                )}

                {/* Maternal half-siblings */}
                {siblingAnalysis.maternalHalf.length > 0 && (
                  <VStack spacing={2}>
                    <Text fontSize="xs" color="pink.600" fontWeight="semibold">
                      {t('maternalHalfSiblings', language)} ({siblingAnalysis.maternalHalf.length})
                    </Text>
                    <HStack spacing={4} wrap="wrap" justify="center">
                      {siblingAnalysis.maternalHalf.map(sibling => (
                        <VStack key={sibling.personID} spacing={1}>
                          {renderPersonCard(sibling, false, "Half-sibling (mother)")}
                          {isPersonInLoop(sibling.personID) && (
                            <Badge colorScheme="red" fontSize="xs">⚠️ {t('loop', language)}</Badge>
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
                  <ChevronLeftIcon /> {t('spouses', language)} ({spouses.length})
                </Text>
                <VStack spacing={4}>
                  {spouses.map((spouse, index) => {
                    const unionChildren = getChildrenByUnion(focusPerson)
                      .find(union => union.mother?.personID === spouse.personID)?.children || [];
                    
                    return (
                      <VStack key={spouse.personID} spacing={2} p={3} bg="blue.50" borderRadius="md" borderWidth="1px">
                        {/* Spouse card */}
                        <VStack spacing={2}>
                          {renderPersonCard(spouse, false, `${t('spouse', language)} ${index + 1}`)}
                          
                          {/* Union details */}
                          <VStack spacing={1}>
                            {renderUnionIndicator(spouse, focusPerson)}
                            
                            {/* Children count for this union */}
                            {unionChildren.length > 0 && (
                              <Badge colorScheme="green" fontSize="xs">
                                {unionChildren.length} {t('childrenTogether', language)}
                              </Badge>
                            )}
                            
                            {/* Quick access to children of this union */}
                            {unionChildren.length > 0 && (
                              <Button
                                size="xs"
                                variant="outline"
                                colorScheme="green"
                                onClick={() => {
                                  // Focus on first child of this union
                                  navigateToFocus(unionChildren[0].personID);
                                }}
                              >
                                👶 {t('viewChildren', language)} ({unionChildren.length})
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
                  ● {t('focus', language)}
                </Text>
                {detectedLoops.length > 0 && (
                  <Badge colorScheme="red" fontSize="xs">
                    🛡️ {detectedLoops.length} {t('loopsDetected', language)}
                  </Badge>
                )}
              </VStack>
              <VStack spacing={2}>
                {renderPersonCard(focusPerson, true)}
                {isPersonInLoop(focusPerson.personID) && (
                  <Badge colorScheme="red" fontSize="xs">
                    ⚠️ {t('personInLoop', language)}
                  </Badge>
                )}
              </VStack>
            </VStack>

            {/* Children column with union grouping */}
            {children.length > 0 && (
              <VStack spacing={4}>
                <Text fontSize="sm" color="gray.500">
                  <ChevronRightIcon /> {t('children', language)} ({children.length})
                </Text>
                
                {/* Group children by union/mother */}
                <VStack spacing={4}>
                  {getChildrenByUnion(focusPerson).map((unionGroup, unionIndex) => (
                    <VStack key={unionIndex} spacing={3} p={3} bg="gray.50" borderRadius="md" borderWidth="1px">
                      {/* Union header with mother info */}
                      {unionGroup.mother && (
                        <VStack spacing={1}>
                          <Text fontSize="xs" fontWeight="bold" color="purple.600">
                            {t('unionWith', language)} {unionGroup.mother.firstName} {unionGroup.mother.lastName}
                          </Text>
                          {unionGroup.unionInfo && (
                            <Tooltip label={t('clickForUnionDetails', language)} placement="top">
                              <Button
                                size="xs"
                                variant="outline"
                                colorScheme="purple"
                                onClick={() => showUnionDetails(unionGroup.mother!, focusPerson)}
                              >
                                💍 {t('unionDetails', language)}
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
                              {renderPersonCard(child, false, t('child', language))}
                              
                              {/* Mother badge */}
                              {relationInfo.motherInfo && (
                                <Badge colorScheme="pink" fontSize="xs">
                                  {t('motherLabel', language)} {relationInfo.motherInfo}
                                </Badge>
                              )}
                              
                              {/* Half-sibling badge */}
                              {relationInfo.relationType === 'half' && (
                                <Badge colorScheme="orange" fontSize="xs">
                                  {t('halfSibling', language)}
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
                🔍 {t('searchResults', language)} "{searchTerm}"
              </Text>
              
              {searchResults.length === 0 ? (
                <Text color="gray.500">{t('noResultsFound', language)}</Text>
              ) : (
                <>
                  <Text fontSize="sm" color="gray.600">
                    {searchResults.length} {t('personsFound', language)}
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
                        {renderPersonCard(person, false, t('result', language))}
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
            <ModalHeader>{t('unionDetails', language)}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {selectedUnion ? (
                <VStack spacing={4} align="stretch">
                  {selectedUnion.marriageID === 0 && (
                    <Box bg="yellow.50" p={3} borderRadius="md" border="1px solid" borderColor="yellow.200">
                      <Text fontSize="sm" color="yellow.800" fontWeight="semibold">
                        ℹ️ Information estimated based on common children
                      </Text>
                    </Box>
                  )}
                  
                  <Box>
                    <Text fontWeight="bold">{t('marriageDate', language)}</Text>
                    <Text>{selectedUnion.marriageDate ? 
                      new Date(selectedUnion.marriageDate).toLocaleDateString('en-US') + 
                      (selectedUnion.marriageID === 0 ? ` ${t('estimated', language)}` : '') : 
                      t('notSpecified', language)
                    }</Text>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="bold">{t('marriagePlace', language)}</Text>
                    <Text>{selectedUnion.marriagePlace || t('notSpecified', language)}</Text>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="bold">{t('status', language)}</Text>
                    <Badge colorScheme={selectedUnion.status === 'active' ? 'green' : 'red'}>
                      {selectedUnion.status === 'active' ? t('married', language) : t('divorced', language)}
                    </Badge>
                  </Box>
                  
                  {selectedUnion.divorceDate && (
                    <Box>
                      <Text fontWeight="bold">{t('divorceDate', language)}</Text>
                      <Text>{new Date(selectedUnion.divorceDate).toLocaleDateString('en-US')}</Text>
                    </Box>
                  )}
                </VStack>
              ) : (
                <Text>{t('noUnionInfo', language)}</Text>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Stats Modal */}
        <Modal isOpen={isStatsModalOpen} onClose={onStatsModalClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{t('detailedStats', language)}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <SimpleGrid columns={2} spacing={6}>
                <Stat>
                  <StatLabel>Total {t('persons', language)}</StatLabel>
                  <StatNumber>{stats.totalPersons}</StatNumber>
                </Stat>
                
                <Stat>
                  <StatLabel>Total {t('unions', language)}</StatLabel>
                  <StatNumber>{stats.totalMarriages}</StatNumber>
                </Stat>
                
                <Stat>
                  <StatLabel>{t('polygamous', language)} {t('persons', language)}</StatLabel>
                  <StatNumber>{stats.polygamousPersons}</StatNumber>
                </Stat>
                
                <Stat>
                  <StatLabel>Number of {t('generations', language)}</StatLabel>
                  <StatNumber>{stats.generations}</StatNumber>
                </Stat>
              </SimpleGrid>
              
              <Divider my={6} />
              
              <VStack spacing={4} align="stretch">
                <Text fontWeight="bold" fontSize="lg">Genealogical Analysis</Text>
                
                <Box>
                  <Text fontWeight="semibold">Polygamy Rate:</Text>
                  <Text>{((stats.polygamousPersons / stats.totalPersons) * 100).toFixed(1)}%</Text>
                </Box>
                
                <Box>
                  <Text fontWeight="semibold">Average Marriages/Person:</Text>
                  <Text>{stats.totalPersons > 0 ? (stats.totalMarriages * 2 / stats.totalPersons).toFixed(1) : 0}</Text>
                </Box>
                
                <Box>
                  <Text fontWeight="semibold">Genealogical Depth:</Text>
                  <Text>{stats.generations} generation levels</Text>
                </Box>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  );
};

export default FamilyTreeEnglish;
