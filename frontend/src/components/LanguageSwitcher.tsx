import { Menu, MenuButton, MenuList, MenuItem, Button, Icon, Text, HStack } from '@chakra-ui/react';
import { FaGlobe, FaCheck } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

interface LanguageSwitcherProps {
  onDark?: boolean;
}

const LanguageSwitcher = ({ onDark = false }: LanguageSwitcherProps) => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // Sauvegarder explicitement dans localStorage
    localStorage.setItem('i18nextLng', lng);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <Menu>
      <MenuButton
        as={Button}
        leftIcon={<Icon as={FaGlobe} />}
        variant={onDark ? 'ghost' : 'outline'}
        size="sm"
        color={onDark ? 'whiteAlpha.900' : undefined}
        colorScheme={onDark ? 'whiteAlpha' : 'purple'}
        _hover={onDark ? { bg: 'whiteAlpha.200' } : undefined}
        type="button"
      >
        <HStack spacing={2}>
          <Text fontSize="lg">{currentLanguage.flag}</Text>
          <Text display={{ base: 'none', md: 'block' }} fontWeight="semibold">
            {currentLanguage.name}
          </Text>
        </HStack>
      </MenuButton>
      <MenuList zIndex={9999}>
        {languages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            bg={i18n.language === language.code ? 'purple.50' : 'transparent'}
            _hover={{ bg: 'purple.100' }}
          >
            <HStack spacing={3} justify="space-between" width="100%">
              <HStack spacing={3}>
                <Text fontSize="xl">{language.flag}</Text>
                <Text fontWeight={i18n.language === language.code ? 'bold' : 'normal'}>
                  {language.name}
                </Text>
              </HStack>
              {i18n.language === language.code && (
                <Icon as={FaCheck} color="green.500" />
              )}
            </HStack>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default LanguageSwitcher;
