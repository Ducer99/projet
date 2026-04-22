import { useState, useRef } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  HStack,
  Icon,
  Badge,
  Divider,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  List,
  ListItem,
  ListIcon,
  Flex,
  Progress,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import {
  FaFileExcel,
  FaDownload,
  FaUpload,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaArrowLeft,
} from 'react-icons/fa';
import api from '../services/api';

interface ImportResult {
  imported: number;
  skipped: number;
  errors: number;
  details: {
    imported: string[];
    skipped: string[];
    errors: string[];
  };
}

export default function ImportMembers() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.name.endsWith('.xlsx') && !f.name.endsWith('.xls')) {
      toast({ title: 'Format invalide', description: 'Utilisez un fichier .xlsx', status: 'error', duration: 3000 });
      return;
    }
    setFile(f);
    setResult(null);
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get('/import/template', { responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'modele_import_famille.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: 'Erreur lors du téléchargement', status: 'error', duration: 3000 });
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/import/excel', formData);
      setResult(response.data);
      toast({
        title: `${response.data.imported} membre(s) importé(s)`,
        status: response.data.errors > 0 ? 'warning' : 'success',
        duration: 4000,
      });
    } catch (error: any) {
      toast({
        title: "Erreur d'import",
        description: error.response?.data?.message || 'Une erreur est survenue',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="transparent">
      {/* Header */}
      <Box bgGradient="linear(to-r, green.700, green.500)" px={6} py={8}>
        <Container maxW="container.md">
          <HStack spacing={4}>
            <Flex w="56px" h="56px" borderRadius="xl" bg="whiteAlpha.200" align="center" justify="center">
              <Icon as={FaFileExcel} color="white" fontSize="24px" />
            </Flex>
            <Box>
              <Heading color="white" size="lg">Import Excel</Heading>
              <Text color="whiteAlpha.800" fontSize="sm" mt={1}>
                Importez plusieurs membres en une seule fois
              </Text>
            </Box>
          </HStack>
        </Container>
      </Box>

      <Container maxW="container.md" py={8}>
        <VStack spacing={6} align="stretch">

          {/* Étape 1 : Télécharger le modèle */}
          <Box bg="white" borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
            <Box px={6} py={4} borderBottomWidth={1} borderColor="gray.100">
              <HStack>
                <Badge colorScheme="green" borderRadius="full" px={3} py={1}>1</Badge>
                <Text fontWeight="bold" color="gray.700">Télécharger le modèle</Text>
              </HStack>
            </Box>
            <Box px={6} py={6}>
              <Text fontSize="sm" color="gray.600" mb={4}>
                Téléchargez le fichier Excel modèle, remplissez-le avec les membres de votre famille, puis importez-le.
              </Text>
              <Box bg="gray.50" borderRadius="lg" p={4} mb={4}>
                <Text fontSize="xs" color="gray.500" fontWeight="semibold" mb={2}>COLONNES DISPONIBLES</Text>
                <HStack wrap="wrap" spacing={2}>
                  {['Prénom*', 'Nom*', 'Sexe*', 'Date naissance', 'Décédé', 'Date décès', 'Email', 'Activité', 'Notes', 'Père (prénom)', 'Père (nom)', 'Mère (prénom)', 'Mère (nom)'].map(col => (
                    <Badge key={col} colorScheme={col.includes('*') ? 'red' : 'gray'} fontSize="xs">{col}</Badge>
                  ))}
                </HStack>
                <Text fontSize="xs" color="red.500" mt={2}>* Champs obligatoires</Text>
              </Box>
              <Button
                leftIcon={<Icon as={FaDownload} />}
                colorScheme="green"
                variant="outline"
                onClick={handleDownloadTemplate}
              >
                Télécharger le modèle .xlsx
              </Button>
            </Box>
          </Box>

          {/* Étape 2 : Importer */}
          <Box bg="white" borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
            <Box px={6} py={4} borderBottomWidth={1} borderColor="gray.100">
              <HStack>
                <Badge colorScheme="green" borderRadius="full" px={3} py={1}>2</Badge>
                <Text fontWeight="bold" color="gray.700">Importer votre fichier</Text>
              </HStack>
            </Box>
            <Box px={6} py={6}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              {/* Drop zone */}
              <Box
                border="2px dashed"
                borderColor={file ? 'green.400' : 'gray.200'}
                borderRadius="xl"
                p={8}
                textAlign="center"
                cursor="pointer"
                bg={file ? 'green.50' : 'gray.50'}
                transition="all 0.2s"
                onClick={() => fileInputRef.current?.click()}
                _hover={{ borderColor: 'green.400', bg: 'green.50' }}
                mb={4}
              >
                <Icon as={file ? FaCheckCircle : FaFileExcel}
                  fontSize="40px"
                  color={file ? 'green.500' : 'gray.300'}
                  mb={3}
                />
                {file ? (
                  <>
                    <Text fontWeight="semibold" color="green.700">{file.name}</Text>
                    <Text fontSize="sm" color="green.500">
                      {(file.size / 1024).toFixed(1)} Ko — Cliquez pour changer
                    </Text>
                  </>
                ) : (
                  <>
                    <Text fontWeight="semibold" color="gray.500">Cliquez pour choisir un fichier</Text>
                    <Text fontSize="sm" color="gray.400">Formats acceptés : .xlsx, .xls</Text>
                  </>
                )}
              </Box>

              {loading && <Progress size="xs" isIndeterminate colorScheme="green" borderRadius="full" mb={4} />}

              <HStack spacing={3}>
                <Button
                  leftIcon={<Icon as={FaUpload} />}
                  colorScheme="green"
                  isDisabled={!file}
                  isLoading={loading}
                  loadingText="Import en cours..."
                  onClick={handleImport}
                  flex={1}
                >
                  Lancer l'import
                </Button>
                {file && !loading && (
                  <Button variant="ghost" colorScheme="gray" onClick={() => { setFile(null); setResult(null); }}>
                    Annuler
                  </Button>
                )}
              </HStack>
            </Box>
          </Box>

          {/* Résultats */}
          {result && (
            <Box bg="white" borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
              <Box px={6} py={4} borderBottomWidth={1} borderColor="gray.100">
                <HStack>
                  <Badge colorScheme="green" borderRadius="full" px={3} py={1}>Résultats</Badge>
                </HStack>
              </Box>
              <Box px={6} py={6}>
                <HStack spacing={4} mb={6}>
                  <Box flex={1} textAlign="center" p={4} bg="green.50" borderRadius="lg">
                    <Text fontSize="2xl" fontWeight="bold" color="green.600">{result.imported}</Text>
                    <Text fontSize="sm" color="green.700">Importé(s)</Text>
                  </Box>
                  <Box flex={1} textAlign="center" p={4} bg="yellow.50" borderRadius="lg">
                    <Text fontSize="2xl" fontWeight="bold" color="yellow.600">{result.skipped}</Text>
                    <Text fontSize="sm" color="yellow.700">Ignoré(s)</Text>
                  </Box>
                  <Box flex={1} textAlign="center" p={4} bg="red.50" borderRadius="lg">
                    <Text fontSize="2xl" fontWeight="bold" color="red.600">{result.errors}</Text>
                    <Text fontSize="sm" color="red.700">Erreur(s)</Text>
                  </Box>
                </HStack>

                {result.details.skipped.length > 0 && (
                  <Alert status="warning" borderRadius="lg" mb={3}>
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Lignes ignorées</AlertTitle>
                      <AlertDescription>
                        <List spacing={1} mt={1}>
                          {result.details.skipped.map((s, i) => (
                            <ListItem key={i} fontSize="sm">
                              <ListIcon as={FaExclamationTriangle} color="yellow.500" />
                              {s}
                            </ListItem>
                          ))}
                        </List>
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}

                {result.details.errors.length > 0 && (
                  <Alert status="error" borderRadius="lg" mb={3}>
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Erreurs de données</AlertTitle>
                      <AlertDescription>
                        <List spacing={1} mt={1}>
                          {result.details.errors.map((e, i) => (
                            <ListItem key={i} fontSize="sm">
                              <ListIcon as={FaTimesCircle} color="red.500" />
                              {e}
                            </ListItem>
                          ))}
                        </List>
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}

                {result.imported > 0 && (
                  <Button colorScheme="green" w="full" mt={2} onClick={() => navigate('/persons')}>
                    Voir les membres importés
                  </Button>
                )}
              </Box>
            </Box>
          )}

          <Divider />
          <Button leftIcon={<Icon as={FaArrowLeft} />} variant="ghost" colorScheme="gray" onClick={() => navigate('/persons')}>
            Retour aux membres
          </Button>

        </VStack>
      </Container>
    </Box>
  );
}
