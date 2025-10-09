# 🌳 Documentation de l'Arbre Généalogique Interactif

## Vue d'ensemble

L'application offre maintenant une **visualisation interactive complète** de l'arbre généalogique familial avec support de la polygamie, plusieurs générations, et recherche intelligente.

## Fonctionnalités

### 🎯 Visualisation de l'arbre

#### 1. **Mode d'affichage**

Deux modes de visualisation :

- **Ma branche uniquement** (par défaut) :
  - L'utilisateur connecté
  - Ses parents et grands-parents
  - Ses conjoints (mariages multiples supportés)
  - Ses enfants et petits-enfants
  
- **Toute la famille** :
  - Visualisation complète de tous les membres
  - Toutes les générations et branches
  - Tous les mariages

#### 2. **Contrôles interactifs**

- **Zoom** : Boutons +/- pour zoomer/dézoomer
- **Pan** : Glisser-déposer pour naviguer
- **Reset** : Bouton de réinitialisation de la vue
- **Responsive** : Adapté à tous les écrans

### 👥 Affichage des personnes

Chaque personne est affichée avec :

- **Photo** (ou avatar par défaut)
- **Nom complet**
- **Âge** (calculé automatiquement si vivant)
- **Statut** : Vivant ou Décédé (✝)
- **Badge "Vous"** pour l'utilisateur connecté
- **Couleurs distinctives** :
  - Bleu pour les hommes
  - Rose pour les femmes
  - Violet pour les conjoints
  - Bordure verte pour l'utilisateur connecté

### 💕 Gestion des mariages

- **Mariages multiples** (polygamie) : Support complet
- **Symbole** : 💕 entre les conjoints
- **Informations** au survol :
  - Date de mariage
  - Statut (marié/divorcé)
  - Lieu

### 🔎 Moteur de recherche intelligent

Recherche par :
- **Nom** (prénom ou nom de famille)
- **Ville** de naissance
- **Activité/Profession**
- Recherche insensible à la casse

Les résultats sont affichés dans une zone dédiée au-dessus de l'arbre.

### 📊 Statistiques familiales

Affichage en temps réel :
- Nombre total de personnes
- Nombre de mariages
- Nombre de générations racines

## API Endpoints

### 1. Arbre complet

```
GET /api/familytree/full/{familyId}
```

Retourne toutes les personnes et mariages d'une famille.

**Réponse** :
```json
{
  "Persons": [...],
  "Weddings": [...]
}
```

### 2. Ma branche

```
GET /api/familytree/my-branch/{personId}
```

Retourne uniquement la branche de l'utilisateur (3 générations up + 2 down + conjoints).

### 3. Recherche

```
GET /api/familytree/search/{familyId}?query=...
```

Recherche dans les noms, villes, et activités.

### 4. Racines de l'arbre

```
GET /api/familytree/roots/{familyId}
```

Retourne les personnes sans parents (ancêtres racines).

### 5. Descendants

```
GET /api/familytree/descendants/{personId}
```

Retourne tous les descendants d'une personne avec leur génération.

## Utilisation

### 1. Accès depuis le Dashboard

Cliquez sur la carte **"🌳 Arbre Généalogique Interactif"** sur le dashboard.

### 2. Navigation

1. **Basculer entre les modes** :
   - Utilisez le switch "Ma branche / Toute la famille"

2. **Rechercher** :
   - Tapez dans la barre de recherche
   - Appuyez sur Entrée ou cliquez sur "Rechercher"
   - Les résultats s'affichent au-dessus de l'arbre

3. **Zoomer/Déplacer** :
   - Utilisez les boutons +/- pour zoomer
   - Cliquez et glissez pour déplacer la vue
   - Bouton ↺ pour réinitialiser

4. **Voir les détails** :
   - Survolez une personne pour voir ses informations complètes

### 3. Informations affichées

Au survol d'une personne :
- Nom complet
- Date de naissance
- Âge (si vivant)
- Ville de naissance
- Profession/Activité
- Date de décès (si applicable)

## Légende

| Couleur/Symbole | Signification |
|----------------|---------------|
| 💙 Fond bleu clair | Homme |
| 💗 Fond rose clair | Femme |
| 💜 Fond violet clair | Conjoint(e) |
| 🟢 Bordure verte | Vous |
| 💕 | Mariage |
| ✝ Badge rouge | Personne décédée |
| ✓ Badge vert | Personne vivante + âge |

## Génération automatique

**Fonctionnalité clé** : Tout enfant inscrit peut devenir parent à son tour !

Lorsqu'une personne est ajoutée comme enfant :
- Elle peut se créer un compte
- Elle peut ensuite se marier
- Elle peut avoir ses propres enfants
- Une nouvelle génération est créée automatiquement
- L'arbre s'étend dynamiquement

## Architecture technique

### Frontend

- **React** + TypeScript
- **Chakra UI** pour l'interface
- **react-zoom-pan-pinch** pour l'interactivité
- **Axios** pour les appels API

### Backend

- **ASP.NET Core 9.0**
- **Entity Framework Core**
- **PostgreSQL**
- Algorithme récursif de construction d'arbre
- Calcul automatique des générations

### Modèles de données

```csharp
Person {
  PersonID, FirstName, LastName, Sex,
  FatherID, MotherID, // Relations parentales
  Birthday, DeathDate, Alive,
  CityID, Activity, PhotoUrl
}

Wedding {
  WeddingID, ManID, WomanID,
  WeddingDate, DivorceDate, IsActive
}
```

## Performance

- **Chargement optimisé** avec Include() pour éviter les N+1 queries
- **Cache côté client** des données d'arbre
- **Rendu conditionnel** selon le mode (branche/complet)
- **Virtualisation** pour les grands arbres (TODO si nécessaire)

## Améliorations futures

- [ ] Export PDF de l'arbre
- [ ] Mode impression
- [ ] Filtres avancés (génération, âge, lieu)
- [ ] Statistiques démographiques
- [ ] Timeline historique
- [ ] Partage de branches spécifiques
- [ ] Annotations sur l'arbre
- [ ] Photos de mariage

## Support

Pour toute question ou problème :
1. Vérifiez que vous êtes connecté
2. Essayez de rafraîchir l'arbre
3. Consultez les logs du backend
4. Vérifiez la console du navigateur

---

**Version** : 1.0.0  
**Date** : Octobre 2025  
**Compatibilité** : Tous navigateurs modernes
