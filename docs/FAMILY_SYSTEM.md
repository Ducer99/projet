# 🏠 Système de Familles avec Codes d'Invitation

## 📋 Vue d'ensemble

Le système permet à chaque utilisateur de :
1. **Créer une nouvelle famille** et devenir Admin
2. **Rejoindre une famille existante** avec un code d'invitation
3. **Inviter d'autres membres** en partageant le code
4. **Gérer les accès** selon leur rôle (Admin/Member)

---

## 🎯 Workflow Utilisateur

### Scénario 1 : Créer une famille

```
┌─────────────────────────────────────┐
│  1. Inscription                     │
│  Email: jacques@bernard.com         │
│  Password: ••••••••                 │
│  [S'inscrire]                       │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  2. Configuration Famille           │
│  ○ Créer une nouvelle famille       │
│  ○ Rejoindre une famille existante  │
└─────────────────────────────────────┘
         ↓ Sélection "Créer"
┌─────────────────────────────────────┐
│  3. Informations                    │
│  Prénom: Jacques                    │
│  Nom: Bernard                       │
│  Nom de famille: Bernard            │
│  Sexe: M                            │
│  Date de naissance: (optionnel)     │
│  [Créer ma famille]                 │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  ✅ Famille créée !                 │
│  Code d'invitation: BER-3847        │
│  Vous êtes Admin de la famille      │
│  [Aller au Dashboard]               │
└─────────────────────────────────────┘
```

### Scénario 2 : Rejoindre une famille

```
┌─────────────────────────────────────┐
│  1. Inscription                     │
│  Email: marie@bernard.com           │
│  Password: ••••••••                 │
│  [S'inscrire]                       │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  2. Configuration Famille           │
│  ○ Créer une nouvelle famille       │
│  ● Rejoindre une famille existante  │
└─────────────────────────────────────┘
         ↓ Sélection "Rejoindre"
┌─────────────────────────────────────┐
│  3. Code d'invitation               │
│  Entrez le code: BER-3847           │
│  [Vérifier]                         │
└─────────────────────────────────────┘
         ↓ Code valide ✅
┌─────────────────────────────────────┐
│  4. Informations                    │
│  Famille: Bernard                   │
│  Prénom: Marie                      │
│  Nom: Bernard                       │
│  Sexe: F                            │
│  [Rejoindre]                        │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  ✅ Bienvenue dans la famille Bernard! │
│  Rôle: Membre                       │
│  [Aller au Dashboard]               │
└─────────────────────────────────────┘
```

---

## 🔑 Format du Code d'Invitation

```
Format: XXX-NNNN

Composants:
- XXX = 3 premières lettres du nom de famille (MAJUSCULES)
- NNNN = 4 chiffres aléatoires

Exemples:
- Bernard → BER-3847
- Dupont  → DUP-1234
- Martin  → MAR-5678
- Yu      → YUX-9012 (complété avec X si < 3 lettres)
```

**Caractéristiques:**
- ✅ Unique par famille
- ✅ Facile à partager (8 caractères)
- ✅ Mémorisable
- ✅ Peut être régénéré par l'admin

---

## 👥 Rôles et Permissions

| Rôle | Description | Permissions |
|------|-------------|-------------|
| **Admin** | Premier inscrit de la famille | • Voir le code d'invitation<br>• Régénérer le code<br>• Gérer l'arbre<br>• Inviter des membres<br>• Modifier toutes les personnes |
| **Moderator** | Gestionnaire de contenu | • Modifier l'arbre<br>• Ajouter des personnes<br>• Pas accès au code |
| **Member** | Membre standard | • Voir l'arbre<br>• Modifier son propre profil<br>• Pas accès au code |

---

## 📊 API Endpoints

### 1. Créer une Famille

**Endpoint:** `POST /api/auth/create-family`

**Request:**
```json
{
  "email": "admin@bernard.com",
  "password": "password123",
  "firstName": "Jacques",
  "lastName": "Bernard",
  "familyName": "Bernard",
  "sex": "M",
  "birthday": "1980-05-15",
  "activity": "Ingénieur"
}
```

**Response:**
```json
{
  "message": "Famille créée avec succès !",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "connexionID": 4,
    "email": "admin@bernard.com",
    "userName": "jacques.bernard",
    "role": "Admin",
    "personID": 11,
    "personName": "Jacques Bernard",
    "familyID": 3,
    "familyName": "Bernard",
    "inviteCode": "BER-3847"
  }
}
```

---

### 2. Rejoindre une Famille

**Endpoint:** `POST /api/auth/join-family`

**Request:**
```json
{
  "email": "marie@bernard.com",
  "password": "password123",
  "firstName": "Marie",
  "lastName": "Bernard",
  "inviteCode": "BER-3847",
  "sex": "F",
  "birthday": "1985-03-20"
}
```

