/**
 * Tests unitaires pour le service treeBuilder
 */

import {
  buildFamilyTree,
  buildExtendedFamilyTree,
  flattenTree,
  countNodes,
  findNodeById,
  getTreeStatistics,
  TreeNode
} from '../treeBuilder';

// Mock data
const mockPersons = [
  {
    personID: 1,
    firstName: 'Jean',
    lastName: 'DUPONT',
    sex: 'M',
    alive: false,
    birthday: '1920-01-01',
    deathDate: '2000-01-01',
    fatherID: null,
    motherID: null,
    canLogin: false
  },
  {
    personID: 2,
    firstName: 'Marie',
    lastName: 'MARTIN',
    sex: 'F',
    alive: false,
    birthday: '1922-05-15',
    deathDate: '2005-03-20',
    fatherID: null,
    motherID: null,
    canLogin: false
  },
  {
    personID: 3,
    firstName: 'Pierre',
    lastName: 'DUPONT',
    sex: 'M',
    alive: true,
    birthday: '1950-07-10',
    fatherID: 1,
    motherID: 2,
    canLogin: true,
    photoUrl: 'https://example.com/pierre.jpg'
  },
  {
    personID: 4,
    firstName: 'Sophie',
    lastName: 'BERNARD',
    sex: 'F',
    alive: true,
    birthday: '1955-12-25',
    fatherID: null,
    motherID: null,
    canLogin: false
  },
  {
    personID: 5,
    firstName: 'Lucas',
    lastName: 'DUPONT',
    sex: 'M',
    alive: true,
    birthday: '1980-03-15',
    fatherID: 3,
    motherID: 4,
    canLogin: true
  },
  {
    personID: 6,
    firstName: 'Emma',
    lastName: 'DUPONT',
    sex: 'F',
    alive: true,
    birthday: '1982-09-20',
    fatherID: 3,
    motherID: 4,
    canLogin: false
  }
];

const mockWeddings = [
  {
    weddingID: 1,
    manID: 1,
    womanID: 2,
    weddingDate: '1945-06-20',
    isActive: true
  },
  {
    weddingID: 2,
    manID: 3,
    womanID: 4,
    weddingDate: '1975-08-30',
    isActive: true
  }
];

