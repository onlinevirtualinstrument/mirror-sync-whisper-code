import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
}

interface ParticleSystemProps {
  isActive: boolean;
  type: 'notes' | 'sparkles' | 'musical' | 'bubbles' | 'stars';
  intensity?: number;
  color?: string;
  className?: string;
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({
  isActive,
  type,
  intensity = 1,
  color = '#3b82f6',
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  const createParticle = (x?: number, y?: number): Particle => {
    const canvas = canvasRef.current;
    if (!canvas) return {} as Particle;

    const colors = {
      notes: ['#3b82f6', '#06b6d4', '#8b5cf6'],
      sparkles: ['#fbbf24', '#f59e0b', '#d97706'],
      musical: ['#ec4899', '#be185d', '#9d174d'],
      bubbles: ['#06b6d4', '#0891b2', '#0e7490'],
      stars: ['#fbbf24', '#f59e0b', '#eab308']
    };

    return {
      x: x ?? Math.random() * canvas.width,
      y: y ?? Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      size: Math.random() * 8 + 2,
      opacity: 1,
      color: colors[type][Math.floor(Math.random() * colors[type].length)],
      life: 0,
      maxLife: 60 + Math.random() * 60
    };
  };

  const updateParticles = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particles.current = particles.current.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life++;
      particle.opacity = Math.max(0, 1 - particle.life / particle.maxLife);

      // Apply gravity for notes
      if (type === 'notes') {
        particle.vy += 0.1;
      }

      // Bounce bubbles
      if (type === 'bubbles') {
        particle.vy -= 0.05;
        if (particle.y < 0) particle.vy = Math.abs(particle.vy);
      }

      // Draw particle
      ctx.save();
      ctx.globalAlpha = particle.opacity;
      ctx.fillStyle = particle.color;

      if (type === 'notes') {
        // Draw musical note shape
        ctx.beginPath();
        ctx.ellipse(particle.x, particle.y, particle.size * 0.6, particle.size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(particle.x + particle.size * 0.5, particle.y - particle.size, 2, particle.size);
      } else if (type === 'sparkles') {
        // Draw star shape
        const spikes = 5;
        const outerRadius = particle.size;
        const innerRadius = particle.size * 0.5;
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (i * Math.PI) / spikes;
          const x = particle.x + Math.cos(angle) * radius;
          const y = particle.y + Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      } else {
        // Draw circle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      return particle.life < particle.maxLife && particle.opacity > 0.01;
    });

    // Add new particles
    if (isActive && particles.current.length < 50 * intensity) {
      for (let i = 0; i < Math.ceil(2 * intensity); i++) {
        particles.current.push(createParticle());
      }
    }

    if (isActive || particles.current.length > 0) {
      animationRef.current = requestAnimationFrame(updateParticles);
    }
  };

  const triggerParticle = (x: number, y: number) => {
    if (isActive) {
      particles.current.push(createParticle(x, y));
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    if (isActive) {
      updateParticles();
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, type, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 10 }}
    />
  );
};

export default ParticleSystem;