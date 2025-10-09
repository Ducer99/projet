import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Radio,
  RadioGroup,
  Checkbox,
  CheckboxGroup,
  Stack,
  Spinner,
  useToast,
  Flex,
  Progress,
  Divider,
  Alert,
  AlertIcon,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { ArrowBackIcon, DeleteIcon } from '@chakra-ui/icons';

interface PollOption {
  optionID: number;
  optionText: string;
  voteCount: number;
  votePercentage: number;
  userVoted: boolean;
}

interface Poll {
  pollID: number;
  question: string;
  pollType: 'single' | 'multiple';
  description?: string;
  endDate?: string;
  createdAt: string;
  creatorName: string;
  creatorID: number;
  totalVoters: number;
  hasUserVoted: boolean;
  options: PollOption[];
}

const PollDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [selectedSingle, setSelectedSingle] = useState<string>('');
  const [selectedMultiple, setSelectedMultiple] = useState<string[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const userIdPerson = parseInt(localStorage.getItem('idPerson') || '0');
  const isAdmin = localStorage.getItem('role') === 'Admin';

  useEffect(() => {
    fetchPoll();
  }, [id]);

  const fetchPoll = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/polls/${id}`);
      setPoll(response.data);
    } catch (error) {
      console.error('Error fetching poll:', error);
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

  const handleVote = async () => {
    if (!poll) return;

    const optionIDs =
      poll.pollType === 'single'
        ? [parseInt(selectedSingle)]
        : selectedMultiple.map((id) => parseInt(id));

    if (optionIDs.length === 0 || optionIDs.some(isNaN)) {
      toast({
        title: t('polls.selectOne'),
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setVoting(true);
      await api.post(`/polls/${id}/vote`, { optionIDs });

      toast({
        title: t('polls.voteSuccess'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Refresh poll data
      await fetchPoll();
      setSelectedSingle('');
      setSelectedMultiple([]);
    } catch (error: any) {
      console.error('Error voting:', error);
      const message =
        error.response?.data?.message || error.response?.data || t('polls.voteError');
      toast({
        title: message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setVoting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/polls/${id}`);

      toast({
        title: t('polls.deleteSuccess'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      navigate('/polls');
    } catch (error) {
      console.error('Error deleting poll:', error);
      toast({
        title: t('polls.deleteError'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      onClose();
    }
  };

  const isPollClosed = (): boolean => {
    if (!poll?.endDate) return false;
    return new Date(poll.endDate) < new Date();
  };

  const canDelete = (): boolean => {
    if (!poll) return false;
    return isAdmin || poll.creatorID === userIdPerson;
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

  const getBarColor = (index: number): string => {
    const colors = ['#A3B18A', '#B6A6D8', '#D4A574', '#9BB5B0', '#C9ADA7'];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Spinner size="xl" color="#A3B18A" thickness="4px" />
      </Flex>
    );
  }

  if (!poll) {
    return (
      <Box maxW="800px" mx="auto" p={6}>
        <Alert status="error" borderRadius="12px">
          <AlertIcon />
          {t('polls.fetchError')}
        </Alert>
      </Box>
    );
  }

  const closed = isPollClosed();
  const canVote = !poll.hasUserVoted && !closed;

  return (
    <Box maxW="900px" mx="auto" p={6}>
      {/* Header */}
      <HStack mb={6} justify="space-between">
        <Button
          leftIcon={<ArrowBackIcon />}
          onClick={() => navigate('/polls')}
          variant="ghost"
          color="#8B7355"
        >
          {t('common.back')}
        </Button>
        {canDelete() && (
          <Button
            leftIcon={<DeleteIcon />}
            onClick={onOpen}
            colorScheme="red"
            variant="outline"
            size="sm"
          >
            {t('polls.deletePoll')}
          </Button>
        )}
      </HStack>

      {/* Poll Card */}
      <Box
        bg="white"
        border="2px solid #EDE8E3"
        borderRadius="20px"
        p={8}
        mb={6}
      >
        <VStack align="stretch" spacing={6}>
          {/* Type Badge */}
          <HStack spacing={3}>
            <Text fontSize="3xl">
              {poll.pollType === 'single' ? '🟢' : '🟣'}
            </Text>
            <Badge
              colorScheme={poll.pollType === 'single' ? 'green' : 'purple'}
              fontSize="md"
              px={4}
              py={1}
              borderRadius="full"
            >
              {poll.pollType === 'single'
                ? t('polls.singleChoice')
                : t('polls.multipleChoice')}
            </Badge>
          </HStack>

          {/* Question */}
          <Heading
            size="xl"
            color="#5A5A5A"
            fontFamily="'Cormorant Garamond', serif"
            fontWeight="600"
          >
            {poll.question}
          </Heading>

          {/* Description */}
          {poll.description && (
            <Text color="#8B7355" fontSize="md">
              {poll.description}
            </Text>
          )}

          {/* Meta Information */}
          <HStack spacing={4} fontSize="sm" color="#8B7355" flexWrap="wrap">
            <HStack>
              <Text>✍️</Text>
              <Text fontWeight="500">{poll.creatorName}</Text>
            </HStack>
            <HStack>
              <Text>👥</Text>
              <Text>
                {poll.totalVoters}{' '}
                {poll.totalVoters === 1
                  ? t('polls.voters')
                  : t('polls.voters_plural')}
              </Text>
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
          </HStack>

          <Divider borderColor="#EDE8E3" />

          {/* Voting Section */}
          {canVote ? (
            <Box>
              <Alert
                status="info"
                bg="#FFFFF0"
                borderRadius="12px"
                mb={4}
                border="1px solid #EDE8E3"
              >
                <AlertIcon color="#A3B18A" />
                <Text color="#5A5A5A">
                  {poll.pollType === 'multiple'
                    ? t('polls.canSelectMultiple')
                    : t('polls.selectOne')}
                </Text>
              </Alert>

              {poll.pollType === 'single' ? (
                <RadioGroup value={selectedSingle} onChange={setSelectedSingle}>
                  <Stack spacing={3}>
                    {poll.options.map((option) => (
                      <Box
                        key={option.optionID}
                        p={4}
                        border="2px solid"
                        borderColor={
                          selectedSingle === option.optionID.toString()
                            ? '#A3B18A'
                            : '#EDE8E3'
                        }
                        borderRadius="12px"
                        bg={
                          selectedSingle === option.optionID.toString()
                            ? '#F0F4ED'
                            : 'white'
                        }
                        cursor="pointer"
                        transition="all 0.2s"
                        _hover={{ borderColor: '#A3B18A', bg: '#F0F4ED' }}
                      >
                        <Radio value={option.optionID.toString()} size="lg" colorScheme="green">
                          <Text fontSize="md" color="#5A5A5A" fontWeight="500">
                            {option.optionText}
                          </Text>
                        </Radio>
                      </Box>
                    ))}
                  </Stack>
                </RadioGroup>
              ) : (
                <CheckboxGroup value={selectedMultiple} onChange={(values) => setSelectedMultiple(values as string[])}>
                  <Stack spacing={3}>
                    {poll.options.map((option) => (
                      <Box
                        key={option.optionID}
                        p={4}
                        border="2px solid"
                        borderColor={
                          selectedMultiple.includes(option.optionID.toString())
                            ? '#B6A6D8'
                            : '#EDE8E3'
                        }
                        borderRadius="12px"
                        bg={
                          selectedMultiple.includes(option.optionID.toString())
                            ? '#F5F3F8'
                            : 'white'
                        }
                        cursor="pointer"
                        transition="all 0.2s"
                        _hover={{ borderColor: '#B6A6D8', bg: '#F5F3F8' }}
                      >
                        <Checkbox value={option.optionID.toString()} size="lg" colorScheme="purple">
                          <Text fontSize="md" color="#5A5A5A" fontWeight="500">
                            {option.optionText}
                          </Text>
                        </Checkbox>
                      </Box>
                    ))}
                  </Stack>
                </CheckboxGroup>
              )}

              <Button
                mt={6}
                size="lg"
                bg="#A3B18A"
                color="white"
                onClick={handleVote}
                isLoading={voting}
                loadingText={t('polls.voting')}
                _hover={{ bg: '#8B9A7A' }}
                borderRadius="12px"
                width="full"
              >
                {t('polls.vote')}
              </Button>
            </Box>
          ) : (
            <Box>
              {poll.hasUserVoted && (
                <Alert
                  status="success"
                  bg="#F0F4ED"
                  borderRadius="12px"
                  mb={4}
                  border="1px solid #A3B18A"
                >
                  <AlertIcon color="#A3B18A" />
                  <Text color="#5A5A5A" fontWeight="500">
                    ✓ {t('polls.hasVoted')}
                  </Text>
                </Alert>
              )}
              {closed && (
                <Alert
                  status="warning"
                  bg="#FFF5F0"
                  borderRadius="12px"
                  mb={4}
                  border="1px solid #D4A574"
                >
                  <AlertIcon color="#D4A574" />
                  <Text color="#5A5A5A">
                    {t('polls.pollClosed')}
                  </Text>
                </Alert>
              )}

              {/* Results */}
              <Heading size="md" color="#5A5A5A" mb={4}>
                {t('polls.viewResults')}
              </Heading>
              <VStack spacing={4} align="stretch">
                {poll.options.map((option, index) => (
                  <Box key={option.optionID}>
                    <HStack justify="space-between" mb={2}>
                      <HStack spacing={2}>
                        <Text fontSize="md" color="#5A5A5A" fontWeight="500">
                          {option.optionText}
                        </Text>
                        {option.userVoted && (
                          <Badge colorScheme="blue" fontSize="xs">
                            ✓ Votre choix
                          </Badge>
                        )}
                      </HStack>
                      <HStack spacing={3} fontSize="sm" color="#8B7355">
                        <Text fontWeight="600">{option.votePercentage}%</Text>
                        <Text>
                          ({option.voteCount}{' '}
                          {option.voteCount === 1 ? t('polls.votes') : t('polls.votes_plural')})
                        </Text>
                      </HStack>
                    </HStack>
                    <Progress
                      value={option.votePercentage}
                      size="lg"
                      colorScheme="green"
                      bg="#EDE8E3"
                      borderRadius="full"
                      sx={{
                        '& > div': {
                          bg: getBarColor(index),
                        },
                      }}
                    />
                  </Box>
                ))}
              </VStack>
            </Box>
          )}
        </VStack>
      </Box>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="16px">
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color="#5A5A5A">
              {t('polls.deletePoll')}
            </AlertDialogHeader>

            <AlertDialogBody color="#8B7355">
              {t('polls.confirmDelete')}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} borderRadius="8px">
                {t('polls.cancel')}
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDelete}
                ml={3}
                borderRadius="8px"
              >
                {t('common.delete')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default PollDetail;
