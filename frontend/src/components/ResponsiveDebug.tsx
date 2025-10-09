import { Box, Badge, VStack, Text, useBreakpoint } from '@chakra-ui/react';
import { useDevice, useIsMobile, useIsTablet, useIsDesktop } from '../hooks/useResponsive';
import { useState, useEffect } from 'react';

/**
 * 🐛 Composant de Debug Responsive
 * 
 * Affiche en temps réel:
 * - Le breakpoint actuel
 * - Le type d'appareil
 * - La largeur de l'écran
 * - Les états mobile/tablet/desktop
 * 
 * À ajouter temporairement dans App.tsx pour debugger le responsive
 * 
 * @example
 * // Dans App.tsx
 * import ResponsiveDebug from './components/ResponsiveDebug';
 * 
 * function App() {
 *   return (
 *     <>
 *       <ResponsiveDebug />
 *       <Routes>...</Routes>
 *     </>
 *   );
 * }
 */

const ResponsiveDebug = () => {
  const breakpoint = useBreakpoint();
  const device = useDevice();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getDeviceColor = () => {
    if (isMobile) return 'red';
    if (isTablet) return 'orange';
    if (isDesktop) return 'green';
    return 'gray';
  };

  const getBreakpointInfo = () => {
    switch (breakpoint) {
      case 'base':
        return { label: 'Mobile Tiny', range: '0-479px' };
      case 'sm':
        return { label: 'Mobile', range: '480-767px' };
      case 'md':
        return { label: 'Tablette', range: '768-991px' };
      case 'lg':
        return { label: 'Desktop', range: '992-1279px' };
      case 'xl':
        return { label: 'Desktop Large', range: '1280-1535px' };
      case '2xl':
        return { label: 'Desktop XL', range: '1536px+' };
      default:
        return { label: 'Unknown', range: 'N/A' };
    }
  };

  const bpInfo = getBreakpointInfo();

  return (
    <Box
      position="fixed"
      bottom={4}
      right={4}
      bg="blackAlpha.900"
      color="white"
      p={4}
      borderRadius="lg"
      boxShadow="2xl"
      zIndex={9999}
      fontSize="xs"
      minW="200px"
      backdropFilter="blur(10px)"
    >
      <VStack align="stretch" spacing={2}>
        {/* Titre */}
        <Text fontSize="sm" fontWeight="bold" mb={1}>
          🐛 Responsive Debug
        </Text>

        {/* Breakpoint actuel */}
        <Box>
          <Text color="gray.400" fontSize="2xs" mb={1}>
            Breakpoint:
          </Text>
          <Badge colorScheme={getDeviceColor()} fontSize="xs">
            {breakpoint?.toUpperCase() || 'N/A'}
          </Badge>
          <Text color="gray.400" fontSize="2xs" mt={1}>
            {bpInfo.label} ({bpInfo.range})
          </Text>
        </Box>

        {/* Device type */}
        <Box>
          <Text color="gray.400" fontSize="2xs" mb={1}>
            Device:
          </Text>
          <Badge colorScheme={getDeviceColor()} fontSize="xs">
            {device?.toUpperCase() || 'N/A'}
          </Badge>
        </Box>

        {/* Largeur écran */}
        <Box>
          <Text color="gray.400" fontSize="2xs" mb={1}>
            Largeur:
          </Text>
          <Text fontWeight="bold" fontSize="sm">
            {screenWidth}px
          </Text>
        </Box>

        {/* États */}
        <Box>
          <Text color="gray.400" fontSize="2xs" mb={1}>
            États:
          </Text>
          <VStack align="stretch" spacing={1}>
            <Box display="flex" justifyContent="space-between">
              <Text>Mobile:</Text>
              <Badge colorScheme={isMobile ? 'green' : 'red'} fontSize="2xs">
                {isMobile ? 'YES' : 'NO'}
              </Badge>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Text>Tablet:</Text>
              <Badge colorScheme={isTablet ? 'green' : 'red'} fontSize="2xs">
                {isTablet ? 'YES' : 'NO'}
              </Badge>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Text>Desktop:</Text>
              <Badge colorScheme={isDesktop ? 'green' : 'red'} fontSize="2xs">
                {isDesktop ? 'YES' : 'NO'}
              </Badge>
            </Box>
          </VStack>
        </Box>

        {/* Instructions */}
        <Box pt={2} borderTop="1px solid" borderColor="whiteAlpha.300">
          <Text color="gray.400" fontSize="2xs">
            💡 Redimensionnez la fenêtre pour voir les changements
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default ResponsiveDebug;
