// components/shared/WaveBackground.tsx
'use client';

import { useEffect, useRef } from 'react';

export function WaveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const drawWave = (y: number, amplitude: number, frequency: number, phase: number, color: string, opacity: number) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.globalAlpha = opacity;
      ctx.lineWidth = 2;

      for (let x = 0; x < canvas.width; x += 10) {
        const waveY = y + Math.sin(x * frequency + phase) * amplitude;
        if (x === 0) {
          ctx.moveTo(x, waveY);
        } else {
          ctx.lineTo(x, waveY);
        }
      }
      ctx.stroke();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0A0E27');
      gradient.addColorStop(0.5, '#1A1F3D');
      gradient.addColorStop(1, '#0A0E27');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw waves
      const wave1Y = canvas.height * 0.2;
      const wave2Y = canvas.height * 0.4;
      const wave3Y = canvas.height * 0.6;

      drawWave(wave1Y, 60, 0.002, time * 0.002, '#00D4FF', 0.3);
      drawWave(wave2Y, 40, 0.003, time * 0.003, '#7C3AED', 0.3);
      drawWave(wave3Y, 30, 0.004, time * 0.004, '#06B6D4', 0.2);

      // Draw gradient overlay for depth
      const overlayGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      overlayGradient.addColorStop(0, 'rgba(10, 14, 39, 0.8)');
      overlayGradient.addColorStop(1, 'rgba(10, 14, 39, 0.5)');
      ctx.fillStyle = overlayGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      time += 16;
      animationFrameId = requestAnimationFrame(draw);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      aria-hidden="true"
    />
  );
}
