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
  HStack,
  VStack,
  Icon,
  Badge,
  Tooltip,
  Avatar,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaUserEdit, FaLock, FaArrowLeft, FaTrash } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import api from '../services/api';
import { Person } from '../types';
import { useAuth } from '../contexts/AuthContext';

const MotionBox = motion(Box);

interface PersonWithPermissions extends Person {
  canEdit?: boolean;
  isCreator?: boolean;
}

const PersonsList = () => {
  const [persons, setPersons] = useState<PersonWithPermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  // État pour la suppression
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [personToDelete, setPersonToDelete] = useState<PersonWithPermissions | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetchPersons();
  }, []);

  const fetchPersons = async () => {
    try {
      setLoading(true);
      const response = await api.get<PersonWithPermissions[]>('/persons');
      setPersons(response.data);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || t('members.fetchError'),
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // ============ PERMISSION LOGIC ============
  
  /**
   * Détermine si l'utilisateur peut supprimer une personne
   * - Admin : peut supprimer n'importe qui (mais nécessite approbation des autres membres)
   * - Utilisateur : peut supprimer sa propre fiche OU les fiches qu'il a créées
   */
  const canDeletePerson = (person: PersonWithPermissions): boolean => {
    // Admin peut supprimer qui il veut (mais nécessite approbation des autres membres)
    if (isAdmin) return true;
    
    // L'utilisateur peut supprimer sa propre fiche
    if (user?.idPerson === person.personID) return true;
    
    // L'utilisateur peut supprimer les fiches qu'il a créées
    if (person.isCreator) return true;
    
    return false;
  };

  // ============ HANDLERS ============

  const handleAddPerson = () => {
    navigate('/add-member');
  };

  const handleEditPerson = (personID: number) => {
    navigate(`/edit-person/${personID}`);
  };

  const handleViewProfile = (personID: number) => {
    navigate(`/person/${personID}`);
  };

  const handleDeleteClick = (person: PersonWithPermissions) => {
    setPersonToDelete(person);
    onOpen();
  };

  const handleDeleteConfirm = async () => {
    if (!personToDelete) return;

    try {
      // Avertissement pour l'admin : suppression nécessite approbation des autres membres
      if (isAdmin && personToDelete.personID !== user?.idPerson) {
        toast({
          title: '⚠️ ' + t('members.adminDeleteWarning'),
          description: t('members.adminDeleteWarningMessage'),
          status: 'warning',
          duration: 5000,
        });
      }

      await api.delete(`/persons/${personToDelete.personID}`);
      
      toast({
        title: t('common.success'),
        description: t('members.deleteSuccess'),
        status: 'success',
        duration: 3000,
      });
      
      // Refresh la liste
      fetchPersons();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || t('members.deleteError'),
        status: 'error',
        duration: 5000,
      });
    } finally {
      onClose();
      setPersonToDelete(null);
    }
  };

  // ============ FORMAT HELPERS ============

  const formatDate = (date: string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const getStatusBadge = (person: Person) => {
    if (person.alive) {
      return (
        <HStack spacing={2}>
          <Box
            w="8px"
            h="8px"
            borderRadius="full"
            bg="var(--status-alive-dot)"
            boxShadow="0 0 0 2px var(--status-alive-bg)"
          />
          <Text
            fontSize="sm"
            fontWeight="500"
            color="var(--status-alive-text)"
            px={2}
            py={0.5}
            borderRadius="md"
            bg="var(--status-alive-bg)"
          >
            {person.sex === 'M' ? t('common.alive_m') : t('common.alive_f')}
          </Text>
        </HStack>
      );
    } else {
      return (
        <HStack spacing={2}>
          <Box
            w="8px"
            h="8px"
            borderRadius="full"
            bg="var(--status-deceased-dot)"
            boxShadow="0 0 0 2px var(--status-deceased-bg)"
          />
          <Text
            fontSize="sm"
            fontWeight="500"
            color="var(--status-deceased-text)"
            px={2}
            py={0.5}
            borderRadius="md"
            bg="var(--status-deceased-bg)"
          >
            {person.sex === 'M' ? t('common.deceased_m') : t('common.deceased_f')}
          </Text>
        </HStack>
      );
    }
  };

  // ============ RENDER ============

  if (loading) {
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" color="var(--emotional-sage)" thickness="4px" />
          <Text color="gray.600">{t('common.loading')}</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Box minH="100vh" bg="var(--bg-primary)">
      {/* Header avec palette émotionnelle */}
      <Box
        background="var(--gradient-beige)"
        borderBottom="1px solid var(--border-color)"
        py={6}
        position="sticky"
        top={0}
        zIndex={10}
        backdropFilter="blur(10px)"
      >
        <Container maxW="container.xl">
          <VStack align="stretch" spacing={4}>
            <HStack justify="space-between" align="center">
              <HStack spacing={4}>
                <Box
                  w="4px"
                  h="40px"
                  background="var(--gradient-sage)"
                  borderRadius="full"
                />
                <VStack align="start" spacing={0}>
                  <Heading
                    size="lg"
                    color="var(--text-primary)"
                    fontWeight="600"
                  >
                    {t('members.title')}
                  </Heading>
                  <HStack spacing={2} color="var(--text-secondary)">
                    <Text fontSize="sm">
                      {persons.length} {persons.length > 1 ? t('members.members') : t('members.member')}
                    </Text>
                  </HStack>
                </VStack>
              </HStack>

              <HStack spacing={3}>
                {/* TOUT LE MONDE peut ajouter un membre (pas seulement admin) */}
                <Button
                  background="var(--gradient-sage)"
                  color="white"
                  leftIcon={<FaUserPlus />}
                  onClick={handleAddPerson}
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 16px rgba(163, 177, 138, 0.3)',
                  }}
                  transition="all 0.3s ease"
                  size="md"
                  fontWeight="500"
                >
                  {t('members.addMember')}
                </Button>

                <Button
                  bg="white"
                  border="1px solid var(--border-color)"
                  leftIcon={<FaLock />}
                  onClick={() => navigate(`/person/${user?.idPerson}`)}
                  _hover={{
                    bg: 'var(--emotional-beige-light)',
                    transform: 'translateY(-2px)',
                  }}
                  transition="all 0.3s ease"
                  size="md"
                >
                  {t('members.myProfile')}
                </Button>

                <Button
                  bg="white"
                  border="1px solid var(--border-color)"
                  leftIcon={<FaArrowLeft />}
                  onClick={() => navigate('/')}
                  _hover={{
                    bg: 'gray.50',
                  }}
                  size="md"
                >
                  {t('common.back')}
                </Button>
              </HStack>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Table des membres */}
      <Container maxW="container.xl" py={8}>
        <MotionBox
          bg="white"
          borderRadius="16px"
          boxShadow="0 2px 8px rgba(0,0,0,0.04)"
          overflow="hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead bg="var(--emotional-beige-light)">
                <Tr>
                  <Th>{t('members.photo')}</Th>
                  <Th>{t('members.fullName')}</Th>
                  <Th>{t('members.birthday')}</Th>
                  <Th>{t('members.status')}</Th>
                  <Th>{t('members.sex')}</Th>
                  <Th>{t('members.email')}</Th>
                  <Th textAlign="right">{t('members.actions')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {persons.map((person) => (
                  <Tr
                    key={person.personID}
                    _hover={{ bg: 'var(--emotional-ivory)' }}
                    transition="background 0.2s ease"
                  >
                    {/* Photo */}
                    <Td>
                      <Avatar
                        size="md"
                        name={`${person.firstName} ${person.lastName}`}
                        src={person.photoUrl}
                        border="2px solid"
                        borderColor={
                          person.sex === 'F'
                            ? 'var(--emotional-lavender)'
                            : 'var(--emotional-sage)'
                        }
                      />
                    </Td>

                    {/* Nom complet */}
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="600" color="var(--text-primary)">
                          {person.firstName} {person.lastName}
                        </Text>
                        {person.activity && (
                          <Text fontSize="xs" color="var(--text-secondary)">
                            {person.activity}
                          </Text>
                        )}
                      </VStack>
                    </Td>

                    {/* Date de naissance */}
                    <Td>
                      <Text fontSize="sm" color="var(--text-secondary)">
                        {formatDate(person.birthday)}
                      </Text>
                    </Td>

                    {/* Statut (Vivant/Décédé) */}
                    <Td>{getStatusBadge(person)}</Td>

                    {/* Sexe */}
                    <Td>
                      <Badge
                        colorScheme={person.sex === 'M' ? 'blue' : 'pink'}
                        variant="subtle"
                      >
                        {person.sex === 'M' ? t('common.male') : t('common.female')}
                      </Badge>
                    </Td>

                    {/* Email */}
                    <Td>
                      <Text fontSize="sm" color="var(--text-secondary)">
                        {person.email || '-'}
                      </Text>
                    </Td>

                    {/* Actions */}
                    <Td>
                      <HStack spacing={2} justify="flex-end">
                        {/* Bouton Voir - Tout le monde */}
                        <Tooltip label={t('members.viewProfile')}>
                          <Button
                            size="sm"
                            bg="var(--emotional-beige-light)"
                            color="var(--emotional-brown)"
                            leftIcon={<Icon as={FaUserEdit} />}
                            onClick={() => handleViewProfile(person.personID)}
                            _hover={{
                              bg: 'var(--emotional-beige)',
                            }}
                          >
                            {t('common.view')}
                          </Button>
                        </Tooltip>

                        {/* Bouton Modifier - Si canEdit */}
                        {person.canEdit && (
                          <Tooltip label={t('members.editPerson')}>
                            <Button
                              size="sm"
                              bg="blue.50"
                              color="blue.600"
                              leftIcon={<Icon as={FaUserEdit} />}
                              onClick={() => handleEditPerson(person.personID)}
                              _hover={{
                                bg: 'blue.100',
                              }}
                            >
                              {t('common.edit')}
                            </Button>
                          </Tooltip>
                        )}

                        {/* Bouton Supprimer - Basé sur canDeletePerson() */}
                        {canDeletePerson(person) && (
                          <Tooltip
                            label={
                              isAdmin && person.personID !== user?.idPerson
                                ? `${t('members.deleteMember')} (${t('members.requiresApproval')})`
                                : t('members.deleteMember')
                            }
                          >
                            <Button
                              size="sm"
                              bg="red.50"
                              color="red.600"
                              leftIcon={<Icon as={FaTrash} />}
                              onClick={() => handleDeleteClick(person)}
                              _hover={{
                                bg: 'red.100',
                              }}
                            >
                              {t('common.delete')}
                            </Button>
                          </Tooltip>
                        )}
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </MotionBox>
      </Container>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {t('members.deleteConfirmTitle')}
            </AlertDialogHeader>

            <AlertDialogBody>
              <VStack align="stretch" spacing={4}>
                <Text>
                  {t('members.deleteConfirmMessage')}{' '}
                  <strong>
                    {personToDelete?.firstName} {personToDelete?.lastName}
                  </strong>
                  ?
                </Text>

                {personToDelete && (
                  <Box
                    bg="var(--emotional-beige-light)"
                    p={3}
                    borderRadius="md"
                    border="1px solid var(--border-color)"
                  >
                    <HStack spacing={3}>
                      <Avatar
                        size="sm"
                        name={`${personToDelete.firstName} ${personToDelete.lastName}`}
                        src={personToDelete.photoUrl}
                        border="2px solid"
                        borderColor={
                          personToDelete.sex === 'F'
                            ? 'var(--emotional-lavender)'
                            : 'var(--emotional-sage)'
                        }
                      />
                      <VStack align="start" spacing={0} flex={1}>
                        <Text fontWeight="600" fontSize="sm">
                          {personToDelete.firstName} {personToDelete.lastName}
                        </Text>
                        <Text fontSize="xs" color="var(--text-secondary)">
                          {formatDate(personToDelete.birthday)}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                )}

                {/* ========== AVERTISSEMENTS CONTEXTUELS ========== */}

                {/* Avertissement orange si admin supprime quelqu'un d'autre */}
                {personToDelete && isAdmin && personToDelete.personID !== user?.idPerson && !personToDelete.isCreator && (
                  <Box
                    bg="orange.50"
                    border="1px solid"
                    borderColor="orange.200"
                    p={3}
                    borderRadius="md"
                  >
                    <HStack spacing={2} align="start">
                      <Text fontSize="20px" lineHeight="1">
                        ⚠️
                      </Text>
                      <VStack align="start" spacing={1} flex={1}>
                        <Text
                          fontWeight="600"
                          color="orange.800"
                          fontSize="sm"
                        >
                          {t('members.requiresApproval')}
                        </Text>
                        <Text fontSize="xs" color="orange.700">
                          {t('members.adminDeleteWarningMessage')}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                )}

                {/* Info bleue si suppression de sa propre fiche */}
                {personToDelete && user?.idPerson === personToDelete.personID && (
                  <Box
                    bg="blue.50"
                    border="1px solid"
                    borderColor="blue.200"
                    p={3}
                    borderRadius="md"
                  >
                    <HStack spacing={2}>
                      <Text fontSize="20px" lineHeight="1">
                        ℹ️
                      </Text>
                      <Text fontSize="sm" color="blue.800" fontWeight="500">
                        {t('members.canDeleteOwnProfile')}
                      </Text>
                    </HStack>
                  </Box>
                )}

                {/* Info verte si suppression d'une fiche créée par l'utilisateur */}
                {personToDelete && personToDelete.isCreator && user?.idPerson !== personToDelete.personID && (
                  <Box
                    bg="green.50"
                    border="1px solid"
                    borderColor="green.200"
                    p={3}
                    borderRadius="md"
                  >
                    <HStack spacing={2}>
                      <Text fontSize="20px" lineHeight="1">
                        ✨
                      </Text>
                      <Text fontSize="sm" color="green.800" fontWeight="500">
                        {t('members.canDeleteCreatedProfiles')}
                      </Text>
                    </HStack>
                  </Box>
                )}
              </VStack>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                {t('common.cancel')}
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                {t('common.delete')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default PersonsList;
