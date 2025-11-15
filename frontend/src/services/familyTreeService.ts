/**
 * Service de construction d'arbre généalogique - Architecture correcte
 * 
 * PRINCIPES:
 * 1. UNE personne = UN nœud unique (pas de duplication)
 * 2. Les UNIONS sont des entités séparées (Union = Père + Mère)
 * 3. Les enfants sont liés à une UNION spécifique
 * 4. UN SEUL ARBRE : Force la construction à partir du couple racine principal
 * 
 * Gère correctement polygamie, fratries consanguines, demi-frères/sœurs
 */

export interface Person {
  personID: number;
  firstName: string;
  lastName: string;
  sex: 'M' | 'F';
  photoUrl?: string;
  alive: boolean;
  birthday?: string;
  deathDate?: string;
  age?: number;
  fatherID?: number;
  motherID?: number;
  canLogin?: boolean;
}

export interface Wedding {
  weddingID: number;
  manID: number;
  womanID: number;
  weddingDate?: string;
  divorceDate?: string;
  isActive: boolean;
}

/**
 * Union = Relation entre deux personnes (mariées ou co-parents)
 * C'est l'entité qui "contient" les enfants
 */
export interface Union {
  id: string; // Ex: "27-28" pour père 27 + mère 28
  fatherId: number;
  motherId: number;
  father: Person;
  mother: Person;
  children: Person[];
  weddingDate?: string;
  divorceDate?: string;
  isMarried: boolean;
}

/**
 * Nœud de l'arbre pour visualisation
 * Représente UNE personne avec toutes ses unions
 */
export interface FamilyTreeNode {
  person: Person;
  unions: Union[]; // Toutes les unions de cette personne
  generation: number; // 0 = racine, 1 = enfants, -1 = parents
  isRoot: boolean;
}

/**
 * Construit la liste de toutes les unions dans la famille
 * @param persons Liste de toutes les personnes
 * @param weddings Liste de tous les mariages
 * @returns Map des unions par ID
 */
export function buildUnions(
  persons: Person[],
  weddings: Wedding[]
): Map<string, Union> {
  const unionsMap = new Map<string, Union>();
  const personsMap = new Map(persons.map(p => [p.personID, p]));
  
  // 1. Créer des unions à partir des mariages
  weddings.forEach(wedding => {
    const father = personsMap.get(wedding.manID);
    const mother = personsMap.get(wedding.womanID);
    
    if (father && mother) {
      const unionId = `${wedding.manID}-${wedding.womanID}`;
      
      // Trouver les enfants de cette union
      const children = persons.filter(p => 
        p.fatherID === wedding.manID && p.motherID === wedding.womanID
      );
      
      unionsMap.set(unionId, {
        id: unionId,
        fatherId: wedding.manID,
        motherId: wedding.womanID,
        father,
        mother,
        children,
        weddingDate: wedding.weddingDate,
        divorceDate: wedding.divorceDate,
        isMarried: true
      });
    }
  });
  
  // 2. Créer des unions pour les co-parents (pas mariés mais ont des enfants)
  persons.forEach(child => {
    if (child.fatherID && child.motherID) {
      const unionId = `${child.fatherID}-${child.motherID}`;
      
      // Si cette union n'existe pas déjà (pas de mariage)
      if (!unionsMap.has(unionId)) {
        const father = personsMap.get(child.fatherID);
        const mother = personsMap.get(child.motherID);
        
        if (father && mother) {
          // Trouver tous les enfants de ces deux parents
          const children = persons.filter(p => 
            p.fatherID === child.fatherID && p.motherID === child.motherID
          );
          
          unionsMap.set(unionId, {
            id: unionId,
            fatherId: child.fatherID,
            motherId: child.motherID,
            father,
            mother,
            children,
            isMarried: false
          });
        }
      }
    }
  });
  
  return unionsMap;
}

/**
 * Construit l'arbre familial centré sur une personne
 * Architecture correcte: personnes uniques + unions séparées
 */
export function buildFamilyTreeWithUnions(
  persons: Person[],
  weddings: Wedding[],
  rootPersonId: number
): FamilyTreeNode | null {
  const personsMap = new Map(persons.map(p => [p.personID, p]));
  const unionsMap = buildUnions(persons, weddings);
  
  const rootPerson = personsMap.get(rootPersonId);
  if (!rootPerson) return null;
  
  // Trouver toutes les unions où cette personne est impliquée
  const personUnions: Union[] = [];
  
  unionsMap.forEach(union => {
    if (union.fatherId === rootPersonId || union.motherId === rootPersonId) {
      personUnions.push(union);
    }
  });
  
  return {
    person: rootPerson,
    unions: personUnions,
    generation: 0,
    isRoot: true
  };
}

