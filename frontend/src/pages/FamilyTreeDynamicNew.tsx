// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  VStack, 
  HStack, 
  Text, 
  Card, 
  CardBody, 
  Image, 
  Badge,
  Container,
  Heading,
  Switch,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  useToast,
  Avatar,
  Tooltip,
  Spinner
} from '@chakra-ui/react';
import { ChevronLeftIcon, SearchIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { buildCompleteFamily } from '../services/familyTreeService';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Utiliser les types du service pour éviter les conflits
type Person = ServicePerson & {
  activity?: string;
  cityName?: string;
};

interface DynamicNode {
  person: Person;
  parents: Person[];
  spouses: Person[];
  children: Person[];
  unions: ServiceUnion[];
}

const FamilyTreeDynamic: React.FC = () => {
  const [currentPerson, setCurrentPerson] = useState<DynamicNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [persons, setPersons] = useState<Person[]>([]);
  const [focusHistory, setFocusHistory] = useState<number[]>([]);
  
  // 🆕 Nouvelles fonctionnalités transférées
  const [showFullTree, setShowFullTree] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Person[]>([]);
  const [totalWeddings, setTotalWeddings] = useState(0);
  const [showPersonSearch, setShowPersonSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  // Utilitaire pour calculer l'âge
  const calculateAge = (person: Person): string => {
    if (!person.birthday && !person.birthDate) return 'Age inconnu';
    const birthDate = new Date(person.birthday || person.birthDate || '');
    if (isNaN(birthDate.getTime())) return 'Age inconnu';
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age.toString();
  };

  // Charger les données initiales
  useEffect(() => {
    loadFamilyData();
  }, [showFullTree]);

  const loadFamilyData = async () => {
    setLoading(true);
    try {
      if (!user?.familyID) {
        console.error('❌ familyID non disponible');
        return;
      }

      const endpoint = showFullTree
        ? `/familytree/full/${user.familyID}`
        : `/familytree/my-branch/${user.idPerson}`;

      const response = await api.get(endpoint);
      const familyData = response.data;
      
      console.log('🔍 Données famille chargées:', familyData);
      setPersons(familyData.persons || []);
      setTotalWeddings(familyData.totalWeddings || 0);

      // Focus initial sur l'utilisateur connecté ou Richard
      const initialFocusId = user?.idPerson || 1;
      await focusOnPerson(initialFocusId);

    } catch (error) {
      console.error('❌ Erreur chargement famille:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données familiales',
        status: 'error',
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  // Focus sur une personne avec construction des relations
  const focusOnPerson = async (personId: number) => {
    try {
      setLoading(true);
      console.log('🎯 Focus sur personne:', personId);

      // Construire les relations pour cette personne
      const familyDataResult = await buildCompleteFamily(persons, []);
      const targetNode = familyDataResult.roots.find(n => n.person.personID === personId) || 
                        familyDataResult.roots.flatMap(r => getAllDescendants(r, familyDataResult.roots)).find(n => n.person.personID === personId);
      
      if (targetNode) {
        // Convertir FamilyTreeNode en DynamicNode
        const dynamicNode: DynamicNode = {
          person: targetNode.person,
          parents: targetNode.parents || [],
          spouses: targetNode.spouses || [],
          children: targetNode.children || [],
          unions: targetNode.unions || []
        };
        
        setCurrentPerson(dynamicNode);
        setFocusHistory(prev => [...prev, personId]);
        
        console.log('✅ Focus établi:', {
          person: dynamicNode.person.firstName,
          parents: dynamicNode.parents.length,
          spouses: dynamicNode.spouses.length,
          children: dynamicNode.children.length,
          unions: dynamicNode.unions.length
        });
      } else {
        console.warn('⚠️ Personne non trouvée dans les noeuds');
      }
    } catch (error) {
      console.error('❌ Erreur focus personne:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger cette personne',
        status: 'error',
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  // Fonction helper pour parcourir l'arbre
  const getAllDescendants = (node: DynamicNode): DynamicNode[] => {
    let descendants = [node];
    node.children.forEach(child => {
      const childNode = findNodeByPerson(child, familyData?.roots || []);
      if (childNode) {
        descendants = [...descendants, ...getAllDescendants(childNode)];
      }
    });
    return descendants;
  };

  // Fonction helper pour trouver un noeud par personne
  const findNodeByPerson = (person: Person, roots: DynamicNode[]): DynamicNode | null => {
    for (const root of roots) {
      if (root.person.personID === person.personID) return root;
      const found = getAllDescendants(root).find(n => n.person.personID === person.personID);
      if (found) return found;
    }
    return null;
  };

  // Retour en arrière
  const goBack = () => {
    if (focusHistory.length > 1) {
      const newHistory = [...focusHistory];
      newHistory.pop(); // Retirer le focus actuel
      const previousId = newHistory[newHistory.length - 1];
      setFocusHistory(newHistory);
      focusOnPerson(previousId);
    }
  };

  // Composant PersonCard
  const PersonCard: React.FC<{
    person: Person;
    role: 'parent' | 'spouse' | 'child' | 'focus';
    onClick: () => void;
  }> = ({ person, role, onClick }) => {
    const isUser = person.personID === user?.idPerson;
    const age = calculateAge(person);
    
    const roleColors = {
      parent: { bg: 'green.100', border: 'green.500' },
      spouse: { bg: 'purple.100', border: 'purple.500' },
      child: { bg: 'orange.100', border: 'orange.500' },
      focus: { bg: 'blue.50', border: 'blue.500' }
    };

    return (
      <Card
        p={3}
        cursor={role !== 'focus' ? 'pointer' : 'default'}
        onClick={onClick}
        bg={roleColors[role].bg}
        borderWidth={2}
        borderColor={roleColors[role].border}
        borderRadius="md"
        transition="all 0.2s"
        _hover={role !== 'focus' ? { transform: 'scale(1.05)', shadow: 'md' } : {}}
        minW="150px"
        position="relative"
      >
        <VStack spacing={2}>
          {person.photoUrl ? (
            <Avatar size="sm" src={person.photoUrl} />
          ) : (
            <Avatar size="sm" bg={person.sex === 'F' ? 'pink.200' : 'blue.200'} />
          )}
          
          <VStack spacing={0}>
            <Text fontWeight="bold" fontSize="sm" textAlign="center">
              {person.firstName}
            </Text>
            <Text fontSize="xs" color="gray.600">
              {person.lastName}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {age} ans
            </Text>
          </VStack>
          
          {isUser && (
            <Badge position="absolute" top={1} right={1} colorScheme="cyan" fontSize="xs">
              Vous
            </Badge>
          )}
          
          {person.activity && (
            <Text fontSize="xs" color="gray.600" textAlign="center">
              {person.activity}
            </Text>
          )}
        </VStack>
      </Card>
    );
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Chargement de l'arbre familial...</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="100%" py={8}>
      <VStack spacing={6} align="stretch">
        
        {/* Header avec contrôles avancés */}
        <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
          <VStack spacing={4}>
            <Heading size="lg" color="blue.600">
              🌳 Arbre Familial Dynamique
            </Heading>
            
            {currentPerson && (
              <Text color="gray.600">
                Navigation centrée sur: {currentPerson.person.firstName} {currentPerson.person.lastName}
              </Text>
            )}
            
            <HStack spacing={4}>
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="full-tree" mb={0} fontSize="sm">
                  Arbre complet
                </FormLabel>
                <Switch 
                  id="full-tree" 
                  isChecked={showFullTree}
                  onChange={(e) => setShowFullTree(e.target.checked)}
                  colorScheme="blue"
                />
              </FormControl>
              
              <Button leftIcon={<ChevronLeftIcon />} onClick={goBack} isDisabled={focusHistory.length <= 1}>
                Retour
              </Button>
              
              <Button onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
            </HStack>
          </VStack>
        </Box>

        {/* 🌟 VUE PRINCIPALE EN CROIX */}
        {currentPerson && (
          <Box
            bg="gray.50"
            borderRadius="lg"
            borderWidth={1}
            borderColor="gray.200"
            p={8}
            overflow="auto"
            minH="600px"
          >
            <VStack spacing={8}>
              
              {/* PARENTS (EN HAUT) */}
              {currentPerson.parents.length > 0 && (
                <VStack>
                  <Text fontSize="lg" fontWeight="bold" color="green.600">
                    ↑ PARENTS
                  </Text>
                  <HStack spacing={4}>
                    {currentPerson.parents.map(parent => (
                      <PersonCard
                        key={parent.personID}
                        person={parent}
                        role="parent"
                        onClick={() => focusOnPerson(parent.personID)}
                      />
                    ))}
                  </HStack>
                </VStack>
              )}

              {/* NIVEAU CENTRAL : ÉPOUSES ← PERSONNE FOCUS → ENFANTS */}
              <HStack spacing={8} align="start">
                
                {/* ÉPOUSES (À GAUCHE) */}
                {currentPerson.spouses.length > 0 && (
                  <VStack>
                    <Text fontSize="lg" fontWeight="bold" color="purple.600">
                      ← ÉPOUSES ({currentPerson.spouses.length})
                    </Text>
                    <VStack spacing={3}>
                      {currentPerson.spouses.map(spouse => (
                        <PersonCard
                          key={spouse.personID}
                          person={spouse}
                          role="spouse"
                          onClick={() => focusOnPerson(spouse.personID)}
                        />
                      ))}
                    </VStack>
                  </VStack>
                )}

                {/* PERSONNE FOCUS (CENTRE) */}
                <VStack>
                  <Text fontSize="xl" fontWeight="bold" color="blue.600">
                    ● FOCUS
                  </Text>
                  <PersonCard
                    person={currentPerson.person}
                    role="focus"
                    onClick={() => {}}
                  />
                  
                  {/* Statistiques unions */}
                  {currentPerson.unions.length > 0 && (
                    <Box mt={2} p={2} bg="blue.50" borderRadius="md" fontSize="sm">
                      <Text fontWeight="bold">Unions: {currentPerson.unions.length}</Text>
                      {currentPerson.unions.map((union, index) => {
                        const spouse = persons.find(p => p.personID === union.wifeId || p.personID === union.husbandId);
                        if (!spouse || spouse.personID === currentPerson.person.personID) return null;
                        return (
                          <Text key={index}>
                            → {union.children.length} enfant(s) avec {spouse?.firstName}
                          </Text>
                        );
                      })}
                    </Box>
                  )}
                </VStack>

                {/* ENFANTS (À DROITE) */}
                {currentPerson.children.length > 0 && (
                  <VStack>
                    <Text fontSize="lg" fontWeight="bold" color="orange.600">
                      ENFANTS ({currentPerson.children.length}) →
                    </Text>
                    <VStack spacing={3} maxH="400px" overflowY="auto">
                      {currentPerson.children.map(child => (
                        <PersonCard
                          key={child.personID}
                          person={child}
                          role="child"
                          onClick={() => focusOnPerson(child.personID)}
                        />
                      ))}
                    </VStack>
                  </VStack>
                )}
              </HStack>

              {/* UNIONS DÉTAILLÉES (EN BAS) */}
              {currentPerson.unions.length > 1 && (
                <VStack>
                  <Text fontSize="lg" fontWeight="bold" color="purple.600">
                    ↓ DÉTAIL DES UNIONS MULTIPLES
                  </Text>
                  <HStack spacing={4} wrap="wrap">
                    {currentPerson.unions.map((union, index) => {
                      const spouse = persons.find(p => 
                        p.personID === union.wifeId || p.personID === union.husbandId
                      );
                      if (!spouse || spouse.personID === currentPerson.person.personID) return null;
                      
                      return (
                        <Card key={index} p={3} bg="purple.50">
                          <VStack>
                            <Text fontWeight="bold" fontSize="sm">
                              Union {index + 1}
                            </Text>
                            <Text fontSize="xs">
                              {currentPerson.person.firstName} + {spouse.firstName}
                            </Text>
                            <Text fontSize="xs" color="green.600">
                              {union.children.length} enfant(s)
                            </Text>
                            <VStack spacing={1}>
                              {union.children.map(child => (
                                <Button
                                  key={child.personID}
                                  size="xs"
                                  variant="ghost"
                                  onClick={() => focusOnPerson(child.personID)}
                                >
                                  {child.firstName}
                                </Button>
                              ))}
                            </VStack>
                          </VStack>
                        </Card>
                      );
                    })}
                  </HStack>
                </VStack>
              )}
            </VStack>
          </Box>
        )}

        {/* BOUTONS RECHERCHE ET HISTORIQUE */}
        <HStack spacing={4} mt={8} justify="center">
          <Button leftIcon={<SearchIcon />} onClick={() => setShowPersonSearch(!showPersonSearch)}>
            Recherche
          </Button>
          <Button onClick={() => navigate('/dashboard')}>
            Retour Dashboard
          </Button>
        </HStack>

        {/* MODAL RECHERCHE PERSONNE */}
        {showPersonSearch && (
          <Box
            position="fixed"
            top="0"
            left="0"
            w="100vw"
            h="100vh"
            bg="rgba(0,0,0,0.7)"
            zIndex="1000"
            onClick={() => setShowPersonSearch(false)}
          >
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              bg="white"
              p={6}
              borderRadius="lg"
              maxW="500px"
              w="90%"
              onClick={(e) => e.stopPropagation()}
            >
              <VStack spacing={4}>
                <Text fontSize="lg" fontWeight="bold">Rechercher une personne</Text>
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <VStack maxH="300px" overflowY="auto" w="100%" spacing={2}>
                  {persons
                    .filter(p => 
                      p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      p.lastName.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .slice(0, 10)
                    .map(person => (
                      <Button
                        key={person.personID}
                        variant="ghost"
                        justifyContent="start"
                        w="100%"
                        onClick={() => {
                          focusOnPerson(person.personID);
                          setShowPersonSearch(false);
                          setSearchTerm('');
                        }}
                      >
                        {person.firstName} {person.lastName} ({calculateAge(person)} ans)
                      </Button>
                    ))}
                </VStack>
                <Button onClick={() => setShowPersonSearch(false)} colorScheme="gray">
                  Fermer
                </Button>
              </VStack>
            </Box>
          </Box>
        )}

        {/* LÉGENDE */}
        <Box bg="white" p={4} borderRadius="lg" boxShadow="sm">
          <Heading size="sm" mb={3}>Légende</Heading>
          <HStack spacing={6} wrap="wrap">
            <HStack>
              <Box w="20px" h="20px" bg="green.100" borderWidth={2} borderColor="green.500" borderRadius="md" />
              <Text fontSize="sm">Parents</Text>
            </HStack>
            <HStack>
              <Box w="20px" h="20px" bg="purple.100" borderWidth={2} borderColor="purple.500" borderRadius="md" />
              <Text fontSize="sm">Conjoints</Text>
            </HStack>
            <HStack>
              <Box w="20px" h="20px" bg="orange.100" borderWidth={2} borderColor="orange.500" borderRadius="md" />
              <Text fontSize="sm">Enfants</Text>
            </HStack>
            <HStack>
              <Box w="20px" h="20px" bg="blue.50" borderWidth={2} borderColor="blue.500" borderRadius="md" />
              <Text fontSize="sm">Focus actuel</Text>
            </HStack>
            <HStack>
              <Badge colorScheme="cyan" fontSize="xs">Vous</Badge>
              <Text fontSize="sm">Votre profil</Text>
            </HStack>
          </HStack>
        </Box>
        
      </VStack>
    </Container>
  );
};

export default FamilyTreeDynamic;
