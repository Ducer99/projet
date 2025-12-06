import { useState, useEffect, FormEvent, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Heading,
  Text,
  Alert,
  AlertIcon,
  AlertDescription,
  Radio,
  RadioGroup,
  Stack,
  Select,
  useToast,
  Divider,
  Icon,
  Avatar,
  Card,
  CardBody,
  Badge,
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Grid,
  GridItem,
  Textarea,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { 
  FaMale, 
  FaFemale, 
  FaSave, 
  FaTimes, 
  FaSkullCrossbones,
  FaUser,
  FaUsers,
  FaBook,
  FaArrowLeft,
  FaCrown,
} from 'react-icons/fa';
import api from '../services/api';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

interface MemberData {
  personID: number;
  firstName: string;
  lastName: string;
  sex: string;
  birthday: string | null;
  deathDate: string | null;
  alive: boolean;
  email: string;
  activity: string;
  photoUrl: string;
  notes: string;
  cityID: number;
  fatherID: number | null;
  motherID: number | null;
  familyID: number;
  status: string;
  cityName?: string;
  fatherName?: string;
  motherName?: string;
}

interface FamilyMember {
  personID: number;
  firstName: string;
  lastName: string;
  sex: string;
  birthday: string | null;
  alive: boolean;
  status: string;
}

export default function EditMemberV2() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();

  const [member, setMember] = useState<MemberData | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [sex, setSex] = useState('M'); // Valeur par défaut: M
  const [birthday, setBirthday] = useState('');
  const [deathDate, setDeathDate] = useState('');
  const [alive, setAlive] = useState(true);
  const [email, setEmail] = useState('');
  const [activity, setActivity] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [cityID, setCityID] = useState(1);
  const [fatherID, setFatherID] = useState<number | undefined>();
  const [motherID, setMotherID] = useState<number | undefined>();
  
  // Role management (Admin only)
  const [userRole, setUserRole] = useState<string>('Member'); // Rôle du membre édité
  const [currentUserIsAdmin, setCurrentUserIsAdmin] = useState(false); // Est-ce que l'utilisateur connecté est Admin?
  
  // Photo upload state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Parent input modes
  const [fatherMode, setFatherMode] = useState<'select' | 'manual'>('select');
  const [motherMode, setMotherMode] = useState<'select' | 'manual'>('select');
  const [fatherFirstName, setFatherFirstName] = useState('');
  const [fatherLastName, setFatherLastName] = useState('');
  const [motherFirstName, setMotherFirstName] = useState('');
  const [motherLastName, setMotherLastName] = useState('');

  useEffect(() => {
    loadMember();
    loadFamilyMembers();
  }, [id]);

  const loadMember = async () => {
    try {
      const response = await api.get(`/persons/${id}`);
      const data = response.data;
      setMember(data);
      
      setFirstName(data.firstName || '');
      setLastName(data.lastName || '');
      setSex(data.sex || 'M'); // Valeur par défaut: M si vide
      setBirthday(data.birthday ? data.birthday.split('T')[0] : '');
      setDeathDate(data.deathDate ? data.deathDate.split('T')[0] : '');
      setAlive(data.alive);
      setEmail(data.email || '');
      setActivity(data.activity || '');
      setPhotoUrl(data.photoUrl || '');
      setNotes(data.notes || '');
      setCityID(data.cityID || 1);
      setFatherID(data.fatherID || undefined);
      setMotherID(data.motherID || undefined);
      
      // 👑 Charger le rôle de l'utilisateur (si un compte existe pour cette personne)
      try {
        const roleResponse = await api.get(`/persons/${id}/role`);
        setUserRole(roleResponse.data.role || 'Member');
        setCurrentUserIsAdmin(roleResponse.data.canModifyRole || false);
      } catch (error) {
        // Si pas de compte, c'est normal (placeholder)
        console.log('Aucun compte associé à cette personne');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading member:', error);
      toast({
        title: t('common.error'),
        description: t('editMember.loadError'),
        status: 'error',
        duration: 5000,
      });
      setLoading(false);
    }
  };

  const loadFamilyMembers = async () => {
    try {
      const response = await api.get('/persons');
      const members = response.data.filter((m: FamilyMember) => m.personID !== parseInt(id || '0'));
      setFamilyMembers(members);
    } catch (error) {
      console.error('Error loading family members:', error);
    }
  };

  const calculateAge = (birthday: string): number => {
    const birth = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const maleFamilyMembers = familyMembers.filter(m => m.sex === 'M');
  const femaleFamilyMembers = familyMembers.filter(m => m.sex === 'F');

  // Handle file selection and preview
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: t('common.error'),
          description: t('editMember.invalidImageType', 'Veuillez sélectionner un fichier image'),
          status: 'error',
          duration: 3000,
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: t('common.error'),
          description: t('editMember.imageTooLarge', 'L\'image ne doit pas dépasser 5 MB'),
          status: 'error',
          duration: 3000,
        });
        return;
      }

      setPhotoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Remove selected photo
  // Photo removal happens automatically on avatar click + new file selection

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Toujours utiliser FormData pour être compatible avec le backend [FromForm]
      const formData = new FormData();

      // Ajouter le fichier photo seulement s'il a été modifié
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      // Ajouter tous les autres champs de texte
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('sex', sex);
      if (birthday) formData.append('birthday', birthday);
      
      // Envoyer une chaîne vide si la date de décès est nulle pour la supprimer
      formData.append('deathDate', deathDate || '');

      formData.append('alive', alive ? 'true' : 'false');
      if (email) formData.append('email', email);
      if (activity) formData.append('activity', activity);
      if (notes) formData.append('notes', notes);
      formData.append('cityID', String(cityID));
      
      // Conserver l'URL de la photo existante si aucune nouvelle n'est téléchargée
      if (!photoFile && photoUrl) {
        formData.append('photoUrl', photoUrl);
      }

      // Gestion des parents
      if (fatherMode === 'select' && fatherID) {
        formData.append('fatherID', String(fatherID));
      } else if (fatherMode === 'manual' && fatherFirstName && fatherLastName) {
        formData.append('fatherFirstName', fatherFirstName);
        formData.append('fatherLastName', fatherLastName);
      }

      if (motherMode === 'select' && motherID) {
        formData.append('motherID', String(motherID));
      } else if (motherMode === 'manual' && motherFirstName && motherLastName) {
        formData.append('motherFirstName', motherFirstName);
        formData.append('motherLastName', motherLastName);
      }

      // ⚠️ IMPORTANT : Ne PAS définir 'Content-Type' manuellement.
      // Le navigateur le fera automatiquement pour FormData avec le boundary correct.
      await api.put(`/persons/${id}`, formData);

      toast({
        title: t('common.success'),
        description: t('editMember.memberUpdated', { name: `${firstName} ${lastName}` }),
        status: 'success',
        duration: 3000,
      });

      // Redirige vers la liste des membres (le chemin correct est /persons)
      navigate('/persons');

    } catch (error: any) {
      console.error('Error updating member:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // Message d'erreur détaillé
      let errorMessage = t('editMember.updateError');
      
      if (error.response?.status === 400) {
        errorMessage = '❌ Erreur 400: Le backend ne peut pas parser les données. Vérifiez que [FromForm] est implémenté.';
      } else if (error.response?.status === 415) {
        errorMessage = '❌ Erreur 415: Le backend n\'accepte pas multipart/form-data. Changez [FromBody] → [FromForm].';
      } else if (error.response?.status === 500) {
        errorMessage = '❌ Erreur 500: Erreur serveur. Vérifiez les logs backend.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast({
        title: t('common.error'),
        description: errorMessage,
        status: 'error',
        duration: 8000,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
        <VStack spacing={4}>
          <Spinner size="xl" color="purple.500" thickness="4px" />
          <Text color="gray.600">{t('editMember.loadingMember')}</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="#F3F4F6" py={8}>
      <Container maxW="5xl">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Main Card with Gradient Header - Modern Profile Card Design */}
          <Card 
            shadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" 
            borderRadius="16px"
            overflow="hidden"
            bg="white"
          >
            {/* GRADIENT BANNER HEADER - "Wow Factor" */}
            <Box
              bgGradient="linear(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)"
              h="160px"
              position="relative"
            >
              {/* Back Button Floating on Gradient */}
              <Tooltip label={t('common.back')}>
                <IconButton
                  aria-label="Back"
                  icon={<FaArrowLeft />}
                  onClick={() => navigate('/members')}
                  position="absolute"
                  top={4}
                  left={4}
                  bg="whiteAlpha.300"
                  backdropFilter="blur(10px)"
                  color="white"
                  _hover={{ 
                    bg: 'whiteAlpha.500',
                    transform: 'scale(1.05)'
                  }}
                  _active={{ bg: 'whiteAlpha.600' }}
                  size="lg"
                  borderRadius="full"
                  transition="all 0.2s"
                />
              </Tooltip>
              
              {/* Avatar Floating Over Banner - Center Aligned & CLICKABLE */}
              <Box
                position="absolute"
                bottom="-60px"
                left="50%"
                transform="translateX(-50%)"
                cursor="pointer"
                onClick={handleAvatarClick}
                role="button"
                aria-label="Changer la photo de profil"
              >
                {/* Avatar with Hover Overlay Effect */}
                <Box
                  position="relative"
                  borderRadius="full"
                  overflow="hidden"
                  _hover={{
                    transform: 'scale(1.05)',
                    '&::after': {
                      opacity: 1,
                    },
                  }}
                  _after={{
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bg: 'blackAlpha.500',
                    opacity: 0,
                    transition: 'opacity 0.3s',
                    pointerEvents: 'none',
                  }}
                  transition="transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                >
                  <Avatar 
                    size="2xl" 
                    src={photoPreview || photoUrl} 
                    name={`${firstName} ${lastName}`}
                    filter={!alive ? 'grayscale(100%)' : 'none'}
                    opacity={!alive ? 0.8 : 1}
                    border="6px solid white"
                    shadow="0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
                  />
                </Box>
                
                {/* Hidden file input */}
                <Input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  display="none"
                />
                
                {/* Camera Icon Overlay - Modern Upload Badge */}
                <Box
                  position="absolute"
                  bottom={2}
                  right={2}
                  bg="#6366F1"
                  borderRadius="full"
                  p={3}
                  _hover={{ 
                    bg: '#4F46E5',
                    transform: 'scale(1.1)',
                  }}
                  transition="all 0.2s"
                  boxShadow="0 4px 6px -1px rgba(99, 102, 241, 0.6), 0 2px 4px -1px rgba(0, 0, 0, 0.1)"
                  border="3px solid white"
                  pointerEvents="none"
                >
                  <Icon as={FaUser} color="white" boxSize={4} />
                </Box>
              </Box>
            </Box>

            <CardBody pt="80px" px={8} pb={0}>
              {/* Profile Info Header - Center Aligned */}
              <VStack spacing={3} mb={8}>
                <Heading size="xl" color="#1F2937" fontWeight="700" textAlign="center">
                  {firstName} {lastName}
                </Heading>
                <HStack spacing={3}>
                  <Badge 
                    colorScheme={alive ? 'green' : 'red'} 
                    fontSize="sm" 
                    px={4} 
                    py={1} 
                    borderRadius="full"
                    fontWeight="600"
                  >
                    {alive ? '🌱 ' + t('editMember.alive') : '🕊️ ' + t('editMember.deceased')}
                  </Badge>
                  {member?.status && (
                    <Badge 
                      colorScheme={
                        member.status === 'confirmed' ? 'purple' :
                        member.status === 'deceased' ? 'gray' : 'yellow'
                      }
                      fontSize="sm"
                      px={4} 
                      py={1} 
                      borderRadius="full"
                      fontWeight="600"
                    >
                      {member.status === 'confirmed' ? t('editMember.statusConfirmed') :
                       member.status === 'deceased' ? t('editMember.statusDeceased') : 
                       t('editMember.statusPending')}
                    </Badge>
                  )}
                </HStack>
              </VStack>

              <Divider mb={6} borderColor="#E5E7EB" />
            </CardBody>

            <CardBody p={0}>
              <form onSubmit={handleSubmit}>
                <Tabs 
                  index={activeTab} 
                  onChange={setActiveTab}
                  colorScheme="purple"
                  variant="soft-rounded"
                >
                  <TabList 
                    position="sticky"
                    top="70px"
                    zIndex={900}
                    bg="white"
                    px={8} 
                    pt={4} 
                    pb={4}
                    gap={2}
                    borderBottom="2px solid"
                    borderColor="#E5E7EB"
                    boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                    transition="all 0.3s"
                  >
                    <Tab 
                      fontWeight="600"
                      fontSize="md"
                      px={6}
                      py={3}
                      borderRadius="10px"
                      color="#4B5563"
                      _selected={{ 
                        color: 'white',
                        bg: '#6366F1',
                        shadow: '0 4px 6px -1px rgba(99, 102, 241, 0.4)'
                      }}
                      _hover={{ bg: '#F3F4F6' }}
                      transition="all 0.2s"
                    >
                      <Icon as={FaUser} mr={2} />
                      {t('editMember.tabGeneral', 'Général')}
                    </Tab>
                    <Tab 
                      fontWeight="600"
                      fontSize="md"
                      px={6}
                      py={3}
                      borderRadius="10px"
                      color="#4B5563"
                      _selected={{ 
                        color: 'white',
                        bg: '#6366F1',
                        shadow: '0 4px 6px -1px rgba(99, 102, 241, 0.4)'
                      }}
                      _hover={{ bg: '#F3F4F6' }}
                      transition="all 0.2s"
                    >
                      <Icon as={FaUsers} mr={2} />
                      {t('editMember.tabFamily', 'Famille')}
                    </Tab>
                    <Tab 
                      fontWeight="600"
                      fontSize="md"
                      px={6}
                      py={3}
                      borderRadius="10px"
                      color="#4B5563"
                      _selected={{ 
                        color: 'white',
                        bg: '#6366F1',
                        shadow: '0 4px 6px -1px rgba(99, 102, 241, 0.4)'
                      }}
                      _hover={{ bg: '#F3F4F6' }}
                      transition="all 0.2s"
                    >
                      <Icon as={FaBook} mr={2} />
                      {t('editMember.tabBioNotes', 'Bio & Notes')}
                    </Tab>
                  </TabList>

                  <TabPanels>
                    {/* TAB 1: GÉNÉRAL */}
                    <TabPanel px={8} py={6}>
                      <VStack spacing={6} align="stretch">
                        {/* Noms - Grid 2 colonnes */}
                        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                          <GridItem>
                            <FormControl isRequired>
                              <FormLabel 
                                fontWeight="600" 
                                color="#4B5563"
                                fontSize="sm"
                                mb={3}
                              >
                                {t('profile.firstName')}
                              </FormLabel>
                              <Input
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                h="48px"
                                borderRadius="8px"
                                borderColor="#E5E7EB"
                                _hover={{ borderColor: '#D1D5DB' }}
                                _focus={{ 
                                  borderColor: '#6366F1',
                                  boxShadow: '0 0 0 1px #6366F1'
                                }}
                                fontSize="md"
                                fontWeight="500"
                                color="#1F2937"
                                transition="all 0.2s"
                              />
                            </FormControl>
                          </GridItem>
                          <GridItem>
                            <FormControl isRequired>
                              <FormLabel 
                                fontWeight="600" 
                                color="#4B5563"
                                fontSize="sm"
                                mb={3}
                              >
                                {t('profile.lastName')}
                              </FormLabel>
                              <Input
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                h="48px"
                                borderRadius="8px"
                                borderColor="#E5E7EB"
                                _hover={{ borderColor: '#D1D5DB' }}
                                _focus={{ 
                                  borderColor: '#6366F1',
                                  boxShadow: '0 0 0 1px #6366F1'
                                }}
                                fontSize="md"
                                fontWeight="500"
                                color="#1F2937"
                                transition="all 0.2s"
                              />
                            </FormControl>
                          </GridItem>
                        </Grid>

                        {/* Sexe */}
                        <FormControl isRequired>
                          <FormLabel 
                            fontWeight="600" 
                            color="#4B5563"
                            fontSize="sm"
                            mb={3}
                          >
                            {t('profile.sex')}
                          </FormLabel>
                          <RadioGroup value={sex} onChange={setSex}>
                            <Stack direction="row" spacing={8}>
                              <Radio value="M" size="lg" colorScheme="blue">
                                <HStack spacing={2}>
                                  <Icon as={FaMale} color="blue.500" boxSize={5} />
                                  <Text fontWeight="500" color="#1F2937">{t('profile.male')}</Text>
                                </HStack>
                              </Radio>
                              <Radio value="F" size="lg" colorScheme="pink">
                                <HStack spacing={2}>
                                  <Icon as={FaFemale} color="pink.500" boxSize={5} />
                                  <Text fontWeight="500" color="#1F2937">{t('profile.female')}</Text>
                                </HStack>
                              </Radio>
                            </Stack>
                          </RadioGroup>
                        </FormControl>

                        <Divider borderColor="#E5E7EB" />

                        {/* Dates - Grid 2 colonnes */}
                        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                          <GridItem>
                            <FormControl>
                              <FormLabel 
                                fontWeight="600" 
                                color="#4B5563"
                                fontSize="sm"
                                mb={3}
                              >
                                {t('profile.birthday')}
                              </FormLabel>
                              <Input
                                type="date"
                                value={birthday}
                                onChange={(e) => setBirthday(e.target.value)}
                                h="48px"
                                borderRadius="8px"
                                borderColor="#E5E7EB"
                                _hover={{ borderColor: '#D1D5DB' }}
                                _focus={{ 
                                  borderColor: '#6366F1',
                                  boxShadow: '0 0 0 1px #6366F1'
                                }}
                                fontSize="md"
                                fontWeight="500"
                                color="#1F2937"
                                transition="all 0.2s"
                              />
                            </FormControl>
                          </GridItem>
                          <GridItem>
                            <FormControl isDisabled={alive}>
                              <FormLabel 
                                fontWeight="600" 
                                color="#4B5563"
                                fontSize="sm"
                                mb={3}
                              >
                                {t('profile.deathDate')}
                              </FormLabel>
                              <Input
                                type="date"
                                value={deathDate}
                                onChange={(e) => setDeathDate(e.target.value)}
                                h="48px"
                                borderRadius="8px"
                                borderColor="#E5E7EB"
                                _hover={{ borderColor: '#D1D5DB' }}
                                _focus={{ 
                                  borderColor: '#6366F1',
                                  boxShadow: '0 0 0 1px #6366F1'
                                }}
                                fontSize="md"
                                fontWeight="500"
                                color="#1F2937"
                                transition="all 0.2s"
                              />
                            </FormControl>
                          </GridItem>
                        </Grid>

                        {/* Statut Vivant/Décédé */}
                        <FormControl>
                          <FormLabel 
                            fontWeight="600" 
                            color="#4B5563"
                            fontSize="sm"
                            mb={3}
                          >
                            {t('editMember.lifeStatus')}
                          </FormLabel>
                          <RadioGroup 
                            value={alive ? 'alive' : 'deceased'} 
                            onChange={(value) => {
                              const isAlive = value === 'alive';
                              setAlive(isAlive);
                              if (isAlive) {
                                setDeathDate(''); // Efface la date de décès si la personne est marquée comme vivante
                              }
                            }}
                          >
                            <Stack direction="row" spacing={8}>
                              <Radio value="alive" size="lg" colorScheme="green">
                                <Text fontWeight="500" color="#1F2937">{t('editMember.alive')}</Text>
                              </Radio>
                              <Radio value="deceased" size="lg" colorScheme="gray">
                                <HStack spacing={2}>
                                  <Icon as={FaSkullCrossbones} />
                                  <Text fontWeight="500" color="#1F2937">{t('editMember.deceased')}</Text>
                                </HStack>
                              </Radio>
                            </Stack>
                          </RadioGroup>
                        </FormControl>

                        <Divider borderColor="#E5E7EB" />

                        {/* Email et Profession - Grid 2 colonnes */}
                        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                          <GridItem>
                            <FormControl>
                              <FormLabel 
                                fontWeight="600" 
                                color="#4B5563"
                                fontSize="sm"
                                mb={3}
                              >
                                {t('profile.email')}
                              </FormLabel>
                              <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                h="48px"
                                borderRadius="8px"
                                borderColor="#E5E7EB"
                                _hover={{ borderColor: '#D1D5DB' }}
                                _focus={{ 
                                  borderColor: '#6366F1',
                                  boxShadow: '0 0 0 1px #6366F1'
                                }}
                                fontSize="md"
                                fontWeight="500"
                                color="#1F2937"
                                transition="all 0.2s"
                              />
                            </FormControl>
                          </GridItem>
                          <GridItem>
                            <FormControl>
                              <FormLabel 
                                fontWeight="600" 
                                color="#4B5563"
                                fontSize="sm"
                                mb={3}
                              >
                                {t('profile.activity')}
                              </FormLabel>
                              <Input
                                value={activity}
                                onChange={(e) => setActivity(e.target.value)}
                                h="48px"
                                borderRadius="8px"
                                borderColor="#E5E7EB"
                                _hover={{ borderColor: '#D1D5DB' }}
                                _focus={{ 
                                  borderColor: '#6366F1',
                                  boxShadow: '0 0 0 1px #6366F1'
                                }}
                                fontSize="md"
                                fontWeight="500"
                                color="#1F2937"
                                transition="all 0.2s"
                              />
                            </FormControl>
                          </GridItem>
                        </Grid>

                        {/* 👑 Rôle (Admin uniquement) */}
                        {currentUserIsAdmin && (
                          <>
                            <Divider borderColor="#E5E7EB" />
                            <FormControl>
                              <FormLabel 
                                fontWeight="600" 
                                color="#4B5563"
                                fontSize="sm"
                                mb={3}
                              >
                                <HStack spacing={2}>
                                  <Icon as={FaCrown} color="yellow.500" />
                                  <Text>{t('editMember.role', 'Rôle')}</Text>
                                </HStack>
                              </FormLabel>
                              <RadioGroup 
                                value={userRole} 
                                onChange={async (value) => {
                                  try {
                                    await api.put(`/persons/${id}/role`, { role: value });
                                    setUserRole(value);
                                    toast({
                                      title: t('common.success'),
                                      description: t('editMember.roleUpdated', 'Rôle mis à jour avec succès'),
                                      status: 'success',
                                      duration: 3000,
                                    });
                                  } catch (error) {
                                    toast({
                                      title: t('common.error'),
                                      description: t('editMember.roleUpdateError', 'Erreur lors de la mise à jour du rôle'),
                                      status: 'error',
                                      duration: 3000,
                                    });
                                  }
                                }}
                              >
                                <Stack direction="row" spacing={8}>
                                  <Radio value="Member" size="lg" colorScheme="blue">
                                    <Text fontWeight="500" color="#1F2937">{t('editMember.roleMember', 'Membre')}</Text>
                                  </Radio>
                                  <Radio value="Admin" size="lg" colorScheme="yellow">
                                    <HStack spacing={2}>
                                      <Icon as={FaCrown} color="yellow.500" />
                                      <Text fontWeight="500" color="#1F2937">{t('editMember.roleAdmin', 'Administrateur')}</Text>
                                    </HStack>
                                  </Radio>
                                </Stack>
                              </RadioGroup>
                              <Text fontSize="sm" color="gray.500" mt={2}>
                                {t('editMember.roleDescription', 'Les administrateurs peuvent modifier tous les profils. Les membres ne peuvent modifier que leur propre profil.')}
                              </Text>
                            </FormControl>
                          </>
                        )}
                      </VStack>
                    </TabPanel>

                    {/* TAB 2: FAMILLE */}
                    <TabPanel px={8} py={6}>
                      <VStack spacing={6} align="stretch">
                        {/* Père */}
                        <Box>
                          <FormLabel 
                            fontWeight="600" 
                            color="#4B5563"
                            fontSize="sm"
                            mb={3}
                          >
                            <HStack justify="space-between">
                              <HStack>
                                <Icon as={FaMale} boxSize={5} />
                                <Text fontSize="lg">{t('editMember.father')}</Text>
                              </HStack>
                              <HStack spacing={2}>
                                <Button
                                  size="sm"
                                  variant={fatherMode === 'select' ? 'solid' : 'outline'}
                                  colorScheme="blue"
                                  onClick={() => setFatherMode('select')}
                                >
                                  {t('editMember.selectFromList')}
                                </Button>
                                <Button
                                  size="sm"
                                  variant={fatherMode === 'manual' ? 'solid' : 'outline'}
                                  colorScheme="blue"
                                  onClick={() => setFatherMode('manual')}
                                >
                                  {t('editMember.enterManually')}
                                </Button>
                              </HStack>
                            </HStack>
                          </FormLabel>
                          
                          {fatherMode === 'select' ? (
                            maleFamilyMembers.length > 0 ? (
                              <Select
                                value={fatherID || ''}
                                onChange={(e) => setFatherID(e.target.value ? parseInt(e.target.value) : undefined)}
                                h="48px"
                                borderRadius="8px"
                                borderColor="#E5E7EB"
                                _hover={{ borderColor: '#D1D5DB' }}
                                _focus={{ 
                                  borderColor: '#6366F1',
                                  boxShadow: '0 0 0 1px #6366F1'
                                }}
                                fontSize="md"
                                fontWeight="500"
                                color="#1F2937"
                                transition="all 0.2s"
                              >
                                {maleFamilyMembers.map(person => (
                                  <option key={person.personID} value={person.personID}>
                                    {person.firstName} {person.lastName}
                                    {person.birthday && ` (${calculateAge(person.birthday)} ${t('editMember.years')})`}
                                    {!person.alive && ' ✝️'}
                                  </option>
                                ))}
                              </Select>
                            ) : (
                              <Alert status="info" borderRadius="md">
                                <AlertIcon />
                                <AlertDescription>
                                  {t('editMember.noMaleInFamily')}
                                </AlertDescription>
                              </Alert>
                            )
                          ) : (
                            <Card 
                              variant="outline" 
                              borderColor="#DBEAFE" 
                              bg="#EFF6FF"
                              borderRadius="8px"
                            >
                              <CardBody>
                                <VStack spacing={4}>
                                  <Alert status="info" size="sm" borderRadius="8px">
                                    <AlertIcon />
                                    <AlertDescription fontSize="sm" color="#1F2937">
                                      {t('editMember.placeholderWillBeCreated')}
                                    </AlertDescription>
                                  </Alert>
                                  <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                                    <GridItem>
                                      <FormControl>
                                        <FormLabel fontSize="sm" fontWeight="600" color="#4B5563">
                                          {t('profile.firstName')}
                                        </FormLabel>
                                        <Input
                                          value={fatherFirstName}
                                          onChange={(e) => setFatherFirstName(e.target.value)}
                                          bg="white"
                                          h="40px"
                                          borderRadius="8px"
                                          borderColor="#E5E7EB"
                                          _hover={{ borderColor: '#D1D5DB' }}
                                          _focus={{ 
                                            borderColor: '#6366F1',
                                            boxShadow: '0 0 0 1px #6366F1'
                                          }}
                                          fontSize="sm"
                                          fontWeight="500"
                                          color="#1F2937"
                                          transition="all 0.2s"
                                        />
                                      </FormControl>
                                    </GridItem>
                                    <GridItem>
                                      <FormControl>
                                        <FormLabel fontSize="sm" fontWeight="600" color="#4B5563">
                                          {t('profile.lastName')}
                                        </FormLabel>
                                        <Input
                                          value={fatherLastName}
                                          onChange={(e) => setFatherLastName(e.target.value)}
                                          bg="white"
                                          h="40px"
                                          borderRadius="8px"
                                          borderColor="#E5E7EB"
                                          _hover={{ borderColor: '#D1D5DB' }}
                                          _focus={{ 
                                            borderColor: '#6366F1',
                                            boxShadow: '0 0 0 1px #6366F1'
                                          }}
                                          fontSize="sm"
                                          fontWeight="500"
                                          color="#1F2937"
                                          transition="all 0.2s"
                                        />
                                      </FormControl>
                                    </GridItem>
                                  </Grid>
                                </VStack>
                              </CardBody>
                            </Card>
                          )}
                        </Box>

                        <Divider borderColor="#E5E7EB" />

                        {/* Mère */}
                        <Box>
                          <FormLabel fontWeight="semibold" color="pink.700" mb={3}>
                            <HStack justify="space-between">
                              <HStack>
                                <Icon as={FaFemale} boxSize={5} />
                                <Text fontSize="lg">{t('editMember.mother')}</Text>
                              </HStack>
                              <HStack spacing={2}>
                                <Button
                                  size="sm"
                                  variant={motherMode === 'select' ? 'solid' : 'outline'}
                                  colorScheme="pink"
                                  onClick={() => setMotherMode('select')}
                                >
                                  {t('editMember.selectFromList')}
                                </Button>
                                <Button
                                  size="sm"
                                  variant={motherMode === 'manual' ? 'solid' : 'outline'}
                                  colorScheme="pink"
                                  onClick={() => setMotherMode('manual')}
                                >
                                  {t('editMember.enterManually')}
                                </Button>
                              </HStack>
                            </HStack>
                          </FormLabel>
                          
                          {motherMode === 'select' ? (
                            femaleFamilyMembers.length > 0 ? (
                              <Select
                                value={motherID || ''}
                                onChange={(e) => setMotherID(e.target.value ? parseInt(e.target.value) : undefined)}
                                h="48px"
                                borderRadius="8px"
                                borderColor="#E5E7EB"
                                _hover={{ borderColor: '#D1D5DB' }}
                                _focus={{ 
                                  borderColor: '#6366F1',
                                  boxShadow: '0 0 0 1px #6366F1'
                                }}
                                fontSize="md"
                                fontWeight="500"
                                color="#1F2937"
                                transition="all 0.2s"
                              >
                                {femaleFamilyMembers.map(person => (
                                  <option key={person.personID} value={person.personID}>
                                    {person.firstName} {person.lastName}
                                    {person.birthday && ` (${calculateAge(person.birthday)} ${t('editMember.years')})`}
                                    {!person.alive && ' ✝️'}
                                  </option>
                                ))}
                              </Select>
                            ) : (
                              <Alert status="info" borderRadius="md">
                                <AlertIcon />
                                <AlertDescription>
                                  {t('editMember.noFemaleInFamily')}
                                </AlertDescription>
                              </Alert>
                            )
                          ) : (
                            <Card 
                              variant="outline" 
                              borderColor="#FCE7F3" 
                              bg="#FDF2F8"
                              borderRadius="8px"
                            >
                              <CardBody>
                                <VStack spacing={4}>
                                  <Alert status="info" size="sm" borderRadius="8px">
                                    <AlertIcon />
                                    <AlertDescription fontSize="sm" color="#1F2937">
                                      {t('editMember.placeholderWillBeCreated')}
                                    </AlertDescription>
                                  </Alert>
                                  <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                                    <GridItem>
                                      <FormControl>
                                        <FormLabel fontSize="sm" fontWeight="600" color="#4B5563">
                                          {t('profile.firstName')}
                                        </FormLabel>
                                        <Input
                                          value={motherFirstName}
                                          onChange={(e) => setMotherFirstName(e.target.value)}
                                          bg="white"
                                          h="40px"
                                          borderRadius="8px"
                                          borderColor="#E5E7EB"
                                          _hover={{ borderColor: '#D1D5DB' }}
                                          _focus={{ 
                                            borderColor: '#6366F1',
                                            boxShadow: '0 0 0 1px #6366F1'
                                          }}
                                          fontSize="sm"
                                          fontWeight="500"
                                          color="#1F2937"
                                          transition="all 0.2s"
                                        />
                                      </FormControl>
                                    </GridItem>
                                    <GridItem>
                                      <FormControl>
                                        <FormLabel fontSize="sm" fontWeight="600" color="#4B5563">
                                          {t('profile.lastName')}
                                        </FormLabel>
                                        <Input
                                          value={motherLastName}
                                          onChange={(e) => setMotherLastName(e.target.value)}
                                          bg="white"
                                          h="40px"
                                          borderRadius="8px"
                                          borderColor="#E5E7EB"
                                          _hover={{ borderColor: '#D1D5DB' }}
                                          _focus={{ 
                                            borderColor: '#6366F1',
                                            boxShadow: '0 0 0 1px #6366F1'
                                          }}
                                          fontSize="sm"
                                          fontWeight="500"
                                          color="#1F2937"
                                          transition="all 0.2s"
                                        />
                                      </FormControl>
                                    </GridItem>
                                  </Grid>
                                </VStack>
                              </CardBody>
                            </Card>
                          )}
                        </Box>

                        {/* Success message */}
                        {((fatherMode === 'select' && fatherID) || 
                          (motherMode === 'select' && motherID) || 
                          (fatherMode === 'manual' && fatherFirstName && fatherLastName) ||
                          (motherMode === 'manual' && motherFirstName && motherLastName)) && (
                          <Alert status="success" borderRadius="md">
                            <AlertIcon />
                            <AlertDescription>
                              {t('editMember.familyLinksWillUpdate')}
                            </AlertDescription>
                          </Alert>
                        )}
                      </VStack>
                    </TabPanel>

                    {/* TAB 3: BIO & NOTES */}
                    <TabPanel px={8} py={6}>
                      <VStack spacing={6} align="stretch">
                        <FormControl>
                          <FormLabel 
                            fontWeight="600" 
                            color="#4B5563"
                            fontSize="sm"
                            mb={3}
                          >
                            {t('editMember.biography', 'Biographie')}
                          </FormLabel>
                          <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={12}
                            minH="200px"
                            borderRadius="8px"
                            borderColor="#E5E7EB"
                            _hover={{ borderColor: '#D1D5DB' }}
                            _focus={{ 
                              borderColor: '#6366F1',
                              boxShadow: '0 0 0 1px #6366F1'
                            }}
                            fontSize="md"
                            fontWeight="400"
                            color="#1F2937"
                            resize="vertical"
                            transition="all 0.2s"
                          />
                          <Text fontSize="sm" color="#6B7280" mt={2}>
                            {notes.length} {t('editMember.characters', 'caractères')}
                          </Text>
                        </FormControl>

                        <Alert status="info" borderRadius="md">
                          <AlertIcon />
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="semibold">
                              {t('editMember.biographyTips', 'Conseils pour la biographie')}
                            </Text>
                            <Text fontSize="sm">
                              {t('editMember.biographyTipsText', 'Incluez les souvenirs, les anecdotes, les accomplissements, les traits de caractère, etc.')}
                            </Text>
                          </VStack>
                        </Alert>
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>

                {/* Action Buttons - Fixed at bottom */}
                <Box 
                  px={8} 
                  py={5} 
                  bg="#F9FAFB" 
                  borderTop="2px solid" 
                  borderColor="#E5E7EB"
                >
                  <HStack spacing={4} justify="flex-end">
                    <Button
                      variant="outline"
                      leftIcon={<Icon as={FaTimes} />}
                      onClick={() => navigate('/members')}
                      isDisabled={saving}
                      h="48px"
                      px={6}
                      borderRadius="8px"
                      borderColor="#D1D5DB"
                      color="#4B5563"
                      fontWeight="600"
                      _hover={{ 
                        bg: '#F3F4F6',
                        borderColor: '#9CA3AF'
                      }}
                      transition="all 0.2s"
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                      type="submit"
                      bg="#6366F1"
                      color="white"
                      leftIcon={<Icon as={FaSave} />}
                      isLoading={saving}
                      loadingText={t('editMember.saving')}
                      h="48px"
                      px={8}
                      borderRadius="8px"
                      fontWeight="600"
                      _hover={{ 
                        bg: '#4F46E5',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.4)'
                      }}
                      _active={{ 
                        bg: '#4338CA',
                        transform: 'translateY(0)'
                      }}
                      transition="all 0.2s"
                    >
                      {t('editMember.saveChanges')}
                    </Button>
                  </HStack>
                </Box>
              </form>
            </CardBody>
          </Card>
        </MotionBox>
      </Container>
    </Box>
  );
}
