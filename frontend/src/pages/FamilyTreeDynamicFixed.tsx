import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Card,
  CardBody,
  Avatar,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  Input,
  InputGroup,
  InputLeftElement,
  Badge,
  Heading,
  SimpleGrid
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import api from '../services/api';
import { Person } from '../types';

interface DynamicNode {
  person: Person;
  parents: Person[];
  spouses: Person[];
  children: Person[];
}

const FamilyTreeDynamicFixed: React.FC = () => {
  const [persons, setPersons] = useState<Person[]>([]);
  const [focusPerson, setFocusPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/persons');
        const data = response.data;
        setPersons(data);
        if (data.length > 0) {
          const ruben = data.find((p: Person) => p.firstName?.toLowerCase() === 'ruben') || data[0];
          setFocusPerson(ruben);
        }
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const buildDynamicNode = (person: Person): DynamicNode => {
    const parents = persons.filter(p => 
      p.personID === person.fatherID || p.personID === person.motherID
    );

    const children = persons.filter(p => 
      p.fatherID === person.personID || p.motherID === person.personID
    );

    const spouseIds = new Set<number>();
    children.forEach(child => {
      if (child.fatherID && child.motherID) {
        if (child.fatherID === person.personID && child.motherID !== person.personID) {
          spouseIds.add(child.motherID);
        } else if (child.motherID === person.personID && child.fatherID !== person.personID) {
          spouseIds.add(child.fatherID);
        }
      }
    });

    const spouses = persons.filter(p => spouseIds.has(p.personID));
    return { person, parents, spouses, children };
  };

  const PersonCard: React.FC<{ 
    person: Person; 
    onClick: () => void; 
    variant?: 'default' | 'focus' | 'parent' | 'spouse' | 'child';
  }> = ({ person, onClick, variant = 'default' }) => {
    return (
      <Card
        cursor="pointer"
        onClick={onClick}
        borderWidth={variant === 'focus' ? 3 : 1}
        borderColor={variant === 'focus' ? 'blue.500' : 'gray.200'}
        bg={variant === 'focus' ? 'blue.50' : 'white'}
        _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
        transition="all 0.2s"
        minW="200px"
        maxW="220px"
      >
        <CardBody p={4}>
          <VStack spacing={2}>
            <Avatar 
              name={`${person.firstName || ''} ${person.lastName || ''}`}
              src={person.photoUrl}
              size="md"
            />
            <VStack spacing={1} textAlign="center">
              <Text fontWeight="bold" fontSize="sm">
                {person.firstName || ''} {person.lastName || ''}
              </Text>
              {variant === 'focus' && (
                <Badge colorScheme="blue" fontSize="xs">Focus</Badge>
              )}
              {variant === 'parent' && (
                <Badge colorScheme="green" fontSize="xs">Parent</Badge>
              )}
              {variant === 'spouse' && (
                <Badge colorScheme="pink" fontSize="xs">Époux/Épouse</Badge>
              )}
              {variant === 'child' && (
                <Badge colorScheme="orange" fontSize="xs">Enfant</Badge>
              )}
              <Text fontSize="xs" color="gray.500">
                {person.birthday || 'Date inconnue'}
              </Text>
            </VStack>
          </VStack>
        </CardBody>
      </Card>
    );
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="lg" />
          <Text>Chargement de l'arbre familial...</Text>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  if (!focusPerson) {
    return (
      <Container maxW="container.xl" py={8}>
        <Text>Aucune personne trouvée</Text>
      </Container>
    );
  }

  const dynamicNode = buildDynamicNode(focusPerson);
  const filteredPersons = persons.filter(person =>
    `${person.firstName || ''} ${person.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8}>
        <Heading size="lg" textAlign="center">
          Arbre Familial Dynamique
        </Heading>

        <Box w="full" maxW="md">
          <InputGroup>
            <InputLeftElement>
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Rechercher une personne..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Box>

        {searchTerm && (
          <Box w="full">
            <Text fontSize="lg" fontWeight="semibold" mb={4}>
              Résultats de recherche ({filteredPersons.length})
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={4}>
              {filteredPersons.map((person) => (
                <PersonCard
                  key={person.personID}
                  person={person}
                  onClick={() => setFocusPerson(person)}
                />
              ))}
            </SimpleGrid>
          </Box>
        )}

        <Box w="full">
          <VStack spacing={8}>
            {dynamicNode.parents.length > 0 && (
              <VStack spacing={2}>
                <Text fontSize="md" fontWeight="semibold">Parents ↑</Text>
                <HStack spacing={4} justify="center">
                  {dynamicNode.parents.map((parent) => (
                    <PersonCard
                      key={parent.personID}
                      person={parent}
                      onClick={() => setFocusPerson(parent)}
                      variant="parent"
                    />
                  ))}
                </HStack>
              </VStack>
            )}

            <HStack spacing={8} align="center" justify="center">
              {dynamicNode.spouses.length > 0 && (
                <VStack spacing={2}>
                  <Text fontSize="md" fontWeight="semibold">← Époux/Épouses</Text>
                  <VStack spacing={4}>
                    {dynamicNode.spouses.map((spouse) => (
                      <PersonCard
                        key={spouse.personID}
                        person={spouse}
                        onClick={() => setFocusPerson(spouse)}
                        variant="spouse"
                      />
                    ))}
                  </VStack>
                </VStack>
              )}

              <VStack spacing={2}>
                <Text fontSize="lg" fontWeight="bold">● Focus</Text>
                <PersonCard
                  person={focusPerson}
                  onClick={() => {}}
                  variant="focus"
                />
              </VStack>

              {dynamicNode.children.length > 0 && (
                <VStack spacing={2}>
                  <Text fontSize="md" fontWeight="semibold">Enfants →</Text>
                  <VStack spacing={4} maxH="400px" overflowY="auto">
                    {dynamicNode.children.map((child) => (
                      <PersonCard
                        key={child.personID}
                        person={child}
                        onClick={() => setFocusPerson(child)}
                        variant="child"
                      />
                    ))}
                  </VStack>
                </VStack>
              )}
            </HStack>
          </VStack>
        </Box>

        <Box w="full" p={4} bg="gray.50" borderRadius="md">
          <Text fontSize="sm" color="gray.600" textAlign="center">
            💡 Cliquez sur une personne pour la mettre au centre de l'arbre.
          </Text>
        </Box>
      </VStack>
    </Container>
  );
};

export default FamilyTreeDynamicFixed;
