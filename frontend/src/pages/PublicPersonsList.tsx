import { useState, useEffect } from 'react';
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
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Person } from '../types';

const PublicPersonsList = () => {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const fetchPersons = async () => {
      try {
        // Appel sans authentification
        const response = await axios.get('http://localhost:5000/api/persons');
        setPersons(response.data);
      } catch (error) {
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les personnes. Vous devez peut-être vous connecter.',
          status: 'error',
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPersons();
  }, [toast]);

  if (loading) {
    return (
      <Container maxW="container.xl" py={8} textAlign="center">
        <Spinner size="xl" />
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={6}>
        <Heading size="lg" mb={2}>Trouver votre ID de personne</Heading>
        <Text color="gray.600" mb={4}>
          Cherchez votre nom dans la liste ci-dessous pour trouver votre ID de personne, 
          nécessaire pour créer un compte.
        </Text>
        <Box>
          <Button colorScheme="blue" onClick={() => navigate('/login')} mr={2}>
            Se connecter
          </Button>
          <Button onClick={() => navigate('/register')}>
            S'inscrire
          </Button>
        </Box>
      </Box>

      {persons.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Text fontSize="lg" color="gray.500">
            Aucune personne disponible. Veuillez contacter l'administrateur.
          </Text>
          <Button mt={4} onClick={() => navigate('/login')}>
            Retour à la connexion
          </Button>
        </Box>
      ) : (
        <Box overflowX="auto" borderWidth={1} borderRadius="lg">
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>ID</Th>
                <Th>Nom</Th>
                <Th>Prénom</Th>
                <Th>Sexe</Th>
                <Th>Activité</Th>
              </Tr>
            </Thead>
            <Tbody>
              {persons.map((person) => (
                <Tr key={person.personID} _hover={{ bg: 'gray.50' }}>
                  <Td fontWeight="bold">{person.personID}</Td>
                  <Td>{person.lastName}</Td>
                  <Td>{person.firstName}</Td>
                  <Td>{person.sex === 'M' ? 'Homme' : 'Femme'}</Td>
                  <Td>{person.activity || '-'}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      <Box mt={6} p={4} bg="blue.50" borderRadius="md">
        <Heading size="sm" mb={2}>Comment s'inscrire ?</Heading>
        <Text fontSize="sm">
          1. Trouvez votre ID dans la colonne "ID" ci-dessus<br />
          2. Cliquez sur "S'inscrire"<br />
          3. Entrez votre ID de personne et vos informations<br />
          4. Connectez-vous avec votre nouveau compte
        </Text>
      </Box>
    </Container>
  );
};

export default PublicPersonsList;
