import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  HStack,
  VStack,
  Button,
  Switch,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  useToast,
  Badge,
  Text,
  Avatar,
  Tooltip,
  Spinner,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import api from '../services/api';

interface Person {
  personID: number;
  firstName: string;
  lastName: string;
  sex: string;
  birthday?: string;
  deathDate?: string;
  alive: boolean;
  fatherID?: number;
  motherID?: number;
  photoUrl?: string;
  activity?: string;
  cityName?: string;
  fatherName?: string;
  motherName?: string;
}

interface Wedding {
  weddingID: number;
  husbandID: number;
  wifeID: number;
  weddingDate?: string;
  divorceDate?: string;
  stillMarried: boolean;
  husbandName: string;
  wifeName: string;
}

interface TreeNode {
  person: Person;
  spouses: Person[];
  children: TreeNode[];
  level: number;
}

export default function FamilyTreeVisualization() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFullTree, setShowFullTree] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Person[]>([]);
  const toast = useToast();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const familyId = user.familyID || 1;
  const personId = user.idPerson;

  useEffect(() => {
    loadTreeData();
  }, [showFullTree]);

  const loadTreeData = async () => {
    setLoading(true);
    try {
      const endpoint = showFullTree
        ? `/familytree/full/${familyId}`
        : `/familytree/my-branch/${personId}`;
      
      const response = await api.get(endpoint);
      setPersons(response.data.persons || []);
      setWeddings(response.data.weddings || []);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data || 'Impossible de charger l\'arbre',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await api.get(`/familytree/search/${familyId}`, {
        params: { query: searchQuery },
      });
      setSearchResults(response.data);
    } catch (error: any) {
      toast({
        title: 'Erreur de recherche',
        description: error.response?.data || 'Erreur lors de la recherche',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const buildTree = (): TreeNode[] => {
    // Find root persons (no parents)
    const roots = persons.filter(p => !p.fatherID && !p.motherID);
    
    const buildNode = (person: Person, level: number, visited = new Set<number>()): TreeNode => {
      if (visited.has(person.personID)) {
        return { person, spouses: [], children: [], level };
      }
      visited.add(person.personID);

      // Find spouses
      const spouses = weddings
        .filter(w => w.husbandID === person.personID || w.wifeID === person.personID)
        .map(w => {
          const spouseId = w.husbandID === person.personID ? w.wifeID : w.husbandID;
          return persons.find(p => p.personID === spouseId);
        })
        .filter((p): p is Person => p !== undefined);

      // Find children
      const children = persons
        .filter(p => p.fatherID === person.personID || p.motherID === person.personID)
        .map(child => buildNode(child, level + 1, visited));

      return { person, spouses, children, level };
    };

    return roots.map(root => buildNode(root, 0));
  };

  const renderPerson = (person: Person, isSpouse = false) => {
    const age = person.birthday
      ? Math.floor((new Date().getTime() - new Date(person.birthday).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
      : null;

    return (
      <Tooltip
        label={
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold">{person.firstName} {person.lastName}</Text>
            {person.birthday && <Text fontSize="sm">Né(e) le {new Date(person.birthday).toLocaleDateString()}</Text>}
            {age && person.alive && <Text fontSize="sm">Âge: {age} ans</Text>}
            {person.cityName && <Text fontSize="sm">📍 {person.cityName}</Text>}
            {person.activity && <Text fontSize="sm">💼 {person.activity}</Text>}
            {!person.alive && person.deathDate && (
              <Text fontSize="sm" color="red.300">
                Décédé(e) le {new Date(person.deathDate).toLocaleDateString()}
              </Text>
            )}
          </VStack>
        }
        placement="top"
      >
        <Box
          p={3}
          bg={isSpouse ? 'purple.50' : person.sex === 'M' ? 'blue.50' : 'pink.50'}
          borderRadius="lg"
          borderWidth={2}
          borderColor={person.personID === personId ? 'green.500' : 'gray.300'}
          boxShadow="md"
          cursor="pointer"
          transition="all 0.2s"
          _hover={{ transform: 'scale(1.05)', boxShadow: 'lg' }}
          minW="150px"
          textAlign="center"
        >
          <VStack spacing={2}>
            <Avatar
              size="md"
              name={`${person.firstName} ${person.lastName}`}
              src={person.photoUrl}
              bg={person.sex === 'M' ? 'blue.400' : 'pink.400'}
            />
            <Text fontWeight="bold" fontSize="sm">
              {person.firstName} {person.lastName}
            </Text>
            {age && person.alive && (
              <Badge colorScheme="green" fontSize="xs">
                {age} ans
              </Badge>
            )}
            {!person.alive && (
              <Badge colorScheme="red" fontSize="xs">
                ✝ Décédé(e)
              </Badge>
            )}
            {person.personID === personId && (
              <Badge colorScheme="green" fontSize="xs">
                Vous
              </Badge>
            )}
          </VStack>
        </Box>
      </Tooltip>
    );
  };

  const renderTreeNode = (node: TreeNode) => {
    return (
      <VStack key={node.person.personID} spacing={4} align="center">
        {/* Person and their spouses */}
        <HStack spacing={4} align="center">
          {renderPerson(node.person)}
          
          {node.spouses.length > 0 && (
            <>
              <Text fontSize="2xl" color="pink.500">💕</Text>
              <HStack spacing={2}>
                {node.spouses.map(spouse => (
                  <Box key={spouse.personID}>
                    {renderPerson(spouse, true)}
                  </Box>
                ))}
              </HStack>
            </>
          )}
        </HStack>

        {/* Children */}
        {node.children.length > 0 && (
          <>
            <Box
              h="30px"
              w="2px"
              bg="gray.400"
            />
            <HStack spacing={8} align="start">
              {node.children.map((child) => (
                <Box key={child.person.personID}>
                  {renderTreeNode(child)}
                </Box>
              ))}
            </HStack>
          </>
        )}
      </VStack>
    );
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Chargement de l'arbre généalogique...</Text>
        </VStack>
      </Container>
    );
  }

  const treeData = buildTree();

  return (
    <Container maxW="100%" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
          <VStack spacing={4} align="stretch">
            <Heading size="lg">🌳 Arbre Généalogique Familial</Heading>
            
            {/* Controls */}
            <HStack spacing={4} wrap="wrap">
              <FormControl display="flex" alignItems="center" w="auto">
                <FormLabel mb={0} fontSize="sm">
                  {showFullTree ? 'Toute la famille' : 'Ma branche uniquement'}
                </FormLabel>
                <Switch
                  colorScheme="green"
                  isChecked={showFullTree}
                  onChange={(e) => setShowFullTree(e.target.checked)}
                />
              </FormControl>

              <InputGroup maxW="300px">
                <InputLeftElement>
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Rechercher dans la famille..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </InputGroup>

              <Button colorScheme="blue" onClick={handleSearch} size="sm">
                Rechercher
              </Button>

              <Button colorScheme="green" onClick={loadTreeData} size="sm">
                🔄 Rafraîchir
              </Button>
            </HStack>

            {/* Stats */}
            <HStack spacing={4}>
              <Badge colorScheme="blue" fontSize="md" p={2}>
                {persons.length} personnes
              </Badge>
              <Badge colorScheme="purple" fontSize="md" p={2}>
                {weddings.length} mariages
              </Badge>
              <Badge colorScheme="green" fontSize="md" p={2}>
                {treeData.length} génération(s) racine
              </Badge>
            </HStack>
          </VStack>
        </Box>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Box bg="yellow.50" p={4} borderRadius="lg" borderWidth={1} borderColor="yellow.200">
            <Heading size="sm" mb={3}>Résultats de recherche ({searchResults.length})</Heading>
            <HStack spacing={3} wrap="wrap">
              {searchResults.map(person => (
                <Box key={person.personID}>
                  {renderPerson(person)}
                </Box>
              ))}
            </HStack>
          </Box>
        )}

        {/* Tree Visualization */}
        <Box
          bg="gray.50"
          borderRadius="lg"
          borderWidth={1}
          borderColor="gray.200"
          overflow="hidden"
          minH="600px"
        >
          <TransformWrapper
            initialScale={1}
            minScale={0.3}
            maxScale={3}
            centerOnInit
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                {/* Zoom Controls */}
                <HStack
                  position="absolute"
                  top={4}
                  right={4}
                  zIndex={10}
                  bg="white"
                  p={2}
                  borderRadius="md"
                  boxShadow="md"
                  spacing={2}
                >
                  <Button size="sm" onClick={() => zoomIn()}>+</Button>
                  <Button size="sm" onClick={() => zoomOut()}>-</Button>
                  <Button size="sm" onClick={() => resetTransform()}>↺</Button>
                </HStack>

                <TransformComponent
                  wrapperStyle={{ width: '100%', height: '600px' }}
                  contentStyle={{ padding: '50px' }}
                >
                  <HStack spacing={12} align="start" justify="center">
                    {treeData.map((root) => (
                      <Box key={root.person.personID}>
                        {renderTreeNode(root)}
                      </Box>
                    ))}
                  </HStack>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </Box>

        {/* Legend */}
        <Box bg="white" p={4} borderRadius="lg" boxShadow="sm">
          <Heading size="sm" mb={3}>Légende</Heading>
          <HStack spacing={6} wrap="wrap">
            <HStack>
              <Box w="20px" h="20px" bg="blue.50" borderWidth={2} borderColor="gray.300" borderRadius="md" />
              <Text fontSize="sm">Homme</Text>
            </HStack>
            <HStack>
              <Box w="20px" h="20px" bg="pink.50" borderWidth={2} borderColor="gray.300" borderRadius="md" />
              <Text fontSize="sm">Femme</Text>
            </HStack>
            <HStack>
              <Box w="20px" h="20px" bg="purple.50" borderWidth={2} borderColor="gray.300" borderRadius="md" />
              <Text fontSize="sm">Conjoint(e)</Text>
            </HStack>
            <HStack>
              <Box w="20px" h="20px" bg="white" borderWidth={2} borderColor="green.500" borderRadius="md" />
              <Text fontSize="sm">Vous</Text>
            </HStack>
            <HStack>
              <Text fontSize="xl">💕</Text>
              <Text fontSize="sm">Mariage</Text>
            </HStack>
          </HStack>
        </Box>
      </VStack>
    </Container>
  );
}
