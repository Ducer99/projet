import { Box, Text, Code, VStack, Badge, Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

/**
 * 🔍 Composant de debug pour i18n
 * Affiche l'état actuel de la langue et permet de forcer le changement
 */
const LanguageDebug = () => {
  const { t, i18n } = useTranslation();
  const [localStorageValue, setLocalStorageValue] = useState<string | null>(null);
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    // Forcer le re-render quand la langue change
    const handleLanguageChange = () => {
      setRenderCount(prev => prev + 1);
      setLocalStorageValue(localStorage.getItem('i18nextLng'));
    };

    i18n.on('languageChanged', handleLanguageChange);
    setLocalStorageValue(localStorage.getItem('i18nextLng'));

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const forceEnglish = () => {
    console.log('🔧 Force English');
    i18n.changeLanguage('en');
    localStorage.setItem('i18nextLng', 'en');
  };

  const forceFrench = () => {
    console.log('🔧 Force French');
    i18n.changeLanguage('fr');
    localStorage.setItem('i18nextLng', 'fr');
  };

  return (
    <Box
      position="fixed"
      bottom={4}
      right={4}
      bg="gray.900"
      color="white"
      p={4}
      borderRadius="md"
      shadow="xl"
      zIndex={10000}
      maxW="400px"
    >
      <VStack align="stretch" spacing={2}>
        <Text fontSize="xs" fontWeight="bold">🔍 i18n Debug Info</Text>
        
        <Box>
          <Text fontSize="xs" opacity={0.7}>Current Language:</Text>
          <Badge colorScheme={i18n.language === 'en' ? 'green' : 'blue'}>
            {i18n.language}
          </Badge>
        </Box>

        <Box>
          <Text fontSize="xs" opacity={0.7}>localStorage Value:</Text>
          <Code fontSize="xs">{localStorageValue || 'null'}</Code>
        </Box>

        <Box>
          <Text fontSize="xs" opacity={0.7}>Test Translation:</Text>
          <Code fontSize="xs">{t('navigation.home')}</Code>
        </Box>

        <Box>
          <Text fontSize="xs" opacity={0.7}>Dashboard Title:</Text>
          <Code fontSize="xs">{t('dashboard.title')}</Code>
        </Box>

        <Box>
          <Text fontSize="xs" opacity={0.7}>Render Count:</Text>
          <Code fontSize="xs">{renderCount}</Code>
        </Box>

        <VStack spacing={1}>
          <Button size="xs" colorScheme="blue" onClick={forceFrench} w="full">
            Force FR
          </Button>
          <Button size="xs" colorScheme="green" onClick={forceEnglish} w="full">
            Force EN
          </Button>
          <Button 
            size="xs" 
            variant="outline" 
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            w="full"
          >
            Clear & Reload
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
};

export default LanguageDebug;
