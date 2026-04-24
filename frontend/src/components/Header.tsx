import {
  Box,
  Container,
  HStack,
  Heading,
  Icon,
  Button,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  Avatar,
  useDisclosure,
  useBreakpointValue,
  Text,
  Divider,
} from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaUsers,
  FaCalendar,
  FaSitemap,
  FaUserCircle,
  FaRing,
  FaBars,
  FaSignOutAlt,
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

  const isMobile = useBreakpointValue({ base: true, md: false });

  const hideHeader = ['/login', '/register', '/register-simple', '/forgot-password'].includes(location.pathname);

  if (hideHeader) {
    return (
      <Box position="fixed" top={4} right={4} zIndex={1000}>
        <LanguageSwitcher />
      </Box>
    );
  }

  if (!user) return null;

  const navItems = [
    { path: '/dashboard',    icon: FaHome,       label: t('navigation.home'),     exact: true },
    { path: '/family-tree',  icon: FaSitemap,    label: t('navigation.tree'),     exact: false },
    { path: '/persons',      icon: FaUsers,      label: t('navigation.members'),  exact: true },
    { path: '/events',       icon: FaCalendar,   label: t('navigation.events'),   exact: true },
    { path: '/weddings',     icon: FaRing,       label: t('navigation.weddings'), exact: true },
    { path: '/my-profile',   icon: FaUserCircle, label: t('navigation.profile'),  exact: true },
  ];

  const isActive = (item: { path: string; exact: boolean }) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

  const displayName = user?.personName || user?.userName || '?';

  return (
    <Box
      as="header"
      bgGradient="linear(to-r, purple.900, purple.800, purple.700)"
      position="sticky"
      top={0}
      zIndex={999}
      boxShadow="header"
      display="block"
    >
      <Container maxW="container.xl" py={2.5}>
        <HStack justify="space-between" align="center">

          {/* Logo */}
          <HStack
            spacing={3}
            cursor="pointer"
            onClick={() => navigate('/dashboard')}
            _hover={{ opacity: 0.85 }}
            transition="opacity 0.2s"
          >
            <Box
              w="36px" h="36px"
              borderRadius="xl"
              bg="whiteAlpha.200"
              display="flex" alignItems="center" justifyContent="center"
              border="1px solid"
              borderColor="whiteAlpha.300"
            >
              <Icon as={FaSitemap} color="white" fontSize="md" />
            </Box>
            <Heading
              size="md"
              color="white"
              fontWeight="700"
              letterSpacing="-0.03em"
            >
              Family Tree
            </Heading>
          </HStack>

          {/* Nav Desktop */}
          {isMobile ? (
            <HStack spacing={2}>
              <LanguageSwitcher onDark />
              <IconButton
                aria-label="Menu"
                icon={<Icon as={FaBars} />}
                onClick={onOpen}
                variant="ghost"
                color="white"
                _hover={{ bg: 'whiteAlpha.200' }}
                size="md"
              />
            </HStack>
          ) : (
            <HStack spacing={1}>
              {navItems.map(item => {
                const active = isActive(item);
                return (
                  <Button
                    key={item.path}
                    leftIcon={<Icon as={item.icon} boxSize={3.5} />}
                    size="sm"
                    variant="ghost"
                    bg={active ? 'whiteAlpha.250' : 'transparent'}
                    color="white"
                    fontWeight={active ? '600' : '500'}
                    borderRadius="lg"
                    borderBottom={active ? '2px solid' : 'none'}
                    borderColor={active ? 'purple.300' : 'transparent'}
                    _hover={{ bg: 'whiteAlpha.200' }}
                    _active={{ bg: 'whiteAlpha.300' }}
                    onClick={() => navigate(item.path)}
                    px={3}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </HStack>
          )}

          {/* Right side */}
          {!isMobile && (
            <HStack spacing={3} align="center">
              <LanguageSwitcher onDark />

              <Button
                leftIcon={<Icon as={FaSignOutAlt} boxSize={3.5} />}
                variant="ghost"
                size="sm"
                color="whiteAlpha.800"
                _hover={{ bg: 'whiteAlpha.200', color: 'white' }}
                borderRadius="lg"
                fontWeight="500"
                onClick={logout}
              >
                {t('navigation.logout')}
              </Button>

              <Avatar
                size="sm"
                name={displayName}
                bg="purple.400"
                color="white"
                border="2px solid"
                borderColor="whiteAlpha.400"
                cursor="pointer"
                onClick={() => navigate('/my-profile')}
                _hover={{ borderColor: 'white', transform: 'scale(1.08)' }}
                transition="all 0.2s"
                fontWeight="700"
              />
            </HStack>
          )}
        </HStack>
      </Container>

      {/* Drawer Mobile */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xs">
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent bg="white" borderRadius="2xl 0 0 2xl" overflow="hidden">
          <Box bgGradient="linear(to-r, purple.900, purple.700)" px={4} py={5}>
            <DrawerCloseButton color="white" top={4} right={4} />
            <HStack spacing={3} mb={2}>
              <Avatar size="sm" name={displayName} bg="purple.400" color="white" fontWeight="700" />
              <Box>
                <Text color="white" fontWeight="700" fontSize="sm" lineHeight="1.2">
                  {displayName}
                </Text>
                <Text color="whiteAlpha.700" fontSize="xs">{user?.userName}</Text>
              </Box>
            </HStack>
          </Box>

          <DrawerHeader borderBottomWidth="0" pt={5} pb={2} px={4}>
            <Text fontSize="xs" fontWeight="700" color="purple.400" letterSpacing="0.08em" textTransform="uppercase">
              Navigation
            </Text>
          </DrawerHeader>

          <DrawerBody px={3} pb={6}>
            <VStack spacing={1} align="stretch">
              {navItems.map(item => {
                const active = isActive(item);
                return (
                  <Button
                    key={item.path}
                    leftIcon={<Icon as={item.icon} boxSize={4} />}
                    variant={active ? 'solid' : 'ghost'}
                    colorScheme={active ? 'purple' : 'gray'}
                    justifyContent="flex-start"
                    borderRadius="xl"
                    fontWeight={active ? '600' : '500'}
                    size="md"
                    onClick={() => { navigate(item.path); onClose(); }}
                  >
                    {item.label}
                  </Button>
                );
              })}

              <Divider my={2} borderColor="purple.100" />

              <Box px={1}>
                <LanguageSwitcher />
              </Box>

              <Button
                leftIcon={<Icon as={FaSignOutAlt} />}
                variant="ghost"
                colorScheme="red"
                justifyContent="flex-start"
                borderRadius="xl"
                fontWeight="500"
                onClick={() => { logout(); onClose(); }}
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
