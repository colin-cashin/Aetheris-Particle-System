
export enum ShapeType {
  SPHERE = 'sphere',
  TORUS_KNOT = 'torus_knot',
  HEART = 'heart',
  MANDALA = 'mandala'
}

export interface ParticleState {
  shape: ShapeType;
  scale: number;
  expansion: number;
  speed: number;
  color: string;
}

export interface LogEntry {
  timestamp: string;
  type: 'info' | 'ai' | 'error';
  message: string;
}
