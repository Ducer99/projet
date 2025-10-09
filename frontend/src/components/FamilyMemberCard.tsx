// Composant Carte de Membre - Design moderne et émotionnel
import React from 'react';
import { Box, Avatar, Text, VStack, HStack, Badge, Icon, Flex } from '@chakra-ui/react';
import { FaHeart, FaBirthdayCake, FaMapMarkerAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

interface FamilyMemberCardProps {
  person: {
    personID: number;
    firstName: string;
    lastName: string;
    sex: string;
    birthday?: string;
    deathDate?: string;
    birthPlace?: string;
    photoUrl?: string;
    alive: boolean;
  };
  familyColor?: string;
  onClick?: () => void;
  variant?: 'tree' | 'list' | 'compact';
}

export const FamilyMemberCard: React.FC<FamilyMemberCardProps> = ({
  person,
  familyColor = '#FF6B6B',
  onClick,
  variant = 'tree'
}) => {
  const getAge = () => {
    if (!person.birthday) return null;
    const birth = new Date(person.birthday);
    const end = person.deathDate ? new Date(person.deathDate) : new Date();
    const age = end.getFullYear() - birth.getFullYear();
    return age;
  };

  const cardVariants = {
    tree: {
      width: '200px',
      minHeight: '140px',
    },
    list: {
      width: '100%',
      minHeight: '80px',
    },
    compact: {
      width: '160px',
      minHeight: '100px',
    }
  };

  return (
    <MotionBox
      onClick={onClick}
      whileHover={{ 
        scale: 1.05, 
        y: -4,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      bg="white"
      borderRadius="xl"
      boxShadow="0 2px 8px rgba(0, 0, 0, 0.08)"
      overflow="hidden"
      cursor="pointer"
      position="relative"
      {...cardVariants[variant]}
    >
      {/* Barre colorée selon la famille */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        h="4px"
        bg={familyColor}
        bgGradient={`linear(to-r, ${familyColor}, ${familyColor}88)`}
      />

      {/* Indicateur sexe (bordure subtile) */}
      <Box
        position="absolute"
        left={0}
        top="4px"
        bottom={0}
        w="3px"
        bg={person.sex === 'M' ? '#4A90E2' : '#FF6B9D'}
        opacity={0.6}
      />

      <VStack spacing={2} p={4} align="stretch">
        {/* Avatar avec overlay émotionnel */}
        <Flex justify="center" position="relative">
          <Box position="relative">
            <Avatar
              size={variant === 'compact' ? 'md' : 'lg'}
              name={`${person.firstName} ${person.lastName}`}
              src={person.photoUrl}
              bg={person.sex === 'M' ? 'blue.100' : 'pink.100'}
              color={person.sex === 'M' ? 'blue.600' : 'pink.600'}
            />
            {!person.alive && (
              <Box
                position="absolute"
                bottom={0}
                right={0}
                bg="white"
                borderRadius="full"
                p={1}
                boxShadow="sm"
              >
                <Icon as={FaHeart} boxSize={3} color="gray.400" />
              </Box>
            )}
          </Box>
        </Flex>

        {/* Nom */}
        <VStack spacing={0} textAlign="center">
          <Text
            fontWeight="600"
            fontSize={variant === 'compact' ? 'sm' : 'md'}
            color="neutral.900"
            letterSpacing="-0.02em"
            noOfLines={1}
          >
            {person.firstName}
          </Text>
          <Text
            fontSize={variant === 'compact' ? 'xs' : 'sm'}
            color="neutral.600"
            fontWeight="500"
            textTransform="uppercase"
            letterSpacing="0.05em"
            noOfLines={1}
          >
            {person.lastName}
          </Text>
        </VStack>

        {/* Informations */}
        {variant !== 'compact' && (
          <VStack spacing={1} fontSize="xs" color="neutral.500">
            {person.birthday && (
              <HStack spacing={1}>
                <Icon as={FaBirthdayCake} boxSize={3} />
                <Text>
                  {new Date(person.birthday).getFullYear()}
                  {person.deathDate && ` - ${new Date(person.deathDate).getFullYear()}`}
                  {getAge() && ` (${getAge()} ans)`}
                </Text>
              </HStack>
            )}
            {person.birthPlace && (
              <HStack spacing={1}>
                <Icon as={FaMapMarkerAlt} boxSize={3} />
                <Text noOfLines={1}>{person.birthPlace}</Text>
              </HStack>
            )}
          </VStack>
        )}

        {/* Badge statut */}
        {!person.alive && variant === 'list' && (
          <Badge
            colorScheme="gray"
            variant="subtle"
            fontSize="xs"
            px={2}
            py={1}
            borderRadius="md"
            alignSelf="flex-start"
          >
            In Memoriam
          </Badge>
        )}
      </VStack>

      {/* Effet de brillance au hover */}
      <Box
        position="absolute"
        top={0}
        left="-100%"
        w="50%"
        h="100%"
        bg="linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)"
        sx={{
          '.chakra-box:hover &': {
            left: '100%',
            transition: 'left 0.6s ease',
          }
        }}
      />
    </MotionBox>
  );
};

export default FamilyMemberCard;
