# 🎯 SESSION 1 - Migration i18n Boutons Dashboard

**Date :** 9 octobre 2025  
**Objectif :** Traduire les 4 pages accessibles depuis le Dashboard

---

## 📝 Pages à migrer

### 1. PersonsList.tsx (Liste des membres)
**Textes à traduire :**
- Titre : "Membres de la Famille"
- Bouton : "Mon Profil"
- Bouton : "Ajouter un membre"
- Bouton : "Retour"
- Message : "Aucune personne trouvée"
- Texte : "X membre(s) dans la famille"
- Colonnes tableau : "ID", "Nom", "Prénom", "Sexe", "Activité", "Ville", "Action"
- Bouton : "Voir"
- Bouton : "Modifier"
- Tooltip : "Admin", "Vous avez créé ce membre", "Votre profil"
- Tooltip : "Vous ne pouvez pas modifier ce membre"
- Badge : "Lecture seule"

### 2. EventsCalendar.tsx (Calendrier événements)
**Textes à traduire :**
- Titre : "Calendrier des Événements"
- Bouton : "Ajouter un événement"
- Labels types : "Naissances", "Mariages", "Décès", "Anniversaires", "Fêtes", "Autres"
- Mois : "Janvier", "Février", "Mars", etc.
- Jours : "Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"
- Message : "Aucun événement"
- Bouton : "Modifier", "Supprimer"
- Message : "Erreur lors du chargement des événements"

### 3. FamilyTree.tsx (Arbre généalogique)
**Textes à traduire :**
- À vérifier (besoin de lire le fichier complet)

### 4. WeddingsList.tsx (Liste mariages)
**Textes à traduire :**
- Titre : "Mariages de la famille"
- Bouton : "Créer un mariage"
- Bouton : "Retour"
- Colonnes : "Homme", "Femme", "Famille patrilinéaire", "Date", "Statut", "Unions", "Actions"
- Statuts : "Actif", "Divorcé", "Veuvage"
- Message : "Aucun mariage enregistré"
- Bouton : "Voir"

---

## 🔑 Nouvelles clés de traduction à ajouter

### members (fr.json / en.json)
```json
{
  "members": {
    "title": "Membres de la Famille" / "Family Members",
    "myProfile": "Mon Profil" / "My Profile",
    "addMember": "Ajouter un membre" / "Add a member",
    "back": "Retour" / "Back",
    "noPersons": "Aucune personne trouvée" / "No persons found",
    "memberCount": "{{count}} membre(s) dans la famille" / "{{count}} member(s) in the family",
    "columns": {
      "id": "ID" / "ID",
      "lastName": "Nom" / "Last Name",
      "firstName": "Prénom" / "First Name",
      "sex": "Sexe" / "Sex",
      "activity": "Activité" / "Activity",
      "city": "Ville" / "City",
      "action": "Action" / "Action"
    },
    "view": "Voir" / "View",
    "edit": "Modifier" / "Edit",
    "readOnly": "Lecture seule" / "Read only",
    "tooltips": {
      "admin": "Admin" / "Admin",
      "creator": "Vous avez créé ce membre" / "You created this member",
      "yourProfile": "Votre profil" / "Your profile",
      "cannotEdit": "Vous ne pouvez pas modifier ce membre" / "You cannot edit this member"
    }
  }
}
```

