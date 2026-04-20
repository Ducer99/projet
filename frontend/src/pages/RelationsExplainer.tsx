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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Icon,
  Flex,
  SimpleGrid,
} from '@chakra-ui/react';
import { FaDna, FaUserFriends, FaChild, FaExchangeAlt, FaCheckCircle } from 'react-icons/fa';

const infoCards = [
  {
    icon: FaChild,
    label: 'Enfant → Parent',
    color: 'blue',
    text: 'Chaque enfant pointe vers ses parents via FatherID et MotherID',
  },
  {
    icon: FaUserFriends,
    label: 'Un ID, deux rôles',
    color: 'purple',
    text: 'Pierre est ENFANT de Jean ET PARENT de Lucas — même PersonID, contextes différents',
  },
  {
    icon: FaExchangeAlt,
    label: 'Recherche inverse',
    color: 'green',
    text: 'Pour trouver les enfants de Y : WHERE FatherID=Y OR MotherID=Y',
  },
];

export default function RelationsExplainer() {
  const [selectedPerson, setSelectedPerson] = useState(5);

  const persons = [
    { id: 1, name: 'Jean Dupont',   fatherId: null, motherId: null, gen: 1 },
    { id: 2, name: 'Marie Martin',  fatherId: null, motherId: null, gen: 1 },
    { id: 3, name: 'Pierre Dupont', fatherId: 1,    motherId: 2,    gen: 2 },
    { id: 4, name: 'Sophie Bernard',fatherId: null, motherId: null, gen: 1 },
    { id: 5, name: 'Lucas Dupont',  fatherId: 3,    motherId: 4,    gen: 3 },
    { id: 6, name: 'Emma Dupont',   fatherId: 3,    motherId: 4,    gen: 3 },
  ];

  const getPersonById = (id: number | null) => persons.find(p => p.id === id);
  const getChildren   = (id: number) => persons.filter(p => p.fatherId === id || p.motherId === id);

  const selected  = getPersonById(selectedPerson);
  const father    = selected ? getPersonById(selected.fatherId) : null;
  const mother    = selected ? getPersonById(selected.motherId) : null;
  const children  = selected ? getChildren(selected.id)         : [];

  const inputStyle = {
    h: '36px',
    borderRadius: '8px',
    bg: 'whiteAlpha.200',
    color: 'white',
    borderColor: 'whiteAlpha.400',
    _hover: { bg: 'whiteAlpha.300' },
  };

  return (
    <Box minH="100vh" bg="transparent">
      {/* Header gradient */}
      <Box bgGradient="linear(to-r, purple.900, purple.700)" px={6} py={8}>
        <Container maxW="container.xl">
          <HStack spacing={4}>
            <Flex
              w="56px" h="56px"
              borderRadius="xl"
              bg="whiteAlpha.200"
              align="center"
              justify="center"
            >
              <Icon as={FaDna} color="white" fontSize="24px" />
            </Flex>
            <Box>
              <Heading color="white" size="lg">Relations Parent-Enfant</Heading>
              <Text color="whiteAlpha.800" fontSize="sm" mt={1}>
                Comment fonctionne l'arbre généalogique dans la base de données
              </Text>
            </Box>
          </HStack>

          {/* Info cards in header */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mt={6}>
            {infoCards.map((card) => (
              <HStack
                key={card.label}
                bg="whiteAlpha.100"
                borderRadius="lg"
                p={4}
                spacing={3}
                align="start"
              >
                <Flex
                  w="36px" h="36px" flexShrink={0}
                  bg="whiteAlpha.200"
                  borderRadius="md"
                  align="center" justify="center"
                >
                  <Icon as={card.icon} color="white" fontSize="16px" />
                </Flex>
                <Box>
                  <Text color="white" fontWeight="bold" fontSize="sm">{card.label}</Text>
                  <Text color="whiteAlpha.800" fontSize="xs" mt={0.5}>{card.text}</Text>
                </Box>
              </HStack>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      <Container maxW="container.xl" py={8}>
        <Tabs colorScheme="purple" variant="enclosed" bg="white" borderRadius="xl" boxShadow="sm" overflow="hidden">
          <TabList px={4} pt={4} borderBottomWidth={1} borderColor="gray.100">
            <Tab fontWeight="medium" _selected={{ color: 'purple.600', borderColor: 'purple.500', bg: 'white' }}>
              Principe de base
            </Tab>
            <Tab fontWeight="medium" _selected={{ color: 'purple.600', borderColor: 'purple.500', bg: 'white' }}>
              Exemple interactif
            </Tab>
            <Tab fontWeight="medium" _selected={{ color: 'purple.600', borderColor: 'purple.500', bg: 'white' }}>
              Requêtes SQL
            </Tab>
            <Tab fontWeight="medium" _selected={{ color: 'purple.600', borderColor: 'purple.500', bg: 'white' }}>
              Code Backend
            </Tab>
          </TabList>

          <TabPanels>
            {/* ── Tab 1: Principe ── */}
            <TabPanel>
              <VStack spacing={6} align="stretch">

                {/* Key point */}
                <Box bg="purple.50" p={5} borderRadius="lg" borderLeftWidth={4} borderColor="purple.500">
                  <HStack mb={1}>
                    <Icon as={FaCheckCircle} color="purple.500" />
                    <Text fontWeight="bold" color="purple.700">Principe clé</Text>
                  </HStack>
                  <Text color="gray.700">
                    Chaque enfant <strong>pointe vers</strong> ses parents via{' '}
                    <Code colorScheme="purple">FatherID</Code> et{' '}
                    <Code colorScheme="purple">MotherID</Code>
                  </Text>
                </Box>

                {/* Warning */}
                <Box bg="orange.50" p={5} borderRadius="lg" borderLeftWidth={4} borderColor="orange.400">
                  <Text fontWeight="bold" color="orange.700" mb={2}>⚠️ TRÈS IMPORTANT</Text>
                  <Text color="gray.700">
                    <strong>Une même personne peut avoir 2 rôles :</strong>
                  </Text>
                  <VStack align="start" spacing={1} mt={2} pl={3}>
                    <Text fontSize="sm">
                      • Pierre (ID=3) est <Badge colorScheme="blue">ENFANT</Badge> de Jean (FatherID=1)
                    </Text>
                    <Text fontSize="sm">
                      • Pierre (ID=3) est aussi <Badge colorScheme="purple">PARENT</Badge> de Lucas
                    </Text>
                  </VStack>
                  <Text fontSize="sm" color="orange.700" mt={3} fontWeight="semibold">
                    🔄 Le PersonID ne change JAMAIS — seul le contexte change !
                  </Text>
                </Box>

                {/* Table */}
                <Box borderRadius="lg" borderWidth={1} borderColor="gray.200" overflow="hidden">
                  <Box px={5} py={3} bg="gray.50" borderBottomWidth={1} borderColor="gray.200">
                    <Text fontWeight="bold" color="gray.700">Structure de la table Person</Text>
                  </Box>
                  <Table size="sm" variant="simple">
                    <Thead bg="gray.50">
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
                      <Tr bg="blue.50">
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

                {/* Advantages */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {[
                    { label: 'Simple', text: 'Chaque enfant sait directement qui sont ses parents', color: 'green' },
                    { label: 'Efficace', text: 'Relations via Foreign Keys (index automatique)', color: 'green' },
                    { label: 'Flexible', text: 'Support de la polygamie (plusieurs mariages)', color: 'blue' },
                    { label: 'Multi-rôle', text: 'Une personne peut être enfant ET parent simultanément', color: 'purple' },
                  ].map(({ label, text, color }) => (
                    <HStack
                      key={label}
                      p={4}
                      bg="white"
                      borderRadius="lg"
                      borderWidth={1}
                      borderColor="gray.200"
                      spacing={3}
                    >
                      <Badge colorScheme={color} px={2} py={1} borderRadius="md">{label}</Badge>
                      <Text fontSize="sm" color="gray.700">{text}</Text>
                    </HStack>
                  ))}
                </SimpleGrid>

                {/* Double role example */}
                <Box borderRadius="lg" borderWidth={1} borderColor="purple.200" overflow="hidden">
                  <Box px={5} py={3} bg="purple.50" borderBottomWidth={1} borderColor="purple.200">
                    <Text fontWeight="bold" color="purple.700">🔄 Exemple concret de double rôle</Text>
                  </Box>
                  <Box p={5}>
                    <VStack align="start" spacing={4}>
                      <Box>
                        <Badge colorScheme="blue" mb={2}>Pierre en tant qu'ENFANT</Badge>
                        <Code display="block" p={3} borderRadius="md" bg="gray.50">
                          PersonID=3, FatherID=1, MotherID=2
                        </Code>
                        <Text fontSize="sm" color="gray.600" mt={2}>
                          ➡️ Pierre pointe vers Jean (1) et Marie (2) comme ses parents
                        </Text>
                      </Box>
                      <Box>
                        <Badge colorScheme="purple" mb={2}>Pierre en tant que PARENT</Badge>
                        <Code display="block" p={3} borderRadius="md" bg="gray.50" whiteSpace="pre">
                          {`Lucas: PersonID=5, FatherID=3, MotherID=4\nEmma:  PersonID=6, FatherID=3, MotherID=4`}
                        </Code>
                        <Text fontSize="sm" color="gray.600" mt={2}>
                          ➡️ Lucas et Emma pointent vers Pierre (3) comme leur père
                        </Text>
                      </Box>
                      <Box bg="green.50" px={4} py={3} borderRadius="md" borderLeftWidth={3} borderColor="green.400" w="100%">
                        <Text fontSize="sm" color="green.800">
                          ✅ <strong>Pierre (ID=3) a un seul PersonID</strong>, mais il joue 2 rôles différents dans l'arbre !
                        </Text>
                      </Box>
                    </VStack>
                  </Box>
                </Box>
              </VStack>
            </TabPanel>

            {/* ── Tab 2: Exemple interactif ── */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Box borderRadius="lg" borderWidth={1} borderColor="gray.200" p={5}>
                  <Text mb={4} fontWeight="bold" color="gray.700">Sélectionnez une personne :</Text>
                  <HStack spacing={3} wrap="wrap">
                    {persons.map(p => (
                      <Button
                        key={p.id}
                        size="sm"
                        borderRadius="full"
                        colorScheme={selectedPerson === p.id ? 'purple' : 'gray'}
                        variant={selectedPerson === p.id ? 'solid' : 'outline'}
                        onClick={() => setSelectedPerson(p.id)}
                      >
                        {p.name}
                      </Button>
                    ))}
                  </HStack>
                </Box>

                {selected && (
                  <>
                    {/* Selected person data */}
                    <Box borderRadius="lg" borderWidth={2} borderColor="purple.200" overflow="hidden">
                      <Box px={5} py={3} bgGradient="linear(to-r, purple.500, purple.700)">
                        <Text color="white" fontWeight="bold">
                          Données de : {selected.name}
                        </Text>
                      </Box>
                      <Table size="sm" variant="simple">
                        <Tbody>
                          <Tr>
                            <Td fontWeight="bold" w="150px">PersonID</Td>
                            <Td><Code colorScheme="purple">{selected.id}</Code></Td>
                          </Tr>
                          <Tr bg="blue.50">
                            <Td fontWeight="bold">FatherID</Td>
                            <Td>
                              {selected.fatherId
                                ? <Code>{selected.fatherId}</Code>
                                : <Badge colorScheme="gray">NULL</Badge>}
                            </Td>
                          </Tr>
                          <Tr bg="pink.50">
                            <Td fontWeight="bold">MotherID</Td>
                            <Td>
                              {selected.motherId
                                ? <Code>{selected.motherId}</Code>
                                : <Badge colorScheme="gray">NULL</Badge>}
                            </Td>
                          </Tr>
                        </Tbody>
                      </Table>
                    </Box>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      {/* Parents */}
                      <Box bg="blue.50" p={5} borderRadius="lg" borderWidth={1} borderColor="blue.200">
                        <Text fontWeight="bold" color="blue.700" mb={3}>
                          👨‍👩‍👦 Parents (lecture directe)
                        </Text>
                        {father || mother ? (
                          <VStack align="start" spacing={2}>
                            {father && (
                              <HStack>
                                <Badge colorScheme="blue">Père</Badge>
                                <Text fontSize="sm">{father.name}</Text>
                                <Code fontSize="xs">ID={father.id}</Code>
                              </HStack>
                            )}
                            {mother && (
                              <HStack>
                                <Badge colorScheme="pink">Mère</Badge>
                                <Text fontSize="sm">{mother.name}</Text>
                                <Code fontSize="xs">ID={mother.id}</Code>
                              </HStack>
                            )}
                          </VStack>
                        ) : (
                          <Text fontSize="sm" color="gray.500">Personne racine — aucun parent enregistré</Text>
                        )}
                      </Box>

                      {/* Children */}
                      <Box bg="purple.50" p={5} borderRadius="lg" borderWidth={1} borderColor="purple.200">
                        <Text fontWeight="bold" color="purple.700" mb={3}>
                          👶 Enfants (recherche inverse)
                        </Text>
                        {children.length > 0 ? (
                          <VStack align="start" spacing={2}>
                            {children.map(child => (
                              <HStack key={child.id}>
                                <Badge colorScheme="purple">Enfant</Badge>
                                <Text fontSize="sm">{child.name}</Text>
                                <Code fontSize="xs">ID={child.id}</Code>
                              </HStack>
                            ))}
                            <Text fontSize="xs" color="purple.600" mt={2}>
                              WHERE FatherID={selected.id} OR MotherID={selected.id}
                            </Text>
                          </VStack>
                        ) : (
                          <Text fontSize="sm" color="gray.500">Aucun enfant enregistré</Text>
                        )}
                      </Box>
                    </SimpleGrid>

                    {/* Double role detected */}
                    {(father || mother) && children.length > 0 && (
                      <Box bg="green.50" p={5} borderRadius="lg" borderLeftWidth={4} borderColor="green.500">
                        <Text fontWeight="bold" color="green.700" mb={2}>🔄 Double rôle détecté !</Text>
                        <Text fontSize="sm" color="gray.700">
                          <strong>{selected.name}</strong> est à la fois :{' '}
                          <Badge colorScheme="blue">ENFANT</Badge> de {father?.name || '?'} et {mother?.name || '?'},{' '}
                          et <Badge colorScheme="purple">PARENT</Badge> de {children.map(c => c.name).join(', ')}.
                        </Text>
                        <Text fontSize="sm" color="green.700" mt={2} fontWeight="semibold">
                          💡 Un seul PersonID ({selected.id}), deux rôles dans l'arbre !
                        </Text>
                      </Box>
                    )}
                  </>
                )}
              </VStack>
            </TabPanel>

            {/* ── Tab 3: SQL ── */}
            <TabPanel>
              <VStack spacing={5} align="stretch">
                {[
                  {
                    title: '1. Trouver les parents de Lucas (FACILE)',
                    difficulty: 'FACILE',
                    color: 'green',
                    code: `SELECT
    l.FirstName as Enfant,
    f.FirstName as Pere,
    m.FirstName as Mere
FROM Person l
LEFT JOIN Person f ON l.FatherID = f.PersonID
LEFT JOIN Person m ON l.MotherID = m.PersonID
WHERE l.PersonID = 5;

-- Résultat: Lucas | Pierre | Sophie`,
                  },
                  {
                    title: '2. Trouver les enfants de Pierre (RECHERCHE)',
                    difficulty: 'RECHERCHE',
                    color: 'yellow',
                    code: `SELECT PersonID, FirstName, LastName
FROM Person
WHERE FatherID = 3 OR MotherID = 3;

-- Résultat:
-- 5 | Lucas | Dupont
-- 6 | Emma  | Dupont`,
                  },
                  {
                    title: '3. Tous les descendants de Jean (RÉCURSIF)',
                    difficulty: 'RÉCURSIF',
                    color: 'orange',
                    code: `WITH RECURSIVE descendants AS (
    SELECT PersonID, FirstName, 0 as niveau
    FROM Person WHERE PersonID = 1

    UNION ALL

    SELECT p.PersonID, p.FirstName, d.niveau + 1
    FROM Person p
    JOIN descendants d ON (p.FatherID = d.PersonID
                        OR p.MotherID = d.PersonID)
)
SELECT * FROM descendants ORDER BY niveau;

-- Jean   (niveau 0)
-- Pierre (niveau 1)
-- Lucas  (niveau 2)
-- Emma   (niveau 2)`,
                  },
                ].map(({ title, difficulty, color, code }) => (
                  <Box key={title} borderRadius="lg" borderWidth={1} borderColor="gray.200" overflow="hidden">
                    <HStack px={5} py={3} bg="gray.50" borderBottomWidth={1} borderColor="gray.100" justify="space-between">
                      <Text fontWeight="bold" color="gray.700" fontSize="sm">{title}</Text>
                      <Badge colorScheme={color}>{difficulty}</Badge>
                    </HStack>
                    <Code
                      display="block"
                      p={5}
                      bg="gray.900"
                      color="green.300"
                      whiteSpace="pre"
                      fontSize="xs"
                      borderRadius="0"
                      overflowX="auto"
                    >
                      {code}
                    </Code>
                  </Box>
                ))}
              </VStack>
            </TabPanel>

            {/* ── Tab 4: Code Backend ── */}
            <TabPanel>
              <VStack spacing={5} align="stretch">
                {[
                  {
                    title: 'Trouver les parents',
                    code: `var person = await _context.Persons
    .Include(p => p.Father)  // Charge via FatherID
    .Include(p => p.Mother)  // Charge via MotherID
    .FirstOrDefaultAsync(p => p.PersonID == 5);

Console.WriteLine($"Père: {person.Father.FirstName}");
Console.WriteLine($"Mère: {person.Mother.FirstName}");`,
                  },
                  {
                    title: 'Trouver les enfants',
                    code: `var children = await _context.Persons
    .Where(p => p.FatherID == 3 || p.MotherID == 3)
    .ToListAsync();

foreach (var child in children)
{
    Console.WriteLine($"Enfant: {child.FirstName}");
}`,
                  },
                  {
                    title: 'Construction récursive de l\'arbre',
                    code: `private async Task GetDescendantsRecursive(
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
}`,
                  },
                ].map(({ title, code }) => (
                  <Box key={title} borderRadius="lg" borderWidth={1} borderColor="gray.200" overflow="hidden">
                    <Box px={5} py={3} bg="gray.50" borderBottomWidth={1} borderColor="gray.100">
                      <Text fontWeight="bold" color="gray.700" fontSize="sm">{title}</Text>
                    </Box>
                    <Code
                      display="block"
                      p={5}
                      bg="gray.900"
                      color="cyan.300"
                      whiteSpace="pre"
                      fontSize="xs"
                      borderRadius="0"
                      overflowX="auto"
                    >
                      {code}
                    </Code>
                  </Box>
                ))}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Summary table */}
        <Box mt={6} bg="white" borderRadius="xl" boxShadow="sm" overflow="hidden">
          <Box px={6} py={4} bgGradient="linear(to-r, purple.500, purple.700)">
            <Text color="white" fontWeight="bold">💡 Récapitulatif</Text>
          </Box>
          <Table size="sm" variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>Question</Th>
                <Th>Difficulté</Th>
                <Th>Méthode</Th>
              </Tr>
            </Thead>
            <Tbody>
              {[
                { q: '"Qui sont les parents de X ?"', d: 'FACILE', c: 'green', m: 'Lecture directe de X.FatherID et X.MotherID' },
                { q: '"Qui sont les enfants de Y ?"', d: 'RECHERCHE', c: 'yellow', m: 'WHERE FatherID=Y OR MotherID=Y' },
                { q: '"Tous les descendants ?"', d: 'RÉCURSIF', c: 'orange', m: 'WITH RECURSIVE ou fonction récursive' },
                { q: '"L\'arbre grandit comment ?"', d: 'AUTO', c: 'blue', m: 'INSERT avec FatherID/MotherID remplis' },
                { q: '"Une personne peut être parent ET enfant ?"', d: 'OUI !', c: 'purple', m: 'Un PersonID, plusieurs rôles selon le contexte' },
              ].map(({ q, d, c, m }) => (
                <Tr key={q}>
                  <Td fontSize="sm">{q}</Td>
                  <Td><Badge colorScheme={c}>{d}</Badge></Td>
                  <Td fontSize="sm" color="gray.600">{m}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Container>
    </Box>
  );
}
