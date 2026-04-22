import { useState, useEffect, useRef } from 'react';
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
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Avatar,
  AvatarGroup,
  Tooltip,
  Flex,
  Select,
  InputGroup,
  Input,
  InputLeftElement,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useBreakpointValue,
  SimpleGrid,
} from '@chakra-ui/react';
import { FaHeart, FaPlus, FaRing, FaEdit, FaTrash, FaSearch, FaUsers, FaChild } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import MarriageCard from '../components/MarriageCard';

interface Marriage {
  weddingID: number;
  manName: string;
  womanName: string;
  manID: number;
  womanID: number;
  manPhoto?: string;
  womanPhoto?: string;
  patrilinealFamilyName: string;
  status: string;
  weddingDate: string;
  endDate?: string;
  unionCount: number;
  unionTypes: string;
  children: number;
  isPolygamous: boolean;
  location?: string;
  notes?: string;
}

const WeddingsList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { t, i18n } = useTranslation();
  const [marriages, setMarriages] = useState<Marriage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const cancelRef = useRef<HTMLButtonElement>(null);
  const fetchedRef = useRef(false);

  // Responsive: basculer entre cartes (mobile) et tableau (desktop)
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Stats calculées
  const stats = {
    totalWeddings: marriages.length,
    activeUnions: marriages.filter(m => m.status === 'active').length,
    totalUnions: marriages.reduce((sum, m) => sum + (m.unionCount || 0), 0),
    totalChildren: marriages.reduce((sum, m) => sum + (m.children || 0), 0),
    polygamousUnions: marriages.filter(m => m.isPolygamous).length
  };

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
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

  const handleDeleteWedding = async () => {
    if (!deleteId) return;
    
    try {
      await api.delete(`/weddings/${deleteId}`);
      toast({
        title: t('common.success'),
        description: t('weddings.deleteSuccess'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      loadMarriages();
      onClose();
      setDeleteId(null);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || t('common.unexpectedError'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Filtrage des mariages
  const filteredMarriages = marriages.filter(marriage => {
    const searchMatch = searchTerm === '' || 
      marriage.manName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      marriage.womanName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = statusFilter === 'all' || marriage.status === statusFilter;
    
    return searchMatch && statusMatch;
  });

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
    <Box minH="100vh" bg="transparent">
      {/* Header gradient */}
      <Box bgGradient="linear(to-r, purple.900, purple.700)" py={8}>
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <HStack spacing={4}>
              <Box w="52px" h="52px" borderRadius="xl" bg="whiteAlpha.200" display="flex" alignItems="center" justifyContent="center" border="1px solid" borderColor="whiteAlpha.300">
                <Icon as={FaHeart} color="white" boxSize={5} />
              </Box>
              <Box>
                <Heading size="lg" color="white" fontWeight="700">{t('weddings.title')}</Heading>
                <Text color="whiteAlpha.700" fontSize="sm" mt={0.5}>{t('navigation.weddings')}</Text>
              </Box>
            </HStack>
            <Button
              leftIcon={<FaPlus />}
              bg="whiteAlpha.200"
              color="white"
              border="1px solid"
              borderColor="whiteAlpha.300"
              _hover={{ bg: 'whiteAlpha.300', transform: 'translateY(-1px)' }}
              onClick={() => navigate('/weddings/new')}
              fontWeight="600"
            >
              {t('weddings.createNewUnion')}
            </Button>
          </Flex>
        </Container>
      </Box>

      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} align="stretch">

          {/* Stats améliorées */}
          <HStack spacing={4} wrap="wrap">
            <Card flex={1} minW="200px">
              <CardBody>
                <Stat>
                  <StatLabel>
                    <HStack>
                      <Icon as={FaRing} color="pink.500" />
                      <Text>{t('weddings.title')}</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber color="pink.500">{stats.totalWeddings}</StatNumber>
                  <StatHelpText>{t('navigation.weddings')}</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            
            <Card flex={1} minW="200px">
              <CardBody>
                <Stat>
                  <StatLabel>
                    <HStack>
                      <Icon as={FaUsers} color="green.500" />
                      <Text>{t('weddings.unionsActive')}</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber color="green.500">{stats.activeUnions}</StatNumber>
                  <StatHelpText>{t('weddings.statusActive')}</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            
            <Card flex={1} minW="200px">
              <CardBody>
                <Stat>
                  <StatLabel>
                    <HStack>
                      <Icon as={FaHeart} color="purple.500" />
                      <Text>{t('weddings.unionsTotal')}</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber color="purple.500">{stats.totalUnions}</StatNumber>
                  <StatHelpText>{t('weddings.includeInformalUnions')}</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            
            <Card flex={1} minW="200px">
              <CardBody>
                <Stat>
                  <StatLabel>
                    <HStack>
                      <Icon as={FaChild} color="orange.500" />
                      <Text>{t('weddings.childrenTotal')}</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber color="orange.500">{stats.totalChildren}</StatNumber>
                  <StatHelpText>{t('weddings.fromAllUnions')}</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            
            {stats.polygamousUnions > 0 && (
              <Card flex={1} minW="200px">
                <CardBody>
                  <Stat>
                    <StatLabel>
                      <HStack>
                        <Icon as={FaUsers} color="yellow.500" />
                        <Text>{t('weddings.polygamousUnions')}</Text>
                      </HStack>
                    </StatLabel>
                    <StatNumber color="yellow.500">{stats.polygamousUnions}</StatNumber>
                    <StatHelpText>{t('weddings.multipleUnions')}</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            )}
          </HStack>

          {/* Filtres de recherche */}
          <Card>
            <CardBody>
              <HStack spacing={4} wrap="wrap">
                <InputGroup flex={1} minW="250px">
                  <InputLeftElement>
                    <Icon as={FaSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
                
                <Select
                  w="200px"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">{t('weddings.allStatuses')}</option>
                  <option value="active">{t('weddings.activeStatus')}</option>
                  <option value="divorced">{t('weddings.divorcedStatus')}</option>
                  <option value="widowed">{t('weddings.widowedStatus')}</option>
                </Select>
              </HStack>
            </CardBody>
          </Card>

          {/* Liste responsive: Cartes sur mobile, Tableau sur desktop */}
          {loading ? (
            <Box textAlign="center" py={10}>
              <Spinner size="xl" color="pink.500" />
              <Text mt={4} color="gray.500">{t('weddings.loading')}</Text>
            </Box>
          ) : filteredMarriages.length === 0 ? (
            <Card>
              <CardBody>
                <Box textAlign="center" py={10}>
                  <Icon as={FaRing} boxSize={12} color="gray.300" mb={4} />
                  <Text color="gray.500" fontSize="lg" mb={2}>
                    {searchTerm ? t('weddings.noUnionsFound') : t('weddings.noWeddings')}
                  </Text>
                  <Text color="gray.400" fontSize="sm" mb={4}>
                    {searchTerm 
                      ? t('common.search') 
                      : t('weddings.createNewUnion')
                    }
                  </Text>
                  {!searchTerm && (
                    <Button
                      leftIcon={<FaPlus />}
                      colorScheme="pink"
                      onClick={() => navigate('/weddings/new')}
                    >
                      {t('weddings.createNewUnion')}
                    </Button>
                  )}
                </Box>
              </CardBody>
            </Card>
          ) : isMobile ? (
            // Vue mobile: Grille de cartes
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
              {filteredMarriages.map((marriage) => (
                <MarriageCard
                  key={marriage.weddingID}
                  marriage={marriage}
                  onEdit={(id) => navigate(`/weddings/edit/${id}`)}
                  onDelete={(id) => {
                    setDeleteId(id);
                    onOpen();
                  }}
                />
              ))}
            </SimpleGrid>
          ) : (
            // Vue desktop: Tableau
            <Card>
              <CardBody>
                <Table variant="simple" size="md">
                  <Thead>
                    <Tr>
                      <Th>{t('weddings.couple')}</Th>
                      <Th>{t('weddings.patrilinealFamily')}</Th>
                      <Th>{t('weddings.weddingDate')}</Th>
                      <Th>{t('weddings.children')}</Th>
                      <Th>{t('weddings.type')}</Th>
                      <Th>{t('weddings.status')}</Th>
                      <Th>{t('common.actions')}</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredMarriages.map((marriage) => (
                      <Tr
                        key={marriage.weddingID}
                        _hover={{ bg: 'gray.50' }}
                      >
                        <Td>
                          <HStack spacing={3}>
                            <AvatarGroup size="sm" max={2}>
                              <Avatar
                                name={marriage.manName}
                                src={marriage.manPhoto}
                                cursor="pointer"
                                onClick={() => navigate(`/persons/${marriage.manID}`)}
                              />
                              <Avatar
                                name={marriage.womanName}
                                src={marriage.womanPhoto}
                                cursor="pointer"
                                onClick={() => navigate(`/persons/${marriage.womanID}`)}
                              />
                            </AvatarGroup>
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="medium" fontSize="sm">
                                {marriage.manName} & {marriage.womanName}
                              </Text>
                              {marriage.isPolygamous && (
                                <Badge colorScheme="yellow" size="sm">
                                  Polygyne
                                </Badge>
                              )}
                            </VStack>
                          </HStack>
                        </Td>
                        <Td>
                          <Badge colorScheme="orange" variant="subtle">
                            {marriage.patrilinealFamilyName}
                          </Badge>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm">
                              {new Date(marriage.weddingDate).getFullYear() <= 1900
                                ? 'Date inconnue'
                                : new Date(marriage.weddingDate).toLocaleDateString(i18n.language)}
                            </Text>
                            {marriage.endDate && (
                              <Text fontSize="xs" color="gray.500">
                                Fin: {new Date(marriage.endDate).toLocaleDateString(i18n.language)}
                              </Text>
                            )}
                          </VStack>
                        </Td>
                        <Td>
                          <Badge 
                            colorScheme={marriage.children > 0 ? "blue" : "gray"}
                            variant="solid"
                          >
                            {marriage.children}
                          </Badge>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontSize="sm" color="gray.600">
                              {marriage.unionTypes}
                            </Text>
                            <Badge colorScheme="purple" size="sm" variant="outline">
                              {marriage.unionCount} union(s)
                            </Badge>
                          </VStack>
                        </Td>
                        <Td>{getStatusBadge(marriage.status)}</Td>
                        <Td>
                          <HStack spacing={2}>
                            <Tooltip label={t('weddings.editUnion')}>
                              <Button
                                size="sm"
                                colorScheme="blue"
                                variant="ghost"
                                leftIcon={<FaEdit />}
                                onClick={() => navigate(`/weddings/edit/${marriage.weddingID}`)}
                              >
                                {t('common.edit')}
                              </Button>
                            </Tooltip>
                            <Tooltip label={t('common.delete')}>
                              <Button
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                leftIcon={<FaTrash />}
                                onClick={() => {
                                  setDeleteId(marriage.weddingID);
                                  onOpen();
                                }}
                              >
                                {t('common.delete')}
                              </Button>
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          )}
        </VStack>

        {/* Dialog de confirmation de suppression */}
        <AlertDialog isOpen={isOpen} onClose={onClose} leastDestructiveRef={cancelRef}>
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                {t('weddings.deleteUnionTitle')}
              </AlertDialogHeader>

              <AlertDialogBody>
                {t('weddings.deleteUnionMessage')}
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose}>
                  {t('common.cancel')}
                </Button>
                <Button colorScheme="red" onClick={handleDeleteWedding} ml={3}>
                  {t('common.delete')}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Container>
    </Box>
  );
};

export default WeddingsList;
