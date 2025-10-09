# 🎓 Analyse Structurale des Systèmes de Mariage
## _À la manière de Claude Lévi-Strauss_

> **« Les structures de la parenté ne sont pas des faits naturels,  
> mais des constructions symboliques qui organisent l'échange et la réciprocité. »**  
> — Claude Lévi-Strauss, _Les Structures élémentaires de la parenté_ (1949)

---

## 🧠 I. LA QUESTION POSÉE : Analyse Structurale

Tu me demandes d'analyser **deux problématiques** :

1. **Les unions à dates multiples** (coutumière, civile, religieuse)
2. **L'asymétrie de l'union** ("initiée par un homme")

En tant que Lévi-Strauss, je dois d'abord poser la question fondamentale :

> **Ces systèmes reflètent-ils une structure universelle,  
> ou sont-ils des variations culturelles d'un même principe ?**

---

## 📊 II. STRUCTURE ACTUELLE DU SYSTÈME

### Modèle de Données Observé

```
Person (PersonID, FamilyID, FatherID, MotherID)
       ↓
Wedding (WeddingID, ManID, WomanID, WeddingDate, DivorceDate)
       ↓
Family (FamilyID, FamilyName)
```

### Principes Structuraux Identifiés

1. **Filiation unilinéaire paternelle** (`FamilyID` = famille du père)
2. **Alliance asymétrique** (`ManID` ↔ `WomanID`, pas `Person1` ↔ `Person2`)
3. **Union monolithique** (une seule `WeddingDate`)
4. **Échange unilatéral** (la femme rejoint la famille de l'homme)

---

## 🌍 III. CONTEXTE ANTHROPOLOGIQUE

### A. Les Trois Types d'Unions (Afrique subsaharienne)

D'un point de vue **structuraliste**, ces trois unions ne sont **PAS identiques** :

| Type | Fonction Symbolique | Structure Sociale | Temporalité |
|------|---------------------|-------------------|-------------|
| **Coutumière** | Légitimation clanique | Alliance des lignages | Fondatrice |
| **Civile** | Reconnaissance étatique | Statut juridique individuel | Administrative |
| **Religieuse** | Sacralisation divine | Lien transcendant | Spirituelle |

➡️ **Chaque union a une fonction différente** dans la structure symbolique.

### B. Critique Lévi-Straussienne

> **« Un mariage n'est jamais une simple union de deux individus,  
> mais un échange entre deux groupes. »**

Dans ton système actuel :
- ❌ Une seule date → **Réduction temporelle** (perte de complexité)
- ❌ Une seule table `Wedding` → **Syncrétisme structurel** (confusion des ordres)
- ✅ `ManID`/`WomanID` → **Asymétrie reconnue** (structure patrilinéaire)

---

## 🔍 IV. PROPOSITION 1 : Les Unions Multiples

### Problème Structurel

**Question** : Peut-on avoir 3 dates pour 1 mariage ?

**Réponse lévi-straussienne** :  
Non, car ce ne sont pas **3 dates du même mariage**,  
mais **3 mariages de types différents** qui constituent **UNE alliance globale**.

### Solution Structurale

```
marriage (MarriageID, ManID, WomanID, FamilyID, Status)
    ↓
marriage_union (UnionID, MarriageID, UnionType, UnionDate, Location)
```

#### Justification Anthropologique

1. **Pluralité des ordres** : Coutume ≠ Civil ≠ Religieux
2. **Séquentialité temporelle** : Les unions se suivent selon un ordre logique
3. **Complétude progressive** : Le mariage n'est "complet" qu'après les 3 unions

#### Exemple Concret

```
Marriage #42 (Paul Ka + Léa Moukala → Famille KA)
  ├─ Union #1 : Coutumière (12 juin 2015, Village Mbalmayo)
  ├─ Union #2 : Civile (20 juillet 2016, Mairie de Yaoundé)
  └─ Union #3 : Religieuse (5 août 2017, Cathédrale de Douala)
```

### Avantage Structurel

- ✅ **Préserve la complexité** (3 ordres distincts)
- ✅ **Respecte la temporalité** (progression historique)
- ✅ **Permet l'incomplétude** (mariage coutumier sans mariage civil)

---

## ⚖️ V. PROPOSITION 2 : L'Asymétrie de l'Alliance

### Problème Posé

**Question** : Faut-il que "l'union soit initiée par un homme" ?

**Réponse lévi-straussienne** :  
Cette question confond **l'agent créateur** et **la structure de l'échange**.

### Distinction Fondamentale

#### 🔹 Qui crée l'enregistrement ? (Agent technique)
- Peut être l'homme, la femme, ou un tiers (admin, parent)
- **Pas de signification structurale**

#### 🔹 Quelle famille reçoit la femme ? (Structure symbolique)
- **Toujours la famille de l'homme** (dans un système patrilinéaire)
- **Signification structurale forte**

### Analyse Lévi-Straussienne

> **« L'échange des femmes est la forme primitive de la réciprocité. »**  
> — _Les Structures élémentaires de la parenté_

Dans un **système patrilinéaire** :
- La femme **quitte** son lignage d'origine (Famille MOUKALA)
- La femme **rejoint** le lignage de l'époux (Famille KA)
- Les enfants appartiennent au lignage du père (Famille KA)

➡️ **Ce n'est pas une question de "qui crée", mais de "qui reçoit"**.

### Solution Structurale

```sql
marriage (
    MarriageID,
    ManID,              -- L'homme (donneur de nom)
    WomanID,            -- La femme (rejoignant le lignage)
    PatrilinealFamilyID -- Famille du mari (structure de référence)
    CreatedBy           -- Qui a créé l'enregistrement (technique)
)
```

#### Distinction Importante

| Champ | Fonction | Ordre |
|-------|----------|-------|
| `ManID` / `WomanID` | Structure de l'alliance | **Symbolique** |
| `PatrilinealFamilyID` | Lignage de référence | **Structural** |
| `CreatedBy` | Agent technique | **Administratif** |

---

## 👥 VI. LE CAS DU "BEAU-FILS"

### Question

> "Un homme peut se trouver dans la famille de sa femme, en tant que beau-fils."

### Analyse Structurale

C'est une **confusion de perspective** !

#### 🔹 Perspective 1 : Lignage (Structure)
- Jean appartient à la **Famille KA** (lignage paternel)
- Marie appartient à la **Famille NDONG** (lignage paternel)
- Après mariage : **Famille KA absorbe Marie**
- Les enfants : **Famille KA** (filiation patrilinéaire)

#### 🔹 Perspective 2 : Parenté (Relation)
- Jean est **gendre** dans la Famille NDONG (relation par alliance)
- Marie est **bru** dans la Famille KA (relation par alliance)
- Mais aucun ne **change de lignage** !

### Solution Lévi-Straussienne

Il faut distinguer **deux types de relations** :

```
1. FILIATION (qui appartient à quel lignage ?)
   → Jean : Famille KA
   → Marie : Famille NDONG → Famille KA (par alliance)

2. ALLIANCE (qui est relié à qui par mariage ?)
   → Jean : "gendre de" Famille NDONG
   → Marie : "bru de" Famille KA
```

➡️ **Ne pas confondre appartenance structurale et relation sociale !**

---

## 🎯 VII. CRITIQUE DU SYSTÈME ACTUEL

### Problèmes Identifiés

| Problème | Type | Conséquence |
|----------|------|-------------|
| Une seule `WeddingDate` | **Réductionnisme** | Perte de la complexité culturelle |
| Pas de distinction Union Types | **Syncrétisme** | Confusion des ordres symboliques |
| `FamilyID` unique dans `Person` | **Simplification** | Impossible de représenter la double appartenance |
| Pas de notion de "gendre/bru" | **Lacune relationnelle** | Relations d'alliance invisibles |

### Conséquences Anthropologiques

1. **Invisibilisation des pratiques** : On ne peut pas voir qu'un couple a eu 3 cérémonies
2. **Rigidité structurale** : Une personne ne peut être que dans UNE famille
3. **Perte de réciprocité** : On ne voit pas que Jean est "fils de KA" ET "gendre de NDONG"

---

## ✅ VIII. RECOMMANDATIONS STRUCTURALES

### A. Pour les Unions Multiples

```sql
-- Table principale : Alliance entre deux lignages
CREATE TABLE marriage (
    marriage_id UUID PRIMARY KEY,
    man_id INTEGER REFERENCES person(person_id),
    woman_id INTEGER REFERENCES person(person_id),
    patrilineal_family_id INTEGER REFERENCES family(family_id), -- Famille du mari
    status VARCHAR(20), -- 'active', 'divorced', 'widowed'
    created_by INTEGER REFERENCES connexion(connexion_id),
    created_at TIMESTAMP
);

-- Table détaillée : Chaque type d'union
CREATE TABLE marriage_union (
    union_id UUID PRIMARY KEY,
    marriage_id UUID REFERENCES marriage(marriage_id),
    union_type VARCHAR(20), -- 'coutumière', 'civile', 'religieuse'
    union_date DATE NOT NULL,
    location TEXT,
    notes TEXT,
    validated BOOLEAN DEFAULT FALSE
);
```

### B. Pour la Double Appartenance

```sql
-- Table Person : Double lignage
ALTER TABLE person
ADD COLUMN paternal_family_id INTEGER REFERENCES family(family_id),
ADD COLUMN maternal_family_id INTEGER REFERENCES family(family_id);

-- Table Relations d'Alliance
CREATE TABLE family_relation (
    relation_id UUID PRIMARY KEY,
    person_id INTEGER REFERENCES person(person_id),
    family_id INTEGER REFERENCES family(family_id),
    relation_type VARCHAR(20), -- 'member', 'gendre', 'bru', 'beau-père', etc.
    created_at TIMESTAMP
);
```

### C. Logique d'Affichage

```typescript
// Exemple : Affichage dans l'arbre généalogique
interface PersonInTree {
  personID: number;
  name: string;
  paternalFamily: Family;    // Lignage paternel (structure)
  maternalFamily?: Family;   // Lignage maternel (si différent)
  relationsAsGendre: Family[]; // Familles où il est gendre
  relationsAsBru: Family[];    // Familles où elle est bru
}
```

---

## 🎓 IX. CONCLUSION LÉVI-STRAUSSIENNE

### Principe Fondamental

> **« Les systèmes de parenté sont des systèmes d'échange symbolique,  
> régis par des règles de réciprocité et d'interdits. »**

### Application à ton Système

1. **Les unions multiples** ne sont pas des "dates différentes d'un même événement",  
   mais des **étapes distinctes d'une alliance progressive** entre deux lignages.

2. **L'asymétrie homme/femme** n'est pas une question de "qui crée l'enregistrement",  
   mais une **structure patrilinéaire** où la femme rejoint le lignage de l'homme.

3. **Le "beau-fils"** n'est pas un membre de la famille de sa femme,  
   mais une **relation d'alliance** qui créé une réciprocité entre les lignages.

### Réponse Finale

| Question | Réponse Structurale |
|----------|---------------------|
| **Plusieurs dates de mariage ?** | ✅ OUI – Créer `marriage_unions` (3 ordres distincts) |
| **"Initié par un homme" ?** | ⚠️ CLARIFIER – Distinguer agent créateur ≠ structure patrilinéaire |
| **Beau-fils dans famille femme ?** | ✅ OUI – Via table `family_relation` (relation d'alliance) |

---

## 🌟 X. PROPOSITION FINALE

### Modèle Structuré Complet

```
Family (FamilyID, FamilyName, LineageType)
    ↓
Person (PersonID, PaternalFamilyID, MaternalFamilyID)
    ↓
Marriage (MarriageID, ManID, WomanID, PatrilinealFamilyID, Status)
    ↓
MarriageUnion (UnionID, MarriageID, UnionType, UnionDate, Location)
    ↓
FamilyRelation (RelationID, PersonID, FamilyID, RelationType)
```

### Avantages

✅ **Complexité culturelle préservée** (3 types d'unions)  
✅ **Structure patrilinéaire respectée** (FamilyID = lignage du père)  
✅ **Double appartenance possible** (PaternalFamily + MaternalFamily)  
✅ **Relations d'alliance visibles** (gendre, bru, beau-père)  
✅ **Flexibilité temporelle** (unions progressives)

---

## 📖 Références Théoriques

1. **Lévi-Strauss, C.** (1949). _Les Structures élémentaires de la parenté_
2. **Radcliffe-Brown, A.R.** (1950). _Introduction to African Systems of Kinship and Marriage_
3. **Augé, M.** (1975). _Théorie des pouvoirs et idéologie_
4. **Godelier, M.** (2004). _Métamorphoses de la parenté_

---

## 🎯 Verdict Lévi-Straussien

> **« Ton système actuel est structurellement cohérent  
> pour une société patrilinéaire simple.  
> Mais pour refléter la complexité des alliances africaines,  
> il faut distinguer :  
> 1. Les ordres symboliques (coutume, civil, religieux),  
> 2. Les structures de filiation (lignage paternel/maternel),  
> 3. Les relations d'alliance (gendre, bru, beau-parent). »**

**Adopte la table `marriage_unions` pour les unions multiples.**  
**Garde la structure patrilinéaire pour la cohérence généalogique.**  
**Ajoute `family_relation` pour les relations d'alliance.**

---

_Analyse réalisée le 8 octobre 2025_  
_Par Claude Lévi-Strauss (via GitHub Copilot) 🎓_
