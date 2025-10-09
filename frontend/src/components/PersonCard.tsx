import { Box, Avatar, VStack, Text, Badge, Icon } from '@chakra-ui/react';
import { FaCross } from 'react-icons/fa';

interface PersonCardProps {
  personID: number;
  firstName: string;
  lastName: string;
  sex: string;
  birthday?: string | null;
  deathDate?: string | null;
  alive: boolean;
  photoUrl?: string;
  onClick?: () => void;
  isCurrentUser?: boolean;
}

const PersonCard = ({
  firstName,
  lastName,
  sex,
  birthday,
  deathDate,
  alive,
  photoUrl,
  onClick,
  isCurrentUser = false,
}: PersonCardProps) => {
  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(birthday || null);
  const birthYear = birthday ? new Date(birthday).getFullYear() : null;
  const deathYear = deathDate ? new Date(deathDate).getFullYear() : null;

  return (
    <Box
      p={4}
      bg={
        !alive 
          ? 'gray.50' 
          : sex === 'M' 
            ? 'blue.50' 
            : 'pink.50'
      }
      borderRadius="lg"
      borderWidth={2}
      borderColor={
        isCurrentUser 
          ? 'accent.heart' 
          : !alive 
            ? 'gray.300' 
            : sex === 'M' 
              ? 'semantic.male' 
              : 'semantic.female'
      }
      boxShadow="md"
      cursor="pointer"
      transition="all 0.3s"
      _hover={{ 
        transform: 'translateY(-4px)', 
        boxShadow: 'xl',
        borderColor: isCurrentUser ? 'accent.heart' : 'primary.500'
      }}
      onClick={onClick}
      position="relative"
    >
      {/* Badge "In Memoriam" pour les décédés */}
      {!alive && (
        <Box
          position="absolute"
          top={-2}
          right={-2}
          bg="linear-gradient(90deg, gray.700 0%, gray.500 100%)"
          color="white"
          px={3}
          py={1}
          borderRadius="full"
          fontSize="xs"
          fontWeight="bold"
          boxShadow="md"
        >
          ✝️ {birthYear && deathYear ? `${birthYear} - ${deathYear}` : 'In Memoriam'}
        </Box>
      )}

      <VStack spacing={3}>
        {/* Avatar avec overlay pour décédés */}
        <Box position="relative">
          <Avatar
            size="lg"
            name={`${firstName} ${lastName}`}
            src={photoUrl}
            bg={
              !alive 
                ? 'gray.400' 
                : sex === 'M' 
                  ? 'semantic.male' 
                  : 'semantic.female'
            }
            filter={!alive ? 'grayscale(100%) brightness(0.8)' : 'none'}
            borderWidth={!alive ? 3 : 2}
            borderColor={!alive ? 'gray.400' : 'white'}
          />
          
          {/* Croix superposée pour décédés */}
          {!alive && (
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
            >
              <Icon as={FaCross} boxSize={6} color="white" opacity={0.9} />
            </Box>
          )}
        </Box>

        {/* Nom */}
        <VStack spacing={1} textAlign="center">
          <Text 
            fontWeight="bold" 
            fontSize="md" 
            color={!alive ? 'gray.600' : 'primary.900'}
          >
            {firstName} {lastName}
          </Text>
          
          {/* Age ou années de vie */}
          {age !== null && alive && (
            <Badge colorScheme="green" fontSize="xs">
              {age} ans
            </Badge>
          )}
        </VStack>

        {/* Badge "C'est vous!" */}
        {isCurrentUser && (
          <Badge colorScheme="red" variant="solid" fontSize="xs">
            ❤️ C'est vous !
          </Badge>
        )}
      </VStack>
    </Box>
  );
};

export default PersonCard;
