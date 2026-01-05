
import { ShapeType } from './types';

export const PARTICLE_COUNT = 20000;
export const DEFAULT_SPEED = 0.05;
export const DEFAULT_SCALE = 1.0;
export const DEFAULT_EXPANSION = 1.0;

export const SHAPES = [
  { id: ShapeType.SPHERE, name: 'Celestial Sphere' },
  { id: ShapeType.TORUS_KNOT, name: 'Infinite Knot' },
  { id: ShapeType.HEART, name: 'Aetheris Core' },
  { id: ShapeType.MANDALA, name: 'Sacred Mandala' }
];

export const COLORS = [
  { name: 'Cyan Nebula', value: '#00ffff' },
  { name: 'Electric Violet', value: '#8b5cf6' },
  { name: 'Solar Flare', value: '#f59e0b' },
  { name: 'Emerald Glow', value: '#10b981' },
  { name: 'Rose Quartz', value: '#ec4899' }
];
