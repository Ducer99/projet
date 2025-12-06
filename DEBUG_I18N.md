# 🔧 DEBUG - Changement de langue ne fonctionne pas

## ✅ Ce qui a été fait

1. ✅ Installation de i18next, react-i18next, i18next-browser-languagedetector
2. ✅ Configuration i18n avec détection automatique
3. ✅ Traductions FR et EN (150+ clés chacune)
4. ✅ LanguageSwitcher créé
5. ✅ Header migré pour utiliser `t()`
6. ✅ Dashboard migré partiellement (titre, sous-titre, boutons navigation)
7. ✅ Routes de navigation dans Header traduites

## 🐛 Problème actuel

Quand vous cliquez sur "English" dans le sélecteur 🌍, **l'application reste en français**.

## 🔍 Étapes de diagnostic

### 1. Vérifier le localStorage

**Ouvrez la console du navigateur (F12) et tapez :**

```javascript
console.log(localStorage.getItem('i18nextLng'));
```

**Résultat attendu :** Devrait afficher `"en"` si vous avez cliqué sur English

**Si c'est `null` ou `"fr"` :** Le changement de langue ne se sauvegarde pas

### 2. Vérifier l'état de i18next

**Dans la console :**

```javascript
// Vérifier la langue actuelle
console.log(window.i18next?.language);

// Forcer le changement
window.i18next?.changeLanguage('en');
```

**Si ça fonctionne :** Le problème vient du LanguageSwitcher

**Si ça ne fonctionne pas :** Le problème vient de l'initialisation i18next

### 3. Vérifier que les traductions sont chargées

**Dans la console :**

```javascript
console.log(window.i18next?.store.data);
```

**Résultat attendu :**

```javascript
{
  en: {
    translation: { dashboard: {...}, navigation: {...} }
  },
  fr: {
    translation: { dashboard: {...}, navigation: {...} }
  }
}
```

### 4. Vérifier le rendu React

**Regardez le texte affiché dans le Header :**

- Si vous voyez : `Accueil`, `Membres`, `Événements` → **FR activé**
- Si vous voyez : `Home`, `Members`, `Events` → **EN activé**

### 5. Vérifier le Dashboard

**Regardez le titre principal :**

- Si vous voyez : `Tableau de bord` → **FR activé**
- Si vous voyez : `Dashboard` → **EN activé**

## 🚀 Solutions par ordre de priorité

### Solution 1 : Vider le cache et localStorage

```javascript
// Dans la console F12
localStorage.clear();
sessionStorage.clear();
location.reload();
```

Ensuite :
1. Reconnectez-vous
2. Cliquez sur 🌍 Français ▼
3. Sélectionnez 🇬🇧 English
4. Observez le changement

---

### Solution 2 : Hard Reload

1. **Chrome/Edge** : `Cmd+Shift+R` (Mac) ou `Ctrl+Shift+R` (Windows)
2. **Firefox** : `Cmd+Shift+R` (Mac) ou `Ctrl+F5` (Windows)
3. **Safari** : `Cmd+Option+E` puis `Cmd+R`

Cela force le rechargement sans cache.

---

### Solution 3 : Mode Incognito

Ouvrez l'application en mode navigation privée :

1. **Chrome** : `Cmd+Shift+N` (Mac) ou `Ctrl+Shift+N` (Windows)
2. Allez sur `http://localhost:3001`
3. Connectez-vous
4. Testez le changement de langue

Si ça fonctionne → Le problème vient du cache

---

### Solution 4 : Vérifier l'URL de dev

Le serveur Vite devrait être sur :

```
http://localhost:3001
```

**Vérifiez dans le terminal :**

```bash
ps aux | grep vite
```

---

### Solution 5 : Redémarrer le serveur frontend

```bash
cd frontend
npm run dev
```

Attendez le message :

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3001/
  ➜  Network: use --host to expose
