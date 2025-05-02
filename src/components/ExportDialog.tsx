import React, { useState } from 'react';
import { ExportOptions } from '../types';
import { X, Download } from 'lucide-react';
import { useRoom } from '../context/RoomContext';
import { useSettings } from '../context/SettingsContext';
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
  Checkbox,
  useColorModeValue,
  IconButton,
  Flex,
} from '@chakra-ui/react';

interface ExportDialogProps {
  onClose: () => void;
}

const ExportDialog: React.FC<ExportDialogProps> = ({ onClose }) => {
  const { designState } = useRoom();
  const { settings } = useSettings();
  
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'png',
    includeGrid: false,
    includeMeasurements: true,
    includeLogo: !!settings.logoUrl,
    resolution: 'medium',
  });

  const handleExport = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    
    if (exportOptions.format === 'png') {
      const dataUrl = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.download = `${designState.name || 'room-design'}.png`;
      link.href = dataUrl;
      link.click();
    } else {
      alert('PDF export would be implemented with a library like jsPDF');
    }
    
    onClose();
  };

  const buttonBg = useColorModeValue('gray.100', 'gray.700');
  const activeButtonBg = 'blue.600';
  const buttonTextColor = useColorModeValue('gray.700', 'gray.300');
  const activeButtonTextColor = 'white';

  return (
    <Modal isOpen={true} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader display="flex" justifyContent="space-between" alignItems="center">
          Export Design
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
            <VStack align="stretch" spacing={2}>
              <Text fontWeight="medium">Format</Text>
              <HStack spacing={2}>
                <Button
                  flex="1"
                  variant={exportOptions.format === 'png' ? 'solid' : 'outline'}
                  colorScheme="blue"
                  onClick={() => setExportOptions({ ...exportOptions, format: 'png' })}
                >
                  PNG Image
                </Button>
                <Button
                  flex="1"
                  variant={exportOptions.format === 'pdf' ? 'solid' : 'outline'}
                  colorScheme="blue"
                  onClick={() => setExportOptions({ ...exportOptions, format: 'pdf' })}
                >
                  PDF Document
                </Button>
              </HStack>
            </VStack>
            
            {exportOptions.format === 'png' && (
              <VStack align="stretch" spacing={2}>
                <Text fontWeight="medium">Resolution</Text>
                <HStack spacing={2}>
                  <Button
                    flex="1"
                    variant={exportOptions.resolution === 'low' ? 'solid' : 'outline'}
                    colorScheme="blue"
                    onClick={() => setExportOptions({ ...exportOptions, resolution: 'low' })}
                  >
                    Low (1x)
                  </Button>
                  <Button
                    flex="1"
                    variant={exportOptions.resolution === 'medium' ? 'solid' : 'outline'}
                    colorScheme="blue"
                    onClick={() => setExportOptions({ ...exportOptions, resolution: 'medium' })}
                  >
                    Medium (2x)
                  </Button>
                  <Button
                    flex="1"
                    variant={exportOptions.resolution === 'high' ? 'solid' : 'outline'}
                    colorScheme="blue"
                    onClick={() => setExportOptions({ ...exportOptions, resolution: 'high' })}
                  >
                    High (4x)
                  </Button>
                </HStack>
              </VStack>
            )}
            
            <VStack align="stretch" spacing={2}>
              <Text fontWeight="medium">Options</Text>
              <VStack align="stretch" spacing={2}>
                <Checkbox
                  isChecked={exportOptions.includeGrid}
                  onChange={(e) => setExportOptions({ ...exportOptions, includeGrid: e.target.checked })}
                >
                  Include grid
                </Checkbox>
                <Checkbox
                  isChecked={exportOptions.includeMeasurements}
                  onChange={(e) => setExportOptions({ ...exportOptions, includeMeasurements: e.target.checked })}
                >
                  Show measurements
                </Checkbox>
                {settings.logoUrl && (
                  <Checkbox
                    isChecked={exportOptions.includeLogo}
                    onChange={(e) => setExportOptions({ ...exportOptions, includeLogo: e.target.checked })}
                  >
                    Include logo
                  </Checkbox>
                )}
              </VStack>
            </VStack>
          </VStack>
        </ModalBody>
        
        <ModalFooter>
          <Button
            leftIcon={<Download size={18} />}
            colorScheme="blue"
            onClick={handleExport}
            width="full"
            size="lg"
          >
            Export {exportOptions.format.toUpperCase()}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ExportDialog;