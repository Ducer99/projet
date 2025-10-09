// Visualisation de l'Arbre Généalogique - Design interactif moderne
import React, { useRef, useState } from 'react';
import { Box, VStack, HStack, IconButton, Text } from '@chakra-ui/react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { FaSearchPlus, FaSearchMinus, FaExpand, FaCompress } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import FamilyMemberCard from '../components/FamilyMemberCard';

const MotionBox = motion(Box);

interface TreeNode {
  person: any;
  x: number;
  y: number;
  level: number;
  children: TreeNode[];
  spouse?: any;
}

interface FamilyTreeVisualizationProps {
  familyData: any[];
  onPersonClick?: (person: any) => void;
}

const FamilyTreeVisualization: React.FC<FamilyTreeVisualizationProps> = ({
  familyData,
  onPersonClick
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Couleurs par génération (dégradé chaleureux)
  const generationColors = [
    '#FF6B6B', // Rouge chaleureux
    '#4ECDC4', // Turquoise
    '#45B7D1', // Bleu ciel
    '#FFA07A', // Orange saumon
    '#98D8C8', // Vert menthe
    '#F7DC6F', // Jaune doré
  ];

  // Algorithme de positionnement de l'arbre (Walker's algorithm simplifié)
  const buildTree = (data: any[]): TreeNode[] => {
    // Construction simplifiée - à adapter selon vos données
    const nodes: TreeNode[] = [];
    const levelHeight = 200;
    const nodeWidth = 220;

    data.forEach((person, index) => {
      nodes.push({
        person,
        x: index * nodeWidth,
        y: person.generation ? person.generation * levelHeight : 0,
        level: person.generation || 0,
        children: [],
        spouse: person.spouse
      });
    });

    return nodes;
  };

  const treeNodes = buildTree(familyData);

  // Dessiner les connexions SVG
  const renderConnections = () => {
    return (
      <svg
        ref={svgRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <defs>
          {/* Dégradés pour les lignes */}
          <linearGradient id="parentGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#D4D4D4', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#A3A3A3', stopOpacity: 0.5 }} />
          </linearGradient>
          
          <linearGradient id="marriageGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#FF6B9D', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#FFB6C1', stopOpacity: 1 }} />
          </linearGradient>
        </defs>

        {treeNodes.map((node, idx) => {
          const connections = [];

          // Ligne parent-enfant
          if (node.children.length > 0) {
            node.children.forEach(child => {
              connections.push(
                <motion.path
                  key={`parent-${idx}-${child.person.personID}`}
                  d={`M ${node.x + 100} ${node.y + 140} 
                      C ${node.x + 100} ${node.y + 170}, 
                        ${child.x + 100} ${child.y - 30}, 
                        ${child.x + 100} ${child.y}`}
                  stroke="url(#parentGrad)"
                  strokeWidth="2"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                />
              );
            });
          }

          // Ligne de mariage
          if (node.spouse) {
            connections.push(
              <motion.line
                key={`marriage-${idx}`}
                x1={node.x + 200}
                y1={node.y + 70}
                x2={node.x + 220}
                y2={node.y + 70}
                stroke="url(#marriageGrad)"
                strokeWidth="3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5 }}
              />
            );
          }

          return connections;
        })}
      </svg>
    );
  };

  return (
    <Box
      position={isFullscreen ? 'fixed' : 'relative'}
      top={isFullscreen ? 0 : 'auto'}
      left={isFullscreen ? 0 : 'auto'}
      right={isFullscreen ? 0 : 'auto'}
      bottom={isFullscreen ? 0 : 'auto'}
      zIndex={isFullscreen ? 9999 : 'auto'}
      bg="neutral.50"
      borderRadius={isFullscreen ? 'none' : 'xl'}
      overflow="hidden"
      boxShadow={isFullscreen ? 'none' : 'xl'}
    >
      {/* Barre d'outils */}
      <Box
        position="absolute"
        top={4}
        right={4}
        zIndex={100}
        bg="white"
        borderRadius="xl"
        boxShadow="lg"
        p={2}
      >
        <HStack spacing={2}>
          <TransformWrapper>
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <IconButton
                  aria-label="Zoom in"
                  icon={<FaSearchPlus />}
                  onClick={() => zoomIn()}
                  size="sm"
                  variant="ghost"
                  borderRadius="lg"
                />
                <IconButton
                  aria-label="Zoom out"
                  icon={<FaSearchMinus />}
                  onClick={() => zoomOut()}
                  size="sm"
                  variant="ghost"
                  borderRadius="lg"
                />
                <IconButton
                  aria-label="Reset"
                  icon={<FaExpand />}
                  onClick={() => resetTransform()}
                  size="sm"
                  variant="ghost"
                  borderRadius="lg"
                />
              </>
            )}
          </TransformWrapper>
          <IconButton
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            icon={isFullscreen ? <FaCompress /> : <FaExpand />}
            onClick={() => setIsFullscreen(!isFullscreen)}
            size="sm"
            variant="ghost"
            borderRadius="lg"
          />
        </HStack>
      </Box>

      {/* Légende des couleurs par génération */}
      <Box
        position="absolute"
        top={4}
        left={4}
        zIndex={100}
        bg="white"
        borderRadius="xl"
        boxShadow="lg"
        p={3}
      >
        <Text fontSize="xs" fontWeight="600" color="neutral.700" mb={2}>
          Générations
        </Text>
        <VStack spacing={1} align="stretch">
          {generationColors.slice(0, 4).map((color, idx) => (
            <HStack key={idx} spacing={2}>
              <Box w={3} h={3} borderRadius="sm" bg={color} />
              <Text fontSize="xs" color="neutral.600">
                {idx === 0 ? 'Actuelle' : `- ${idx}`}
              </Text>
            </HStack>
          ))}
        </VStack>
      </Box>

      {/* Zone de visualisation avec zoom/pan */}
      <TransformWrapper
        initialScale={1}
        minScale={0.3}
        maxScale={3}
        centerOnInit
        wheel={{ step: 0.1 }}
        panning={{ velocityDisabled: true }}
      >
        {() => (
          <TransformComponent
            wrapperStyle={{
              width: '100%',
              height: isFullscreen ? '100vh' : '600px',
            }}
          >
            <Box
              position="relative"
              minW="2000px"
              minH="1500px"
              p={8}
            >
              {/* Grille de fond subtile */}
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                backgroundImage="radial-gradient(circle, #E5E7EB 1px, transparent 1px)"
                backgroundSize="30px 30px"
                opacity={0.3}
                zIndex={0}
              />

              {/* Connexions SVG */}
              {renderConnections()}

              {/* Nœuds (membres de la famille) */}
              <AnimatePresence>
                {treeNodes.map((node, index) => (
                  <MotionBox
                    key={node.person.personID}
                    position="absolute"
                    left={`${node.x}px`}
                    top={`${node.y}px`}
                    initial={{ opacity: 0, scale: 0.8, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.05,
                      type: 'spring',
                      stiffness: 200,
                    }}
                  >
                    <FamilyMemberCard
                      person={node.person}
                      familyColor={generationColors[node.level % generationColors.length]}
                      onClick={() => {
                        onPersonClick?.(node.person);
                      }}
                      variant="tree"
                    />

                    {/* Conjoint à côté */}
                    {node.spouse && (
                      <MotionBox
                        position="absolute"
                        left="220px"
                        top={0}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 + 0.2 }}
                      >
                        <FamilyMemberCard
                          person={node.spouse}
                          familyColor={generationColors[node.level % generationColors.length]}
                          onClick={() => onPersonClick?.(node.spouse)}
                          variant="tree"
                        />
                      </MotionBox>
                    )}
                  </MotionBox>
                ))}
              </AnimatePresence>
            </Box>
          </TransformComponent>
        )}
      </TransformWrapper>

      {/* Indicateur de navigation */}
      <Box
        position="absolute"
        bottom={4}
        left="50%"
        transform="translateX(-50%)"
        bg="white"
        borderRadius="full"
        boxShadow="lg"
        px={4}
        py={2}
      >
        <HStack spacing={2}>
          <Box w={2} h={2} borderRadius="full" bg="brand.500" />
          <Text fontSize="xs" color="neutral.600" fontWeight="500">
            Glissez pour naviguer • Molette pour zoomer
          </Text>
        </HStack>
      </Box>
    </Box>
  );
};

export default FamilyTreeVisualization;