/**
 * Construit l'arbre complet avec toutes les générations
 * Gère correctement la polygamie et les demi-frères/sœurs
 */
export function buildCompleteFamily(
  persons: Person[],
  weddings: Wedding[]
): {
  roots: FamilyTreeNode[];
  unions: Map<string, Union>;
  allPersons: Map<number, Person>;
} {
  const personsMap = new Map(persons.map(p => [p.personID, p]));
  const unionsMap = buildUnions(persons, weddings);
  
  // 🔧 ÉTAPE 1: Identifier les personnes SANS parents définis
  const individualsWithoutParents = persons.filter(p => {
    const hasDefinedFather = p.fatherID != null && p.fatherID > 0;
    const hasDefinedMother = p.motherID != null && p.motherID > 0;
    
    if (hasDefinedFather || hasDefinedMother) {
      console.log(`❌ ${p.firstName} ${p.lastName} (ID: ${p.personID}) a des parents définis → PAS un ancêtre`);
      return false;
    }
    
    console.log(`✅ ${p.firstName} ${p.lastName} (ID: ${p.personID}) sans parents définis → EST un ancêtre`);
    return true;
  });
  
  // 🎯 ÉTAPE 2: Regrouper les racines par UNION (couples racines)
  const processedRootIds = new Set<number>();
  const rootNodes: FamilyTreeNode[] = [];
  const soloRootNodes: FamilyTreeNode[] = [];
  let coupleRootFound = false;
  
  // Trouver les COUPLES racines (deux ancêtres qui ont des enfants ensemble)
  for (let i = 0; i < individualsWithoutParents.length; i++) {
    const person1 = individualsWithoutParents[i];
    if (processedRootIds.has(person1.personID)) continue;
    
    // Chercher si cette personne a une union avec une autre racine
    let foundPartner = false;
    
    for (let j = i + 1; j < individualsWithoutParents.length; j++) {
      const person2 = individualsWithoutParents[j];
      if (processedRootIds.has(person2.personID)) continue;
      
      // Vérifier s'ils ont une union ensemble
      const unionId1 = `${person1.personID}-${person2.personID}`;
      const unionId2 = `${person2.personID}-${person1.personID}`;
      
      if (unionsMap.has(unionId1) || unionsMap.has(unionId2)) {
        // C'EST UN COUPLE RACINE ! Utiliser le père comme nœud principal
        const father = person1.sex === 'M' ? person1 : person2;
        const partner = person1.sex === 'M' ? person2 : person1;
        
        console.log(`💑 COUPLE RACINE détecté: ${father.firstName} ${father.lastName} + ${partner.firstName} ${partner.lastName}`);
        
        const personUnions: Union[] = [];
        unionsMap.forEach(union => {
          if (union.fatherId === father.personID || union.motherId === father.personID) {
            personUnions.push(union);
          }
        });
        
        rootNodes.push({
          person: father,
          unions: personUnions,
          generation: 0,
          isRoot: true
        });
        
        processedRootIds.add(person1.personID);
        processedRootIds.add(person2.personID);
        foundPartner = true;
        coupleRootFound = true;
        break;
      }
    }
    
    // Si pas de partenaire trouvé, c'est une racine solo
    if (!foundPartner) {
      console.log(`👤 RACINE SOLO détectée: ${person1.firstName} ${person1.lastName}`);
      
      const personUnions: Union[] = [];
      unionsMap.forEach(union => {
        if (union.fatherId === person1.personID || union.motherId === person1.personID) {
          personUnions.push(union);
        }
      });
      
      soloRootNodes.push({
        person: person1,
        unions: personUnions,
        generation: 0,
        isRoot: true
      });
      
      processedRootIds.add(person1.personID);
    }
  }
  
  // 🎯 RÈGLE ABSOLUE : Si un COUPLE RACINE existe, IGNORER toutes les racines solo
  if (coupleRootFound) {
    console.log(`\n🚨 RÈGLE ABSOLUE: Couple racine détecté → IGNORER toutes les ${soloRootNodes.length} racines solo`);
    soloRootNodes.forEach(solo => {
      console.log(`   ❌ IGNORÉ: ${solo.person.firstName} ${solo.person.lastName} (racine solo non pertinente)`);
    });
    console.log(`✅ RÉSULTAT: ${rootNodes.length} ARBRE UNIQUE à partir du couple racine\n`);
    
    // 🔒 SÉCURITÉ ABSOLUE: Forcer UN SEUL nœud racine même si plusieurs couples racines
    if (rootNodes.length > 1) {
      console.log(`⚠️ ATTENTION: ${rootNodes.length} couples racines détectés, sélection du PREMIER UNIQUEMENT`);
      const selectedRoot = rootNodes[0];
      console.log(`🎯 RACINE UNIQUE SÉLECTIONNÉE: ${selectedRoot.person.firstName} ${selectedRoot.person.lastName} (ID: ${selectedRoot.person.personID})`);
      
      // Garder seulement le premier couple racine
      return {
        roots: [selectedRoot],
        unions: unionsMap,
        allPersons: personsMap
      };
    }
  } else {
    // Pas de couple racine : utiliser UNE SEULE racine solo
    console.log(`\nℹ️ Aucun couple racine détecté → Sélection de la PREMIÈRE racine solo uniquement`);
    if (soloRootNodes.length > 1) {
      console.log(`⚠️ ${soloRootNodes.length} racines solo détectées, sélection de la PREMIÈRE UNIQUEMENT`);
      const selectedSolo = soloRootNodes[0];
      console.log(`🎯 RACINE UNIQUE SÉLECTIONNÉE: ${selectedSolo.person.firstName} ${selectedSolo.person.lastName} (ID: ${selectedSolo.person.personID})`);
      
      return {
        roots: [selectedSolo],
        unions: unionsMap,
        allPersons: personsMap
      };
    } else if (soloRootNodes.length === 1) {
      rootNodes.push(soloRootNodes[0]);
    }
  }
  
  // 🔒 GARANTIE FINALE: Ne JAMAIS retourner plus d'un nœud racine
  const finalRoots = rootNodes.length > 0 ? [rootNodes[0]] : [];
  
  console.log(`\n🔢 Nombre d'arbres construits: ${finalRoots.length}`);
  if (finalRoots.length > 0) {
    console.log(`📊 ARBRE UNIQUE: ${finalRoots[0].person.firstName} ${finalRoots[0].person.lastName} (ID: ${finalRoots[0].person.personID})`);
  }
  
  return {
    roots: finalRoots,
    unions: unionsMap,
    allPersons: personsMap
  };
}
export function getPersonUnions(
  personId: number,
  unionsMap: Map<string, Union>
): Union[] {
  const personUnions: Union[] = [];
  
  unionsMap.forEach(union => {
    if (union.fatherId === personId || union.motherId === personId) {
      personUnions.push(union);
    }
  });
  
  return personUnions;
}

