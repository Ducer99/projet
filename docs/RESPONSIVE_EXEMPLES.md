# 🚀 Guide d'Utilisation Responsive - Exemples Pratiques

Ce guide montre comment utiliser les composants et hooks responsive dans votre application Family Tree.

---

## 📦 Import des Composants

```tsx
// Composants responsive
import ResponsiveContainer from '../components/ResponsiveContainer';
import ResponsiveGrid from '../components/ResponsiveGrid';
import ResponsiveStack from '../components/ResponsiveStack';

// Hooks responsive
import {
  useDevice,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useResponsiveColumns,
  useResponsiveSpacing,
  useResponsivePadding,
  RESPONSIVE_PROPS
} from '../hooks/useResponsive';
```

---

## 1. 📱 Exemple: Dashboard Responsive

```tsx
import { Box, Heading, Text } from '@chakra-ui/react';
import ResponsiveContainer from '../components/ResponsiveContainer';
import ResponsiveGrid from '../components/ResponsiveGrid';
import { useIsMobile } from '../hooks/useResponsive';

const Dashboard = () => {
  const isMobile = useIsMobile();

  return (
    <ResponsiveContainer size="lg">
      <Heading 
        fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
        mb={{ base: 4, md: 6 }}
      >
        {isMobile ? '👋 Tableau de bord' : '👋 Bienvenue sur votre tableau de bord'}
      </Heading>

      {/* Grille de statistiques - 1 colonne sur mobile, 2 sur tablette, 4 sur desktop */}
      <ResponsiveGrid preset="1-2-4" mb={8}>
        <StatCard icon="👥" label="Membres" value="42" />
        <StatCard icon="📸" label="Photos" value="128" />
        <StatCard icon="📅" label="Événements" value="15" />
        <StatCard icon="💑" label="Mariages" value="8" />
      </ResponsiveGrid>

      {/* Section événements */}
      <Box mb={8}>
        <Heading size="lg" mb={4}>Événements à venir</Heading>
        <ResponsiveGrid preset="1-2-3">
          <EventCard />
          <EventCard />
          <EventCard />
        </ResponsiveGrid>
      </Box>
    </ResponsiveContainer>
  );
};
```

---

## 2. 🗂️ Exemple: Liste de Membres

```tsx
import { Box, Avatar, Text, Badge } from '@chakra-ui/react';
import ResponsiveGrid from '../components/ResponsiveGrid';
import ResponsiveStack from '../components/ResponsiveStack';

const MembersList = ({ members }) => {
  return (
    <ResponsiveGrid 
      preset="1-2-3" 
      spacingType="normal"
    >
      {members.map(member => (
        <Box
          key={member.id}
          p={{ base: 4, md: 6 }}
          bg="white"
          borderRadius={{ base: 'md', md: 'lg' }}
          boxShadow={{ base: 'sm', md: 'md' }}
          _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)' }}
          transition="all 0.2s"
        >
          {/* Stack vertical sur mobile, horizontal sur desktop */}
          <ResponsiveStack behavior="vertical-horizontal" align="center">
            <Avatar
              src={member.photoUrl}
              name={member.name}
              size={{ base: 'lg', md: 'xl' }}
            />
            <Box flex="1" textAlign={{ base: 'center', md: 'left' }}>
              <Text fontWeight="bold" fontSize={{ base: 'md', md: 'lg' }}>
                {member.name}
              </Text>
              <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.600">
                {member.role}
              </Text>
              <Badge colorScheme={member.isActive ? 'green' : 'gray'} mt={2}>
                {member.isActive ? 'Actif' : 'Inactif'}
              </Badge>
            </Box>
          </ResponsiveStack>
        </Box>
      ))}
    </ResponsiveGrid>
  );
};
```

---

## 3. 📝 Exemple: Formulaire Responsive

