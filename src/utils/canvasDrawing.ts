import { FurnitureItem, RoomDimensions } from '../types';

// Draw grid on the canvas
export const drawGrid = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridSize: number
) => {
  ctx.save();
  
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 0.5;
  
  // Draw vertical lines
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  // Draw horizontal lines
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  
  ctx.restore();
};

// Draw ruler on the canvas
export const drawRuler = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  unitSystem: 'metric' | 'imperial'
) => {
  const rulerSize = 20;
  const majorTickInterval = unitSystem === 'metric' ? 100 : 96; // 100cm or 96 inches (8 feet)
  const minorTickInterval = unitSystem === 'metric' ? 10 : 12; // 10cm or 12 inches (1 foot)
  
  ctx.save();
  
  // Draw ruler background
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, width, rulerSize); // Horizontal ruler
  ctx.fillRect(0, 0, rulerSize, height); // Vertical ruler
  
  ctx.strokeStyle = '#666';
  ctx.fillStyle = '#666';
  ctx.font = '10px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Draw horizontal ruler ticks and numbers
  for (let x = 0; x < width; x += minorTickInterval) {
    const isMajorTick = x % majorTickInterval === 0;
    const tickHeight = isMajorTick ? rulerSize : rulerSize / 2;
    
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, tickHeight);
    ctx.stroke();
    
    if (isMajorTick) {
      const label = unitSystem === 'metric' 
        ? `${x / 100}m`
        : `${Math.floor(x / 12)}'`;
      ctx.fillText(label, x, rulerSize / 2);
    }
  }
  
  // Draw vertical ruler ticks and numbers
  for (let y = 0; y < height; y += minorTickInterval) {
    const isMajorTick = y % majorTickInterval === 0;
    const tickWidth = isMajorTick ? rulerSize : rulerSize / 2;
    
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(tickWidth, y);
    ctx.stroke();
    
    if (isMajorTick) {
      const label = unitSystem === 'metric'
        ? `${y / 100}m`
        : `${Math.floor(y / 12)}'`;
      ctx.save();
      ctx.translate(rulerSize / 2, y);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(label, 0, 0);
      ctx.restore();
    }
  }
  
  // Draw corner square
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, rulerSize, rulerSize);
  ctx.strokeRect(0, 0, rulerSize, rulerSize);
  
  ctx.restore();
};

