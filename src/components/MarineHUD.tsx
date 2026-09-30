import React, { useEffect, useState } from 'react';
import {
  Volume2,
  VolumeX,
  Sun,
  Sunset,
  Moon,
  Compass,
  Maximize2,
  Minimize2,
  Anchor,
  Flashlight,
  Sparkles,
  Waves,
  Crosshair,
  X,
  Smartphone,
} from 'lucide-react';
import { AtmosphereMode, SpeciesType } from '../types/marine';
import { SPECIES_DATA } from '../data/speciesData';

interface MarineHUDProps {
  atmosphereMode: AtmosphereMode;
  onSelectMode: (mode: AtmosphereMode) => void;
  isAudioMuted: boolean;
  onToggleAudio: () => void;
  onTriggerDescent: () => void;
  onToggleSpeciesGuide: () => void;
  isFeedMode: boolean;
  onToggleFeedMode: () => void;
  isSpotlightEnabled: boolean;
  onToggleSpotlight: () => void;
  targetFishInfo: { species: SpeciesType; speed: number; depth: number } | null;
  onClearTargetFish: () => void;
  currentDepth: number;
  onSelectDepth: (depth: number) => void;
}

export const MarineHUD: React.FC<MarineHUDProps> = ({
  atmosphereMode,
  onSelectMode,
  isAudioMuted,
  onToggleAudio,
  onTriggerDescent,
  onToggleSpeciesGuide,
  isFeedMode,
  onToggleFeedMode,
  isSpotlightEnabled,
  onToggleSpotlight,
  targetFishInfo,
  onClearTargetFish,
  currentDepth,
  onSelectDepth,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDepthPicker, setShowDepthPicker] = useState(false);
  const [isPortraitMobile, setIsPortraitMobile] = useState(false);
  const [dismissOrientationPrompt, setDismissOrientationPrompt] = useState(false);

  useEffect(() => {
    const handleOrientation = () => {
      const isMobile = window.innerWidth <= 840 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      const isPortrait = window.innerHeight > window.innerWidth;
      setIsPortraitMobile(isMobile && isPortrait);
    };

    handleOrientation();
    window.addEventListener('resize', handleOrientation);
    window.addEventListener('orientationchange', handleOrientation);
    return () => {
      window.removeEventListener('resize', handleOrientation);
      window.removeEventListener('orientationchange', handleOrientation);
    };
  }, []);

  const enterLandscapeFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      }
      if ('orientation' in screen && 'lock' in (screen.orientation as unknown as { lock: (mode: string) => Promise<void> })) {
        await (screen.orientation as unknown as { lock: (mode: string) => Promise<void> }).lock('landscape').catch(() => {});
      }
    } catch {
      // Fullscreen policy fallback
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
        if ('orientation' in screen && 'lock' in (screen.orientation as unknown as { lock: (mode: string) => Promise<void> })) {
          await (screen.orientation as unknown as { lock: (mode: string) => Promise<void> }).lock('landscape').catch(() => {});
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          setIsFullscreen(false);
          if ('orientation' in screen && 'unlock' in (screen.orientation as unknown as { unlock: () => void })) {
            (screen.orientation as unknown as { unlock: () => void }).unlock();
          }
        }
      }
    } catch {
      // Fullscreen policy fallback
    }
  };

  const targetSpeciesData = targetFishInfo ? SPECIES_DATA[targetFishInfo.species] : null;

  return (
    <>
      {/* Mobile Portrait 16:9 Orientation Helper Banner */}
      {isPortraitMobile && !dismissOrientationPrompt && (
        <aside
          aria-label="Landscape mode suggestion"
          className="fixed top-12 left-1/2 -translate-x-1/2 z-40 w-[92vw] max-w-sm p-2.5 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-sky-400/40 shadow-2xl text-white flex items-center justify-between gap-2.5 animate-in fade-in slide-in-from-top-3 duration-300 select-none"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-sky-500/25 text-sky-300">
              <Smartphone className="w-4 h-4 rotate-90" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-sky-100">16:9 Gorizontal Ekran</p>
              <p className="text-[9px] text-white/70">To&apos;liq suvosti olami uchun telefonni aylantiring</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={enterLandscapeFullscreen}
              className="px-2.5 py-1 rounded-lg bg-sky-500/40 hover:bg-sky-500/60 border border-sky-400/40 text-[10px] font-medium text-white transition-all cursor-pointer whitespace-nowrap shadow-sm active:scale-95"
            >
              16:9 To&apos;liq
            </button>
            <button
              onClick={() => setDismissOrientationPrompt(true)}
              aria-label="Yopish"
              className="p-1 rounded-lg text-white/50 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      )}

      {/* Top minimal atmospheric wordmark */}
      <header className="fixed top-2 left-3 sm:top-4 sm:left-5 md:top-6 md:left-8 z-30 pointer-events-none select-none flex flex-col max-w-[68vw] sm:max-w-none">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-base md:text-xl lg:text-2xl font-light tracking-[0.12em] md:tracking-[0.16em] text-white/95 font-serif drop-shadow-md uppercase truncate">
            Abdulhay Avazxanov&apos;s creative project
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 text-[8px] sm:text-[10px] md:text-xs text-white/70 tracking-wider font-light mt-0.5 truncate">
          <span>Living Oceanic Ecosystem</span>
          <span aria-hidden="true">·</span>
          <span>16:9 Aquarium</span>
          <span aria-hidden="true">·</span>
          <span>{currentDepth}m Depth</span>
          <span aria-hidden="true">·</span>
          <span className="capitalize">{atmosphereMode === 'deep' ? 'Abyssal Midnight' : atmosphereMode} · Auto 5m</span>
        </div>
      </header>

      {/* Target Fish Follow-Cam HUD card (Active when a fish is clicked) */}
      {targetFishInfo && targetSpeciesData && (
        <div className="fixed top-12 sm:top-18 md:top-24 left-3 sm:left-6 md:left-8 z-30 animate-in fade-in slide-in-from-left-4 duration-200">
          <div className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2.5 md:p-3 rounded-xl sm:rounded-2xl bg-slate-950/65 backdrop-blur-xl border border-sky-400/30 text-white shadow-2xl">
            <div className="p-1 sm:p-2 rounded-lg sm:rounded-xl bg-sky-500/20 text-sky-300">
              <Crosshair className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[11px] sm:text-xs font-semibold text-sky-100">{targetSpeciesData.commonName}</span>
                <span className="text-[9px] sm:text-[10px] text-sky-300/70 italic font-mono hidden xs:inline">
                  {targetSpeciesData.scientificName}
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] text-white/60 font-mono mt-0.5">
                <span>Speed: {targetFishInfo.speed} kts</span>
                <span aria-hidden="true">·</span>
                <span>Depth: {targetFishInfo.depth}m</span>
              </div>
            </div>
            <button
              onClick={onClearTargetFish}
              title="Release camera tracking"
              className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer ml-1"
            >
              <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Glassmorphic Dock */}
      <nav
        aria-label="Aquarium Controls"
        className="fixed bottom-1.5 sm:bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center gap-1 md:gap-1.5 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl bg-slate-950/60 backdrop-blur-xl border border-white/15 shadow-2xl text-white select-none transition-all duration-300 max-w-[98vw] overflow-x-auto no-scrollbar"
      >
        {/* Atmosphere Selector: Segmented Control */}
        <div className="flex items-center p-0.5 rounded-lg sm:rounded-xl bg-white/5 border border-white/5 shrink-0">
          <button
            type="button"
            onClick={() => onSelectMode('day')}
            title="Day Mode: High-clarity turquoise water with sunlight shafts"
            className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium transition-all duration-200 cursor-pointer ${
              atmosphereMode === 'day'
                ? 'bg-sky-500/35 text-sky-100 shadow-sm border border-sky-400/40'
                : 'text-white/65 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sun className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden xs:inline sm:inline">Day</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectMode('sunset')}
            title="Sunset Mode: Warm golden twilight filtering into deep waters"
            className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium transition-all duration-200 cursor-pointer ${
              atmosphereMode === 'sunset'
                ? 'bg-amber-500/35 text-amber-100 shadow-sm border border-amber-400/40'
                : 'text-white/65 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sunset className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden xs:inline sm:inline">Sunset</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectMode('deep')}
            title="Deep Ocean Mode: Abyssal midnight with glowing bioluminescence"
            className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium transition-all duration-200 cursor-pointer ${
              atmosphereMode === 'deep'
                ? 'bg-cyan-500/35 text-cyan-100 shadow-sm border border-cyan-400/40'
                : 'text-white/65 hover:text-white hover:bg-white/5'
            }`}
          >
            <Moon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden xs:inline sm:inline">Deep</span>
          </button>
        </div>

        <div className="w-[1px] h-4 sm:h-5 bg-white/10 mx-0.5 hidden xs:block shrink-0" />

        {/* Fish Feeding Mode Toggle */}
        <button
          type="button"
          onClick={onToggleFeedMode}
          title={isFeedMode ? 'Feeding mode active: Click anywhere to drop food' : 'Turn on Fish Feeding mode'}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-medium transition-all duration-200 cursor-pointer shrink-0 ${
            isFeedMode
              ? 'bg-amber-500/40 text-amber-200 border border-amber-400/50 shadow-sm'
              : 'bg-white/5 text-white/65 hover:text-white hover:bg-white/10 border border-white/5'
          }`}
        >
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300" />
          <span className="hidden sm:inline">{isFeedMode ? 'Feed: ON' : 'Feed'}</span>
        </button>

        {/* ROV / Diver Spotlight Toggle */}
        <button
          type="button"
          onClick={onToggleSpotlight}
          title={isSpotlightEnabled ? 'Turn off Diver Spotlight' : 'Turn on Diver Spotlight'}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-medium transition-all duration-200 cursor-pointer shrink-0 ${
            isSpotlightEnabled
              ? 'bg-yellow-500/35 text-yellow-200 border border-yellow-400/50 shadow-sm'
              : 'bg-white/5 text-white/65 hover:text-white hover:bg-white/10 border border-white/5'
          }`}
        >
          <Flashlight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-300" />
          <span className="hidden sm:inline">{isSpotlightEnabled ? 'Torch: ON' : 'Torch'}</span>
        </button>

        {/* Depth Level Quick Selector */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowDepthPicker(!showDepthPicker)}
            title="Select ocean depth zone"
            className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/5 text-white/70 hover:text-white transition-all cursor-pointer"
          >
            <Waves className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-400" />
            <span>{currentDepth}m</span>
          </button>

          {showDepthPicker && (
            <div className="absolute bottom-11 sm:bottom-12 left-1/2 -translate-x-1/2 p-1.5 sm:p-2 rounded-xl bg-slate-900/95 backdrop-blur-md border border-white/10 shadow-2xl flex flex-col gap-1 min-w-[120px] sm:min-w-[130px] z-40">
              <button
                onClick={() => {
                  onSelectDepth(15);
                  setShowDepthPicker(false);
                }}
                className={`px-2 py-1.5 rounded-lg text-left text-[11px] sm:text-xs transition-colors cursor-pointer ${
                  currentDepth === 15 ? 'bg-sky-500/20 text-sky-200 font-medium' : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                15m · Sunlit Reef
              </button>
              <button
                onClick={() => {
                  onSelectDepth(120);
                  setShowDepthPicker(false);
                }}
                className={`px-2 py-1.5 rounded-lg text-left text-[11px] sm:text-xs transition-colors cursor-pointer ${
                  currentDepth === 120 ? 'bg-sky-500/20 text-sky-200 font-medium' : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                120m · Twilight Drop
              </button>
              <button
                onClick={() => {
                  onSelectDepth(750);
                  setShowDepthPicker(false);
                }}
                className={`px-2 py-1.5 rounded-lg text-left text-[11px] sm:text-xs transition-colors cursor-pointer ${
                  currentDepth === 750 ? 'bg-sky-500/20 text-sky-200 font-medium' : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                750m · Abyssal Trench
              </button>
            </div>
          )}
        </div>

        <div className="w-[1px] h-4 sm:h-5 bg-white/10 mx-0.5 hidden xs:block shrink-0" />

        {/* Ambient Sound Toggle */}
        <button
          type="button"
          onClick={onToggleAudio}
          title={isAudioMuted ? 'Turn on underwater ambience' : 'Mute underwater ambience'}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-medium transition-all duration-200 cursor-pointer shrink-0 ${
            !isAudioMuted
              ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 shadow-sm'
              : 'bg-white/5 text-white/65 hover:text-white hover:bg-white/10 border border-white/5'
          }`}
        >
          {!isAudioMuted ? (
            <>
              <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-300 animate-pulse" />
              <span className="hidden sm:inline">Audio</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white/50" />
              <span className="hidden sm:inline">Mute</span>
            </>
          )}
        </button>

        {/* Dive Again / Cinematic Descent Button */}
        <button
          type="button"
          onClick={onTriggerDescent}
          title="Descend into the reef from the surface"
          className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/5 text-white/70 hover:text-white transition-all cursor-pointer shrink-0"
        >
          <Anchor className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span className="hidden sm:inline">Dive</span>
        </button>

        {/* Marine Species Guide Button */}
        <button
          type="button"
          onClick={onToggleSpeciesGuide}
          title="View marine species catalog and reef guide"
          className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/5 text-white/70 hover:text-white transition-all cursor-pointer shrink-0"
        >
          <Compass className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span className="hidden sm:inline">Species</span>
        </button>

        {/* Fullscreen 16:9 Toggle */}
        <button
          type="button"
          onClick={toggleFullscreen}
          title="16:9 Landscape Gorizontal To'liq Ekran"
          className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer shrink-0"
        >
          {isFullscreen ? (
            <Minimize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          ) : (
            <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          )}
        </button>
      </nav>

      {/* Bottom-right interactive hint */}
      <div className="fixed bottom-3 right-6 z-20 pointer-events-none select-none text-[10px] sm:text-[11px] text-white/45 hidden lg:flex items-center gap-2 font-light">
        <span>Click fish to track · Click water to feed or ripple</span>
      </div>
    </>
  );
};