```tsx
import { FormControl, FormLabel, Input, Button } from '@chakra-ui/react';
import ResponsiveContainer from '../components/ResponsiveContainer';
import ResponsiveStack from '../components/ResponsiveStack';
import { useResponsiveSpacing } from '../hooks/useResponsive';

const ProfileForm = () => {
  const spacing = useResponsiveSpacing('normal');

  return (
    <ResponsiveContainer size="md">
      <form>
        {/* Champs côte à côte sur desktop, empilés sur mobile */}
        <ResponsiveStack mb={spacing}>
          <FormControl flex="1">
            <FormLabel>Prénom</FormLabel>
            <Input placeholder="Jean" />
          </FormControl>
          <FormControl flex="1">
            <FormLabel>Nom</FormLabel>
            <Input placeholder="Dupont" />
          </FormControl>
        </ResponsiveStack>

        {/* Email sur une ligne */}
        <FormControl mb={spacing}>
          <FormLabel>Email</FormLabel>
          <Input type="email" placeholder="jean@example.com" />
        </FormControl>

        {/* Date et ville côte à côte sur desktop */}
        <ResponsiveStack mb={spacing}>
          <FormControl flex="1">
            <FormLabel>Date de naissance</FormLabel>
            <Input type="date" />
          </FormControl>
          <FormControl flex="1">
            <FormLabel>Ville</FormLabel>
            <Input placeholder="Paris" />
          </FormControl>
        </ResponsiveStack>

        {/* Bouton pleine largeur sur mobile */}
        <Button
          colorScheme="purple"
          width={{ base: '100%', md: 'auto' }}
          size={{ base: 'lg', md: 'md' }}
        >
          Enregistrer
        </Button>
      </form>
    </ResponsiveContainer>
  );
};
```

---

## 4. 🌳 Exemple: Arbre Généalogique Responsive

```tsx
import { Box, Button, IconButton } from '@chakra-ui/react';
import { FaExpand, FaCompress } from 'react-icons/fa';
import { useIsMobile, useIsDesktop } from '../hooks/useResponsive';

const FamilyTree = () => {
  const isMobile = useIsMobile();
  const isDesktop = useIsDesktop();

  return (
    <Box>
      {/* Contrôles différents selon l'appareil */}
      <Box mb={4}>
        {isMobile ? (
          // Sur mobile: boutons icônes compacts
          <ResponsiveStack behavior="horizontal-vertical" spacingType="tight">
            <IconButton icon={<FaExpand />} aria-label="Agrandir" size="sm" />
            <IconButton icon={<FaCompress />} aria-label="Réduire" size="sm" />
          </ResponsiveStack>
        ) : (
          // Sur desktop: boutons avec texte
          <ResponsiveStack>
            <Button leftIcon={<FaExpand />} size="md">Agrandir</Button>
            <Button leftIcon={<FaCompress />} size="md">Réduire</Button>
          </ResponsiveStack>
        )}
      </Box>

      {/* Zone de l'arbre */}
      <Box
        width="100%"
        height={isDesktop ? '600px' : isMobile ? '400px' : '500px'}
        bg="gray.50"
        borderRadius={{ base: 'md', md: 'lg' }}
        overflow="auto"
        position="relative"
      >
        {/* Contenu de l'arbre */}
      </Box>
    </Box>
  );
};
```

---

## 5. 🎴 Exemple: Galerie Photos Responsive

```tsx
import { Box, Image, AspectRatio } from '@chakra-ui/react';
import ResponsiveGrid from '../components/ResponsiveGrid';
import { useDevice } from '../hooks/useResponsive';

const PhotoGallery = ({ photos }) => {
  const device = useDevice();

  // Nombre de photos à afficher selon l'appareil
  const photosToShow = device === 'mobile' ? 6 : device === 'tablet' ? 12 : 20;

  return (
    <ResponsiveGrid 
      mobileColumns={2}
      tabletColumns={3}
      desktopColumns={4}
      spacingType="normal"
    >
      {photos.slice(0, photosToShow).map(photo => (
        <Box
          key={photo.id}
          position="relative"
          cursor="pointer"
          borderRadius={{ base: 'md', md: 'lg' }}
          overflow="hidden"
          _hover={{
            transform: 'scale(1.05)',
            boxShadow: 'xl'
          }}
          transition="all 0.2s"
        >
          <AspectRatio ratio={1}>
            <Image
              src={photo.url}
              alt={photo.caption}
              objectFit="cover"
            />
          </AspectRatio>
        </Box>
      ))}
    </ResponsiveGrid>
  );
};
```

