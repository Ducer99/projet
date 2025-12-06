# 🌿 Guide de Migration vers la Palette Émotionnelle

## Vision UX Complète

Transformer l'application **Family Tree** en une expérience chaleureuse, familiale et intemporelle en appliquant la palette émotionnelle sage green, beige, ivory, lavender.

---

## 🎨 Palette Émotionnelle

### Couleurs Principales

| Nom | Valeur | Usage | Émotion |
|-----|--------|-------|---------|
| **Sage Green** | `#A3B18A` | Boutons principaux, accents nature | Nature, Famille, Croissance |
| **Beige** | `#EDE8E3` | Fonds de cartes, hover states | Chaleur humaine, Douceur |
| **Ivory** | `#FFFFF0` | Fonds légers, sections pures | Pureté, Élégance, Clarté |
| **Lavender** | `#B6A6D8` | Sections souvenirs, spiritualité | Douceur, Mémoire, Spiritualité |
| **Brown** | `#3A5A40` | Texte important, ancrage | Stabilité, Ancrage familial |
| **Gray** | `#DAD7CD` | Bordures, texte secondaire | Lisibilité, Équilibre |
| **Accent** | `#6C63FF` | CTAs importantes, notifications | Confiance, Modernité |

---

## 📋 Plan de Migration par Page

### ✅ Phase 1 : Dashboard (FAIT)

**Status** : Redesign complet avec gradients et animations ✅

**Prochaine étape** : Appliquer la palette émotionnelle

**Changements à faire** :

```tsx
// AVANT (gradients dynamiques famille)
background={getFamilyGradient(user?.familyID || 1)}

// APRÈS (palette émotionnelle)
background="var(--gradient-sage)" // Pour header principal
background="var(--gradient-beige)" // Pour cartes chaleureuses
background="var(--gradient-lavender)" // Pour sections souvenirs
```

**Exemple concret - Header Dashboard** :

```tsx
// Header actuel avec gradient famille
<MotionBox
  background={getFamilyGradient(user?.familyID || 1)}
  borderRadius="var(--radius-2xl)"
  boxShadow="var(--shadow-xl)"
>

// Nouveau header émotionnel
<MotionBox
  background="var(--gradient-sage)"
  borderRadius="var(--radius-2xl)"
  boxShadow="var(--card-emotional-shadow)"
>
  <Heading color="var(--text-on-sage)">
    👋 Bonjour, {user?.firstName} !
  </Heading>
  <Text color="var(--text-on-sage)" opacity={0.9}>
    Voici les actualités de votre famille
  </Text>
</MotionBox>
```

**Statistiques avec palette émotionnelle** :

```tsx
// Cartes statistiques
<Card 
  variant="elevated" 
  bg="var(--emotional-beige-light)"
  borderTopColor="var(--emotional-sage)"
>
  <VStack>
    <Text fontSize="var(--text-display-lg)" color="var(--emotional-sage-dark)">
      {stats.membersCount}
    </Text>
    <Text fontSize="var(--text-xs)" color="var(--text-emotional-secondary)">
      {t('dashboard.members')}
    </Text>
  </VStack>
</Card>
```

---

### 🎯 Phase 2 : Members Page (PRIORITÉ HAUTE)

**Objectif** : Liste élégante avec statut "Vivant/Vivante" et bouton "+ Ajouter"

**Design** :

