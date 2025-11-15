import { Box, Container, HStack, Heading, Icon, Button, useColorModeValue, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FaHome, FaUsers, FaCalendar, FaSitemap, FaUserCircle, FaRing, FaChevronDown } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
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
    >
      <Container maxW="container.xl" py={3}>
        <HStack justify="space-between">
          {/* Logo / Titre */}
          <HStack spacing={2} cursor="pointer" onClick={() => navigate('/dashboard')}>
            <Icon as={FaSitemap} fontSize="2xl" color="purple.500" />
            <Heading size="md" color="purple.700">
              Family Tree
            </Heading>
          </HStack>
          
          {/* Navigation */}
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
        </HStack>
      </Container>
    </Box>
  );
};

export default Header;
