import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
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
  IconButton,
  Radio,
  RadioGroup,
  Checkbox,
  CheckboxGroup,
  Progress,
  Alert,
  AlertIcon,
  AlertDescription,
  Divider,
} from '@chakra-ui/react';
import { ArrowBackIcon, DeleteIcon, CheckIcon } from '@chakra-ui/icons';

interface PollOption {
  optionID: number;
  optionText: string;
  optionOrder: number;
  voteCount: number;
  votePercentage: number;
  userVoted: boolean;
}

interface PollDetail {
  pollID: number;
  question: string;
  description?: string;
  pollType: 'single' | 'multiple';
  endDate?: string;
  createdAt: string;
  creatorName: string;
  creatorID: number;
  totalVoters: number;
  hasUserVoted: boolean;
  visibilityType?: string;
  targetAudienceDescription?: string;
  options: PollOption[];
}

const PollDetail: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [poll, setPoll] = useState<PollDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  useEffect(() => {
    fetchPollDetail();
  }, [id]);

  const fetchPollDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/polls/${id}`);
      setPoll(response.data);
    } catch (error: any) {
      console.error('Error fetching poll detail:', error);
      toast({
        title: t('polls.fetchError'),
        description: error.response?.data?.message || t('common.errorOccurred'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      navigate('/polls');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!poll) return;

    let optionIds: number[] = [];

    if (poll.pollType === 'single') {
      if (!selectedOption) {
        toast({
          title: t('polls.selectOption'),
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      optionIds = [parseInt(selectedOption)];
    } else {
      if (selectedOptions.length === 0) {
        toast({
          title: t('polls.selectAtLeastOne'),
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      optionIds = selectedOptions.map((id) => parseInt(id));
    }

    try {
      setVoting(true);
      await api.post(`/polls/${id}/vote`, { optionIds });

      toast({
        title: t('polls.voteSuccess'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Refresh poll data
      fetchPollDetail();
      setSelectedOption('');
      setSelectedOptions([]);
    } catch (error: any) {
      console.error('Error voting:', error);
      toast({
        title: t('polls.voteError'),
        description: error.response?.data?.message || t('common.errorOccurred'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setVoting(false);
    }
  };

  const handleDelete = async () => {
    if (!poll) return;
    if (!window.confirm(t('polls.confirmDelete'))) return;

    try {
      await api.delete(`/polls/${id}`);

      toast({
        title: t('polls.pollDeleted'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      navigate('/polls');
    } catch (error: any) {
      console.error('Error deleting poll:', error);
      toast({
        title: t('polls.deleteError'),
        description: error.response?.data?.message || t('common.errorOccurred'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const isPollClosed = (): boolean => {
    if (!poll || !poll.endDate) return false;
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

  const getProgressColor = (index: number): string => {
    const colors = ['#A3B18A', '#B6A6D8', '#8B7355', '#EDE8E3', '#5A5A5A', '#D4A574'];
    return colors[index % colors.length];
  };

  const canDelete = (): boolean => {
    if (!poll || !user) return false;
    return poll.creatorID === user.idPerson || user.role === 'Admin';
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
        <Text>{t('polls.pollNotFound')}</Text>
      </Box>
    );
  }

  const closed = isPollClosed();
  const hasVoted = poll.hasUserVoted;

  return (
    <Box maxW="800px" mx="auto" p={6}>
      {/* Header */}
      <HStack mb={6} justify="space-between">
        <HStack>
          <IconButton
            icon={<ArrowBackIcon />}
            aria-label="Back"
            onClick={() => navigate('/polls')}
            variant="ghost"
            color="#A3B18A"
            size="lg"
          />
          <Heading
            as="h1"
            size="lg"
            color="#A3B18A"
            fontFamily="'Cormorant Garamond', serif"
            fontWeight="600"
          >
            {t('polls.pollDetails')}
          </Heading>
        </HStack>
        {canDelete() && (
          <IconButton
            icon={<DeleteIcon />}
            aria-label="Delete poll"
            onClick={handleDelete}
            colorScheme="red"
            variant="outline"
          />
        )}
      </HStack>

      {/* Poll Card */}
      <Card borderRadius="16px" border="2px solid #EDE8E3">
        <CardBody>
          <VStack align="stretch" spacing={6}>
            {/* Header with badges */}
            <HStack justify="space-between" flexWrap="wrap" gap={2}>
              <HStack spacing={2}>
                <Text fontSize="2xl">
                  {poll.pollType === 'single' ? '🟢' : '🟣'}
                </Text>
                <Badge
                  colorScheme={poll.pollType === 'single' ? 'green' : 'purple'}
                  fontSize="sm"
                  px={3}
                  py={1}
                  borderRadius="full"
                >
                  {poll.pollType === 'single'
                    ? t('polls.singleChoice')
                    : t('polls.multipleChoice')}
                </Badge>
              </HStack>
              <HStack spacing={2}>
                {hasVoted && (
                  <Badge colorScheme="blue" fontSize="sm" px={3} py={1} borderRadius="full">
                    ✓ {t('polls.hasVoted')}
                  </Badge>
                )}
                {closed && (
                  <Badge colorScheme="gray" fontSize="sm" px={3} py={1} borderRadius="full">
                    {t('polls.pollClosed')}
                  </Badge>
                )}
              </HStack>
            </HStack>

            {/* Question */}
            <Heading
              size="lg"
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

            {/* Meta information */}
            <HStack spacing={4} fontSize="sm" color="#8B7355" flexWrap="wrap">
              <HStack>
                <Text>👤</Text>
                <Text>
                  {poll.totalVoters}{' '}
                  {poll.totalVoters === 1 ? t('polls.voters') : t('polls.voters_plural')}
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

            {/* Audience targeting info */}
            {poll.targetAudienceDescription && poll.visibilityType !== 'all' && (
              <Alert status="info" bg="#F8F8FF" border="1px solid #B6A6D8" borderRadius="12px">
                <AlertIcon as={() => <Text fontSize="lg">🎯</Text>} />
                <AlertDescription color="#5A5A5A" fontSize="sm">
                  <Text as="span" fontWeight="600">{t('polls.targetedTo')}:</Text>{' '}
                  {poll.targetAudienceDescription}
                </AlertDescription>
              </Alert>
            )}

            <Divider />

            {/* Voting or Results */}
            {!hasVoted && !closed ? (
              <>
                {/* Voting Section */}
                <Alert status="info" bg="#FFFFF0" border="2px solid #EDE8E3" borderRadius="12px">
                  <AlertIcon color="#A3B18A" />
                  <AlertDescription color="#5A5A5A">
                    {poll.pollType === 'single'
                      ? t('polls.selectOneOption')
                      : t('polls.selectMultipleOptions')}
                  </AlertDescription>
                </Alert>

                {poll.pollType === 'single' ? (
                  <RadioGroup value={selectedOption} onChange={setSelectedOption}>
                    <VStack align="stretch" spacing={3}>
                      {poll.options.map((option) => (
                        <Card
                          key={option.optionID}
                          borderRadius="12px"
                          border="2px solid"
                          borderColor={
                            selectedOption === option.optionID.toString()
                              ? '#A3B18A'
                              : '#EDE8E3'
                          }
                          bg={
                            selectedOption === option.optionID.toString()
                              ? '#F8FFF8'
                              : 'white'
                          }
                          cursor="pointer"
                          onClick={() => setSelectedOption(option.optionID.toString())}
                          _hover={{ borderColor: '#A3B18A' }}
                        >
                          <CardBody>
                            <HStack>
                              <Radio
                                value={option.optionID.toString()}
                                colorScheme="green"
                                size="lg"
                              />
                              <Text color="#5A5A5A" fontWeight="500" flex={1}>
                                {option.optionText}
                              </Text>
                            </HStack>
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
                  </RadioGroup>
                ) : (
                  <CheckboxGroup value={selectedOptions} onChange={(vals) => setSelectedOptions(vals as string[])}>
                    <VStack align="stretch" spacing={3}>
                      {poll.options.map((option) => (
                        <Card
                          key={option.optionID}
                          borderRadius="12px"
                          border="2px solid"
                          borderColor={
                            selectedOptions.includes(option.optionID.toString())
                              ? '#B6A6D8'
                              : '#EDE8E3'
                          }
                          bg={
                            selectedOptions.includes(option.optionID.toString())
                              ? '#F8F8FF'
                              : 'white'
                          }
                          cursor="pointer"
                          onClick={() => {
                            const id = option.optionID.toString();
                            setSelectedOptions(
                              selectedOptions.includes(id)
                                ? selectedOptions.filter((x) => x !== id)
                                : [...selectedOptions, id]
                            );
                          }}
                          _hover={{ borderColor: '#B6A6D8' }}
                        >
                          <CardBody>
                            <HStack>
                              <Checkbox
                                value={option.optionID.toString()}
                                colorScheme="purple"
                                size="lg"
                              />
                              <Text color="#5A5A5A" fontWeight="500" flex={1}>
                                {option.optionText}
                              </Text>
                            </HStack>
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
                  </CheckboxGroup>
                )}

                <Button
                  leftIcon={<CheckIcon />}
                  onClick={handleVote}
                  isLoading={voting}
                  bg="#A3B18A"
                  color="white"
                  size="lg"
                  _hover={{ bg: '#8B9A7A' }}
                  borderRadius="12px"
                  width="full"
                >
                  {t('polls.vote')}
                </Button>
              </>
            ) : (
              <>
                {/* Results Section */}
                <Heading size="md" color="#5A5A5A">
                  {t('polls.results')}
                </Heading>

                {hasVoted && !closed && (
                  <Alert status="success" bg="#F8FFF8" border="2px solid #A3B18A" borderRadius="12px">
                    <AlertIcon color="#A3B18A" />
                    <AlertDescription color="#5A5A5A">
                      {t('polls.thankYouForVoting')}
                    </AlertDescription>
                  </Alert>
                )}

                <VStack align="stretch" spacing={4}>
                  {poll.options
                    .sort((a, b) => b.votePercentage - a.votePercentage)
                    .map((option, index) => (
                      <Card
                        key={option.optionID}
                        borderRadius="12px"
                        border="2px solid"
                        borderColor={option.userVoted ? '#A3B18A' : '#EDE8E3'}
                        bg={option.userVoted ? '#F8FFF8' : 'white'}
                      >
                        <CardBody>
                          <VStack align="stretch" spacing={2}>
                            <HStack justify="space-between">
                              <HStack>
                                {option.userVoted && (
                                  <Text color="#A3B18A" fontSize="lg">
                                    ✓
                                  </Text>
                                )}
                                <Text
                                  color="#5A5A5A"
                                  fontWeight={option.userVoted ? '600' : '500'}
                                >
                                  {option.optionText}
                                </Text>
                              </HStack>
                              <HStack>
                                <Text fontWeight="600" color="#5A5A5A">
                                  {option.votePercentage.toFixed(1)}%
                                </Text>
                                <Text fontSize="sm" color="#8B7355">
                                  ({option.voteCount}{' '}
                                  {option.voteCount === 1
                                    ? t('polls.vote')
                                    : t('polls.votes')})
                                </Text>
                              </HStack>
                            </HStack>
                            <Progress
                              value={option.votePercentage}
                              size="md"
                              borderRadius="full"
                              sx={{
                                '& > div': {
                                  backgroundColor: getProgressColor(index),
                                },
                              }}
                            />
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                </VStack>
              </>
            )}
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default PollDetail;
