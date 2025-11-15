/**
 * Service de construction d'arbre généalogique V2
 * Corrige le problème des doublons d'enfants quand les deux parents sont présents
 */

export interface TreeNode {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  sex: 'M' | 'F';
  photoUrl?: string;
  alive: boolean;
  birthday?: string;
  deathDate?: string;
  age?: number;
  children?: TreeNode[];
  spouses?: SpouseInfo[];
  generation: number;
  isRoot: boolean;
  hasAccount: boolean;
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

export function buildFamilyTreeV2(
  persons: Person[],
  weddings: Wedding[],
  rootPersonId: number,
  sharedProcessedChildren?: Set<number>
): TreeNode | null {
  const personsMap = new Map(persons.map(p => [p.personID, p]));
  const processedChildren = sharedProcessedChildren || new Set<number>();
  
  const weddingsMap = new Map<number, Wedding[]>();
  weddings.forEach(w => {
    if (!weddingsMap.has(w.manID)) weddingsMap.set(w.manID, []);
    if (!weddingsMap.has(w.womanID)) weddingsMap.set(w.womanID, []);
    weddingsMap.get(w.manID)!.push(w);
    weddingsMap.get(w.womanID)!.push(w);
  });
  
  function buildNode(personId: number, generation: number, visited: Set<number>): TreeNode | null {
    if (visited.has(personId)) return null;
    visited.add(personId);
    
    const person = personsMap.get(personId);
    if (!person) return null;
    
    const allChildren = persons.filter(p => 
      p.fatherID === personId || p.motherID === personId
    );
    
    const childrenToProcess = allChildren.filter(child => 
      !processedChildren.has(child.personID)
    );
    
    childrenToProcess.forEach(child => processedChildren.add(child.personID));
    
    const children = childrenToProcess
      .map(child => buildNode(child.personID, generation + 1, new Set(visited)))
      .filter((node): node is TreeNode => node !== null);
    
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
    
    if (spouses.length === 0) {
      const coParentIds = new Set<number>();
      allChildren.forEach(child => {
        if (child.fatherID === personId && child.motherID) {
          coParentIds.add(child.motherID);
        } else if (child.motherID === personId && child.fatherID) {
          coParentIds.add(child.fatherID);
        }
      });
      
      coParentIds.forEach(coParentId => {
        const coParent = personsMap.get(coParentId);
        if (coParent) {
          spouses.push({
            personId: coParent.personID,
            name: `${coParent.firstName} ${coParent.lastName}`,
            photoUrl: coParent.photoUrl,
            weddingDate: undefined,
            divorceDate: undefined,
            isActive: true
          });
        }
      });
    }
    
    let age: number | undefined;
    if (person.birthday) {
      const birthDate = new Date(person.birthday);
      const endDate = person.alive ? new Date() : (person.deathDate ? new Date(person.deathDate) : new Date());
      age = Math.floor((endDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
    }
    
    return {
      id: person.personID,
      name: `${person.firstName} ${person.lastName}`,
      firstName: person.firstName,
      lastName: person.lastName,
      sex: person.sex as 'M' | 'F',
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
  
  return buildNode(rootPersonId, 0, new Set());
}

export function buildExtendedFamilyTreeV2(
  persons: Person[],
  weddings: Wedding[],
  focusPersonId: number,
  ancestorLevels: number = 3,
  sharedProcessedChildren?: Set<number>
): TreeNode | null {
  const personsMap = new Map(persons.map(p => [p.personID, p]));
  
  function findOldestAncestor(personId: number, levels: number): number {
    if (levels === 0) return personId;
    
    const person = personsMap.get(personId);
    if (!person) return personId;
    
    if (person.fatherID && personsMap.has(person.fatherID)) {
      return findOldestAncestor(person.fatherID, levels - 1);
    } else if (person.motherID && personsMap.has(person.motherID)) {
      return findOldestAncestor(person.motherID, levels - 1);
    }
    
    return personId;
  }
  
  const rootId = findOldestAncestor(focusPersonId, ancestorLevels);
  return buildFamilyTreeV2(persons, weddings, rootId, sharedProcessedChildren);
}

export function getTreeStatistics(tree: TreeNode): {
  totalPersons: number;
  generations: number;
  livingPersons: number;
  deceasedPersons: number;
} {
  let totalPersons = 0;
  let maxGeneration = 0;
  let livingPersons = 0;
  let deceasedPersons = 0;
  
  function traverse(node: TreeNode) {
    totalPersons++;
    maxGeneration = Math.max(maxGeneration, node.generation);
    
    if (node.alive) {
      livingPersons++;
    } else {
      deceasedPersons++;
    }
    
    if (node.children) {
      node.children.forEach(child => traverse(child));
    }
  }
  
  traverse(tree);
  
  return {
    totalPersons,
    generations: maxGeneration + 1,
    livingPersons,
    deceasedPersons
  };
}
