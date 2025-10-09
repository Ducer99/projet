import { Box, Container, Heading, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

const FamilyTree = () => {
  const { t } = useTranslation();
  
  return (
    <Container maxW="container.xl" py={8}>
      <Heading size="lg" mb={4}>
        {t('familyTree.title')}
      </Heading>
      <Box
        borderWidth={1}
        borderRadius="lg"
        p={8}
        minH="600px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text fontSize="xl" color="gray.500">
          {t('familyTree.title')} - {t('common.loading')}
        </Text>
      </Box>
    </Container>
  );
};

export default FamilyTree;
