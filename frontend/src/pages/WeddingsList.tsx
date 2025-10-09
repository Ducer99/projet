import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Badge,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Icon,
  useToast
} from '@chakra-ui/react';
import { FaHeart, FaPlus, FaRing } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface Marriage {
  weddingID: number;
  manName: string;
  womanName: string;
  patrilinealFamilyName: string;
  status: string;
  weddingDate: string;
  unionCount: number;
  unionTypes: string;
}

const WeddingsList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { t, i18n } = useTranslation();
  const [marriages, setMarriages] = useState<Marriage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarriages();
  }, []);

  const loadMarriages = async () => {
    if (!user?.familyID) return;
    
    try {
      setLoading(true);
      const response = await api.get<Marriage[]>(`/marriages/family/${user.familyID}`);
      setMarriages(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des mariages:', error);
      toast({
        title: t('common.error'),
        description: t('weddings.errorLoading'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'green', label: t('weddings.statusActive') },
      divorced: { color: 'orange', label: t('weddings.statusDivorced') },
      widowed: { color: 'gray', label: t('weddings.statusWidowed') }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'gray', label: status };
    
    return (
      <Badge colorScheme={config.color}>
        {config.label}
      </Badge>
    );
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <HStack justify="space-between">
            <HStack>
              <Icon as={FaHeart} boxSize={8} color="pink.500" />
              <Heading size="lg" color="gray.700">
                💍 {t('weddings.title')}
              </Heading>
            </HStack>
            <Button
              leftIcon={<FaPlus />}
              colorScheme="pink"
              onClick={() => navigate('/weddings/new')}
            >
              {t('weddings.create')}
            </Button>
          </HStack>

          {/* Stats */}
          <HStack spacing={4}>
            <Box bg="white" p={4} borderRadius="lg" flex={1}>
              <Text fontSize="2xl" fontWeight="bold" color="pink.500">
                {marriages.length}
              </Text>
              <Text fontSize="sm" color="gray.600">
                {t('weddings.title')}
              </Text>
            </Box>
            <Box bg="white" p={4} borderRadius="lg" flex={1}>
              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                {marriages.filter(m => m.status === 'active').length}
              </Text>
              <Text fontSize="sm" color="gray.600">
                {t('weddings.statusActive')}
              </Text>
            </Box>
            <Box bg="white" p={4} borderRadius="lg" flex={1}>
              <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                {marriages.reduce((sum, m) => sum + m.unionCount, 0)}
              </Text>
              <Text fontSize="sm" color="gray.600">
                {t('weddings.unions')}
              </Text>
            </Box>
          </HStack>

          {/* Table */}
          <Box bg="white" borderRadius="xl" p={6} shadow="sm">
            {loading ? (
              <Box textAlign="center" py={10}>
                <Spinner size="xl" color="pink.500" />
              </Box>
            ) : marriages.length === 0 ? (
              <Box textAlign="center" py={10}>
                <Icon as={FaRing} boxSize={12} color="gray.300" mb={4} />
                <Text color="gray.500" fontSize="lg">
                  {t('weddings.noWeddings')}
                </Text>
                <Text color="gray.400" fontSize="sm" mt={2}>
                  {t('weddings.create')}
                </Text>
              </Box>
            ) : (
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>{t('weddings.man')}</Th>
                    <Th>{t('weddings.woman')}</Th>
                    <Th>{t('weddings.patrilinealFamily')}</Th>
                    <Th>{t('weddings.weddingDate')}</Th>
                    <Th>{t('weddings.unions')}</Th>
                    <Th>{t('events.types.other')}</Th>
                    <Th>{t('weddings.status')}</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {marriages.map((marriage) => (
                    <Tr
                      key={marriage.weddingID}
                      _hover={{ bg: 'gray.50', cursor: 'pointer' }}
                      onClick={() => navigate(`/weddings/${marriage.weddingID}`)}
                    >
                      <Td fontWeight="medium">{marriage.manName}</Td>
                      <Td fontWeight="medium">{marriage.womanName}</Td>
                      <Td>
                        <Badge colorScheme="orange">{marriage.patrilinealFamilyName}</Badge>
                      </Td>
                      <Td>
                        {new Date(marriage.weddingDate).toLocaleDateString(i18n.language)}
                      </Td>
                      <Td>
                        <Badge colorScheme="purple">{marriage.unionCount}</Badge>
                      </Td>
                      <Td>
                        <Text fontSize="sm" color="gray.600">
                          {marriage.unionTypes}
                        </Text>
                      </Td>
                      <Td>{getStatusBadge(marriage.status)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default WeddingsList;
