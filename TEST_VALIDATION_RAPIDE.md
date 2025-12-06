# 🧪 TEST RAPIDE DE VALIDATION - BUGS CRITIQUES

## Instructions de Test Immédiat

**URL de test :** http://localhost:3001/family-tree

---

## ✅ Test 1 : Distinction de Genre

### Ce que vous devriez voir MAINTENANT :

1. **Cartes bleues pour les hommes** 🔵
   - Fond bleu clair
   - Bordure bleue
   - Icône ♂ de part et d'autre du nom
   - Badge "♂ HOMME"

2. **Cartes roses pour les femmes** 🌸
   - Fond rose clair  
   - Bordure rose
   - Icône ♀ de part et d'autre du nom
   - Badge "♀ FEMME"

### ✅ Validation
- [ ] Richard KAMO GAMO : Carte BLEUE ♂
- [ ] Rebecca KAMO GAMO : Carte ROSE ♀
- [ ] Ruben KAMO GAMO : Carte BLEUE ♂
- [ ] Gisèle NGUTUMDOM : Carte ROSE ♀

---

## ✅ Test 2 : Métriques Corrigées

### Regardez les compteurs en haut de la page :

**AVANT (Bug) :**
```
Polygames: 0        ❌
Unions: 2.5         ❌
```

**MAINTENANT (Corrigé) :**
```
Polygames: 1        ✅ (Ruben détecté)
Unions: X           ✅ (nombre entier)
```

### ✅ Validation
- [ ] Polygames : Chiffre ≥ 1 (pas 0)
- [ ] Unions : Nombre entier (pas de .5)
- [ ] Console : Messages de debug sur Ruben polygame

---

## ✅ Test 3 : Bouton Fratrie

### Actions à tester :

1. **Cliquer sur "Afficher Fratrie"**
   - [ ] Le bouton affiche un nombre (badge)
   - [ ] Une section fratrie apparaît sous les parents

2. **Vérifier la classification :**
   - [ ] "Frères/sœurs complets (X)"
   - [ ] "Demi-frères/sœurs paternels (X)" (violet)
   - [ ] "Demi-frères/sœurs maternels (X)" (rose)

3. **Tester la navigation :**
   - [ ] Cliquer sur un frère/sœur change le focus
   - [ ] L'arbre se réorganise autour de cette personne

---

## ✅ Test 4 : Qualité des Données

### Vérifier les dates :

1. **Dates cohérentes :**
   - [ ] Âge affiché normalement
   - [ ] "X ans" pour vivants
   - [ ] "Décédé à X ans" pour décédés

2. **Données manquantes :**
   - [ ] "Date de naissance inconnue" en italique
   - [ ] Distinction claire (placeholder, pas donnée codée)

3. **Dates incohérentes :**
   - [ ] Message "⚠️ Dates incohérentes" si décès < naissance

---

## 🚀 RÉSULTAT ATTENDU

### Si TOUS les tests passent :

```
🎉 VALIDATION RÉUSSIE !
L'application est prête pour mise en production.
```

### Critères de Succès :
- ✅ Genre immédiatement reconnaissable (Bleu ♂ / Rose ♀)
- ✅ Métriques logiques (polygames ≥ 1, unions entières)  
- ✅ Navigation fratrie complète et fluide
- ✅ Données cohérentes avec validation

---

## 🔧 Si Un Test Échoue

**Vérifiez :**
1. Le serveur frontend est bien relancé
2. Le cache navigateur est vidé (Ctrl+F5)
3. La console pour messages d'erreur
4. L'URL est bien http://localhost:3001/family-tree

---

*Test de validation rapide - 12 Novembre 2025*