```tsx
// Header de la page
<Box bg="var(--emotional-bg-primary)" minH="100vh">
  <Container maxW="1200px" py={8}>
    
    {/* En-tête avec fond beige doux */}
    <MotionBox
      variants={slideUp}
      background="var(--gradient-beige)"
      borderRadius="var(--radius-2xl)"
      p={8}
      mb={8}
    >
      <HStack justify="space-between" align="center">
        <VStack align="start" spacing={2}>
          <Heading 
            fontFamily="var(--font-secondary)" 
            fontWeight="var(--font-bold)"
            color="var(--text-emotional-primary)"
          >
            👨‍👩‍👧 Membres de la Famille {familyName}
          </Heading>
          <Text color="var(--text-emotional-secondary)">
            {members.length} membre{members.length > 1 ? 's' : ''} 
            {' '}·{' '}
            {aliveCount} vivant{aliveCount > 1 ? 's' : ''}
          </Text>
        </VStack>
        
        {/* Bouton "Ajouter un membre" avec vert sauge */}
        <Button
          size="lg"
          background="var(--gradient-sage)"
          color="white"
          fontWeight="var(--font-semibold)"
          borderRadius="var(--radius-xl)"
          leftIcon={<Icon as={FaUserPlus} />}
          _hover={{
            background: "var(--emotional-sage-dark)",
            transform: "translateY(-2px)",
            boxShadow: "var(--card-emotional-shadow-hover)"
          }}
          onClick={() => navigate('/members/new')}
        >
          Ajouter un membre
        </Button>
      </HStack>
    </MotionBox>
    
    {/* Liste des membres avec hover beige */}
    <Card variant="elevated" padding="none">
      <Table>
        <Thead bg="var(--emotional-beige-light)">
          <Tr>
            <Th>Photo</Th>
            <Th>Nom</Th>
            <Th>Activité</Th>
            <Th>Statut</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {members.map(member => (
            <Tr 
              key={member.id}
              className="hover-beige"
              cursor="pointer"
              transition="all 0.2s ease"
            >
              <Td>
                <Avatar
                  src={member.photoUrl}
                  name={member.fullName}
                  size="md"
                  gender={member.sex}
                  showBorder
                />
              </Td>
              <Td>
                <VStack align="start" spacing={0}>
                  <Text fontWeight="var(--font-semibold)" color="var(--text-emotional-primary)">
                    {member.fullName}
                  </Text>
                  <Text fontSize="var(--text-xs)" color="var(--text-emotional-tertiary)">
                    {member.age} ans
                  </Text>
                </VStack>
              </Td>
              <Td>
                <Text color="var(--text-emotional-secondary)">
                  {member.activity || '—'}
                </Text>
              </Td>
              <Td>
                {/* Badge statut avec palette émotionnelle */}
                <Badge
                  bg={member.alive ? 'var(--status-alive-bg)' : 'var(--status-deceased-bg)'}
                  color={member.alive ? 'var(--status-alive-text)' : 'var(--status-deceased-text)'}
                  borderRadius="var(--radius-lg)"
                  px={3}
                  py={1}
                  fontSize="var(--text-xs)"
                  fontWeight="var(--font-medium)"
                  border="1px solid"
                  borderColor={member.alive ? 'var(--status-alive-border)' : 'var(--status-deceased-border)'}
                >
                  <HStack spacing={1}>
                    <Box
                      w={2}
                      h={2}
                      borderRadius="full"
                      bg={member.alive ? 'var(--status-alive-dot)' : 'var(--status-deceased-dot)'}
                    />
                    <Text>
                      {member.alive 
                        ? (member.sex === 'F' ? 'Vivante' : 'Vivant')
                        : (member.sex === 'F' ? 'Décédée' : 'Décédé')
                      }
                    </Text>
                  </HStack>
                </Badge>
              </Td>
              <Td>
                <HStack spacing={2}>
                  {/* Bouton "Voir" beige doux */}
                  <Button
                    size="sm"
                    bg="var(--emotional-beige)"
                    color="var(--text-emotional-primary)"
                    borderRadius="var(--radius-md)"
                    _hover={{ bg: 'var(--emotional-beige-dark)' }}
                    onClick={() => navigate(`/person/${member.id}`)}
                  >
                    Voir
                  </Button>
                  
                  {/* Bouton "Modifier" sage doux */}
                  <Button
                    size="sm"
                    bg="var(--emotional-sage-light)"
                    color="var(--text-on-sage)"
                    borderRadius="var(--radius-md)"
                    _hover={{ bg: 'var(--emotional-sage)' }}
                    onClick={() => navigate(`/members/edit/${member.id}`)}
                  >
                    Modifier
                  </Button>
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Card>
    
  </Container>
</Box>
```

---

### 👤 Phase 3 : Person Profile (PRIORITÉ HAUTE)

**Design** :

