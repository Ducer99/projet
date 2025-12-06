import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Radio,
  RadioGroup,
  Stack,
  useToast,
  Divider,
  Icon,
  Avatar,
  Switch,
  Checkbox,
  FormHelperText,
  Card,
  CardBody,
  Select,
  Badge,
} from '@chakra-ui/react';
import { FaMale, FaFemale, FaCamera, FaUserTie, FaSearch } from 'react-icons/fa';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface FamilyMember {
  personID: number;
  firstName: string;
  lastName: string;
  sex: string;
  birthday: string | null;
  alive: boolean;
}

export default function MemberForm() {
  const { id } = useParams(); // Pour édition (optionnel)
  const { user } = useAuth();
  const isEditMode = Boolean(id);

  // 📋 Informations de base
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  // 🏥 Statut vital
  const [alive, setAlive] = useState(true);
  const [deathDate, setDeathDate] = useState('');
  const [age, setAge] = useState<number | null>(null);

  // 📍 Localisation naissance
  const [birthCountry, setBirthCountry] = useState('');
  const [birthCity, setBirthCity] = useState('');

  // 🏠 Résidence
  const [residenceCountry, setResidenceCountry] = useState('');
  const [residenceCity, setResidenceCity] = useState('');
  const [sameAsBirth, setSameAsBirth] = useState(false);

  // 💼 Profession
  const [activity, setActivity] = useState('');

  // 👨‍👩‍👦 PARENTS - Modifiables (contrairement à MyProfile)
  const [fatherMode, setFatherMode] = useState<'none' | 'select' | 'manual'>('none');
  const [selectedFatherID, setSelectedFatherID] = useState<number | null>(null);
  const [manualFatherName, setManualFatherName] = useState('');

  const [motherMode, setMotherMode] = useState<'none' | 'select' | 'manual'>('none');
  const [selectedMotherID, setSelectedMotherID] = useState<number | null>(null);
  const [manualMotherName, setManualMotherName] = useState('');

  // Liste des membres de la famille pour la sélection
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const toast = useToast();

  // Charger les membres de la famille au montage
  useEffect(() => {
    loadFamilyMembers();
    if (isEditMode) {
      loadMemberData();
    }
  }, [id]);

  const loadFamilyMembers = async () => {
    try {
      const response = await api.get('/persons/family');
      setFamilyMembers(response.data || []);
    } catch (err) {
      console.error('Erreur chargement membres:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger la liste des membres',
        status: 'warning',
        duration: 3000,
      });
    }
  };

  const loadMemberData = async () => {
    try {
      const response = await api.get(`/persons/${id}`);
      const member = response.data;

      setFirstName(member.firstName || '');
      setLastName(member.lastName || '');
      setGender(member.sex || '');
      setBirthDate(member.birthday ? member.birthday.split('T')[0] : '');
      setPhone(member.phone || '');
      setPhotoUrl(member.photoUrl || '');
      setAlive(member.alive ?? true);
      setDeathDate(member.deathDate ? member.deathDate.split('T')[0] : '');
      setBirthCountry(member.birthCountry || '');
      setBirthCity(member.birthCity || '');
      setResidenceCountry(member.residenceCountry || '');
      setResidenceCity(member.residenceCity || '');
      setActivity(member.activity || '');

      // Parents
      if (member.fatherID) {
        setFatherMode('select');
        setSelectedFatherID(member.fatherID);
      } else if (member.fatherName) {
        setFatherMode('manual');
        setManualFatherName(member.fatherName);
      }

      if (member.motherID) {
        setMotherMode('select');
        setSelectedMotherID(member.motherID);
      } else if (member.motherName) {
        setMotherMode('manual');
        setManualMotherName(member.motherName);
      }
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données du membre',
        status: 'error',
        duration: 4000,
      });
    }
  };

  // 🎯 UX: Calcul automatique de l'âge
  const calculateAge = (birthDateValue: string): number => {
    const today = new Date();
    const birth = new Date(birthDateValue);
    let calculatedAge = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      calculatedAge--;
    }
    return calculatedAge;
  };

  // 🎯 UX: Auto-capitalisation prénom
  const handleFirstNameChange = (value: string) => {
    const capitalized = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    setFirstName(capitalized);
  };

  // 🎯 UX: Auto-majuscules nom
  const handleLastNameChange = (value: string) => {
    setLastName(value.toUpperCase());
  };

  // 🎯 UX: Date naissance avec calcul âge
  const handleBirthDateChange = (value: string) => {
    setBirthDate(value);
    if (value) {
      const calculatedAge = calculateAge(value);
      setAge(calculatedAge);
    } else {
      setAge(null);
    }
  };

  // 🎯 UX: Switch vivant/décédé
  const handleAliveChange = (isDeceased: boolean) => {
    setAlive(!isDeceased);
    if (!isDeceased) {
      setDeathDate('');
    }
  };

  // 🎯 UX: Checkbox "Même lieu de naissance"
  const handleSameAsBirthChange = (checked: boolean) => {
    setSameAsBirth(checked);
    if (checked) {
      setResidenceCountry(birthCountry);
      setResidenceCity(birthCity);
    }
  };

  // 🎯 UX: Upload photo
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      toast({
        title: 'Photo chargée',
        status: 'success',
        duration: 2000,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!firstName || !lastName || !gender || !birthDate) {
      toast({
        title: 'Champs obligatoires manquants',
        description: 'Prénom, Nom, Sexe et Date de naissance sont requis',
        status: 'error',
        duration: 4000,
      });
      return;
    }

    setIsLoading(true);

    try {
      const payload: any = {
        firstName,
        lastName,
        sex: gender.toUpperCase(),
        birthday: birthDate ? new Date(birthDate).toISOString() : null,
        birthCountry: birthCountry || null,
        birthCity: birthCity || null,
        residenceCountry: residenceCountry || null,
        residenceCity: residenceCity || null,
        activity: activity || null,
        photoUrl: photoUrl || null,
        phone: phone || null,
        alive,
        deathDate: deathDate ? new Date(deathDate).toISOString() : null,
      };

      // Parents
      if (fatherMode === 'select' && selectedFatherID) {
        payload.fatherID = selectedFatherID;
      } else if (fatherMode === 'manual' && manualFatherName) {
        payload.fatherName = manualFatherName;
      }

      if (motherMode === 'select' && selectedMotherID) {
        payload.motherID = selectedMotherID;
      } else if (motherMode === 'manual' && manualMotherName) {
        payload.motherName = manualMotherName;
      }

      if (isEditMode) {
        await api.put(`/persons/${id}`, payload);
        toast({
          title: '✅ Membre mis à jour',
          status: 'success',
          duration: 3000,
        });
      } else {
        await api.post('/persons', payload);
        toast({
          title: '✅ Membre ajouté',
          status: 'success',
          duration: 3000,
        });
      }

      navigate('/persons');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de l\'enregistrement';
      toast({
        title: 'Erreur',
        description: errorMessage,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrer les membres par sexe pour père/mère
  const potentialFathers = familyMembers.filter(m => m.sex === 'M');
  const potentialMothers = familyMembers.filter(m => m.sex === 'F');

  // 🔒 Protection: Seuls les admins peuvent accéder à ce formulaire
  const isAdmin = user?.role === 'Admin';

  if (!isAdmin) {
    return (
      <Box minH="100vh" bgGradient="linear(to-br, red.400, red.600)" py={12}>
        <Container maxW="2xl">
          <Card bg="white" borderRadius="2xl" boxShadow="2xl" overflow="hidden">
            <CardBody p={8}>
              <VStack spacing={6} textAlign="center">
                <Icon as={FaUserTie} boxSize={16} color="red.600" />
                <Heading size="xl" color="red.800">
                  🔒 Accès réservé aux administrateurs
                </Heading>
                <Text fontSize="lg" color="gray.600">
                  Vous n'avez pas les permissions nécessaires pour gérer les membres de la famille.
                </Text>
                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="bold">Membres normaux</Text>
                    <Text fontSize="sm">
                      Vous pouvez uniquement modifier <strong>votre propre profil</strong> via "Mon Profil".
                    </Text>
                  </Box>
                </Alert>
                <Button
                  colorScheme="purple"
                  size="lg"
                  onClick={() => navigate('/dashboard')}
                >
                  Retour au tableau de bord
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bgGradient="linear(to-br, orange.400, orange.600)" py={12}>
      <Container maxW="4xl">
        <Card bg="white" borderRadius="2xl" boxShadow="2xl" overflow="hidden">
          <CardBody p={8}>
            <VStack spacing={6} align="stretch">
              {/* En-tête */}
              <Box textAlign="center">
                <Icon as={FaUserTie} boxSize={12} color="orange.600" mb={4} />
                <Heading size="xl" color="orange.800" mb={2}>
                  {isEditMode ? 'Modifier un membre' : 'Ajouter un membre'}
                </Heading>
                <Text color="gray.600">
                  Fiche complète avec possibilité de relier les parents
                </Text>
                <Badge colorScheme="orange" fontSize="sm" mt={2}>
                  🔑 Mode Administrateur
                </Badge>
              </Box>

              <form onSubmit={handleSubmit}>
                <VStack spacing={6} align="stretch">
                  {/* Photo de profil */}
                  <FormControl>
                    <FormLabel textAlign="center">Photo de profil</FormLabel>
                    <VStack spacing={3}>
                      <Avatar
                        size="2xl"
                        name={`${firstName} ${lastName}`}
                        src={photoUrl || undefined}
                        bg="orange.400"
                        cursor="pointer"
                        onClick={() => fileInputRef.current?.click()}
                        _hover={{ transform: 'scale(1.05)', transition: 'all 0.3s' }}
                      />
                      <Button
                        size="sm"
                        leftIcon={<Icon as={FaCamera} />}
                        onClick={() => fileInputRef.current?.click()}
                        colorScheme="orange"
                        variant="outline"
                      >
                        Choisir une photo
                      </Button>
                      <Input
                        type="file"
                        accept="image/*"
                        display="none"
                        ref={fileInputRef}
                        onChange={handlePhotoUpload}
                      />
                    </VStack>
                  </FormControl>

                  <Divider />

                  {/* Informations de base */}
                  <Heading size="md" color="orange.600">
                    📋 Informations de base
                  </Heading>

                  <HStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Prénom</FormLabel>
                      <Input
                        value={firstName}
                        onChange={(e) => handleFirstNameChange(e.target.value)}
                        borderColor={!firstName ? 'red.500' : 'gray.200'}
                        borderWidth={!firstName ? '2px' : '1px'}
                      />
                      <FormHelperText fontSize="xs">Majuscule initiale auto</FormHelperText>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Nom</FormLabel>
                      <Input
                        value={lastName}
                        onChange={(e) => handleLastNameChange(e.target.value)}
                        borderColor={!lastName ? 'red.500' : 'gray.200'}
                        borderWidth={!lastName ? '2px' : '1px'}
                      />
                      <FormHelperText fontSize="xs">Tout en majuscules auto</FormHelperText>
                    </FormControl>
                  </HStack>

                  {/* Sexe */}
                  <FormControl isRequired>
                    <FormLabel>Sexe</FormLabel>
                    <RadioGroup value={gender} onChange={setGender}>
                      <Stack direction="row" spacing={8}>
                        <Radio value="M">
                          <HStack>
                            <Icon as={FaMale} color="blue.500" />
                            <Text>👨 Homme</Text>
                          </HStack>
                        </Radio>
                        <Radio value="F">
                          <HStack>
                            <Icon as={FaFemale} color="pink.500" />
                            <Text>👩 Femme</Text>
                          </HStack>
                        </Radio>
                      </Stack>
                    </RadioGroup>
                  </FormControl>

                  {/* Date de naissance */}
                  <FormControl isRequired>
                    <FormLabel>Date de naissance</FormLabel>
                    <Input
                      type="date"
                      value={birthDate}
                      onChange={(e) => handleBirthDateChange(e.target.value)}
                      borderColor={!birthDate ? 'red.500' : 'gray.200'}
                      borderWidth={!birthDate ? '2px' : '1px'}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </FormControl>

                  {/* Âge automatique */}
                  {age !== null && (
                    <FormControl>
                      <FormLabel>Âge</FormLabel>
                      <Input value={`${age} ans`} isReadOnly bg="gray.50" />
                      <FormHelperText fontSize="xs">Calculé automatiquement</FormHelperText>
                    </FormControl>
                  )}

                  {/* Téléphone */}
                  <FormControl>
                    <FormLabel>Numéro de téléphone</FormLabel>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </FormControl>

                  {/* Switch Vivant/Décédé */}
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb={0}>Décédé(e)</FormLabel>
                    <Switch
                      isChecked={!alive}
                      onChange={(e) => handleAliveChange(e.target.checked)}
                      colorScheme="gray"
                      size="lg"
                    />
                  </FormControl>

                  {/* Date de décès */}
                  {!alive && (
                    <FormControl>
                      <FormLabel>Date de décès</FormLabel>
                      <Input
                        type="date"
                        value={deathDate}
                        onChange={(e) => setDeathDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </FormControl>
                  )}

                  <Divider />

                  {/* Localisation naissance */}
                  <Heading size="md" color="orange.600">
                    📍 Lieu de naissance
                  </Heading>

                  <HStack spacing={4}>
                    <FormControl>
                      <FormLabel>Pays de naissance</FormLabel>
                      <Input
                        value={birthCountry}
                        onChange={(e) => setBirthCountry(e.target.value)}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Ville de naissance</FormLabel>
                      <Input
                        value={birthCity}
                        onChange={(e) => setBirthCity(e.target.value)}
                      />
                    </FormControl>
                  </HStack>

                  {/* Résidence */}
                  {alive && (
                    <>
                      <Divider />
                      <Heading size="md" color="orange.600">
                        🏠 Résidence actuelle
                      </Heading>

                      <Checkbox
                        isChecked={sameAsBirth}
                        onChange={(e) => handleSameAsBirthChange(e.target.checked)}
                        colorScheme="orange"
                      >
                        📍 Même lieu que naissance
                      </Checkbox>

                      {!sameAsBirth && (
                        <HStack spacing={4}>
                          <FormControl>
                            <FormLabel>Pays de résidence</FormLabel>
                            <Input
                              value={residenceCountry}
                              onChange={(e) => setResidenceCountry(e.target.value)}
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel>Ville de résidence</FormLabel>
                            <Input
                              value={residenceCity}
                              onChange={(e) => setResidenceCity(e.target.value)}
                            />
                          </FormControl>
                        </HStack>
                      )}
                    </>
                  )}

                  {/* Profession */}
                  {age !== null && age >= 18 && (
                    <>
                      <Divider />
                      <Heading size="md" color="orange.600">
                        💼 Profession
                      </Heading>

                      <FormControl>
                        <FormLabel>Activité professionnelle</FormLabel>
                        <Input
                          value={activity}
                          onChange={(e) => setActivity(e.target.value)}
                        />
                      </FormControl>
                    </>
                  )}

                  <Divider borderColor="orange.300" borderWidth="2px" />

                  {/* 👨‍👩‍👦 SECTION PARENTS - MODIFIABLE */}
                  <Alert status="info" borderRadius="md" variant="left-accent">
                    <AlertIcon />
                    <Box>
                      <Text fontWeight="bold">👨‍👩‍👦 Liens familiaux (parents)</Text>
                      <Text fontSize="sm">
                        Vous pouvez relier aux membres existants ou saisir manuellement
                      </Text>
                    </Box>
                  </Alert>

                  <Heading size="md" color="orange.600">
                    👨‍👩‍👦 Parents
                  </Heading>

                  {/* PÈRE */}
                  <Card borderWidth="1px" borderColor="blue.200" bg="blue.50">
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <HStack>
                          <Icon as={FaMale} color="blue.600" boxSize={5} />
                          <Heading size="sm" color="blue.700">Père</Heading>
                        </HStack>

                        <RadioGroup value={fatherMode} onChange={(val: any) => setFatherMode(val)}>
                          <Stack spacing={3}>
                            <Radio value="none">
                              ❌ Aucun père renseigné
                            </Radio>
                            <Radio value="select">
                              🔍 Sélectionner dans les membres existants
                            </Radio>
                            <Radio value="manual">
                              ✍️ Saisir manuellement (pour membre non encore créé)
                            </Radio>
                          </Stack>
                        </RadioGroup>

                        {fatherMode === 'select' && (
                          <FormControl>
                            <FormLabel fontSize="sm">Sélectionner le père</FormLabel>
                            <Select
                              value={selectedFatherID || ''}
                              onChange={(e) => setSelectedFatherID(Number(e.target.value) || null)}
                              icon={<FaSearch />}
                            >
                              {potentialFathers.map((member) => (
                                <option key={member.personID} value={member.personID}>
                                  👨 {member.firstName} {member.lastName}
                                  {member.birthday && ` (né le ${new Date(member.birthday).toLocaleDateString('fr-FR')})`}
                                  {!member.alive && ' ✝️'}
                                </option>
                              ))}
                            </Select>
                            {potentialFathers.length === 0 && (
                              <FormHelperText fontSize="xs" color="orange.600">
                                ⚠️ Aucun membre masculin dans la famille. Créez-le d'abord ou utilisez la saisie manuelle.
                              </FormHelperText>
                            )}
                          </FormControl>
                        )}

                        {fatherMode === 'manual' && (
                          <FormControl>
                            <FormLabel fontSize="sm">Nom complet du père</FormLabel>
                            <Input
                              value={manualFatherName}
                              onChange={(e) => setManualFatherName(e.target.value)}
                            />
                            <FormHelperText fontSize="xs">
                              Saisissez le nom complet. Vous pourrez créer sa fiche plus tard.
                            </FormHelperText>
                          </FormControl>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* MÈRE */}
                  <Card borderWidth="1px" borderColor="pink.200" bg="pink.50">
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <HStack>
                          <Icon as={FaFemale} color="pink.600" boxSize={5} />
                          <Heading size="sm" color="pink.700">Mère</Heading>
                        </HStack>

                        <RadioGroup value={motherMode} onChange={(val: any) => setMotherMode(val)}>
                          <Stack spacing={3}>
                            <Radio value="none">
                              ❌ Aucune mère renseignée
                            </Radio>
                            <Radio value="select">
                              🔍 Sélectionner dans les membres existants
                            </Radio>
                            <Radio value="manual">
                              ✍️ Saisir manuellement (pour membre non encore créé)
                            </Radio>
                          </Stack>
                        </RadioGroup>

                        {motherMode === 'select' && (
                          <FormControl>
                            <FormLabel fontSize="sm">Sélectionner la mère</FormLabel>
                            <Select
                              value={selectedMotherID || ''}
                              onChange={(e) => setSelectedMotherID(Number(e.target.value) || null)}
                              icon={<FaSearch />}
                            >
                              {potentialMothers.map((member) => (
                                <option key={member.personID} value={member.personID}>
                                  👩 {member.firstName} {member.lastName}
                                  {member.birthday && ` (née le ${new Date(member.birthday).toLocaleDateString('fr-FR')})`}
                                  {!member.alive && ' ✝️'}
                                </option>
                              ))}
                            </Select>
                            {potentialMothers.length === 0 && (
                              <FormHelperText fontSize="xs" color="orange.600">
                                ⚠️ Aucun membre féminin dans la famille. Créez-la d'abord ou utilisez la saisie manuelle.
                              </FormHelperText>
                            )}
                          </FormControl>
                        )}

                        {motherMode === 'manual' && (
                          <FormControl>
                            <FormLabel fontSize="sm">Nom complet de la mère</FormLabel>
                            <Input
                              value={manualMotherName}
                              onChange={(e) => setManualMotherName(e.target.value)}
                            />
                            <FormHelperText fontSize="xs">
                              Saisissez le nom complet. Vous pourrez créer sa fiche plus tard.
                            </FormHelperText>
                          </FormControl>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Boutons */}
                  <HStack spacing={4} pt={4}>
                    <Button
                      variant="outline"
                      colorScheme="gray"
                      onClick={() => navigate('/persons')}
                      flex={1}
                      size="lg"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      colorScheme="orange"
                      isLoading={isLoading}
                      loadingText="Enregistrement..."
                      flex={1}
                      size="lg"
                    >
                      {isEditMode ? 'Mettre à jour' : 'Ajouter le membre'}
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
