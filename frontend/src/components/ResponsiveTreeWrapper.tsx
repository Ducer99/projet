import React, { ReactNode } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Box, HStack, IconButton, Tooltip, useColorModeValue } from '@chakra-ui/react';
import { AddIcon, MinusIcon } from '@chakra-ui/icons';
import { FaRedo } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { isTouchDevice } from '../utils/responsive';

interface ResponsiveTreeWrapperProps {
  children: ReactNode;
  initialScale?: number;
  minScale?: number;
  maxScale?: number;
  height?: string;
  enablePan?: boolean;
  enableZoom?: boolean;
}

/**
 * 📱 Wrapper Responsive pour l'Arbre Généalogique
 * 
 * Fonctionnalités:
 * - 👆 Pan (déplacement avec 1 doigt ou souris)
 * - 🤏 Pinch-to-zoom (zoom avec 2 doigts sur mobile)
 * - 🖱️ Molette de souris (zoom sur desktop)
 * - 🔘 Contrôles de zoom +/- visuels
 * - 🔄 Bouton reset pour recentrer
 * - 📺 Mode plein écran (optionnel)
 */
export const ResponsiveTreeWrapper: React.FC<ResponsiveTreeWrapperProps> = ({
  children,
  initialScale = 1,
  minScale = 0.3,
  maxScale = 3,
  height = '80vh',
  enablePan = true,
  enableZoom = true,
}) => {
  const { t } = useTranslation();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const controlsBg = useColorModeValue('white', 'gray.800');
  const controlsBorder = useColorModeValue('gray.200', 'gray.700');
  
  const isTouchScreen = isTouchDevice();

  return (
    <Box position="relative" w="full" h={height} bg={bgColor} borderRadius="md" overflow="hidden">
      <TransformWrapper
        initialScale={initialScale}
        minScale={minScale}
        maxScale={maxScale}
        limitToBounds={false}
        centerOnInit={true}
        // 🖱️ Configuration molette souris (Desktop)
        wheel={{
          step: 0.1,
          disabled: !enableZoom,
        }}
        // 🤏 Configuration pinch-to-zoom (Mobile)
        pinch={{
          step: 5,
          disabled: !enableZoom || !isTouchScreen,
        }}
        // 👆 Configuration pan (déplacement)
        panning={{
          disabled: !enablePan,
          velocityDisabled: false,
        }}
        // 👆👆 Double-tap pour reset (Mobile)
        doubleClick={{
          mode: 'reset',
          step: 0.5,
        }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* 🎮 Contrôles de Navigation */}
            <Box
              position="absolute"
              top={4}
              right={4}
              zIndex={10}
              bg={controlsBg}
              borderRadius="md"
              boxShadow="lg"
              border="1px solid"
              borderColor={controlsBorder}
              p={2}
            >
              <HStack spacing={1}>
                {/* Zoom In */}
                <Tooltip label={t('tree.zoomIn', 'Zoom avant')} placement="bottom">
                  <IconButton
                    aria-label="Zoom in"
                    icon={<AddIcon />}
                    size="sm"
                    onClick={() => zoomIn()}
                    isDisabled={!enableZoom}
                  />
                </Tooltip>

                {/* Zoom Out */}
                <Tooltip label={t('tree.zoomOut', 'Zoom arrière')} placement="bottom">
                  <IconButton
                    aria-label="Zoom out"
                    icon={<MinusIcon />}
                    size="sm"
                    onClick={() => zoomOut()}
                    isDisabled={!enableZoom}
                  />
                </Tooltip>

                {/* Reset */}
                <Tooltip label={t('tree.resetView', 'Recentrer')} placement="bottom">
                  <IconButton
                    aria-label="Reset view"
                    icon={<FaRedo />}
                    size="sm"
                    onClick={() => resetTransform()}
                    colorScheme="blue"
                  />
                </Tooltip>
              </HStack>
            </Box>

            {/* 🌳 Contenu de l'Arbre avec Support Tactile */}
            <TransformComponent
              wrapperStyle={{
                width: '100%',
                height: '100%',
                cursor: enablePan ? 'grab' : 'default',
              }}
              contentStyle={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                p={8}
                sx={{
                  // Améliorer l'expérience tactile
                  touchAction: 'none',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                }}
              >
                {children}
              </Box>
            </TransformComponent>

            {/* 💡 Aide visuelle (Mobile uniquement) */}
            {isTouchScreen && (
              <Box
                position="absolute"
                bottom={4}
                left="50%"
                transform="translateX(-50%)"
                bg={controlsBg}
                px={4}
                py={2}
                borderRadius="full"
                boxShadow="md"
                border="1px solid"
                borderColor={controlsBorder}
                fontSize="xs"
                color="gray.600"
                opacity={0.8}
              >
                {t('tree.touchHelp', '👆 1 doigt = déplacer | 🤏 2 doigts = zoomer | 👆👆 double-tap = recentrer')}
              </Box>
            )}
          </>
        )}
      </TransformWrapper>
    </Box>
  );
};

export default ResponsiveTreeWrapper;
