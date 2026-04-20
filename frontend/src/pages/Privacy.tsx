import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Divider,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Box>
    <Heading as="h2" fontSize="xl" color="primary.700" mb={3}>
      {title}
    </Heading>
    {children}
  </Box>
);

const Privacy = () => {
  return (
    <Box minH="100vh" bg="transparent" py={12}>
      <Container maxW="3xl">
        <VStack spacing={8} align="stretch">
          <Box textAlign="center">
            <Heading as="h1" fontSize="3xl" color="primary.900" mb={2}>
              Politique de confidentialité
            </Heading>
            <Text color="gray.500" fontSize="sm">
              Dernière mise à jour : janvier 2025
            </Text>
          </Box>

          <Divider />

          <Section title="1. Qui sommes-nous ?">
            <Text color="gray.700">
              FamilyTree est une application permettant de créer et partager un arbre
              généalogique familial. Les données collectées le sont uniquement dans le
              but de faire fonctionner ce service.
            </Text>
          </Section>

          <Section title="2. Données collectées">
            <VStack align="stretch" spacing={2}>
              <Text color="gray.700">
                <strong>Données de compte :</strong> adresse email, nom d'utilisateur,
                mot de passe (chiffré bcrypt), date de création, dernière connexion.
              </Text>
              <Text color="gray.700">
                <strong>Données de profil :</strong> prénom, nom, date de naissance,
                sexe, photo de profil, profession, notes personnelles.
              </Text>
              <Text color="gray.700">
                <strong>Données de l'arbre :</strong> liens de parenté, mariages,
                événements familiaux, albums photo.
              </Text>
              <Text color="gray.700">
                <strong>Cookies techniques :</strong> un cookie httpOnly sécurisé
                contenant votre jeton d'authentification JWT. Ce cookie est strictement
                nécessaire au fonctionnement de l'application et ne peut pas être refusé.
              </Text>
            </VStack>
          </Section>

          <Section title="3. Finalité du traitement">
            <Text color="gray.700">
              Vos données sont utilisées exclusivement pour :
            </Text>
            <VStack align="stretch" spacing={1} mt={2} pl={4}>
              <Text color="gray.700">• Vous authentifier et sécuriser votre accès</Text>
              <Text color="gray.700">• Afficher votre arbre généalogique familial</Text>
              <Text color="gray.700">• Envoyer des emails de vérification et de réinitialisation de mot de passe</Text>
              <Text color="gray.700">• Assurer la sécurité et prévenir les abus</Text>
            </VStack>
            <Text color="gray.700" mt={3}>
              Vos données ne sont jamais vendues, louées ou partagées avec des tiers
              à des fins commerciales.
            </Text>
          </Section>

          <Section title="4. Vos droits (RGPD)">
            <Text color="gray.700" mb={3}>
              Conformément au Règlement Général sur la Protection des Données (RGPD),
              vous disposez des droits suivants :
            </Text>
            <VStack align="stretch" spacing={2}>
              <Text color="gray.700">
                <strong>Droit d'accès :</strong> vous pouvez télécharger toutes vos
                données depuis votre profil (Mon Profil → Exporter mes données).
              </Text>
              <Text color="gray.700">
                <strong>Droit à l'oubli :</strong> vous pouvez supprimer votre compte
                depuis votre profil (Mon Profil → Supprimer mon compte). Vos données
                d'authentification sont effacées immédiatement. Votre fiche dans l'arbre
                est anonymisée (prénom et nom conservés pour la cohérence de l'arbre
                familial).
              </Text>
              <Text color="gray.700">
                <strong>Droit de rectification :</strong> vous pouvez modifier vos
                informations à tout moment depuis Mon Profil.
              </Text>
              <Text color="gray.700">
                <strong>Droit à la portabilité :</strong> l'export de données fournit
                un fichier JSON lisible et réutilisable.
              </Text>
            </VStack>
          </Section>

          <Section title="5. Durée de conservation">
            <Text color="gray.700">
              Les données sont conservées tant que votre compte est actif. En cas de
              suppression de compte, les données d'authentification sont effacées
              immédiatement. Les données de l'arbre généalogique (prénom, nom, dates)
              sont anonymisées mais conservées pour préserver la cohérence de l'arbre
              pour les autres membres de la famille.
            </Text>
          </Section>

          <Section title="6. Sécurité">
            <VStack align="stretch" spacing={2}>
              <Text color="gray.700">• Mots de passe chiffrés avec bcrypt (coût 11)</Text>
              <Text color="gray.700">• Authentification par cookie httpOnly (protection XSS)</Text>
              <Text color="gray.700">• Communications chiffrées HTTPS en production</Text>
              <Text color="gray.700">• Limitation du nombre de tentatives de connexion</Text>
              <Text color="gray.700">• Isolation stricte des données entre familles</Text>
            </VStack>
          </Section>

          <Section title="7. Cookies">
            <Text color="gray.700">
              L'application utilise un seul cookie :{' '}
              <strong>jwt</strong> — un cookie httpOnly sécurisé contenant votre
              jeton d'authentification. Il expire après 7 jours. Ce cookie est
              techniquement nécessaire au fonctionnement du service ; il ne contient
              aucune donnée de tracking ou publicitaire.
            </Text>
          </Section>

          <Section title="8. Contact">
            <Text color="gray.700">
              Pour toute question relative à vos données personnelles ou pour exercer
              vos droits, contactez-nous à :{' '}
              <ChakraLink color="primary.600" href="mailto:familytreenoreply0@gmail.com">
                familytreenoreply0@gmail.com
              </ChakraLink>
            </Text>
          </Section>

          <Divider />

          <Box textAlign="center">
            <ChakraLink as={Link} to="/login" color="primary.600" fontSize="sm">
              ← Retour à l'accueil
            </ChakraLink>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default Privacy;
