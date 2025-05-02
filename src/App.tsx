import React, { useState } from 'react';
import { Box, Flex, Link, Text } from '@chakra-ui/react';
import Header from './components/Header';
import DesignCanvas from './components/DesignCanvas';
import Sidebar from './components/Sidebar';
import { RoomProvider } from './context/RoomContext';
import { SettingsProvider } from './context/SettingsContext';
import WelcomeScreen from './components/WelcomeScreen';
import RoomSetupScreen from './components/RoomSetupScreen';
import { AppScreen } from './types';

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('welcome');

  const navigateTo = (screen: AppScreen) => {
    setCurrentScreen(screen);
  };

  return (
    <SettingsProvider>
      <RoomProvider>
        <Flex 
          minH="100vh" 
          bg="gray.50" 
          flexDir="column" 
          _dark={{ bg: 'gray.900' }}
          transition="background-color 0.3s"
        >
          <Header currentScreen={currentScreen} navigateTo={navigateTo} />
          
          <Flex flex="1">
            {currentScreen === 'welcome' && (
              <WelcomeScreen navigateTo={navigateTo} />
            )}
            
            {currentScreen === 'roomSetup' && (
              <RoomSetupScreen navigateTo={navigateTo} />
            )}
            
            {currentScreen === 'designer' && (
              <>
                <Sidebar />
                <DesignCanvas />
              </>
            )}
          </Flex>

          <Box 
            as="footer" 
            py={4} 
            textAlign="center" 
            borderTopWidth={1} 
            borderColor="gray.200"
            _dark={{ borderColor: 'gray.700' }}
          >
            <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
              made with 🧡 by{' '}
              <Link 
                href="https://samansalari.com" 
                isExternal
                color="custom.accent"
                _hover={{ textDecoration: 'none', opacity: 0.8 }}
              >
                Saman
              </Link>
            </Text>
          </Box>
        </Flex>
      </RoomProvider>
    </SettingsProvider>
  );
}

export default App;