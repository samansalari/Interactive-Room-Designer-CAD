// Screen navigation types
export type AppScreen = 'welcome' | 'roomSetup' | 'designer' | 'settings';

// Room shape and dimensions
export interface RoomDimensions {
  width: number;
  height: number;
  shape: 'rectangle' | 'lShape' | 'custom';
  walls?: Wall[];
  basement?: BasementStructure;
  canvasWidth?: number;
  canvasHeight?: number;
  templateImage?: string;
}

export interface BasementStructure {
  id: string;
  type: 'custom' | 'preset';
  imageUrl: string;
  width: number;
  height: number;
  x: number;
  y: number;
  rotation: number;
}

export interface Wall {
  id: string;
  start: Point;
  end: Point;
  length: number;
}

export interface Point {
  x: number;
  y: number;
}

// Furniture items
export interface FurnitureItem {
  id: string;
  type: string;
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  rotation: number;
  imageUrl: string;
  category: FurnitureCategory;
  isSelected?: boolean;
  isColliding?: boolean;
  initialX?: number;
  initialY?: number;
}

export type FurnitureCategory = 
  'living' | 
  'bedroom' | 
  'kitchen' | 
  'bathroom' | 
  'office' | 
  'outdoor' | 
  'custom';

// Settings
export interface AppSettings {
  unitSystem: 'metric' | 'imperial';
  gridSize: number;
  showGrid: boolean;
  showRuler: boolean;
  theme: 'light' | 'dark';
  font: 'geist' | 'roboto' | 'openSans';
  logoUrl?: string;
}

// Measurement display
export interface Measurement {
  value: number;
  unit: string;
  x: number;
  y: number;
  rotation: number;
  type: 'width' | 'height' | 'distance';
}

// Room templates
export interface RoomTemplate {
  id: string;
  name: string;
  dimensions: RoomDimensions;
  thumbnail: string;
}

// Export options
export interface ExportOptions {
  format: 'png' | 'pdf';
  includeGrid: boolean;
  includeMeasurements: boolean;
  includeLogo: boolean;
  resolution: 'low' | 'medium' | 'high';
}