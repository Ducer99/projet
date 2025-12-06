# 📸 Module Albums Photos - Guide Complet

## ✅ Ce qui a été créé

### 🗄️ Base de données (PostgreSQL)

**6 tables créées** :
1. **Album** - Albums photos des familles
2. **Photo** - Photos individuelles dans les albums
3. **PhotoPerson** - Tagging des personnes sur les photos
4. **AlbumComment** - Commentaires sur les albums
5. **PhotoLike** - Likes sur les photos
6. **AlbumPermission** - Permissions granulaires pour albums privés

**2 vues SQL** :
- `AlbumStats` - Statistiques des albums (nombre photos, tags, commentaires, likes)
- `PhotoDetails` - Détails complets des photos avec métadonnées

### 🔧 Backend (ASP.NET Core 9.0)

**6 modèles C#** :
- `Album.cs`
- `Photo.cs`
- `PhotoPerson.cs`
- `AlbumComment.cs`
- `PhotoLike.cs`
- `AlbumPermission.cs`

**2 contrôleurs API REST** :

#### `AlbumsController`
- `GET /api/albums` - Liste tous les albums de la famille
- `GET /api/albums/{id}` - Détails d'un album avec photos et commentaires
- `POST /api/albums` - Créer un nouvel album
- `PUT /api/albums/{id}` - Modifier un album
- `DELETE /api/albums/{id}` - Supprimer un album
- `POST /api/albums/{id}/comments` - Ajouter un commentaire
- `GET /api/albums/stats` - Statistiques globales (total albums, photos, commentaires, likes)

#### `PhotosController`
- `POST /api/photos` - Upload une nouvelle photo
- `PUT /api/photos/{id}` - Modifier les métadonnées d'une photo
- `DELETE /api/photos/{id}` - Supprimer une photo
- `POST /api/photos/{id}/tag` - Taguer une personne sur une photo
- `DELETE /api/photos/{photoId}/tag/{personId}` - Retirer un tag
- `POST /api/photos/{id}/like` - Liker/unliker une photo (toggle)
- `GET /api/photos/person/{personId}` - Toutes les photos d'une personne

**Configuration EF Core** :
- Relations configurées dans `FamilyTreeContext.cs`
- Cascade delete pour photos, tags, commentaires, likes
- Indexes pour optimisation des requêtes

### 📊 Dashboard intégré

**Statistiques mises à jour** :
- Nombre réel de photos (au lieu de 0)
- Les statistiques du dashboard (`GET /api/auth/family-stats`) affichent maintenant le vrai nombre de photos de la famille

---

## 🎨 Frontend à créer (React + TypeScript)

### Pages principales

#### 1. `/albums` - Liste des albums
**Composant** : `AlbumsList.tsx`

**Fonctionnalités** :
- Grille d'albums avec vignettes (cover photo)
- Affichage : Titre, nombre de photos, date de création
- Filtres : Tous / Mes albums / Albums récents
- Bouton "Nouvel album"
- Responsive : grid 1-2-3 colonnes (mobile-tablet-desktop)

**Design** :
```tsx
<Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}>
  {albums.map(album => (
    <Box 
      key={album.albumID}
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
      cursor="pointer"
      onClick={() => navigate(`/albums/${album.albumID}`)}
      _hover={{ transform: 'translateY(-4px)', shadow: 'xl' }}
      transition="all 0.3s"
    >
      <Image 
        src={album.coverPhotoUrl || '/placeholder.jpg'}
        alt={album.title}
        h="200px"
        w="100%"
        objectFit="cover"
      />
      <Box p={4}>
        <Heading size="md">{album.title}</Heading>
        <HStack mt={2} spacing={3}>
          <Badge>{album.photoCount} photos</Badge>
          <Text fontSize="sm" color="gray.500">
            {new Date(album.createdAt).toLocaleDateString('fr-FR')}
          </Text>
        </HStack>
      </Box>
    </Box>
  ))}
</Grid>
```

---

#### 2. `/albums/:id` - Détail d'un album
**Composant** : `AlbumDetail.tsx`

**Sections** :
1. **En-tête** : Titre, description, nombre de photos, boutons actions
2. **Galerie photos** : Grid responsive avec lightbox
3. **Commentaires** : Liste + formulaire d'ajout

