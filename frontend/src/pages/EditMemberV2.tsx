import { useState, useEffect, FormEvent } from 'react';
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
  const [sex, setSex] = useState('');
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
      setSex(data.sex || '');
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload: any = {
        firstName,
        lastName,
        sex,
        birthday: birthday || null,
        deathDate: deathDate || null,
        alive,
        email: email || null,
        activity: activity || null,
        photoUrl: photoUrl || null,
        notes: notes || null,
        cityID,
      };

      if (fatherMode === 'select') {
        payload.fatherID = fatherID || null;
      } else if (fatherMode === 'manual' && fatherFirstName && fatherLastName) {
        payload.fatherFirstName = fatherFirstName;
        payload.fatherLastName = fatherLastName;
      }

      if (motherMode === 'select') {
        payload.motherID = motherID || null;
      } else if (motherMode === 'manual' && motherFirstName && motherLastName) {
        payload.motherFirstName = motherFirstName;
        payload.motherLastName = motherLastName;
      }

      await api.put(`/persons/${id}`, payload);

      toast({
        title: t('common.success'),
        description: t('editMember.memberUpdated', { name: `${firstName} ${lastName}` }),
        status: 'success',
        duration: 3000,
      });

      navigate('/persons');
    } catch (error: any) {
      console.error('Error updating member:', error);
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || t('editMember.updateError'),
        status: 'error',
        duration: 5000,
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
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="5xl">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header with Back Button */}
          <HStack spacing={4} mb={6}>
            <Tooltip label={t('common.back')}>
              <IconButton
                aria-label="Back"
                icon={<FaArrowLeft />}
                onClick={() => navigate('/persons')}
                variant="ghost"
                colorScheme="purple"
                size="lg"
              />
            </Tooltip>
            <Avatar 
              size="lg" 
              src={photoUrl} 
              name={`${firstName} ${lastName}`}
              filter={!alive ? 'grayscale(100%)' : 'none'}
              opacity={!alive ? 0.7 : 1}
            />
            <VStack align="start" flex="1" spacing={1}>
              <Heading size="lg" color="purple.800">
                {t('editMember.editMemberTitle', { name: `${firstName} ${lastName}` })}
              </Heading>
              <HStack spacing={2}>
                <Badge colorScheme={alive ? 'green' : 'gray'} fontSize="sm">
                  {alive ? t('editMember.alive') : t('editMember.deceased')}
                </Badge>
                {member?.status && (
                  <Badge 
                    colorScheme={
                      member.status === 'confirmed' ? 'blue' :
                      member.status === 'deceased' ? 'gray' : 'yellow'
                    }
                    fontSize="sm"
                  >
                    {member.status === 'confirmed' ? t('editMember.statusConfirmed') :
                     member.status === 'deceased' ? t('editMember.statusDeceased') : 
                     t('editMember.statusPending')}
                  </Badge>
                )}
              </HStack>
            </VStack>
          </HStack>

          {/* Main Card with Tabs */}
          <Card shadow="lg">
            <CardBody p={0}>
              <form onSubmit={handleSubmit}>
                <Tabs 
                  index={activeTab} 
                  onChange={setActiveTab}
                  colorScheme="purple"
                  variant="enclosed"
                >
                  <TabList px={6} pt={4}>
                    <Tab fontWeight="semibold">
                      <Icon as={FaUser} mr={2} />
                      {t('editMember.tabGeneral', 'Général')}
                    </Tab>
                    <Tab fontWeight="semibold">
                      <Icon as={FaUsers} mr={2} />
                      {t('editMember.tabFamily', 'Famille')}
                    </Tab>
                    <Tab fontWeight="semibold">
                      <Icon as={FaBook} mr={2} />
                      {t('editMember.tabBioNotes', 'Bio & Notes')}
                    </Tab>
                  </TabList>

                  <TabPanels>
                    {/* TAB 1: GÉNÉRAL */}
                    <TabPanel px={8} py={6}>
                      <VStack spacing={6} align="stretch">
                        {/* Photo */}
                        <FormControl>
                          <FormLabel fontWeight="semibold" color="purple.700">
                            {t('editMember.photoUrl')}
                          </FormLabel>
                          <HStack spacing={4}>
                            <Avatar size="xl" src={photoUrl} name={`${firstName} ${lastName}`} />
                            <Input
                              value={photoUrl}
                              onChange={(e) => setPhotoUrl(e.target.value)}
                              flex="1"
                            />
                          </HStack>
                        </FormControl>

                        <Divider />

                        {/* Noms - Grid 2 colonnes responsive */}
                        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                          <GridItem>
                            <FormControl isRequired>
                              <FormLabel fontWeight="semibold" color="purple.700">
                                {t('profile.firstName')}
                              </FormLabel>
                              <Input
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                size="lg"
                              />
                            </FormControl>
                          </GridItem>
                          <GridItem>
                            <FormControl isRequired>
                              <FormLabel fontWeight="semibold" color="purple.700">
                                {t('profile.lastName')}
                              </FormLabel>
                              <Input
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                size="lg"
                              />
                            </FormControl>
                          </GridItem>
                        </Grid>

                        {/* Sexe */}
                        <FormControl isRequired>
                          <FormLabel fontWeight="semibold" color="purple.700">
                            {t('profile.sex')}
                          </FormLabel>
                          <RadioGroup value={sex} onChange={setSex}>
                            <Stack direction="row" spacing={8}>
                              <Radio value="M" size="lg" colorScheme="blue">
                                <HStack>
                                  <Icon as={FaMale} color="blue.500" boxSize={5} />
                                  <Text>{t('profile.male')}</Text>
                                </HStack>
                              </Radio>
                              <Radio value="F" size="lg" colorScheme="pink">
                                <HStack>
                                  <Icon as={FaFemale} color="pink.500" boxSize={5} />
                                  <Text>{t('profile.female')}</Text>
                                </HStack>
                              </Radio>
                            </Stack>
                          </RadioGroup>
                        </FormControl>

                        <Divider />

                        {/* Dates - Grid 2 colonnes responsive */}
                        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                          <GridItem>
                            <FormControl>
                              <FormLabel fontWeight="semibold" color="purple.700">
                                {t('profile.birthday')}
                              </FormLabel>
                              <Input
                                type="date"
                                value={birthday}
                                onChange={(e) => setBirthday(e.target.value)}
                                size="lg"
                              />
                            </FormControl>
                          </GridItem>
                          <GridItem>
                            <FormControl isDisabled={alive}>
                              <FormLabel fontWeight="semibold" color="purple.700">
                                {t('profile.deathDate')}
                              </FormLabel>
                              <Input
                                type="date"
                                value={deathDate}
                                onChange={(e) => setDeathDate(e.target.value)}
                                size="lg"
                              />
                            </FormControl>
                          </GridItem>
                        </Grid>

                        {/* Statut Vivant/Décédé */}
                        <FormControl>
                          <FormLabel fontWeight="semibold" color="purple.700">
                            {t('editMember.lifeStatus')}
                          </FormLabel>
                          <RadioGroup 
                            value={alive ? 'alive' : 'deceased'} 
                            onChange={(value) => setAlive(value === 'alive')}
                          >
                            <Stack direction="row" spacing={8}>
                              <Radio value="alive" size="lg" colorScheme="green">
                                <Text>{t('editMember.alive')}</Text>
                              </Radio>
                              <Radio value="deceased" size="lg" colorScheme="gray">
                                <HStack>
                                  <Icon as={FaSkullCrossbones} />
                                  <Text>{t('editMember.deceased')}</Text>
                                </HStack>
                              </Radio>
                            </Stack>
                          </RadioGroup>
                        </FormControl>

                        <Divider />

                        {/* Email et Profession - Grid 2 colonnes responsive */}
                        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                          <GridItem>
                            <FormControl>
                              <FormLabel fontWeight="semibold" color="purple.700">
                                {t('profile.email')}
                              </FormLabel>
                              <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                size="lg"
                              />
                            </FormControl>
                          </GridItem>
                          <GridItem>
                            <FormControl>
                              <FormLabel fontWeight="semibold" color="purple.700">
                                {t('profile.activity')}
                              </FormLabel>
                              <Input
                                value={activity}
                                onChange={(e) => setActivity(e.target.value)}
                                size="lg"
                              />
                            </FormControl>
                          </GridItem>
                        </Grid>
                      </VStack>
                    </TabPanel>

                    {/* TAB 2: FAMILLE */}
                    <TabPanel px={8} py={6}>
                      <VStack spacing={6} align="stretch">
                        {/* Père */}
                        <Box>
                          <FormLabel fontWeight="semibold" color="blue.700" mb={3}>
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
                                size="lg"
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
                            <Card variant="outline" borderColor="blue.200" bg="blue.50">
                              <CardBody>
                                <VStack spacing={4}>
                                  <Alert status="info" size="sm" borderRadius="md">
                                    <AlertIcon />
                                    <AlertDescription fontSize="sm">
                                      {t('editMember.placeholderWillBeCreated')}
                                    </AlertDescription>
                                  </Alert>
                                  <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)' }} gap={4} w="full">
                                    <GridItem>
                                      <FormControl>
                                        <FormLabel fontSize="sm">{t('profile.firstName')}</FormLabel>
                                        <Input
                                          value={fatherFirstName}
                                          onChange={(e) => setFatherFirstName(e.target.value)}
                                          bg="white"
                                        />
                                      </FormControl>
                                    </GridItem>
                                    <GridItem>
                                      <FormControl>
                                        <FormLabel fontSize="sm">{t('profile.lastName')}</FormLabel>
                                        <Input
                                          value={fatherLastName}
                                          onChange={(e) => setFatherLastName(e.target.value)}
                                          bg="white"
                                        />
                                      </FormControl>
                                    </GridItem>
                                  </Grid>
                                </VStack>
                              </CardBody>
                            </Card>
                          )}
                        </Box>

                        <Divider />

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
                                size="lg"
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
                            <Card variant="outline" borderColor="pink.200" bg="pink.50">
                              <CardBody>
                                <VStack spacing={4}>
                                  <Alert status="info" size="sm" borderRadius="md">
                                    <AlertIcon />
                                    <AlertDescription fontSize="sm">
                                      {t('editMember.placeholderWillBeCreated')}
                                    </AlertDescription>
                                  </Alert>
                                  <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)' }} gap={4} w="full">
                                    <GridItem>
                                      <FormControl>
                                        <FormLabel fontSize="sm">{t('profile.firstName')}</FormLabel>
                                        <Input
                                          value={motherFirstName}
                                          onChange={(e) => setMotherFirstName(e.target.value)}
                                          bg="white"
                                        />
                                      </FormControl>
                                    </GridItem>
                                    <GridItem>
                                      <FormControl>
                                        <FormLabel fontSize="sm">{t('profile.lastName')}</FormLabel>
                                        <Input
                                          value={motherLastName}
                                          onChange={(e) => setMotherLastName(e.target.value)}
                                          bg="white"
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
                          <FormLabel fontWeight="semibold" color="purple.700" fontSize="lg">
                            {t('editMember.biography', 'Biographie')}
                          </FormLabel>
                          <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={12}
                            size="lg"
                            resize="vertical"
                          />
                          <Text fontSize="sm" color="gray.500" mt={2}>
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

                {/* Action Buttons - Fixed at bottom - Responsive */}
                <Box px={{ base: 4, md: 8 }} py={4} bg="gray.50" borderTop="1px" borderColor="gray.200">
                  <Stack 
                    direction={{ base: 'column', sm: 'row' }} 
                    spacing={4} 
                    justify="flex-end"
                    w="full"
                  >
                    <Button
                      variant="outline"
                      leftIcon={<Icon as={FaTimes} />}
                      onClick={() => navigate('/persons')}
                      isDisabled={saving}
                      size={{ base: 'md', md: 'lg' }}
                      w={{ base: 'full', sm: 'auto' }}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                      type="submit"
                      colorScheme="purple"
                      leftIcon={<Icon as={FaSave} />}
                      w={{ base: 'full', sm: 'auto' }}
                      isLoading={saving}
                      loadingText={t('editMember.saving')}
                      size={{ base: 'md', md: 'lg' }}
                      px={{ base: 4, md: 8 }}
                    >
                      {t('editMember.saveChanges')}
                    </Button>
                  </Stack>
                </Box>
              </form>
            </CardBody>
          </Card>
        </MotionBox>
      </Container>
    </Box>
  );
}
