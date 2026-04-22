import {
  Box,
  Card,
  CardBody,
  HStack,
  VStack,
  Avatar,
  AvatarGroup,
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
  FaEdit,
  FaTrash,
  FaHeart,
  FaRing,
  FaChild,
  FaUsers,
  FaCalendar,
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

interface Marriage {
  weddingID: number;
  manName: string;
  womanName: string;
  manID: number;
  womanID: number;
  manPhoto?: string;
  womanPhoto?: string;
  patrilinealFamilyName: string;
  status: string;
  weddingDate: string;
  endDate?: string;
  unionCount: number;
  unionTypes: string;
  children: number;
  isPolygamous: boolean;
  location?: string;
  notes?: string;
}

interface MarriageCardProps {
  marriage: Marriage;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const MarriageCard = ({ marriage, onEdit, onDelete }: MarriageCardProps) => {
  const { t } = useTranslation();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge colorScheme="green" fontSize="xs" px={2} py={1} borderRadius="md">
            <HStack spacing={1}>
              <Icon as={FaHeart} boxSize={3} />
              <Text>{t('weddings.activeStatus')}</Text>
            </HStack>
          </Badge>
        );
      case 'divorced':
        return (
          <Badge colorScheme="orange" fontSize="xs" px={2} py={1} borderRadius="md">
            {t('weddings.divorcedStatus')}
          </Badge>
        );
      case 'widowed':
        return (
          <Badge colorScheme="gray" fontSize="xs" px={2} py={1} borderRadius="md">
            {t('weddings.widowedStatus')}
          </Badge>
        );
      default:
        return (
          <Badge fontSize="xs" px={2} py={1} borderRadius="md">
            {status}
          </Badge>
        );
    }
  };

  const getUnionTypeBadge = (unionTypes: string) => {
    const types = unionTypes.split(',').map((type) => type.trim());
    const uniqueTypes = [...new Set(types)];

    return (
      <HStack spacing={1} wrap="wrap">
        {uniqueTypes.map((type, index) => (
          <Badge
            key={index}
            colorScheme="purple"
            variant="subtle"
            fontSize="xs"
            px={2}
            py={0.5}
            borderRadius="md"
          >
            {type}
          </Badge>
        ))}
      </HStack>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    if (d.getFullYear() <= 1900) return 'Date inconnue';
    return d.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card
      bg="rgba(255, 255, 255, 0.8)"
      backdropFilter="blur(10px)"
      border="1px solid"
      borderColor="rgba(139, 92, 246, 0.2)"
      borderRadius="md"
      transition="all 0.2s"
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: 'lg',
        borderColor: 'primary.300',
      }}
    >
      <CardBody>
        <VStack align="stretch" spacing={4}>
          {/* Header avec couple et menu */}
          <HStack justify="space-between" align="start">
            <HStack spacing={3} flex={1}>
              {/* Avatars du couple */}
              <AvatarGroup size="md" max={2}>
                <Avatar
                  name={marriage.manName}
                  src={marriage.manPhoto}
                  border="2px solid"
                  borderColor="blue.400"
                />
                <Avatar
                  name={marriage.womanName}
                  src={marriage.womanPhoto}
                  border="2px solid"
                  borderColor="pink.400"
                />
              </AvatarGroup>

              {/* Noms du couple */}
              <VStack align="start" spacing={0} flex={1}>
                <HStack spacing={1}>
                  <Icon as={FaHeart} color="pink.400" boxSize={3} />
                  <Text fontWeight="600" fontSize="sm" color="gray.800">
                    {marriage.manName}
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    &
                  </Text>
                  <Text fontWeight="600" fontSize="sm" color="gray.800">
                    {marriage.womanName}
                  </Text>
                </HStack>
                <Text fontSize="xs" color="gray.600">
                  {marriage.patrilinealFamilyName}
                </Text>
              </VStack>
            </HStack>

            {/* Menu actions */}
            {(onEdit || onDelete) && (
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<FaEllipsisV />}
                  variant="ghost"
                  size="sm"
                  aria-label="Actions"
                />
                <MenuList>
                  {onEdit && (
                    <MenuItem icon={<FaEdit />} onClick={() => onEdit(marriage.weddingID)}>
                      {t('common.edit')}
                    </MenuItem>
                  )}
                  {onDelete && (
                    <MenuItem
                      icon={<FaTrash />}
                      color="red.500"
                      onClick={() => onDelete(marriage.weddingID)}
                    >
                      {t('common.delete')}
                    </MenuItem>
                  )}
                </MenuList>
              </Menu>
            )}
          </HStack>

          <Divider />

          {/* Informations principales */}
          <VStack align="stretch" spacing={3}>
            {/* Date de mariage */}
            <HStack justify="space-between">
              <HStack spacing={2}>
                <Icon as={FaCalendar} color="primary.500" boxSize={4} />
                <Text fontSize="sm" color="gray.600">
                  {t('weddings.weddingDate')}
                </Text>
              </HStack>
              <Text fontSize="sm" fontWeight="500" color="gray.800">
                {formatDate(marriage.weddingDate)}
              </Text>
            </HStack>

            {/* Nombre d'enfants */}
            <HStack justify="space-between">
              <HStack spacing={2}>
                <Icon as={FaChild} color="orange.400" boxSize={4} />
                <Text fontSize="sm" color="gray.600">
                  {t('weddings.children')}
                </Text>
              </HStack>
              <Badge colorScheme="orange" fontSize="sm" px={2} py={0.5} borderRadius="md">
                {marriage.children}
              </Badge>
            </HStack>

            {/* Type d'union */}
            {marriage.unionTypes && (
              <HStack justify="space-between" align="start">
                <HStack spacing={2}>
                  <Icon as={FaRing} color="purple.400" boxSize={4} />
                  <Text fontSize="sm" color="gray.600">
                    {t('weddings.type')}
                  </Text>
                </HStack>
                {getUnionTypeBadge(marriage.unionTypes)}
              </HStack>
            )}

            {/* Union polygame */}
            {marriage.isPolygamous && (
              <HStack justify="space-between">
                <HStack spacing={2}>
                  <Icon as={FaUsers} color="yellow.500" boxSize={4} />
                  <Text fontSize="sm" color="gray.600">
                    {t('weddings.unionCount')}
                  </Text>
                </HStack>
                <Badge colorScheme="yellow" fontSize="sm" px={2} py={0.5} borderRadius="md">
                  {marriage.unionCount} {t('weddings.unions')}
                </Badge>
              </HStack>
            )}
          </VStack>

          {/* Status badge */}
          <Box pt={2}>{getStatusBadge(marriage.status)}</Box>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default MarriageCard;