```tsx
// En-tête avec avatar circulaire et fond dégradé beige → ivoire
<MotionBox
  variants={slideUp}
  background="var(--gradient-ivory)"
  borderRadius="var(--radius-2xl)"
  p={8}
  textAlign="center"
  position="relative"
>
  {/* Avatar circulaire grand */}
  <Avatar
    src={person.photoUrl}
    name={person.fullName}
    size="2xl"
    gender={person.sex}
    status={person.alive ? 'alive' : 'deceased'}
    showBorder
    borderWidth="4px"
    borderColor="white"
    boxShadow="var(--card-emotional-shadow-hover)"
    mx="auto"
    mb={4}
  />
  
  <Heading 
    fontFamily="var(--font-secondary)" 
    fontWeight="var(--font-bold)"
    color="var(--text-emotional-primary)"
    fontSize="var(--text-display-lg)"
  >
    {person.fullName}
  </Heading>
  
  <Text 
    fontSize="var(--text-h3)"
    color="var(--text-emotional-secondary)"
    mt={2}
  >
    {person.age} ans
  </Text>
  
  {/* Badge "Votre profil personnel" lavande */}
  {isOwnProfile && (
    <Badge
      bg="var(--emotional-lavender-bg)"
      color="var(--text-on-lavender)"
      px={4}
      py={2}
      borderRadius="var(--radius-xl)"
      mt={4}
      fontSize="var(--text-sm)"
    >
      💜 Votre profil personnel
    </Badge>
  )}
</MotionBox>

{/* Sections en cards arrondies */}
<Grid templateColumns="repeat(2, 1fr)" gap={6} mt={8}>
  
  {/* Informations de base */}
  <Card variant="elevated" padding="lg" bg="var(--card-emotional-bg)">
    <Heading size="sm" color="var(--emotional-sage-dark)" mb={4}>
      📋 Informations de base
    </Heading>
    <VStack align="start" spacing={3}>
      <HStack>
        <Text fontWeight="var(--font-medium)" color="var(--text-emotional-secondary)">
          Nom :
        </Text>
        <Text color="var(--text-emotional-primary)">{person.fullName}</Text>
      </HStack>
      <HStack>
        <Text fontWeight="var(--font-medium)" color="var(--text-emotional-secondary)">
          Sexe :
        </Text>
        <Badge variant={person.sex === 'M' ? 'gender-male' : 'gender-female'}>
          {person.sex === 'M' ? '👨 Homme' : '👩 Femme'}
        </Badge>
      </HStack>
      <HStack>
        <Text fontWeight="var(--font-medium)" color="var(--text-emotional-secondary)">
          Naissance :
        </Text>
        <Text color="var(--text-emotional-primary)">
          {formatDate(person.birthday)}
        </Text>
      </HStack>
    </VStack>
  </Card>
  
  {/* Activité / Profession */}
  <Card variant="elevated" padding="lg" bg="var(--card-emotional-bg)">
    <Heading size="sm" color="var(--emotional-sage-dark)" mb={4}>
      💼 Activité / Profession
    </Heading>
    <Text color="var(--text-emotional-primary)">
      {person.activity || 'Non renseignée'}
    </Text>
  </Card>
  
  {/* Localisation */}
  <Card variant="elevated" padding="lg" bg="var(--card-emotional-bg)">
    <Heading size="sm" color="var(--emotional-sage-dark)" mb={4}>
      📍 Localisation
    </Heading>
    <VStack align="start" spacing={2}>
      <HStack>
        <Text fontWeight="var(--font-medium)" color="var(--text-emotional-secondary)">
          Pays :
        </Text>
        <Text color="var(--text-emotional-primary)">{person.country}</Text>
      </HStack>
      <HStack>
        <Text fontWeight="var(--font-medium)" color="var(--text-emotional-secondary)">
          Ville :
        </Text>
        <Text color="var(--text-emotional-primary)">{person.city}</Text>
      </HStack>
    </VStack>
  </Card>
  
  {/* Chronologie personnelle */}
  <Card variant="elevated" padding="lg" bg="var(--card-emotional-bg)">
    <Heading size="sm" color="var(--emotional-sage-dark)" mb={4}>
      ⏱️ Chronologie
    </Heading>
    <VStack align="start" spacing={3}>
      <HStack>
        <Box w={2} h={2} borderRadius="full" bg="var(--event-birth-border)" />
        <Text fontSize="var(--text-sm)" color="var(--text-emotional-primary)">
          Naissance : {formatDate(person.birthday)}
        </Text>
      </HStack>
      {person.weddingDate && (
        <HStack>
          <Box w={2} h={2} borderRadius="full" bg="var(--event-marriage-border)" />
          <Text fontSize="var(--text-sm)" color="var(--text-emotional-primary)">
            Mariage : {formatDate(person.weddingDate)}
          </Text>
        </HStack>
      )}
      {person.children?.length > 0 && (
        <HStack>
          <Box w={2} h={2} borderRadius="full" bg="var(--emotional-sage)" />
          <Text fontSize="var(--text-sm)" color="var(--text-emotional-primary)">
            {person.children.length} enfant{person.children.length > 1 ? 's' : ''}
          </Text>
        </HStack>
      )}
    </VStack>
  </Card>
  
</Grid>

{/* Souvenirs et anecdotes (lavande) */}
<Card 
  variant="elevated" 
  padding="xl" 
  bg="var(--emotional-lavender-bg)"
  mt={8}
>
  <Heading 
    size="md" 
    color="var(--text-on-lavender)" 
    mb={4}
    fontFamily="var(--font-secondary)"
  >
    💭 Souvenirs et anecdotes
  </Heading>
  <Textarea
    bg="white"
    borderColor="var(--emotional-lavender)"
    borderRadius="var(--radius-lg)"
    p={4}
    minH="200px"
    placeholder="Partagez vos souvenirs, anecdotes ou moments précieux avec cette personne..."
    _focus={{
      borderColor: 'var(--emotional-lavender-dark)',
      boxShadow: '0 0 0 1px var(--emotional-lavender-dark)'
    }}
  />
</Card>
```