---

## 6. 📊 Exemple: Sondages Responsive

```tsx
import { Box, Text, Progress, Button } from '@chakra-ui/react';
import ResponsiveContainer from '../components/ResponsiveContainer';
import ResponsiveStack from '../components/ResponsiveStack';
import { useResponsivePadding } from '../hooks/useResponsive';

const PollCard = ({ poll }) => {
  const padding = useResponsivePadding('normal');

  return (
    <ResponsiveContainer size="md">
      <Box
        bg="white"
        p={padding}
        borderRadius={{ base: 'lg', md: 'xl' }}
        boxShadow={{ base: 'md', md: 'lg' }}
      >
        {/* Question */}
        <Text 
          fontSize={{ base: 'lg', md: 'xl' }}
          fontWeight="bold"
          mb={4}
        >
          {poll.question}
        </Text>

        {/* Options */}
        <Box mb={6}>
          {poll.options.map(option => (
            <Box key={option.id} mb={4}>
              <ResponsiveStack 
                behavior="vertical-horizontal" 
                justify="space-between"
                align="center"
                mb={2}
              >
                <Text fontSize={{ base: 'sm', md: 'md' }}>
                  {option.text}
                </Text>
                <Text 
                  fontSize={{ base: 'xs', md: 'sm' }}
                  color="gray.600"
                  fontWeight="bold"
                >
                  {option.votes} votes
                </Text>
              </ResponsiveStack>
              <Progress 
                value={option.percentage} 
                colorScheme="purple"
                size={{ base: 'sm', md: 'md' }}
                borderRadius="full"
              />
            </Box>
          ))}
        </Box>

        {/* Bouton de vote */}
        <Button
          colorScheme="purple"
          width={{ base: '100%', md: 'auto' }}
          size={{ base: 'md', md: 'lg' }}
        >
          Voter
        </Button>
      </Box>
    </ResponsiveContainer>
  );
};
```

---

## 7. 📅 Exemple: Événements Responsive

```tsx
import { Box, Text, Badge, Icon } from '@chakra-ui/react';
import { FaCalendar, FaMapMarkerAlt } from 'react-icons/fa';
import ResponsiveGrid from '../components/ResponsiveGrid';
import ResponsiveStack from '../components/ResponsiveStack';
import { RESPONSIVE_PROPS } from '../hooks/useResponsive';

const EventCard = ({ event }) => {
  return (
    <Box
      bg="white"
      p={RESPONSIVE_PROPS.PADDING_MEDIUM}
      borderRadius={RESPONSIVE_PROPS.BORDER_RADIUS}
      boxShadow={RESPONSIVE_PROPS.BOX_SHADOW}
    >
      {/* En-tête */}
      <ResponsiveStack 
        behavior="vertical-horizontal"
        justify="space-between"
        align="flex-start"
        mb={4}
      >
        <Box flex="1">
          <Text 
            fontSize={{ base: 'md', md: 'lg' }}
            fontWeight="bold"
            mb={1}
          >
            {event.title}
          </Text>
          <Badge colorScheme={event.typeColor} fontSize={{ base: 'xs', md: 'sm' }}>
            {event.type}
          </Badge>
        </Box>
      </ResponsiveStack>

      {/* Détails */}
      <Box>
        <ResponsiveStack 
          behavior="always-vertical" 
          spacingType="tight"
          fontSize={{ base: 'sm', md: 'md' }}
          color="gray.600"
        >
          <ResponsiveStack behavior="always-horizontal" align="center">
            <Icon as={FaCalendar} boxSize={RESPONSIVE_PROPS.ICON_SIZE} />
            <Text>{event.date}</Text>
          </ResponsiveStack>
          <ResponsiveStack behavior="always-horizontal" align="center">
            <Icon as={FaMapMarkerAlt} boxSize={RESPONSIVE_PROPS.ICON_SIZE} />
            <Text>{event.location}</Text>
          </ResponsiveStack>
        </ResponsiveStack>
      </Box>
    </Box>
  );
};

const EventsList = ({ events }) => {
  return (
    <ResponsiveGrid preset="1-2-3">
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </ResponsiveGrid>
  );
};
```

