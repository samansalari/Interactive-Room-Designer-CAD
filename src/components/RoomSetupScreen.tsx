import React, { useState, useEffect } from 'react';
import { AppScreen, RoomDimensions, RoomTemplate, BasementStructure } from '../types';
import { useRoom } from '../context/RoomContext';
import { useSettings } from '../context/SettingsContext';
import { defaultRoomTemplates, defaultBasementStructures } from '../utils/defaults';
import { convertMeasurement } from '../utils/measurements';
import { ChevronRight, AlertTriangle, ArrowLeft, Upload } from 'lucide-react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Input,
  InputGroup,
  InputRightAddon,
  Text,
  Alert,
  AlertIcon,
  useColorModeValue,
  Flex,
  Image,
  IconButton,
  VStack,
  Divider,
  useToast,
} from '@chakra-ui/react';

interface RoomSetupScreenProps {
  navigateTo: (screen: AppScreen) => void;
}

const RoomSetupScreen: React.FC<RoomSetupScreenProps> = ({ navigateTo }) => {
  const { designState, setRoomDimensions } = useRoom();
  const { settings } = useSettings();
  const toast = useToast();
  const [roomName, setRoomName] = useState('Untitled Room');
  const [width, setWidth] = useState(designState.room.width.toString());
  const [height, setHeight] = useState(designState.room.height.toString());
  const [canvasWidth, setCanvasWidth] = useState(designState.room.canvasWidth?.toString() || '800');
  const [canvasHeight, setCanvasHeight] = useState(designState.room.canvasHeight?.toString() || '600');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSizeWarning, setShowSizeWarning] = useState(false);
  const [selectedBasement, setSelectedBasement] = useState<BasementStructure | null>(null);

  const bg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.900', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.300');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('gray.100', 'gray.700');
  const inputBg = useColorModeValue('white', 'gray.700');

  useEffect(() => {
    const numWidth = parseFloat(width) || 0;
    const numHeight = parseFloat(height) || 0;
    const sqFt = numWidth * numHeight;
    setShowSizeWarning(sqFt > 1000);
  }, [width, height]);

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWidth(e.target.value);
    setSelectedTemplate(null);
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHeight(e.target.value);
    setSelectedTemplate(null);
  };

  const handleCanvasWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCanvasWidth(e.target.value);
  };

  const handleCanvasHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCanvasHeight(e.target.value);
  };

  const handleTemplateSelect = (template: RoomTemplate) => {
    setSelectedTemplate(template.id);
    
    let templateWidth = template.dimensions.width;
    let templateHeight = template.dimensions.height;
    
    if (settings.unitSystem === 'imperial') {
      templateWidth = convertMeasurement(templateWidth, 'cm', 'ft');
      templateHeight = convertMeasurement(templateHeight, 'cm', 'ft');
    }
    
    setWidth(templateWidth.toString());
    setHeight(templateHeight.toString());
    setCanvasWidth(template.dimensions.canvasWidth?.toString() || '800');
    setCanvasHeight(template.dimensions.canvasHeight?.toString() || '600');
  };

  const handleBasementSelect = (basement: BasementStructure) => {
    setSelectedBasement(basement);
  };

  const handleBasementUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image size should be less than 5MB',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const customBasement: BasementStructure = {
            id: 'custom-' + Date.now(),
            type: 'custom',
            imageUrl: event.target.result as string,
            width: 250,
            height: 180,
            x: 0,
            y: 0,
            rotation: 0,
          };
          setSelectedBasement(customBasement);
          toast({
            title: 'Image uploaded successfully',
            status: 'success',
            duration: 2000,
          });
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to process the image',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleSubmit = () => {
    const numWidth = parseFloat(width);
    const numHeight = parseFloat(height);
    const numCanvasWidth = parseFloat(canvasWidth);
    const numCanvasHeight = parseFloat(canvasHeight);
    
    if (isNaN(numWidth) || isNaN(numHeight) || numWidth <= 0 || numHeight <= 0) {
      toast({
        title: 'Invalid dimensions',
        description: 'Please enter valid room dimensions',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (isNaN(numCanvasWidth) || isNaN(numCanvasHeight) || numCanvasWidth <= 0 || numCanvasHeight <= 0) {
      toast({
        title: 'Invalid canvas dimensions',
        description: 'Please enter valid canvas dimensions',
        status: 'error',
        duration: 3000,
      });
      return;
    }
    
    const newRoom: RoomDimensions = {
      width: numWidth,
      height: numHeight,
      shape: 'rectangle',
      canvasWidth: numCanvasWidth,
      canvasHeight: numCanvasHeight,
      basement: selectedBasement || undefined,
    };

    // If a template is selected, add its image as background
    if (selectedTemplate) {
      const template = defaultRoomTemplates.find(t => t.id === selectedTemplate);
      if (template) {
        newRoom.templateImage = template.thumbnail;
      }
    }
    
    setRoomDimensions(newRoom);
    navigateTo('designer');
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <Box w="full" display="flex" flexDir="column" alignItems="center" justifyContent="center" p={6}>
      <Container maxW="4xl">
        <Box bg={bg} rounded="xl" shadow="lg" overflow="hidden" transition="background-color 0.3s">
          <Box p={8}>
            <Flex align="center" mb={6}>
              <IconButton
                aria-label="Go back"
                icon={<ArrowLeft size={24} />}
                onClick={handleBack}
                variant="ghost"
                mr={4}
                color="custom.darkGreen"
                _hover={{ bg: 'gray.100' }}
                _dark={{
                  color: 'custom.sand',
                  _hover: { bg: 'gray.700' }
                }}
              />
              <Heading as="h1" size="xl" color={textColor}>
                Set Up Your Room
              </Heading>
            </Flex>
            
            <FormControl mb={6}>
              <FormLabel color={textColor}>Room Name</FormLabel>
              <Input
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name"
                bg={inputBg}
                borderColor={borderColor}
              />
            </FormControl>
            
            <Flex gap={4} mb={6}>
              <Button
                flex="1"
                variant={!showTemplates ? 'solid' : 'outline'}
                onClick={() => setShowTemplates(false)}
              >
                Exact Dimensions
              </Button>
              <Button
                flex="1"
                variant={showTemplates ? 'solid' : 'outline'}
                onClick={() => setShowTemplates(true)}
              >
                Use Template
              </Button>
            </Flex>
            
            {!showTemplates ? (
              <Box>
                <VStack spacing={6} align="stretch">
                  <Box>
                    <Heading as="h3" size="md" mb={4} color={textColor}>
                      Room Dimensions
                    </Heading>
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                      <FormControl>
                        <FormLabel color={textColor}>Width</FormLabel>
                        <InputGroup>
                          <Input
                            type="number"
                            value={width}
                            onChange={handleWidthChange}
                            min="1"
                            step="0.01"
                            bg={inputBg}
                            borderColor={borderColor}
                          />
                          <InputRightAddon children={settings.unitSystem === 'metric' ? 'cm' : 'ft'} />
                        </InputGroup>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel color={textColor}>Height</FormLabel>
                        <InputGroup>
                          <Input
                            type="number"
                            value={height}
                            onChange={handleHeightChange}
                            min="1"
                            step="0.01"
                            bg={inputBg}
                            borderColor={borderColor}
                          />
                          <InputRightAddon children={settings.unitSystem === 'metric' ? 'cm' : 'ft'} />
                        </InputGroup>
                      </FormControl>
                    </Grid>
                  </Box>

                  <Divider />

                  <Box>
                    <Heading as="h3" size="md" mb={4} color={textColor}>
                      Canvas Dimensions
                    </Heading>
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                      <FormControl>
                        <FormLabel color={textColor}>Canvas Width</FormLabel>
                        <InputGroup>
                          <Input
                            type="number"
                            value={canvasWidth}
                            onChange={handleCanvasWidthChange}
                            min="1"
                            step="1"
                            bg={inputBg}
                            borderColor={borderColor}
                          />
                          <InputRightAddon children="px" />
                        </InputGroup>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel color={textColor}>Canvas Height</FormLabel>
                        <InputGroup>
                          <Input
                            type="number"
                            value={canvasHeight}
                            onChange={handleCanvasHeightChange}
                            min="1"
                            step="1"
                            bg={inputBg}
                            borderColor={borderColor}
                          />
                          <InputRightAddon children="px" />
                        </InputGroup>
                      </FormControl>
                    </Grid>
                  </Box>
                </VStack>
                
                {showSizeWarning && (
                  <Alert status="warning" rounded="md" mt={4}>
                    <AlertIcon />
                    <Text fontSize="sm">
                      Room size exceeds 1,000 sq ft. For best performance, consider using a smaller size.
                    </Text>
                  </Alert>
                )}
              </Box>
            ) : (
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={4}>
                {defaultRoomTemplates.map((template) => (
                  <Box
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    borderWidth={1}
                    borderColor={selectedTemplate === template.id ? 'custom.darkGreen' : borderColor}
                    rounded="md"
                    overflow="hidden"
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{ shadow: 'md' }}
                    position="relative"
                  >
                    <Box h="32" bg={cardBg}>
                      <Image
                        src={template.thumbnail}
                        alt={template.name}
                        w="full"
                        h="full"
                        objectFit="cover"
                      />
                    </Box>
                    <Box p={3}>
                      <Text fontWeight="medium" color={textColor}>
                        {template.name}
                      </Text>
                      <Text fontSize="sm" color={mutedTextColor}>
                        {template.dimensions.width} x {template.dimensions.height}
                        {settings.unitSystem === 'metric' ? ' cm' : ' ft'}
                      </Text>
                    </Box>
                  </Box>
                ))}
              </Grid>
            )}
            
            <VStack spacing={6} align="stretch" mt={8}>
              <Heading as="h2" size="md" color={textColor}>
                Basement Structure (Optional)
              </Heading>
              
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={4}>
                {defaultBasementStructures.map((structure) => (
                  <Box
                    key={structure.id}
                    onClick={() => handleBasementSelect(structure)}
                    borderWidth={1}
                    borderColor={selectedBasement?.id === structure.id ? 'custom.darkGreen' : borderColor}
                    rounded="md"
                    overflow="hidden"
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{ shadow: 'md' }}
                  >
                    <Box h="32" bg={cardBg}>
                      <Image
                        src={structure.imageUrl}
                        alt="Basement structure"
                        w="full"
                        h="full"
                        objectFit="cover"
                      />
                    </Box>
                    <Box p={3}>
                      <Text fontWeight="medium" color={textColor}>
                        Basement Structure {structure.id.split('-')[1]}
                      </Text>
                      <Text fontSize="sm" color={mutedTextColor}>
                        {structure.width} x {structure.height}
                        {settings.unitSystem === 'metric' ? ' cm' : ' ft'}
                      </Text>
                    </Box>
                  </Box>
                ))}
                
                <Box
                  as="label"
                  htmlFor="custom-basement"
                  borderWidth={1}
                  borderColor={borderColor}
                  borderStyle="dashed"
                  rounded="md"
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{ shadow: 'md', borderColor: 'custom.darkGreen' }}
                  h="full"
                  display="flex"
                  flexDir="column"
                  alignItems="center"
                  justifyContent="center"
                  p={4}
                  role="button"
                >
                  <Input
                    type="file"
                    id="custom-basement"
                    accept="image/*"
                    display="none"
                    onChange={handleBasementUpload}
                  />
                  <Upload size={24} color={mutedTextColor} />
                  <Text mt={2} textAlign="center" color={mutedTextColor}>
                    Upload Custom Basement
                  </Text>
                </Box>
              </Grid>
            </VStack>
            
            <Flex justify="end" mt={8}>
              <Button
                onClick={handleSubmit}
                size="lg"
                rightIcon={<ChevronRight size={18} />}
              >
                Continue to Designer
              </Button>
            </Flex>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default RoomSetupScreen;