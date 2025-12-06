# Dashboard - Refonte 3 Colonnes - Plan d'Implémentation

## 🎯 Objectif
Réorganiser le Dashboard en 3 colonnes équilibrées avec fusion des statistiques et des actualités.

## 📐 Structure Finale

```
┌─────────────────┬─────────────────┬─────────────────┐
│   COLONNE 1     │   COLONNE 2     │   COLONNE 3     │
│   NAVIGATION    │   STATISTIQUES  │   ACTUALITÉS    │
│                 │   (FUSIONNÉES)  │   (FUSIONNÉES)  │
├─────────────────┼─────────────────┼─────────────────┤
│ Actions Princ.  │ Statistiques    │ Actualités &    │
│                 │ Globales        │ Événements      │
│ • Arbre         │                 │                 │
│ • Membres       │ • Membres: 7    │ Section 1:      │
│ • Événements    │ • Générations:3 │ 🎉 Anniversaires│
│ • Mariages      │ • Photos: 12    │ (90 jours)      │
│ • Sondages      │ • Événements: 5 │                 │
│                 │                 │ Section 2:      │
│                 │ Répartition H/F │ 💍 Mariages     │
│                 │ 👨 4 hommes     │ récents         │
│                 │ 👩 3 femmes     │                 │
│                 │                 │                 │
│                 │ Âge moyen: XX   │                 │
└─────────────────┴─────────────────┴─────────────────┘
```

## ✅ Modifications à Effectuer

### 1. Structure Grid (Ligne ~380)
**AVANT:**
```tsx
<Grid 
  templateColumns={{ base: '1fr', lg: '2fr 1fr' }} 
  gap={6}
>
```

**APRÈS:**
```tsx
<Grid 
  templateColumns={{ base: '1fr', lg: 'repeat(3, 1fr)' }} 
  gap={6}
>
```

### 2. Colonne 1 - Navigation (NETTOYER)
**Action:** Supprimer la carte "Tableau de Bord de Gestion" (lignes ~511-557)
**Raison:** Redondante avec le lien "Membres"

**Garder uniquement:**
- 🚀 Arbre Dynamique
- 👥 Membres
- 📅 Événements
- 💍 Mariages
- 🗳️ Sondages

### 3. Colonne 2 - FUSION des Statistiques
**Action:** Fusionner toutes les statistiques en UNE SEULE CARTE

**Contenu de la carte fusionnée:**
```tsx
<Card title="📊 Statistiques Globales">
  {/* Grid 2x2 pour les compteurs principaux */}
  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
    <StatBox value={stats.membersCount} label="Membres" />
    <StatBox value={stats.generationsCount} label="Générations" />
    <StatBox value={stats.photosCount} label="Photos" />
    <StatBox value={stats.eventsCount} label="Événements" />
  </Grid>
  
  {/* Répartition H/F */}
  <HStack>
    <Icon FaMale /> {maleCount} hommes
    <Icon FaFemale /> {femaleCount} femmes
  </HStack>
  
  {/* Âge moyen calculé */}
  <Text>Âge moyen : {averageAge} ans</Text>
</Card>
```

### 4. Colonne 3 - FUSION des Actualités
**Action:** Fusionner "Prochains événements" ET "Mariages de la famille" en UNE SEULE CARTE

**Structure:**
```tsx
<Card title="📰 Actualités et Événements">
  {/* Section 1: Anniversaires à venir */}
  <VStack>
    <Heading size="xs">🎉 Prochains anniversaires (90 jours)</Heading>
    {upcomingEvents.map(...)}
    <Button>Voir tous les événements</Button>
  </VStack>
  
  {/* Séparateur visuel */}
  <Divider my={4} />
  
  {/* Section 2: Mariages récents */}
  <VStack>
    <Heading size="xs">💍 Mariages de la famille</Heading>
    {marriages.map(...)}
    <Button>Voir tous les mariages</Button>
  </VStack>
</Card>
```

