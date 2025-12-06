import { 
  Box, 
  Container, 
  HStack, 
  Heading, 
  Icon, 
  Button, 
  useColorModeValue, 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  useDisclosure,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaUsers, 
  FaCalendar, 
  FaSitemap, 
  FaUserCircle, 
  FaRing, 
  FaChevronDown,
  FaBars 
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // 📱 Responsive: Afficher le menu desktop ou mobile selon la taille d'écran
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  // Pages où le header ne doit pas s'afficher
  const hideHeader = ['/login', '/register', '/register-simple', '/forgot-password'].includes(location.pathname);
  
  if (hideHeader) {
    return (
      <Box 
        position="fixed" 
        top={4} 
        right={4} 
        zIndex={1000}
      >
        <LanguageSwitcher />
      </Box>
    );
  }
  
  if (!user) return null;
  
  // Navigation items pour réutilisation
  const navigationItems = [
    { 
      path: '/dashboard', 
      icon: FaHome, 
      label: t('navigation.home'),
      exact: true
    },
    { 
      path: '/persons', 
      icon: FaUsers, 
      label: t('navigation.members'),
      exact: true
    },
    { 
      path: '/events', 
      icon: FaCalendar, 
      label: t('navigation.events'),
      exact: true
    },
    { 
      path: '/weddings', 
      icon: FaRing, 
      label: t('navigation.weddings'),
      exact: true
    },
    { 
      path: '/my-profile', 
      icon: FaUserCircle, 
      label: t('navigation.profile'),
      exact: true
    }
  ];
  
  return (
    <Box 
      as="header" 
      bg={bgColor} 
      borderBottom="1px" 
      borderColor={borderColor}
      position="sticky"
      top={0}
      zIndex={999}
      shadow="sm"
      display={{ base: 'none', md: 'block' }} // 📱 Caché sur mobile (< 768px)
    >
      <Container maxW="container.xl" py={3}>
        <HStack justify="space-between">
          {/* Logo / Titre */}
          <HStack spacing={2} cursor="pointer" onClick={() => navigate('/dashboard')}>
            <Icon as={FaSitemap} fontSize="2xl" color="purple.500" />
            <Heading size={{ base: 'sm', md: 'md' }} color="purple.700">
              Family Tree
            </Heading>
          </HStack>
          
          {/* 📱 Menu Hamburger (Mobile uniquement) */}
          {isMobile ? (
            <HStack spacing={2}>
              <LanguageSwitcher />
              <IconButton
                aria-label={t('navigation.menu', 'Menu')}
                icon={<Icon as={FaBars} />}
                onClick={onOpen}
                variant="ghost"
                colorScheme="purple"
                size="lg"
              />
            </HStack>
          ) : (
          /* 🖥️ Navigation Desktop (Tablette et Desktop) */
          <HStack spacing={4}>
            <Button
              leftIcon={<Icon as={FaHome} />}
              variant={location.pathname === '/dashboard' ? 'solid' : 'ghost'}
              colorScheme={location.pathname === '/dashboard' ? 'purple' : 'gray'}
              size="sm"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                navigate('/dashboard');
              }}
            >
              {t('navigation.home')}
            </Button>
            
            <Menu>
              <MenuButton
                as={Button}
                leftIcon={<Icon as={FaSitemap} />}
                rightIcon={<Icon as={FaChevronDown} fontSize="xs" />}
                variant={location.pathname.startsWith('/family-tree') ? 'solid' : 'ghost'}
                colorScheme={location.pathname.startsWith('/family-tree') ? 'purple' : 'gray'}
                size="sm"
              >
                {t('navigation.tree')}
              </MenuButton>
              <MenuList>
                <MenuItem
                  icon={<Icon as={FaSitemap} />}
                  onClick={() => navigate('/family-tree')}
                >
                  {t('navigation.treeStandard', 'Vue Standard')}
                </MenuItem>
                <MenuItem
                  icon={<span style={{ fontSize: '1.2em' }}>🌳</span>}
                  onClick={() => navigate('/family-tree-organic')}
                >
                  {t('navigation.treeOrganic', 'Vue Organique')}
                </MenuItem>
              </MenuList>
            </Menu>
            
            <Button
              leftIcon={<Icon as={FaUsers} />}
              variant={location.pathname === '/persons' ? 'solid' : 'ghost'}
              colorScheme={location.pathname === '/persons' ? 'purple' : 'gray'}
              size="sm"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                navigate('/persons');
              }}
            >
              {t('navigation.members')}
            </Button>
            
            <Button
              leftIcon={<Icon as={FaCalendar} />}
              variant={location.pathname === '/events' ? 'solid' : 'ghost'}
              colorScheme={location.pathname === '/events' ? 'purple' : 'gray'}
              size="sm"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                navigate('/events');
              }}
            >
              {t('navigation.events')}
            </Button>
            
            <Button
              leftIcon={<Icon as={FaRing} />}
              variant={location.pathname === '/weddings' ? 'solid' : 'ghost'}
              colorScheme={location.pathname === '/weddings' ? 'purple' : 'gray'}
              size="sm"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                navigate('/weddings');
              }}
            >
              {t('navigation.weddings')}
            </Button>
            
            <Button
              leftIcon={<Icon as={FaUserCircle} />}
              variant={location.pathname === '/my-profile' ? 'solid' : 'ghost'}
              colorScheme={location.pathname === '/my-profile' ? 'purple' : 'gray'}
              size="sm"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                navigate('/my-profile');
              }}
            >
              {t('navigation.profile')}
            </Button>
            
            {/* Sélecteur de langue - TOUJOURS VISIBLE */}
            <LanguageSwitcher />
            
            <Button
              variant="outline"
              colorScheme="red"
              size="sm"
              type="button"
              onClick={logout}
            >
              {t('navigation.logout')}
            </Button>
          </HStack>
          )}
        </HStack>
      </Container>
      
      {/* 📱 Drawer Mobile (Menu latéral) */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <HStack spacing={2}>
              <Icon as={FaSitemap} fontSize="xl" color="purple.500" />
              <Heading size="sm">Family Tree</Heading>
            </HStack>
          </DrawerHeader>
          
          <DrawerBody>
            <VStack spacing={4} align="stretch" mt={4}>
              {/* Bouton Accueil */}
              <Button
                leftIcon={<Icon as={FaHome} />}
                variant={location.pathname === '/dashboard' ? 'solid' : 'ghost'}
                colorScheme={location.pathname === '/dashboard' ? 'purple' : 'gray'}
                justifyContent="flex-start"
                onClick={() => {
                  navigate('/dashboard');
                  onClose();
                }}
              >
                {t('navigation.home')}
              </Button>
              
              {/* Menu Arbre (avec sous-menu) */}
              <Box>
                <Button
                  leftIcon={<Icon as={FaSitemap} />}
                  variant={location.pathname.startsWith('/family-tree') ? 'solid' : 'ghost'}
                  colorScheme={location.pathname.startsWith('/family-tree') ? 'purple' : 'gray'}
                  width="100%"
                  justifyContent="flex-start"
                  mb={2}
                >
                  {t('navigation.tree')}
                </Button>
                <VStack spacing={1} align="stretch" pl={4}>
                  <Button
                    leftIcon={<Icon as={FaSitemap} fontSize="sm" />}
                    size="sm"
                    variant="ghost"
                    justifyContent="flex-start"
                    onClick={() => {
                      navigate('/family-tree');
                      onClose();
                    }}
                  >
                    {t('navigation.treeStandard', 'Vue Standard')}
                  </Button>
                  <Button
                    leftIcon={<span style={{ fontSize: '1em' }}>🌳</span>}
                    size="sm"
                    variant="ghost"
                    justifyContent="flex-start"
                    onClick={() => {
                      navigate('/family-tree-organic');
                      onClose();
                    }}
                  >
                    {t('navigation.treeOrganic', 'Vue Organique')}
                  </Button>
                </VStack>
              </Box>
              
              {/* Boutons restants */}
              {navigationItems.map(item => (
                <Button
                  key={item.path}
                  leftIcon={<Icon as={item.icon} />}
                  variant={location.pathname === item.path ? 'solid' : 'ghost'}
                  colorScheme={location.pathname === item.path ? 'purple' : 'gray'}
                  justifyContent="flex-start"
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                >
                  {item.label}
                </Button>
              ))}
              
              {/* Séparateur */}
              <Box borderTop="1px" borderColor={borderColor} my={2} />
              
              {/* Déconnexion */}
              <Button
                variant="outline"
                colorScheme="red"
                justifyContent="flex-start"
                onClick={() => {
                  logout();
                  onClose();
                }}
              >
                {t('navigation.logout')}
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Header;
