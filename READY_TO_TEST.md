# ✅ SERVEURS DÉMARRÉS - READY TO TEST

## 🎯 Status Actuel

- ✅ **Frontend** : http://localhost:3000 (Vite + React)
- ✅ **Backend** : http://localhost:5000 (.NET + Logs Debug)
- ✅ **Proxy Vite** : Configuré pour `/api` → `http://localhost:5000`

## 🔧 Corrections Appliquées

1. ✅ Flux 3 étapes (register-simple → complete-profile → families)
2. ✅ Champ `Gender` → `Sex` dans `CompleteProfileRequest`
3. ✅ Logs de debugging détaillés (frontend + backend)

## 🧪 TEST D'INSCRIPTION MAINTENANT

### Étape 1 : Ouvrir l'Application

```
http://localhost:3000/register
```

### Étape 2 : Ouvrir la Console Chrome

1. Appuyer sur **F12** (ou Cmd+Option+I sur Mac)
2. Aller dans l'onglet **Console**
3. Laisser la console ouverte pendant l'inscription

### Étape 3 : Remplir le Formulaire

#### Step 1 - Identifiants
- Email : `test@example.com`
- Password : `Test123!`
- Confirm Password : `Test123!`

#### Step 2 - Profil
- Prénom : `Jean`
- Nom : `Martin`
- **Sexe : Sélectionner M ou F** ← IMPORTANT !

#### Step 3 - Famille
**Option A - Créer une famille** :
- Choisir "Créer une nouvelle famille"
- Nom de famille : `Martin`

**OU Option B - Rejoindre une famille** :
- Choisir "Rejoindre une famille existante"
- Code d'invitation : `KAM-6644` (ou un autre code valide)

### Étape 4 : Soumettre

Cliquer sur le bouton dynamique :
- 🏠 "Créer la famille" (si option A)
- 👥 "Rejoindre la famille" (si option B)

---

## 📊 LOGS À COLLECTER

### 1️⃣ Console Chrome (F12)

Cherchez et copiez TOUS les messages qui commencent par :

```
🔵 Step 1: Creating temporary account...
📤 Sending profile data: {...}
✅ Token saved
🔵 Step 2: Completing profile...
✅ Profile completed
🔵 Step 3: Creating/joining family...
```

**Si erreur** :
```
❌ Registration error: AxiosError {...}
Error details: {...}
```

### 2️⃣ Terminal Backend (backend-debug.log)

Dans le terminal où vous avez lancé `dotnet run`, cherchez :

```
========== 🔵 COMPLETE-PROFILE DEBUG START ==========
📥 Request received:
   FirstName: '...' (length: ...)
   LastName: '...' (length: ...)
   Sex: '...' (length: ...)
   BirthDate: ...
   BirthCity: '...' (length: ...)
   BirthCountry: '...' (length: ...)
   Activity: '...' (length: ...)
👤 User ID from token: ...
✅ Connexion found: ID=..., Email=...
📝 Creating Person object...
🔍 Sex value before Person creation: '...'
   Is null or empty? ...
   Is 'M'? ...
   Is 'F'? ...
```

**Si erreur** :
```
❌ ERROR saving Person to database:
   Exception Type: ...
   Message: ...
   Inner Exception: ...
   Stack Trace: ...
========== 🔴 COMPLETE-PROFILE DEBUG END (ERROR) ==========
```

**Si succès** :
```
💾 Attempting to save Person to database...
✅ Person saved successfully! PersonID: ...
💾 Saving Connexion updates...
✅ Connexion updated successfully!
🔑 Generating new JWT token...
✅ Token generated!
========== ✅ COMPLETE-PROFILE DEBUG END (SUCCESS) ==========
```

---

## 🔍 DIAGNOSTIC RAPIDE

### Scénario 1 : Erreur 403 Forbidden

**Symptôme** :
```
POST http://localhost:3000/api/auth/register-simple 403 (Forbidden)
```

**Cause possible** :
- Backend pas démarré
- Backend crashé après démarrage

**Solution** :
```bash
# Vérifier que le backend tourne
curl http://localhost:5000/api/health
# Si erreur, relancer :
cd backend && dotnet run
```

### Scénario 2 : Erreur 500 Internal Server Error

**Symptôme** :
```
POST http://localhost:3000/api/auth/complete-profile 500
```

**Cause possible** :
- Champ `Sex` vide ou invalide
- Contrainte PostgreSQL violée
- Autre champ obligatoire manquant

**Diagnostic** :
Regarder les logs backend (terminal) pour voir l'erreur exacte.

### Scénario 3 : Succès ! 🎉

**Symptôme** :
```
✅ Profile completed
✅ Family created: Martin
```

**Résultat** :
- Compte créé ✅
- Profil complété ✅
- Famille créée/rejointe ✅
- Redirect automatique vers /dashboard ✅

---

## 📝 INSTRUCTIONS POUR PARTAGER LES LOGS

### Si ça marche ✅

Envoyez simplement :
> "✅ Ça marche ! L'inscription est réussie et je suis redirigé vers le dashboard."

### Si ça ne marche pas ❌

Copiez et envoyez :

1. **Message d'erreur visible** (toast rouge)
2. **Logs Console Chrome** (F12 → Console)
3. **Logs Terminal Backend** (où `dotnet run` tourne)

**Format suggéré** :
```
❌ ERREUR INSCRIPTION

1. Message d'erreur :
[Coller le message du toast]

2. Console Chrome :
[Coller tous les logs 🔵, 📤, ❌]

3. Terminal Backend :
[Coller tous les logs 🔵, 📥, 🔍, ❌]
```

---

## 🚀 C'EST PARTI !

**Tout est prêt pour tester !**

1. ✅ Backend avec logs : `dotnet run` (port 5000)
2. ✅ Frontend : `npm run dev` (port 3000)
3. ✅ Proxy configuré
4. ✅ Corrections appliquées

**→ Ouvrir http://localhost:3000/register et tester ! 🎯**

---

**Date** : 6 décembre 2025, 17:05  
**Status** : 🟢 READY TO TEST
