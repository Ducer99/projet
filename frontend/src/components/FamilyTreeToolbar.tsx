import {
  Box,
  HStack,
  IconButton,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import {
  AddIcon,
  MinusIcon,
  DownloadIcon,
} from '@chakra-ui/icons';
import { FaExpand, FaCompress } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import html2canvas from 'html2canvas';
import { useState } from 'react';

interface FamilyTreeToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onExport?: () => void; // Optional car géré en interne
  treeRef: React.RefObject<HTMLDivElement>;
}

const FamilyTreeToolbar = ({ onZoomIn, onZoomOut, treeRef }: FamilyTreeToolbarProps) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleExport = async () => {
    if (!treeRef.current) return;

    try {
      toast({
        title: t('familyTree.exportingImage'),
        status: 'info',
        duration: 2000,
        isClosable: true,
      });

      // Capture du canvas
      const canvas = await html2canvas(treeRef.current, {
        backgroundColor: '#F7FAFC',
        scale: 2, // Haute résolution
        logging: false,
        useCORS: true,
      });

      // Téléchargement
      const link = document.createElement('a');
      link.download = `arbre-genealogique-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast({
        title: t('familyTree.exportSuccess'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: t('familyTree.exportError'),
        description: t('common.unexpectedError'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      position="fixed"
      bottom="20px"
      right="20px"
      zIndex={1000}
      bg="rgba(255, 255, 255, 0.9)"
      backdropFilter="blur(10px)"
      borderRadius="12px"
      border="1px solid"
      borderColor="rgba(139, 92, 246, 0.2)"
      boxShadow="0 4px 12px rgba(139, 92, 246, 0.15)"
      p={2}
    >
      <HStack spacing={2}>
        {/* Zoom In */}
        <Tooltip label={t('familyTree.zoomIn')} placement="top">
          <IconButton
            aria-label="Zoom in"
            icon={<AddIcon />}
            size="md"
            colorScheme="purple"
            variant="ghost"
            onClick={onZoomIn}
            _hover={{
              bg: 'rgba(139, 92, 246, 0.1)',
              transform: 'translateY(-2px)',
            }}
          />
        </Tooltip>

        {/* Zoom Out */}
        <Tooltip label={t('familyTree.zoomOut')} placement="top">
          <IconButton
            aria-label="Zoom out"
            icon={<MinusIcon />}
            size="md"
            colorScheme="purple"
            variant="ghost"
            onClick={onZoomOut}
            _hover={{
              bg: 'rgba(139, 92, 246, 0.1)',
              transform: 'translateY(-2px)',
            }}
          />
        </Tooltip>

        {/* Fullscreen */}
        <Tooltip label={isFullscreen ? t('familyTree.exitFullscreen') : t('familyTree.fullscreen')} placement="top">
          <IconButton
            aria-label="Fullscreen"
            icon={isFullscreen ? <FaCompress /> : <FaExpand />}
            size="md"
            colorScheme="blue"
            variant="ghost"
            onClick={handleFullscreen}
            _hover={{
              bg: 'rgba(99, 102, 241, 0.1)',
              transform: 'translateY(-2px)',
            }}
          />
        </Tooltip>

        {/* Export */}
        <Tooltip label={t('familyTree.exportImage')} placement="top">
          <IconButton
            aria-label="Export image"
            icon={<DownloadIcon />}
            size="md"
            colorScheme="green"
            variant="ghost"
            onClick={handleExport}
            _hover={{
              bg: 'rgba(72, 187, 120, 0.1)',
              transform: 'translateY(-2px)',
            }}
          />
        </Tooltip>
      </HStack>
    </Box>
  );
};

export default FamilyTreeToolbar;
