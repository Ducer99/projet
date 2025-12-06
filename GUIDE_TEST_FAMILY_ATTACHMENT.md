# 🧪 Guide de Test - Page Choix Famille

## 🎯 Page à Tester

**URL Locale** : http://localhost:3000/family-attachment

**URL Tunnel (public)** : https://constantly-telecom-revised-fate.trycloudflare.com/family-attachment

---

## ✅ Checklist Visuelle

### 1. Apparence Initiale (Sans Sélection)

```
Attendu :
┌──────────────────────────────────────────┐
│  🏠  Créer une nouvelle famille          │  Border: 1px gris #E5E7EB
│      Vous serez l'administrateur         │  Background: Blanc
│                                          │  Pas de shadow
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│  👥  Rejoindre une famille existante     │  Border: 1px gris #E5E7EB
│      Utilisez un code d'invitation       │  Background: Blanc
│                                          │  Pas de shadow
└──────────────────────────────────────────┘

Bouton: [Choisir une option] (DÉSACTIVÉ, gris)
```

**✅ À vérifier** :
- [ ] 2 cartes visibles
- [ ] Icônes : Maison (🏠) et Groupe (👥)
- [ ] Texte description en gris
- [ ] Aucun champ de saisie visible
- [ ] Bouton désactivé

---

### 2. Hover sur Carte Non Sélectionnée

**Action** : Passer la souris sur la première carte

```
Attendu :
┌══════════════════════════════════════════┐  ← Carte se soulève
║  🏠  Créer une nouvelle famille          ║  Border: toujours 1px gris
║      Vous serez l'administrateur         ║  Shadow: Apparaît !
╚══════════════════════════════════════════╝  Transform: translateY(-2px)
                                              Transition: 0.2s smooth
```

**✅ À vérifier** :
- [ ] Carte se soulève légèrement
- [ ] Shadow subtile apparaît
- [ ] Animation fluide
- [ ] Cursor = pointer

---

### 3. Sélection "Créer une Famille"

**Action** : Cliquer sur la première carte

```
Attendu :
╔══════════════════════════════════════════╗
║  🏠  Créer une nouvelle famille          ║  Border: 2px violet #7C3AED
║      Vous serez l'administrateur         ║  Background: #F5F3FF (violet pâle)
╚══════════════════════════════════════════╝  Shadow: rgba(124,58,237,0.1)
                                              Icône: Violet #7C3AED
┌──────────────────────────────────────────┐
│  👥  Rejoindre une famille existante     │  (Reste normal)
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ Nom de la famille                        │  ← Champ apparaît
│ [Ex: Famille Dupont___________________]  │
│ Ce nom sera visible par tous les membres │
└──────────────────────────────────────────┘

Bouton: [🏠 Créer la famille] (DÉSACTIVÉ si vide)
```

**✅ À vérifier** :
- [ ] Carte 1 : Border 2px violet
- [ ] Carte 1 : Background violet pâle
- [ ] Carte 1 : Icône violette
- [ ] Carte 1 : Shadow visible
- [ ] Carte 2 : Reste normale (grise)
- [ ] Champ "Nom" apparaît
- [ ] Champ "Code" **N'APPARAÎT PAS**
- [ ] Bouton affiche "Créer la famille" + icône maison
- [ ] Bouton désactivé tant que champ vide

---

### 4. Saisie Nom + Validation

**Action** : Taper "Famille Ducer"

```
Attendu :
┌──────────────────────────────────────────┐
│ Nom de la famille                        │
│ [Famille Ducer_______________________]   │  ← Texte visible
│ Ce nom sera visible par tous les membres │
└──────────────────────────────────────────┘

Bouton: [🏠 Créer la famille] (ACTIVÉ, violet)
```

**✅ À vérifier** :
- [ ] Texte s'affiche normalement
- [ ] Bouton devient actif (violet)
- [ ] Hover sur bouton : se soulève + shadow

---

### 5. Changement pour "Rejoindre"

**Action** : Cliquer sur la deuxième carte

```
Attendu :
┌──────────────────────────────────────────┐
│  🏠  Créer une nouvelle famille          │  (Redevient normale)
└──────────────────────────────────────────┘

╔══════════════════════════════════════════╗
║  👥  Rejoindre une famille existante     ║  Border: 2px violet
║      Utilisez un code d'invitation       ║  Background: Violet pâle
╚══════════════════════════════════════════╝  Shadow visible

┌──────────────────────────────────────────┐
│ Code d'invitation                        │  ← Champ code apparaît
│ [DUPONT2024__________________________]   │  (en MAJUSCULES)
│ Demandez le code à un membre...          │
└──────────────────────────────────────────┘

Bouton: [👥 Rejoindre la famille] (DÉSACTIVÉ si vide)
```

**✅ À vérifier** :
- [ ] Carte 1 : Redevient normale (grise)
- [ ] Carte 2 : Border 2px violet
- [ ] Carte 2 : Background violet pâle
- [ ] Carte 2 : Shadow visible
- [ ] Champ "Nom" **DISPARAÎT**
- [ ] Champ "Code" apparaît
- [ ] Bouton affiche "Rejoindre la famille" + icône groupe
- [ ] Bouton désactivé

---

### 6. Saisie Code en Minuscules

**Action** : Taper "family_1"