## 🔧 Code Exact à Remplacer

### Modification 1: Grid Template (Ligne ~380)
```tsx
// AVANT
<Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>

// APRÈS
<Grid templateColumns={{ base: '1fr', lg: 'repeat(3, 1fr)' }} gap={6}>
```

### Modification 2: Suppression "Tableau de Bord de Gestion" (Lignes ~511-557)
**SUPPRIMER ce bloc complet:**
```tsx
{/* 🆕 NOUVEAU - Tableau de Bord de Gestion */}
<Link to="/members-dashboard" style={{ textDecoration: 'none' }}>
  <MotionBox ... >
    ... TOUT LE CONTENU ...
  </MotionBox>
</Link>
```

### Modification 3: Colonne 2 - Carte Statistiques Unifiée
**REMPLACER les lignes ~560-690 (Aperçu famille + Répartition sexe)**

PAR une seule carte:

```tsx
{/* COLONNE 2 : STATISTIQUES FUSIONNÉES */}
<GridItem>
  <Card
    variant="elevated"
    padding="lg"
    hover
    borderTopColor={getFamilyGradient(user?.familyID || 1)}
    animate
  >
    <Heading 
      size="sm" 
      color="var(--text-primary)" 
      mb={5}
      fontFamily="var(--font-secondary)"
    >
      📊 {t('dashboard.statistics')}
    </Heading>
    
    {loadingStats ? (
      <Text fontSize="sm" color="var(--text-secondary)" textAlign="center" py={4}>
        {t('dashboard.loadingStats')}
      </Text>
    ) : stats ? (
      <VStack spacing={6} align="stretch">
        {/* Compteurs principaux - Grid 2x2 */}
        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          <VStack spacing={1}>
            <Text 
              fontSize="3xl" 
              fontWeight="bold" 
              color={getFamilySolidColor(user?.familyID || 1)}
            >
              {stats.membersCount}
            </Text>
            <Text fontSize="xs" color="gray.600" textAlign="center">
              {t('dashboard.member', { count: stats.membersCount })}
            </Text>
          </VStack>

          <VStack spacing={1}>
            <Text 
              fontSize="3xl" 
              fontWeight="bold" 
              color={getFamilySolidColor(user?.familyID || 1)}
            >
              {stats.generationsCount}
            </Text>
            <Text fontSize="xs" color="gray.600" textAlign="center">
              {t('dashboard.generation', { count: stats.generationsCount })}
            </Text>
          </VStack>

          <VStack spacing={1}>
            <Text 
              fontSize="3xl" 
              fontWeight="bold" 
              color={getFamilySolidColor(user?.familyID || 1)}
            >
              {stats.photosCount}
            </Text>
            <Text fontSize="xs" color="gray.600" textAlign="center">
              📸 {t('dashboard.photos')}
            </Text>
          </VStack>

          <VStack spacing={1}>
            <Text 
              fontSize="3xl" 
              fontWeight="bold" 
              color={getFamilySolidColor(user?.familyID || 1)}
            >
              {stats.eventsCount}
            </Text>
            <Text fontSize="xs" color="gray.600" textAlign="center">
              {t('dashboard.events')}
            </Text>
          </VStack>
        </Grid>

        {/* Séparateur */}
        <Box height="1px" bg="gray.200" />

        {/* Répartition par sexe */}
        <VStack spacing={3}>
          <Text fontSize="sm" fontWeight="semibold" color="gray.700">
            👥 {t('dashboard.genderDistribution')}
          </Text>
          <HStack spacing={6} justify="center">
            <HStack spacing={2}>
              <Icon as={FaMale} color="blue.500" boxSize={5} />
              <Text fontWeight="bold" fontSize="2xl" color="blue.600">
                {members.filter(m => m.sex === 'M').length}
              </Text>
              <Text fontSize="sm" color="gray.600">hommes</Text>
            </HStack>
            <HStack spacing={2}>
              <Icon as={FaFemale} color="pink.500" boxSize={5} />
              <Text fontWeight="bold" fontSize="2xl" color="pink.600">
                {members.filter(m => m.sex === 'F').length}
              </Text>
              <Text fontSize="sm" color="gray.600">femmes</Text>
            </HStack>
          </HStack>
        </VStack>

        {/* Âge moyen */}
        {members.filter(m => m.birthday && m.alive).length > 0 && (
          <>
            <Box height="1px" bg="gray.200" />
            <VStack spacing={2}>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                📊 Âge moyen
              </Text>
              <Text fontWeight="bold" fontSize="2xl" color={getFamilySolidColor(user?.familyID || 1)}>
                {Math.round(
                  members
                    .filter(m => m.birthday && m.alive)
                    .reduce((acc, m) => {
                      const age = Math.floor((Date.now() - new Date(m.birthday!).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
                      return acc + age;
                    }, 0) / members.filter(m => m.birthday && m.alive).length
                )} ans
              </Text>
            </VStack>
          </>
        )}
      </VStack>
    ) : (
      <Text fontSize="sm" color="var(--text-secondary)" textAlign="center" py={4}>
        {t('dashboard.errorLoadingStats')}
      </Text>
    )}
  </Card>
</GridItem>
```