---

### 🌳 Phase 4 : Family Tree View (PRIORITÉ MOYENNE)

**Changements** :

```tsx
// Barre d'outils flottante avec fond beige
<MotionBox
  position="fixed"
  top={4}
  left="50%"
  transform="translateX(-50%)"
  zIndex={10}
  background="var(--gradient-beige-warm)"
  borderRadius="var(--radius-2xl)"
  p={3}
  boxShadow="var(--card-emotional-shadow-hover)"
  backdropFilter="blur(10px)"
>
  <HStack spacing={3}>
    {/* Recherche */}
    <Input
      placeholder="🔍 Rechercher..."
      bg="white"
      borderColor="var(--emotional-beige-dark)"
      borderRadius="var(--radius-lg)"
      _focus={{ borderColor: 'var(--emotional-sage)' }}
    />
    
    {/* Boutons actions */}
    <Button
      bg="var(--emotional-sage)"
      color="white"
      borderRadius="var(--radius-lg)"
      _hover={{ bg: 'var(--emotional-sage-dark)' }}
    >
      🌳 Ma branche uniquement
    </Button>
    
    <IconButton
      icon={<Icon as={FaSync} />}
      bg="var(--emotional-beige)"
      borderRadius="var(--radius-lg)"
      _hover={{ bg: 'var(--emotional-beige-dark)' }}
      aria-label="Rafraîchir"
    />
  </HStack>
</MotionBox>

// Nœuds (cartes membres) avec couleurs génération
<MotionBox
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  bg={generation === 1 ? 'var(--gradient-sage-soft)' : 
      generation === 2 ? 'var(--gradient-lavender-soft)' :
      'var(--gradient-beige)'}
  borderRadius="var(--radius-xl)"
  p={4}
  boxShadow="var(--card-emotional-shadow)"
  cursor="pointer"
>
  <Avatar
    src={member.photoUrl}
    name={member.fullName}
    size="lg"
    gender={member.sex}
    status={member.alive ? 'alive' : 'deceased'}
    showBorder
  />
  <Text 
    mt={2}
    fontWeight="var(--font-semibold)"
    color="var(--text-emotional-primary)"
    textAlign="center"
  >
    {member.fullName}
  </Text>
</MotionBox>

// Lignes de connexion avec couleur sage douce
<path
  d={connectionPath}
  stroke="var(--emotional-sage-light)"
  strokeWidth={2}
  fill="none"
  strokeLinecap="round"
/>
```

---

### 📅 Phase 5 : Events Calendar (PRIORITÉ BASSE)

**Design** :

