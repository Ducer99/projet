import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  Box,
  Container,
  Spinner,
  VStack,
  Text,
  HStack,
  Badge,
  Button,
  useToast,
  Tooltip,
  IconButton,
  ButtonGroup
} from '@chakra-ui/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// 🔄 PHASE 4: Migration vers architecture union-based
import { 
  buildCompleteFamily, 
  Person, 
  FamilyTreeNode 
} from '../services/familyTreeService';
// 🔄 Garder TreeNode temporairement pour compatibilité
import { TreeNode, buildExtendedFamilyTreeV2, getTreeStatistics } from '../services/treeBuilderV2';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import { FaCompress, FaExpand, FaHome } from 'react-icons/fa';

interface FamilyTreeOrganicProps {
  focusPersonId?: number;
}

export const FamilyTreeOrganic: React.FC<FamilyTreeOrganicProps> = ({ focusPersonId }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  // Récupérer focusPersonId depuis l'URL si non fourni en prop
  const effectiveFocusPersonId = focusPersonId || parseInt(searchParams.get('focus') || '0') || undefined;

  // 🆕 PHASE 4: Fonction pour enrichir TreeNode avec informations unions
  const enrichTreeWithUnions = (tree: TreeNode, persons: any[], weddings: any[]): TreeNode => {
    // Convertir les données pour buildCompleteFamily
    const familyPersons = persons.map(p => ({
      personID: p.personID,
      firstName: p.firstName,
      lastName: p.lastName,
      sex: p.sex as 'M' | 'F',
      photoUrl: p.photoUrl,
      alive: p.alive,
      birthday: p.birthday,
      deathDate: p.deathDate,
      fatherID: p.fatherID,
      motherID: p.motherID,
      canLogin: p.canLogin,
      age: undefined
    }));

    const familyWeddings = weddings.map((w: any) => ({
      weddingID: w.weddingID,
      manID: w.husbandID || w.manID || 0,
      womanID: w.wifeID || w.womanID || 0,
      weddingDate: w.weddingDate,
      divorceDate: w.divorceDate,
      isActive: w.stillMarried || w.isActive || true
    }));

    // Construire les unions
    const { unions } = buildCompleteFamily(familyPersons, familyWeddings);

    // Fonction récursive pour enrichir chaque nœud
    const enrichNode = (node: TreeNode): TreeNode => {
      // Compter les unions de cette personne
      let personUnionCount = 0;
      const personUnions: Array<{
        partner: Person;
        children: TreeNode[];
        isMarried: boolean;
        weddingDate?: string;
      }> = [];

      unions.forEach(union => {
        if (union.fatherId === node.id || union.motherId === node.id) {
          personUnionCount++;
          
          const partnerId = union.fatherId === node.id ? union.motherId : union.fatherId;
          const partner = persons.find(p => p.personID === partnerId);
          
          if (partner) {
            personUnions.push({
              partner,
              children: [], // Les enfants sont déjà dans node.children
              isMarried: union.isMarried,
              weddingDate: union.weddingDate
            });
          }
        }
      });

      // Enrichir le nœud avec les unions
      const enrichedNode: any = {
        ...node,
        hasMultipleUnions: personUnionCount > 1,
        unions: personUnionCount > 1 ? personUnions : undefined
      };

      // Log pour debug
      if (personUnionCount > 1) {
        console.log(`🔍 Personne avec ${personUnionCount} unions:`, node.name, {
          id: node.id,
          unions: personUnions.map(u => u.partner.firstName)
        });
      }

      // Enrichir récursivement les enfants
      if (node.children && node.children.length > 0) {
        enrichedNode.children = node.children.map(child => enrichNode(child));
      }

      return enrichedNode;
    };

    return enrichNode(tree);
  };

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Récupérer l'utilisateur connecté
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const familyId = user.familyID;
        const currentPersonId = user.idPerson;
        
        if (!familyId) {
          throw new Error(t('familyTree.errorLoadingTree'));
        }
        
        // Récupérer l'arbre complet de la famille
        const response = await api.get(`/familytree/full/${familyId}`);
        let persons = response.data.persons || [];
        let weddings = response.data.weddings || [];
        
        // 🚨 PRIORITÉ 1 : Dédoublonnage des personnes
        // Éliminer les doublons basés sur PersonID unique
        const uniquePersonsMap = new Map();
        persons.forEach((person: any) => {
          if (!uniquePersonsMap.has(person.personID)) {
            uniquePersonsMap.set(person.personID, person);
          } else {
            console.warn(`⚠️ Doublon détecté pour PersonID ${person.personID}:`, person.firstName, person.lastName);
          }
        });
        persons = Array.from(uniquePersonsMap.values());
        
        console.log('✅ Personnes uniques après dédoublonnage:', persons.length);
        console.log('📋 Liste des personnes:', persons.map((p: any) => `${p.firstName} ${p.lastName} (ID: ${p.personID})`));
        
        // Déterminer la personne racine
        let rootId = effectiveFocusPersonId || currentPersonId;
        
        if (!rootId && persons.length > 0) {
          // Utiliser la première personne ou trouver l'ancêtre le plus ancien
          rootId = persons[0].personID;
        }
        
        if (persons.length > 0) {
          // 🎯 SOLUTION C: Trouver les VRAIS ancêtres
          // Un ancêtre = personne SANS père ET SANS mère (même si les parents ne sont pas dans les données)
          // Cela empêche Ruben (qui a fatherID/motherID définis) d'être traité comme racine
          const ancestors = persons.filter((p: any) => {
            const hasDefinedFather = p.fatherID != null && p.fatherID > 0;
            const hasDefinedMother = p.motherID != null && p.motherID > 0;
            
            // Si la personne a des parents définis, ce n'est PAS un ancêtre
            if (hasDefinedFather || hasDefinedMother) {
              console.log(`❌ ${p.firstName} ${p.lastName} (ID: ${p.personID}) a des parents → PAS un ancêtre`);
              return false;
            }
            
            console.log(`✅ ${p.firstName} ${p.lastName} (ID: ${p.personID}) sans parents → EST un ancêtre`);
            return true;
          });
          
          console.log('🌳 Ancêtres trouvés:', ancestors.length, ancestors.map((a: any) => `${a.firstName} ${a.lastName} (ID: ${a.personID})`));
          console.log('📊 Nombre total de personnes:', persons.length);
          console.log('💍 Nombre total de mariages:', weddings.length);
          
          // Si on a plusieurs ancêtres (familles multiples), créer un nœud racine virtuel
          // qui regroupe tous les ancêtres
          if (ancestors.length > 1) {
            console.log('Plusieurs ancêtres détectés - vérification des couples...');
            
            // 🔥 NOUVEAU: Détecter les couples parmi les ancêtres
            // Un couple = deux ancêtres qui partagent au moins un enfant
            const ancestorCouples: Array<{father: any, mother: any, processed: boolean}> = [];
            const processedAncestors = new Set<number>();
            
            // Trouver les couples
            for (let i = 0; i < ancestors.length; i++) {
              if (processedAncestors.has(ancestors[i].personID)) continue;
              
              for (let j = i + 1; j < ancestors.length; j++) {
                if (processedAncestors.has(ancestors[j].personID)) continue;
                
                // Vérifier si ces deux ancêtres ont des enfants en commun
                const sharedChildren = persons.filter((p: any) => {
                  const hasBothParents = (
                    (p.fatherID === ancestors[i].personID && p.motherID === ancestors[j].personID) ||
                    (p.fatherID === ancestors[j].personID && p.motherID === ancestors[i].personID)
                  );
                  return hasBothParents;
                });
                
                if (sharedChildren.length > 0) {
                  // C'est un couple!
                  const father = ancestors[i].sex === 'M' ? ancestors[i] : ancestors[j];
                  const mother = ancestors[i].sex === 'F' ? ancestors[i] : ancestors[j];
                  
                  ancestorCouples.push({ father, mother, processed: false });
                  processedAncestors.add(ancestors[i].personID);
                  processedAncestors.add(ancestors[j].personID);
                  
                  console.log(`Couple détecté: ${father.firstName} + ${mother.firstName} (${sharedChildren.length} enfants en commun)`);
                  break;
                }
              }
            }
            
            // Ancêtres qui ne font pas partie d'un couple
            let soloAncestors = ancestors.filter((a: any) => !processedAncestors.has(a.personID));
            
            console.log(`${ancestorCouples.length} couples détectés, ${soloAncestors.length} ancêtres solo (avant nettoyage)`);
            
            // 🎯 ÉTAPE 3: ÉLIMINER les ancêtres solo qui sont des CONJOINTS de descendants
            console.log('\n🔍 ÉTAPE 3: Nettoyage des ancêtres solo qui sont des conjoints...');
            
            // 🛡️ D'ABORD: Identifier les membres du couple racine (pour l'immunisation)
            const rootCoupleIds = new Set<number>();
            ancestorCouples.forEach((couple: any) => {
              rootCoupleIds.add(couple.father.personID);
              rootCoupleIds.add(couple.mother.personID);
            });
            
            console.log(`🛡️ Couple racine immunisé (IDs):`, Array.from(rootCoupleIds));
            
            // ENSUITE: Collecter tous les descendants des couples racines (SAUF le couple racine lui-même)
            const descendantsOfCouples = new Set<number>();
            
            const collectDescendantsRecursive = (personId: number, visited = new Set<number>()) => {
              if (visited.has(personId)) return;
              visited.add(personId);
              
              // ⚠️ NE PAS ajouter les membres du couple racine comme "descendants"
              if (!rootCoupleIds.has(personId)) {
                descendantsOfCouples.add(personId);
              }
              
              persons.forEach((p: any) => {
                if (p.fatherID === personId || p.motherID === personId) {
                  collectDescendantsRecursive(p.personID, visited);
                }
              });
            };
            
            // Collecter les descendants de tous les couples
            ancestorCouples.forEach((couple: any) => {
              console.log(`📊 Collecte descendants de: ${couple.father.firstName} + ${couple.mother.firstName}`);
              collectDescendantsRecursive(couple.father.personID);
              collectDescendantsRecursive(couple.mother.personID);
            });
            
            console.log(`👥 Total descendants de couples (hors couple racine): ${descendantsOfCouples.size}`);
            
            // Trouver les conjoints de ces descendants (SAUF le couple racine)
            const spousesOfDescendants = new Set<number>();
            
            weddings.forEach((w: any) => {
              const husbandId = w.husbandID || w.manID;
              const wifeId = w.wifeID || w.womanID;
              
              if (descendantsOfCouples.has(husbandId)) {
                // ⚠️ NE PAS exclure si la femme fait partie du couple racine
                if (!rootCoupleIds.has(wifeId)) {
                  spousesOfDescendants.add(wifeId);
                  const spouse = persons.find((p: any) => p.personID === wifeId);
                  if (spouse) {
                    console.log(`💍 ${spouse.firstName} ${spouse.lastName} (ID: ${spouse.personID}) est conjoint de descendant → À exclure`);
                  }
                } else {
                  const spouse = persons.find((p: any) => p.personID === wifeId);
                  if (spouse) {
                    console.log(`🛡️ ${spouse.firstName} ${spouse.lastName} (ID: ${spouse.personID}) est du couple racine → IMMUNISÉE`);
                  }
                }
              }
              
              if (descendantsOfCouples.has(wifeId)) {
                // ⚠️ NE PAS exclure si le mari fait partie du couple racine
                if (!rootCoupleIds.has(husbandId)) {
                  spousesOfDescendants.add(husbandId);
                  const spouse = persons.find((p: any) => p.personID === husbandId);
                  if (spouse) {
                    console.log(`💍 ${spouse.firstName} ${spouse.lastName} (ID: ${spouse.personID}) est conjoint de descendant → À exclure`);
                  }
                } else {
                  const spouse = persons.find((p: any) => p.personID === husbandId);
                  if (spouse) {
                    console.log(`🛡️ ${spouse.firstName} ${spouse.lastName} (ID: ${spouse.personID}) est du couple racine → IMMUNISÉ`);
                  }
                }
              }
            });
            
            // Filtrer les ancêtres solo pour exclure les conjoints (sauf couple racine)
            soloAncestors = soloAncestors.filter((a: any) => {
              const isSpouse = spousesOfDescendants.has(a.personID);
              if (isSpouse) {
                console.log(`❌ EXCLUSION: ${a.firstName} ${a.lastName} (ID: ${a.personID}) est conjoint de descendant`);
                return false;
              }
              console.log(`✅ CONSERVÉ: ${a.firstName} ${a.lastName} (ID: ${a.personID}) est racine valide`);
              return true;
            });
            
            console.log(`✅ Ancêtres solo après nettoyage: ${soloAncestors.length}`);
            
            // 🎯 SOLUTION B: Construire l'arbre en UNE SEULE PASSE à partir du plus ancien ancêtre
            // Cela garantit que chaque personne (comme Ruben) n'apparaît QU'UNE SEULE FOIS
            console.log('\n🚀 SOLUTION B: Construction unifiée de l\'arbre à partir de l\'ancêtre le plus haut');
            
            // Trouver l'ancêtre le plus haut (priorité aux couples)
            let primaryAncestorId: number;
            
            if (ancestorCouples.length > 0) {
              // Prendre le père du premier couple comme racine
              primaryAncestorId = ancestorCouples[0].father.personID;
              console.log(`✅ Ancêtre primaire (couple): ${ancestorCouples[0].father.firstName} ${ancestorCouples[0].father.lastName} (ID: ${primaryAncestorId})`);
            } else if (soloAncestors.length > 0) {
              // Prendre le premier ancêtre solo
              primaryAncestorId = soloAncestors[0].personID;
              console.log(`✅ Ancêtre primaire (solo): ${soloAncestors[0].firstName} ${soloAncestors[0].lastName} (ID: ${primaryAncestorId})`);
            } else {
              // Fallback sur la première personne
              primaryAncestorId = persons[0].personID;
              console.log(`⚠️ Pas d'ancêtre identifié, utilisation de: ${persons[0].firstName} ${persons[0].lastName} (ID: ${primaryAncestorId})`);
            }
            
            // 🔥 NOUVELLE LOGIQUE: Utiliser buildCompleteFamily au lieu de buildExtendedFamilyTreeV2
            const { roots: rootNodes, unions: unionsMap } = buildCompleteFamily(persons, weddings);
            
            // Chercher Ruben spécifiquement
            const ruben = persons.find((p: Person) => p.firstName === 'Ruben');
            if (ruben) {
              console.log(`🎯 RUBEN trouvé (ID: ${ruben.personID})`);
              const rubenUnions = Array.from(unionsMap.values()).filter(union => 
                union.fatherId === ruben.personID || union.motherId === ruben.personID
              );
              console.log(`🔢 Ruben a ${rubenUnions.length} unions:`);
              rubenUnions.forEach((union, index) => {
                const spouse = union.fatherId === ruben.personID ? union.mother : union.father;
                console.log(`  Union ${index + 1}: Ruben + ${spouse.firstName} ${spouse.lastName}`);
              });
            }
            
            // Convertir le premier rootNode en TreeNode pour l'affichage organique
            const convertToTreeNode = (familyNode: FamilyTreeNode, processedIds = new Set<number>()): TreeNode | null => {
              if (processedIds.has(familyNode.person.personID)) {
                return null; // Éviter les cycles
              }
              processedIds.add(familyNode.person.personID);
              
              // Convertir en TreeNode
              const treeNode: TreeNode = {
                id: familyNode.person.personID,
                name: `${familyNode.person.firstName} ${familyNode.person.lastName}`,
                firstName: familyNode.person.firstName,
                lastName: familyNode.person.lastName,
                sex: familyNode.person.sex,
                alive: familyNode.person.alive,
                birthday: familyNode.person.birthday,
                deathDate: familyNode.person.deathDate,
                photoUrl: familyNode.person.photoUrl,
                generation: familyNode.generation,
                children: [],
                spouses: [],
                isRoot: familyNode.isRoot,
                hasAccount: false
              };
              
              // Ajouter les informations des conjoints
              familyNode.unions.forEach((union, unionIndex) => {
                // Déterminer qui est le conjoint (l'autre parent dans l'union)
                const spouse = union.fatherId === familyNode.person.personID ? union.mother : union.father;
                
                if (familyNode.person.firstName === 'Ruben') {
                  console.log(`👤 RUBEN Union ${unionIndex + 1}: Ruben + ${spouse.firstName} ${spouse.lastName}`);
                }
                
                if (spouse && treeNode.spouses) {
                  treeNode.spouses.push({
                    personId: spouse.personID,
                    name: `${spouse.firstName} ${spouse.lastName}`,
                    photoUrl: spouse.photoUrl,
                    weddingDate: union.weddingDate,
                    divorceDate: union.divorceDate,
                    isActive: union.isMarried
                  });
                }
              });

              // Log final pour Ruben
              if (familyNode.person.firstName === 'Ruben') {
                console.log(`✅ RUBEN TreeNode final: ${treeNode.spouses?.length} épouses dans le TreeNode`);
                treeNode.spouses?.forEach((spouse, i) => {
                  console.log(`  Épouse ${i + 1}: ${spouse.name}`);
                });
              }
              
              // Ajouter tous les enfants de toutes les unions
              familyNode.unions.forEach(union => {
                union.children.forEach(child => {
                  if (!processedIds.has(child.personID)) {
                    const childFamilyNode: FamilyTreeNode = {
                      person: child,
                      unions: [],
                      generation: familyNode.generation + 1,
                      isRoot: false
                    };
                    
                    // Rechercher les unions de cet enfant
                    unionsMap.forEach(childUnion => {
                      if (childUnion.fatherId === child.personID || childUnion.motherId === child.personID) {
                        childFamilyNode.unions.push(childUnion);
                      }
                    });
                    
                    const childTreeNode = convertToTreeNode(childFamilyNode, new Set(processedIds));
                    if (childTreeNode && treeNode.children) {
                      treeNode.children.push(childTreeNode);
                    }
                  }
                });
              });
              
              return treeNode;
            };
            
            let unifiedTree: TreeNode | null = null;
            if (rootNodes.length > 0) {
              unifiedTree = convertToTreeNode(rootNodes[0]);
              console.log('🔢 Nombre d\'arbres construits: 1 (arbre unifié avec unions)');
              console.log(`📊 Arbre unifié: Racine = ${unifiedTree?.name} (ID: ${unifiedTree?.id}), Unions = ${rootNodes[0].unions.length}`);
              console.log(`👥 Total unions dans la famille: ${unionsMap.size}`);
            }
            
            if (unifiedTree) {
              console.log('🔢 Nombre d\'arbres construits: 1 (arbre unifié)');
              console.log(`📊 Arbre unifié: Racine = ${unifiedTree.name} (ID: ${unifiedTree.id}), Enfants = ${unifiedTree.children?.length || 0}`);
              
              setTreeData(unifiedTree);
              const statistics = getTreeStatistics(unifiedTree);
              console.log('Statistiques (arbre unifié):', statistics);
              setStats(statistics);
            } else {
              console.error('❌ Échec de construction de l\'arbre unifié');
            }
          } else {
            // Un seul ancêtre ou aucun - utiliser l'approche normale
            let targetAncestorId: number;
            
            if (rootId) {
              const findOldestAncestor = (personId: number, depth: number = 0): number => {
                if (depth > 10) return personId;
                const person = persons.find((p: any) => p.personID === personId);
                if (!person) return personId;
                
                if (person.fatherID && persons.some((p: any) => p.personID === person.fatherID)) {
                  return findOldestAncestor(person.fatherID, depth + 1);
                } else if (person.motherID && persons.some((p: any) => p.personID === person.motherID)) {
                  return findOldestAncestor(person.motherID, depth + 1);
                }
                return personId;
              };
              
              targetAncestorId = findOldestAncestor(rootId);
            } else if (ancestors.length > 0) {
              targetAncestorId = ancestors[0].personID;
            } else {
              targetAncestorId = persons[0].personID;
            }
            
            console.log('Construction de l\'arbre à partir de l\'ancêtre:', targetAncestorId);
            
            const baseTree = buildExtendedFamilyTreeV2(persons, weddings, targetAncestorId, 0);
            
            if (baseTree) {
              console.log('Arbre de base construit avec succès');
              console.log('Racine:', baseTree.name);
              console.log('Nombre d\'enfants directs:', baseTree.children?.length || 0);
              
              // 🆕 PHASE 4 - ÉTAPE 1: Enrichir l'arbre avec les informations d'unions
              const enrichedTree = enrichTreeWithUnions(baseTree, persons, weddings);
              console.log('✅ Arbre enrichi avec support unions multiples');
              
              // ✅ PHASE 4 - ÉTAPE 3: Déduplication désormais faite à la source (processedNodes Map)
              console.log('✅ Un nœud unique par personne (garanti par processedNodes Map)');
              
              setTreeData(enrichedTree);
              const statistics = getTreeStatistics(enrichedTree);
              console.log('Statistiques:', statistics);
              setStats(statistics);
            } else {
              console.error('Échec de construction de l\'arbre');
            }
          }
        }
      } catch (error: any) {
        console.error('Erreur de chargement:', error);
        toast({
          title: t('common.error'),
          description: error.response?.data?.message || t('familyTree.errorLoadingTree'),
          status: 'error',
          duration: 5000
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [effectiveFocusPersonId, toast, t]);

  // Responsive dimensions
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = Math.max(800, window.innerHeight - 200);
        setDimensions({ width, height });
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Dessiner l'arbre avec D3
  useEffect(() => {
    if (!svgRef.current || !treeData) return;
    
    const { width, height } = dimensions;
    const margin = { top: 50, right: 100, bottom: 50, left: 100 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Nettoyer le SVG précédent
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Créer le SVG principal
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('background', 'linear-gradient(180deg, #E3F2FD 0%, #FFFFFF 100%)');
    
    // Ajouter les définitions (clip-paths, gradients, etc.)
    const defs = svg.append('defs');
    
    // Clip-path pour photo circulaire
    defs.append('clipPath')
      .attr('id', 'photo-clip')
      .append('circle')
      .attr('r', 50)
      .attr('cx', 0)
      .attr('cy', -15);
    
    // Gradient pour le tronc
    const trunkGradient = defs.append('linearGradient')
      .attr('id', 'trunk-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');
    
    trunkGradient.append('stop')
      .attr('offset', '0%')
      .attr('style', 'stop-color:#3E2723;stop-opacity:1');
    
    trunkGradient.append('stop')
      .attr('offset', '50%')
      .attr('style', 'stop-color:#5D4037;stop-opacity:1');
    
    trunkGradient.append('stop')
      .attr('offset', '100%')
      .attr('style', 'stop-color:#6D4C41;stop-opacity:1');
    
    // Groupe principal avec zoom et pan
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    
    svg.call(zoom as any);
    
    // Fonction pour recentrer la vue
    const resetView = () => {
      svg.transition()
        .duration(750)
        .call(zoom.transform as any, d3.zoomIdentity);
    };
    
    // Exposer resetView globalement pour les boutons
    (window as any).resetTreeView = resetView;
    
    // Créer le layout d'arbre avec disposition plus organique
    const treeLayout = d3.tree<TreeNode>()
      .size([innerWidth, innerHeight])
      .nodeSize([200, 280])  // Plus d'espacement vertical et horizontal
      .separation((a, b) => {
        // Plus d'espace entre branches pour éviter croisements
        return a.parent === b.parent ? 1.8 : 3.0;
      });
    
    const root = d3.hierarchy(treeData);
    const treeNodes = treeLayout(root);
    
    // Créer un mapping des conjoints pour affichage côte à côté
    const spousePositions = new Map();
    treeNodes.descendants().forEach(node => {
      if (node.data.spouses && node.data.spouses.length > 0) {
        node.data.spouses.forEach((spouse, index) => {
          // 🔧 CORRECTION POLYGAMIE: Décaler les épouses verticalement
          const verticalOffset = index * 200; // 200px de décalage vertical par épouse supplémentaire
          spousePositions.set(spouse.personId, {
            x: node.x + 200,  // 200px de distance horizontale pour éviter chevauchement
            y: node.y + verticalOffset, // Décalage vertical pour épouses multiples
            mainNodeX: node.x,
            mainNodeY: node.y
          });
          
          // 🎯 LOG pour debug
          if (node.data.name?.includes('RUBEN') || node.data.name?.includes('Ruben')) {
            console.log(`🎯 RUBEN épouse ${index + 1}/${node.data.spouses?.length || 0}: ${spouse.name} → Position (${node.x + 200}, ${node.y + verticalOffset})`);
          }
        });
      }
    });
    
    // 🆕 Dessiner les barres d'union entre parents (avant les enfants)
    const parentBars = g.append('g').attr('class', 'parent-union-bars');
    
    treeNodes.descendants().forEach(node => {
      if (node.data.spouses && node.data.spouses.length > 0 && node.children && node.children.length > 0) {
        node.data.spouses.forEach(spouse => {
          const spousePos = spousePositions.get(spouse.personId);
          if (spousePos) {
            // Point de départ (sous le parent principal)
            const parent1X = node.x;
            const parent1Y = node.y + 90;
            
            // Point d'arrivée (sous le conjoint)
            const parent2X = spousePos.x;
            const parent2Y = spousePos.y + 90;
            
            // Milieu entre les deux parents
            const midX = (parent1X + parent2X) / 2;
            const midY = (parent1Y + parent2Y) / 2;
            
            // Barre horizontale d'union entre les deux parents
            parentBars.append('line')
              .attr('x1', parent1X)
              .attr('y1', parent1Y)
              .attr('x2', parent2X)
              .attr('y2', parent2Y)
              .attr('stroke', '#8B4513')  // Marron comme les branches
              .attr('stroke-width', 4)
              .attr('stroke-linecap', 'round')
              .attr('opacity', 0.8);
            
            // Petite ligne verticale descendante du milieu de la barre vers les enfants
            parentBars.append('line')
              .attr('x1', midX)
              .attr('y1', midY)
              .attr('x2', midX)
              .attr('y2', midY + 30)  // 30px vers le bas
              .attr('stroke', '#8B4513')
              .attr('stroke-width', 4)
              .attr('stroke-linecap', 'round')
              .attr('opacity', 0.8);
          }
        });
      }
    });
    
    // Dessiner les liens (branches organiques avec variations)
    // 📐 PRIORITÉ 2 : Ligne de filiation part du MILIEU entre les parents
    const links = g.selectAll('.link')
      .data(treeNodes.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d => {
        const source = d.source as d3.HierarchyPointNode<TreeNode>;
        const target = d.target as d3.HierarchyPointNode<TreeNode>;
        
        // Déterminer le point de départ
        let startX = source.x;
        let startY = source.y + 90;
        
        // Si le parent a un conjoint, partir du milieu entre les deux
        if (source.data.spouses && source.data.spouses.length > 0) {
          const spouse = source.data.spouses[0];
          const spousePos = spousePositions.get(spouse.personId);
          if (spousePos) {
            // Point médian entre le parent principal et son conjoint
            startX = (source.x + spousePos.x) / 2;
            startY = source.y + 95; // Légèrement plus bas pour éviter chevauchement
          }
        }
        
        // Utiliser l'ID pour des variations cohérentes (pas aléatoires)
        const seed = source.data.id + target.data.id;
        const variation1 = ((seed % 20) - 10) * 2; // -20 à +20
        const variation2 = ((seed % 15) - 7) * 2;  // -14 à +14
        
        const controlX1 = startX + variation1;
        const controlX2 = target.x + variation2;
        
        // Courbe de Bézier cubique plus douce et prévisible
        return `M ${startX},${startY}
                C ${controlX1},${startY + 60}
                  ${controlX2},${target.y - 110}
                  ${target.x},${target.y - 90}`;
      })
      .attr('fill', 'none')
      .attr('stroke', '#8B4513')
      .attr('stroke-width', d => {
        const depth = (d.target as d3.HierarchyPointNode<TreeNode>).depth;
        return Math.max(2, 5 - depth); // Lignes plus fines
      })
      .attr('stroke-linecap', 'round')
      .attr('opacity', 0.7) // Plus transparent pour réduire la confusion
      .attr('filter', 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))');
    
    // Dessiner les nœuds (personnes)
    const nodes = g.selectAll('.node')
      .data(treeNodes.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x}, ${d.y})`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        navigate(`/person/${d.data.id}`);
      })
      .on('dblclick', (event, d) => {
        event.stopPropagation();
        // Recentrer l'arbre sur cette personne
        if (effectiveFocusPersonId !== d.data.id) {
          window.location.href = `/family-tree-organic?focus=${d.data.id}`;
        }
      });
    
    // 🎯 PHASE 4 - ÉTAPE 2: Détecter les personnes avec unions multiples
    nodes.each(function(d) {
      const nodeData = d.data as any; // Cast pour accéder aux propriétés enrichies
      if (nodeData.hasMultipleUnions) {
        console.log('🎯 Personne polygame détectée dans le rendu D3:', {
          nom: nodeData.name,
          id: nodeData.id,
          nbUnions: nodeData.unions?.length || 0,
          unions: nodeData.unions
        });
        // TODO Étape 3: Implémenter le rendu conditionnel pour unions multiples
      }
    });
    
    // Palette de couleurs vives et variées pour les cadres
    const vibrantColors = [
      '#FF6B9D', // Rose vif
      '#4ECDC4', // Turquoise
      '#FFE66D', // Jaune
      '#95E1D3', // Vert menthe
      '#F38181', // Corail
      '#AA96DA', // Lavande
      '#FCBAD3', // Rose pâle
      '#A8E6CF', // Vert doux
      '#FFD93D', // Or
      '#6BCF7F'  // Vert vif
    ];
    
    // Cadre du nœud avec bordures ondulées et couleurs vives
    nodes.each(function(d) {
      const node = d3.select(this);
      const colorIndex = d.data.id % vibrantColors.length;
      const nodeColor = vibrantColors[colorIndex];
      
      // Créer un cadre avec bords ondulés (SVG path)
      const wavyPath = `
        M -75,-85
        Q -70,-90 -65,-85
        L -15,-85
        Q -10,-90 -5,-85
        L 45,-85
        Q 50,-90 55,-85
        L 75,-85
        Q 80,-80 75,-75
        L 75,-25
        Q 80,-20 75,-15
        L 75,35
        Q 80,40 75,45
        L 75,85
        Q 70,90 65,85
        L 15,85
        Q 10,90 5,85
        L -45,85
        Q -50,90 -55,85
        L -75,85
        Q -80,80 -75,75
        L -75,25
        Q -80,20 -75,15
        L -75,-35
        Q -80,-40 -75,-45
        L -75,-75
        Q -80,-80 -75,-85
        Z
      `;
      
      // Fond blanc du cadre
      node.append('path')
        .attr('d', wavyPath)
        .attr('fill', 'white')
        .attr('stroke', nodeColor)
        .attr('stroke-width', 5)
        .style('filter', 'drop-shadow(0 6px 15px rgba(0,0,0,0.2))');
      
      // Bordure intérieure pour effet depth
      node.append('path')
        .attr('d', wavyPath)
        .attr('fill', 'none')
        .attr('stroke', nodeColor)
        .attr('stroke-width', 2)
        .attr('opacity', 0.5)
        .attr('transform', 'translate(3, 3)');
    });
    
    // Photo de profil
    nodes.append('image')
      .attr('x', -50)
      .attr('y', -65)
      .attr('width', 100)
      .attr('height', 100)
      .attr('href', d => d.data.photoUrl || '/default-avatar.svg')
      .attr('clip-path', 'url(#photo-clip)');
    
    // Overlay si décédé
    nodes.filter(d => !d.data.alive)
      .append('circle')
      .attr('r', 50)
      .attr('cy', -15)
      .attr('fill', 'rgba(0, 0, 0, 0.3)');
    
    // Nom
    nodes.append('text')
      .attr('y', 55)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('fill', '#333')
      .text(d => d.data.firstName);
    
    nodes.append('text')
      .attr('y', 72)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#666')
      .text(d => d.data.lastName);
    
    // Badge âge/dates
    nodes.append('text')
      .attr('y', 90)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', '#999')
      .text(d => {
        if (d.data.age) return `${d.data.age} ans`;
        if (d.data.birthday) {
          const year = new Date(d.data.birthday).getFullYear();
          return d.data.alive ? `né(e) ${year}` : `${year}`;
        }
        return '';
      });
    
    // Badge racine
    nodes.filter(d => d.data.isRoot)
      .append('circle')
      .attr('cx', 65)
      .attr('cy', -75)
      .attr('r', 12)
      .attr('fill', '#FFD700');
    
    nodes.filter(d => d.data.isRoot)
      .append('text')
      .attr('x', 65)
      .attr('y', -71)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .text('⭐');
    
    // Badge compte actif
    nodes.filter(d => d.data.hasAccount)
      .append('circle')
      .attr('cx', -65)
      .attr('cy', -75)
      .attr('r', 12)
      .attr('fill', '#4CAF50');
    
    nodes.filter(d => d.data.hasAccount)
      .append('text')
      .attr('x', -65)
      .attr('y', -71)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .text('✓');
    
    // Dessiner les lignes de mariage (distinctes des lignes de filiation)
    const marriageLinks = g.append('g').attr('class', 'marriage-links');
    
    treeNodes.descendants().forEach(node => {
      if (node.data.spouses && node.data.spouses.length > 0) {
        node.data.spouses.forEach(spouse => {
          const spousePos = spousePositions.get(spouse.personId);
          if (spousePos) {
            // Ligne de mariage horizontale SIMPLE avec symbole cœur
            const marriageLine = marriageLinks.append('g');
            
            // Ligne droite simple pour clarté
            marriageLine.append('line')
              .attr('x1', node.x + 85)
              .attr('y1', node.y)
              .attr('x2', spousePos.x - 85)
              .attr('y2', spousePos.y)
              .attr('stroke', '#FFD700')  // Or pour mariage
              .attr('stroke-width', 3)
              .attr('opacity', 0.8);
            
            // Symbole cœur simple au milieu
            const heartX = (node.x + spousePos.x) / 2;
            const heartY = node.y;
            
            // Cercle pour le cœur
            marriageLine.append('circle')
              .attr('cx', heartX)
              .attr('cy', heartY)
              .attr('r', 10)
              .attr('fill', '#FFD700')
              .attr('opacity', 0.9);
            
            // Emoji cœur
            marriageLine.append('text')
              .attr('x', heartX)
              .attr('y', heartY + 1)
              .attr('text-anchor', 'middle')
              .attr('dominant-baseline', 'middle')
              .style('font-size', '14px')
              .text('💕');
          }
        });
      }
    });
    
    // Dessiner les nœuds pour les conjoints (côte à côte)
    const spouseNodes = g.append('g').attr('class', 'spouse-nodes');
    
    treeNodes.descendants().forEach(node => {
      if (node.data.spouses && node.data.spouses.length > 0) {
        node.data.spouses.forEach((spouse) => {
          const spousePos = spousePositions.get(spouse.personId);
          if (spousePos) {
            const spouseNode = spouseNodes.append('g')
              .attr('class', 'spouse-node')
              .attr('transform', `translate(${spousePos.x}, ${spousePos.y})`)
              .style('cursor', 'pointer');
            
            const colorIndex = spouse.personId % vibrantColors.length;
            const spouseColor = vibrantColors[(colorIndex + 3) % vibrantColors.length]; // Décalage de couleur
            
            // Cadre ondulé pour le conjoint
            const wavyPath = `
              M -75,-85
              Q -70,-90 -65,-85
              L -15,-85
              Q -10,-90 -5,-85
              L 45,-85
              Q 50,-90 55,-85
              L 75,-85
              Q 80,-80 75,-75
              L 75,-25
              Q 80,-20 75,-15
              L 75,35
              Q 80,40 75,45
              L 75,85
              Q 70,90 65,85
              L 15,85
              Q 10,90 5,85
              L -45,85
              Q -50,90 -55,85
              L -75,85
              Q -80,80 -75,75
              L -75,25
              Q -80,20 -75,15
              L -75,-35
              Q -80,-40 -75,-45
              L -75,-75
              Q -80,-80 -75,-85
              Z
            `;
            
            spouseNode.append('path')
              .attr('d', wavyPath)
              .attr('fill', 'white')
              .attr('stroke', spouseColor)
              .attr('stroke-width', 5)
              .style('filter', 'drop-shadow(0 6px 15px rgba(0,0,0,0.2))');
            
            spouseNode.append('path')
              .attr('d', wavyPath)
              .attr('fill', 'none')
              .attr('stroke', spouseColor)
              .attr('stroke-width', 2)
              .attr('opacity', 0.5)
              .attr('transform', 'translate(3, 3)');
            
            // Photo du conjoint
            spouseNode.append('image')
              .attr('x', -50)
              .attr('y', -65)
              .attr('width', 100)
              .attr('height', 100)
              .attr('href', spouse.photoUrl || '/default-avatar.svg')
              .attr('clip-path', 'url(#photo-clip)');
            
            // Nom du conjoint
            spouseNode.append('text')
              .attr('y', 55)
              .attr('text-anchor', 'middle')
              .style('font-size', '14px')
              .style('font-weight', 'bold')
              .style('fill', '#333')
              .text(spouse.name);
            
            // Date de mariage si disponible
            if (spouse.weddingDate) {
              spouseNode.append('text')
                .attr('y', 72)
                .attr('text-anchor', 'middle')
                .style('font-size', '10px')
                .style('fill', '#999')
                .text(`⚭ ${new Date(spouse.weddingDate).getFullYear()}`);
            }
            
            // Animation
            spouseNode
              .style('opacity', 0)
              .transition()
              .duration(800)
              .delay(500)
              .style('opacity', 1);
          }
        });
      }
    });
    
    // Animation d'apparition
    nodes
      .style('opacity', 0)
      .transition()
      .duration(800)
      .delay((_d, i) => i * 50)
      .style('opacity', 1);
    
    links
      .attr('stroke-dasharray', function() {
        const length = (this as SVGPathElement).getTotalLength();
        return `${length} ${length}`;
      })
      .attr('stroke-dashoffset', function() {
        return (this as SVGPathElement).getTotalLength();
      })
      .transition()
      .duration(1000)
      .delay((_d, i) => i * 50)
      .attr('stroke-dashoffset', 0);
    
    // Ajouter des feuilles décoratives plus organiques
    const leafColors = ['#4CAF50', '#66BB6A', '#81C784', '#A5D6A7', '#8BC34A'];
    const leafCount = 50;  // Plus de feuilles pour un look plus fourni
    
    for (let i = 0; i < leafCount; i++) {
      const randomX = Math.random() * innerWidth;
      const randomY = Math.random() * innerHeight;
      const randomSize = 8 + Math.random() * 12;
      const randomColor = leafColors[Math.floor(Math.random() * leafColors.length)];
      const randomRotation = Math.random() * 360;
      
      // Forme de feuille plus réaliste (ovale pointue)
      const leafPath = `
        M 0,0
        Q ${randomSize * 0.5},${-randomSize * 0.3} ${randomSize},0
        Q ${randomSize * 0.5},${randomSize * 0.3} 0,0
      `;
      
      g.append('path')
        .attr('d', leafPath)
        .attr('transform', `translate(${randomX}, ${randomY}) rotate(${randomRotation})`)
        .attr('fill', randomColor)
        .attr('opacity', 0.4)
        .attr('filter', 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))');
      
      // Nervure centrale de la feuille
      g.append('line')
        .attr('x1', randomX)
        .attr('y1', randomY)
        .attr('x2', randomX + randomSize * Math.cos(randomRotation * Math.PI / 180))
        .attr('y2', randomY + randomSize * Math.sin(randomRotation * Math.PI / 180))
        .attr('stroke', randomColor)
        .attr('stroke-width', 1)
        .attr('opacity', 0.5);
    }
  }, [treeData, dimensions, navigate, effectiveFocusPersonId]);

  if (loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="green.500" thickness="4px" />
          <Text>{t('common.loading')}</Text>
        </VStack>
      </Box>
    );
  }

  if (!treeData) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Text color="red.500">{t('familyTree.noTreeData')}</Text>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="100%" p={0}>
        {/* En-tête avec statistiques */}
        <Box bg="white" borderBottom="1px" borderColor="gray.200" p={4}>
          <HStack justify="space-between" flexWrap="wrap">
            <VStack align="start" spacing={1}>
              <Text fontSize="2xl" fontWeight="bold" color="green.600">
                🌳 Arbre Généalogique Organique
              </Text>
              <Text fontSize="sm" color="gray.600">
                Cliquez sur une personne pour voir son profil • Double-cliquez pour recentrer
              </Text>
            </VStack>
            
            {stats && (
              <HStack spacing={2} flexWrap="wrap">
                <Tooltip label="Nombre total de personnes">
                  <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
                    👥 {stats.totalPersons}
                  </Badge>
                </Tooltip>
                <Tooltip label="Hommes">
                  <Badge colorScheme="cyan" fontSize="md" px={3} py={1}>
                    ♂ {stats.males}
                  </Badge>
                </Tooltip>
                <Tooltip label="Femmes">
                  <Badge colorScheme="pink" fontSize="md" px={3} py={1}>
                    ♀ {stats.females}
                  </Badge>
                </Tooltip>
                <Tooltip label="Vivants">
                  <Badge colorScheme="green" fontSize="md" px={3} py={1}>
                    💚 {stats.alive}
                  </Badge>
                </Tooltip>
                <Tooltip label="Décédés">
                  <Badge colorScheme="gray" fontSize="md" px={3} py={1}>
                    🕊️ {stats.deceased}
                  </Badge>
                </Tooltip>
                <Tooltip label="Générations">
                  <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
                    📊 {stats.maxGeneration + 1}
                  </Badge>
                </Tooltip>
              </HStack>
            )}
          </HStack>
        </Box>
        
        {/* Visualisation SVG */}
        <Box ref={containerRef} position="relative">
          <svg ref={svgRef} style={{ display: 'block' }} />
          
          {/* Contrôles */}
          <VStack
            position="absolute"
            top={4}
            right={4}
            spacing={2}
            bg="white"
            p={3}
            borderRadius="md"
            boxShadow="lg"
          >
            <ButtonGroup size="sm" isAttached variant="outline">
              <Tooltip label="Recentrer la vue">
                <IconButton
                  aria-label="Recentrer"
                  icon={<FaHome />}
                  onClick={() => (window as any).resetTreeView?.()}
                  colorScheme="blue"
                />
              </Tooltip>
              <Tooltip label="Zoom avant">
                <IconButton
                  aria-label="Zoom avant"
                  icon={<FaExpand />}
                  onClick={() => {
                    const svg = d3.select(svgRef.current!);
                    svg.transition().call((d3.zoom() as any).scaleBy, 1.3);
                  }}
                  colorScheme="green"
                />
              </Tooltip>
              <Tooltip label="Zoom arrière">
                <IconButton
                  aria-label="Zoom arrière"
                  icon={<FaCompress />}
                  onClick={() => {
                    const svg = d3.select(svgRef.current!);
                    svg.transition().call((d3.zoom() as any).scaleBy, 0.7);
                  }}
                  colorScheme="orange"
                />
              </Tooltip>
            </ButtonGroup>
            
            <Button
              size="sm"
              colorScheme="purple"
              width="100%"
              onClick={() => navigate('/family-tree')}
            >
              📊 Vue Standard
            </Button>
            
            <Text fontSize="xs" color="gray.600" textAlign="center">
              🖱️ Molette : Zoom
              <br />
              ✋ Glisser : Déplacer
              <br />
              👆 Click : Profil
              <br />
              👆👆 Double : Recentrer
            </Text>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
};

export default FamilyTreeOrganic;
