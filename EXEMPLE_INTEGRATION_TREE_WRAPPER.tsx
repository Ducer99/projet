/**
 * 📱 EXEMPLE D'INTÉGRATION - ResponsiveTreeWrapper dans FamilyTreeEnhanced
 * 
 * Ce fichier montre comment intégrer le wrapper tactile dans l'arbre existant.
 * 
 * ÉTAPES:
 * 1. Copier ce code dans FamilyTreeEnhanced.tsx
 * 2. Ajuster selon vos besoins
 * 3. Tester sur mobile et desktop
 */

import React from 'react';
import { Container, VStack, HStack, Button, Input, Box } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';
import ResponsiveTreeWrapper from '../components/ResponsiveTreeWrapper';

const FamilyTreeEnhancedExample = () => {
  const { t } = useTranslation();
  
  // ... Vos états existants (persons, focusPerson, etc.)
  
  return (
    <Container maxW="8xl" py={6}>
      <VStack spacing={6}>
        
        {/* ====== HEADER - RESTE EN DEHORS DU WRAPPER ====== */}
        <HStack w="full" justify="space-between" wrap="wrap" spacing={4}>
          {/* Navigation history */}
          <HStack spacing={2}>
            <Button>← Précédent</Button>
            <Button>Suivant →</Button>
          </HStack>
          
          {/* Search bar */}
          <HStack spacing={4}>
            <HStack>
              <SearchIcon />
              <Input
                placeholder={t('familyTree.searchPerson')}
                size="sm"
                maxW="250px"
              />
            </HStack>
            
            <Button size="sm">Afficher frères/sœurs</Button>
            <Button size="sm">Statistiques</Button>
          </HStack>
        </HStack>
        
        {/* Stats summary */}
        <HStack w="full" justify="center" spacing={6}>
          <Box>👥 Total: {stats.totalPersons}</Box>
          <Box>💍 Mariages: {stats.totalMarriages}</Box>
          <Box>📈 Générations: {stats.generations}</Box>
        </HStack>
        
        {/* ====== ARBRE - WRAPPÉ POUR LE SUPPORT TACTILE ====== */}
        <ResponsiveTreeWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={2.5}
          height="75vh"
        >
          {/* 
            🎯 TOUT LE CONTENU DE L'ARBRE VA ICI
            - Parents
            - Personne focus
            - Conjoints
            - Enfants
            - Frères/sœurs (si activé)
          */}
          <Box w="full" position="relative">
            
            {/* Parents row */}
            {(father || mother) && (
              <HStack justify="center" spacing={8} mb={6}>
                <VStack>
                  {father && renderPersonCard(father, false, t('familyTree.father'))}
                  {mother && renderPersonCard(mother, false, t('familyTree.mother'))}
                </VStack>
              </HStack>
            )}
            
            {/* Focus person (center) */}
            <Box display="flex" justifyContent="center" mb={6}>
              {focusPerson && renderPersonCard(focusPerson, true, t('familyTree.you'))}
            </Box>
            
            {/* Spouses */}
            {spouses.length > 0 && (
              <HStack justify="center" spacing={6} mb={6}>
                {spouses.map(spouse => renderPersonCard(spouse, false, t('familyTree.spouse')))}
              </HStack>
            )}
            
            {/* Children */}
            {children.length > 0 && (
              <VStack spacing={4}>
                <Text fontSize="sm" color="gray.500">
                  <ChevronDownIcon /> {t('familyTree.children')}
                </Text>
                <HStack spacing={6} wrap="wrap" justify="center">
                  {children.map(child => renderPersonCard(child, false, t('familyTree.child')))}
                </HStack>
              </VStack>
            )}
            
            {/* Siblings (if enabled) */}
            {showSiblings && siblings.length > 0 && (
              <HStack justify="center" spacing={6} mt={6}>
                {siblings.map(sibling => renderPersonCard(sibling, false, t('familyTree.sibling')))}
              </HStack>
            )}
            
          </Box>
        </ResponsiveTreeWrapper>
        
        {/* ====== MODALS - RESTENT EN DEHORS DU WRAPPER ====== */}
        {/* Union details modal */}
        {/* Stats modal */}
        {/* etc. */}
        
      </VStack>
    </Container>
  );
};

export default FamilyTreeEnhancedExample;

/**
 * 📝 NOTES D'INTÉGRATION:
 * 
 * 1. Le wrapper ajoute automatiquement:
 *    - Contrôles de zoom (+/- et reset) en haut à droite
 *    - Aide tactile en bas (sur mobile uniquement)
 *    - Support pan/pinch/molette
 * 
 * 2. Gardez EN DEHORS du wrapper:
 *    - Header avec navigation
 *    - Barre de recherche
 *    - Boutons d'action
 *    - Modals
 *    - Stats summary
 * 
 * 3. Mettez DANS le wrapper:
 *    - UNIQUEMENT le contenu visuel de l'arbre
 *    - Cards des personnes
 *    - Lignes de connexion (si vous en avez)
 * 
 * 4. Tests à faire:
 *    - Desktop: Zoom à la molette fonctionne
 *    - Mobile: Pan (1 doigt) fonctionne
 *    - Mobile: Pinch-to-zoom (2 doigts) fonctionne
 *    - Boutons +/- cliquables
 *    - Double-tap recentre la vue
 */
