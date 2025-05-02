import { FurnitureItem, Point, RoomDimensions } from '../types';

// Helper to get corners of a furniture item
const getItemCorners = (item: FurnitureItem): Point[] => {
  const halfWidth = item.width / 2;
  const halfHeight = item.height / 2;
  
  // Get corners before rotation
  const corners = [
    { x: -halfWidth, y: -halfHeight }, // Top-left
    { x: halfWidth, y: -halfHeight },  // Top-right
    { x: halfWidth, y: halfHeight },   // Bottom-right
    { x: -halfWidth, y: halfHeight },  // Bottom-left
  ];
  
  // Apply rotation
  const radians = (item.rotation * Math.PI) / 180;
  const rotatedCorners = corners.map(corner => {
    return {
      x: corner.x * Math.cos(radians) - corner.y * Math.sin(radians) + item.x,
      y: corner.x * Math.sin(radians) + corner.y * Math.cos(radians) + item.y,
    };
  });
  
  return rotatedCorners;
};

// Check if a point is inside a rectangle
const isPointInRectangle = (point: Point, rectangle: Point[]): boolean => {
  // Implementation of the ray casting algorithm
  let inside = false;
  for (let i = 0, j = rectangle.length - 1; i < rectangle.length; j = i++) {
    const xi = rectangle[i].x;
    const yi = rectangle[i].y;
    const xj = rectangle[j].x;
    const yj = rectangle[j].y;
    
    const intersect = ((yi > point.y) !== (yj > point.y))
      && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
  }
  
  return inside;
};

// Check if two items are colliding
const areItemsColliding = (item1: FurnitureItem, item2: FurnitureItem): boolean => {
  if (item1.id === item2.id) return false;
  
  const corners1 = getItemCorners(item1);
  const corners2 = getItemCorners(item2);
  
  // Check if any corner of item1 is inside item2
  for (const corner of corners1) {
    if (isPointInRectangle(corner, corners2)) {
      return true;
    }
  }
  
  // Check if any corner of item2 is inside item1
  for (const corner of corners2) {
    if (isPointInRectangle(corner, corners1)) {
      return true;
    }
  }
  
  return false;
};

// Check if an item is out of room bounds
const isItemOutOfBounds = (item: FurnitureItem, room: RoomDimensions): boolean => {
  // For now, we'll just check a simplified rectangle room
  // In a full implementation, you'd check against the actual room shape
  
  const corners = getItemCorners(item);
  const roomWidth = room.width;
  const roomHeight = room.height;
  
  // Get room center coordinates (assumed to be at canvas center)
  const canvas = document.querySelector('canvas');
  if (!canvas) return true;
  
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  
  const roomLeft = canvasWidth / 2 - roomWidth / 2;
  const roomTop = canvasHeight / 2 - roomHeight / 2;
  const roomRight = roomLeft + roomWidth;
  const roomBottom = roomTop + roomHeight;
  
  // Check if any corner is outside the room
  for (const corner of corners) {
    if (
      corner.x < roomLeft ||
      corner.x > roomRight ||
      corner.y < roomTop ||
      corner.y > roomBottom
    ) {
      return true;
    }
  }
  
  return false;
};

// Main collision detection function
export const checkCollisions = (
  item: FurnitureItem,
  allItems: FurnitureItem[],
  room: RoomDimensions
): boolean => {
  // Check for collisions with other items
  for (const otherItem of allItems) {
    if (item.id !== otherItem.id && areItemsColliding(item, otherItem)) {
      return true;
    }
  }
  
  // Check if item is out of room bounds
  if (isItemOutOfBounds(item, room)) {
    return true;
  }
  
  return false;
};