/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { underwaterAudio } from './audio/UnderwaterAudio';
import { MarineHUD } from './components/MarineHUD';
import { SpeciesModal } from './components/SpeciesModal';
import { UnderwaterCanvas } from './components/UnderwaterCanvas';
import { UnderwaterEngine } from './engine/UnderwaterEngine';
import { AtmosphereMode, SpeciesType } from './types/marine';

const ATMOSPHERE_CYCLE: AtmosphereMode[] = ['day', 'sunset', 'deep'];
const FIVE_MINUTES_MS = 5 * 60 * 1000; // 5 daqiqa (300 soniya)

export default function App() {
  const [atmosphereMode, setAtmosphereMode] = useState<AtmosphereMode>('day');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(true);
  const [isSpeciesGuideOpen, setIsSpeciesGuideOpen] = useState<boolean>(false);
  const [inspectedSpecies, setInspectedSpecies] = useState<SpeciesType | null>(null);

  // New interactive states
  const [isFeedMode, setIsFeedMode] = useState<boolean>(false);
  const [isSpotlightEnabled, setIsSpotlightEnabled] = useState<boolean>(false);
  const [currentDepth, setCurrentDepth] = useState<number>(25);
  const [targetFishInfo, setTargetFishInfo] = useState<{
    species: SpeciesType;
    speed: number;
    depth: number;
  } | null>(null);
  const [cycleResetKey, setCycleResetKey] = useState<number>(0);

  const engineRef = useRef<UnderwaterEngine | null>(null);

  // Har 5 daqiqada Day -> Sunset -> Deep avtomatik almashib turishi
  useEffect(() => {
    const timer = setInterval(() => {
      setAtmosphereMode((current) => {
        const nextIndex = (ATMOSPHERE_CYCLE.indexOf(current) + 1) % ATMOSPHERE_CYCLE.length;
        const nextMode = ATMOSPHERE_CYCLE[nextIndex];
        underwaterAudio.setAtmosphereMode(nextMode);
        return nextMode;
      });
    }, FIVE_MINUTES_MS);

    return () => clearInterval(timer);
  }, [cycleResetKey]);

  const handleSelectMode = (mode: AtmosphereMode) => {
    setAtmosphereMode(mode);
    underwaterAudio.setAtmosphereMode(mode);
    setCycleResetKey((k) => k + 1); // Foydalanuvchi qo'lda tanlasa, yangi 5 daqiqalik davr boshlanadi
  };

  const handleToggleAudio = () => {
    const isNowPlaying = underwaterAudio.toggleMute();
    setIsAudioMuted(!isNowPlaying);
  };

  const handleTriggerDescent = () => {
    engineRef.current?.startDescent();
  };

  const handleInspectSpecies = (species: SpeciesType) => {
    setInspectedSpecies(species);
  };

  const handleToggleFeedMode = () => {
    if (engineRef.current) {
      const active = engineRef.current.toggleFeedMode();
      setIsFeedMode(active);
    }
  };

  const handleToggleSpotlight = () => {
    if (engineRef.current) {
      const active = engineRef.current.toggleSpotlight();
      setIsSpotlightEnabled(active);
    }
  };

  const handleClearTargetFish = () => {
    engineRef.current?.clearTargetFish();
    setTargetFishInfo(null);
  };

  const handleSelectDepth = (depth: number) => {
    setCurrentDepth(depth);
    engineRef.current?.setDepth(depth);
    if (depth >= 500) {
      handleSelectMode('deep');
    } else if (depth >= 100) {
      handleSelectMode('sunset');
    } else {
      handleSelectMode('day');
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* Real-time Photorealistic Underwater Canvas Environment */}
      <UnderwaterCanvas
        atmosphereMode={atmosphereMode}
        onInspectSpecies={handleInspectSpecies}
        onTargetFishInfo={setTargetFishInfo}
        engineRef={engineRef}
      />

      {/* Luxury Minimalist HUD Overlay */}
      <MarineHUD
        atmosphereMode={atmosphereMode}
        onSelectMode={handleSelectMode}
        isAudioMuted={isAudioMuted}
        onToggleAudio={handleToggleAudio}
        onTriggerDescent={handleTriggerDescent}
        onToggleSpeciesGuide={() => setIsSpeciesGuideOpen(true)}
        isFeedMode={isFeedMode}
        onToggleFeedMode={handleToggleFeedMode}
        isSpotlightEnabled={isSpotlightEnabled}
        onToggleSpotlight={handleToggleSpotlight}
        targetFishInfo={targetFishInfo}
        onClearTargetFish={handleClearTargetFish}
        currentDepth={currentDepth}
        onSelectDepth={handleSelectDepth}
      />

      {/* Marine Life Species Discovery Guide */}
      <SpeciesModal
        isOpen={isSpeciesGuideOpen}
        onClose={() => setIsSpeciesGuideOpen(false)}
        selectedSpeciesId={inspectedSpecies}
      />
    </div>
  );
}
