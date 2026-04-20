import { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Button,
  Flex,
  Link as ChakraLink,
  Slide,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'cookie_consent';

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) {
      // Petit délai pour éviter un flash au chargement
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <Slide direction="bottom" in={visible} style={{ zIndex: 9999 }}>
      <Box
        bg="white"
        borderTop="2px solid"
        borderColor="primary.200"
        boxShadow="0 -4px 20px rgba(139, 92, 246, 0.12)"
        px={{ base: 4, md: 8 }}
        py={4}
      >
        <Flex
          justify="space-between"
          align="center"
          gap={4}
          maxW="5xl"
          mx="auto"
          wrap="wrap"
        >
          <Text color="gray.700" fontSize="sm" flex={1} minW="200px">
            Cette application utilise un cookie technique httpOnly pour gérer votre
            session de connexion. Aucun cookie publicitaire ou de tracking n'est utilisé.{' '}
            <ChakraLink as={Link} to="/privacy" color="primary.600" fontWeight="600">
              En savoir plus
            </ChakraLink>
          </Text>
          <Button
            onClick={accept}
            size="sm"
            bg="primary.500"
            color="white"
            _hover={{ bg: 'primary.600' }}
            borderRadius="md"
            flexShrink={0}
          >
            J'accepte
          </Button>
        </Flex>
      </Box>
    </Slide>
  );
};

export default CookieBanner;