describe('treeBuilder Service', () => {
  describe('buildFamilyTree', () => {
    it('devrait construire un arbre avec la racine correcte', () => {
      const tree = buildFamilyTree(mockPersons, mockWeddings, 1);
      
      expect(tree).not.toBeNull();
      expect(tree?.id).toBe(1);
      expect(tree?.firstName).toBe('Jean');
      expect(tree?.lastName).toBe('DUPONT');
      expect(tree?.isRoot).toBe(true);
    });
    
    it('devrait inclure les enfants', () => {
      const tree = buildFamilyTree(mockPersons, mockWeddings, 1);
      
      expect(tree?.children).toBeDefined();
      expect(tree?.children?.length).toBe(1);
      expect(tree?.children?.[0].id).toBe(3);
    });
    
    it('devrait calculer les générations correctement', () => {
      const tree = buildFamilyTree(mockPersons, mockWeddings, 1);
      
      expect(tree?.generation).toBe(0);
      expect(tree?.children?.[0].generation).toBe(1);
      expect(tree?.children?.[0].children?.[0].generation).toBe(2);
    });
    
    it('devrait inclure les informations de conjoint', () => {
      const tree = buildFamilyTree(mockPersons, mockWeddings, 1);
      
      expect(tree?.spouses).toBeDefined();
      expect(tree?.spouses?.length).toBe(1);
      expect(tree?.spouses?.[0].personId).toBe(2);
      expect(tree?.spouses?.[0].name).toBe('Marie MARTIN');
    });
    
    it('devrait calculer l\'âge pour les personnes vivantes', () => {
      const tree = buildFamilyTree(mockPersons, mockWeddings, 3);
      
      expect(tree?.age).toBeGreaterThan(0);
      expect(tree?.alive).toBe(true);
    });
    
    it('devrait gérer les personnes sans enfants', () => {
      const tree = buildFamilyTree(mockPersons, mockWeddings, 5);
      
      expect(tree?.children).toBeUndefined();
    });
    
    it('devrait retourner null pour un ID inexistant', () => {
      const tree = buildFamilyTree(mockPersons, mockWeddings, 999);
      
      expect(tree).toBeNull();
    });
  });
  
  describe('buildExtendedFamilyTree', () => {
    it('devrait trouver l\'ancêtre le plus ancien', () => {
      const tree = buildExtendedFamilyTree(mockPersons, mockWeddings, 5, 3);
      
      expect(tree).not.toBeNull();
      // Devrait remonter jusqu'à Jean (ID 1)
      expect(tree?.id).toBe(1);
    });
    
    it('devrait respecter le nombre de niveaux d\'ancêtres', () => {
      const tree = buildExtendedFamilyTree(mockPersons, mockWeddings, 5, 1);
      
      // Avec 1 niveau, devrait remonter à Pierre (ID 3)
      expect(tree?.id).toBe(3);
    });
  });
  
  describe('flattenTree', () => {
    it('devrait convertir l\'arbre en liste plate', () => {
      const tree = buildFamilyTree(mockPersons, mockWeddings, 1);
      const flatList = flattenTree(tree!);
      
      expect(flatList).toBeInstanceOf(Array);
      expect(flatList.length).toBeGreaterThan(0);
    });
    
    it('devrait inclure tous les nœuds', () => {
      const tree = buildFamilyTree(mockPersons, mockWeddings, 1);
      const flatList = flattenTree(tree!);
      
      // Jean + Pierre + Lucas + Emma = 4 personnes
      expect(flatList.length).toBe(4);
    });
  });
  
  describe('countNodes', () => {
    it('devrait compter correctement le nombre de nœuds', () => {
      const tree = buildFamilyTree(mockPersons, mockWeddings, 1);
      const count = countNodes(tree!);
      
      expect(count).toBe(4);
    });
  });
  
  describe('findNodeById', () => {
    it('devrait trouver un nœud par son ID', () => {
      const tree = buildFamilyTree(mockPersons, mockWeddings, 1);
      const node = findNodeById(tree!, 3);
      
      expect(node).not.toBeNull();
      expect(node?.id).toBe(3);
      expect(node?.firstName).toBe('Pierre');
    });
    
    it('devrait retourner null si le nœud n\'existe pas', () => {
      const tree = buildFamilyTree(mockPersons, mockWeddings, 1);
      const node = findNodeById(tree!, 999);
      
      expect(node).toBeNull();
    });
  });
  
  describe('getTreeStatistics', () => {
    it('devrait calculer les statistiques correctes', () => {
      const tree = buildFamilyTree(mockPersons, mockWeddings, 1);
      const stats = getTreeStatistics(tree!);
      
      expect(stats.totalPersons).toBe(4);
      expect(stats.males).toBe(3); // Jean, Pierre, Lucas
      expect(stats.females).toBe(1); // Emma
      expect(stats.alive).toBe(3); // Pierre, Lucas, Emma
      expect(stats.deceased).toBe(1); // Jean
      expect(stats.withAccounts).toBe(2); // Pierre, Lucas
      expect(stats.maxGeneration).toBe(2);
      expect(stats.minGeneration).toBe(0);
    });
    
    it('devrait compter les conjoints', () => {
      const tree = buildFamilyTree(mockPersons, mockWeddings, 1);
      const stats = getTreeStatistics(tree!);
      
      // Jean a 1 conjoint (Marie), Pierre a 1 conjoint (Sophie)
      // Mais Sophie n'est pas dans l'arbre car ce n'est pas une descendante de Jean
      expect(stats.totalSpouses).toBeGreaterThanOrEqual(1);
    });
  });
  
  describe('Edge Cases', () => {
    it('devrait gérer un arbre avec une seule personne', () => {
      const singlePerson = [mockPersons[0]];
      const tree = buildFamilyTree(singlePerson, [], 1);
      
      expect(tree).not.toBeNull();
      expect(tree?.children).toBeUndefined();
      expect(countNodes(tree!)).toBe(1);
    });
    
    it('devrait gérer les cycles (protection contre boucles infinies)', () => {
      const cyclicPersons = [
        { ...mockPersons[0], fatherID: 3 }, // Jean est fils de Pierre
        { ...mockPersons[2], fatherID: 1 }  // Pierre est fils de Jean (cycle!)
      ];
      
      // Ne devrait pas planter
      const tree = buildFamilyTree(cyclicPersons, [], 1);
      expect(tree).not.toBeNull();
    });
    
    it('devrait gérer les données manquantes (photos, dates)', () => {
      const incompletePerson = [{
        personID: 1,
        firstName: 'Test',
        lastName: 'USER',
        sex: 'M',
        alive: true
      }];
      
      const tree = buildFamilyTree(incompletePerson, [], 1);
      
      expect(tree).not.toBeNull();
      expect(tree?.photoUrl).toBeUndefined();
      expect(tree?.birthday).toBeUndefined();
    });
  });
});

// Tests d'intégration (à exécuter manuellement avec Jest)
describe('Integration Tests', () => {
  it('devrait gérer un arbre de grande taille (100+ personnes)', () => {
    // Générer 100 personnes
    const largeFamily = Array.from({ length: 100 }, (_, i) => ({
      personID: i + 1,
      firstName: `Person${i + 1}`,
      lastName: 'TEST',
      sex: i % 2 === 0 ? 'M' : 'F',
      alive: true,
      birthday: `${1920 + i}-01-01`,
      fatherID: i > 0 ? Math.floor(i / 2) : null,
      motherID: null,
      canLogin: false
    }));
    
    const tree = buildFamilyTree(largeFamily, [], 1);
    const stats = getTreeStatistics(tree!);
    
    expect(stats.totalPersons).toBeGreaterThan(50);
    expect(tree).not.toBeNull();
  });
});

export {};
