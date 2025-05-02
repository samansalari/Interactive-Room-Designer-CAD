import React, { useRef, useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { useRoom } from '../context/RoomContext';
import { useSettings } from '../context/SettingsContext';
import { drawRoom, drawGrid, drawFurniture, drawMeasurements, drawRuler } from '../utils/canvasDrawing';
import { checkCollisions } from '../utils/collisionDetection';
import { Point, FurnitureItem } from '../types';

const DesignCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { designState, updateFurnitureItem, selectFurnitureItem, setCollision } = useRoom();
  const { settings } = useSettings();
  
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<'width' | 'height' | 'both' | null>(null);
  const [startPoint, setStartPoint] = useState<Point>({ x: 0, y: 0 });
  const [initialDimensions, setInitialDimensions] = useState<{ width: number; height: number } | null>(null);
  const [initialPosition, setInitialPosition] = useState<Point | null>(null);
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  const [resizeStartPoint, setResizeStartPoint] = useState<Point | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = designState.room.canvasWidth || 800;
    canvas.height = designState.room.canvasHeight || 600;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (settings.showRuler) {
      drawRuler(ctx, canvas.width, canvas.height, settings.unitSystem);
    }

    if (settings.showGrid) {
      drawGrid(ctx, canvas.width, canvas.height, settings.gridSize);
    }

    drawRoom(ctx, designState.room);
    drawFurniture(ctx, designState.furniture);

    const selectedItem = designState.furniture.find(item => item.isSelected);
    if (selectedItem) {
      drawMeasurements(ctx, selectedItem, settings.unitSystem);
    }
  }, [designState, settings]);

  const getResizeHandle = (item: FurnitureItem, x: number, y: number): 'width' | 'height' | 'both' | null => {
    const handleSize = 16; // Increased handle size for better interaction
    const angle = (item.rotation * Math.PI) / 180;
    
    // Transform click coordinates relative to item center
    const dx = x - item.x;
    const dy = y - item.y;
    
    // Rotate coordinates to match item's rotation
    const rotatedX = dx * Math.cos(-angle) - dy * Math.sin(-angle);
    const rotatedY = dx * Math.sin(-angle) + dy * Math.cos(-angle);
    
    const halfWidth = item.width / 2;
    const halfHeight = item.height / 2;
    
    // Check corners (both width and height)
    if (Math.abs(Math.abs(rotatedX) - halfWidth) <= handleSize && 
        Math.abs(Math.abs(rotatedY) - halfHeight) <= handleSize) {
      return 'both';
    }
    
    // Check edges (width only)
    if (Math.abs(Math.abs(rotatedX) - halfWidth) <= handleSize && 
        Math.abs(rotatedY) <= handleSize) {
      return 'width';
    }
    
    // Check edges (height only)
    if (Math.abs(rotatedX) <= handleSize && 
        Math.abs(Math.abs(rotatedY) - halfHeight) <= handleSize) {
      return 'height';
    }
    
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setStartPoint({ x, y });
    setResizeStartPoint({ x, y });

    const selectedItem = designState.furniture.find(item => item.isSelected);
    if (selectedItem) {
      const resizeHandle = getResizeHandle(selectedItem, x, y);
      if (resizeHandle) {
        setIsResizing(resizeHandle);
        setInitialDimensions({ width: selectedItem.width, height: selectedItem.height });
        return;
      }
    }

    const clickedItem = designState.furniture.find(item => {
      const angle = (item.rotation * Math.PI) / 180;
      const dx = x - item.x;
      const dy = y - item.y;
      const rotatedX = dx * Math.cos(-angle) - dy * Math.sin(-angle);
      const rotatedY = dx * Math.sin(-angle) + dy * Math.cos(-angle);
      
      return (
        Math.abs(rotatedX) <= item.width / 2 &&
        Math.abs(rotatedY) <= item.height / 2
      );
    });

    if (clickedItem) {
      const now = Date.now();
      const isDoubleClick = now - lastClickTime < 300;
      setLastClickTime(now);

      if (isDoubleClick && clickedItem.isSelected) {
        const newWidth = clickedItem.width * 1.2;
        const newHeight = clickedItem.height * 1.2;
        
        const updatedItem = {
          ...clickedItem,
          width: Math.round(newWidth / 5) * 5,
          height: Math.round(newHeight / 5) * 5,
        };
        
        const hasCollision = checkCollisions(updatedItem, designState.furniture, designState.room);
        if (!hasCollision) {
          updateFurnitureItem(updatedItem);
        }
        return;
      }

      setIsDragging(true);
      setDraggingId(clickedItem.id);
      setDragOffset({
        x: x - clickedItem.x,
        y: y - clickedItem.y
      });
      setInitialPosition({ x: clickedItem.x, y: clickedItem.y });
      
      if (!clickedItem.isSelected) {
        selectFurnitureItem(clickedItem.id);
      }
    } else {
      selectFurnitureItem(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging && !isResizing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging && draggingId) {
      const item = designState.furniture.find(item => item.id === draggingId);
      if (!item) return;

      const newX = x - dragOffset.x;
      const newY = y - dragOffset.y;
      
      const updatedItem = {
        ...item,
        x: newX,
        y: newY,
        initialX: initialPosition?.x ?? item.x,
        initialY: initialPosition?.y ?? item.y
      };
      
      const hasCollision = checkCollisions(updatedItem, designState.furniture, designState.room);
      setCollision(draggingId, hasCollision);
      
      updateFurnitureItem(updatedItem);
    }
    
    if (isResizing && initialDimensions && resizeStartPoint) {
      const selectedItem = designState.furniture.find(item => item.isSelected);
      if (!selectedItem) return;

      const angle = (selectedItem.rotation * Math.PI) / 180;
      const dx = x - resizeStartPoint.x;
      const dy = y - resizeStartPoint.y;
      
      // Rotate the mouse movement to align with item's rotation
      const rotatedDX = dx * Math.cos(-angle) - dy * Math.sin(-angle);
      const rotatedDY = dx * Math.sin(-angle) + dy * Math.cos(-angle);
      
      let newWidth = initialDimensions.width;
      let newHeight = initialDimensions.height;
      
      const minSize = 20;
      const snapSize = 5;

      if (isResizing === 'width' || isResizing === 'both') {
        newWidth = Math.max(minSize, initialDimensions.width + rotatedDX * 2);
        newWidth = Math.round(newWidth / snapSize) * snapSize;
      }
      
      if (isResizing === 'height' || isResizing === 'both') {
        newHeight = Math.max(minSize, initialDimensions.height + rotatedDY * 2);
        newHeight = Math.round(newHeight / snapSize) * snapSize;
      }

      const updatedItem = {
        ...selectedItem,
        width: newWidth,
        height: newHeight
      };

      const hasCollision = checkCollisions(updatedItem, designState.furniture, designState.room);
      setCollision(selectedItem.id, hasCollision);
      
      if (!hasCollision) {
        updateFurnitureItem(updatedItem);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(null);
    setDraggingId(null);
    setInitialDimensions(null);
    setInitialPosition(null);
    setResizeStartPoint(null);
    
    designState.furniture.forEach(item => {
      if (item.isColliding) {
        const hasCollision = checkCollisions(item, designState.furniture, designState.room);
        if (!hasCollision) {
          setCollision(item.id, false);
        }
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    try {
      const itemData = JSON.parse(e.dataTransfer.getData('application/json'));
      const newItem: Omit<FurnitureItem, 'id'> = {
        ...itemData,
        x,
        y,
        rotation: 0,
      };
      
      addFurnitureItem(newItem);
    } catch (error) {
      console.error('Failed to add furniture item:', error);
    }
  };

  const getCursor = () => {
    if (isResizing === 'width') return 'ew-resize';
    if (isResizing === 'height') return 'ns-resize';
    if (isResizing === 'both') return 'nwse-resize';
    if (isDragging) return 'move';
    return 'default';
  };

  return (
    <Box 
      flex="1" 
      bg="gray.100" 
      _dark={{ bg: 'gray.800' }} 
      position="relative" 
      overflow="hidden"
      transition="background-color 0.3s"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <canvas
        ref={canvasRef}
        style={{ 
          width: '100%', 
          height: '100%',
          cursor: getCursor()
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </Box>
  );
};

export default DesignCanvas;