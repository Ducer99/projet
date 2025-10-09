# 🕊️ Gestion des Commémorations (Personnes Décédées)

## ❓ Question : Comment gérer les anniversaires des personnes décédées ?

### 📊 Options Proposées

---

## Option 1 : Commémoration à la Date de Naissance (Recommandée) ⭐

### Principe
- **Garder l'anniversaire de NAISSANCE** même après le décès
- **Changer uniquement la description** pour un message de mémoire

### Messages par Relation
```
👨 Père/Grand-père : "🕊️ En mémoire de Papa [Prénom]"
👩 Mère/Grand-mère : "🕊️ En mémoire de Maman [Prénom]"
👶 Enfant/Petit-enfant : "🕊️ En mémoire de [Prénom]"
👤 Autre : "🕊️ En mémoire de [Prénom] [Nom]"
```

### Avantages ✅
- **Universel** : Fonctionne pour tous (enfants, adultes)
- **Respectueux** : On célèbre la vie, pas la mort
- **Simple** : Un seul événement récurrent (naissance)
- **Tradition** : Correspond aux usages (on célèbre les naissances des défunts)

### Exemples
| Personne | Vivant | Décédé |
|----------|--------|--------|
| Jean Dupont (père) | 🎂 Joyeux anniversaire Jean ! | 🕊️ En mémoire de Papa Jean |
| Marie Martin (mère) | 🎂 Joyeux anniversaire Marie ! | 🕊️ En mémoire de Maman Marie |
| Lucas (enfant 5 ans) | 🎂 Joyeux anniversaire Lucas ! | 🕊️ En mémoire de Lucas |

---

## Option 2 : Commémoration à la Date de Décès

### Principe
- **Supprimer l'anniversaire de naissance**
- **Créer un événement récurrent à la date de décès**

### Messages
```
👨 Père : "🕊️ Repose en paix Papa [Prénom]"
👩 Mère : "🕊️ Repose en paix Maman [Prénom]"
👶 Enfant : "🕊️ En mémoire de [Prénom]"
```

### Inconvénients ❌
- **Problème pour les enfants** : "Repose en paix Papa" bizarre pour un enfant de 5 ans
- **Complexe** : Deux types d'événements à gérer
- **Moins traditionnel** : On commémore rarement la date de décès chaque année

---

## Option 3 : Mixte (Les Deux)

### Principe
- **Garder l'anniversaire de naissance** avec message de mémoire
- **Ajouter un événement unique** à la date de décès (non récurrent)

### Événements
```
📅 Date de naissance (récurrent) : "🕊️ En mémoire de [Prénom]"
📅 Date de décès (unique) : "🕊️ Décès de [Prénom] [Nom]"
```

### Avantages ✅
- Historique complet
- Double commémoration

### Inconvénients ❌
- Plus complexe
- Peut être lourd émotionnellement

---

## 🎯 Recommandation : **Option 1**

### Logique Proposée

```typescript
Si personne.Alive === false :
  1. Garder l'événement anniversaire de NAISSANCE
  2. Changer la description selon la relation :
     
     - Si génération supérieure (parent/grand-parent) :
       → "🕊️ En mémoire de Papa/Maman [Prénom]"
     
     - Si même génération ou inférieure (enfant/frère/sœur) :
       → "🕊️ En mémoire de [Prénom]"
     
     - Si relation inconnue :
       → "🕊️ En mémoire de [Prénom] [Nom]"
```

### Code Backend
```csharp
// Lors de la création/mise à jour d'anniversaire
if (person.Alive == false)
{
    // Déterminer la relation (parent, enfant, autre)
    var relation = DetermineRelation(person, currentUser);
    
    var description = relation switch
    {
        "father" => $"🕊️ En mémoire de Papa {person.FirstName}",
        "mother" => $"🕊️ En mémoire de Maman {person.FirstName}",
        "grandfather" => $"🕊️ En mémoire de Grand-père {person.FirstName}",
        "grandmother" => $"🕊️ En mémoire de Grand-mère {person.FirstName}",
        _ => $"🕊️ En mémoire de {person.FirstName}"
    };
    
    birthdayEvent.Description = description;
}
else
{
    birthdayEvent.Description = $"🎂 Joyeux anniversaire {person.FirstName} !";
}
```

---

## 🔄 Cas d'Usage

### Scénario 1 : Grand-père décédé
```
Personne : Pierre Dupont (grand-père)
Naissance : 15 mars 1940
Décès : 20 août 2020
Alive : false

Événement anniversaire (15 mars, récurrent) :
- Titre : "Anniversaire de Pierre Dupont"
- Description : "🕊️ En mémoire de Grand-père Pierre"
- Visible chaque année le 15 mars
```

### Scénario 2 : Enfant décédé (difficile)
```
Personne : Lucas Dupont (enfant)
Naissance : 10 mai 2020
Décès : 15 juillet 2023 (3 ans)
Alive : false

Événement anniversaire (10 mai, récurrent) :
- Titre : "Anniversaire de Lucas Dupont"
- Description : "🕊️ En mémoire de Lucas"
- Visible chaque année le 10 mai
```

### Scénario 3 : Mère décédée
```
Personne : Marie Martin (mère)
Naissance : 20 juin 1965
Décès : 10 janvier 2022
Alive : false

Événement anniversaire (20 juin, récurrent) :
- Titre : "Anniversaire de Marie Martin"
- Description : "🕊️ En mémoire de Maman Marie"
- Visible chaque année le 20 juin
```

---

## 📝 Messages Recommandés

### Par Type de Relation

| Relation | Message |
|----------|---------|
| 👨 Père | 🕊️ En mémoire de Papa [Prénom] |
| 👩 Mère | 🕊️ En mémoire de Maman [Prénom] |
| 👴 Grand-père | 🕊️ En mémoire de Grand-père [Prénom] |
| 👵 Grand-mère | 🕊️ En mémoire de Grand-mère [Prénom] |
| 👶 Enfant | 🕊️ En mémoire de [Prénom] |
| 👦 Frère/Sœur | 🕊️ En mémoire de [Prénom] |
| 👤 Autre | 🕊️ En mémoire de [Prénom] [Nom] |

### Messages Alternatifs (Plus Doux)
```
🕊️ [Prénom] aurait eu [âge] ans aujourd'hui
🕊️ Pensée pour [Prénom]
🕊️ À la mémoire de [Prénom]
💙 [Prénom] reste dans nos cœurs
⭐ [Prénom], toujours parmi nous
```

---

## ✅ Décision à Prendre

**Quelle option préférez-vous ?**

1. ⭐ **Option 1** : Commémoration à la date de naissance (universel)
2. **Option 2** : Commémoration à la date de décès (moins adapté pour enfants)
3. **Option 3** : Les deux (plus complexe)

**Quel message pour les enfants décédés ?**
- "🕊️ En mémoire de [Prénom]" (simple, respectueux)
- "🕊️ [Prénom] reste dans nos cœurs" (chaleureux)
- "⭐ [Prénom], toujours parmi nous" (poétique)

---

## 🚀 Implémentation

Une fois la décision prise, je peux implémenter :

1. **Backend** : Logique de détermination de relation
2. **Backend** : Génération des descriptions selon le statut (vivant/décédé)
3. **Base de données** : Script de mise à jour des événements existants
4. **Frontend** : Affichage différencié (couleur, icône)

**Dites-moi ce que vous préférez et je l'implémente ! 🙏**
