
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Scene } from './components/Canvas/Scene';
import { AILiveController } from './components/AILiveController';
import { useParticleStore } from './hooks/useParticleStore';
import { SHAPES, COLORS } from './constants';
import { ShapeType } from './types';

const App: React.FC = () => {
  const { state, updateState, logs, addLog } = useParticleStore();
  const [isAIActive, setIsAIActive] = useState(false);

  const sidebarContent = (
    <>
      <div>
        <h1 className="text-3xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500 mb-2">
          AETHERIS
        </h1>
        <p className="text-xs text-white/50 uppercase tracking-widest font-semibold">Neural Particle Engine</p>
      </div>

      <div className="flex flex-col gap-4">
        <label className="text-sm font-medium text-white/70">Sacred Geometry</label>
        <div className="grid grid-cols-2 gap-2">
          {SHAPES.map((s) => (
            <button
              key={s.id}
              onClick={() => updateState({ shape: s.id as ShapeType })}
              className={`px-3 py-2 text-xs rounded-lg border transition-all ${
                state.shape === s.id
                  ? 'bg-white/20 border-white/40 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                  : 'bg-black/20 border-white/5 text-white/40 hover:border-white/20'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <label className="text-sm font-medium text-white/70">Aetheris Glow</label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => updateState({ color: c.value })}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                state.color === c.value ? 'border-white scale-110' : 'border-transparent opacity-50'
              }`}
              style={{ backgroundColor: c.value }}
              title={c.name}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between">
          <label className="text-sm font-medium text-white/70">Scale</label>
          <span className="text-xs text-cyan-400 font-mono">{state.scale.toFixed(1)}x</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="3"
          step="0.1"
          value={state.scale}
          onChange={(e) => updateState({ scale: parseFloat(e.target.value) })}
          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between">
          <label className="text-sm font-medium text-white/70">Expansion</label>
          <span className="text-xs text-cyan-400 font-mono">{state.expansion.toFixed(1)}x</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="5"
          step="0.1"
          value={state.expansion}
          onChange={(e) => updateState({ expansion: parseFloat(e.target.value) })}
          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
      </div>

      <div className="mt-auto pt-8">
        <button
          onClick={() => setIsAIActive(!isAIActive)}
          className={`w-full py-4 rounded-2xl font-bold text-sm tracking-widest transition-all ${
            isAIActive
              ? 'bg-red-500/20 border border-red-500/50 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
              : 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-[0_4px_20px_rgba(6,182,212,0.3)] hover:scale-[1.02]'
          }`}
        >
          {isAIActive ? 'DEACTIVATE AI LINK' : 'ESTABLISH NEURAL LINK'}
        </button>
        <p className="text-[10px] text-center mt-3 text-white/30 px-4 uppercase leading-relaxed">
          AI Monitoring requires camera & mic access for gesture mapping
        </p>
      </div>
    </>
  );

  const debugMonitor = (
    <>
      <div className="bg-black/60 backdrop-blur-lg border border-white/10 rounded-2xl p-4 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest">Live Console</h3>
          <div className={`w-2 h-2 rounded-full animate-pulse ${isAIActive ? 'bg-green-400' : 'bg-white/10'}`} />
        </div>
        <div className="h-64 overflow-y-auto space-y-2 scrollbar-hide">
          {logs.length === 0 ? (
            <p className="text-xs text-white/20 italic">Awaiting neural input...</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="text-[10px] leading-tight flex gap-2">
                <span className="text-white/20 shrink-0">[{log.timestamp}]</span>
                <span className={`${
                  log.type === 'ai' ? 'text-cyan-400' : log.type === 'error' ? 'text-red-400' : 'text-white/60'
                }`}>
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );

  return (
    <Layout sidebar={sidebarContent} debug={debugMonitor}>
      <Scene state={state} />
      
      <AILiveController
        isActive={isAIActive}
        onToggle={() => setIsAIActive(!isAIActive)}
        onLog={addLog}
        onStateUpdate={(params) => updateState(params)}
      />

      {/* Floating UI Elements */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <h2 className="text-5xl font-thin tracking-[0.5em] text-white/20 uppercase">Aetheris</h2>
      </div>

      {!isAIActive && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-white/5 border border-white/10 px-6 py-3 rounded-full backdrop-blur-md">
          <p className="text-xs text-white/40 tracking-wider">Drag to rotate • Established neural link for gesture control</p>
        </div>
      )}
    </Layout>
  );
};

export default App;