```
Attendu :
┌──────────────────────────────────────────┐
│ Code d'invitation                        │
│ [FAMILY_1____________________________]   │  ← Auto-converti en MAJ
│ Demandez le code à un membre...          │
└──────────────────────────────────────────┘

Bouton: [👥 Rejoindre la famille] (ACTIVÉ)
```

**✅ À vérifier** :
- [ ] Texte automatiquement en majuscules
- [ ] Bouton devient actif

---

### 7. Hover sur Bouton Actif

**Action** : Passer souris sur le bouton

```
Attendu :
┌────────────────────────────────────────┐
│ 👥  Rejoindre la famille               │  ← Se soulève
└────────────────────────────────────────┘  Shadow plus prononcée
                                           Transform: translateY(-2px)
```

**✅ À vérifier** :
- [ ] Bouton se soulève
- [ ] Shadow augmente
- [ ] Animation fluide

---

### 8. Soumission Formulaire (Créer)

**Action** : 
1. Sélectionner "Créer"
2. Saisir "Famille Test"
3. Cliquer "Créer la famille"

```
Attendu :
1. Loader pendant requête
2. Toast vert : "Famille 'Famille Test' créée avec succès"
3. Redirection → /dashboard
```

**✅ À vérifier** :
- [ ] Spinner visible pendant loading
- [ ] Toast de succès
- [ ] Redirection automatique
- [ ] Console : `POST /api/families/create` (HTTP 200)

---

### 9. Soumission Formulaire (Rejoindre)

**Action** :
1. Sélectionner "Rejoindre"
2. Saisir "FAMILY_1"
3. Cliquer "Rejoindre la famille"

```
Attendu :
1. Loader pendant requête
2. Toast vert : "Vous avez rejoint la famille 'Famille Dupont'"
3. Redirection → /dashboard
```

**✅ À vérifier** :
- [ ] Spinner visible
- [ ] Toast de succès
- [ ] Redirection automatique
- [ ] Console : `POST /api/families/join` (HTTP 200)

---

## 🔴 Cas d'Erreur à Tester

### Erreur 1 : Code Invalide

**Action** : Rejoindre avec code "INVALID999"

**Attendu** :
- [ ] Toast rouge : "Code d'invitation invalide"
- [ ] Reste sur la page
- [ ] Alert rouge apparaît avec message d'erreur

### Erreur 2 : Déjà dans une Famille

**Action** : Tenter de créer/rejoindre quand déjà membre

**Attendu** :
- [ ] Toast rouge : "Vous appartenez déjà à une famille"
- [ ] Pas de changement

---

## 📱 Responsive Design

### Mobile (< 768px)

**✅ À vérifier** :
- [ ] Cartes s'empilent verticalement
- [ ] Padding reste confortable
- [ ] Texte lisible
- [ ] Bouton pleine largeur
- [ ] Champs input responsive

### Tablet (768px - 1024px)

**✅ À vérifier** :
- [ ] Layout correct
- [ ] Cartes bien espacées

---

## 🎨 Couleurs de Référence

| Élément | Couleur | Code |
|---------|---------|------|
| Border normal | Gris clair | `#E5E7EB` |
| Border sélectionné | Violet primaire | `#7C3AED` |
| Background sélectionné | Violet pâle | `#F5F3FF` |
| Shadow | Violet transparent | `rgba(124, 58, 237, 0.1)` |
| Icône active | Violet | `#7C3AED` |
| Icône inactive | Gris | `gray.500` |
| Texte titre | Gris foncé | `gray.800` |
| Texte description | Gris moyen | `gray.600` |

---

## 🚀 Commandes Rapides

### Ouvrir la page en local
```bash
open http://localhost:3000/family-attachment
```

### Ouvrir la page via tunnel
```bash
open https://constantly-telecom-revised-fate.trycloudflare.com/family-attachment
```

### Vérifier logs backend
```bash
# Voir les requêtes POST
tail -f /Users/ducer/Desktop/projet/backend/bin/Debug/net8.0/logs/api.log
```

### Monitorer appels API
```bash
# Dans DevTools Chrome
Network > XHR > Filtrer "families"
```

---

## ✅ Validation Finale

### Checklist Design
- [ ] Selectable Cards : Border 1px → 2px
- [ ] Background : Blanc → #F5F3FF
- [ ] Shadow : None → rgba(124,58,237,0.1)
- [ ] Icons : Gris → Violet #7C3AED
- [ ] Hover : translateY(-2px) + shadow
- [ ] Transition : 0.2s ease-in-out

### Checklist Logique
- [ ] Un seul champ visible à la fois
- [ ] Bouton texte dynamique
- [ ] Bouton icône dynamique
- [ ] Validation : désactivé si vide
- [ ] Auto-uppercase pour code
- [ ] Trim des valeurs

### Checklist API
- [ ] POST /api/families/create (si Créer)
- [ ] POST /api/families/join (si Rejoindre)
- [ ] Gestion erreurs avec toast
- [ ] Redirection après succès

---

## 🎯 Expérience Utilisateur Cible

**Sentiment** : "C'est intuitif, moderne, et agréable à utiliser. Je sais exactement quoi faire."

**Qualité** : Production-ready, Design System professionnel ✨

---

**Date** : 2024-12-06
**Status** : ✅ PRÊT POUR TESTS