**Response:**
```json
{
  "message": "Vous avez rejoint la famille Bernard !",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "connexionID": 5,
    "email": "marie@bernard.com",
    "userName": "marie.bernard",
    "role": "Member",
    "personID": 12,
    "personName": "Marie Bernard",
    "familyID": 3,
    "familyName": "Bernard"
  }
}
```

**Erreurs possibles:**
- `400 Bad Request` - Code d'invitation invalide
- `400 Bad Request` - Email déjà utilisé

---

### 3. Obtenir les Infos de la Famille

**Endpoint:** `GET /api/auth/family-info`

**Headers:** `Authorization: Bearer <token>`

**Response (Admin):**
```json
{
  "familyID": 3,
  "familyName": "Bernard",
  "description": "Famille Bernard",
  "createdDate": "2025-10-07T10:30:00Z",
  "userRole": "Admin",
  "inviteCode": "BER-3847",
  "canRegenerateCode": true
}
```

**Response (Member):**
```json
{
  "familyID": 3,
  "familyName": "Bernard",
  "description": "Famille Bernard",
  "createdDate": "2025-10-07T10:30:00Z",
  "userRole": "Member",
  "inviteCode": null,
  "canRegenerateCode": false
}
```

---

### 4. Régénérer le Code d'Invitation

**Endpoint:** `POST /api/auth/regenerate-invite-code`

**Headers:** `Authorization: Bearer <token>`

**Permissions:** Admin uniquement

**Response:**
```json
{
  "message": "Code d'invitation régénéré avec succès",
  "newInviteCode": "BER-9123"
}
```

**Erreurs:**
- `403 Forbidden` - Utilisateur n'est pas Admin

---

## 🎨 Interface Frontend

### Dashboard - Affichage du Code (Admin uniquement)

```tsx
<Box bg="blue.50" p={6} borderRadius="lg" borderWidth={2}>
  <Heading size="md">👨‍👩‍👧‍👦 Code d'Invitation Familial</Heading>
  <Text mt={2}>Partagez ce code pour inviter des membres :</Text>
  
  <HStack spacing={4} mt={4}>
    <Code fontSize="2xl" p={3} colorScheme="blue">
      BER-3847
    </Code>
    <IconButton 
      icon={<CopyIcon />} 
      onClick={copyToClipboard}
      aria-label="Copier"
    />
  </HStack>
  
  <Button 
    mt={4} 
    size="sm" 
    variant="outline"
    onClick={regenerateCode}
  >
    🔄 Régénérer le code
  </Button>
  
  <Text fontSize="sm" color="gray.600" mt={2}>
    ⚠️ Régénérer le code invalidera l'ancien
  </Text>
</Box>
```

---

## 🔒 Sécurité

### Protection

1. **Code unique** : Chaque code est unique dans toute la base de données
2. **Vérification côté serveur** : Le code est validé avant de permettre l'inscription
3. **Rôles stricts** : Seul l'admin peut voir et régénérer le code
4. **Pas d'énumération** : Impossible de deviner les codes (10000 possibilités par préfixe)

### Régénération du Code

**Cas d'usage :**
- Code divulgué publiquement
- Volonté de limiter les nouvelles inscriptions
- Sécurité compromise

**Conséquences :**
- L'ancien code devient invalide immédiatement
- Les membres déjà inscrits ne sont pas affectés
- Seules les nouvelles inscriptions nécessitent le nouveau code

---

## 📝 Base de Données

### Table Family

```sql
CREATE TABLE "Family" (
  "FamilyID" SERIAL PRIMARY KEY,
  "FamilyName" VARCHAR(100) NOT NULL,
  "Description" VARCHAR(500),
  "CreatedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "InviteCode" VARCHAR(20) UNIQUE,
  "CreatedBy" INTEGER REFERENCES "Person"("PersonID")
);

CREATE INDEX "IX_Family_InviteCode" ON "Family"("InviteCode");
```

### Table Connexion

```sql
ALTER TABLE "Connexion"
ADD COLUMN "Role" VARCHAR(20) DEFAULT 'Member';

-- Valeurs possibles: 'Admin', 'Moderator', 'Member'
```

---

## ✅ Avantages du Système

1. **Simple** : Code court et mémorisable
2. **Sécurisé** : Codes uniques, régénérables
3. **Flexible** : Rôles adaptables selon les besoins
4. **Intuitif** : Workflow clair pour créer ou rejoindre
5. **Évolutif** : Facile d'ajouter de nouvelles permissions

---

## 🚀 Prochaines Étapes

1. ✅ Migration base de données
2. ✅ Modèles C# mis à jour
3. ✅ Endpoints API créés
4. ⏳ Page Frontend "Setup Family"
5. ⏳ Dashboard avec affichage du code
6. ⏳ Tests complets du workflow

---

**Statut Actuel:** Backend implémenté ✅ | Frontend à créer ⏳
