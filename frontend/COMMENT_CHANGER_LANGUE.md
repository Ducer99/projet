# 🌍 Comment changer la langue de l'application

## 🎯 Vous voulez l'application en anglais même si votre navigateur est en français ?

**Pas de problème !** L'application vous permet de choisir votre langue préférée **indépendamment** de la langue de votre navigateur.

## 🚀 Méthode 1 : Sélecteur de langue rapide (partout)

### Étapes :
1. **Regardez en haut à droite** de l'application
2. **Trouvez le bouton** avec l'icône 🌍 et un drapeau
3. **Cliquez dessus**
4. **Sélectionnez votre langue** :
   - 🇫🇷 Français
   - 🇬🇧 English

```
┌────────────────────────────────────────────────────┐
│ Family Tree                   🌍 🇫🇷 Français ▼   │
├────────────────────────────────────────────────────┤
│                                                    │
│   Cliquez ici ──────────────────────────────▶     │
│                                                    │
│                    Menu déroulant :                │
│                    ┌──────────────────┐            │
│                    │ ✓ 🇫🇷 Français  │            │
│                    │   🇬🇧 English    │            │
│                    └──────────────────┘            │
└────────────────────────────────────────────────────┘
```

### Résultat :
✅ **Changement instantané** - L'application change de langue immédiatement  
✅ **Sauvegardé** - Votre choix est mémorisé pour vos prochaines visites  
✅ **Indépendant** - Ne dépend pas de la langue de votre navigateur

---

## 🛠️ Méthode 2 : Page de paramètres de langue (détaillée)

### Étapes :
1. **Accédez à** `/language-settings` dans l'URL
   - OU cliquez sur le lien dans votre profil

2. **Vous verrez** :
   - La langue actuelle (en surbrillance)
   - Toutes les langues disponibles
   - Un bouton "Activer" pour changer

3. **Cliquez sur "Activer"** pour la langue souhaitée

