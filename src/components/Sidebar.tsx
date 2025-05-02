import React, { useState } from 'react';
import { useRoom } from '../context/RoomContext';
import { FurnitureCategory, FurnitureItem } from '../types';
import { PanelLeftOpen, PanelLeftClose, Upload } from 'lucide-react';
import { Box, Button, Flex, Heading, IconButton, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Text, useColorModeValue } from '@chakra-ui/react';
import FurnitureLibrary from './FurnitureLibrary';

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeCategory, setActiveCategory] = useState<FurnitureCategory>('living');
  const { addFurnitureItem } = useRoom();
  const [showUploadModal, setShowUploadModal] = useState(false);

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const buttonBg = useColorModeValue('gray.100', 'gray.700');
  const buttonHoverBg = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.900', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleCategoryChange = (category: FurnitureCategory) => {
    setActiveCategory(category);
  };

  const handleDragStart = (e: React.DragEvent, item: Omit<FurnitureItem, 'id'>) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const toggleUploadModal = () => {
    setShowUploadModal(!showUploadModal);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large. Maximum size is 5MB.');
      return;
    }

    if (!file.type.match('image.*')) {
      alert('Only image files are supported.');
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    const newItem: Omit<FurnitureItem, 'id'> = {
      type: 'custom',
      name: file.name.replace(/\.[^/.]+$/, ""),
      width: 100,
      height: 100,
      x: 0,
      y: 0,
      rotation: 0,
      imageUrl,
      category: 'custom',
    };

    addFurnitureItem(newItem);
    setShowUploadModal(false);
  };

  return (
    <Box 
      bg={bg}
      boxShadow="md"
      transition="all 0.3s"
      w={collapsed ? '3rem' : { base: '16rem', md: '18rem' }}
      display="flex"
      flexDir="column"
    >
      <Flex align="center" justify="space-between" p={4} borderBottomWidth={1} borderColor={borderColor}>
        {!collapsed && (
          <Heading size="md" color={textColor}>Furniture</Heading>
        )}
        <IconButton
          aria-label="Toggle sidebar"
          icon={collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          onClick={toggleSidebar}
          variant="ghost"
          color={mutedTextColor}
          _hover={{ color: textColor, bg: buttonBg }}
        />
      </Flex>

      {!collapsed && (
        <>
          <Box p={4} borderBottomWidth={1} borderColor={borderColor}>
            <Flex gap={2}>
              <Button
                leftIcon={<Upload size={16} />}
                onClick={toggleUploadModal}
                colorScheme="blue"
                size="sm"
              >
                Upload Image
              </Button>
            </Flex>
          </Box>

          <Flex overflowX="auto" borderBottomWidth={1} borderColor={borderColor}>
            <Button
              variant={activeCategory === 'living' ? 'solid' : 'ghost'}
              colorScheme={activeCategory === 'living' ? 'blue' : undefined}
              size="sm"
              px={4}
              onClick={() => handleCategoryChange('living')}
              whiteSpace="nowrap"
            >
              Living Room
            </Button>
            <Button
              variant={activeCategory === 'bedroom' ? 'solid' : 'ghost'}
              colorScheme={activeCategory === 'bedroom' ? 'blue' : undefined}
              size="sm"
              px={4}
              onClick={() => handleCategoryChange('bedroom')}
              whiteSpace="nowrap"
            >
              Bedroom
            </Button>
            <Button
              variant={activeCategory === 'kitchen' ? 'solid' : 'ghost'}
              colorScheme={activeCategory === 'kitchen' ? 'blue' : undefined}
              size="sm"
              px={4}
              onClick={() => handleCategoryChange('kitchen')}
              whiteSpace="nowrap"
            >
              Kitchen
            </Button>
          </Flex>

          <Box flex="1" overflowY="auto" p={4}>
            <FurnitureLibrary 
              category={activeCategory} 
              onDragStart={handleDragStart} 
            />
          </Box>
        </>
      )}

      <Modal isOpen={showUploadModal} onClose={toggleUploadModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload Furniture Image</ModalHeader>
          <ModalBody>
            <Text fontSize="sm" color={mutedTextColor} mb={4}>
              Select an image file to add to your furniture library. Maximum size: 5MB.
            </Text>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px dashed',
                borderRadius: '0.375rem',
              }}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={toggleUploadModal}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
            >
              Browse Files
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Sidebar;