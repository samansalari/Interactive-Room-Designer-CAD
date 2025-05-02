import React from 'react';
import { FurnitureCategory, FurnitureItem } from '../types';
import { defaultFurnitureItems } from '../utils/defaults';
import { Grid, Box, Text, Image, useColorModeValue } from '@chakra-ui/react';

interface FurnitureLibraryProps {
  category: FurnitureCategory;
  onDragStart: (e: React.DragEvent, item: Omit<FurnitureItem, 'id'>) => void;
}

const FurnitureLibrary: React.FC<FurnitureLibraryProps> = ({ category, onDragStart }) => {
  const items = defaultFurnitureItems.filter(item => item.category === category);
  
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.900', 'gray.100');
  const mutedTextColor = useColorModeValue('gray.500', 'gray.400');

  return (
    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
      {items.map((item, index) => (
        <Box
          key={index}
          borderWidth="1px"
          borderColor={borderColor}
          rounded="md"
          p={2}
          cursor="move"
          transition="box-shadow 0.2s"
          _hover={{ shadow: 'md' }}
          draggable
          onDragStart={(e) => onDragStart(e, item)}
        >
          <Box
            aspectRatio={1}
            bg={cardBg}
            rounded="md"
            mb={2}
            display="flex"
            alignItems="center"
            justifyContent="center"
            overflow="hidden"
          >
            <Image 
              src={item.imageUrl} 
              alt={item.name} 
              w="full"
              h="full"
              objectFit="contain"
            />
          </Box>
          <Text color={textColor} fontSize="sm" noOfLines={1}>
            {item.name}
          </Text>
          <Text color={mutedTextColor} fontSize="xs">
            {item.width} x {item.height} cm
          </Text>
        </Box>
      ))}
    </Grid>
  );
};

export default FurnitureLibrary;