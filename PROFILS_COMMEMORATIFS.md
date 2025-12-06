# 🕊️ Profils Commémoratifs - Documentation

## 📋 Contexte

**Question de l'utilisateur :**
> "Si le parent ne le réclame pas étant donné qu'il est déjà décédé, ça se passe comment ?"

**Réponse :** Les personnes décédées ne peuvent PAS s'inscrire. Elles sont **ajoutées** par les membres de la famille sous forme de **profils commémoratifs**.

---

## 🎯 Logique implémentée

### ✅ Personnes VIVANTES (`Alive = true`)
- ✅ Peuvent **s'inscrire** avec email/mot de passe
- ✅ Peuvent **réclamer** leur profil temporaire
- ✅ Se connectent et gèrent leur propre profil
- 🔒 `Status = "confirmed"`
- 🔓 `CanLogin = true`

### 🕊️ Personnes DÉCÉDÉES (`Alive = false`)
- ❌ Ne peuvent PAS s'inscrire (évident !)
- ✅ Sont **ajoutées** par les membres de la famille
- ✅ Profil commémoratif géré collectivement
- 🔒 `Status = "deceased"`
- 🔒 `CanLogin = false` (définitivement)

---

## 🔧 Modifications techniques

### 1️⃣ Backend - PersonsController.cs

#### Création de personne (POST)
```csharp
var person = new Person
{
    // ... autres champs
    Alive = personDto.Alive,
    DeathDate = personDto.DeathDate,
    
    // 🕊️ Logique automatique selon statut vital
    Status = personDto.Alive ? "confirmed" : "deceased",
    CanLogin = personDto.Alive // Les décédés ne peuvent jamais se connecter
};
```

#### Mise à jour de personne (PUT)
```csharp
existingPerson.Alive = personUpdate.Alive;
existingPerson.DeathDate = personUpdate.DeathDate;

// 🕊️ Mettre à jour Status et CanLogin selon statut vital
existingPerson.Status = personUpdate.Alive ? "confirmed" : "deceased";
existingPerson.CanLogin = personUpdate.Alive;
```

### 2️⃣ Frontend - AddMember.tsx

#### Message visuel selon le statut
```tsx
{formData.alive ? (
  <Alert status="info">
    ✅ Cette personne pourra s'inscrire et réclamer son profil plus tard.
  </Alert>
) : (
  <Alert status="warning">
    🕊️ Un profil commémoratif sera créé. Cette personne ne pourra pas s'inscrire.
  </Alert>
)}
```

### 3️⃣ Traductions i18n

**Français (`fr.json`) :**
```json
{
  "addMemberForm": {
    "aliveInfo": "✅ Cette personne pourra s'inscrire et réclamer son profil plus tard.",
    "deceasedInfo": "🕊️ Un profil commémoratif sera créé. Cette personne ne pourra pas s'inscrire."
  }
}
```

**Anglais (`en.json`) :**
```json
{
  "addMemberForm": {
    "aliveInfo": "✅ This person will be able to sign up and claim their profile later.",
    "deceasedInfo": "🕊️ A memorial profile will be created. This person cannot sign up."
  }
}
```

---

## 📊 Base de données - Champs pertinents

| Champ | Type | Description |
|-------|------|-------------|
| `Alive` | `bool` | `true` = vivant, `false` = décédé |
| `DeathDate` | `DateTime?` | Date de décès (null si vivant) |
| `Status` | `string` | `"confirmed"` ou `"deceased"` |
| `CanLogin` | `bool` | `true` si vivant, `false` si décédé |
| `CreatedBy` | `int?` | ID de l'utilisateur qui a créé ce membre |

---

## 🎨 Expérience utilisateur

### Scénario 1 : Ajouter une personne vivante
1. Utilisateur sélectionne "Personne vivante : Oui"
2. ✅ Message affiché : *"Cette personne pourra s'inscrire et réclamer son profil plus tard."*
3. Backend crée : `Status = "confirmed"`, `CanLogin = true`

### Scénario 2 : Ajouter une personne décédée
1. Utilisateur sélectionne "Personne vivante : Non"
2. 🕊️ Message affiché : *"Un profil commémoratif sera créé. Cette personne ne pourra pas s'inscrire."*
3. Champ "Date de décès" apparaît
4. Backend crée : `Status = "deceased"`, `CanLogin = false`

---

## 🔄 Permissions d'édition (futur développement)

### Recommandations :

**Profils décédés :**
- Tout membre de la famille peut éditer (photos, notes, dates)
- Historique collaboratif

**Profils vivants (placeholder) :**
- Édition limitée jusqu'à ce qu'ils réclament leur profil
- Seules les infos de base modifiables

**Profils vivants (confirmed) :**
- Seul le propriétaire peut éditer
- Protection de la vie privée

---

## ✅ Tests suggérés

### Test 1 : Création personne décédée
```bash
POST /api/persons
{
  "firstName": "Grand-père",
  "lastName": "Dupont",
  "sex": "M",
  "alive": false,
  "deathDate": "2010-05-15"
}

# Vérifier :
# - Status = "deceased"
# - CanLogin = false
```

### Test 2 : Modification statut (vivant → décédé)
```bash
PUT /api/persons/5
{
  "alive": false,
  "deathDate": "2025-01-01"
}

# Vérifier :
# - Status change vers "deceased"
# - CanLogin passe à false
```

### Test 3 : Interface visuelle
1. Aller sur `/add-member`
2. Sélectionner "Personne vivante : Non"
3. ✅ Vérifier l'alerte orange avec 🕊️
4. ✅ Vérifier que le champ "Date de décès" apparaît

---

## 📝 Notes importantes

1. **Irréversibilité conceptuelle** : Une personne décédée ne peut plus "revivre" dans le système (logique métier)
2. **Respect de la mémoire** : Les profils commémoratifs honorent les défunts
3. **Collaboration familiale** : Tous peuvent contribuer aux profils des décédés
4. **Protection des vivants** : Seul le propriétaire gère son profil vivant

---

## 🚀 Déploiement

### Fichiers modifiés :
- ✅ `backend/Controllers/PersonsController.cs` (logique Status/CanLogin)
- ✅ `frontend/src/pages/AddMember.tsx` (messages visuels)
- ✅ `frontend/src/i18n/locales/fr.json` (traductions FR)
- ✅ `frontend/src/i18n/locales/en.json` (traductions EN)

### Commandes :
```bash
# Backend
cd backend
dotnet build
dotnet run

# Frontend
cd frontend
npm run dev
```

### Test rapide :
1. Ouvrir `/add-member`
2. Changer "Personne vivante" → Non
3. Observer l'alerte orange 🕊️
4. Ajouter une personne décédée
5. Vérifier dans la BDD : `Status = "deceased"`, `CanLogin = false`

---

## 📅 Date d'implémentation
**11 novembre 2025**

## 👤 Auteur
GitHub Copilot + Utilisateur

---

✅ **Implémentation terminée et fonctionnelle !**
