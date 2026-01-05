
import { useState, useCallback } from 'react';
import { ParticleState, ShapeType } from '../types';
import { DEFAULT_SCALE, DEFAULT_EXPANSION, DEFAULT_SPEED } from '../constants';

export function useParticleStore() {
  const [state, setState] = useState<ParticleState>({
    shape: ShapeType.SPHERE,
    scale: DEFAULT_SCALE,
    expansion: DEFAULT_EXPANSION,
    speed: DEFAULT_SPEED,
    color: '#00ffff',
  });

  const [logs, setLogs] = useState<{timestamp: string, type: string, message: string}[]>([]);

  const addLog = useCallback((message: string, type: string = 'info') => {
    setLogs(prev => [{
      timestamp: new Date().toLocaleTimeString(),
      type,
      message
    }, ...prev].slice(0, 50));
  }, []);

  const updateState = useCallback((params: Partial<ParticleState>) => {
    setState(prev => ({ ...prev, ...params }));
  }, []);

  return { state, updateState, logs, addLog };
}
