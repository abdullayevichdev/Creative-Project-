export type AtmosphereMode = 'day' | 'sunset' | 'deep';

export interface AtmosphereConfig {
  name: string;
  label: string;
  waterTopColor: string;
  waterBottomColor: string;
  waterHazeColor: string;
  sunbeamColor: string;
  sunbeamIntensity: number;
  causticColor: string;
  causticIntensity: number;
  sandColor1: string;
  sandColor2: string;
  ambientLight: number;
  bioluminescence: boolean;
  particleColor: string;
  bubbleGlow: string;
}

export type SpeciesType =
  | 'clownfish'
  | 'blue_tang'
  | 'goldfish'
  | 'angelfish'
  | 'tropical_chromis'
  | 'school_fish'
  | 'sea_turtle'
  | 'jellyfish'
  | 'stingray'
  | 'shark_silhouette'
  | 'whale_silhouette'
  | 'reef_crab';

export interface FoodPellet {
  id: number;
  x: number;
  y: number;
  vy: number;
  vx: number;
  size: number;
  eaten: boolean;
  alpha: number;
}

export interface SeabedCrab {
  x: number;
  y: number;
  vx: number;
  scale: number;
  legCycle: number;
  state: 'walking' | 'idle' | 'burrowing';
  stateTimer: number;
  direction: number; // 1: right, -1: left
}

export interface SpeciesInfo {
  id: SpeciesType;
  commonName: string;
  scientificName: string;
  depthZone: string;
  description: string;
  diet: string;
  lifespan: string;
  accentColor: string;
}

export interface FishEntity {
  id: number;
  species: SpeciesType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseSpeed: number;
  baseY: number;
  scale: number;
  layer: number; // 0: background, 1: midground, 2: foreground
  swimCycle: number;
  swimSpeed: number;
  amplitude: number;
  frequency: number;
  finCycle: number;
  rotation: number;
  targetRotation: number;
  colorVariance: number;
  fleeTimer: number;
}

export interface SchoolFishEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  scale: number;
  swimCycle: number;
  tailPhase: number;
  colorHue: number;
}

export interface BubbleEntity {
  x: number;
  y: number;
  radius: number;
  baseRadius: number;
  vy: number;
  vx: number;
  wobbleSpeed: number;
  wobblePhase: number;
  wobbleDist: number;
  alpha: number;
  layer: number;
  popping?: boolean;
  popProgress?: number;
}

export interface MarineParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  glow: number;
  pulsePhase: number;
  pulseSpeed: number;
}

export interface ClickRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  life: number;
}

export interface KelpStrand {
  baseX: number;
  baseY: number;
  height: number;
  segments: number;
  segmentLength: number;
  angles: number[];
  color: string;
  width: number;
  waveSpeed: number;
  waveOffset: number;
  leaves: { segment: number; side: number; length: number; angleOffset: number }[];
}

export interface CoralReefItem {
  type: 'staghorn' | 'brain' | 'fan' | 'anemone' | 'tube_sponge' | 'soft_polyp';
  x: number;
  y: number;
  scale: number;
  color: string;
  secondaryColor: string;
  points?: { x: number; y: number }[];
  tentacles?: { length: number; phase: number; speed: number; angle: number }[];
  branches?: { startX: number; startY: number; endX: number; endY: number; thickness: number; color: string }[];
}