// Draw room outline and basement
export const drawRoom = (
  ctx: CanvasRenderingContext2D,
  room: RoomDimensions
) => {
  const { width, height, shape, basement, templateImage } = room;
  
  ctx.save();
  
  // Center the room in the canvas
  const centerX = ctx.canvas.width / 2;
  const centerY = ctx.canvas.height / 2;
  
  ctx.translate(centerX - width / 2, centerY - height / 2);

  // Draw template background if exists
  if (templateImage) {
    const img = new Image();
    img.src = templateImage;
    if (img.complete) {
      ctx.globalAlpha = 0.3;
      ctx.drawImage(img, 0, 0, width, height);
      ctx.globalAlpha = 1.0;
    }
  }
  
  // Draw basement if exists
  if (basement) {
    ctx.save();
    ctx.translate(basement.x + width / 2, basement.y + height / 2);
    ctx.rotate((basement.rotation * Math.PI) / 180);
    
    // Create a clipping path for the basement image
    ctx.beginPath();
    ctx.rect(-basement.width / 2, -basement.height / 2, basement.width, basement.height);
    ctx.clip();
    
    // Draw basement image
    const img = new Image();
    img.src = basement.imageUrl;
    if (img.complete) {
      ctx.drawImage(
        img,
        -basement.width / 2,
        -basement.height / 2,
        basement.width,
        basement.height
      );
    }
    
    ctx.restore();
  }
  
  // Draw room outline
  ctx.fillStyle = 'rgba(248, 249, 250, 0.7)';
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  
  if (shape === 'rectangle') {
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.fill();
    ctx.stroke();
  } else if (shape === 'lShape') {
    // Example L-shape (simple version)
    const smallWidth = width * 0.6;
    const smallHeight = height * 0.6;
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, 0);
    ctx.lineTo(width, smallHeight);
    ctx.lineTo(smallWidth, smallHeight);
    ctx.lineTo(smallWidth, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (shape === 'custom' && room.walls) {
    // Custom shape with defined walls
    ctx.beginPath();
    const firstWall = room.walls[0];
    ctx.moveTo(firstWall.start.x, firstWall.start.y);
    
    for (const wall of room.walls) {
      ctx.lineTo(wall.end.x, wall.end.y);
    }
    
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  
  ctx.restore();
};

// Draw furniture items
export const drawFurniture = (
  ctx: CanvasRenderingContext2D,
  furniture: FurnitureItem[]
) => {
  // Sort by selection status to draw selected items on top
  const sortedFurniture = [...furniture].sort((a, b) => {
    if (a.isSelected && !b.isSelected) return 1;
    if (!a.isSelected && b.isSelected) return -1;
    return 0;
  });
  
  for (const item of sortedFurniture) {
    ctx.save();
    
    // Calculate position adjusted for canvas center
    const x = item.x;
    const y = item.y;
    
    // Translate to item center, rotate, then draw
    ctx.translate(x, y);
    ctx.rotate((item.rotation * Math.PI) / 180);
    
    // Draw item based on type
    const halfWidth = item.width / 2;
    const halfHeight = item.height / 2;
    
    // Draw placeholder rectangle
    if (item.isColliding) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
    } else if (item.isSelected) {
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.strokeStyle = '#333';
    }
    
    ctx.lineWidth = item.isSelected ? 2 : 1;
    
    // Draw rectangle for the item
    ctx.beginPath();
    ctx.rect(-halfWidth, -halfHeight, item.width, item.height);
    ctx.fill();
    ctx.stroke();
    
    // Draw image if available
    if (item.imageUrl) {
      const img = new Image();
      img.src = item.imageUrl;
      
      if (img.complete) {
        ctx.drawImage(img, -halfWidth, -halfHeight, item.width, item.height);
      }
    }
    
    // Draw selection handles if selected
    if (item.isSelected) {
      drawResizeHandles(ctx, halfWidth, halfHeight);
    }
    
    ctx.restore();
  }
};

// Draw resize handles for selected items
export const drawResizeHandles = (
  ctx: CanvasRenderingContext2D,
  halfWidth: number,
  halfHeight: number
) => {
  const handleSize = 8;
  
  // Draw handles at all corners and edges
  const handles = [
    { x: -halfWidth, y: -halfHeight }, // Top-left
    { x: 0, y: -halfHeight },          // Top-center
    { x: halfWidth, y: -halfHeight },  // Top-right
    { x: -halfWidth, y: 0 },           // Middle-left
    { x: halfWidth, y: 0 },            // Middle-right
    { x: -halfWidth, y: halfHeight },  // Bottom-left
    { x: 0, y: halfHeight },           // Bottom-center
    { x: halfWidth, y: halfHeight },   // Bottom-right
  ];
  
  handles.forEach(({ x, y }) => {
    ctx.beginPath();
    ctx.arc(x, y, handleSize, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
  });
};

// Draw measurements for selected item
export const drawMeasurements = (
  ctx: CanvasRenderingContext2D,
  item: FurnitureItem,
  unitSystem: 'metric' | 'imperial'
) => {
  ctx.save();
  
  // Position
  ctx.translate(item.x, item.y);
  ctx.rotate((item.rotation * Math.PI) / 180);
  
  const halfWidth = item.width / 2;
  const halfHeight = item.height / 2;
  
  // Format for display
  const formatMeasurement = (value: number): string => {
    if (unitSystem === 'metric') {
      return `${value} cm`;
    } else {
      // Convert to feet and inches
      const feet = Math.floor(value / 30.48);
      const inches = Math.round((value / 2.54) % 12);
      return `${feet}'${inches}"`;
    }
  };
  
  // Draw width measurement
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 3;
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const widthText = formatMeasurement(item.width);
  const heightText = formatMeasurement(item.height);
  
  // Width text
  ctx.strokeText(widthText, 0, -halfHeight - 15);
  ctx.fillText(widthText, 0, -halfHeight - 15);
  
  // Height text
  ctx.strokeText(heightText, halfWidth + 15, 0);
  ctx.fillText(heightText, halfWidth + 15, 0);
  
  // Width arrows
  ctx.beginPath();
  ctx.moveTo(-halfWidth, -halfHeight - 5);
  ctx.lineTo(halfWidth, -halfHeight - 5);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Width arrow heads
  ctx.beginPath();
  ctx.moveTo(-halfWidth + 5, -halfHeight - 8);
  ctx.lineTo(-halfWidth, -halfHeight - 5);
  ctx.lineTo(-halfWidth + 5, -halfHeight - 2);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(halfWidth - 5, -halfHeight - 8);
  ctx.lineTo(halfWidth, -halfHeight - 5);
  ctx.lineTo(halfWidth - 5, -halfHeight - 2);
  ctx.stroke();
  
  // Height arrows
  ctx.beginPath();
  ctx.moveTo(halfWidth + 5, -halfHeight);
  ctx.lineTo(halfWidth + 5, halfHeight);
  ctx.stroke();
  
  // Height arrow heads
  ctx.beginPath();
  ctx.moveTo(halfWidth + 2, -halfHeight + 5);
  ctx.lineTo(halfWidth + 5, -halfHeight);
  ctx.lineTo(halfWidth + 8, -halfHeight + 5);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(halfWidth + 2, halfHeight - 5);
  ctx.lineTo(halfWidth + 5, halfHeight);
  ctx.lineTo(halfWidth + 8, halfHeight - 5);
  ctx.stroke();
  
  ctx.restore();
};