### Modification 4: Colonne 3 - Actualités Fusionnées
**REMPLACER les lignes ~812-1124 (Membres récents + Événements + Mariages)**

PAR une seule carte unifiée:

```tsx
{/* COLONNE 3 : ACTUALITÉS FUSIONNÉES */}
<GridItem>
  <Card
    variant="elevated"
    padding="lg"
    hover
    borderTopColor="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    animate
  >
    <Heading 
      size="sm" 
      color="var(--text-primary)" 
      mb={5}
      fontFamily="var(--font-secondary)"
    >
      📰 {t('dashboard.newsAndEvents')}
    </Heading>
    
    <VStack spacing={6} align="stretch">
      {/* SECTION 1: Prochains événements (Anniversaires) */}
      <Box>
        <HStack mb={3} justify="space-between">
          <Text fontSize="sm" fontWeight="semibold" color="gray.700">
            🎉 {t('dashboard.upcomingEvents')} (90 jours)
          </Text>
        </HStack>
        
        {loadingEvents ? (
          <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
            {t('common.loading')}
          </Text>
        ) : upcomingEvents.length === 0 ? (
          <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
            {t('dashboard.noEvents')}
          </Text>
        ) : (
          <VStack spacing={3} align="stretch">
            {upcomingEvents.slice(0, 3).map((event) => {
              const eventEmojis: Record<string, string> = {
                birthday: '🎂',
                death: '🕊️',
                marriage: '💍',
                party: '🎉',
                other: '📅'
              };
              const emoji = eventEmojis[event.eventType] || '📅';
              
              return (
                <Box
                  key={event.eventID}
                  p={3}
                  borderRadius="lg"
                  bg="purple.50"
                  border="1px"
                  borderColor="purple.200"
                  cursor="pointer"
                  onClick={() => navigate('/events')}
                  _hover={{ bg: 'purple.100', transform: 'translateY(-2px)' }}
                  transition="all 0.2s"
                >
                  <HStack justify="space-between">
                    <HStack spacing={2} flex={1}>
                      <Text fontSize="lg">{emoji}</Text>
                      <VStack align="start" spacing={0} flex={1}>
                        <Text fontWeight="bold" fontSize="sm">
                          {event.title}
                        </Text>
                        {event.description && (
                          <Text fontSize="xs" color="gray.600" noOfLines={1}>
                            {event.description}
                          </Text>
                        )}
                      </VStack>
                    </HStack>
                    <Badge colorScheme="purple" size="sm">
                      {event.dateLabel}
                    </Badge>
                  </HStack>
                </Box>
              );
            })}
          </VStack>
        )}
        
        <Button 
          mt={3}
          width="full"
          size="sm"
          colorScheme="purple"
          variant="outline"
          onClick={() => navigate('/events')}
        >
          {t('dashboard.viewAllEvents')}
        </Button>
      </Box>

      {/* SÉPARATEUR VISUEL */}
      <Box height="2px" bg="gray.200" borderRadius="full" />

      {/* SECTION 2: Mariages de la famille */}
      <Box>
        <HStack mb={3} justify="space-between">
          <Text fontSize="sm" fontWeight="semibold" color="gray.700">
            💍 {t('dashboard.familyMarriages')}
          </Text>
        </HStack>
        
        {loadingMarriages ? (
          <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
            {t('common.loading')}
          </Text>
        ) : marriages.length === 0 ? (
          <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
            {t('dashboard.noMarriages')}
          </Text>
        ) : (
          <VStack spacing={3} align="stretch">
            {marriages.slice(0, 3).map((marriage) => {
              const statusEmojis: Record<string, string> = {
                active: '💚',
                divorced: '💔',
                widowed: '🕊️'
              };
              const emoji = statusEmojis[marriage.status] || '💍';
              
              return (
                <Box
                  key={marriage.weddingID}
                  p={3}
                  borderRadius="lg"
                  bg="pink.50"
                  border="1px"
                  borderColor="pink.200"
                  _hover={{ bg: 'pink.100' }}
                  transition="all 0.2s"
                >
                  <VStack align="stretch" spacing={2}>
                    <HStack justify="space-between">
                      <HStack spacing={2}>
                        <Icon as={FaHeart} color="pink.500" boxSize={3} />
                        <Text fontWeight="bold" fontSize="sm" noOfLines={1}>
                          {marriage.manName} & {marriage.womanName}
                        </Text>
                      </HStack>
                      <Text fontSize="xs">{emoji}</Text>
                    </HStack>
                    <HStack spacing={2} fontSize="xs" color="gray.600">
                      <Text>📅 {new Date(marriage.weddingDate).toLocaleDateString('fr-FR')}</Text>
                      <Text>•</Text>
                      <Text noOfLines={1}>{marriage.patrilinealFamilyName}</Text>
                    </HStack>
                  </VStack>
                </Box>
              );
            })}
          </VStack>
        )}
        
        {marriages.length > 3 && (
          <Button 
            mt={3}
            width="full"
            size="sm"
            colorScheme="pink"
            variant="outline"
          >
            {t('dashboard.viewAllMarriages')} ({marriages.length})
          </Button>
        )}
      </Box>
    </VStack>
  </Card>
</GridItem>
```

