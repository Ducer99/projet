import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Spinner,
  useToast,
  Flex,
  Switch,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

interface Poll {
  pollID: number;
  question: string;
  pollType: 'single' | 'multiple';
  endDate?: string;
  createdAt: string;
  creatorName: string;
  totalVoters: number;
  hasUserVoted: boolean;
}

const PollsList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClosed, setShowClosed] = useState(false);

  useEffect(() => {
    fetchPolls();
  }, [showClosed]);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const response = await api.get('/polls', {
        params: { activeOnly: !showClosed },
      });
      setPolls(response.data);
    } catch (error) {
      console.error('Error fetching polls:', error);
      toast({
        title: t('polls.fetchError'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const isPollClosed = (poll: Poll): boolean => {
    if (!poll.endDate) return false;
    return new Date(poll.endDate) < new Date();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPollTypeIcon = (pollType: string): string => {
    return pollType === 'single' ? '🟢' : '🟣';
  };

  const getPollTypeLabel = (pollType: string): string => {
    return pollType === 'single' ? t('polls.singleChoice') : t('polls.multipleChoice');
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Spinner size="xl" color="#A3B18A" thickness="4px" />
      </Flex>
    );
  }

  return (
    <Box maxW="1200px" mx="auto" p={6}>
      {/* Header */}
      <VStack align="stretch" spacing={4} mb={8}>
        <HStack justify="space-between" align="flex-start" flexWrap="wrap" gap={4}>
          <Box>
            <Heading
              as="h1"
              size="xl"
              color="#A3B18A"
              fontFamily="'Cormorant Garamond', serif"
              fontWeight="600"
            >
              {t('polls.title')}
            </Heading>
            <Text fontSize="lg" color="#8B7355" mt={2}>
              {t('polls.subtitle')}
            </Text>
          </Box>
          <Button
            leftIcon={<AddIcon />}
            bg="#A3B18A"
            color="white"
            size="lg"
            onClick={() => navigate('/polls/create')}
            _hover={{ bg: '#8B9A7A' }}
            borderRadius="12px"
            px={6}
          >
            {t('polls.createPoll')}
          </Button>
        </HStack>

        {/* Introduction */}
        <Box
          bg="#FFFFF0"
          border="2px solid #EDE8E3"
          borderRadius="16px"
          p={6}
        >
          <Text color="#5A5A5A" mb={3}>
            {t('polls.introDescription')}
          </Text>
          <Text color="#8B7355" fontSize="sm" mb={2}>
            {t('polls.typeInfo')}
          </Text>
          <Text color="#A3B18A" fontWeight="500" fontStyle="italic">
            {t('polls.everyVoteCounts')}
          </Text>
        </Box>

        {/* Show Closed Toggle */}
        <FormControl display="flex" alignItems="center" justifyContent="flex-end">
          <FormLabel htmlFor="show-closed" mb="0" mr={3} color="#5A5A5A">
            {showClosed ? t('polls.hideClosed') : t('polls.showClosed')}
          </FormLabel>
          <Switch
            id="show-closed"
            isChecked={showClosed}
            onChange={(e) => setShowClosed(e.target.checked)}
            colorScheme="green"
            size="lg"
          />
        </FormControl>
      </VStack>

      {/* Polls List */}
      {polls.length === 0 ? (
        <Box textAlign="center" py={12}>
          <Text fontSize="6xl" mb={4}>
            🗳️
          </Text>
          <Heading size="md" color="#8B7355" mb={2}>
            {t('polls.noPollsYet')}
          </Heading>
          <Text color="#5A5A5A" mb={6}>
            {t('polls.noPollsDescription')}
          </Text>
          <Button
            leftIcon={<AddIcon />}
            bg="#A3B18A"
            color="white"
            onClick={() => navigate('/polls/create')}
            _hover={{ bg: '#8B9A7A' }}
            borderRadius="12px"
          >
            {t('polls.createPoll')}
          </Button>
        </Box>
      ) : (
        <VStack spacing={4} align="stretch">
          {polls.map((poll) => {
            const closed = isPollClosed(poll);
            return (
              <Card
                key={poll.pollID}
                borderRadius="16px"
                border="2px solid"
                borderColor={closed ? '#D4D4D4' : '#EDE8E3'}
                bg={closed ? '#F8F8F8' : 'white'}
                cursor="pointer"
                onClick={() => navigate(`/polls/${poll.pollID}`)}
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: 'lg',
                  borderColor: closed ? '#C0C0C0' : '#A3B18A',
                }}
                transition="all 0.2s"
              >
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    {/* Header with type badge and status */}
                    <HStack justify="space-between" flexWrap="wrap" gap={2}>
                      <HStack spacing={2}>
                        <Text fontSize="2xl">
                          {getPollTypeIcon(poll.pollType)}
                        </Text>
                        <Badge
                          colorScheme={poll.pollType === 'single' ? 'green' : 'purple'}
                          fontSize="sm"
                          px={3}
                          py={1}
                          borderRadius="full"
                        >
                          {getPollTypeLabel(poll.pollType)}
                        </Badge>
                      </HStack>
                      <HStack spacing={2}>
                        {poll.hasUserVoted && (
                          <Badge colorScheme="blue" fontSize="sm" px={3} py={1} borderRadius="full">
                            ✓ {t('polls.hasVoted')}
                          </Badge>
                        )}
                        {closed && (
                          <Badge colorScheme="gray" fontSize="sm" px={3} py={1} borderRadius="full">
                            {t('polls.pollClosed')}
                          </Badge>
                        )}
                        {!closed && !poll.hasUserVoted && (
                          <Badge colorScheme="orange" fontSize="sm" px={3} py={1} borderRadius="full">
                            {t('polls.notVotedYet')}
                          </Badge>
                        )}
                      </HStack>
                    </HStack>

                    {/* Question */}
                    <Heading
                      size="md"
                      color={closed ? '#8B8B8B' : '#5A5A5A'}
                      fontFamily="'Cormorant Garamond', serif"
                      fontWeight="600"
                    >
                      {poll.question}
                    </Heading>

                    {/* Meta information */}
                    <HStack
                      spacing={4}
                      fontSize="sm"
                      color={closed ? '#A0A0A0' : '#8B7355'}
                      flexWrap="wrap"
                    >
                      <HStack>
                        <Text>👤</Text>
                        <Text>
                          {poll.totalVoters}{' '}
                          {poll.totalVoters === 1
                            ? t('polls.voters')
                            : t('polls.voters_plural')}
                        </Text>
                      </HStack>
                      <HStack>
                        <Text>✍️</Text>
                        <Text>{poll.creatorName}</Text>
                      </HStack>
                      {poll.endDate && (
                        <HStack>
                          <Text>📅</Text>
                          <Text>
                            {closed ? t('polls.endedOn') : t('polls.endsOn')}{' '}
                            {formatDate(poll.endDate)}
                          </Text>
                        </HStack>
                      )}
                      {!poll.endDate && (
                        <HStack>
                          <Text>♾️</Text>
                          <Text>{t('polls.noEndDate')}</Text>
                        </HStack>
                      )}
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            );
          })}
        </VStack>
      )}
    </Box>
  );
};

export default PollsList;
