# 🚀 COMMENT PARTAGER AVEC VOS AMIS - EN 3 ÉTAPES

## ⚡ Version Express (5 minutes)

### 1️⃣ Lancer l'application

```bash
./launch-for-testing.sh
```

**OU** manuellement (3 terminaux) :
```bash
# Terminal 1 : Backend
cd backend && dotnet run

# Terminal 2 : Frontend  
cd frontend && npm run dev

# Terminal 3 : Ngrok (exposer sur Internet)
ngrok http 3000
```

---

### 2️⃣ Configurer l'accès externe

**Copier l'URL ngrok** affichée (ex: `https://abc123.ngrok-free.app`)

**Ouvrir** `backend/Program.cs` et ajouter cette URL :

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins(
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "https://abc123.ngrok-free.app" // ← AJOUTEZ VOTRE URL ICI
        )
        .AllowCredentials()
        .AllowAnyMethod()
        .AllowAnyHeader();
    });
});
```

**Redémarrer** le backend (Ctrl+C puis `dotnet run`)

---

### 3️⃣ Envoyer le message à vos amis

**Copier-coller ce message** (remplacez les parties entre crochets) :

```
Salut ! 👋

J'ai besoin de ton aide pour tester mon appli d'arbre généalogique 🌳

🔗 Lien : https://[VOTRE_URL_NGROK].ngrok-free.app

⏱️ Temps : 15-20 minutes max

🎯 Ce que je teste :
✅ Inscription (email + mot de passe)
✅ Création de profil
✅ Ajout de membres de famille
✅ Arbre généalogique interactif
✅ Changement de langue (FR ↔️ EN)

💬 Dis-moi :
- Les bugs que tu trouves
- Ce qui est compliqué
- Ce qui te plaît / te plaît pas
- Tes idées d'amélioration

📧 Retour par : [Email/Message/WhatsApp]

Merci d'avance ! 🙏
[Ton prénom]
```

---

## ✅ C'EST TOUT !

Vos amis peuvent maintenant tester l'application et vous faire leurs retours.

---

## 📝 Guide détaillé pour testeurs (optionnel)

Si vos amis veulent un guide plus complet, partagez-leur : **GUIDE_TEST_UTILISATEURS.md**

---

## ⚠️ Important à savoir

### Durée du tunnel ngrok
- **Gratuit** : 2 heures max
- **Après expiration** : Relancez ngrok, nouvelle URL, renvoyez aux testeurs

### Support pendant les tests
- Soyez **disponible** pour répondre aux questions
- Surveillez les **logs** (backend.log, frontend.log)
- **Notez** tous les retours

---

## 🐛 Si ça ne marche pas

### "L'URL ne charge pas"
1. Vérifier que backend + frontend + ngrok sont lancés
2. Vérifier CORS dans Program.cs
3. Redémarrer le backend

### "Erreur CORS"
- Vérifier que l'URL ngrok est bien dans Program.cs
- Redémarrer le backend après modification
- Vider le cache navigateur (Ctrl+Shift+R)

### "Je ne vois pas l'URL ngrok"
- Ouvrir http://localhost:4040 dans votre navigateur
- L'URL est visible dans l'interface web

---

## 🎯 Objectif

Obtenir **5-10 retours** de testeurs avec :
- Bugs trouvés
- Difficultés rencontrées
- Avis général (positif/négatif)
- Suggestions d'amélioration

---

## 📊 Suivi simple

Créez un tableau pour suivre :

| Prénom | Envoyé | Testé | Retour reçu |
|--------|--------|-------|-------------|
| Alice  | ✅ 07/12 | ✅ 08/12 | ✅ Email |
| Bob    | ✅ 07/12 | ⏳ | ⏳ |
| Charlie | ✅ 07/12 | ✅ 07/12 | ✅ WhatsApp |

---

## 🙏 Après les tests

1. **Remerciez** tous les testeurs
2. **Compilez** tous les retours
3. **Priorisez** les bugs (Critique > Important > Mineur)
4. **Corrigez** et **améliorez**
5. **Partagez** les améliorations avec eux

---

## 💡 Conseils

- **Mix de profils** : Amis tech + non-tech
- **Mix d'appareils** : Desktop + Mobile
- **Soyez ouvert** : Tous les retours sont bons à prendre
- **Soyez réactif** : Répondez vite aux questions

---

**C'est parti ! Bonne chance avec vos tests ! 🚀**

---

## 📚 Fichiers complets (si besoin de plus de détails)

- `README_TESTS_PACKAGE.md` : Vue d'ensemble complète
- `GUIDE_TEST_UTILISATEURS.md` : Guide détaillé pour testeurs
- `TEMPLATES_MESSAGES_TESTEURS.md` : Autres templates de messages
- `DEPLOIEMENT_TESTS_EXTERNES.md` : Guide technique complet
- `CHECKLIST_PRET_POUR_TESTS.md` : Checklist exhaustive

**Mais pour commencer, ce fichier suffit ! 😊**
