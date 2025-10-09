# Documentation API - FamilyTree

## URL de Base

```
http://localhost:5000/api
```

## Authentification

L'API utilise l'authentification JWT. Pour les endpoints protégés, incluez le token dans l'header :

```
Authorization: Bearer <votre_token>
```

---

## Endpoints

### 🔐 Authentification

#### `POST /auth/login`

Connexion d'un utilisateur.

**Request Body:**
```json
{
  "userName": "pierre.dupont",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "connexionID": 1,
    "userName": "pierre.dupont",
    "level": 3,
    "idPerson": 3,
    "familyID": 1,
    "personName": "Pierre Dupont",
    "familyName": "Famille Dupont"
  }
}
```

**Errors:**
- `401 Unauthorized` - Identifiants incorrects

---

#### `POST /auth/register`

Inscription d'un nouvel utilisateur.

**Request Body:**
```json
{
  "userName": "nouveau.user",
  "password": "motdepasse123",
  "email": "user@example.com",
  "idPerson": 5
}
```

**Response:** `200 OK`
```json
"Compte créé avec succès"
```

**Errors:**
- `400 Bad Request` - Nom d'utilisateur ou email déjà utilisé
- `400 Bad Request` - Personne non trouvée
- `400 Bad Request` - Personne a déjà un compte

---

### 👤 Personnes

#### `GET /persons`

Récupère toutes les personnes. 🔒 **Authentification requise**

**Response:** `200 OK`
```json
[
  {
    "personID": 1,
    "lastName": "Dupont",
    "firstName": "Jean",
    "birthday": "1950-05-15",
    "email": null,
    "sex": "M",
    "activity": "Retraité",
    "alive": true,
    "deathDate": null,
    "photoUrl": null,
    "notes": null,
    "fatherID": null,
    "motherID": null,
    "cityID": 1,
    "familyID": 1,
    "city": {
      "cityID": 1,
      "name": "Paris",
      "countryName": "France"
    },
    "family": {
      "familyID": 1,
      "familyName": "Famille Dupont"
    }
  }
]
```

---

#### `GET /persons/{id}`

Récupère une personne par son ID. 🔒 **Authentification requise**

**Parameters:**
- `id` (path) - ID de la personne

**Response:** `200 OK`
```json
{
  "personID": 3,
  "lastName": "Dupont",
  "firstName": "Pierre",
  "birthday": "1975-03-10",
  "email": "pierre.dupont@example.com",
  "sex": "M",
  "activity": "Ingénieur",
  "alive": true,
  "deathDate": null,
  "photoUrl": null,
  "notes": null,
  "fatherID": 1,
  "motherID": 2,
  "cityID": 2,
  "familyID": 1,
  "city": { ... },
  "family": { ... },
  "father": { ... },
  "mother": { ... },
  "childrenAsFather": [...],
  "childrenAsMother": [],
  "weddingsAsMan": [...],
  "weddingsAsWoman": []
}
```

**Errors:**
- `404 Not Found` - Personne non trouvée

---

#### `GET /persons/family/{familyId}`

Récupère toutes les personnes d'une famille. 🔒 **Authentification requise**

**Parameters:**
- `familyId` (path) - ID de la famille

**Response:** `200 OK`
```json
[
  { ... }
]
```

---

#### `POST /persons`

Crée une nouvelle personne. 🔒 **Authentification requise**

**Request Body:**
```json
{
  "lastName": "Dupont",
  "firstName": "Alexandre",
  "birthday": "2010-05-20",
  "email": null,
  "sex": "M",
  "activity": "Collégien",
  "alive": true,
  "deathDate": null,
  "photoUrl": null,
  "notes": null,
  "fatherID": 3,
  "motherID": 4,
  "cityID": 1,
  "familyID": 1
}
```

**Response:** `201 Created`
```json
{
  "personID": 7,
  "lastName": "Dupont",
  "firstName": "Alexandre",
  ...
}
```

**Headers:**
```
Location: /api/persons/7
```

---

#### `PUT /persons/{id}`

Met à jour une personne existante. 🔒 **Authentification requise**

**Parameters:**
- `id` (path) - ID de la personne

**Request Body:**
```json
{
  "personID": 3,
  "lastName": "Dupont",
  "firstName": "Pierre",
  "activity": "Ingénieur Senior",
  ...
}
```

**Response:** `204 No Content`

**Errors:**
- `400 Bad Request` - ID ne correspond pas
- `404 Not Found` - Personne non trouvée

---

#### `DELETE /persons/{id}`

Supprime une personne. 🔒 **Authentification requise**

**Parameters:**
- `id` (path) - ID de la personne

**Response:** `204 No Content`

**Errors:**
- `404 Not Found` - Personne non trouvée

---

## Codes de Statut HTTP

| Code | Signification |
|------|---------------|
| 200 | OK - Requête réussie |
| 201 | Created - Ressource créée |
| 204 | No Content - Succès sans contenu à retourner |
| 400 | Bad Request - Données invalides |
| 401 | Unauthorized - Authentification requise ou invalide |
| 404 | Not Found - Ressource non trouvée |
| 500 | Internal Server Error - Erreur serveur |

---

## Modèles de Données

### Person
```typescript
{
  personID: number;
  lastName: string;
  firstName: string;
  birthday?: string;
  email?: string;
  sex: string; // "M" ou "F"
  activity?: string;
  alive: boolean;
  deathDate?: string;
  photoUrl?: string;
  notes?: string;
  fatherID?: number;
  motherID?: number;
  cityID: number;
  familyID: number;
}
```

### City
```typescript
{
  cityID: number;
  name: string;
  countryName: string;
}
```

### Family
```typescript
{
  familyID: number;
  familyName: string;
  description?: string;
  createdDate: string;
}
```

### Wedding
```typescript
{
  weddingID: number;
  manID: number;
  womanID: number;
  weddingDate: string;
  divorceDate?: string;
  isActive: boolean;
  location?: string;
  notes?: string;
}
```

---

## Exemples d'Utilisation

### JavaScript/TypeScript (avec fetch)

```typescript
// Login
const login = async (username: string, password: string) => {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userName: username, password })
  });
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data;
};

// Get all persons
const getPersons = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/persons', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};
```

### cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userName":"pierre.dupont","password":"password123"}'

# Get persons (avec token)
curl -X GET http://localhost:5000/api/persons \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## Documentation Interactive

Swagger UI est disponible en mode développement :

```
http://localhost:5000/swagger
```
