import { useEffect, useRef, useState } from 'react';

import { isSidePanelView } from '@/utils/view/sidepanel';

import { BackgroundContainer } from './styled';

type BackgroundLayer = {
  children: JSX.Element;
};

export default function BackgroundLayer({ children }: BackgroundLayer) {
  const [showBackground, setShowBackground] = useState(false);

  useEffect(() => {
    if (isSidePanelView()) {
      setShowBackground(true);
    }
  }, []);

  return (
    <BackgroundContainer>
      {showBackground && <BackgroundStars />}

      {children}
    </BackgroundContainer>
  );
}

const MIN_WIDTH = 1024;

function BackgroundStars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<{ x: number; y: number; radius: number; delay: number }[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const initialize = () => {
      const width = Math.max(window.innerWidth, MIN_WIDTH);
      const height = window.innerHeight;

      if (width === 0 || height === 0) {
        setTimeout(initialize, 100);
        return;
      }

      canvas.width = width;
      canvas.height = height;

      if (starsRef.current.length === 0) {
        starsRef.current = Array.from({ length: 300 }).map(() => ({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.5 + 0.5,
          delay: Math.random() * 2000,
          blur: (Math.random() * 2 + 0.8) / 10,
        }));
      }

      setIsReady(true);
    };

    initialize();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let animationFrameId: number;

    const draw = (time = 0) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      starsRef.current.forEach((star) => {
        const t = (time + star.delay) % 2000;
        const opacity = Math.abs(Math.sin((t / 2000) * Math.PI));

        ctx.beginPath();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = '#838383eb';
        ctx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isReady]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  );
}
