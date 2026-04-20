import {
  Container,
  VStack,
  Text,
  Box,
  SimpleGrid,
  Button,
  Icon,
  useToast,
  Badge,
  HStack,
  Heading,
  Flex,
} from '@chakra-ui/react';
import { FaGlobe, FaCheck } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const languages = [
  {
    code: 'fr',
    name: 'Français',
    flag: '🇫🇷',
    description: 'Interface complète en français',
    nativeName: 'Français',
  },
  {
    code: 'en',
    name: 'English',
    flag: '🇬🇧',
    description: 'Full interface in English',
    nativeName: 'English',
  },
];

const LanguageSettings = () => {
  const { i18n } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();

  const changeLanguage = (lng: string, languageName: string) => {
    i18n.changeLanguage(lng);
    try {
      localStorage.setItem('i18nextLng', lng);
    } catch { /* storage quota */ }

    toast({
      title: '✅ Langue modifiée',
      description: `L'application est maintenant en ${languageName}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top',
    });
  };

  const currentLang = languages.find(l => l.code === i18n.language);

  return (
    <Box minH="100vh" bg="transparent">
      {/* Header gradient */}
      <Box bgGradient="linear(to-r, purple.900, purple.700)" px={6} py={8}>
        <Container maxW="container.md">
          <HStack spacing={4}>
            <Flex
              w="56px" h="56px"
              borderRadius="xl"
              bg="whiteAlpha.200"
              align="center"
              justify="center"
            >
              <Icon as={FaGlobe} color="white" fontSize="24px" />
            </Flex>
            <Box>
              <Heading color="white" size="lg">Paramètres de langue</Heading>
              <Text color="whiteAlpha.800" fontSize="sm" mt={1}>
                {currentLang
                  ? `Langue active : ${currentLang.flag} ${currentLang.name}`
                  : 'Choisissez votre langue préférée'}
              </Text>
            </Box>
          </HStack>
        </Container>
      </Box>

      <Container maxW="container.md" py={8}>
        <VStack spacing={6} align="stretch">

          {/* Current language banner */}
          <Box bg="white" borderRadius="xl" boxShadow="sm" p={5}>
            <HStack spacing={3}>
              <Flex
                w="44px" h="44px"
                bg="purple.50"
                borderRadius="lg"
                align="center"
                justify="center"
                fontSize="24px"
              >
                {currentLang?.flag || '🌐'}
              </Flex>
              <Box>
                <Text fontSize="xs" color="gray.500" fontWeight="medium" textTransform="uppercase" letterSpacing="wide">
                  Langue actuelle
                </Text>
                <Text fontWeight="bold" color="gray.800" fontSize="lg">
                  {currentLang?.name || i18n.language}
                </Text>
              </Box>
              <Badge colorScheme="green" ml="auto" px={3} py={1} borderRadius="full">
                <HStack spacing={1}>
                  <Icon as={FaCheck} fontSize="10px" />
                  <Text>Active</Text>
                </HStack>
              </Badge>
            </HStack>
          </Box>

          {/* Language cards */}
          <Box bg="white" borderRadius="xl" boxShadow="sm" overflow="hidden">
            <Box px={6} py={4} borderBottomWidth={1} borderColor="gray.100">
              <Text fontWeight="bold" color="gray.700">Langues disponibles</Text>
            </Box>
            <Box px={6} py={6}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {languages.map((language) => {
                  const isActive = i18n.language === language.code ||
                    i18n.language.startsWith(language.code + '-');

                  return (
                    <Box
                      key={language.code}
                      p={5}
                      borderWidth={2}
                      borderRadius="xl"
                      borderColor={isActive ? 'purple.400' : 'gray.200'}
                      bg={isActive ? 'purple.50' : 'white'}
                      position="relative"
                      transition="all 0.2s"
                      _hover={{ shadow: 'md', borderColor: isActive ? 'purple.500' : 'purple.300' }}
                    >
                      {isActive && (
                        <Badge
                          position="absolute"
                          top={3} right={3}
                          colorScheme="green"
                          borderRadius="full"
                          px={2} py={0.5}
                          fontSize="xs"
                        >
                          <HStack spacing={1}>
                            <Icon as={FaCheck} fontSize="8px" />
                            <Text>Actif</Text>
                          </HStack>
                        </Badge>
                      )}

                      <VStack align="start" spacing={3}>
                        <Text fontSize="3xl">{language.flag}</Text>
                        <Box>
                          <Text fontSize="lg" fontWeight="bold" color="gray.800">
                            {language.name}
                          </Text>
                          <Text fontSize="sm" color="gray.500" mt={0.5}>
                            {language.description}
                          </Text>
                        </Box>
                        <Button
                          w="100%"
                          size="sm"
                          h="38px"
                          borderRadius="lg"
                          colorScheme={isActive ? 'green' : 'purple'}
                          variant={isActive ? 'solid' : 'outline'}
                          leftIcon={<Icon as={isActive ? FaCheck : FaGlobe} />}
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
          </Box>

          {/* Tip */}
          <Box bg="purple.50" p={4} borderRadius="xl" borderLeftWidth={4} borderColor="purple.400">
            <Text fontSize="sm" color="purple.800">
              <strong>💡 Astuce :</strong> Vous pouvez aussi changer la langue via le sélecteur 🌍
              dans le menu en haut à droite de l'application. Votre choix est automatiquement sauvegardé.
            </Text>
          </Box>

          <Button
            variant="ghost"
            colorScheme="gray"
            alignSelf="flex-start"
            onClick={() => navigate('/dashboard')}
          >
            ← Retour au tableau de bord
          </Button>
        </VStack>
      </Container>
    </Box>
  );
};

export default LanguageSettings;
