import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  Stack,
  Text,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  VStack,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  Input,
  Avatar,
  Checkbox,
  CheckboxGroup,
  useColorModeValue,
  Icon,
  Tooltip,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { FiUsers, FiGitBranch, FiUserCheck, FiInfo } from 'react-icons/fi';
import api from '../../services/api';

interface Family {
  familyID: number;
  familyName: string;
}

interface Member {
  personID: number;
  fullName: string;
  photoUrl?: string;
}

interface TargetAudience {
  lineageType?: 'paternal' | 'maternal';
  familyIds?: number[];
  generationLevel?: number;
  ancestorIds?: number[];
  personIds?: number[];
}

interface AudienceSelectorProps {
  value: {
    visibilityType: string;
    targetAudience?: TargetAudience;
  };
  onChange: (visibilityType: string, targetAudience?: TargetAudience) => void;
}

const AudienceSelector: React.FC<AudienceSelectorProps> = ({ value, onChange }) => {
  const { t } = useTranslation();
  const [families, setFamilies] = useState<Family[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingFamilies, setLoadingFamilies] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBgColor = useColorModeValue('gray.100', 'gray.600');

  // Load families when lineage mode is selected
  useEffect(() => {
    if (value.visibilityType === 'lineage' && families.length === 0) {
      loadFamilies();
    }
  }, [value.visibilityType]);

  // Load members when generation or manual mode is selected
  useEffect(() => {
    if ((value.visibilityType === 'generation' || value.visibilityType === 'manual') && members.length === 0) {
      loadMembers();
    }
  }, [value.visibilityType]);

  const loadFamilies = async () => {
    setLoadingFamilies(true);
    try {
      const response = await api.get('/api/polls/families');
      setFamilies(response.data);
    } catch (error) {
      console.error('Error loading families:', error);
    } finally {
      setLoadingFamilies(false);
    }
  };

  const loadMembers = async () => {
    setLoadingMembers(true);
    try {
      const response = await api.get('/api/polls/members');
      setMembers(response.data);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleVisibilityChange = (newType: string) => {
    // Reset target audience when changing visibility type
    onChange(newType, undefined);
  };

  const handleLineageTypeChange = (lineageType: 'paternal' | 'maternal') => {
    onChange(value.visibilityType, {
      ...value.targetAudience,
      lineageType,
      familyIds: value.targetAudience?.familyIds || [],
    });
  };

  const handleFamilySelection = (familyIds: number[]) => {
    onChange(value.visibilityType, {
      ...value.targetAudience,
      lineageType: value.targetAudience?.lineageType || 'paternal',
      familyIds,
    });
  };

  const handleAncestorChange = (ancestorId: number) => {
    onChange(value.visibilityType, {
      ...value.targetAudience,
      ancestorIds: [ancestorId],
      generationLevel: value.targetAudience?.generationLevel,
    });
  };

  const handleGenerationLevelChange = (level: number) => {
    onChange(value.visibilityType, {
      ...value.targetAudience,
      ancestorIds: value.targetAudience?.ancestorIds || [],
      generationLevel: level > 0 ? level : undefined,
    });
  };

  const handlePersonToggle = (personId: number) => {
    const currentPersonIds = value.targetAudience?.personIds || [];
    const newPersonIds = currentPersonIds.includes(personId)
      ? currentPersonIds.filter(id => id !== personId)
      : [...currentPersonIds, personId];
    
    onChange(value.visibilityType, {
      ...value.targetAudience,
      personIds: newPersonIds,
    });
  };

  const filteredMembers = members.filter(member =>
    member.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedMembers = members.filter(member =>
    value.targetAudience?.personIds?.includes(member.personID)
  );

  return (
    <Box>
      <FormControl>
        <HStack mb={2}>
          <Icon as={FiUsers} color="purple.500" />
          <FormLabel mb={0}>{t('polls.visibilityAndParticipants')}</FormLabel>
          <Tooltip label={t('polls.visibilityInfo')} placement="top">
            <span>
              <Icon as={FiInfo} color="gray.400" cursor="help" />
            </span>
          </Tooltip>
        </HStack>
        
        <RadioGroup
          value={value.visibilityType}
          onChange={handleVisibilityChange}
        >
          <Stack spacing={3}>
            {/* All members */}
            <Box
              p={4}
              borderWidth="2px"
              borderRadius="lg"
              borderColor={value.visibilityType === 'all' ? 'purple.500' : borderColor}
              bg={value.visibilityType === 'all' ? 'purple.50' : bgColor}
              _dark={{
                bg: value.visibilityType === 'all' ? 'purple.900' : 'gray.700',
              }}
              cursor="pointer"
              _hover={{ bg: hoverBgColor }}
              onClick={() => handleVisibilityChange('all')}
            >
              <Radio value="all" colorScheme="purple">
                <VStack align="start" spacing={0}>
                  <Text fontWeight="medium">{t('polls.visibilityAll')}</Text>
                  <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                    {t('polls.visibilityAllDesc')}
                  </Text>
                </VStack>
              </Radio>
            </Box>

            {/* Lineage */}
            <Box
              p={4}
              borderWidth="2px"
              borderRadius="lg"
              borderColor={value.visibilityType === 'lineage' ? 'purple.500' : borderColor}
              bg={value.visibilityType === 'lineage' ? 'purple.50' : bgColor}
              _dark={{
                bg: value.visibilityType === 'lineage' ? 'purple.900' : 'gray.700',
              }}
            >
              <Radio value="lineage" colorScheme="purple" onClick={() => handleVisibilityChange('lineage')}>
                <VStack align="start" spacing={0}>
                  <HStack>
                    <Icon as={FiGitBranch} />
                    <Text fontWeight="medium">{t('polls.visibilityLineage')}</Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                    {t('polls.visibilityLineageDesc')}
                  </Text>
                </VStack>
              </Radio>
              
              {value.visibilityType === 'lineage' && (
                <VStack align="stretch" mt={4} ml={6} spacing={3}>
                  <FormControl>
                    <FormLabel fontSize="sm">{t('polls.lineageType')}</FormLabel>
                    <RadioGroup
                      value={value.targetAudience?.lineageType || 'paternal'}
                      onChange={(val) => handleLineageTypeChange(val as 'paternal' | 'maternal')}
                    >
                      <Stack direction="row" spacing={4}>
                        <Radio value="paternal" colorScheme="purple">
                          {t('polls.paternalLineage')}
                        </Radio>
                        <Radio value="maternal" colorScheme="purple">
                          {t('polls.maternalLineage')}
                        </Radio>
                      </Stack>
                    </RadioGroup>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm">{t('polls.selectFamilies')}</FormLabel>
                    <CheckboxGroup
                      value={value.targetAudience?.familyIds?.map(String) || []}
                      onChange={(vals) => handleFamilySelection(vals.map(Number))}
                    >
                      <Stack spacing={2}>
                        {loadingFamilies ? (
                          <Text fontSize="sm" color="gray.500">{t('common.loading')}</Text>
                        ) : families.length === 0 ? (
                          <Text fontSize="sm" color="gray.500">{t('polls.noFamiliesAvailable')}</Text>
                        ) : (
                          families.map(family => (
                            <Checkbox key={family.familyID} value={String(family.familyID)} colorScheme="purple">
                              {family.familyName}
                            </Checkbox>
                          ))
                        )}
                      </Stack>
                    </CheckboxGroup>
                  </FormControl>
                </VStack>
              )}
            </Box>

            {/* Generation */}
            <Box
              p={4}
              borderWidth="2px"
              borderRadius="lg"
              borderColor={value.visibilityType === 'generation' ? 'purple.500' : borderColor}
              bg={value.visibilityType === 'generation' ? 'purple.50' : bgColor}
              _dark={{
                bg: value.visibilityType === 'generation' ? 'purple.900' : 'gray.700',
              }}
            >
              <Radio value="generation" colorScheme="purple" onClick={() => handleVisibilityChange('generation')}>
                <VStack align="start" spacing={0}>
                  <Text fontWeight="medium">{t('polls.visibilityGeneration')}</Text>
                  <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                    {t('polls.visibilityGenerationDesc')}
                  </Text>
                </VStack>
              </Radio>
              
              {value.visibilityType === 'generation' && (
                <VStack align="stretch" mt={4} ml={6} spacing={3}>
                  <FormControl>
                    <FormLabel fontSize="sm">{t('polls.selectAncestor')}</FormLabel>
                    <Select
                      value={value.targetAudience?.ancestorIds?.[0] || ''}
                      onChange={(e) => handleAncestorChange(Number(e.target.value))}
                    >
                      {loadingMembers ? (
                        <option disabled>{t('common.loading')}</option>
                      ) : (
                        members.map(member => (
                          <option key={member.personID} value={member.personID}>
                            {member.fullName}
                          </option>
                        ))
                      )}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm">{t('polls.generationLevel')}</FormLabel>
                    <Text fontSize="xs" color="gray.500" mb={2}>
                      {t('polls.generationLevelDesc')}
                    </Text>
                    <NumberInput
                      min={0}
                      max={10}
                      value={value.targetAudience?.generationLevel || 0}
                      onChange={(_, val) => handleGenerationLevelChange(val)}
                    >
                      <NumberInputField
 />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    {value.targetAudience?.generationLevel && (
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        {value.targetAudience.generationLevel} {value.targetAudience.generationLevel === 1 ? t('polls.generation') : t('polls.generations')}
                      </Text>
                    )}
                  </FormControl>
                </VStack>
              )}
            </Box>

            {/* Manual selection */}
            <Box
              p={4}
              borderWidth="2px"
              borderRadius="lg"
              borderColor={value.visibilityType === 'manual' ? 'purple.500' : borderColor}
              bg={value.visibilityType === 'manual' ? 'purple.50' : bgColor}
              _dark={{
                bg: value.visibilityType === 'manual' ? 'purple.900' : 'gray.700',
              }}
            >
              <Radio value="manual" colorScheme="purple" onClick={() => handleVisibilityChange('manual')}>
                <VStack align="start" spacing={0}>
                  <HStack>
                    <Icon as={FiUserCheck} />
                    <Text fontWeight="medium">{t('polls.visibilityManual')}</Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                    {t('polls.visibilityManualDesc')}
                  </Text>
                </VStack>
              </Radio>
              
              {value.visibilityType === 'manual' && (
                <VStack align="stretch" mt={4} ml={6} spacing={3}>
                  {/* Search input */}
                  <FormControl>
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      size="sm"
                    />
                  </FormControl>

                  {/* Selected members */}
                  {selectedMembers.length > 0 && (
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>
                        {selectedMembers.length} {selectedMembers.length === 1 ? t('polls.membersSelected') : t('polls.membersSelected_plural')}
                      </Text>
                      <Wrap spacing={2}>
                        {selectedMembers.map(member => (
                          <WrapItem key={member.personID}>
                            <Tag size="md" colorScheme="purple" borderRadius="full">
                              <Avatar
                                src={member.photoUrl}
                                size="xs"
                                name={member.fullName}
                                ml={-1}
                                mr={2}
                              />
                              <TagLabel>{member.fullName}</TagLabel>
                              <TagCloseButton onClick={() => handlePersonToggle(member.personID)} />
                            </Tag>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </Box>
                  )}

                  {/* Member list */}
                  <Box
                    maxH="300px"
                    overflowY="auto"
                    borderWidth="1px"
                    borderRadius="md"
                    p={2}
                  >
                    {loadingMembers ? (
                      <Text fontSize="sm" color="gray.500" p={2}>{t('common.loading')}</Text>
                    ) : filteredMembers.length === 0 ? (
                      <Text fontSize="sm" color="gray.500" p={2}>
                        {searchTerm ? t('common.noResults') : t('polls.noMembersSelected')}
                      </Text>
                    ) : (
                      <Stack spacing={1}>
                        {filteredMembers.map(member => {
                          const isSelected = value.targetAudience?.personIds?.includes(member.personID);
                          return (
                            <HStack
                              key={member.personID}
                              p={2}
                              borderRadius="md"
                              cursor="pointer"
                              bg={isSelected ? 'purple.100' : 'transparent'}
                              _dark={{ bg: isSelected ? 'purple.800' : 'transparent' }}
                              _hover={{ bg: isSelected ? 'purple.200' : hoverBgColor }}
                              onClick={() => handlePersonToggle(member.personID)}
                            >
                              <Checkbox
                                isChecked={isSelected}
                                colorScheme="purple"
                                onChange={() => handlePersonToggle(member.personID)}
                              />
                              <Avatar size="sm" src={member.photoUrl} name={member.fullName} />
                              <Text fontSize="sm">{member.fullName}</Text>
                            </HStack>
                          );
                        })}
                      </Stack>
                    )}
                  </Box>
                </VStack>
              )}
            </Box>
          </Stack>
        </RadioGroup>
      </FormControl>
    </Box>
  );
};

export default AudienceSelector;