```
┌─────────────────────────────────────────────────────┐
│ 🌍 Paramètres de langue                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Langue actuelle                                     │
│ 🌍 🇫🇷 Français                                    │
│                                                     │
│ ───────────────────────────────────────────────     │
│                                                     │
│ Langues disponibles                                 │
│                                                     │
│ ┌───────────────────────┐ ┌───────────────────────┐│
│ │ 🇫🇷                   │ │ 🇬🇧                   ││
│ │ Français              │ │ English               ││
│ │ Langue française      │ │ English language      ││
│ │ [✓ Langue active]     │ │ [Activer]             ││
│ └───────────────────────┘ └───────────────────────┘│
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📍 Où se trouve le sélecteur de langue ?

### Pages avec authentification (connecté) :
✅ **Partout !** Le sélecteur 🌍 est dans le **header en haut à droite**
- Dashboard
- Membres
- Événements
- Arbre généalogique
- Profil
- Toutes les autres pages

### Pages sans authentification (non connecté) :
✅ **En haut à droite** de la page (position fixe)
- Login
- Register
- Forgot Password

```
Page de connexion :
┌────────────────────────────────────────────┐
│                          🌍 🇫🇷 Français ▼ │ ← Ici
├────────────────────────────────────────────┤
│              Connexion                     │
│                                            │
│  Email    : [___________________]          │
│  Mot de passe : [___________________]      │
│                                            │
│           [Se connecter]                   │
└────────────────────────────────────────────┘
```

---

## 💡 Exemples d'utilisation

### Scénario 1 : Navigateur en français, application en anglais
```
1. Vous avez un navigateur en français 🇫🇷
2. Vous cliquez sur 🌍 Français ▼
3. Vous sélectionnez 🇬🇧 English
4. ✅ L'application passe en anglais instantanément
5. ✅ Votre choix est sauvegardé (localStorage)
```

### Scénario 2 : Changement temporaire
```
1. Langue actuelle : Français
2. Vous testez l'anglais : clic sur 🌍 → English
3. ✅ Tout passe en anglais
4. Vous revenez au français : clic sur 🌍 → Français
5. ✅ Tout repasse en français
```

### Scénario 3 : Après rafraîchissement de page
```
1. Vous choisissez English
2. Vous rafraîchissez la page (F5)
3. ✅ L'application reste en English
4. Raison : sauvegardé dans localStorage
```

---

## 🔧 Détails techniques

### Comment ça fonctionne ?

1. **Détection initiale** :
   - Vérifie `localStorage` (votre choix précédent)
   - Si vide, utilise la langue du navigateur
   - Si non supportée, utilise le français (défaut)

2. **Changement manuel** :
   - Vous cliquez sur une langue
   - `localStorage.setItem('i18nextLng', 'en')`
   - i18next change toutes les traductions instantanément
   - Aucun rechargement de page nécessaire

3. **Persistance** :
   - Sauvegardé dans `localStorage`
   - Survit aux rafraîchissements
   - Survit à la fermeture du navigateur
   - Spécifique à votre appareil

### Ordre de priorité :

```
1. localStorage ('i18nextLng')  ← Votre choix manuel (priorité max)
2. Langue du navigateur         ← Détection automatique
3. Français (défaut)            ← Fallback
```

---

## 🌟 Avantages

### ✅ Indépendance totale
Votre choix de langue dans l'application **ne dépend pas** de votre navigateur

### ✅ Persistance
Votre langue préférée est **mémorisée** entre les sessions

### ✅ Facilité
**2 clics** pour changer de langue (🌍 → English)

### ✅ Visibilité
Le sélecteur est **toujours visible** en haut à droite

### ✅ Confirmation visuelle
- Badge ✓ sur la langue active
- Surbrillance de la langue actuelle
- Nom de la langue affiché

---

## 🎯 Cas d'usage

### Utilisateur francophone qui préfère l'anglais :
```
Navigateur : Français 🇫🇷
Choix : English 🇬🇧
Résultat : Application en anglais ✅
```

### Utilisateur anglophone en France :
```
Navigateur : Français 🇫🇷 (détecté automatiquement)
Choix : English 🇬🇧 (changement manuel)
Résultat : Application en anglais ✅
```

### Famille multilingue :
```
Personne A : Préfère français → Clic sur 🇫🇷
Personne B : Préfère anglais → Clic sur 🇬🇧
Chacun a sa langue préférée sur son appareil ✅
```

---

## 📱 Sur mobile

Le sélecteur s'adapte :
```
Mobile (< 768px)     :  🌍 🇫🇷 ▼
Tablette/Desktop     :  🌍 🇫🇷 Français ▼
```

Le nom de la langue est caché sur mobile pour économiser l'espace.

---

## 🆘 Dépannage

### Problème : La langue ne change pas
**Solution** :
1. Vider le cache du navigateur
2. Supprimer `localStorage` : `localStorage.clear()`
3. Rafraîchir la page (F5)
4. Choisir à nouveau votre langue

### Problème : La langue revient au français après rafraîchissement
**Solution** :
1. Vérifier que les cookies sont autorisés
2. Vérifier que localStorage n'est pas désactivé
3. Essayer en navigation normale (pas privée)

### Problème : Je ne vois pas le sélecteur de langue
**Solution** :
1. Vérifier que vous utilisez la dernière version
2. Rafraîchir la page (Ctrl+F5)
3. Vérifier la console pour les erreurs

---

## 🎉 Résumé

**Vous voulez l'application en anglais ?**
1. **Cliquez** sur 🌍 en haut à droite
2. **Sélectionnez** 🇬🇧 English
3. **C'est fait !** ✅

**Votre choix est sauvegardé** et restera actif à chaque visite, **même si votre navigateur est en français**.

---

**Date** : 8 janvier 2025  
**Version** : 1.0  
**Langues disponibles** : Français 🇫🇷, English 🇬🇧