```tsx
// En-tête du calendrier
<MotionBox
  variants={slideUp}
  background="var(--gradient-ivory)"
  borderRadius="var(--radius-2xl)"
  p={6}
  mb={6}
>
  <HStack justify="space-between">
    <HStack spacing={3}>
      <IconButton
        icon={<Icon as={FaChevronLeft} />}
        bg="var(--emotional-beige)"
        borderRadius="var(--radius-lg)"
        _hover={{ bg: 'var(--emotional-beige-dark)' }}
        onClick={() => previousMonth()}
        aria-label="Mois précédent"
      />
      <Heading 
        size="md" 
        color="var(--text-emotional-primary)"
        fontFamily="var(--font-secondary)"
      >
        {currentMonth} {currentYear}
      </Heading>
      <IconButton
        icon={<Icon as={FaChevronRight} />}
        bg="var(--emotional-beige)"
        borderRadius="var(--radius-lg)"
        _hover={{ bg: 'var(--emotional-beige-dark)' }}
        onClick={() => nextMonth()}
        aria-label="Mois suivant"
      />
    </HStack>
    
    {/* Légende événements */}
    <HStack spacing={4}>
      <HStack>
        <Box w={3} h={3} borderRadius="full" bg="var(--event-birth-border)" />
        <Text fontSize="var(--text-xs)">Naissance</Text>
      </HStack>
      <HStack>
        <Box w={3} h={3} borderRadius="full" bg="var(--event-marriage-border)" />
        <Text fontSize="var(--text-xs)">Mariage</Text>
      </HStack>
      <HStack>
        <Box w={3} h={3} borderRadius="full" bg="var(--event-death-border)" />
        <Text fontSize="var(--text-xs)">Décès</Text>
      </HStack>
      <HStack>
        <Box w={3} h={3} borderRadius="full" bg="var(--event-anniversary-border)" />
        <Text fontSize="var(--text-xs)">Anniversaire</Text>
      </HStack>
    </HStack>
  </HStack>
</MotionBox>

// Grille du calendrier
<Grid templateColumns="repeat(7, 1fr)" gap={2}>
  {/* En-têtes jours */}
  {daysOfWeek.map(day => (
    <Box 
      key={day}
      bg="var(--emotional-beige-light)"
      borderRadius="var(--radius-md)"
      p={2}
      textAlign="center"
    >
      <Text 
        fontSize="var(--text-xs)" 
        fontWeight="var(--font-semibold)"
        color="var(--text-emotional-secondary)"
      >
        {day}
      </Text>
    </Box>
  ))}
  
  {/* Cases du calendrier */}
  {daysInMonth.map(day => (
    <MotionBox
      key={day.date}
      whileHover={{ scale: 1.02 }}
      bg={day.hasEvents ? 'white' : 'var(--emotional-bg-primary)'}
      borderRadius="var(--radius-lg)"
      p={3}
      minH="100px"
      border="1px solid"
      borderColor={day.isToday ? 'var(--emotional-sage)' : 'var(--emotional-gray-light)'}
      cursor={day.hasEvents ? 'pointer' : 'default'}
    >
      <Text 
        fontSize="var(--text-sm)"
        fontWeight={day.isToday ? 'var(--font-bold)' : 'var(--font-normal)'}
        color={day.isToday ? 'var(--emotional-sage-dark)' : 'var(--text-emotional-primary)'}
        mb={2}
      >
        {day.dayNumber}
      </Text>
      
      {/* Événements du jour */}
      <VStack align="start" spacing={1}>
        {day.events.map(event => (
          <HStack
            key={event.id}
            bg={
              event.type === 'birth' ? 'var(--event-birth-bg)' :
              event.type === 'marriage' ? 'var(--event-marriage-bg)' :
              event.type === 'death' ? 'var(--event-death-bg)' :
              'var(--event-anniversary-bg)'
            }
            borderRadius="var(--radius-sm)"
            px={2}
            py={1}
            spacing={1}
            width="full"
          >
            <Text fontSize="10px">
              {event.type === 'birth' ? '🎂' :
               event.type === 'marriage' ? '💍' :
               event.type === 'death' ? '🕊️' :
               '🎉'}
            </Text>
            <Text 
              fontSize="10px" 
              color="var(--text-emotional-primary)"
              noOfLines={1}
            >
              {event.title}
            </Text>
          </HStack>
        ))}
      </VStack>
    </MotionBox>
  ))}
</Grid>
```

