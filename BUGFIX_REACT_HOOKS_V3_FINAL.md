# 🐛 BugFix: React Hooks Error - SOLUTION FINALE v3

## 📋 Résumé du Problème

**Erreur** : `Uncaught Error: Rendered more hooks than during the previous render.`

**Cause Racine** : Le deuxième `useEffect` (ligne 557) était placé **APRÈS** un `return` conditionnel (`if (loading)`), ce qui violait les **Règles des Hooks de React**.

```tsx
// ❌ CODE BUGGÉ
if (loading) {
  return <LoadingSpinner />;  // Return prématuré
}

// ⚠️ Ce Hook n'est jamais appelé quand loading=true !
useEffect(() => { ... }, [...]); 
```

## 🎯 Diagnostic

### Tableau des Hooks React (Comparaison des Rendus)

| Ligne | Rendu Précédent (loading=true) | Rendu Suivant (loading=false) |
|-------|-------------------------------|-------------------------------|
| 1-12  | Identique                     | Identique                     |
| 13    | **undefined**                 | **useEffect** ← ERREUR !      |

**Explication** :
- **Quand `loading = true`** → Le composant retourne prématurément → Le `useEffect` ligne 557 **n'est PAS appelé** (= 12 Hooks)
- **Quand `loading = false`** → Le composant continue → Le `useEffect` ligne 557 **est appelé** (= 13 Hooks)
- React détecte : "Avant = 12 Hooks, Maintenant = 13 Hooks" → **💥 ERREUR FATALE**

## ✅ Solution v3 (FINALE)

### Principe
**Tous les Hooks doivent être appelés AVANT tout `return` conditionnel.**

### Implémentation

```tsx
export default function FamilyTreeVisualization() {
  // ✅ 1. Tous les useState au début
  const [persons, setPersons] = useState<Person[]>([]);
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFullTree, setShowFullTree] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Person[]>([]);
  const [visiblePersonsCount, setVisiblePersonsCount] = useState(0);
  const toast = useToast();

  // ✅ 2. Premier useEffect (chargement des données)
  useEffect(() => {
    loadTreeData();
  }, [showFullTree]);

  // ✅ 3. Fonction de construction de l'arbre
  const buildTreeWithUnions = (): PersonWithUnions[] => {
    // ... logique complexe
    return result;
  };

  // ✅ 4. useMemo #1 - Calcul de treeData
  const treeData = useMemo(() => {
    if (persons.length === 0) return [];
    return buildTreeWithUnions();
  }, [persons, weddings]);

  // ✅ 5. useMemo #2 - Calcul du compteur de personnes visibles
  const computedVisibleCount = useMemo(() => {
    const visiblePersonsSet = new Set<number>();
    treeData.forEach(node => {
      visiblePersonsSet.add(node.person.personID);
      node.unions.forEach(union => {
        visiblePersonsSet.add(union.partner.personID);
        union.children.forEach(child => visiblePersonsSet.add(child.personID));
      });
    });
    return visiblePersonsSet.size;
  }, [treeData]);

  // ✅ 6. Deuxième useEffect - Mise à jour du state
  useEffect(() => {
    if (visiblePersonsCount !== computedVisibleCount) {
      setVisiblePersonsCount(computedVisibleCount);
    }
  }, [computedVisibleCount, visiblePersonsCount]);

  // ✅ 7. MAINTENANT on peut faire des returns conditionnels
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    // ... reste du JSX
  );
}
```

## 🔍 Ordre Final des Hooks

| # | Type | Ligne | Description |
|---|------|-------|-------------|
| 1 | `useState` | 77 | persons |
| 2 | `useState` | 78 | weddings |
| 3 | `useState` | 79 | loading |
| 4 | `useState` | 80 | showFullTree |
| 5 | `useState` | 81 | searchQuery |
| 6 | `useState` | 82 | searchResults |
| 7 | `useState` | 83 | visiblePersonsCount |
| 8 | `useToast` | 84 | toast notifications |
| 9 | `useEffect` | 91 | Load tree data |
| 10 | `useMemo` | 288 | Calculate treeData |
| 11 | `useMemo` | 293 | Calculate visible count |
| 12 | `useEffect` | 305 | Update visible count state |

**✅ Total : 12 Hooks appelés dans le MÊME ORDRE à CHAQUE RENDU**

## 📊 Pourquoi v3 Fonctionne ?

### Comparaison des Versions

#### ❌ v1 (Échec)
```tsx
const visiblePersonsCountComputed = useMemo(() => {
  // calcul
}, [treeData]); // treeData n'existe pas encore !

useEffect(() => {
  setVisiblePersonsCount(visiblePersonsCountComputed);
}, [visiblePersonsCountComputed]);
```
**Problème** : `treeData` non défini, dépendance circulaire

---

#### ❌ v2 (Échec)
```tsx
if (loading) return <LoadingSpinner />;

// ⚠️ Ces Hooks ne sont jamais appelés si loading=true
const treeData = buildTreeWithUnions();
useEffect(() => { ... }, [...]);
```
**Problème** : Hooks après `return` conditionnel

---

#### ✅ v3 (Succès)
```tsx
// Tous les Hooks AVANT tout return
const treeData = useMemo(() => buildTreeWithUnions(), [persons, weddings]);
const computedVisibleCount = useMemo(() => { ... }, [treeData]);
useEffect(() => { ... }, [computedVisibleCount, visiblePersonsCount]);

// MAINTENANT on peut return conditionnellement
if (loading) return <LoadingSpinner />;
```
**Solution** : Ordre stable, pas de dépendances circulaires, pas de Hooks conditionnels

## 🎓 Règles des Hooks à Retenir

### Les 2 Règles d'Or

1. **N'appelez les Hooks qu'au niveau supérieur**
   - ❌ Pas dans des boucles (`for`, `while`, `map`)
   - ❌ Pas dans des conditions (`if`, `else`, ternaires)
   - ❌ Pas dans des fonctions imbriquées
   - ✅ Toujours au début du composant

2. **L'ordre doit être constant**
   - React se fie à l'ordre d'appel des Hooks
   - Chaque rendu doit appeler le même nombre de Hooks
   - Dans le même ordre

### Exceptions Autorisées

```tsx
// ✅ Condition À L'INTÉRIEUR du Hook
useEffect(() => {
  if (condition) {
    // logique conditionnelle
  }
}, [condition]);

// ✅ Return conditionnel APRÈS tous les Hooks
const MyComponent = () => {
  const [state] = useState();
  useEffect(() => {}, []);
  
  if (loading) return <Loading />; // ✅ OK
  return <Content />;
};
```

## 📈 Résultat

- ✅ **Compilation TypeScript** : Aucune erreur
- ✅ **React Hooks** : Ordre stable et prévisible
- ✅ **Performance** : `useMemo` évite les recalculs inutiles
- ✅ **Lisibilité** : Code structuré et maintenable

## 🚀 Test de Validation

1. **Hard Refresh** : `Cmd + Shift + R` (Mac) ou `Ctrl + Shift + F5` (Windows)
2. **Ouvrir DevTools** : Console (F12)
3. **Naviguer vers** : `/family-tree`
4. **Vérifier** :
   - ❌ **AUCUNE** erreur "Rendered more hooks..."
   - ✅ Logs de console affichés correctement
   - ✅ Compteurs : "📊 7 PERSONNES" et "👥 X affichées"
   - ✅ Arbre affiché sans duplication

---

**Date** : 11 Novembre 2025  
**Version** : v3 (FINALE)  
**Status** : ✅ **RÉSOLU**
