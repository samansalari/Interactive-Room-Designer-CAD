import React, { useRef } from 'react';
import { useSettings } from '../context/SettingsContext';
import { X } from 'lucide-react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  HStack,
  Text,
  Switch,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Box,
  IconButton,
  Input,
  Image,
  useColorModeValue,
  Divider,
} from '@chakra-ui/react';

interface SettingsPanelProps {
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoBg = useColorModeValue('white', 'gray.700');

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        updateSettings({ logoUrl: event.target.result as string });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogoRemove = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    updateSettings({ logoUrl: undefined });
  };

  return (
    <Modal isOpen={true} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader display="flex" justifyContent="space-between" alignItems="center">
          Settings
          <IconButton
            aria-label="Close"
            icon={<X size={20} />}
            onClick={onClose}
            variant="ghost"
            size="sm"
          />
        </ModalHeader>
        
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Unit System */}
            <VStack align="stretch" spacing={2}>
              <Text fontWeight="medium">Unit System</Text>
              <HStack spacing={2}>
                <Button
                  flex="1"
                  variant={settings.unitSystem === 'metric' ? 'solid' : 'outline'}
                  colorScheme="blue"
                  onClick={() => updateSettings({ unitSystem: 'metric' })}
                >
                  Metric (cm)
                </Button>
                <Button
                  flex="1"
                  variant={settings.unitSystem === 'imperial' ? 'solid' : 'outline'}
                  colorScheme="blue"
                  onClick={() => updateSettings({ unitSystem: 'imperial' })}
                >
                  Imperial (ft)
                </Button>
              </HStack>
            </VStack>
            
            {/* Theme */}
            <VStack align="stretch" spacing={2}>
              <Text fontWeight="medium">Theme</Text>
              <HStack spacing={2}>
                <Button
                  flex="1"
                  variant={settings.theme === 'light' ? 'solid' : 'outline'}
                  colorScheme="blue"
                  onClick={() => updateSettings({ theme: 'light' })}
                >
                  Light
                </Button>
                <Button
                  flex="1"
                  variant={settings.theme === 'dark' ? 'solid' : 'outline'}
                  colorScheme="blue"
                  onClick={() => updateSettings({ theme: 'dark' })}
                >
                  Dark
                </Button>
              </HStack>
            </VStack>
            
            {/* Grid Settings */}
            <VStack align="stretch" spacing={2}>
              <Text fontWeight="medium">Grid</Text>
              <HStack justify="space-between">
                <Text>Show Grid</Text>
                <Switch
                  isChecked={settings.showGrid}
                  onChange={(e) => updateSettings({ showGrid: e.target.checked })}
                  colorScheme="blue"
                />
              </HStack>
              <Box>
                <Text mb={2}>Grid Size</Text>
                <Slider
                  min={10}
                  max={50}
                  step={5}
                  value={settings.gridSize}
                  onChange={(value) => updateSettings({ gridSize: value })}
                  colorScheme="blue"
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
                <HStack justify="space-between" mt={1}>
                  <Text fontSize="xs" color="gray.500">10</Text>
                  <Text fontSize="xs" color="gray.500">20</Text>
                  <Text fontSize="xs" color="gray.500">30</Text>
                  <Text fontSize="xs" color="gray.500">40</Text>
                  <Text fontSize="xs" color="gray.500">50</Text>
                </HStack>
              </Box>
            </VStack>

            {/* Ruler Settings */}
            <VStack align="stretch" spacing={2}>
              <Text fontWeight="medium">Ruler</Text>
              <HStack justify="space-between">
                <Text>Show Ruler</Text>
                <Switch
                  isChecked={settings.showRuler}
                  onChange={(e) => updateSettings({ showRuler: e.target.checked })}
                  colorScheme="blue"
                />
              </HStack>
            </VStack>
            
            {/* Font */}
            <VStack align="stretch" spacing={2}>
              <Text fontWeight="medium">Font</Text>
              <HStack spacing={2}>
                <Button
                  flex="1"
                  variant={settings.font === 'geist' ? 'solid' : 'outline'}
                  colorScheme="blue"
                  onClick={() => updateSettings({ font: 'geist' })}
                  fontFamily="Geist, sans-serif"
                >
                  Geist
                </Button>
                <Button
                  flex="1"
                  variant={settings.font === 'roboto' ? 'solid' : 'outline'}
                  colorScheme="blue"
                  onClick={() => updateSettings({ font: 'roboto' })}
                  fontFamily="Roboto, sans-serif"
                >
                  Roboto
                </Button>
                <Button
                  flex="1"
                  variant={settings.font === 'openSans' ? 'solid' : 'outline'}
                  colorScheme="blue"
                  onClick={() => updateSettings({ font: 'openSans' })}
                  fontFamily="Open Sans, sans-serif"
                >
                  Open Sans
                </Button>
              </HStack>
            </VStack>
            
            {/* Logo Upload */}
            <VStack align="stretch" spacing={2}>
              <Text fontWeight="medium">Logo for Exports</Text>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleLogoUpload}
                style={{ display: 'none' }}
              />
              <HStack spacing={2}>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                >
                  Upload Logo
                </Button>
                {settings.logoUrl && (
                  <Button
                    colorScheme="red"
                    variant="ghost"
                    onClick={handleLogoRemove}
                  >
                    Remove
                  </Button>
                )}
              </HStack>
              {settings.logoUrl && (
                <Box
                  mt={2}
                  borderWidth={1}
                  borderRadius="md"
                  p={2}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg={logoBg}
                >
                  <Image
                    src={settings.logoUrl}
                    alt="Logo"
                    maxH="12"
                    maxW="full"
                    objectFit="contain"
                  />
                </Box>
              )}
            </VStack>
          </VStack>
        </ModalBody>
        
        <ModalFooter display="flex" justifyContent="space-between">
          <Button
            variant="ghost"
            onClick={resetSettings}
          >
            Reset to Default
          </Button>
          <Button
            colorScheme="blue"
            onClick={onClose}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SettingsPanel;