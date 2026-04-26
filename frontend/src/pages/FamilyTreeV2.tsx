import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, HStack, VStack, Text, Avatar, Badge, Input, IconButton,
  Tooltip, Spinner, useToast, Button,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FamilyTree from 'react-family-tree';
import type { Node, ExtNode } from 'relatives-tree/lib/types';
import api from '../services/api';
import FamilyTreeToolbar from '../components/FamilyTreeToolbar';
import { useAuth } from '../contexts/AuthContext';

// ─── Types internes ────────────────────────────────────────────────────────────
interface Person {
  personID: number;
  firstName: string;
  lastName: string;
  sex?: 'M' | 'F';
  birthday?: string;
  deathDate?: string;
  alive?: boolean;
  photoUrl?: string;
  fatherID?: number;
  motherID?: number;
}

interface Marriage {
  weddingID?: number;
  marriageID?: number;
  manID?: number;
  womanID?: number;
  husbandID?: number;
  wifeID?: number;
  weddingDate?: string;
  divorceDate?: string;
}

// ─── Carte d'une personne dans l'arbre ────────────────────────────────────────
const NODE_WIDTH  = 140;
const NODE_HEIGHT = 90;

const PersonCard = ({
  node, persons, isFocus, onClick,
}: {
  node: ExtNode;
  persons: Person[];
  isFocus: boolean;
  onClick: (id: string) => void;
}) => {
  const person = persons.find(p => String(p.personID) === node.id);

  if (node.placeholder || !person) {
    return (
      <Box
        w={`${NODE_WIDTH}px`} h={`${NODE_HEIGHT}px`}
        position="absolute"
        left={`${node.left * (NODE_WIDTH + 20)}px`}
        top={`${node.top * (NODE_HEIGHT + 40)}px`}
        border="2px dashed" borderColor="gray.200"
        borderRadius="xl" bg="gray.50"
        display="flex" alignItems="center" justifyContent="center"
      >
        <Text fontSize="xs" color="gray.400">?</Text>
      </Box>
    );
  }

  const isFemale = person.sex === 'F';
  const displayDate = person.birthday
    ? new Date(person.birthday).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    : null;

  return (
    <Box
      position="absolute"
      left={`${node.left * (NODE_WIDTH + 20)}px`}
      top={`${node.top * (NODE_HEIGHT + 40)}px`}
      w={`${NODE_WIDTH}px`}
      cursor="pointer"
      onClick={() => onClick(node.id)}
      transition="all 0.2s"
      _hover={{ transform: 'translateY(-2px)', zIndex: 10 }}
    >
      <VStack
        spacing={1} p={2}
        bg={isFocus ? 'purple.50' : 'white'}
        border="2px solid"
        borderColor={isFocus ? 'purple.500' : isFemale ? 'pink.200' : 'blue.200'}
        borderRadius="xl"
        boxShadow={isFocus ? '0 0 0 3px rgba(159,122,234,0.3)' : 'sm'}
        align="center"
      >
        <Avatar
          size="sm"
          name={`${person.firstName} ${person.lastName}`}
          src={person.photoUrl || undefined}
          bg={isFemale ? 'pink.400' : 'blue.400'}
          color="white"
          fontWeight="700"
        />
        <Text fontSize="xs" fontWeight="700" color="gray.800" noOfLines={1} textAlign="center">
          {person.firstName}
        </Text>
        <Text fontSize="2xs" color="gray.500" noOfLines={1} textAlign="center">
          {person.lastName}
        </Text>
        {displayDate && (
          <Text fontSize="2xs" color="gray.400">{displayDate}</Text>
        )}
        {!person.alive && (
          <Badge colorScheme="gray" fontSize="2xs">†</Badge>
        )}
      </VStack>
    </Box>
  );
};

// ─── Conversion API → format react-family-tree ────────────────────────────────
const buildNodes = (persons: Person[], marriages: Marriage[]): Node[] => {
  const normalize = (m: Marriage) => ({
    id: m.weddingID ?? m.marriageID ?? 0,
    husbandID: m.husbandID ?? m.manID ?? 0,
    wifeID: m.wifeID ?? m.womanID ?? 0,
    divorced: !!m.divorceDate,
  });

  const normalizedMarriages = marriages.map(normalize);

  return persons.map(p => {
    const spouses = normalizedMarriages
      .filter(m => m.husbandID === p.personID || m.wifeID === p.personID)
      .map(m => ({
        id: String(m.husbandID === p.personID ? m.wifeID : m.husbandID),
        type: (m.divorced ? 'divorced' : 'married') as any,
      }));

    // Conjoints via enfants partagés (sans mariage enregistré)
    const childBasedSpouseIDs = new Set(spouses.map(s => s.id));
    persons
      .filter(c => c.fatherID === p.personID && c.motherID)
      .forEach(c => {
        const sid = String(c.motherID);
        if (!childBasedSpouseIDs.has(sid)) {
          spouses.push({ id: sid, type: 'blood' as any });
          childBasedSpouseIDs.add(sid);
        }
      });
    persons
      .filter(c => c.motherID === p.personID && c.fatherID)
      .forEach(c => {
        const sid = String(c.fatherID);
        if (!childBasedSpouseIDs.has(sid)) {
          spouses.push({ id: sid, type: 'blood' as any });
          childBasedSpouseIDs.add(sid);
        }
      });

    const parents: { id: string; type: any }[] = [];
    if (p.fatherID) parents.push({ id: String(p.fatherID), type: 'blood' });
    if (p.motherID) parents.push({ id: String(p.motherID), type: 'blood' });

    const children = persons
      .filter(c => c.fatherID === p.personID || c.motherID === p.personID)
      .map(c => ({ id: String(c.personID), type: 'blood' as any }));

    const siblings = persons
      .filter(s =>
        s.personID !== p.personID &&
        ((p.fatherID && s.fatherID === p.fatherID) || (p.motherID && s.motherID === p.motherID))
      )
      .map(s => ({ id: String(s.personID), type: 'blood' as any }));

    return {
      id: String(p.personID),
      gender: p.sex === 'F' ? 'female' : 'male',
      parents,
      children,
      siblings,
      spouses,
    } as Node;
  });
};

