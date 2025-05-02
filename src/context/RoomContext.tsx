import React, { createContext, useContext, useState, useMemo, ReactNode, useCallback } from 'react';
import { DesignState, FurnitureItem, RoomDimensions } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { defaultRoomDimensions } from '../utils/defaults';

interface RoomContextType {
  designState: DesignState;
  setRoomDimensions: (dimensions: RoomDimensions) => void;
  addFurnitureItem: (item: Omit<FurnitureItem, 'id'>) => void;
  updateFurnitureItem: (item: FurnitureItem) => void;
  removeFurnitureItem: (id: string) => void;
  selectFurnitureItem: (id: string | null) => void;
  saveDesign: (name?: string) => void;
  loadDesign: (id: string) => void;
  resetDesign: () => void;
  setCollision: (id: string, isColliding: boolean) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const initialDesignState: DesignState = {
  id: uuidv4(),
  name: 'Untitled Design',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  room: defaultRoomDimensions,
  furniture: [],
};

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [designState, setDesignState] = useState<DesignState>(initialDesignState);
  const [history, setHistory] = useState<DesignState[]>([initialDesignState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const pushToHistory = useCallback((newState: DesignState) => {
    const newHistory = history.slice(0, currentIndex + 1);
    const lastState = newHistory[newHistory.length - 1];
    
    // Only push if there are actual changes
    if (JSON.stringify(lastState.furniture) !== JSON.stringify(newState.furniture)) {
      newHistory.push({
        ...newState,
        updatedAt: Date.now()
      });
      setHistory(newHistory);
      setCurrentIndex(newHistory.length - 1);
      setDesignState(newState);
    }
  }, [history, currentIndex]);

  const undo = useCallback(() => {
    if (canUndo) {
      const previousState = history[currentIndex - 1];
      setCurrentIndex(currentIndex - 1);
      setDesignState(previousState);
    }
  }, [canUndo, currentIndex, history]);

  const redo = useCallback(() => {
    if (canRedo) {
      const nextState = history[currentIndex + 1];
      setCurrentIndex(currentIndex + 1);
      setDesignState(nextState);
    }
  }, [canRedo, currentIndex, history]);

  const setRoomDimensions = useCallback((dimensions: RoomDimensions) => {
    const newState = {
      ...designState,
      room: dimensions,
    };
    pushToHistory(newState);
  }, [designState, pushToHistory]);

  const addFurnitureItem = useCallback((item: Omit<FurnitureItem, 'id'>) => {
    const newItem: FurnitureItem = {
      ...item,
      id: uuidv4(),
      isSelected: false,
      isColliding: false,
    };
    
    const newState = {
      ...designState,
      furniture: [...designState.furniture, newItem],
    };
    pushToHistory(newState);
  }, [designState, pushToHistory]);

  const updateFurnitureItem = useCallback((item: FurnitureItem) => {
    const newState = {
      ...designState,
      furniture: designState.furniture.map(f => 
        f.id === item.id ? item : f
      ),
    };
    pushToHistory(newState);
  }, [designState, pushToHistory]);

  const removeFurnitureItem = useCallback((id: string) => {
    const newState = {
      ...designState,
      furniture: designState.furniture.filter(item => item.id !== id),
    };
    pushToHistory(newState);
  }, [designState, pushToHistory]);

  const selectFurnitureItem = useCallback((id: string | null) => {
    const newState = {
      ...designState,
      furniture: designState.furniture.map(item => ({
        ...item,
        isSelected: item.id === id,
      })),
    };
    pushToHistory(newState);
  }, [designState, pushToHistory]);

  const setCollision = useCallback((id: string, isColliding: boolean) => {
    setDesignState(prev => ({
      ...prev,
      furniture: prev.furniture.map(item => 
        item.id === id ? { ...item, isColliding } : item
      ),
    }));
  }, []);

  const saveDesign = useCallback((name?: string) => {
    const updatedDesign = {
      ...designState,
      name: name || designState.name,
      updatedAt: Date.now(),
    };
    
    try {
      const savedDesignsJson = localStorage.getItem('roomDesigns');
      let savedDesigns: DesignState[] = savedDesignsJson ? JSON.parse(savedDesignsJson) : [];
      
      const existingIndex = savedDesigns.findIndex(d => d.id === updatedDesign.id);
      if (existingIndex >= 0) {
        savedDesigns[existingIndex] = updatedDesign;
      } else {
        savedDesigns.push(updatedDesign);
      }
      
      localStorage.setItem('roomDesigns', JSON.stringify(savedDesigns));
      setDesignState(updatedDesign);
    } catch (error) {
      console.error('Failed to save design:', error);
    }
  }, [designState]);

  const loadDesign = useCallback((id: string) => {
    try {
      const savedDesignsJson = localStorage.getItem('roomDesigns');
      if (savedDesignsJson) {
        const savedDesigns: DesignState[] = JSON.parse(savedDesignsJson);
        const design = savedDesigns.find(d => d.id === id);
        if (design) {
          setDesignState(design);
          setHistory([design]);
          setCurrentIndex(0);
        }
      }
    } catch (error) {
      console.error('Failed to load design:', error);
    }
  }, []);

  const resetDesign = useCallback(() => {
    const newState = {
      ...initialDesignState,
      id: uuidv4(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setDesignState(newState);
    setHistory([newState]);
    setCurrentIndex(0);
  }, []);

  const value = useMemo(() => ({
    designState,
    setRoomDimensions,
    addFurnitureItem,
    updateFurnitureItem,
    removeFurnitureItem,
    selectFurnitureItem,
    saveDesign,
    loadDesign,
    resetDesign,
    setCollision,
    undo,
    redo,
    canUndo,
    canRedo,
  }), [
    designState,
    setRoomDimensions,
    addFurnitureItem,
    updateFurnitureItem,
    removeFurnitureItem,
    selectFurnitureItem,
    saveDesign,
    loadDesign,
    resetDesign,
    setCollision,
    undo,
    redo,
    canUndo,
    canRedo,
  ]);

  return (
    <RoomContext.Provider value={value}>
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};