import {
  Box,
  Card,
  CardBody,
  HStack,
  VStack,
  Avatar,
  Text,
  Badge,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
} from '@chakra-ui/react';
import {
  FaEllipsisV,
  FaUserEdit,
  FaEye,
  FaCrown,
  FaStar,
  FaMale,
  FaFemale,
  FaCross,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface PersonWithPermissions {
  personID: number;
  firstName: string;
  lastName: string;
  sex: string;
  birthday: string | null;
  deathDate?: string | null;
  alive: boolean;
  photoUrl?: string | null;
  canEdit?: boolean;
  isCreator?: boolean;
  familyLineage?: 'MAIN' | 'SPOUSE' | 'BRANCH';
  mainFamilyName?: string;
}

interface MemberCardProps {
  member: PersonWithPermissions;
  onEdit?: (id: number) => void;
  onView?: (id: number) => void;
  onDelete?: (id: number) => void;
  showLineageBadge?: boolean;
}

const MemberCard: React.FC<MemberCardProps> = ({
  member,
  onEdit,
  onView,
  onDelete,
  showLineageBadge = true,
}) => {
  const navigate = useNavigate();

  const calculateAge = (birthDate: string | null, deathDate: string | null = null, isAlive: boolean = true) => {
    if (!birthDate) return null;
    if (!isAlive && !deathDate) return null;
    
    const birth = new Date(birthDate);
    const end = deathDate ? new Date(deathDate) : new Date();
    let age = end.getFullYear() - birth.getFullYear();
    const monthDiff = end.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(member.birthday, member.deathDate, member.alive);

  const getLineageBadge = () => {
    if (!showLineageBadge || !member.familyLineage) return null;

    const badges: Record<string, { label: string; colorScheme: string; icon: any }> = {
      MAIN: { label: 'Lignée Principale', colorScheme: 'yellow', icon: FaCrown },
      SPOUSE: { label: 'Époux·se', colorScheme: 'pink', icon: FaStar },
      BRANCH: { label: 'Branche', colorScheme: 'purple', icon: FaStar },
    };

    const badge = badges[member.familyLineage];
    if (!badge) return null;

    return (
      <Badge colorScheme={badge.colorScheme} fontSize="xs" px={2} borderRadius="md">
        <HStack spacing={1}>
          <Icon as={badge.icon} boxSize={3} />
          <Text>{badge.label}</Text>
        </HStack>
      </Badge>
    );
  };

  return (
    <Card
      variant="elevated"
      borderRadius="md"
      overflow="hidden"
      transition="all 0.2s"
      _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
      cursor="pointer"
      onClick={() => onView ? onView(member.personID) : navigate(`/person/${member.personID}`)}
    >
      <CardBody p={4}>
        <HStack spacing={4} align="start">
          {/* Photo de profil */}
          <Box position="relative">
            <Avatar
              size="lg"
              name={`${member.firstName} ${member.lastName}`}
              src={member.photoUrl || undefined}
              bg={member.sex === 'M' ? 'accent.male' : 'accent.female'}
              filter={!member.alive ? 'grayscale(80%)' : 'none'}
            />
            {!member.alive && (
              <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                bg="blackAlpha.600"
                borderRadius="full"
                p={1.5}
              >
                <Icon as={FaCross} boxSize={4} color="white" />
              </Box>
            )}
            {/* Badge de sexe */}
            <Icon
              as={member.sex === 'M' ? FaMale : FaFemale}
              position="absolute"
              bottom={0}
              right={0}
              boxSize={5}
              bg={member.sex === 'M' ? 'blue.500' : 'pink.500'}
              color="white"
              borderRadius="full"
              p={1}
              borderWidth={2}
              borderColor="white"
            />
          </Box>

          {/* Informations */}
          <VStack align="start" spacing={1} flex={1}>
            <Text fontWeight="bold" fontSize="lg" lineHeight="short">
              {member.firstName} {member.lastName}
            </Text>

            {/* Badges (Âge, Statut, Lignée) */}
            <HStack spacing={2} flexWrap="wrap">
              {age !== null && (
                <Badge colorScheme="blue" fontSize="xs" borderRadius="md">
                  {age} ans
                </Badge>
              )}
              {age === null && member.birthday && (
                <Badge colorScheme="gray" fontSize="xs" borderRadius="md">
                  -
                </Badge>
              )}
              <Badge
                colorScheme={member.alive ? 'green' : 'gray'}
                fontSize="xs"
                borderRadius="md"
              >
                {member.alive ? 'Vivant' : 'Décédé'}
              </Badge>
              {getLineageBadge()}
            </HStack>

            {/* Nom de famille principale (si branche) */}
            {member.mainFamilyName && member.familyLineage !== 'MAIN' && (
              <Text fontSize="xs" color="gray.600">
                Famille : {member.mainFamilyName}
              </Text>
            )}
          </VStack>

          {/* Menu Actions */}
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FaEllipsisV />}
              variant="ghost"
              size="sm"
              onClick={(e) => e.stopPropagation()}
            />
            <MenuList>
              <MenuItem
                icon={<FaEye />}
                onClick={(e) => {
                  e.stopPropagation();
                  onView ? onView(member.personID) : navigate(`/person/${member.personID}`);
                }}
              >
                Voir le profil
              </MenuItem>
              {member.canEdit && onEdit && (
                <MenuItem
                  icon={<FaUserEdit />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(member.personID);
                  }}
                >
                  Modifier
                </MenuItem>
              )}
              {onDelete && (
                <>
                  <Divider />
                  <MenuItem
                    icon={<FaCross />}
                    color="red.500"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(member.personID);
                    }}
                  >
                    Supprimer
                  </MenuItem>
                </>
              )}
            </MenuList>
          </Menu>
        </HStack>
      </CardBody>
    </Card>
  );
};

export default MemberCard;
