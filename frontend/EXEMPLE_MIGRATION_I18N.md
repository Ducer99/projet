# 🌍 Exemple de Migration Dashboard avec i18n

## Avant migration (textes en dur en français)

```tsx
import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  
  return (
    <Container maxW="container.xl" py={8}>
      {/* En-tête */}
      <VStack align="start" spacing={2} mb={8}>
        <Heading size="xl" color="purple.700">
          Tableau de bord
        </Heading>
        <Text color="gray.600" fontSize="lg">
          Une famille, une même histoire à travers les générations
        </Text>
      </VStack>

      {/* Statistiques */}
      <Grid templateColumns="repeat(4, 1fr)" gap={4}>
        <VStack>
          <Text fontSize="3xl" fontWeight="bold">{stats.membersCount}</Text>
          <Text fontSize="xs">Membres</Text>
        </VStack>
        <VStack>
          <Text fontSize="3xl" fontWeight="bold">{stats.generationsCount}</Text>
          <Text fontSize="xs">Générations</Text>
        </VStack>
      </Grid>

      {/* Actions */}
      <Button colorScheme="purple" onClick={() => navigate('/add-member')}>
        Ajouter un membre
      </Button>
      <Button onClick={() => navigate('/persons')}>
        Voir tous les membres
      </Button>
      <Button onClick={() => navigate('/events')}>
        Calendrier des événements
      </Button>
      
      {/* Code d'invitation */}
      <Text fontSize="sm" color="gray.600">
        Partagez ce code avec les membres de votre famille pour qu'ils rejoignent l'arbre généalogique.
      </Text>
      <Button onClick={handleRegenerate}>
        Régénérer le code
      </Button>
    </Container>
  );
};
```

## Après migration (multilingue avec i18n)

```tsx
import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // ✨ Import i18n
import LanguageSwitcher from '../components/LanguageSwitcher'; // ✨ Sélecteur de langue

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(); // ✨ Hook de traduction
  
  return (
    <Container maxW="container.xl" py={8}>
      {/* En-tête avec sélecteur de langue */}
      <HStack justify="space-between" mb={8}>
        <VStack align="start" spacing={2}>
          <Heading size="xl" color="purple.700">
            {t('dashboard.title')} {/* ✨ Traduit */}
          </Heading>
          <Text color="gray.600" fontSize="lg">
            {t('dashboard.subtitle')} {/* ✨ Traduit */}
          </Text>
        </VStack>
        <LanguageSwitcher /> {/* ✨ Nouveau composant */}
      </HStack>

      {/* Statistiques avec pluralisation */}
      <Grid templateColumns="repeat(4, 1fr)" gap={4}>
        <VStack>
          <Text fontSize="3xl" fontWeight="bold">{stats.membersCount}</Text>
          <Text fontSize="xs">
            {t('dashboard.member', { count: stats.membersCount })} {/* ✨ Pluralisation */}
          </Text>
        </VStack>
        <VStack>
          <Text fontSize="3xl" fontWeight="bold">{stats.generationsCount}</Text>
          <Text fontSize="xs">
            {t('dashboard.generation', { count: stats.generationsCount })} {/* ✨ Pluralisation */}
          </Text>
        </VStack>
      </Grid>

      {/* Actions traduites */}
      <Button colorScheme="purple" onClick={() => navigate('/add-member')}>
        {t('members.addMember')} {/* ✨ Traduit */}
      </Button>
      <Button onClick={() => navigate('/persons')}>
        {t('dashboard.viewAllMembers')} {/* ✨ Traduit */}
      </Button>
      <Button onClick={() => navigate('/events')}>
        {t('events.title')} {/* ✨ Traduit */}
      </Button>
      
      {/* Code d'invitation traduit */}
      <Text fontSize="sm" color="gray.600">
        {t('dashboard.shareCode')} {/* ✨ Traduit */}
      </Text>
      <Button onClick={handleRegenerate}>
        {t('dashboard.regenerateCode')} {/* ✨ Traduit */}
      </Button>
    </Container>
  );
};

export default Dashboard;
```

## Traductions correspondantes

