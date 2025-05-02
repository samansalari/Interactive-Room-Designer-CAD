import React, { useState } from 'react';
import { Settings, Save, Download, Undo, Redo, Menu, X, ArrowLeft } from 'lucide-react';
import { Box, Flex, Heading, IconButton, Button, Container, Grid, useColorModeValue } from '@chakra-ui/react';
import { AppScreen } from '../types';
import { useRoom } from '../context/RoomContext';
import SettingsPanel from './SettingsPanel';
import ExportDialog from './ExportDialog';

interface HeaderProps {
  currentScreen: AppScreen;
  navigateTo: (screen: AppScreen) => void;
}

const Header: React.FC<HeaderProps> = ({ currentScreen, navigateTo }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { saveDesign, undo, redo, canUndo, canRedo } = useRoom();

  const handleSave = () => {
    saveDesign();
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const toggleExport = () => {
    setShowExport(!showExport);
  };

  const handleBack = () => {
    navigateTo('welcome');
  };

  const bg = useColorModeValue('white', 'gray.800');
  const iconColor = useColorModeValue('gray.600', 'gray.300');
  const iconHoverColor = useColorModeValue('gray.900', 'white');
  const iconHoverBg = useColorModeValue('gray.100', 'gray.700');
  const disabledColor = useColorModeValue('gray.300', 'gray.600');

  return (
    <Box bg={bg} boxShadow="sm" transition="background-color 0.3s">
      <Container maxW="container.xl" py={4}>
        <Flex justify="space-between" align="center">
          <Flex align="center" gap={4}>
            {currentScreen !== 'welcome' && (
              <IconButton
                aria-label="Go back"
                icon={<ArrowLeft size={24} />}
                onClick={handleBack}
                variant="ghost"
                color={iconColor}
                _hover={{ color: iconHoverColor, bg: iconHoverBg }}
              />
            )}
            <Heading as="h1" size="lg" color="#122620">
              Interactive Room Designer
            </Heading>
          </Flex>

          <IconButton
            display={{ base: 'flex', md: 'none' }}
            aria-label="Toggle menu"
            icon={mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            color={iconColor}
            _hover={{ color: iconHoverColor, bg: iconHoverBg }}
            variant="ghost"
          />

          <Flex display={{ base: 'none', md: 'flex' }} align="center" gap={4}>
            {currentScreen === 'designer' && (
              <>
                <IconButton
                  aria-label="Undo"
                  icon={<Undo size={20} />}
                  onClick={undo}
                  isDisabled={!canUndo}
                  color={canUndo ? iconColor : disabledColor}
                  _hover={canUndo ? { color: iconHoverColor, bg: iconHoverBg } : {}}
                  variant="ghost"
                />
                <IconButton
                  aria-label="Redo"
                  icon={<Redo size={20} />}
                  onClick={redo}
                  isDisabled={!canRedo}
                  color={canRedo ? iconColor : disabledColor}
                  _hover={canRedo ? { color: iconHoverColor, bg: iconHoverBg } : {}}
                  variant="ghost"
                />
                <IconButton
                  aria-label="Save"
                  icon={<Save size={20} />}
                  onClick={handleSave}
                  color={iconColor}
                  _hover={{ color: iconHoverColor, bg: iconHoverBg }}
                  variant="ghost"
                />
                <IconButton
                  aria-label="Export"
                  icon={<Download size={20} />}
                  onClick={toggleExport}
                  color={iconColor}
                  _hover={{ color: iconHoverColor, bg: iconHoverBg }}
                  variant="ghost"
                />
              </>
            )}
            <IconButton
              aria-label="Settings"
              icon={<Settings size={20} />}
              onClick={toggleSettings}
              color={iconColor}
              _hover={{ color: iconHoverColor, bg: iconHoverBg }}
              variant="ghost"
            />
          </Flex>
        </Flex>

        {mobileMenuOpen && (
          <Box mt={3} pt={3} borderTopWidth={1} borderColor="gray.200" _dark={{ borderColor: 'gray.700' }}>
            <Grid templateColumns="repeat(4, 1fr)" gap={2}>
              {currentScreen === 'designer' && (
                <>
                  <Button
                    variant="ghost"
                    display="flex"
                    flexDir="column"
                    color={canUndo ? iconColor : disabledColor}
                    _hover={canUndo ? { color: iconHoverColor, bg: iconHoverBg } : {}}
                    onClick={undo}
                    isDisabled={!canUndo}
                  >
                    <Undo size={20} />
                    <Box as="span" fontSize="xs" mt={1}>Undo</Box>
                  </Button>
                  <Button
                    variant="ghost"
                    display="flex"
                    flexDir="column"
                    color={canRedo ? iconColor : disabledColor}
                    _hover={canRedo ? { color: iconHoverColor, bg: iconHoverBg } : {}}
                    onClick={redo}
                    isDisabled={!canRedo}
                  >
                    <Redo size={20} />
                    <Box as="span" fontSize="xs" mt={1}>Redo</Box>
                  </Button>
                  <Button
                    variant="ghost"
                    display="flex"
                    flexDir="column"
                    color={iconColor}
                    _hover={{ color: iconHoverColor, bg: iconHoverBg }}
                    onClick={handleSave}
                  >
                    <Save size={20} />
                    <Box as="span" fontSize="xs" mt={1}>Save</Box>
                  </Button>
                  <Button
                    variant="ghost"
                    display="flex"
                    flexDir="column"
                    color={iconColor}
                    _hover={{ color: iconHoverColor, bg: iconHoverBg }}
                    onClick={toggleExport}
                  >
                    <Download size={20} />
                    <Box as="span" fontSize="xs" mt={1}>Export</Box>
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                display="flex"
                flexDir="column"
                color={iconColor}
                _hover={{ color: iconHoverColor, bg: iconHoverBg }}
                onClick={toggleSettings}
              >
                <Settings size={20} />
                <Box as="span" fontSize="xs" mt={1}>Settings</Box>
              </Button>
            </Grid>
          </Box>
        )}
      </Container>

      {showSettings && <SettingsPanel onClose={toggleSettings} />}
      {showExport && <ExportDialog onClose={toggleExport} />}
    </Box>
  );
};

export default Header;