// ─── Composant principal ──────────────────────────────────────────────────────
const FamilyTreeV2: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const treeRef = useRef<HTMLDivElement>(null);

  const [persons, setPersons]     = useState<Person[]>([]);
  const [marriages, setMarriages] = useState<Marriage[]>([]);
  const [nodes, setNodes]         = useState<Node[]>([]);
  const [rootId, setRootId]       = useState<string>('');
  const [loading, setLoading]     = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // ── Chargement données ──
  useEffect(() => {
    const load = async () => {
      try {
        // Lire le user depuis localStorage directement (plus fiable qu'useAuth au montage)
        let loggedInUser: any = {};
        try { loggedInUser = JSON.parse(localStorage.getItem('user') || '{}'); } catch {}
        const familyID = loggedInUser.familyID ?? user?.familyID;
        const idPerson  = loggedInUser.idPerson  ?? user?.idPerson;

        if (!familyID) {
          setLoading(false);
          return;
        }

        const [pRes, mRes] = await Promise.all([
          api.get('/persons'),
          api.get(`/marriages/family/${familyID}`),
        ]);
        const ps: Person[] = pRes.data || [];
        const ms: Marriage[] = mRes.data || [];
        setPersons(ps);
        setMarriages(ms);
        setNodes(buildNodes(ps, ms));

        // Focus initial : paramètre URL ou propre personne
        const params = new URLSearchParams(location.search);
        const focusId = params.get('focusId');
        if (focusId) {
          setRootId(focusId);
        } else {
          const me = ps.find(p => p.personID === idPerson);
          if (me) setRootId(String(me.personID));
          else if (ps.length > 0) setRootId(String(ps[0].personID));
        }
      } catch {
        toast({ title: 'Erreur de chargement', status: 'error', duration: 3000 });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleNodeClick = useCallback((id: string) => {
    setRootId(id);
  }, []);

  const renderNode = useCallback((node: ExtNode) => (
    <PersonCard
      key={node.id}
      node={node}
      persons={persons}
      isFocus={node.id === rootId}
      onClick={handleNodeClick}
    />
  ), [persons, rootId, handleNodeClick]);

  const filteredPersons = searchTerm
    ? persons.filter(p => `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  if (loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="purple.500" />
      </Box>
    );
  }

  if (nodes.length === 0 || !rootId) {
    return (
      <Box p={8} textAlign="center">
        <Text color="gray.500">Aucun membre dans la famille.</Text>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Toolbar */}
      <HStack
        position="sticky" top={0} zIndex={100}
        bg="white" borderBottom="1px solid" borderColor="gray.100"
        px={4} py={2} justify="space-between" shadow="sm"
      >
        <Text fontWeight="700" color="purple.700" fontSize="sm">
          🌳 Arbre généalogique
        </Text>
        <HStack spacing={2}>
          {/* Recherche */}
          <Box position="relative">
            <HStack
              border="1px solid" borderColor="gray.200"
              borderRadius="lg" px={3} py={1.5} bg="gray.50" spacing={2}
            >
              <SearchIcon color="gray.400" boxSize={3.5} />
              <Input
                placeholder="Rechercher..."
                size="sm"
                border="none"
                p={0}
                bg="transparent"
                w="160px"
                _focus={{ boxShadow: 'none' }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </HStack>
            {filteredPersons.length > 0 && searchTerm && (
              <Box
                position="absolute" top="100%" left={0} right={0} zIndex={200}
                bg="white" border="1px solid" borderColor="gray.200"
                borderRadius="lg" shadow="lg" maxH="200px" overflowY="auto"
              >
                {filteredPersons.map(p => (
                  <Box
                    key={p.personID} px={3} py={2} cursor="pointer"
                    _hover={{ bg: 'purple.50' }}
                    onClick={() => { setRootId(String(p.personID)); setSearchTerm(''); }}
                  >
                    <Text fontSize="sm">{p.firstName} {p.lastName}</Text>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
          <Button size="sm" variant="ghost" colorScheme="gray" onClick={() => navigate('/persons')}>
            Membres
          </Button>
        </HStack>
      </HStack>

      {/* Arbre */}
      <Box overflow="auto" p={8}>
        <Box ref={treeRef} display="inline-block" minW="100%">
          <FamilyTree
            nodes={nodes}
            rootId={rootId}
            width={NODE_WIDTH + 20}
            height={NODE_HEIGHT + 40}
            renderNode={renderNode}
          />
        </Box>
      </Box>

      <FamilyTreeToolbar
        onZoomIn={() => {}}
        onZoomOut={() => {}}
        treeRef={treeRef as React.RefObject<HTMLDivElement>}
      />
    </Box>
  );
};

export default FamilyTreeV2;
