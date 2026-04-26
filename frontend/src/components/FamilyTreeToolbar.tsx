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
  AttachmentIcon,
} from '@chakra-ui/icons';
import { FaExpand, FaCompress } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
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

  const captureCanvas = async () => {
    if (!treeRef.current) return null;
    return html2canvas(treeRef.current, {
      backgroundColor: '#F7FAFC',
      scale: 2,
      logging: false,
      useCORS: false,
      allowTaint: false,
      // Ignorer les <img> externes (avatars ui-avatars.com) qui bloquent CORS
      // Les cercles colorés avec initiales sont rendus en CSS — pas de perte visuelle
      ignoreElements: (el) => el.tagName === 'IMG',
    });
  };

  const handleExportPNG = async () => {
    try {
      toast({ title: 'Export PNG en cours…', status: 'info', duration: 2000 });
      const canvas = await captureCanvas();
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = `arbre-genealogique-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast({ title: 'Image téléchargée', status: 'success', duration: 3000 });
    } catch {
      toast({ title: t('familyTree.exportError'), status: 'error', duration: 3000 });
    }
  };

  const handleExportPDF = async () => {
    try {
      toast({ title: 'Export PDF en cours…', status: 'info', duration: 2000 });
      const canvas = await captureCanvas();
      if (!canvas) return;

      const imgData = canvas.toDataURL('image/png');
      const imgW = canvas.width;
      const imgH = canvas.height;

      // Format A4 paysage si l'arbre est plus large que haut, portrait sinon
      const landscape = imgW > imgH;
      const pdf = new jsPDF({ orientation: landscape ? 'landscape' : 'portrait', unit: 'px', format: [imgW / 2, imgH / 2] });
      pdf.addImage(imgData, 'PNG', 0, 0, imgW / 2, imgH / 2);
      pdf.save(`arbre-genealogique-${new Date().toISOString().slice(0, 10)}.pdf`);

      toast({ title: 'PDF téléchargé', status: 'success', duration: 3000 });
    } catch {
      toast({ title: t('familyTree.exportError'), status: 'error', duration: 3000 });
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

        {/* Export PNG */}
        <Tooltip label="Exporter en image PNG" placement="top">
          <IconButton
            aria-label="Export PNG"
            icon={<DownloadIcon />}
            size="md"
            colorScheme="green"
            variant="ghost"
            onClick={handleExportPNG}
            _hover={{ bg: 'rgba(72, 187, 120, 0.1)', transform: 'translateY(-2px)' }}
          />
        </Tooltip>

        {/* Export PDF */}
        <Tooltip label="Exporter en PDF" placement="top">
          <IconButton
            aria-label="Export PDF"
            icon={<AttachmentIcon />}
            size="md"
            colorScheme="red"
            variant="ghost"
            onClick={handleExportPDF}
            _hover={{ bg: 'rgba(229, 62, 62, 0.1)', transform: 'translateY(-2px)' }}
          />
        </Tooltip>
      </HStack>
    </Box>
  );
};

export default FamilyTreeToolbar;