## 🎨 Résultat Attendu

✅ **Colonne 1 (Navigation):** 5 boutons d'action clairs
✅ **Colonne 2 (Statistiques):** TOUTES les stats dans UNE carte (Membres, Générations, Photos, Events, H/F, Âge)
✅ **Colonne 3 (Actualités):** UNE carte avec 2 sections (Événements + Mariages)

## 📝 Clés de Traduction Nécessaires

Vérifier que ces clés existent dans `fr.json` et `en.json`:

```json
{
  "dashboard": {
    "statistics": "Statistiques Globales",
    "newsAndEvents": "Actualités et Événements",
    "genderDistribution": "Répartition par sexe",
    "polls": "Sondages Familiaux",
    "familyPolls": "Consultez l'opinion de la famille"
  }
}
```

## ⏱️ Estimation
- Modification structure Grid: 2 min
- Suppression "Tableau de Bord Gestion": 1 min
- Fusion Statistiques (Colonne 2): 10 min
- Fusion Actualités (Colonne 3): 10 min
- Tests et ajustements: 5 min

**TOTAL: ~30 minutes**

## 🚀 Ordre d'Exécution
1. Modifier structure Grid (3 colonnes égales)
2. Supprimer la carte redondante "Tableau de Bord Gestion"
3. Fusionner statistiques dans Colonne 2
4. Fusionner actualités dans Colonne 3
5. Tester responsive et ajuster espacements
