/**
 * Service de construction d'arbre généalogique hiérarchique
 * Transforme les données plates de l'API en structure arborescente pour D3.js
 */

export interface TreeNode {
  // Données de base
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  sex: 'M' | 'F';
  photoUrl?: string;
  
  // Statut
  alive: boolean;
  birthday?: string;
  deathDate?: string;
  age?: number;
  
  // Relations
  children?: TreeNode[];
  spouses?: SpouseInfo[];
  
  // Métadonnées pour la visualisation
  generation: number;  // 0 = racine, +1 = descendants, -1 = ascendants
  isRoot: boolean;
  hasAccount: boolean;
  
  // Données complètes (optionnel)
  _fullData?: any;
}

export interface SpouseInfo {
  personId: number;
  name: string;
  photoUrl?: string;
  weddingDate?: string;
  divorceDate?: string;
  isActive: boolean;
}

interface Person {
  personID: number;
  firstName: string;
  lastName: string;
  sex: string;
  photoUrl?: string;
  alive: boolean;
  birthday?: string;
  deathDate?: string;
  fatherID?: number;
  motherID?: number;
  canLogin?: boolean;
  [key: string]: any;
}

interface Wedding {
  weddingID: number;
  manID: number;
  womanID: number;
  weddingDate?: string;
  divorceDate?: string;
  isActive: boolean;
}

/**
 * Transforme les données plates de l'API en arbre hiérarchique
 * @param persons Liste de toutes les personnes
 * @param weddings Liste de tous les mariages
 * @param rootPersonId ID de la personne racine (point de départ de l'arbre)
 * @returns Arbre hiérarchique avec la personne racine au sommet
 */
