# 🧪 GUIDE DE TEST - PHASE 3 (VUE STANDARD)

**Date**: 11 Novembre 2025  
**Objectif**: Vérifier que la Vue Standard affiche correctement les unions sans dupliquer les personnes

---

## ✅ PHASE 3 EST COMPLÈTE

Le code a été migré avec succès vers l'architecture orientée unions. Maintenant il faut tester!

---

## 🎯 TEST RAPIDE (5 MINUTES)

### Étape 1: Ouvrir l'Application
- URL: **http://localhost:3000**
- Connexion: Utilisez vos identifiants habituels
- Le navigateur devrait déjà être ouvert

### Étape 2: Naviguer vers l'Arbre Généalogique
- Cliquer sur **"🌳 Arbre Généalogique"** dans le menu
- Ou aller directement à: http://localhost:3000/family-tree

### Étape 3: Activer "Toute la famille"
- Activer le switch **"Toute la famille"** (pas "Ma branche uniquement")
- L'arbre complet devrait s'afficher

### Étape 4: Chercher Ruben KAMO GAMO
- Utiliser la barre de recherche en haut
- Taper: **"Ruben"** ou **"Kamo Gamo"**
- Trouver la personne dans l'arbre

---

## ✅ POINTS DE VÉRIFICATION

### 🔍 Test Principal: Cas Ruben (Polygamie)

**CE QU'ON DOIT VOIR**:

1. **✅ Ruben apparaît UNE SEULE FOIS**
   - Pas de duplication du nœud Ruben
   - Un seul cadre avec sa photo/nom

2. **✅ Trois unions SÉPARÉES**
   - Union 1: Ruben 💕/💑 Eudoxie → Enfants: [Borel Bassot, ...]
   - **Séparateur visuel** (ligne grise)
   - Union 2: Ruben 💕/💑 Gisele → Enfants: [Othniel, ...]
   - **Séparateur visuel** (ligne grise)
   - Union 3: Ruben 💕/💑 Eulalie → Enfants: [...]

3. **✅ Gisele EST VISIBLE**
   - Elle doit apparaître comme partenaire de Ruben
   - Avec ses enfants (dont Othniel) en dessous

4. **✅ Badges "½ Demi-frère/sœur"**
   - Sur Borel Bassot (enfant de Ruben + Eudoxie)
   - Sur Othniel (enfant de Ruben + Gisele)
   - Badge orange avec texte "½ Demi-frère/sœur"

5. **✅ Barres de connexion**
   - Barre horizontale violette entre Ruben et chaque partenaire
   - Barre verticale violette descendant vers les enfants

---

## 🐛 CONSOLE LOGS À VÉRIFIER

### Ouvrir les DevTools
- **Chrome/Edge**: `Cmd + Option + I` (Mac) ou `F12` (Windows)
- **Firefox**: `Cmd + Option + K` (Mac) ou `F12` (Windows)
- **Safari**: `Cmd + Option + C` (Mac)

### Logs Attendus
Rechercher dans la console:

```javascript
🔍 Famille construite: {racines: X, unions: 3, personnes: 5}
✅ Arbre avec unions: [Array of PersonWithUnions]
```

**Vérifications**:
- `unions: 3` → Ruben a bien 3 unions détectées
- `personnes: 5` → Comptage correct (pas 7 avec duplications)

---

## ❌ PROBLÈMES POSSIBLES

### Problème 1: "Ne vois toujours que 7 personnes"
**Cause**: Cache du navigateur  
**Solution**:
```
Mac: Cmd + Shift + R
Windows: Ctrl + Shift + R
Ou: Vider le cache dans DevTools > Network > Disable cache
```

### Problème 2: "Gisele n'apparaît pas"
**Cause**: Données manquantes dans la base  
**Solution**: Vérifier dans DevTools > Network:
- Chercher la requête: `GET /api/familytree/full/10`
- Vérifier la réponse contient les unions de Ruben

### Problème 3: "Erreur JavaScript"
**Cause**: Code mal chargé  
**Solution**:
1. Vérifier console pour erreurs rouges
2. Noter le message d'erreur exact
3. Recharger la page (Cmd+R)

### Problème 4: "Page blanche"
**Cause**: Serveur frontend arrêté  
**Solution**: Vérifier terminal VS Code → "Start Frontend Dev Server" est actif

---

## 📊 COMPARAISON AVANT/APRÈS

### 🔴 AVANT (Problème)
```
Ruben KAMO GAMO
├── 💕 Eudoxie
│   └── Borel Bassot
├── 💕 Ruben KAMO GAMO (DUPLICATION!)
│   └── Gisele
│       └── Othniel
└── 💕 Ruben KAMO GAMO (DUPLICATION!)
    └── Eulalie
        └── [enfants]

Affichage: "7 PERSONNES" ❌
Gisele: Parfois invisible ❌
```

### 🟢 APRÈS (Correct)
```
Ruben KAMO GAMO (UNIQUE)
├── Union 1: 💕 Eudoxie
│   └── [½] Borel Bassot
├── ─────────────────────── (SÉPARATEUR)
├── Union 2: 💕 Gisele
│   └── [½] Othniel
├── ─────────────────────── (SÉPARATEUR)
└── Union 3: 💕 Eulalie
    └── [½] [enfants]

Affichage: "5 PERSONNES" ✅
Gisele: Toujours visible ✅
```

---

## 📸 CAPTURES D'ÉCRAN

**Si tout fonctionne, prendre une capture d'écran montrant**:
1. L'arbre avec Ruben unique et ses 3 unions
2. Les badges "½ Demi-frère/sœur"
3. Les logs console avec les statistiques correctes

**Si problème, capturer**:
1. L'erreur dans la console
2. L'état visuel de l'arbre
3. La réponse API dans Network tab

---

## ✅ VALIDATION FINALE

Cocher si OK:

- [ ] Ruben apparaît UNE SEULE FOIS (pas 3 fois)
- [ ] 3 unions sont affichées SÉPARÉMENT avec séparateurs
- [ ] Gisele est VISIBLE comme mère d'Othniel
- [ ] Badges "½ Demi-frère/sœur" présents sur les enfants
- [ ] Console log montre "unions: 3, personnes: 5"
- [ ] Barres de connexion violettes entre parents et enfants
- [ ] Aucune erreur JavaScript dans la console
- [ ] Navigation fluide (zoom, pan, recherche)

---

## 🚀 APRÈS LES TESTS

### Si tout est OK ✅
→ **Passer à Phase 4** (Migration Vue Organique)

### Si problèmes détectés ❌
→ Noter les problèmes et on corrige avant Phase 4

---

## 📞 AIDE RAPIDE

**Backend ne répond pas?**
```bash
# Vérifier le backend dans VS Code Terminal
# Devrait afficher: "Now listening on: http://localhost:5000"
```

**Frontend planté?**
```bash
# Redémarrer le frontend
cd /Users/ducer/Desktop/projet/frontend
npm run dev
```

**Tout réinitialiser?**
```bash
# Vider cache + redémarrer
1. Fermer tous les onglets localhost:3000
2. Cmd + Shift + R dans nouveau Tab
3. Vérifier DevTools > Application > Clear storage
```

---

**Bonne chance avec les tests! 🎉**

Si tout fonctionne → On attaque Phase 4 (Vue Organique avec D3.js)  
Si problème → On debug ensemble avant de continuer