### events (fr.json / en.json)
```json
{
  "events": {
    "title": "Calendrier des Événements" / "Events Calendar",
    "addEvent": "Ajouter un événement" / "Add an event",
    "noEvents": "Aucun événement" / "No events",
    "modify": "Modifier" / "Edit",
    "delete": "Supprimer" / "Delete",
    "loadingError": "Impossible de charger les événements" / "Unable to load events",
    "types": {
      "birth": "Naissances" / "Births",
      "marriage": "Mariages" / "Weddings",
      "death": "Décès" / "Deaths",
      "birthday": "Anniversaires" / "Birthdays",
      "party": "Fêtes" / "Celebrations",
      "other": "Autres" / "Other"
    },
    "months": {
      "january": "Janvier" / "January",
      "february": "Février" / "February",
      "march": "Mars" / "March",
      "april": "Avril" / "April",
      "may": "Mai" / "May",
      "june": "Juin" / "June",
      "july": "Juillet" / "July",
      "august": "Août" / "August",
      "september": "Septembre" / "September",
      "october": "Octobre" / "October",
      "november": "Novembre" / "November",
      "december": "Décembre" / "December"
    },
    "days": {
      "sun": "Dim" / "Sun",
      "mon": "Lun" / "Mon",
      "tue": "Mar" / "Tue",
      "wed": "Mer" / "Wed",
      "thu": "Jeu" / "Thu",
      "fri": "Ven" / "Fri",
      "sat": "Sam" / "Sat"
    }
  }
}
```

### weddings (fr.json / en.json)
```json
{
  "weddings": {
    "title": "Mariages de la famille" / "Family Weddings",
    "create": "Créer un mariage" / "Create a wedding",
    "back": "Retour" / "Back",
    "noWeddings": "Aucun mariage enregistré" / "No weddings registered",
    "columns": {
      "man": "Homme" / "Man",
      "woman": "Femme" / "Woman",
      "patrilinealFamily": "Famille patrilinéaire" / "Patrilineal Family",
      "date": "Date" / "Date",
      "status": "Statut" / "Status",
      "unions": "Unions" / "Unions",
      "actions": "Actions" / "Actions"
    },
    "status": {
      "active": "Actif" / "Active",
      "divorced": "Divorcé" / "Divorced",
      "widowed": "Veuvage" / "Widowed"
    },
    "view": "Voir" / "View"
  }
}
```

### common (ajouts)
```json
{
  "common": {
    "back": "Retour" / "Back",
    "view": "Voir" / "View",
    "edit": "Modifier" / "Edit",
    "delete": "Supprimer" / "Delete",
    "add": "Ajouter" / "Add",
    "create": "Créer" / "Create",
    "noData": "Aucune donnée" / "No data"
  }
}
```

---

## 📊 Résumé des clés

| Section | Clés FR | Clés EN | Total |
|---------|---------|---------|-------|
| **members** | 15 | 15 | 30 |
| **events** | 28 | 28 | 56 |
| **weddings** | 14 | 14 | 28 |
| **common** (ajouts) | 7 | 7 | 14 |
| **TOTAL** | 64 | 64 | **128 clés** |

---

## ✅ Plan d'exécution

### Étape 1 : Ajouter les clés de traduction
1. Ajouter à `fr.json` : 64 nouvelles clés
2. Ajouter à `en.json` : 64 nouvelles clés

### Étape 2 : Migrer PersonsList.tsx
1. Ajouter `const { t } = useTranslation();`
2. Remplacer tous les textes statiques
3. Vérifier la compilation

### Étape 3 : Migrer EventsCalendar.tsx
1. Ajouter `const { t } = useTranslation();`
2. Remplacer les mois et jours par des arrays traduits
3. Remplacer tous les textes statiques
4. Vérifier la compilation

### Étape 4 : Migrer WeddingsList.tsx
1. Ajouter `const { t } = useTranslation();`
2. Remplacer tous les textes statiques
3. Vérifier la compilation

### Étape 5 : Migrer FamilyTree.tsx
1. Lire le fichier complet
2. Identifier les textes
3. Migrer
4. Vérifier la compilation

---

## 🚀 Prêt à commencer

**Temps estimé :** 30-40 minutes

**Ordre :**
1. Ajouter clés à fr.json (5 min)
2. Ajouter clés à en.json (5 min)
3. PersonsList.tsx (8 min)
4. EventsCalendar.tsx (10 min)
5. WeddingsList.tsx (7 min)
6. FamilyTree.tsx (5 min)

**Résultat attendu :**
- ✅ 4 pages 100% bilingues
- ✅ Navigation Dashboard → Pages fonctionnelle en EN/FR
- ✅ 0 erreur TypeScript

---

**Commencer maintenant ? 🚀**
