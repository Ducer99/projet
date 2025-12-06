# 🌍 FAMILY TREE - VERSION MULTILINGUE

## Versions Disponibles

L'application Family Tree est maintenant disponible en **français** et en **anglais** avec toutes les fonctionnalités critiques traduites.

---

## 🇫🇷 VERSION FRANÇAISE (ORIGINALE)

### URL d'accès
```
http://localhost:3001/family-tree
```

### Caractéristiques
- ✅ Interface complète en français
- ✅ Toutes les fonctionnalités UX avancées
- ✅ Bugs critiques corrigés (genre, métriques)
- ✅ Navigation fratrie complète
- ✅ Détection de boucles généalogiques

### Terminologie clé
- **Fratrie** : Section frères et sœurs
- **Focus** : Personne centrale
- **Unions** : Mariages et partenariats
- **Polygames** : Personnes avec plusieurs conjoints

---

## 🇺🇸 VERSION ANGLAISE (NOUVELLE)

### URL d'accès
```
http://localhost:3001/family-tree-en
```

### Caractéristiques
- ✅ Interface complète en anglais
- ✅ Traduction professionnelle de tous les éléments
- ✅ Mêmes fonctionnalités que la version française
- ✅ Métriques et badges traduits

### Terminologie clé
- **Siblings** : Section frères et sœurs
- **Focus** : Personne centrale  
- **Unions** : Mariages et partenariats
- **Polygamous** : Personnes avec plusieurs conjoints

---

## 📋 ÉLÉMENTS TRADUITS

### Navigation
| Français | English |
|----------|---------|
| Précédent | Previous |
| Suivant | Next |
| Rechercher une personne... | Search for a person... |
| Afficher Fratrie | Show Siblings |
| Masquer | Hide |

### Relations Familiales
| Français | English |
|----------|---------|
| Père | Father |
| Mère | Mother |
| Parents | Parents |
| Enfants | Children |
| Conjoint(s) | Spouse(s) |
| Frère/Sœur | Sibling |
| Demi-fratrie | Half-Sibling |

### Statuts et Badges
| Français | English |
|----------|---------|
| HOMME | MALE |
| FEMME | FEMALE |
| DÉCÉDÉ | DECEASED |
| Décédé à X ans | Deceased at X years old |
| FOCUS | FOCUS |
| BOUCLE | LOOP |

### Statistiques
| Français | English |
|----------|---------|
| Personnes | Persons |
| Unions | Unions |
| Polygames | Polygamous |
| Générations | Generations |
| Boucles | Loops |

### Détails d'Union
| Français | English |
|----------|---------|
| Union avec | Union with |
| Mère: | Mother: |
| Date de mariage: | Marriage date: |
| Lieu de mariage: | Marriage place: |
| Statut: | Status: |
| Marié | Married |
| Divorcé | Divorced |

### Messages de Qualité des Données
| Français | English |
|----------|---------|
| Date de naissance inconnue | Birth date unknown |
| Dates incohérentes | Inconsistent dates |
| Âge: Dates incohérentes | Age: Inconsistent dates |
| Chargement des données... | Loading data... |

---

## 🧪 TESTS DE VALIDATION

### Test Version Française
1. Aller sur `http://localhost:3001/family-tree`
2. Vérifier l'interface en français
3. Tester le bouton "Afficher Fratrie"
4. Vérifier les métriques (Polygames: ≥1, Unions: entier)

### Test Version Anglaise  
1. Aller sur `http://localhost:3001/family-tree-en`
2. Vérifier l'interface en anglais
3. Tester le bouton "Show Siblings"
4. Vérifier les métriques (Polygamous: ≥1, Unions: integer)

---

## 🔧 ARCHITECTURE TECHNIQUE

### Structure du Code
```
frontend/src/
├── utils/translations.ts         # Système de traduction
├── pages/FamilyTreeEnhanced.tsx  # Version française
├── pages/FamilyTreeEnglish.tsx   # Version anglaise
└── components/LanguageSwitcher.tsx # Sélecteur de langue
```

### Système de Traduction
```typescript
// Utilisation simple
const text = t('showSiblings', 'en'); // "Show Siblings"
const text = t('showSiblings', 'fr'); // "Afficher Fratrie"
```

### Avantages
- **Séparation claire** des langues
- **Maintenance facile** via translations.ts
- **Performance optimale** (pas de rechargement)
- **Fonctionnalités identiques** dans les deux versions

---

## 🎯 RÉSULTATS ATTENDUS

### Validation Visuelle
- **🎨 Genre** : Cartes bleues ♂ / roses ♀ dans les deux langues
- **📊 Métriques** : Chiffres cohérents (polygames ≥1, unions entières)
- **🚶‍♂️ Navigation** : Fratrie/Siblings fonctionnelle
- **🔍 Recherche** : Auto-focus immédiat

### Validation Linguistique
- **Terminologie précise** dans chaque langue
- **Cohérence** des traductions
- **Expérience utilisateur** identique
- **Messages d'erreur** traduits

---

## 🚀 PRÊT POUR UTILISATION

**Les deux versions sont maintenant opérationnelles !**

- **Français** : http://localhost:3001/family-tree
- **Anglais** : http://localhost:3001/family-tree-en

Choisissez la version selon votre préférence linguistique. Toutes les fonctionnalités avancées sont disponibles dans les deux langues.

---

*Guide multilingue généré - 12 Novembre 2025*
