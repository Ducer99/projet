# 📊 Les 7 Personnes dans la Base de Données

## Vue d'Ensemble

Votre base de données familiale contient **7 personnes** réparties sur **4 générations** :

---

## 👨‍👩‍👧‍👦 Liste Complète des Personnes

### 🏛️ **Génération 1 - Grands-Parents**

| ID | Prénom | Nom | Sexe | Né(e) le | Âge | Activité | Ville |
|----|--------|-----|------|----------|-----|----------|-------|
| 1 | **Jean** | Dupont | M | 15/05/1950 | 75 ans | Retraité | Paris |
| 2 | **Marie** | Martin | F | 20/08/1952 | 73 ans | Retraitée | Paris |

**Relations** : Jean (1) ❤️ Marie (2)

---

### 👨‍👩 **Génération 2 - Parents**

| ID | Prénom | Nom | Sexe | Né(e) le | Âge | Activité | Ville | Parents |
|----|--------|-----|------|----------|-----|----------|-------|---------|
| 3 | **Pierre** | Dupont | M | 10/03/1975 | 50 ans | Ingénieur | Lyon | Jean & Marie |
| 4 | **Sophie** | Bernard | F | 25/11/1977 | 47 ans | Médecin | Lyon | - |

**Relations** : Pierre (3) 💍 Sophie (4) - Mariés le 15/06/2000 à Lyon

---

### 👧👦 **Génération 3 - Enfants**

| ID | Prénom | Nom | Sexe | Né(e) le | Âge | Activité | Ville | Parents |
|----|--------|-----|------|----------|-----|----------|-------|---------|
| 5 | **Lucas** | Dupont | M | 20/01/2002 | 23 ans | Étudiant | Paris | Pierre & Sophie |
| 6 | **Emma** | Dupont | F | 14/07/2005 | 20 ans | Lycéenne | Paris | Pierre & Sophie |

---

### 💑 **Génération 3.5 - Partenaires**

| ID | Prénom | Nom | Sexe | Né(e) le | Âge | Activité | Ville | Relation |
|----|--------|-----|------|----------|-----|----------|-------|----------|
| 7 | **Sophie** | Martin | F | 20/03/1995 | 30 ans | Designer | Paris | Compagne de Lucas |

**Note** : Il y a 2 Sophie dans la famille (Sophie Bernard et Sophie Martin)

---

### 👶 **Génération 4 - Petits-Enfants**

| ID | Prénom | Nom | Sexe | Né(e) le | Âge | Activité | Ville | Parents |
|----|--------|-----|------|----------|-----|----------|-------|---------|
| 8* | **Tom** | Dupont | M | 15/06/2020 | 5 ans | Étudiant | Paris | Lucas & Sophie M. |

**Note** : Tom (ID=8) peut exister si le script `demo-double-role.sql` a été exécuté.

---

## 🌳 Arbre Généalogique

```
👴 Jean Dupont (1) ❤️ 👵 Marie Martin (2)
                    │
                    │
            👨 Pierre Dupont (3) 💍 👩 Sophie Bernard (4)
                    │
            ┌───────┴───────┐
            │               │
    👦 Lucas Dupont (5)  👧 Emma Dupont (6)
            │
            │ ❤️ 👩 Sophie Martin (7)
            │
    👶 Tom Dupont (8)
```

---

## 📍 Répartition Géographique

| Ville | Personnes | Noms |
|-------|-----------|------|
| **Paris** 🏛️ | 5 | Jean, Marie, Lucas, Emma, Sophie M. |
| **Lyon** 🦁 | 2 | Pierre, Sophie B. |

---

## 💍 Mariages

| # | Homme | Femme | Date | Lieu | Statut |
|---|-------|-------|------|------|--------|
| 1 | Pierre Dupont (3) | Sophie Bernard (4) | 15/06/2000 | Lyon | 💚 Mariés |

---

## 👥 Unions (non mariées)

| # | Personne 1 | Personne 2 | Statut |
|---|------------|------------|--------|
| 1 | Lucas Dupont (5) | Sophie Martin (7) | 💑 En couple |

---

## 📊 Statistiques

- **Total personnes** : 7 (ou 8 avec Tom)
- **Hommes** : 4 (Jean, Pierre, Lucas, Tom)
- **Femmes** : 3-4 (Marie, Sophie B., Emma, Sophie M.)
- **Générations** : 4 niveaux
- **Mariages** : 1 officiel
- **Enfants par couple** :
  - Jean & Marie → 1 enfant (Pierre)
  - Pierre & Sophie B. → 2 enfants (Lucas, Emma)
  - Lucas & Sophie M. → 1 enfant (Tom)

---

## 🔍 Pourquoi "7 personnes dans la base" mais "3 affichées dans l'arbre" ?

### Explication des Compteurs

- **📊 7 PERSONNES (Base de données)** : Total de personnes enregistrées
  - Jean, Marie, Pierre, Sophie B., Lucas, Emma, Sophie M.

- **👥 3 affichées dans l'arbre** : Personnes visibles dans la vue actuelle
  - Dépend du mode :
    - **"Ma Branche"** : Affiche uniquement votre lignée directe
    - **"Toute la famille"** : Affiche tous les membres

### Exemple - Vue "Ma Branche" (si vous êtes Lucas)

```
Vue affichée (3 personnes) :
👨 Pierre (votre père)
    │
    ├─ 👦 Lucas (VOUS)
    │
    └─ 👧 Emma (votre sœur)
```

**Non affichés dans cette vue** :
- Jean & Marie (grands-parents) - 2 personnes
- Sophie B. (mère) - 1 personne
- Sophie M. (compagne) - 1 personne

**Total** : 3 affichés + 4 cachés = **7 personnes**

---

## 🎯 Comment voir toutes les 7 personnes ?

1. **Basculez en mode "Toute la famille"**
   - Cliquez sur le bouton toggle en haut de l'arbre
   - Passez de "Ma Branche" à "Toute la famille"

2. **Vérifiez les compteurs**
   - 📊 7 PERSONNES (Base de données) - reste constant
   - 👥 7 affichées dans l'arbre - devrait afficher 7

---

**Date de création** : 11 Novembre 2025  
**Source** : `/database/init.sql` + `/database/demo-double-role.sql`
