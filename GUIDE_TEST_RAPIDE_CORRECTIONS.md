# 🧪 Guide de Test Rapide : Corrections Permissions & Lignée

**Date** : 2 décembre 2025  
**Temps Estimé** : 3 minutes

---

## 🎯 Ce que nous avons corrigé

1. **Bug Permissions Admin** : Les cadenas bloquaient l'admin
2. **Bug Lignée Patriarche** : Richard GAMO YAMO était marqué "Conjoint" au lieu de "Lignée Principale"

---

## ✅ Test #1 : Permissions Admin (30 secondes)

### Étape 1 : Rafraîchir la page
- Appuyez sur **`Cmd+R`** (Mac) ou **`Ctrl+R`** (Windows/Linux)
- Ou cliquez sur le bouton de rafraîchissement du navigateur

### Étape 2 : Ouvrir le Tableau de Bord
- Cliquez sur **"Gestion des Membres"** dans le menu

### Étape 3 : Vérifier les Permissions
Regardez la colonne "Actions" (tout à droite) :

**❌ AVANT (Bug)** :
```
┌────────────────┬──────────────┬──────────┐
│ Nom            │ Lignée       │ Actions  │
├────────────────┼──────────────┼──────────┤
│ Ducer TOUKEP   │ VOUS-MÊME    │ ✏️ Edit   │
│ Richard GAMO   │ Conjoint     │ 🔒 Lock   │ ← PROBLÈME
│ Martin GAMO    │ Lignée Princ │ 🔒 Lock   │ ← PROBLÈME
└────────────────┴──────────────┴──────────┘
```

**✅ APRÈS (Corrigé)** :
```
┌────────────────┬──────────────┬──────────┐
│ Nom            │ Lignée       │ Actions  │
├────────────────┼──────────────┼──────────┤
│ Ducer TOUKEP   │ VOUS-MÊME    │ ✏️ Edit   │
│ Richard GAMO   │ Lignée Princ │ ✏️ Edit   │ ← CORRIGÉ
│ Martin GAMO    │ Lignée Princ │ ✏️ Edit   │ ← CORRIGÉ
└────────────────┴──────────────┴──────────┘
```

### ✅ Résultat Attendu
- **AUCUN** cadenas 🔒 visible pour l'admin
- **TOUS** les boutons "Modifier" ✏️ sont bleus et cliquables
- Vous pouvez cliquer sur n'importe quel bouton "Modifier"

---

## ✅ Test #2 : Badge Lignée Patriarche (30 secondes)

### Étape 1 : Trouver Richard GAMO YAMO
- Dans le tableau de bord, cherchez la ligne "Richard GAMO YAMO"

### Étape 2 : Vérifier le Badge
Regardez la colonne "Lignée" :

**❌ AVANT (Bug)** :
```
Richard GAMO YAMO
🌸 Conjoint          ← FAUX (c'est le patriarche !)
```

**✅ APRÈS (Corrigé)** :
```
Richard GAMO YAMO
🟡 Lignée Principale ← CORRECT
```

### ✅ Résultat Attendu
- Richard GAMO YAMO → Badge **Jaune** 🟡 "Lignée Principale"
- Autres patriarches/matriarches (personnes sans parents mais avec enfants) → Badge **Jaune** 🟡
- Vrais conjoints (sans parents, sans enfants) → Badge **Rose** 🌸 (inchangé)

---

## ✅ Test #3 : Modifier un Membre (1 minute)

### Étape 1 : Cliquer sur "Modifier"
- Cliquez sur le bouton ✏️ "Modifier" de n'importe quel membre (ex: Martin GAMO)

### Étape 2 : Modifier une Information
- Changez une information simple (ex: ajouter une note dans "Biographie")
- Cliquez sur "Enregistrer"

### ✅ Résultat Attendu
- La modification doit réussir ✅
- Aucune erreur 403 ou message de permission refusée
- Le système retourne au tableau de bord avec un message de succès

---

## 📊 Checklist de Validation

Cochez au fur et à mesure :

### Permissions Admin
- [ ] Rafraîchi la page (Cmd+R / Ctrl+R)
- [ ] Ouvert le tableau de bord "Gestion des Membres"
- [ ] Vérifié : AUCUN cadenas 🔒 visible
- [ ] Vérifié : TOUS les boutons "Modifier" ✏️ sont bleus
- [ ] Cliqué sur "Modifier" d'un membre → Fonctionne ✅

