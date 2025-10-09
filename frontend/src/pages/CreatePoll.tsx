import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Heading,
  Text,
  VStack,
  HStack,
  Radio,
  RadioGroup,
  Stack,
  IconButton,
  useToast,
  Badge,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { ArrowBackIcon, AddIcon, DeleteIcon } from '@chakra-ui/icons';

const CreatePoll: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();

  const [question, setQuestion] = useState('');
  const [pollType, setPollType] = useState<'single' | 'multiple'>('single');
  const [description, setDescription] = useState('');
  const [endDate, setEndDate] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [creating, setCreating] = useState(false);

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const validateForm = (): boolean => {
    if (!question.trim()) {
      toast({
        title: t('polls.question'),
        description: 'La question est requise',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    const filledOptions = options.filter((opt) => opt.trim() !== '');
    if (filledOptions.length < 2) {
      toast({
        title: t('polls.minOptions'),
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (filledOptions.length > 6) {
      toast({
        title: t('polls.maxOptions'),
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const filledOptions = options.filter((opt) => opt.trim() !== '');

    const payload = {
      question: question.trim(),
      pollType,
      description: description.trim() || undefined,
      endDate: endDate || undefined,
      options: filledOptions.map((text) => ({ optionText: text.trim() })),
    };

    try {
      setCreating(true);
      const response = await api.post('/polls', payload);

      toast({
        title: t('polls.createSuccess'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      navigate(`/polls/${response.data.pollID}`);
    } catch (error: any) {
      console.error('Error creating poll:', error);
      const message =
        error.response?.data?.message || error.response?.data || t('polls.createError');
      toast({
        title: message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setCreating(false);
    }
  };

  const getMinDateTime = (): string => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  return (
    <Box maxW="800px" mx="auto" p={6}>
      {/* Header */}
      <HStack mb={6}>
        <Button
          leftIcon={<ArrowBackIcon />}
          onClick={() => navigate('/polls')}
          variant="ghost"
          color="#8B7355"
        >
          {t('common.back')}
        </Button>
      </HStack>

      {/* Form Card */}
      <Box bg="white" border="2px solid #EDE8E3" borderRadius="20px" p={8}>
        <VStack align="stretch" spacing={6}>
          <Box>
            <Heading
              size="xl"
              color="#A3B18A"
              fontFamily="'Cormorant Garamond', serif"
              fontWeight="600"
              mb={2}
            >
              {t('polls.createPoll')}
            </Heading>
            <Text color="#8B7355" fontSize="md">
              Créez un sondage pour impliquer toute la famille dans une décision
            </Text>
          </Box>

          {/* Question */}
          <FormControl isRequired>
            <FormLabel color="#5A5A5A" fontWeight="600">
              {t('polls.question')}
            </FormLabel>
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ex: Où organiser la prochaine réunion familiale ?"
              size="lg"
              borderColor="#EDE8E3"
              borderRadius="12px"
              _hover={{ borderColor: '#A3B18A' }}
              _focus={{ borderColor: '#A3B18A', boxShadow: '0 0 0 1px #A3B18A' }}
            />
          </FormControl>

          {/* Poll Type */}
          <FormControl isRequired>
            <FormLabel color="#5A5A5A" fontWeight="600">
              {t('polls.pollType')}
            </FormLabel>
            <RadioGroup value={pollType} onChange={(value) => setPollType(value as 'single' | 'multiple')}>
              <Stack spacing={3}>
                <Box
                  p={4}
                  border="2px solid"
                  borderColor={pollType === 'single' ? '#A3B18A' : '#EDE8E3'}
                  borderRadius="12px"
                  bg={pollType === 'single' ? '#F0F4ED' : 'white'}
                  cursor="pointer"
                  transition="all 0.2s"
                  onClick={() => setPollType('single')}
                >
                  <Radio value="single" size="lg" colorScheme="green">
                    <HStack spacing={2} align="flex-start">
                      <Text fontSize="xl">🟢</Text>
                      <Box>
                        <Text fontSize="md" fontWeight="600" color="#5A5A5A">
                          {t('polls.singleChoice')}
                        </Text>
                        <Text fontSize="sm" color="#8B7355">
                          {t('polls.singleChoiceDesc')}
                        </Text>
                      </Box>
                    </HStack>
                  </Radio>
                </Box>

                <Box
                  p={4}
                  border="2px solid"
                  borderColor={pollType === 'multiple' ? '#B6A6D8' : '#EDE8E3'}
                  borderRadius="12px"
                  bg={pollType === 'multiple' ? '#F5F3F8' : 'white'}
                  cursor="pointer"
                  transition="all 0.2s"
                  onClick={() => setPollType('multiple')}
                >
                  <Radio value="multiple" size="lg" colorScheme="purple">
                    <HStack spacing={2} align="flex-start">
                      <Text fontSize="xl">🟣</Text>
                      <Box>
                        <Text fontSize="md" fontWeight="600" color="#5A5A5A">
                          {t('polls.multipleChoice')}
                        </Text>
                        <Text fontSize="sm" color="#8B7355">
                          {t('polls.multipleChoiceDesc')}
                        </Text>
                      </Box>
                    </HStack>
                  </Radio>
                </Box>
              </Stack>
            </RadioGroup>
          </FormControl>

          {/* Options */}
          <FormControl isRequired>
            <FormLabel color="#5A5A5A" fontWeight="600">
              {t('polls.options')}
            </FormLabel>
            <Alert
              status="info"
              bg="#FFFFF0"
              borderRadius="12px"
              mb={3}
              border="1px solid #EDE8E3"
            >
              <AlertIcon color="#A3B18A" />
              <Text fontSize="sm" color="#5A5A5A">
                Ajoutez entre 2 et 6 options de réponse
              </Text>
            </Alert>
            <VStack spacing={3} align="stretch">
              {options.map((option, index) => (
                <HStack key={index}>
                  <Badge
                    colorScheme="gray"
                    fontSize="sm"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    {index + 1}
                  </Badge>
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`${t('polls.option')} ${index + 1}`}
                    borderColor="#EDE8E3"
                    borderRadius="12px"
                    _hover={{ borderColor: '#A3B18A' }}
                    _focus={{ borderColor: '#A3B18A', boxShadow: '0 0 0 1px #A3B18A' }}
                  />
                  {options.length > 2 && (
                    <IconButton
                      aria-label={t('polls.removeOption')}
                      icon={<DeleteIcon />}
                      onClick={() => handleRemoveOption(index)}
                      colorScheme="red"
                      variant="ghost"
                      size="sm"
                    />
                  )}
                </HStack>
              ))}
              {options.length < 6 && (
                <Button
                  leftIcon={<AddIcon />}
                  onClick={handleAddOption}
                  variant="outline"
                  borderColor="#A3B18A"
                  color="#A3B18A"
                  borderRadius="12px"
                  _hover={{ bg: '#F0F4ED' }}
                >
                  {t('polls.addOption')}
                </Button>
              )}
            </VStack>
          </FormControl>

          {/* Description (optional) */}
          <FormControl>
            <FormLabel color="#5A5A5A" fontWeight="600">
              {t('polls.pollDescription')}
            </FormLabel>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('polls.descriptionPlaceholder')}
              rows={3}
              borderColor="#EDE8E3"
              borderRadius="12px"
              _hover={{ borderColor: '#A3B18A' }}
              _focus={{ borderColor: '#A3B18A', boxShadow: '0 0 0 1px #A3B18A' }}
            />
          </FormControl>

          {/* End Date (optional) */}
          <FormControl>
            <FormLabel color="#5A5A5A" fontWeight="600">
              {t('polls.endDate')}
            </FormLabel>
            <Input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={getMinDateTime()}
              borderColor="#EDE8E3"
              borderRadius="12px"
              _hover={{ borderColor: '#A3B18A' }}
              _focus={{ borderColor: '#A3B18A', boxShadow: '0 0 0 1px #A3B18A' }}
            />
            <Text fontSize="sm" color="#8B7355" mt={2}>
              Laissez vide pour un sondage sans date limite
            </Text>
          </FormControl>

          {/* Submit Buttons */}
          <HStack spacing={3} pt={4}>
            <Button
              flex={1}
              size="lg"
              onClick={() => navigate('/polls')}
              variant="outline"
              borderColor="#EDE8E3"
              color="#8B7355"
              borderRadius="12px"
            >
              {t('polls.cancel')}
            </Button>
            <Button
              flex={1}
              size="lg"
              bg="#A3B18A"
              color="white"
              onClick={handleSubmit}
              isLoading={creating}
              loadingText={t('polls.creating')}
              _hover={{ bg: '#8B9A7A' }}
              borderRadius="12px"
            >
              {t('polls.createButton')}
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
};

export default CreatePoll;
