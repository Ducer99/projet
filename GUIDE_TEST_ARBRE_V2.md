# 🧪 GUIDE DE TEST - Arbre Organique v2

## ✅ Comment Tester

### 1. **Accès Direct**
```
http://localhost:3000/family-tree-organic
```

### 2. **Via le Menu**
1. Connectez-vous à l'application
2. Allez au Dashboard
3. Cliquez sur le menu "Arbre" dans le header
4. Sélectionnez "Vue Organique"

### 3. **Avec Focus sur une Personne**
```
http://localhost:3000/family-tree-organic?focus=24
```
(Remplacez 24 par l'ID de la personne)

---

## 🔍 Points à Vérifier

### ✅ Cadres Ondulés et Colorés
**À vérifier :**
- [ ] Les cadres ne sont PAS des rectangles simples
- [ ] Les bordures sont ondulées/dentelées
- [ ] Chaque personne a une couleur différente
- [ ] Les couleurs sont vives (rose, jaune, vert, turquoise, etc.)
- [ ] Effet 3D avec ombre portée

**Attendu :** Cadres organiques avec bordures irrégulières et 10 couleurs différentes

---

### ✅ Couples Côte à Côte
**À vérifier :**
- [ ] Le grand-père et la grand-mère sont côte à côte (horizontalement)
- [ ] Le père et la mère sont côte à côte (horizontalement)
- [ ] Les conjoints sont à la même hauteur (Y identique)
- [ ] Les conjoints ont des cadres ondulés comme les autres

**Attendu :** 
```
╭─────────╮     ╭─────────╮
│Grand-Père│     │Grand-Mère│
╰─────────╯     ╰─────────╯
```

---

### ✅ Ligne de Mariage Distinctive
**À vérifier :**
- [ ] Ligne HORIZONTALE entre conjoints
- [ ] Couleur OR (#FFD700)
- [ ] Style POINTILLÉ (pas continu)
- [ ] Symbole d'anneaux entrelacés au milieu
- [ ] Différente des lignes parent-enfant

**Attendu :**
```
Conjoint1 ═ ─ ═ 💍💍 ═ ─ ═ Conjoint2
            (OR)
```

---

### ✅ Branches d'Arbre Organiques
**À vérifier :**
- [ ] Lignes COURBES (pas droites)
- [ ] Couleur MARRON (bois) #8B4513
- [ ] Épaisseur VARIABLE (plus épais près du tronc)
- [ ] Aspect NATUREL (pas rigide)
- [ ] Ombre portée

**Attendu :**
```
Parent
  │ ← Épais, marron
  │
 / \
/   \ ← Moins épais
Enfant1  Enfant2
```

---

### ✅ Tronc avec Texture
**À vérifier :**
- [ ] Forme ORGANIQUE (pas rectangle)
- [ ] Couleur marron avec gradient
- [ ] Marques d'écorce visibles (ellipses foncées)
- [ ] Bordure foncée
- [ ] Position à la racine de l'arbre

**Attendu :**
```
  ║  ○  ║
  ║ ○   ║
  ║  ○  ║
 ═══════
```

---

### ✅ Feuilles Décoratives
**À vérifier :**
- [ ] Environ 50 feuilles dispersées
- [ ] Forme réaliste (pas ellipses simples)
- [ ] Nervure centrale visible
- [ ] Plusieurs nuances de vert
- [ ] Rotation aléatoire
- [ ] Légèrement transparentes

**Attendu :**
```
🍃    🍃
   🍃      🍃
🍃    🍃
   🍃   🍃
```

---

### ✅ Interactivité
**À tester :**
- [ ] **Zoom** : Molette de souris fonctionne
- [ ] **Pan** : Glisser-déposer pour déplacer l'arbre
- [ ] **Click** : Cliquer sur une personne → Va au profil
- [ ] **Double-click** : Double-cliquer → Recentre l'arbre
- [ ] **Contrôles** : Boutons Réinitialiser, Zoom +, Zoom - fonctionnent

---

## 🎨 Checklist Visuelle Complète

### Général
- [ ] L'arbre ressemble à un vrai arbre (métaphore visuelle)
- [ ] Style organique et ludique
- [ ] Couleurs vives et joyeuses
- [ ] Pas de formes rigides ou rectangulaires

### Personnes
- [ ] Cadres non rectangulaires avec bordures ondulées
- [ ] 10 couleurs différentes visibles
- [ ] Photos circulaires à l'intérieur
- [ ] Noms visibles en dessous

### Relations
- [ ] Couples affichés ensemble horizontalement
- [ ] Ligne de mariage OR + POINTILLÉS + ANNEAUX
- [ ] Ligne de filiation MARRON + CONTINU + COURBE
- [ ] Distinction claire entre les deux types

### Décoration
- [ ] Tronc avec texture d'écorce
- [ ] Branches courbes de couleur bois
- [ ] 50 feuilles vertes dispersées
- [ ] Aspect naturel et organique

---

## 🐛 Problèmes Possibles

### Si les cadres sont rectangulaires
❌ **Problème :** Les bordures ondulées ne s'affichent pas  
✅ **Solution :** Vérifier que le SVG path est correct

### Si une seule couleur
❌ **Problème :** Palette de couleurs non appliquée  
✅ **Solution :** Vérifier l'index de couleur : `d.data.id % vibrantColors.length`

### Si pas de conjoints côte à côte
❌ **Problème :** spousePositions non créées  
✅ **Solution :** Vérifier que `node.data.spouses` existe

### Si ligne de mariage invisible
❌ **Problème :** Groupe marriage-links non créé  
✅ **Solution :** Vérifier que les mariages sont dans les données

---

## 📸 Captures d'Écran à Faire

Pour validation, faites des captures d'écran de :

1. **Vue d'ensemble** : Tout l'arbre visible
2. **Zoom sur un couple** : Grand-père + Grand-mère avec ligne de mariage
3. **Zoom sur un cadre** : Bordure ondulée en détail
4. **Branches** : Vérifier les courbes et l'épaisseur variable
5. **Tronc** : Texture d'écorce visible
6. **Feuilles** : Dispersion et nervures

---

## 💬 Questions de Validation

### 1. Est-ce que ça ressemble à l'image que vous avez fournie ?
- [ ] Oui, exactement
- [ ] Proche, quelques ajustements
- [ ] Non, besoin de modifications

### 2. Les cadres sont-ils organiques et ludiques ?
- [ ] Oui, bordures ondulées visibles
- [ ] Non, toujours rectangulaires

### 3. Les couleurs sont-elles vives et variées ?
- [ ] Oui, 10 couleurs différentes
- [ ] Non, couleurs trop uniformes

### 4. Les couples sont-ils côte à côte ?
- [ ] Oui, grand-père et grand-mère ensemble
- [ ] Non, toujours hiérarchiques

### 5. La ligne de mariage est-elle distinctive ?
- [ ] Oui, or + pointillés + anneaux
- [ ] Non, pas de distinction visible

### 6. Les branches ressemblent-elles à un arbre ?
- [ ] Oui, courbes et couleur bois
- [ ] Non, toujours rigides

---

## 🎯 Test Rapide (2 minutes)

1. Ouvrez `http://localhost:3000/family-tree-organic`
2. Regardez les cadres → Sont-ils ondulés et colorés ?
3. Cherchez un couple marié → Sont-ils côte à côte ?
4. Regardez la ligne entre eux → Est-elle en or avec des anneaux ?
5. Regardez les branches → Sont-elles courbes et marron ?
6. Regardez le tronc → A-t-il une texture ?
7. Comptez les feuilles → Y en a-t-il beaucoup ?

**Si OUI à tout = ✅ Succès !**  
**Si NON à quelque chose = ❌ Vérifier ce point**

---

## 📝 Rapport de Test

```
Date du test : _____________
Testeur : _____________

✅ Cadres ondulés : [ ] OUI  [ ] NON
✅ Couleurs variées : [ ] OUI  [ ] NON
✅ Couples côte à côte : [ ] OUI  [ ] NON
✅ Ligne de mariage or : [ ] OUI  [ ] NON
✅ Branches organiques : [ ] OUI  [ ] NON
✅ Tronc avec texture : [ ] OUI  [ ] NON
✅ Feuilles réalistes : [ ] OUI  [ ] NON

Commentaires :
_______________________________________
_______________________________________
_______________________________________

Note globale : ___/10

Validation finale : [ ] APPROUVÉ  [ ] MODIFICATIONS NÉCESSAIRES
```

---

## 🚀 Prêt à Tester !

**Ouvrez votre navigateur et testez maintenant !**

👉 `http://localhost:3000/family-tree-organic`

---

**Bonne chance avec les tests !** 🎉
