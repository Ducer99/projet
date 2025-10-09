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
} from '@chakra-ui/react';
import { FaMale, FaFemale, FaSave, FaTimes, FaSkullCrossbones } from 'react-icons/fa';
import api from '../services/api';

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

export default function EditMember() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();

  const [member, setMember] = useState<MemberData | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    loadMember();
    loadFamilyMembers();
  }, [id]);

  const loadMember = async () => {
    try {
      const response = await api.get(`/persons/${id}`);
      const data = response.data;
      setMember(data);
      
      // Peupler le formulaire
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
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || t('editMember.cannotLoadMember'),
        status: 'error',
        duration: 5000,
      });
      navigate('/members');
    }
  };

  const loadFamilyMembers = async () => {
    try {
      const response = await api.get('/persons');
      setFamilyMembers(response.data);
    } catch (error) {
      console.error('Erreur chargement famille:', error);
    }
  };

  const calculateAge = (birthday: string | null) => {
    if (!birthday) return null;
    const birth = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Filtrer les membres pour père et mère (exclure la personne elle-même)
  const maleFamilyMembers = familyMembers.filter(m => 
    m.sex === 'M' && m.personID !== parseInt(id || '0')
  );
  const femaleFamilyMembers = familyMembers.filter(m => 
    m.sex === 'F' && m.personID !== parseInt(id || '0')
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        personID: parseInt(id || '0'),
        firstName,
        lastName,
        sex,
        birthday: birthday ? new Date(birthday).toISOString() : null,
        deathDate: alive ? null : (deathDate ? new Date(deathDate).toISOString() : null),
        alive,
        email,
        activity,
        photoUrl,
        notes,
        cityID,
        fatherID: fatherID || null,
        motherID: motherID || null,
        familyID: member?.familyID,
      };

      await api.put(`/persons/${id}`, payload);

      toast({
        title: t('common.success'),
        description: t('editMember.memberUpdated', { name: `${firstName} ${lastName}` }),
        status: 'success',
        duration: 3000,
      });

      navigate('/members');
    } catch (error: any) {
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
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="purple.500" thickness="4px" />
          <Text>{t('editMember.loadingMember')}</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="4xl">
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              {/* En-tête avec avatar */}
              <HStack spacing={4} align="start">
                <Avatar 
                  size="xl" 
                  src={photoUrl} 
                  name={`${firstName} ${lastName}`}
                  filter={!alive ? 'grayscale(100%)' : 'none'}
                  opacity={!alive ? 0.7 : 1}
                />
                <VStack align="start" flex="1">
                  <Heading size="lg" color="purple.800">
                    {t('editMember.editMemberTitle', { name: `${firstName} ${lastName}` })}
                  </Heading>
                  <HStack spacing={2}>
                    <Badge colorScheme={alive ? 'green' : 'gray'}>
                      {alive ? t('editMember.alive') : t('editMember.deceased')}
                    </Badge>
                    {member?.status && (
                      <Badge colorScheme={
                        member.status === 'confirmed' ? 'blue' :
                        member.status === 'deceased' ? 'gray' : 'yellow'
                      }>
                        {member.status === 'confirmed' ? t('editMember.statusConfirmed') :
                         member.status === 'deceased' ? t('editMember.statusDeceased') : t('editMember.statusPending')}
                      </Badge>
                    )}
                  </HStack>
                </VStack>
              </HStack>

              <Divider />

              <form onSubmit={handleSubmit}>
                <VStack spacing={6} align="stretch">
                  {/* Informations de base */}
                  <Box>
                    <Heading size="md" color="purple.700" mb={4}>
                      {t('editMember.personalInformation')}
                    </Heading>
                    <VStack spacing={4}>
                      <HStack width="100%" spacing={4}>
                        <FormControl isRequired>
                          <FormLabel>{t('profile.firstName')}</FormLabel>
                          <Input
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                          />
                        </FormControl>
                        <FormControl isRequired>
                          <FormLabel>{t('profile.lastName')}</FormLabel>
                          <Input
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                          />
                        </FormControl>
                      </HStack>

                      <FormControl isRequired>
                        <FormLabel>{t('profile.gender')}</FormLabel>
                        <RadioGroup value={sex} onChange={setSex}>
                          <Stack direction="row" spacing={8}>
                            <Radio value="M">
                              <HStack>
                                <Icon as={FaMale} color="blue.500" />
                                <Text>{t('profile.male')}</Text>
                              </HStack>
                            </Radio>
                            <Radio value="F">
                              <HStack>
                                <Icon as={FaFemale} color="pink.500" />
                                <Text>{t('profile.female')}</Text>
                              </HStack>
                            </Radio>
                          </Stack>
                        </RadioGroup>
                      </FormControl>

                      <HStack width="100%" spacing={4}>
                        <FormControl>
                          <FormLabel>{t('profile.birthDate')}</FormLabel>
                          <Input
                            type="date"
                            value={birthday}
                            onChange={(e) => setBirthday(e.target.value)}
                          />
                        </FormControl>
                        {birthday && (
                          <FormControl>
                            <FormLabel>{t('profile.age')}</FormLabel>
                            <Input
                              value={t('profile.yearsOld', { count: calculateAge(birthday) || 0 })}
                              isReadOnly
                              bg="gray.100"
                            />
                          </FormControl>
                        )}
                      </HStack>

                      <FormControl>
                        <FormLabel>{t('profile.email')}</FormLabel>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t('editMember.emailPlaceholder')}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>{t('editMember.activityProfession')}</FormLabel>
                        <Input
                          value={activity}
                          onChange={(e) => setActivity(e.target.value)}
                          placeholder={t('editMember.activityPlaceholder')}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>{t('editMember.photoUrl')}</FormLabel>
                        <Input
                          value={photoUrl}
                          onChange={(e) => setPhotoUrl(e.target.value)}
                          placeholder="https://..."
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>{t('editMember.notes')}</FormLabel>
                        <Input
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder={t('editMember.notesPlaceholder')}
                        />
                      </FormControl>
                    </VStack>
                  </Box>

                  <Divider />

                  {/* Statut vivant/décédé */}
                  <Box>
                    <Heading size="md" color="purple.700" mb={4}>
                      {t('editMember.vitalStatus')}
                    </Heading>
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel>{t('editMember.status')}</FormLabel>
                        <RadioGroup value={alive ? 'alive' : 'deceased'} onChange={(val) => setAlive(val === 'alive')}>
                          <Stack>
                            <Radio value="alive">{t('editMember.alive')}</Radio>
                            <Radio value="deceased">
                              <HStack>
                                <Icon as={FaSkullCrossbones} color="gray.500" />
                                <Text>{t('editMember.deceased')}</Text>
                              </HStack>
                            </Radio>
                          </Stack>
                        </RadioGroup>
                      </FormControl>

                      {!alive && (
                        <FormControl>
                          <FormLabel>{t('profile.deathDate')}</FormLabel>
                          <Input
                            type="date"
                            value={deathDate}
                            onChange={(e) => setDeathDate(e.target.value)}
                          />
                        </FormControl>
                      )}
                    </VStack>
                  </Box>

                  <Divider />

                  {/* Parents */}
                  <Box>
                    <Heading size="md" color="purple.700" mb={4}>
                      {t('editMember.familyRelationships')}
                    </Heading>
                    <VStack spacing={4} align="stretch">
                      {/* Père */}
                      <FormControl>
                        <FormLabel color="blue.700">
                          <HStack>
                            <Icon as={FaMale} />
                            <Text>{t('editMember.father')}</Text>
                          </HStack>
                        </FormLabel>
                        {maleFamilyMembers.length > 0 ? (
                          <Select
                            placeholder={t('editMember.noFather')}
                            value={fatherID || ''}
                            onChange={(e) => setFatherID(e.target.value ? parseInt(e.target.value) : undefined)}
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
                        )}
                      </FormControl>

                      {/* Mère */}
                      <FormControl>
                        <FormLabel color="pink.700">
                          <HStack>
                            <Icon as={FaFemale} />
                            <Text>{t('editMember.mother')}</Text>
                          </HStack>
                        </FormLabel>
                        {femaleFamilyMembers.length > 0 ? (
                          <Select
                            placeholder={t('editMember.noMother')}
                            value={motherID || ''}
                            onChange={(e) => setMotherID(e.target.value ? parseInt(e.target.value) : undefined)}
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
                        )}
                      </FormControl>

                      {(fatherID || motherID) && (
                        <Alert status="success" borderRadius="md">
                          <AlertIcon />
                          <AlertDescription>
                            {t('editMember.familyLinksWillUpdate')}
                          </AlertDescription>
                        </Alert>
                      )}
                    </VStack>
                  </Box>

                  <Divider />

                  {/* Boutons d'action */}
                  <HStack spacing={4} justify="flex-end">
                    <Button
                      variant="outline"
                      leftIcon={<Icon as={FaTimes} />}
                      onClick={() => navigate('/members')}
                      isDisabled={saving}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                      type="submit"
                      colorScheme="purple"
                      leftIcon={<Icon as={FaSave} />}
                      isLoading={saving}
                      loadingText={t('editMember.saving')}
                    >
                      {t('editMember.saveChanges')}
                    </Button>
                  </HStack>
                </VStack>
              </form>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
}
