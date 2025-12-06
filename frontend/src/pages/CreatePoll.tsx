import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import {
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  HStack,
  Heading,
  Text,
  Radio,
  RadioGroup,
  IconButton,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
  Divider,
} from '@chakra-ui/react';
import { ArrowBackIcon, AddIcon, DeleteIcon } from '@chakra-ui/icons';
import AudienceSelector from '../components/Polls/AudienceSelector';

interface PollOption {
  id: string;
  text: string;
}

interface TargetAudience {
  lineageType?: 'paternal' | 'maternal';
  familyIds?: number[];
  generationLevel?: number;
  ancestorIds?: number[];
  personIds?: number[];
}

const CreatePoll: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();

  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [pollType, setPollType] = useState<'single' | 'multiple'>('single');
  const [endDate, setEndDate] = useState('');
  const [options, setOptions] = useState<PollOption[]>([
    { id: '1', text: '' },
    { id: '2', text: '' },
  ]);
  const [visibilityType, setVisibilityType] = useState('all');
  const [targetAudience, setTargetAudience] = useState<TargetAudience | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const addOption = () => {
    if (options.length >= 6) {
      toast({
        title: t('polls.maxOptions'),
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    const newOption: PollOption = {
      id: Date.now().toString(),
      text: '',
    };
    setOptions([...options, newOption]);
  };

  const removeOption = (id: string) => {
    if (options.length <= 2) {
      toast({
        title: t('polls.minOptions'),
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setOptions(options.filter((opt) => opt.id !== id));
  };

  const updateOption = (id: string, text: string) => {
    setOptions(options.map((opt) => (opt.id === id ? { ...opt, text } : opt)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!question.trim()) {
      toast({
        title: t('polls.questionRequired'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const filledOptions = options.filter((opt) => opt.text.trim());
    if (filledOptions.length < 2) {
      toast({
        title: t('polls.minOptions'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (filledOptions.length > 6) {
      toast({
        title: t('polls.maxOptions'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        question: question.trim(),
        description: description.trim() || undefined,
        pollType,
        endDate: endDate || undefined,
        visibilityType,
        targetAudience: visibilityType !== 'all' ? targetAudience : undefined,
        options: filledOptions.map((opt, index) => ({
          optionText: opt.text.trim(),
          optionOrder: index + 1,
        })),
      };

      await api.post('/polls', payload);

      toast({
        title: t('polls.pollCreated'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      navigate('/polls');
    } catch (error: any) {
      console.error('Error creating poll:', error);
      toast({
        title: t('polls.createError'),
        description: error.response?.data?.message || t('common.errorOccurred'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="800px" mx="auto" p={6}>
      {/* Header */}
      <HStack mb={6}>
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
          size="xl"
          color="#A3B18A"
          fontFamily="'Cormorant Garamond', serif"
          fontWeight="600"
        >
          {t('polls.createPoll')}
        </Heading>
      </HStack>

      {/* Info Alert */}
      <Alert
        status="info"
        bg="#FFFFF0"
        border="2px solid #EDE8E3"
        borderRadius="16px"
        mb={6}
      >
        <AlertIcon color="#A3B18A" />
        <AlertDescription color="#5A5A5A">
          {t('polls.createPollInfo')}
        </AlertDescription>
      </Alert>

      {/* Form */}
      <Card borderRadius="16px" border="2px solid #EDE8E3">
        <CardBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing={6} align="stretch">
              {/* Question */}
              <FormControl isRequired>
                <FormLabel color="#5A5A5A" fontWeight="600">
                  {t('polls.question')}
                </FormLabel>
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  size="lg"
                  borderColor="#EDE8E3"
                  _focus={{ borderColor: '#A3B18A', boxShadow: 'none' }}
                  borderRadius="12px"
                />
              </FormControl>

              {/* Description */}
              <FormControl>
                <FormLabel color="#5A5A5A" fontWeight="600">
                  {t('polls.description')} ({t('common.optional')})
                </FormLabel>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  borderColor="#EDE8E3"
                  _focus={{ borderColor: '#A3B18A', boxShadow: 'none' }}
                  borderRadius="12px"
                />
              </FormControl>

              {/* Poll Type */}
              <FormControl isRequired>
                <FormLabel color="#5A5A5A" fontWeight="600">
                  {t('polls.pollType')}
                </FormLabel>
                <RadioGroup value={pollType} onChange={(val) => setPollType(val as 'single' | 'multiple')}>
                  <VStack align="stretch" spacing={3}>
                    <Card
                      borderRadius="12px"
                      border="2px solid"
                      borderColor={pollType === 'single' ? '#A3B18A' : '#EDE8E3'}
                      bg={pollType === 'single' ? '#F8FFF8' : 'white'}
                      cursor="pointer"
                      onClick={() => setPollType('single')}
                    >
                      <CardBody>
                        <HStack>
                          <Radio value="single" colorScheme="green" size="lg" />
                          <VStack align="start" spacing={1} flex={1}>
                            <HStack>
                              <Text fontSize="xl">🟢</Text>
                              <Text fontWeight="600" color="#5A5A5A">
                                {t('polls.singleChoice')}
                              </Text>
                            </HStack>
                            <Text fontSize="sm" color="#8B7355">
                              {t('polls.singleChoiceDesc')}
                            </Text>
                          </VStack>
                        </HStack>
                      </CardBody>
                    </Card>

                    <Card
                      borderRadius="12px"
                      border="2px solid"
                      borderColor={pollType === 'multiple' ? '#B6A6D8' : '#EDE8E3'}
                      bg={pollType === 'multiple' ? '#F8F8FF' : 'white'}
                      cursor="pointer"
                      onClick={() => setPollType('multiple')}
                    >
                      <CardBody>
                        <HStack>
                          <Radio value="multiple" colorScheme="purple" size="lg" />
                          <VStack align="start" spacing={1} flex={1}>
                            <HStack>
                              <Text fontSize="xl">🟣</Text>
                              <Text fontWeight="600" color="#5A5A5A">
                                {t('polls.multipleChoice')}
                              </Text>
                            </HStack>
                            <Text fontSize="sm" color="#8B7355">
                              {t('polls.multipleChoiceDesc')}
                            </Text>
                          </VStack>
                        </HStack>
                      </CardBody>
                    </Card>
                  </VStack>
                </RadioGroup>
              </FormControl>

              {/* End Date */}
              <FormControl>
                <FormLabel color="#5A5A5A" fontWeight="600">
                  {t('polls.endDate')} ({t('common.optional')})
                </FormLabel>
                <Input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  size="lg"
                  borderColor="#EDE8E3"
                  _focus={{ borderColor: '#A3B18A', boxShadow: 'none' }}
                  borderRadius="12px"
                />
                <Text fontSize="sm" color="#8B7355" mt={2}>
                  {t('polls.endDateInfo')}
                </Text>
              </FormControl>

              <Divider borderColor="#EDE8E3" />

              {/* Audience Selector */}
              <AudienceSelector
                value={{
                  visibilityType,
                  targetAudience,
                }}
                onChange={(newVisibilityType, newTargetAudience) => {
                  setVisibilityType(newVisibilityType);
                  setTargetAudience(newTargetAudience);
                }}
              />

              <Divider borderColor="#EDE8E3" />

              {/* Options */}
              <FormControl isRequired>
                <FormLabel color="#5A5A5A" fontWeight="600">
                  {t('polls.options')} ({options.length}/6)
                </FormLabel>
                <VStack spacing={3} align="stretch">
                  {options.map((option) => (
                    <HStack key={option.id}>
                      <Input
                        value={option.text}
                        onChange={(e) => updateOption(option.id, e.target.value)}
                        size="lg"
                        borderColor="#EDE8E3"
                        _focus={{ borderColor: '#A3B18A', boxShadow: 'none' }}
                        borderRadius="12px"
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        aria-label="Remove option"
                        onClick={() => removeOption(option.id)}
                        isDisabled={options.length <= 2}
                        colorScheme="red"
                        variant="ghost"
                        size="lg"
                      />
                    </HStack>
                  ))}
                </VStack>
                <Button
                  leftIcon={<AddIcon />}
                  onClick={addOption}
                  mt={3}
                  variant="outline"
                  borderColor="#A3B18A"
                  color="#A3B18A"
                  isDisabled={options.length >= 6}
                  _hover={{ bg: '#F8FFF8' }}
                  borderRadius="12px"
                >
                  {t('polls.addOption')}
                </Button>
              </FormControl>

              {/* Submit Buttons */}
              <HStack spacing={4} justify="flex-end">
                <Button
                  onClick={() => navigate('/polls')}
                  variant="outline"
                  borderColor="#EDE8E3"
                  color="#8B7355"
                  size="lg"
                  borderRadius="12px"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  bg="#A3B18A"
                  color="white"
                  size="lg"
                  isLoading={loading}
                  _hover={{ bg: '#8B9A7A' }}
                  borderRadius="12px"
                  px={8}
                >
                  {t('polls.createPoll')}
                </Button>
              </HStack>
            </VStack>
          </form>
        </CardBody>
      </Card>
    </Box>
  );
};

export default CreatePoll;