```

---

## 📊 Informations techniques

### Fichiers modifiés

1. **`/frontend/src/i18n/config.ts`** - Configuration i18next
2. **`/frontend/src/i18n/locales/fr.json`** - Traductions françaises
3. **`/frontend/src/i18n/locales/en.json`** - Traductions anglaises
4. **`/frontend/src/components/LanguageSwitcher.tsx`** - Sélecteur de langue
5. **`/frontend/src/components/Header.tsx`** - Navigation (utilise `t()`)
6. **`/frontend/src/pages/Dashboard.tsx`** - Titre et sous-titre (utilise `t()`)
7. **`/frontend/src/main.tsx`** - Import de la config i18n
8. **`/frontend/src/App.tsx`** - Ajout du Header global

### Ordre de priorité i18next

```
1. localStorage.getItem('i18nextLng') ← PRIORITÉ MAX (choix utilisateur)
2. navigator.language ← Langue du navigateur
3. 'fr' ← Langue par défaut (fallback)
```

### Clés de traduction utilisées

**Header :**
- `navigation.home` → "Accueil" / "Home"
- `navigation.members` → "Membres" / "Members"
- `navigation.events` → "Événements" / "Events"
- `navigation.tree` → "Arbre" / "Tree"
- `navigation.profile` → "Profil" / "Profile"
- `navigation.logout` → "Déconnexion" / "Logout"

**Dashboard :**
- `dashboard.title` → "Tableau de bord" / "Dashboard"
- `dashboard.subtitle` → "Une famille, une même histoire..." / "One family, one shared story..."

## 🧪 Test manuel complet

1. Ouvrez http://localhost:3001
2. Connectez-vous avec vos identifiants
3. Vous devriez voir le Header avec 🌍 Français ▼
4. Observez le texte actuel : `Accueil`, `Membres`, etc.
5. Cliquez sur 🌍 Français ▼
6. Un menu apparaît avec :
   - 🇫🇷 Français ✓ (avec coche verte)
   - 🇬🇧 English
7. Cliquez sur 🇬🇧 English
8. **RÉSULTAT ATTENDU :**
   - Le menu se ferme
   - Le bouton devient : 🌍 English ▼
   - Les labels changent INSTANTANÉMENT :
     - `Accueil` → `Home`
     - `Membres` → `Members`
     - `Événements` → `Events`
     - `Arbre` → `Tree`
     - `Profil` → `Profile`
     - `Déconnexion` → `Logout`
   - Le titre du Dashboard change : `Tableau de bord` → `Dashboard`

## 🔍 Si ça ne fonctionne toujours pas

### Vérifier la console pour les erreurs

Ouvrez F12 → Onglet Console

**Erreurs possibles :**

1. `Cannot read properties of undefined (reading 'changeLanguage')`
   → i18next pas initialisé

2. `Translation key 'navigation.home' not found`
   → Fichiers de traduction pas chargés

3. `localStorage is not defined`
   → Problème de contexte browser

### Vérifier Network tab

F12 → Network → Rechargez la page

**Cherchez :**
- `fr.json` (Status 200)
- `en.json` (Status 200)

Si 404 → Les fichiers de traduction ne sont pas trouvés

### Activer le mode debug i18next

**Ajoutez temporairement dans `/frontend/src/i18n/config.ts` :**

```typescript
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true, // ✨ AJOUTER CETTE LIGNE
    resources: { fr, en },
    // ... reste de la config
  });
```

Ensuite rechargez et regardez la console. Vous verrez tous les logs i18next.

## 📝 Informations à me communiquer

Si le problème persiste, donnez-moi ces informations :

1. **localStorage value** : `localStorage.getItem('i18nextLng')`
2. **i18next language** : `window.i18next?.language`
3. **Erreurs console** : Copier/coller les erreurs rouges
4. **Texte affiché** : Screenshot du Header et Dashboard
5. **Network tab** : Les fichiers .json se chargent-ils ?

## ✅ Checklist rapide

- [ ] J'ai vidé localStorage avec `localStorage.clear()`
- [ ] J'ai fait un Hard Reload (Cmd+Shift+R)
- [ ] J'ai vérifié que le serveur tourne sur localhost:3001
- [ ] J'ai ouvert la console F12 pour voir les erreurs
- [ ] J'ai cliqué sur 🌍 et sélectionné English
- [ ] J'ai vérifié `localStorage.getItem('i18nextLng')`
- [ ] J'ai testé en mode navigation privée

---

## 🎯 Prochaine étape

Une fois que le changement de langue fonctionne pour Header et Dashboard, nous allons :

1. Migrer toutes les autres pages (PersonsList, Events, Login, etc.)
2. Ajouter les traductions pour tous les textes restants
3. Tester le pluriel avec les traductions
4. Documenter le système complet

**Version actuelle :** 
- Header : ✅ Traduit
- Dashboard : 🟡 Partiellement traduit (titre + navigation)
- Autres pages : ❌ Pas encore migrées