### fr.json
```json
{
  "dashboard": {
    "title": "Tableau de bord",
    "subtitle": "Une famille, une même histoire à travers les générations",
    "member": "Membre",
    "member_plural": "Membres",
    "generation": "Génération",
    "generation_plural": "Générations",
    "viewAllMembers": "Voir tous les membres",
    "shareCode": "Partagez ce code avec les membres de votre famille pour qu'ils rejoignent l'arbre généalogique.",
    "regenerateCode": "Régénérer le code"
  },
  "members": {
    "addMember": "Ajouter un membre"
  },
  "events": {
    "title": "Calendrier des événements"
  }
}
```

### en.json
```json
{
  "dashboard": {
    "title": "Dashboard",
    "subtitle": "One family, one shared story across generations",
    "member": "Member",
    "member_plural": "Members",
    "generation": "Generation",
    "generation_plural": "Generations",
    "viewAllMembers": "View all members",
    "shareCode": "Share this code with your family members to join the family tree.",
    "regenerateCode": "Regenerate code"
  },
  "members": {
    "addMember": "Add member"
  },
  "events": {
    "title": "Events calendar"
  }
}
```

## Résultat visuel

### En français (🇫🇷)
```
┌─────────────────────────────────────────────────┐
│ Tableau de bord                    🌍 Français  │
│ Une famille, une même histoire à travers les    │
│ générations                                     │
├─────────────────────────────────────────────────┤
│  25            5            120         18      │
│ Membres    Générations    Photos    Événements │
├─────────────────────────────────────────────────┤
│ [Ajouter un membre]                            │
│ [Voir tous les membres]                        │
│ [Calendrier des événements]                    │
├─────────────────────────────────────────────────┤
│ Code d'invitation: ABC123                       │
│ Partagez ce code avec les membres de votre     │
│ famille pour qu'ils rejoignent l'arbre...      │
│ [Régénérer le code]                            │
└─────────────────────────────────────────────────┘
```

### En anglais (🇬🇧)
```
┌─────────────────────────────────────────────────┐
│ Dashboard                           🌍 English  │
│ One family, one shared story across generations│
├─────────────────────────────────────────────────┤
│  25            5            120         18      │
│ Members    Generations     Photos      Events  │
├─────────────────────────────────────────────────┤
│ [Add member]                                   │
│ [View all members]                             │
│ [Events calendar]                              │
├─────────────────────────────────────────────────┤
│ Invite code: ABC123                            │
│ Share this code with your family members to    │
│ join the family tree.                          │
│ [Regenerate code]                              │
└─────────────────────────────────────────────────┘
```

## Changements clés

### 1. Import du hook
```tsx
import { useTranslation } from 'react-i18next';
```

### 2. Utilisation du hook
```tsx
const { t } = useTranslation();
```

### 3. Remplacement des textes
```tsx
// AVANT
<Heading>Tableau de bord</Heading>

// APRÈS
<Heading>{t('dashboard.title')}</Heading>
```

### 4. Pluralisation automatique
```tsx
// AVANT
<Text>{pluralize(count, 'membre')}</Text>

// APRÈS
<Text>{t('dashboard.member', { count })}</Text>
```

### 5. Ajout du sélecteur de langue
```tsx
<LanguageSwitcher />
```

## Avantages

### ✅ Multilingue
- Un seul code, plusieurs langues
- Changement instantané

### ✅ Maintenable
- Toutes les traductions centralisées
- Facile de corriger ou modifier

### ✅ Extensible
- Ajouter une nouvelle langue = 1 fichier JSON

### ✅ Professionnel
- Standards de l'industrie
- Expérience utilisateur améliorée

## Testing

### Test manuel
1. Ouvrir le dashboard
2. Vérifier que tout est en français par défaut
3. Cliquer sur le sélecteur de langue
4. Sélectionner "English"
5. Vérifier que TOUS les textes sont en anglais
6. Rafraîchir la page → La langue doit être conservée
7. Revenir au français
8. Vérifier à nouveau

### Test de pluralisation
1. Si 1 membre : "1 Membre" (FR) / "1 Member" (EN)
2. Si 5 membres : "5 Membres" (FR) / "5 Members" (EN)

## Checklist de migration

- ✅ Import de `useTranslation`
- ✅ Initialisation du hook `const { t } = useTranslation()`
- ✅ Remplacement de tous les textes en dur
- ✅ Ajout des clés dans fr.json et en.json
- ✅ Ajout du composant LanguageSwitcher
- ✅ Test en français
- ✅ Test en anglais
- ✅ Test de la persistance (localStorage)

---

**Migration complétée** ✅  
L'application est maintenant **100% multilingue** !
