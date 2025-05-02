import React, { useEffect, useState } from 'react';
import { AppScreen, DesignState } from '../types';
import { useRoom } from '../context/RoomContext';
import { Calendar, Trash2 } from 'lucide-react';
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  IconButton,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';

interface WelcomeScreenProps {
  navigateTo: (screen: AppScreen) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigateTo }) => {
  const [savedDesigns, setSavedDesigns] = useState<DesignState[]>([]);
  const { loadDesign, resetDesign } = useRoom();

  const bg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.900', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.300');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('gray.100', 'gray.700');

  useEffect(() => {
    try {
      const savedDesignsJson = localStorage.getItem('roomDesigns');
      if (savedDesignsJson) {
        const designs = JSON.parse(savedDesignsJson);
        setSavedDesigns(designs);
      }
    } catch (error) {
      console.error('Failed to load saved designs:', error);
    }
  }, []);

  const handleNewDesign = () => {
    resetDesign();
    navigateTo('roomSetup');
  };

  const handleLoadDesign = (id: string) => {
    loadDesign(id);
    navigateTo('designer');
  };

  const handleDeleteDesign = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const updatedDesigns = savedDesigns.filter(design => design.id !== id);
      localStorage.setItem('roomDesigns', JSON.stringify(updatedDesigns));
      setSavedDesigns(updatedDesigns);
    } catch (error) {
      console.error('Failed to delete design:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box w="full" display="flex" flexDir="column" alignItems="center" justifyContent="center" p={6}>
      <Container maxW="4xl">
        <Box bg={bg} rounded="xl" shadow="lg" overflow="hidden" transition="background-color 0.3s">
          <Box p={8} textAlign="center">
            <Heading as="h1" size="2xl" color="#122620" mb={2}>
              Interactive Room Designer
            </Heading>
            <Text color={mutedTextColor} mb={8} maxW="2xl" mx="auto">
              Create accurate 2D room layouts with precise measurements. Drag and drop furniture, 
              visualize your space, and export your designs.
            </Text>
            
            <Button
              onClick={handleNewDesign}
              size="lg"
              px={6}
              py={3}
              rounded="lg"
            >
              Create New Design
            </Button>
          </Box>
          
          {savedDesigns.length > 0 && (
            <Box px={8} pb={8}>
              <Heading as="h2" size="lg" color="#122620" mb={4}>
                Recent Designs
              </Heading>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={4}>
                {savedDesigns.map((design) => (
                  <Box
                    key={design.id}
                    onClick={() => handleLoadDesign(design.id)}
                    borderWidth={1}
                    borderColor={borderColor}
                    rounded="lg"
                    overflow="hidden"
                    transition="box-shadow 0.2s"
                    cursor="pointer"
                    _hover={{ shadow: 'md' }}
                  >
                    <Box h="40" bg={cardBg} display="flex" alignItems="center" justifyContent="center">
                      {design.thumbnail ? (
                        <Box
                          as="img"
                          src={design.thumbnail}
                          alt={design.name}
                          w="full"
                          h="full"
                          objectFit="cover"
                        />
                      ) : (
                        <Text color={mutedTextColor}>No Preview</Text>
                      )}
                    </Box>
                    <Box p={3}>
                      <Flex justify="space-between" align="start">
                        <Heading as="h3" size="sm" color="#122620" isTruncated>
                          {design.name}
                        </Heading>
                        <IconButton
                          aria-label="Delete design"
                          icon={<Trash2 size={16} />}
                          onClick={(e) => handleDeleteDesign(design.id, e)}
                          size="sm"
                          variant="ghost"
                          color={mutedTextColor}
                          _hover={{ color: 'red.500' }}
                        />
                      </Flex>
                      <Flex align="center" fontSize="xs" color={mutedTextColor} mt={1}>
                        <Calendar size={14} style={{ marginRight: '0.25rem' }} />
                        {formatDate(design.updatedAt)}
                      </Flex>
                    </Box>
                  </Box>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default WelcomeScreen;