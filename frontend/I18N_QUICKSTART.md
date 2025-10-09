# ⚡ i18n Quick Start - 5 Minutes

## 🎯 Objectif
Ajouter le support multilingue (FR/EN) dans n'importe quel composant React en **5 minutes**.

## ✅ Prérequis (déjà fait)
- ✅ Packages installés (i18next, react-i18next)
- ✅ Configuration i18n créée
- ✅ Traductions FR/EN complètes
- ✅ Composant LanguageSwitcher prêt

## 🚀 3 étapes pour rendre un composant multilingue

### Étape 1 : Import (10 secondes)
```tsx
import { useTranslation } from 'react-i18next';
```

### Étape 2 : Hook (10 secondes)
```tsx
const { t } = useTranslation();
```

### Étape 3 : Remplacer les textes (4 minutes)
```tsx
// AVANT
<Heading>Tableau de bord</Heading>

// APRÈS
<Heading>{t('dashboard.title')}</Heading>
```

## 📖 Exemple complet (Dashboard)

```tsx
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

function Dashboard() {
  const { t } = useTranslation(); // ⚡ 1 ligne
  
  return (
    <Container>
      {/* Header avec sélecteur */}
      <HStack justify="space-between">
        <Heading>{t('dashboard.title')}</Heading>
        <LanguageSwitcher />
      </HStack>
      
      {/* Contenu traduit */}
      <Text>{t('dashboard.subtitle')}</Text>
      <Button>{t('members.addMember')}</Button>
      
      {/* Avec variables */}
      <Text>{t('validation.minLength', { count: 8 })}</Text>
      
      {/* Avec pluralisation */}
      <Text>{t('pluralization.members', { count: 5 })}</Text>
    </Container>
  );
}
```

## 🔑 Clés les plus utilisées

### Common
- `t('common.welcome')` - Bienvenue / Welcome
- `t('common.save')` - Enregistrer / Save
- `t('common.cancel')` - Annuler / Cancel
- `t('common.back')` - Retour / Back

### Dashboard
- `t('dashboard.title')` - Tableau de bord / Dashboard
- `t('dashboard.subtitle')` - Une famille... / One family...

### Members
- `t('members.title')` - Membres de la Famille / Family Members
- `t('members.addMember')` - Ajouter un membre / Add member

### Events
- `t('events.title')` - Calendrier des Événements / Events Calendar
- `t('events.addEvent')` - Ajouter un événement / Add event

## 🌍 Ajouter le sélecteur de langue

```tsx
import LanguageSwitcher from '../components/LanguageSwitcher';

// Dans votre Header/Navbar
<HStack>
  <Logo />
  <Nav />
  <LanguageSwitcher /> {/* ⚡ C'est tout ! */}
</HStack>
```

## 💡 Astuces

### Pluralisation automatique
```tsx
// Auto : 1 membre / 5 membres
{t('pluralization.members', { count: members.length })}
```

### Variables dynamiques
```tsx
// Résultat : "Minimum 8 caractères"
{t('validation.minLength', { count: 8 })}
```

### Langue actuelle
```tsx
const { i18n } = useTranslation();
console.log(i18n.language); // 'fr' ou 'en'
```

### Changer de langue
```tsx
const { i18n } = useTranslation();
i18n.changeLanguage('en'); // Instantané
```

## 📋 Checklist rapide

- [ ] Import `useTranslation`
- [ ] Appel du hook `const { t } = useTranslation()`
- [ ] Remplacer tous les textes en dur par `{t('key')}`
- [ ] Vérifier que les clés existent dans `fr.json` et `en.json`
- [ ] Ajouter `<LanguageSwitcher />` dans le header
- [ ] Tester en FR
- [ ] Tester en EN

## 🎯 Résultat

**AVANT** :
```tsx
<Heading>Tableau de bord</Heading>
```

**APRÈS** :
- 🇫🇷 Français : "Tableau de bord"
- 🇬🇧 English : "Dashboard"

---

**C'est tout !** Votre composant est maintenant multilingue en **5 minutes**. ⚡