/**
 * Vérifie si deux personnes sont demi-frères/sœurs
 */
export function areHalfSiblings(
  person1: Person,
  person2: Person
): boolean {
  // Même père OU même mère (mais pas les deux)
  const sameFather = person1.fatherID === person2.fatherID && person1.fatherID !== undefined;
  const sameMother = person1.motherID === person2.motherID && person1.motherID !== undefined;
  
  return (sameFather && !sameMother) || (sameMother && !sameFather);
}

/**
 * Vérifie si deux personnes sont frères/sœurs complets
 */
export function areFullSiblings(
  person1: Person,
  person2: Person
): boolean {
  return (
    person1.fatherID === person2.fatherID &&
    person1.motherID === person2.motherID &&
    person1.fatherID !== undefined &&
    person1.motherID !== undefined
  );
}

/**
 * Statistiques sur la famille
 */
export function getFamilyStatistics(
  persons: Person[],
  unions: Map<string, Union>
): {
  totalPersons: number;
  totalUnions: number;
  marriedUnions: number;
  coParentUnions: number;
  generations: number;
  polygamousFamilies: number; // Nombre de personnes avec plusieurs partenaires
} {
  // Compter les personnes avec plusieurs partenaires
  const personsWithMultiplePartners = new Set<number>();
  const unionCounts = new Map<number, number>();
  
  unions.forEach(union => {
    // Compter pour le père
    const fatherCount = unionCounts.get(union.fatherId) || 0;
    unionCounts.set(union.fatherId, fatherCount + 1);
    if (fatherCount + 1 > 1) {
      personsWithMultiplePartners.add(union.fatherId);
    }
    
    // Compter pour la mère
    const motherCount = unionCounts.get(union.motherId) || 0;
    unionCounts.set(union.motherId, motherCount + 1);
    if (motherCount + 1 > 1) {
      personsWithMultiplePartners.add(union.motherId);
    }
  });
  
  const marriedUnions = Array.from(unions.values()).filter(u => u.isMarried).length;
  
  return {
    totalPersons: persons.length,
    totalUnions: unions.size,
    marriedUnions,
    coParentUnions: unions.size - marriedUnions,
    generations: 0, // À calculer selon l'arbre
    polygamousFamilies: personsWithMultiplePartners.size
  };
}
