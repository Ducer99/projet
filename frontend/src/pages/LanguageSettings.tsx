import { 
  Container, 
  VStack, 
  Heading, 
  Text, 
  Box, 
  SimpleGrid,
  Button,
  Icon,
  useToast,
  Divider,
  Badge,
  HStack
} from '@chakra-ui/react';
import { FaGlobe, FaCheck } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const LanguageSettings = () => {
  const { i18n } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();

  const languages = [
    { 
      code: 'fr', 
      name: 'Français', 
      flag: '🇫🇷',
      description: 'Language française - France',
      nativeName: 'Français'
    },
    { 
      code: 'en', 
      name: 'English', 
      flag: '🇬🇧',
      description: 'English language - United Kingdom',
      nativeName: 'English'
    }
  ];

  const changeLanguage = (lng: string, languageName: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
    
    toast({
      title: '✅ Langue modifiée',
      description: `L'application est maintenant en ${languageName}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top'
    });
  };

  return (
    <Container maxW="container.lg" py={8}>
      <VStack align="start" spacing={6}>
        {/* En-tête */}
        <Box>
          <Heading size="lg" color="purple.700" mb={2}>
            🌍 Paramètres de langue
          </Heading>
          <Text color="gray.600" fontSize="md">
            Choisissez votre langue préférée pour l'interface de l'application.
            Votre choix sera sauvegardé et appliqué à chaque visite.
          </Text>
        </Box>

        <Divider />

        {/* Langue actuelle */}
        <Box width="100%" bg="purple.50" p={4} borderRadius="md" borderLeft="4px" borderColor="purple.500">
          <HStack spacing={3}>
            <Icon as={FaGlobe} fontSize="2xl" color="purple.500" />
            <VStack align="start" spacing={0}>
              <Text fontWeight="bold" color="purple.700">
                Langue actuelle
              </Text>
              <Text fontSize="xl">
                {languages.find(lang => lang.code === i18n.language)?.flag}{' '}
                {languages.find(lang => lang.code === i18n.language)?.name}
              </Text>
            </VStack>
          </HStack>
        </Box>

        <Divider />

        {/* Liste des langues disponibles */}
        <Box width="100%">
          <Heading size="md" mb={4} color="gray.700">
            Langues disponibles
          </Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {languages.map((language) => {
              const isActive = i18n.language === language.code;
              
              return (
                <Box
                  key={language.code}
                  p={6}
                  borderWidth={2}
                  borderRadius="lg"
                  borderColor={isActive ? 'purple.500' : 'gray.200'}
                  bg={isActive ? 'purple.50' : 'white'}
                  position="relative"
                  transition="all 0.2s"
                  _hover={{
                    shadow: 'md',
                    borderColor: 'purple.400'
                  }}
                >
                  {isActive && (
                    <Badge
                      position="absolute"
                      top={2}
                      right={2}
                      colorScheme="green"
                      display="flex"
                      alignItems="center"
                      gap={1}
                    >
                      <Icon as={FaCheck} /> Actif
                    </Badge>
                  )}
                  
                  <VStack align="start" spacing={3}>
                    <Text fontSize="4xl">{language.flag}</Text>
                    
                    <VStack align="start" spacing={1}>
                      <Text fontSize="xl" fontWeight="bold" color="gray.800">
                        {language.name}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {language.description}
                      </Text>
                    </VStack>
                    
                    <Button
                      width="100%"
                      colorScheme={isActive ? 'green' : 'purple'}
                      variant={isActive ? 'solid' : 'outline'}
                      leftIcon={isActive ? <Icon as={FaCheck} /> : <Icon as={FaGlobe} />}
                      onClick={() => changeLanguage(language.code, language.name)}
                      isDisabled={isActive}
                    >
                      {isActive ? 'Langue active' : 'Activer'}
                    </Button>
                  </VStack>
                </Box>
              );
            })}
          </SimpleGrid>
        </Box>

        <Divider />

        {/* Informations */}
        <Box width="100%" bg="blue.50" p={4} borderRadius="md">
          <Text fontSize="sm" color="blue.800">
            <strong>💡 Astuce :</strong> Vous pouvez également changer de langue rapidement en utilisant 
            le sélecteur 🌍 dans le menu en haut à droite de l'application.
          </Text>
        </Box>

        {/* Bouton retour */}
        <Button
          onClick={() => navigate('/dashboard')}
          variant="ghost"
          colorScheme="gray"
        >
          ← Retour au tableau de bord
        </Button>
      </VStack>
    </Container>
  );
};

export default LanguageSettings;