---

## 📱 Responsive Design

### Barre de Navigation Mobile

```tsx
// Barre d'onglets inférieure (mobile)
<Box
  position="fixed"
  bottom={0}
  left={0}
  right={0}
  bg="var(--nav-emotional-bg)"
  borderTop="1px solid"
  borderColor="var(--emotional-gray-light)"
  backdropFilter="blur(10px)"
  zIndex={100}
  display={{ base: 'block', md: 'none' }}
>
  <HStack justify="space-around" p={2}>
    {navItems.map(item => (
      <VStack
        key={item.path}
        spacing={1}
        p={2}
        borderRadius="var(--radius-lg)"
        bg={isActive(item.path) ? 'var(--nav-emotional-active)' : 'transparent'}
        color={isActive(item.path) ? 'var(--nav-emotional-text-active)' : 'var(--nav-emotional-text)'}
        cursor="pointer"
        onClick={() => navigate(item.path)}
        transition="all 0.2s ease"
      >
        <Icon as={item.icon} boxSize={5} />
        <Text fontSize="10px" fontWeight="var(--font-medium)">
          {item.label}
        </Text>
      </VStack>
    ))}
  </HStack>
</Box>
```

---

## ✅ Checklist de Migration

### Étape 1 : Dashboard
- [ ] Remplacer gradient header par `var(--gradient-sage)`
- [ ] Cartes stats avec fond `var(--emotional-beige-light)`
- [ ] Badges statut avec `--status-alive-*` / `--status-deceased-*`
- [ ] Boutons principaux avec `var(--btn-primary-bg)`

### Étape 2 : Members Page
- [ ] Header avec `var(--gradient-beige)`
- [ ] Bouton "+ Ajouter" avec `var(--gradient-sage)`
- [ ] Tableau avec hover `.hover-beige`
- [ ] Badges statut "Vivant/Vivante" émotionnels
- [ ] Boutons actions beige + sage

### Étape 3 : Person Profile
- [ ] Header avec `var(--gradient-ivory)`
- [ ] Avatar grand circulaire
- [ ] Cards info avec fond `var(--card-emotional-bg)`
- [ ] Section souvenirs avec `var(--emotional-lavender-bg)`

### Étape 4 : Family Tree
- [ ] Barre d'outils avec `var(--gradient-beige-warm)`
- [ ] Nœuds avec gradients génération (sage, lavender, beige)
- [ ] Lignes connexion avec `var(--emotional-sage-light)`

### Étape 5 : Events Calendar
- [ ] Header avec `var(--gradient-ivory)`
- [ ] Cases calendrier avec bordures émotionnelles
- [ ] Événements avec couleurs sémantiques (`--event-*`)
- [ ] Légende avec pastilles colorées

### Étape 6 : Navigation
- [ ] Barre navigation desktop avec `var(--nav-emotional-bg)`
- [ ] Barre onglets mobile avec fond blur
- [ ] États actifs avec `var(--nav-emotional-active)`

---

## 🎯 Résultat Attendu

### Avant
- Interface technique, "tableur"
- Couleurs hardcodées orange
- Pas de cohérence visuelle
- Statuts textuels simples

### Après
- Interface chaleureuse, familiale
- Palette émotionnelle cohérente
- Design intemporel et élégant
- Statuts visuels avec pastilles et bordures douces
- Typography harmonieuse
- Espacements respirants
- Animations fluides
- 100% responsive

---

## 💡 Prochaines Étapes

1. **Valider la palette** avec un test visuel sur le Dashboard
2. **Migrer Members Page** (priorité haute)
3. **Migrer Person Profile** (priorité haute)
4. **Tester responsive** sur mobile/tablette
5. **Migrer Family Tree** et **Events Calendar**
6. **Créer guide de style** final avec screenshots

---

## 🌟 Philosophie

> "Less, but better" — Dieter Rams

Chaque couleur a un **sens** et une **émotion**.  
Chaque interaction est **douce** et **fluide**.  
L'interface n'est pas un obstacle, c'est une **invitation** à explorer sa famille.

🌿 **Nature** (Sage Green) · 🏠 **Chaleur** (Beige) · ✨ **Pureté** (Ivory) · 💜 **Mémoire** (Lavender)