export function buildFamilyTree(
  persons: Person[],
  weddings: Wedding[],
  rootPersonId: number
): TreeNode | null {
  // 1. Créer un index des personnes par ID pour accès rapide
  const personsMap = new Map(persons.map(p => [p.personID, p]));
  
  // 2. Créer un index des mariages par personne
  const weddingsMap = new Map<number, Wedding[]>();
  weddings.forEach(w => {
    if (!weddingsMap.has(w.manID)) weddingsMap.set(w.manID, []);
    if (!weddingsMap.has(w.womanID)) weddingsMap.set(w.womanID, []);
    weddingsMap.get(w.manID)!.push(w);
    weddingsMap.get(w.womanID)!.push(w);
  });
  
  // 3. Fonction récursive de construction de l'arbre (descendants)
  function buildDescendantsNode(
    personId: number,
    generation: number,
    visited: Set<number>
  ): TreeNode | null {
    if (visited.has(personId)) {
      // Éviter les boucles infinies (cycles dans les données)
      console.warn(`Cycle détecté pour la personne ${personId}`);
      return null;
    }
    visited.add(personId);
    
    const person = personsMap.get(personId);
    if (!person) {
      console.warn(`Personne ${personId} introuvable`);
      return null;
    }
    
    // Trouver les enfants (où cette personne est père OU mère)
    const children = persons
      .filter(p => p.fatherID === personId || p.motherID === personId)
      .map(child => buildDescendantsNode(child.personID, generation + 1, new Set(visited)))
      .filter((node): node is TreeNode => node !== null);
    
    // Trouver les conjoints
    const marriages = weddingsMap.get(personId) || [];
    const spouses: SpouseInfo[] = marriages
      .map(w => {
        const spouseId = w.manID === personId ? w.womanID : w.manID;
        const spouse = personsMap.get(spouseId);
        if (!spouse) return null;
        
        return {
          personId: spouse.personID,
          name: `${spouse.firstName} ${spouse.lastName}`,
          photoUrl: spouse.photoUrl,
          weddingDate: w.weddingDate,
          divorceDate: w.divorceDate,
          isActive: w.isActive
        } as SpouseInfo;
      })
      .filter((s): s is SpouseInfo => s !== null);
    
    // Si aucun mariage enregistré, détecter automatiquement les conjoints
    // en cherchant les co-parents (personnes avec qui on partage des enfants)
    if (spouses.length === 0) {
      const childrenWithBothParents = persons.filter(child => 
        (child.fatherID === personId && child.motherID) ||
        (child.motherID === personId && child.fatherID)
      );
      
      // Extraire les IDs des co-parents uniques
      const coParentIds = new Set<number>();
      childrenWithBothParents.forEach(child => {
        if (child.fatherID === personId && child.motherID) {
          coParentIds.add(child.motherID);
        } else if (child.motherID === personId && child.fatherID) {
          coParentIds.add(child.fatherID);
        }
      });
      
      // Créer des SpouseInfo pour chaque co-parent
      coParentIds.forEach(coParentId => {
        const coParent = personsMap.get(coParentId);
        if (coParent) {
          spouses.push({
            personId: coParent.personID,
            name: `${coParent.firstName} ${coParent.lastName}`,
            photoUrl: coParent.photoUrl,
            weddingDate: undefined,
            divorceDate: undefined,
            isActive: true // Considéré comme actif par défaut
          });
        }
      });
    }
    
    // Calculer l'âge si la personne est vivante
    let age: number | undefined;
    if (person.alive && person.birthday) {
      const birthDate = new Date(person.birthday);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      if (today.getMonth() < birthDate.getMonth() || 
          (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }
    
    return {
      id: person.personID,
      name: `${person.firstName} ${person.lastName}`,
      firstName: person.firstName,
      lastName: person.lastName,
      sex: person.sex === 'M' ? 'M' : 'F',
      photoUrl: person.photoUrl,
      alive: person.alive,
      birthday: person.birthday,
      deathDate: person.deathDate,
      age,
      children: children.length > 0 ? children : undefined,
      spouses: spouses.length > 0 ? spouses : undefined,
      generation,
      isRoot: personId === rootPersonId,
      hasAccount: person.canLogin || false,
      _fullData: person
    };
  }
  
  return buildDescendantsNode(rootPersonId, 0, new Set());
}

/**
 * Construit un arbre complet incluant ascendants et descendants
 * @param persons Liste de toutes les personnes
 * @param weddings Liste de tous les mariages
 * @param focusPersonId ID de la personne au centre
 * @param ancestorLevels Nombre de générations d'ancêtres à inclure
 * @param descendantLevels Nombre de générations de descendants à inclure
 */
export function buildExtendedFamilyTree(
  persons: Person[],
  weddings: Wedding[],
  focusPersonId: number,
  ancestorLevels: number = 3
): TreeNode | null {
  const personsMap = new Map(persons.map(p => [p.personID, p]));
  const weddingsMap = new Map<number, Wedding[]>();
  
  weddings.forEach(w => {
    if (!weddingsMap.has(w.manID)) weddingsMap.set(w.manID, []);
    if (!weddingsMap.has(w.womanID)) weddingsMap.set(w.womanID, []);
    weddingsMap.get(w.manID)!.push(w);
    weddingsMap.get(w.womanID)!.push(w);
  });
  
  // Trouver la racine (l'ancêtre le plus ancien accessible)
  function findOldestAncestor(personId: number, levels: number): number {
    if (levels === 0) return personId;
    
    const person = personsMap.get(personId);
    if (!person) return personId;
    
    // Prioriser le père (lignée patrilinéaire)
    if (person.fatherID) {
      return findOldestAncestor(person.fatherID, levels - 1);
    } else if (person.motherID) {
      return findOldestAncestor(person.motherID, levels - 1);
    }
    
    return personId;
  }
  
  const rootId = findOldestAncestor(focusPersonId, ancestorLevels);
  return buildFamilyTree(persons, weddings, rootId);
}

/**
 * Convertit l'arbre hiérarchique en format plat pour analyse
 * @param tree Arbre hiérarchique
 * @returns Liste plate de tous les nœuds
 */
export function flattenTree(tree: TreeNode): TreeNode[] {
  const result: TreeNode[] = [];
  
  function traverse(node: TreeNode) {
    result.push(node);
    if (node.children) {
      node.children.forEach(child => traverse(child));
    }
  }
  
  traverse(tree);
  return result;
}

/**
 * Compte le nombre total de nœuds dans l'arbre
 */
export function countNodes(tree: TreeNode): number {
  return flattenTree(tree).length;
}

/**
 * Trouve un nœud par ID dans l'arbre
 */
export function findNodeById(tree: TreeNode, id: number): TreeNode | null {
  if (tree.id === id) return tree;
  
  if (tree.children) {
    for (const child of tree.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }
  
  return null;
}

/**
 * Calcule les statistiques de l'arbre
 */
export function getTreeStatistics(tree: TreeNode) {
  const allNodes = flattenTree(tree);
  
  return {
    totalPersons: allNodes.length,
    males: allNodes.filter(n => n.sex === 'M').length,
    females: allNodes.filter(n => n.sex === 'F').length,
    alive: allNodes.filter(n => n.alive).length,
    deceased: allNodes.filter(n => !n.alive).length,
    withAccounts: allNodes.filter(n => n.hasAccount).length,
    maxGeneration: Math.max(...allNodes.map(n => n.generation)),
    minGeneration: Math.min(...allNodes.map(n => n.generation)),
    totalSpouses: allNodes.reduce((sum, n) => sum + (n.spouses?.length || 0), 0)
  };
}
