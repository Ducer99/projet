import { Box, Flex, VStack, Text, Icon } from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaSitemap, FaList, FaUser } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

/**
 * Bottom Navigation Bar pour Mobile
 * Visible uniquement sur écrans < 768px
 * Position fixe en bas avec 4 onglets principaux
 */

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  
  const navItems = [
    { icon: FaHome, label: t('nav.home') || 'Accueil', path: '/dashboard' },
    { icon: FaSitemap, label: t('nav.tree') || 'Arbre', path: '/family-tree' },
    { icon: FaList, label: t('nav.members') || 'Membres', path: '/members' },
    { icon: FaUser, label: t('nav.profile') || 'Profil', path: '/my-profile' }
  ];
  
  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      bg="white"
      borderTop="1px solid"
      borderColor="gray.200"
      shadow="lg"
      zIndex={1000}
      display={{ base: 'block', md: 'none' }} // Visible uniquement mobile
      px={2}
      py={2}
      height="70px"
    >
      <Flex justify="space-around" align="center" h="100%">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <VStack
              key={item.path}
              spacing={0.5}
              cursor="pointer"
              onClick={() => navigate(item.path)}
              flex={1}
              opacity={isActive ? 1 : 0.6}
              transition="all 0.2s"
              _hover={{ opacity: 1 }}
              _active={{ transform: 'scale(0.95)' }}
            >
              <Icon
                as={item.icon}
                boxSize={6}
                color={isActive ? 'purple.500' : 'gray.400'}
              />
              <Text
                fontSize="2xs"
                fontWeight={isActive ? '600' : '400'}
                color={isActive ? 'purple.500' : 'gray.500'}
                noOfLines={1}
              >
                {item.label}
              </Text>
            </VStack>
          );
        })}
      </Flex>
    </Box>
  );
};

export default BottomNavigation;