**Fonctionnalités** :
- Galerie interactive avec zoom
- Click sur photo → Modal plein écran avec :
  - Navigation photo suivante/précédente (← →)
  - Affichage des personnes taguées (hover sur visage)
  - Bouton like
  - Infos (titre, description, date, lieu)
- Uploader de nouvelles photos (drag & drop)
- Modifier l'album (si propriétaire ou admin)

**Design Galerie** :
```tsx
<Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap={4}>
  {photos.map(photo => (
    <Box
      key={photo.photoID}
      position="relative"
      borderRadius="md"
      overflow="hidden"
      cursor="pointer"
      onClick={() => openLightbox(photo)}
      _hover={{ '& > .overlay': { opacity: 1 } }}
    >
      <Image src={photo.thumbnailUrl} alt={photo.title} />
      <Box
        className="overlay"
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="blackAlpha.600"
        opacity={0}
        transition="opacity 0.3s"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack color="white">
          <Icon as={FaHeart} />
          <Text fontSize="sm">{photo.likeCount} likes</Text>
        </VStack>
      </Box>
    </Box>
  ))}
</Grid>
```

---

#### 3. `/albums/new` - Créer un album
**Composant** : `AlbumForm.tsx`

**Champs** :
- Titre (obligatoire)
- Description
- Lié à un événement ? (select parmi les événements de la famille)
- Visibilité : Famille / Privé / Personnalisé
- Si personnalisé : sélection des membres autorisés

---

#### 4. `/albums/:id/upload` - Upload de photos
**Composant** : `PhotoUpload.tsx`

**Fonctionnalités** :
- Drag & drop multi-fichiers
- Preview avant upload
- Barre de progression (0-100%)
- Formulaire pour chaque photo :
  - Titre
  - Description
  - Date de prise
  - Lieu
  - Taguer des personnes (dropdown)
- Upload simultané (max 10 photos à la fois)

**Stack technique** :
```typescript
// Utiliser un service de stockage
// Option 1 : Base64 (simple mais limité à <5Mo)
// Option 2 : Azure Blob Storage (recommandé)
// Option 3 : AWS S3
// Option 4 : Cloudinary

const handleUpload = async (files: File[]) => {
  for (const file of files) {
    const formData = new FormData();
    formData.append('file', file);
    
    // Upload vers service cloud
    const uploadResponse = await uploadToCloud(formData);
    
    // Enregistrer dans la base
    await api.post('/photos', {
      albumID,
      url: uploadResponse.url,
      thumbnailUrl: uploadResponse.thumbnailUrl,
      title: photoData.title,
      dateTaken: photoData.date,
      fileSize: file.size,
      width: imageWidth,
      height: imageHeight
    });
  }
};
```

---

#### 5. Composants réutilisables

**`PhotoLightbox.tsx`** - Modal plein écran
- Swiper horizontal (react-swipeable)
- Affichage tags personnes
- Bouton like animé
- Informations photo (metadata)
- Boutons navigation + fermeture

**`PersonTag.tsx`** - Tag visuel sur photo
```tsx
<Box
  position="absolute"
  left={`${tag.positionX}%`}
  top={`${tag.positionY}%`}
  transform="translate(-50%, -50%)"
>
  <Tooltip label={tag.personName}>
    <Circle size="40px" bg="whiteAlpha.800" borderWidth={2} borderColor="blue.500">
      <Avatar size="sm" name={tag.personName} />
    </Circle>
  </Tooltip>
</Box>
```

**`CommentSection.tsx`** - Section commentaires
- Liste commentaires avec avatar auteur
- Formulaire ajout (textarea + bouton)
- Real-time (optionnel avec WebSocket)

---

## 🔐 Gestion des permissions

### Niveaux de visibilité

1. **`family`** (par défaut) : Tous les membres de la famille peuvent voir
2. **`private`** : Seul le créateur peut voir
3. **`custom`** : Permissions granulaires via `AlbumPermission`

### Matrice des droits

