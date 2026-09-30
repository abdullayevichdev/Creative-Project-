import React, { useEffect, useRef, useState } from 'react';
import { underwaterAudio } from '../audio/UnderwaterAudio';
import { UnderwaterEngine } from '../engine/UnderwaterEngine';
import { AtmosphereMode, SpeciesType } from '../types/marine';

interface UnderwaterCanvasProps {
  atmosphereMode: AtmosphereMode;
  onInspectSpecies?: (species: SpeciesType) => void;
  onTargetFishInfo?: (info: { species: SpeciesType; speed: number; depth: number } | null) => void;
  engineRef?: React.MutableRefObject<UnderwaterEngine | null>;
}

export const UnderwaterCanvas: React.FC<UnderwaterCanvasProps> = ({
  atmosphereMode,
  onInspectSpecies,
  onTargetFishInfo,
  engineRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineInstanceRef = useRef<UnderwaterEngine | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new UnderwaterEngine(canvas);
    engineInstanceRef.current = engine;
    if (engineRef) {
      engineRef.current = engine;
    }

    if (onInspectSpecies) {
      engine.onInspectSpecies = onInspectSpecies;
    }

    if (onTargetFishInfo) {
      engine.onTargetFishInfo = onTargetFishInfo;
    }

    engine.start();

    const handleResize = () => {
      engine.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.destroy();
      engineInstanceRef.current = null;
      if (engineRef) {
        engineRef.current = null;
      }
    };
  }, []);

  // Update atmosphere mode when prop changes
  useEffect(() => {
    if (engineInstanceRef.current) {
      engineInstanceRef.current.setAtmosphereMode(atmosphereMode);
    }
  }, [atmosphereMode]);

  // Mouse handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    engineInstanceRef.current?.setMousePosition(x, y);
  };

  const handleMouseLeave = () => {
    engineInstanceRef.current?.clearMousePosition();
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Trigger visual ripple & bubble plume
    engineInstanceRef.current?.triggerClickInteraction(x, y);

    // Audio bubble pop
    underwaterAudio.playClickBubble();

    if (!hasInteracted) {
      setHasInteracted(true);
    }
  };

  // Touch handlers for mobile/tablet
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const rect = e.currentTarget.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      engineInstanceRef.current?.setMousePosition(x, y);
    }
  };

  const handleTouchEnd = () => {
    engineInstanceRef.current?.clearMousePosition();
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const rect = e.currentTarget.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      engineInstanceRef.current?.triggerClickInteraction(x, y);
      underwaterAudio.playClickBubble();
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none cursor-crosshair">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      />
    </div>
  );
};