---

## 8. 🔔 Exemple: Navigation Responsive

```tsx
import { Box, IconButton, Drawer, DrawerContent, DrawerOverlay } from '@chakra-ui/react';
import { FaBars } from 'react-icons/fa';
import { useIsMobile } from '../hooks/useResponsive';
import { useState } from 'react';

const Navigation = () => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isMobile ? (
        // Navigation mobile avec drawer
        <>
          <IconButton
            icon={<FaBars />}
            aria-label="Menu"
            onClick={() => setIsOpen(true)}
          />
          <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} placement="left">
            <DrawerOverlay />
            <DrawerContent>
              <MobileMenu onClose={() => setIsOpen(false)} />
            </DrawerContent>
          </Drawer>
        </>
      ) : (
        // Navigation desktop horizontale
        <ResponsiveStack behavior="always-horizontal" spacing={6}>
          <NavLink to="/dashboard">Tableau de bord</NavLink>
          <NavLink to="/family-tree">Arbre</NavLink>
          <NavLink to="/events">Événements</NavLink>
          <NavLink to="/photos">Photos</NavLink>
        </ResponsiveStack>
      )}
    </>
  );
};
```

---

## 9. 🎯 Exemple: Modal Responsive

```tsx
import { Modal, ModalOverlay, ModalContent, ModalBody } from '@chakra-ui/react';
import { useIsMobile } from '../hooks/useResponsive';

const ResponsiveModal = ({ isOpen, onClose, children }) => {
  const isMobile = useIsMobile();

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size={isMobile ? 'full' : 'lg'}
      scrollBehavior={isMobile ? 'inside' : 'outside'}
    >
      <ModalOverlay />
      <ModalContent
        mx={isMobile ? 0 : 4}
        my={isMobile ? 0 : 8}
        borderRadius={isMobile ? 0 : 'lg'}
      >
        <ModalBody p={{ base: 4, md: 6 }}>
          {children}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
```

---

## 10. 📐 Exemple: Layout avec Sidebar

```tsx
import { Flex, Box } from '@chakra-ui/react';
import { useIsMobile } from '../hooks/useResponsive';

const LayoutWithSidebar = ({ children }) => {
  const isMobile = useIsMobile();

  return (
    <Flex 
      direction={{ base: 'column', lg: 'row' }}
      minH="100vh"
    >
      {/* Sidebar */}
      <Box
        width={{ base: '100%', lg: '250px' }}
        bg="gray.100"
        p={{ base: 4, md: 6 }}
        position={isMobile ? 'static' : 'sticky'}
        top={isMobile ? 'auto' : 0}
        height={isMobile ? 'auto' : '100vh'}
        overflowY={isMobile ? 'visible' : 'auto'}
      >
        <Sidebar />
      </Box>

      {/* Main Content */}
      <Box 
        flex="1" 
        p={{ base: 4, md: 6, lg: 8 }}
      >
        {children}
      </Box>
    </Flex>
  );
};
```

---

## ✅ Résumé des Bonnes Pratiques

1. **Utilisez ResponsiveContainer** pour wrapper vos pages
2. **Utilisez ResponsiveGrid** pour les listes d'éléments
3. **Utilisez ResponsiveStack** pour les boutons et formulaires
4. **Utilisez les hooks** (useIsMobile, useDevice) pour la logique conditionnelle
5. **Utilisez RESPONSIVE_PROPS** pour des valeurs cohérentes
6. **Testez sur différentes tailles** d'écran
7. **Privilégiez mobile-first** dans votre conception

---

## 🔗 Fichiers Liés

- `/docs/RESPONSIVE_DESIGN_GUIDE.md` - Guide théorique complet
- `/frontend/src/hooks/useResponsive.ts` - Hooks responsive
- `/frontend/src/components/ResponsiveContainer.tsx` - Container responsive
- `/frontend/src/components/ResponsiveGrid.tsx` - Grid responsive
- `/frontend/src/components/ResponsiveStack.tsx` - Stack responsive
