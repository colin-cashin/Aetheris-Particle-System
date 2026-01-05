
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, Modality, Type, LiveServerMessage, FunctionDeclaration } from '@google/genai';
import { encode, decode, decodeAudioData } from '../utils/encoding';
import { ParticleState, ShapeType } from '../types';

interface AILiveControllerProps {
  onStateUpdate: (state: Partial<ParticleState>) => void;
  onLog: (msg: string, type: string) => void;
  isActive: boolean;
  onToggle: () => void;
}

const CONTROL_FUNCTION: FunctionDeclaration = {
  name: 'setParticleState',
  parameters: {
    type: Type.OBJECT,
    description: 'Updates the visual parameters of the Aetheris particle system based on hand gestures.',
    properties: {
      shape: {
        type: Type.STRING,
        enum: Object.values(ShapeType),
        description: 'The geometry to morph into.',
      },
      scale: {
        type: Type.NUMBER,
        description: 'Size multiplier (0.5 to 3.0). Mapped to hand distance.',
      },
      expansion: {
        type: Type.NUMBER,
        description: 'Dispersion of particles (0.5 to 5.0). Mapped to finger spread.',
      },
      speed: {
        type: Type.NUMBER,
        description: 'Rotation/animation speed (0.01 to 0.2).',
      },
      color: {
        type: Type.STRING,
        description: 'Hex color code for the glow effect.',
      }
    },
    required: [],
  },
};

export const AILiveController: React.FC<AILiveControllerProps> = ({ 
  onStateUpdate, 
  onLog, 
  isActive, 
  onToggle 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<any>(null);
  const frameIntervalRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Audio Contexts
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  const startSession = useCallback(async () => {
    if (!process.env.API_KEY) {
      onLog("API Key missing", "error");
      return;
    }

    onLog("Initializing Aetheris AI...", "info");

    try {
      const userMedia = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: { width: 640, height: 480, frameRate: 15 } 
      });
      setStream(userMedia);
      if (videoRef.current) videoRef.current.srcObject = userMedia;

      inputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: 'You are Aetheris, a visionary interface. Monitor the camera for hand gestures. If the user spreads their fingers, increase "expansion". If they move their hands closer, decrease "scale". If they move them apart, increase "scale". Call setParticleState frequently to reflect movement. Speak poetically about the sacred geometry.',
          tools: [{ functionDeclarations: [CONTROL_FUNCTION] }],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
        },
        callbacks: {
          onopen: () => {
            onLog("Neural link established.", "info");
            
            // Stream audio
            const source = inputAudioCtxRef.current!.createMediaStreamSource(userMedia);
            const processor = inputAudioCtxRef.current!.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob = { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(processor);
            processor.connect(inputAudioCtxRef.current!.destination);

            // Stream video frames
            frameIntervalRef.current = setInterval(() => {
              if (canvasRef.current && videoRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                  ctx.drawImage(videoRef.current, 0, 0, 320, 240);
                  const base64Data = canvasRef.current.toDataURL('image/jpeg', 0.6).split(',')[1];
                  sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64Data, mimeType: 'image/jpeg' } }));
                }
              }
            }, 1000);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'setParticleState') {
                  onStateUpdate(fc.args as Partial<ParticleState>);
                  onLog(`AI Action: ${JSON.stringify(fc.args)}`, "ai");
                  sessionPromise.then(s => s.sendToolResponse({
                    functionResponses: { id: fc.id, name: fc.name, response: { result: "ok" } }
                  }));
                }
              }
            }

            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outputAudioCtxRef.current) {
              const ctx = outputAudioCtxRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => onLog(`AI Error: ${e}`, "error"),
          onclose: () => onLog("AI connection closed.", "info"),
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      onLog(`Failed to start AI: ${err.message}`, "error");
    }
  }, [onLog, onStateUpdate]);

  const stopSession = useCallback(() => {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
    onLog("Aetheris AI deactivated.", "info");
  }, [stream, onLog]);

  useEffect(() => {
    if (isActive) {
      startSession();
    } else {
      stopSession();
    }
    return () => stopSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  return (
    <div className="hidden">
      <video ref={videoRef} autoPlay playsInline muted />
      <canvas ref={canvasRef} width={320} height={240} />
    </div>
  );
};
