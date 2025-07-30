/**
 * Advanced Particle System for Visual Effects
 * Supports musical note particles, rhythm visualization, and instrument-specific effects
 */

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'note' | 'explosion' | 'trail' | 'beat' | 'frequency';
  frequency?: number;
  instrument?: string;
}

interface ParticleSystemProps {
  width: number;
  height: number;
  className?: string;
  enabled?: boolean;
  maxParticles?: number;
  onParticleComplete?: (particle: Particle) => void;
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({
  width,
  height,
  className,
  enabled = true,
  maxParticles = 200,
  onParticleComplete
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();
  const [isRunning, setIsRunning] = useState(false);

  // Particle creation functions
  const createNoteParticle = (x: number, y: number, frequency: number, instrument: string): Particle => {
    const hue = (frequency - 200) % 360; // Map frequency to color
    const size = Math.max(2, Math.min(8, frequency / 100));
    
    return {
      id: `note-${Date.now()}-${Math.random()}`,
      x,
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: -Math.random() * 3 - 1,
      life: 60,
      maxLife: 60,
      size,
      color: `hsl(${hue}, 70%, 60%)`,
      type: 'note',
      frequency,
      instrument
    };
  };

  const createExplosionParticles = (x: number, y: number, count: number = 8): Particle[] => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      
      return {
        id: `explosion-${Date.now()}-${i}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 30,
        maxLife: 30,
        size: Math.random() * 4 + 2,
        color: `hsl(${Math.random() * 60 + 15}, 80%, 70%)`, // Orange to yellow
        type: 'explosion'
      };
    });
  };

  const createBeatParticle = (x: number, y: number, intensity: number): Particle => {
    return {
      id: `beat-${Date.now()}-${Math.random()}`,
      x,
      y,
      vx: 0,
      vy: 0,
      life: 20,
      maxLife: 20,
      size: intensity * 10 + 5,
      color: `hsl(${Math.random() * 60 + 260}, 80%, 70%)`, // Purple to blue
      type: 'beat'
    };
  };

  const createFrequencyVisualization = (audioData: Uint8Array): Particle[] => {
    const particles: Particle[] = [];
    const barWidth = width / audioData.length;
    
    for (let i = 0; i < audioData.length; i += 4) { // Sample every 4th frequency bin
      const value = audioData[i] / 255;
      if (value > 0.1) { // Only create particles for significant frequencies
        const x = i * barWidth;
        const y = height - (value * height * 0.5);
        const hue = (i / audioData.length) * 360;
        
        particles.push({
          id: `freq-${Date.now()}-${i}`,
          x,
          y,
          vx: 0,
          vy: -value * 2,
          life: 30,
          maxLife: 30,
          size: value * 6 + 1,
          color: `hsl(${hue}, 70%, 60%)`,
          type: 'frequency'
        });
      }
    }
    
    return particles;
  };

  // Animation loop
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Update and draw particles
    particlesRef.current = particlesRef.current.filter(particle => {
      // Update particle physics
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;

      // Apply gravity for certain particle types
      if (particle.type === 'note' || particle.type === 'explosion') {
        particle.vy += 0.1;
      }

      // Apply damping
      particle.vx *= 0.99;
      particle.vy *= 0.99;

      // Remove particles that are out of bounds or dead
      if (particle.life <= 0 || 
          particle.x < -50 || particle.x > width + 50 || 
          particle.y < -50 || particle.y > height + 50) {
        onParticleComplete?.(particle);
        return false;
      }

      // Draw particle
      const alpha = particle.life / particle.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;

      switch (particle.type) {
        case 'note':
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          
          // Add a glow effect
          ctx.shadowBlur = 10;
          ctx.shadowColor = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'explosion':
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'beat':
          ctx.strokeStyle = particle.color;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
          ctx.stroke();
          break;

        case 'frequency':
          ctx.fillStyle = particle.color;
          ctx.fillRect(particle.x - 1, particle.y, 2, particle.size);
          break;
      }

      ctx.restore();
      return true;
    });

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Start/stop animation
  useEffect(() => {
    if (enabled && !isRunning) {
      setIsRunning(true);
      animate();
    } else if (!enabled && isRunning) {
      setIsRunning(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, isRunning]);

  // Public API for creating particles
  const addNoteParticle = (x: number, y: number, frequency: number, instrument: string) => {
    if (particlesRef.current.length >= maxParticles) return;
    particlesRef.current.push(createNoteParticle(x, y, frequency, instrument));
  };

  const addExplosion = (x: number, y: number, count?: number) => {
    const newParticles = createExplosionParticles(x, y, count);
    particlesRef.current.push(...newParticles.slice(0, maxParticles - particlesRef.current.length));
  };

  const addBeatVisualization = (x: number, y: number, intensity: number) => {
    if (particlesRef.current.length >= maxParticles) return;
    particlesRef.current.push(createBeatParticle(x, y, intensity));
  };

  const addFrequencyVisualization = (audioData: Uint8Array) => {
    const newParticles = createFrequencyVisualization(audioData);
    particlesRef.current.push(...newParticles.slice(0, maxParticles - particlesRef.current.length));
  };

  // Expose particle system methods
  React.useEffect(() => {
    // External components can access these methods through refs
    (window as any).particleSystemAPI = {
      addNoteParticle,
      addExplosion,
      addBeatVisualization,
      addFrequencyVisualization,
      clear: () => { particlesRef.current = []; },
      getParticleCount: () => particlesRef.current.length
    };
  }, [addNoteParticle, addExplosion, addBeatVisualization, addFrequencyVisualization]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={cn("absolute inset-0 pointer-events-none", className)}
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
};

export default ParticleSystem;