### Badge Lignée
- [ ] Trouvé Richard GAMO YAMO dans le tableau
- [ ] Vérifié : Badge **Jaune** 🟡 "Lignée Principale"
- [ ] Vérifié : Autres racines ont aussi Badge Jaune 🟡
- [ ] Vérifié : Vrais conjoints ont Badge Rose 🌸

### Fonctionnalités
- [ ] Modifié un membre avec succès
- [ ] Aucune erreur 403 rencontrée
- [ ] Système fonctionne normalement

---

## ❓ Si ça ne fonctionne pas

### Problème : Je vois encore des cadenas 🔒

**Solution 1** : Vider le cache du navigateur
```
Chrome/Edge : Cmd+Shift+R (Mac) ou Ctrl+Shift+R (Windows)
Safari : Cmd+Option+R
Firefox : Cmd+Shift+R (Mac) ou Ctrl+F5 (Windows)
```

**Solution 2** : Vérifier que vous êtes bien Admin
1. Ouvrez la console navigateur : **F12**
2. Dans l'onglet "Console", tapez :
```javascript
JSON.parse(localStorage.getItem('user')).role
```
3. Le résultat doit être `"Admin"` ou `"ADMIN"`

**Solution 3** : Se reconnecter
1. Déconnectez-vous (bouton Déconnexion)
2. Reconnectez-vous avec vos identifiants Admin
3. Testez à nouveau

---

### Problème : Richard est toujours "Conjoint" 🌸

**Solution 1** : Vérifier que Richard a des enfants
1. Ouvrez le profil de Richard
2. Vérifiez qu'il a au moins un enfant enregistré (Martin, Ruben, etc.)
3. Si pas d'enfants → Normal qu'il soit Conjoint

**Solution 2** : Rafraîchir avec cache vidé
```
Cmd+Shift+R (Mac) ou Ctrl+Shift+R (Windows)
```

---

## 🎉 Résultat Final Attendu

### Tableau de Bord Corrigé

```
╔══════════════════════════════════════════════════════════════╗
║  GESTION DES MEMBRES                                         ║
╠════════════════════╦═══════════════════╦═══════════════════╗
║ Nom                ║ Lignée            ║ Actions           ║
╠════════════════════╬═══════════════════╬═══════════════════╣
║ 👤 Ducer TOUKEP    ║ 👑 VOUS-MÊME      ║ ✏️ Modifier       ║
║ 👤 Richard GAMO    ║ 🟡 Lignée Princ   ║ ✏️ Modifier       ║ ← CORRIGÉ
║ 👤 Martin GAMO     ║ 🟡 Lignée Princ   ║ ✏️ Modifier       ║ ← CORRIGÉ
║ 👤 Ruben KAMO      ║ 🟡 Lignée Princ   ║ ✏️ Modifier       ║ ← CORRIGÉ
║ 👤 Conjoint X      ║ 🌸 Conjoint       ║ ✏️ Modifier       ║ ← CORRIGÉ
╚════════════════════╩═══════════════════╩═══════════════════╝

✅ AUCUN cadenas 🔒
✅ TOUS les boutons ✏️ actifs pour l'Admin
✅ Badges corrects
```

---

## 📞 Rapport de Test

Après avoir testé, merci de confirmer :

### ✅ Tout fonctionne
```
Réponse : 
"Les deux bugs sont corrigés ! 
- Je peux modifier tout le monde en tant qu'Admin ✅
- Richard GAMO YAMO a le badge Jaune ✅"
```

### ❌ Problème persistant
```
Réponse : 
"Bug encore présent : [décrire le problème]
Capture d'écran : [joindre si possible]"
```

---

## 🚀 Prochaines Étapes

Si les tests sont réussis :
1. ✅ Valider les corrections
2. ✅ Continuer l'utilisation normale
3. ✅ Surveiller d'autres bugs éventuels

Si les tests échouent :
1. ❌ Signaler le problème
2. 🔍 Diagnostiquer avec les logs
3. 🔧 Appliquer une correction supplémentaire

---

**Bon test ! 🎯**