| Action | Créateur | Admin | Membre (family) | Membre (private) | Custom |
|--------|----------|-------|-----------------|------------------|--------|
| Voir album | ✅ | ✅ | ✅ | ❌ | Si permission |
| Ajouter photo | ✅ | ✅ | ✅ | ❌ | Si permission |
| Modifier album | ✅ | ✅ | ❌ | ❌ | ❌ |
| Supprimer album | ✅ | ✅ | ❌ | ❌ | ❌ |
| Commenter | ✅ | ✅ | ✅ | ❌ | Si permission |
| Liker photo | ✅ | ✅ | ✅ | ❌ | Si permission |
| Taguer personne | ✅ | ✅ | ✅ | ❌ | Si permission |

---

## 📱 UX Moderne (Don Norman + Nielsen)

### Principes appliqués

**1. Affordance** 
- Boutons visuellement cliquables (élévation, couleur)
- Icons intuitifs (FaCamera pour photo, FaHeart pour like)
- Feedback hover (transformation, shadow)

**2. Feedback immédiat**
- Upload : Progress bar + animation check vert
- Like : Animation cœur qui bat
- Tag : Point lumineux qui pulse

**3. Reconnaissance > Rappel**
- Avatars des personnes taguées visibles directement
- Preview photos avant upload
- Breadcrumbs pour navigation

**4. Esthétique & Émotion**
- Effet Polaroid autour des photos
- Dates en format lisible ("Mai 1998, Mariage à Douala")
- Transitions fluides (fade, slide, scale)
- Palette cohérente (orange.500, blue.500, white, gray)

**5. Consistance**
- Même design pattern que le reste de l'app
- Chakra UI pour uniformité
- Icons React Icons partout

---

## 🚀 Prochaines étapes

### Étape 1 : Frontend de base
1. Créer `AlbumsList.tsx`
2. Créer `AlbumDetail.tsx`
3. Créer `AlbumForm.tsx`
4. Ajouter routes dans `App.tsx`

### Étape 2 : Upload photos
1. Choisir service de stockage (Azure Blob / S3 / Cloudinary)
2. Créer `PhotoUpload.tsx` avec drag & drop
3. Implémenter preview et metadata

### Étape 3 : Galerie interactive
1. Créer `PhotoLightbox.tsx`
2. Intégrer swiper horizontal
3. Système de tags visuels

### Étape 4 : Features sociales
1. Système de likes avec animation
2. Commentaires avec avatars
3. Notifications (optionnel)

### Étape 5 : Optimisations
1. Lazy loading images
2. Thumbnails optimisées (WebP)
3. Infinite scroll sur liste albums
4. Cache côté client (React Query)

---

## 📦 Dépendances Frontend à installer

```bash
npm install --save react-dropzone        # Drag & drop upload
npm install --save react-image-lightbox  # Lightbox photos
npm install --save react-swipeable       # Swipe horizontal
npm install --save @chakra-ui/react      # Déjà installé
npm install --save framer-motion         # Animations
npm install --save react-icons           # Déjà installé
```

---

## 🧪 Tests recommandés

### Backend
- Upload photo > 10Mo → doit rejeter
- Tag personne inexistante → 404
- Supprimer album en tant que membre → 403 Forbidden
- Like deux fois → toggle (unlike)

### Frontend
- Upload 20 photos simultanément → performance ?
- Lightbox sur mobile → swipe left/right ?
- Tags sur petits écrans → lisibilité ?

---

## 💡 Bonus IA (Phase 2)

### Face Detection (Azure Vision API)
```typescript
const detectFaces = async (photoUrl: string) => {
  const response = await fetch('https://westeurope.api.cognitive.microsoft.com/vision/v3.2/detect', {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': process.env.AZURE_VISION_KEY!,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url: photoUrl })
  });
  
  const faces = await response.json();
  return faces.map(face => ({
    x: face.faceRectangle.left / imageWidth * 100,
    y: face.faceRectangle.top / imageHeight * 100
  }));
};
```

### Auto-suggest personnes
- Comparer visages détectés avec photos existantes
- Suggérer : "On dirait Paul, voulez-vous le taguer ?"

---

## ✅ Résumé

**Backend** : ✅ Complet (6 tables, 2 contrôleurs, 15 endpoints)  
**Base de données** : ✅ Migration exécutée  
**Frontend** : ⏳ À créer (5 composants principaux)  
**Statistiques Dashboard** : ✅ Intégré (photos réelles comptées)

**Prêt pour développement frontend !** 🎨

Voulez-vous que je commence par créer le frontend (`AlbumsList` et `AlbumDetail`) ? 🚀
