import { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Code,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';

export default function RelationsExplainer() {
  const [selectedPerson, setSelectedPerson] = useState(5); // Lucas par défaut

  const persons = [
    { id: 1, name: 'Jean Dupont', fatherId: null, motherId: null, gen: 1 },
    { id: 2, name: 'Marie Martin', fatherId: null, motherId: null, gen: 1 },
    { id: 3, name: 'Pierre Dupont', fatherId: 1, motherId: 2, gen: 2 },
    { id: 4, name: 'Sophie Bernard', fatherId: null, motherId: null, gen: 1 },
    { id: 5, name: 'Lucas Dupont', fatherId: 3, motherId: 4, gen: 3 },
    { id: 6, name: 'Emma Dupont', fatherId: 3, motherId: 4, gen: 3 },
  ];

  const getPersonById = (id: number | null) => persons.find(p => p.id === id);
  const getChildren = (id: number) => persons.filter(p => p.fatherId === id || p.motherId === id);

  const selected = getPersonById(selectedPerson);
  const father = selected ? getPersonById(selected.fatherId) : null;
  const mother = selected ? getPersonById(selected.motherId) : null;
  const children = selected ? getChildren(selected.id) : [];

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Box bg="blue.50" p={6} borderRadius="lg" borderWidth={2} borderColor="blue.200">
          <Heading size="lg" mb={4}>🧬 Comment fonctionnent les relations Parent-Enfant ?</Heading>
          <Text fontSize="lg" color="gray.700">
            Démonstration interactive avec la famille Dupont
          </Text>
        </Box>

        <Tabs colorScheme="blue" variant="enclosed">
          <TabList>
            <Tab>📊 Principe de base</Tab>
            <Tab>🔍 Exemple interactif</Tab>
            <Tab>💻 Requêtes SQL</Tab>
            <Tab>⚙️ Code Backend</Tab>
          </TabList>

          <TabPanels>
            {/* Onglet 1: Principe */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Alert status="info">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Principe clé</AlertTitle>
                    <AlertDescription>
                      Chaque enfant <strong>pointe vers</strong> ses parents via <Code>FatherID</Code> et <Code>MotherID</Code>
                    </AlertDescription>
                  </Box>
                </Alert>

                <Alert status="warning">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>⚠️ TRÈS IMPORTANT !</AlertTitle>
                    <AlertDescription>
                      <strong>Une même personne peut avoir 2 rôles</strong> :
                      <br />
                      • Pierre (ID=3) est <Badge colorScheme="blue">ENFANT</Badge> de Jean (FatherID=1)
                      <br />
                      • Pierre (ID=3) est aussi <Badge colorScheme="purple">PARENT</Badge> de Lucas (Lucas a FatherID=3)
                      <br />
                      <br />
                      🔄 <strong>Le PersonID ne change JAMAIS, seul le contexte change !</strong>
                    </AlertDescription>
                  </Box>
                </Alert>

                <Box bg="white" p={6} borderRadius="lg" borderWidth={1}>
                  <Heading size="md" mb={4}>Structure de la table Person</Heading>
                  <Table size="sm" variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Colonne</Th>
                        <Th>Type</Th>
                        <Th>Description</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td><Code>PersonID</Code></Td>
                        <Td>Integer</Td>
                        <Td>Identifiant unique de la personne</Td>
                      </Tr>
                      <Tr bg="yellow.50">
                        <Td><Code>FatherID</Code></Td>
                        <Td>Integer (nullable)</Td>
                        <Td><Badge colorScheme="blue">Pointe vers le père</Badge></Td>
                      </Tr>
                      <Tr bg="pink.50">
                        <Td><Code>MotherID</Code></Td>
                        <Td>Integer (nullable)</Td>
                        <Td><Badge colorScheme="pink">Pointe vers la mère</Badge></Td>
                      </Tr>
                      <Tr>
                        <Td><Code>FirstName</Code></Td>
                        <Td>String</Td>
                        <Td>Prénom</Td>
                      </Tr>
                      <Tr>
                        <Td><Code>LastName</Code></Td>
                        <Td>String</Td>
                        <Td>Nom de famille</Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </Box>

                <Box bg="green.50" p={6} borderRadius="lg" borderWidth={1} borderColor="green.200">
                  <Heading size="md" mb={4}>✅ Avantages de cette architecture</Heading>
                  <VStack align="start" spacing={3}>
                    <HStack>
                      <Badge colorScheme="green">Simple</Badge>
                      <Text>Chaque enfant sait directement qui sont ses parents</Text>
                    </HStack>
                    <HStack>
                      <Badge colorScheme="green">Efficace</Badge>
                      <Text>Relations via Foreign Keys (index automatique)</Text>
                    </HStack>
                    <HStack>
                      <Badge colorScheme="green">Flexible</Badge>
                      <Text>Support de la polygamie (un parent peut avoir plusieurs mariages)</Text>
                    </HStack>
                    <HStack>
                      <Badge colorScheme="green">Évolutif</Badge>
                      <Text>L'arbre grandit automatiquement quand on ajoute des enfants</Text>
                    </HStack>
                    <HStack>
                      <Badge colorScheme="purple">Multi-rôle</Badge>
                      <Text><strong>Une personne peut être enfant ET parent en même temps !</strong></Text>
                    </HStack>
                  </VStack>
                </Box>

                <Box bg="purple.50" p={6} borderRadius="lg" borderWidth={2} borderColor="purple.300">
                  <Heading size="md" mb={4}>🔄 Exemple concret de double rôle</Heading>
                  <VStack align="start" spacing={4}>
                    <Box>
                      <Badge colorScheme="blue" mb={2}>Pierre en tant qu'ENFANT</Badge>
                      <Code display="block" p={3} borderRadius="md" bg="white">
                        PersonID=3, FatherID=1, MotherID=2
                      </Code>
                      <Text fontSize="sm" mt={2}>
                        ➡️ Pierre pointe vers Jean (1) et Marie (2) comme ses parents
                      </Text>
                    </Box>

                    <Box>
                      <Badge colorScheme="purple" mb={2}>Pierre en tant que PARENT</Badge>
                      <Code display="block" p={3} borderRadius="md" bg="white">
                        Lucas: PersonID=5, FatherID=3, MotherID=4{'\n'}
                        Emma:  PersonID=6, FatherID=3, MotherID=4
                      </Code>
                      <Text fontSize="sm" mt={2}>
                        ➡️ Lucas et Emma pointent vers Pierre (3) comme leur père
                      </Text>
                    </Box>

                    <Alert status="success">
                      <AlertIcon />
                      <Text fontSize="sm">
                        <strong>Pierre (ID=3) a un seul PersonID</strong>, mais il joue 2 rôles différents dans l'arbre !
                      </Text>
                    </Alert>
                  </VStack>
                </Box>
              </VStack>
            </TabPanel>

            {/* Onglet 2: Exemple interactif */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Box bg="white" p={4} borderRadius="lg" borderWidth={1}>
                  <Text mb={4} fontWeight="bold">Sélectionnez une personne :</Text>
                  <HStack spacing={3} wrap="wrap">
                    {persons.map(p => (
                      <Button
                        key={p.id}
                        size="sm"
                        colorScheme={selectedPerson === p.id ? 'blue' : 'gray'}
                        onClick={() => setSelectedPerson(p.id)}
                      >
                        {p.name}
                      </Button>
                    ))}
                  </HStack>
                </Box>

                {selected && (
                  <>
                    <Box bg="blue.50" p={6} borderRadius="lg" borderWidth={2} borderColor="blue.300">
                      <Heading size="md" mb={4}>
                        Personne sélectionnée : {selected.name}
                      </Heading>
                      <Table size="sm" variant="simple">
                        <Tbody>
                          <Tr>
                            <Td fontWeight="bold">PersonID</Td>
                            <Td><Code>{selected.id}</Code></Td>
                          </Tr>
                          <Tr bg="yellow.50">
                            <Td fontWeight="bold">FatherID</Td>
                            <Td>
                              {selected.fatherId ? (
                                <Code>{selected.fatherId}</Code>
                              ) : (
                                <Badge colorScheme="gray">NULL (pas de père enregistré)</Badge>
                              )}
                            </Td>
                          </Tr>
                          <Tr bg="pink.50">
                            <Td fontWeight="bold">MotherID</Td>
                            <Td>
                              {selected.motherId ? (
                                <Code>{selected.motherId}</Code>
                              ) : (
                                <Badge colorScheme="gray">NULL (pas de mère enregistrée)</Badge>
                              )}
                            </Td>
                          </Tr>
                        </Tbody>
                      </Table>
                    </Box>

                    <Divider />

                    <Box bg="green.50" p={6} borderRadius="lg" borderWidth={1} borderColor="green.200">
                      <Heading size="sm" mb={4}>
                        👨‍👩‍👦 Parents de {selected.name} (FACILE - lecture directe)
                      </Heading>
                      {father || mother ? (
                        <VStack align="start" spacing={3}>
                          {father && (
                            <HStack>
                              <Badge colorScheme="blue">Père</Badge>
                              <Text>{father.name} (ID: {father.id})</Text>
                              <Code fontSize="xs">FatherID = {selected.fatherId}</Code>
                            </HStack>
                          )}
                          {mother && (
                            <HStack>
                              <Badge colorScheme="pink">Mère</Badge>
                              <Text>{mother.name} (ID: {mother.id})</Text>
                              <Code fontSize="xs">MotherID = {selected.motherId}</Code>
                            </HStack>
                          )}
                        </VStack>
                      ) : (
                        <Text color="gray.600">
                          Aucun parent (personne racine de l'arbre)
                        </Text>
                      )}
                    </Box>

                    <Box bg="purple.50" p={6} borderRadius="lg" borderWidth={1} borderColor="purple.200">
                      <Heading size="sm" mb={4}>
                        👶 Enfants de {selected.name} (RECHERCHE INVERSE)
                      </Heading>
                      {children.length > 0 ? (
                        <VStack align="start" spacing={3}>
                          {children.map(child => (
                            <HStack key={child.id}>
                              <Badge colorScheme="purple">Enfant</Badge>
                              <Text>{child.name} (ID: {child.id})</Text>
                              <Code fontSize="xs">
                                {child.fatherId === selected.id && 'FatherID = '}
                                {child.motherId === selected.id && 'MotherID = '}
                                {selected.id}
                              </Code>
                            </HStack>
                          ))}
                          <Alert status="info" mt={2}>
                            <AlertIcon />
                            <Text fontSize="sm">
                              On cherche toutes les personnes qui ont <Code>FatherID={selected.id}</Code> OU <Code>MotherID={selected.id}</Code>
                            </Text>
                          </Alert>
                        </VStack>
                      ) : (
                        <Text color="gray.600">
                          Aucun enfant enregistré
                        </Text>
                      )}
                    </Box>

                    {/* Indicateur de double rôle */}
                    {(father || mother) && children.length > 0 && (
                      <Alert status="success">
                        <AlertIcon />
                        <Box>
                          <AlertTitle>🔄 Double rôle détecté !</AlertTitle>
                          <AlertDescription>
                            <strong>{selected.name}</strong> est à la fois :
                            <br />
                            • <Badge colorScheme="blue">ENFANT</Badge> de {father?.name || '?'} et {mother?.name || '?'}
                            <br />
                            • <Badge colorScheme="purple">PARENT</Badge> de {children.map(c => c.name).join(', ')}
                            <br />
                            <br />
                            💡 <strong>Un seul PersonID ({selected.id}), deux rôles dans l'arbre !</strong>
                          </AlertDescription>
                        </Box>
                      </Alert>
                    )}
                  </>
                )}
              </VStack>
            </TabPanel>

            {/* Onglet 3: SQL */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <Box bg="white" p={4} borderRadius="lg" borderWidth={1}>
                  <Heading size="sm" mb={3}>1. Trouver les parents de Lucas (FACILE)</Heading>
                  <Code display="block" p={4} borderRadius="md" bg="gray.50" whiteSpace="pre">
{`SELECT 
    l.FirstName as Enfant,
    f.FirstName as Pere,
    m.FirstName as Mere
FROM Person l
LEFT JOIN Person f ON l.FatherID = f.PersonID
LEFT JOIN Person m ON l.MotherID = m.PersonID
WHERE l.PersonID = 5;

-- Résultat: Lucas | Pierre | Sophie`}
                  </Code>
                </Box>

                <Box bg="white" p={4} borderRadius="lg" borderWidth={1}>
                  <Heading size="sm" mb={3}>2. Trouver les enfants de Pierre (RECHERCHE)</Heading>
                  <Code display="block" p={4} borderRadius="md" bg="gray.50" whiteSpace="pre">
{`SELECT PersonID, FirstName, LastName
FROM Person
WHERE FatherID = 3 OR MotherID = 3;

-- Résultat: 
-- 5 | Lucas | Dupont
-- 6 | Emma  | Dupont`}
                  </Code>
                </Box>

                <Box bg="white" p={4} borderRadius="lg" borderWidth={1}>
                  <Heading size="sm" mb={3}>3. Tous les descendants de Jean (RÉCURSIF)</Heading>
                  <Code display="block" p={4} borderRadius="md" bg="gray.50" whiteSpace="pre" fontSize="xs">
{`WITH RECURSIVE descendants AS (
    SELECT PersonID, FirstName, 0 as niveau
    FROM Person WHERE PersonID = 1
    
    UNION ALL
    
    SELECT p.PersonID, p.FirstName, d.niveau + 1
    FROM Person p
    JOIN descendants d ON (p.FatherID = d.PersonID 
                        OR p.MotherID = d.PersonID)
)
SELECT * FROM descendants ORDER BY niveau;

-- Résultat:
-- Jean   (niveau 0)
-- Pierre (niveau 1)
-- Lucas  (niveau 2)
-- Emma   (niveau 2)`}
                  </Code>
                </Box>
              </VStack>
            </TabPanel>

            {/* Onglet 4: Code */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <Box bg="white" p={4} borderRadius="lg" borderWidth={1}>
                  <Heading size="sm" mb={3}>Backend C# - Trouver les parents</Heading>
                  <Code display="block" p={4} borderRadius="md" bg="gray.50" whiteSpace="pre" fontSize="xs">
{`var person = await _context.Persons
    .Include(p => p.Father)  // Charge via FatherID
    .Include(p => p.Mother)  // Charge via MotherID
    .FirstOrDefaultAsync(p => p.PersonID == 5);

// Accès direct :
Console.WriteLine($"Père: {person.Father.FirstName}");
Console.WriteLine($"Mère: {person.Mother.FirstName}");`}
                  </Code>
                </Box>

                <Box bg="white" p={4} borderRadius="lg" borderWidth={1}>
                  <Heading size="sm" mb={3}>Backend C# - Trouver les enfants</Heading>
                  <Code display="block" p={4} borderRadius="md" bg="gray.50" whiteSpace="pre" fontSize="xs">
{`var children = await _context.Persons
    .Where(p => p.FatherID == 3 || p.MotherID == 3)
    .ToListAsync();

foreach (var child in children)
{
    Console.WriteLine($"Enfant: {child.FirstName}");
}`}
                  </Code>
                </Box>

                <Box bg="white" p={4} borderRadius="lg" borderWidth={1}>
                  <Heading size="sm" mb={3}>Backend C# - Construction de l'arbre (récursif)</Heading>
                  <Code display="block" p={4} borderRadius="md" bg="gray.50" whiteSpace="pre" fontSize="xs">
{`private async Task GetDescendantsRecursive(
    int personId, 
    List<Person> descendants)
{
    var children = await _context.Persons
        .Where(p => p.FatherID == personId 
                 || p.MotherID == personId)
        .ToListAsync();

    foreach (var child in children)
    {
        if (!descendants.Any(d => d.PersonID == child.PersonID))
        {
            descendants.Add(child);
            await GetDescendantsRecursive(
                child.PersonID, 
                descendants
            );
        }
    }
}`}
                  </Code>
                </Box>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Résumé final */}
        <Box bg="orange.50" p={6} borderRadius="lg" borderWidth={2} borderColor="orange.200">
          <Heading size="md" mb={4}>💡 En résumé</Heading>
          <Table size="sm" variant="simple">
            <Thead>
              <Tr>
                <Th>Question</Th>
                <Th>Difficulté</Th>
                <Th>Méthode</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>"Qui sont les parents de X ?"</Td>
                <Td><Badge colorScheme="green">FACILE</Badge></Td>
                <Td>Lecture directe de X.FatherID et X.MotherID</Td>
              </Tr>
              <Tr>
                <Td>"Qui sont les enfants de Y ?"</Td>
                <Td><Badge colorScheme="yellow">RECHERCHE</Badge></Td>
                <Td>WHERE FatherID=Y OR MotherID=Y</Td>
              </Tr>
              <Tr>
                <Td>"Tous les descendants ?"</Td>
                <Td><Badge colorScheme="orange">RÉCURSIF</Badge></Td>
                <Td>WITH RECURSIVE ou fonction récursive</Td>
              </Tr>
              <Tr>
                <Td>"L'arbre grandit comment ?"</Td>
                <Td><Badge colorScheme="green">AUTO</Badge></Td>
                <Td>INSERT avec FatherID/MotherID remplis</Td>
              </Tr>
              <Tr bg="purple.50">
                <Td><strong>"Une personne peut être parent ET enfant ?"</strong></Td>
                <Td><Badge colorScheme="purple">OUI !</Badge></Td>
                <Td><strong>Un PersonID, plusieurs rôles selon le contexte</strong></Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>

        {/* Exemple visuel du concept */}
        <Box bg="blue.50" p={6} borderRadius="lg" borderWidth={2} borderColor="blue.300">
          <Heading size="md" mb={4}>🎯 Concept clé : Un ID, plusieurs rôles</Heading>
          <VStack spacing={4} align="stretch">
            <Code display="block" p={4} borderRadius="md" bg="white" whiteSpace="pre" fontSize="sm">
{`Génération 1:  Jean (ID=1) ←── Racine, seulement PARENT
                     ↓
Génération 2:  Pierre (ID=3)  ←── ENFANT de Jean (FatherID=1)
                     ↓              ET PARENT de Lucas (Lucas a FatherID=3)
Génération 3:  Lucas (ID=5)   ←── ENFANT de Pierre (FatherID=3)
                                   Peut devenir PARENT si on ajoute ses enfants

➡️  Pierre (ID=3) ne change JAMAIS d'ID
    Mais il a 2 rôles :
    • Ligne de Pierre : FatherID=1 (il EST enfant)
    • Ligne de Lucas  : FatherID=3 (Pierre EST parent)`}
            </Code>

            <Alert status="success">
              <AlertIcon />
              <Box>
                <AlertTitle>✅ C'est normal et c'est la force du système !</AlertTitle>
                <AlertDescription>
                  Chaque personne garde son <Code>PersonID</Code> unique, mais peut apparaître :
                  <br />
                  • Dans sa propre ligne (avec ses FatherID/MotherID) = rôle d'ENFANT
                  <br />
                  • Dans les lignes d'autres personnes (comme FatherID ou MotherID) = rôle de PARENT
                  <br />
                  <br />
                  🌳 <strong>C'est ainsi que l'arbre généalogique se construit naturellement !</strong>
                </AlertDescription>
              </Box>
            </Alert>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}

function Button(props: any) {
  return (
    <Box
      as="button"
      px={4}
      py={2}
      borderRadius="md"
      bg={props.colorScheme === 'blue' ? 'blue.500' : 'gray.200'}
      color={props.colorScheme === 'blue' ? 'white' : 'gray.700'}
      fontWeight="medium"
      _hover={{ opacity: 0.8 }}
      onClick={props.onClick}
      {...props}
    >
      {props.children}
    </Box>
  );
}
