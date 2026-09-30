/**
 * Realistic Marine Life Anatomical Renderers
 * Provides realistic 3D-shaded, undulating fish, megafauna, and schooling organisms.
 */

import { FishEntity, SchoolFishEntity, SeabedCrab } from '../types/marine';

export class MarineRenderers {
  /**
   * Main dispatcher for fish species
   */
  public static renderFish(
    ctx: CanvasRenderingContext2D,
    fish: FishEntity,
    causticGlow: number = 0,
    bioluminescent: boolean = false
  ): void {
    ctx.save();
    ctx.translate(fish.x, fish.y);
    ctx.rotate(fish.rotation);
    ctx.scale(fish.scale, fish.scale);

    // Depth fog attenuation (layer: 0 = far background, 1 = midground, 2 = foreground)
    const layerAlpha = fish.layer === 0 ? 0.45 : fish.layer === 1 ? 0.8 : 1.0;
    ctx.globalAlpha = layerAlpha;

    switch (fish.species) {
      case 'clownfish':
        this.renderClownfish(ctx, fish, causticGlow, bioluminescent);
        break;
      case 'blue_tang':
        this.renderBlueTang(ctx, fish, causticGlow, bioluminescent);
        break;
      case 'goldfish':
        this.renderGoldfish(ctx, fish, causticGlow, bioluminescent);
        break;
      case 'angelfish':
        this.renderAngelfish(ctx, fish, causticGlow, bioluminescent);
        break;
      case 'tropical_chromis':
        this.renderTropicalChromis(ctx, fish, causticGlow, bioluminescent);
        break;
      case 'sea_turtle':
        this.renderSeaTurtle(ctx, fish);
        break;
      case 'jellyfish':
        this.renderJellyfish(ctx, fish, bioluminescent);
        break;
      case 'stingray':
        this.renderStingray(ctx, fish);
        break;
      case 'shark_silhouette':
        this.renderSharkSilhouette(ctx, fish);
        break;
      case 'whale_silhouette':
        this.renderWhaleSilhouette(ctx, fish);
        break;
      default:
        this.renderClownfish(ctx, fish, causticGlow, bioluminescent);
    }

    ctx.restore();
  }

  // ==========================================
  // 1. CLOWNFISH (Amphiprion ocellaris)
  // ==========================================
  private static renderClownfish(
    ctx: CanvasRenderingContext2D,
    fish: FishEntity,
    causticGlow: number,
    bioluminescent: boolean
  ): void {
    const cycle = fish.swimCycle;
    const tailAngle = Math.sin(cycle) * 0.35;
    const bodyWiggle = Math.sin(cycle - 0.7) * 4;
    const finFlutter = Math.sin(fish.finCycle) * 0.4;

    // Body length & radius
    const len = 44;
    const h = 20;

    // 1. Pectoral Fin (back layer)
    ctx.save();
    ctx.translate(-8, -4);
    ctx.rotate(finFlutter * 0.5 - 0.2);
    ctx.fillStyle = 'rgba(249, 115, 22, 0.85)';
    ctx.beginPath();
    ctx.ellipse(0, -6, 7, 12, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // 2. Caudal Tail Fin (flexible, waving)
    ctx.save();
    ctx.translate(-len * 0.82, bodyWiggle * 0.5);
    ctx.rotate(tailAngle);
    // Tail peduncle to fan
    ctx.fillStyle = bioluminescent ? '#fb923c' : '#ea580c';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-12, -14, -26, -18, -28, -14);
    ctx.bezierCurveTo(-24, 0, -28, 14, -28, 14);
    ctx.bezierCurveTo(-26, 18, -12, 14, 0, 0);
    ctx.closePath();
    ctx.fill();

    // Tail white band with black edge
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(-14, 0, 4, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Black outer margin of caudal fin
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(-26, 0, 14, -Math.PI * 0.45, Math.PI * 0.45);
    ctx.stroke();
    ctx.restore();

    // 3. Dorsal Fin (top)
    ctx.save();
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(6, -h * 0.7);
    ctx.quadraticCurveTo(-10, -h * 1.55, -28, -h * 0.45);
    ctx.quadraticCurveTo(-14, -h * 0.75, 6, -h * 0.7);
    ctx.fill();
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();

    // 4. Anal & Pelvic Fins (bottom)
    ctx.save();
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.moveTo(-4, h * 0.75);
    ctx.quadraticCurveTo(-14, h * 1.5, -26, h * 0.5);
    ctx.quadraticCurveTo(-16, h * 0.65, -4, h * 0.75);
    ctx.fill();
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // 5. Main Torso with 3D counter-shading gradient
    ctx.save();
    const bodyGrad = ctx.createLinearGradient(0, -h, 0, h);
    bodyGrad.addColorStop(0, '#ea580c'); // darker top
    bodyGrad.addColorStop(0.3, '#f97316'); // rich vibrant orange flank
    bodyGrad.addColorStop(0.7, '#fb923c'); // bright mid-belly
    bodyGrad.addColorStop(1, '#ffedd5'); // creamy soft belly

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    // Head snout
    ctx.moveTo(len * 0.65, 0);
    // Upper curve to spine
    ctx.bezierCurveTo(len * 0.45, -h * 0.85, -len * 0.2, -h * 0.95, -len * 0.75, bodyWiggle * 0.3 - 3);
    // Tail junction
    ctx.lineTo(-len * 0.75, bodyWiggle * 0.3 + 3);
    // Lower belly curve
    ctx.bezierCurveTo(-len * 0.2, h * 0.95, len * 0.4, h * 0.85, len * 0.65, 0);
    ctx.closePath();
    ctx.fill();

    // Subtle 3D upper flank highlight (sunlight reflection)
    const specGrad = ctx.createLinearGradient(0, -h * 0.8, 0, 0);
    specGrad.addColorStop(0, `rgba(255, 255, 255, ${0.35 + causticGlow * 0.2})`);
    specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = specGrad;
    ctx.beginPath();
    ctx.ellipse(len * 0.1, -h * 0.4, len * 0.45, h * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // 6. Iconic 3 White Bands with Black Borders
    // Band 1: Head bar
    this.drawCurvedStripe(ctx, len * 0.35, -h * 0.75, len * 0.32, h * 0.75, 6, 2.5);
    // Band 2: Middle bar (with slight forward saddle protrusion)
    this.drawCurvedStripe(ctx, -len * 0.08, -h * 0.88, -len * 0.08, h * 0.88, 7, 3);
    // Band 3: Peduncle bar
    this.drawCurvedStripe(ctx, -len * 0.58, -h * 0.5, -len * 0.58, h * 0.5, 4.5, 1.5);

    // 7. Eye (realistic glass dome with pupil and iris)
    ctx.save();
    ctx.translate(len * 0.42, -4);
    // Outer black rim
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath();
    ctx.arc(0, 0, 3.8, 0, Math.PI * 2);
    ctx.fill();
    // Orange iris
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
    ctx.fill();
    // Deep pupil
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0.4, 0, 2.0, 0, Math.PI * 2);
    ctx.fill();
    // Specular light glint
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0.9, -0.8, 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 8. Foreground Pectoral Fin (fluttering in front)
    ctx.save();
    ctx.translate(len * 0.1, 3);
    ctx.rotate(finFlutter + 0.3);
    ctx.fillStyle = 'rgba(251, 146, 60, 0.9)';
    ctx.beginPath();
    ctx.ellipse(4, 3, 9, 5, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.lineWidth = 1;
    ctx.stroke();
    // Tip black fringe
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(9, 6, 4, -0.6, 1.2);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  // ==========================================
  // 2. BLUE TANG (Paracanthurus hepatus)
  // ==========================================
  private static renderBlueTang(
    ctx: CanvasRenderingContext2D,
    fish: FishEntity,
    causticGlow: number,
    bioluminescent: boolean
  ): void {
    const cycle = fish.swimCycle;
    const tailAngle = Math.sin(cycle) * 0.32;
    const bodyWiggle = Math.sin(cycle - 0.6) * 3.5;
    const finFlutter = Math.sin(fish.finCycle * 1.2) * 0.45;

    const len = 48;
    const h = 24;

    // 1. Tail fin (Canary Yellow with black borders)
    ctx.save();
    ctx.translate(-len * 0.78, bodyWiggle * 0.4);
    ctx.rotate(tailAngle);

    // Yellow caudal blade
    ctx.fillStyle = bioluminescent ? '#fef08a' : '#facc15';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-24, -15);
    ctx.bezierCurveTo(-20, -5, -20, 5, -24, 15);
    ctx.closePath();
    ctx.fill();

    // Black margins on tail
    ctx.strokeStyle = '#090d16';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-24, -15);
    ctx.moveTo(0, 0);
    ctx.lineTo(-24, 15);
    ctx.stroke();

    // Blue scalpel blade wedge on peduncle
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(4, 0);
    ctx.lineTo(-6, -3);
    ctx.lineTo(-6, 3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 2. Dorsal Fin (Royal Blue with black rim)
    ctx.save();
    ctx.fillStyle = '#1d4ed8';
    ctx.beginPath();
    ctx.moveTo(10, -h * 0.85);
    ctx.quadraticCurveTo(-12, -h * 1.4, -len * 0.68, -h * 0.5);
    ctx.quadraticCurveTo(-14, -h * 0.7, 10, -h * 0.85);
    ctx.fill();
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();

    // 3. Anal Fin (Bottom)
    ctx.save();
    ctx.fillStyle = '#1e40af';
    ctx.beginPath();
    ctx.moveTo(4, h * 0.85);
    ctx.quadraticCurveTo(-10, h * 1.35, -len * 0.65, h * 0.45);
    ctx.quadraticCurveTo(-12, h * 0.7, 4, h * 0.85);
    ctx.fill();
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();

    // 4. Main Body with 3D Royal Blue Shading
    ctx.save();
    const bodyGrad = ctx.createLinearGradient(0, -h, 0, h);
    bodyGrad.addColorStop(0, '#1e3a8a'); // rich navy top
    bodyGrad.addColorStop(0.35, '#2563eb'); // electric royal blue flank
    bodyGrad.addColorStop(0.75, '#3b82f6'); // bright azure
    bodyGrad.addColorStop(1, '#1d4ed8'); // deep blue belly

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(len * 0.65, 0);
    ctx.bezierCurveTo(len * 0.45, -h * 0.95, -len * 0.25, -h * 1.0, -len * 0.72, bodyWiggle * 0.3 - 2);
    ctx.lineTo(-len * 0.72, bodyWiggle * 0.3 + 2);
    ctx.bezierCurveTo(-len * 0.25, h * 1.0, len * 0.45, h * 0.95, len * 0.65, 0);
    ctx.closePath();
    ctx.fill();

    // Specular scale shine along upper dorsal
    const specGrad = ctx.createLinearGradient(0, -h * 0.8, 0, 0);
    specGrad.addColorStop(0, `rgba(255, 255, 255, ${0.4 + causticGlow * 0.3})`);
    specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = specGrad;
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.45, len * 0.45, h * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();

    // 5. Signature Painter's Palette Black Contour Pattern
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    // Outer loop along back
    ctx.moveTo(len * 0.35, -h * 0.65);
    ctx.bezierCurveTo(-len * 0.1, -h * 0.9, -len * 0.6, -h * 0.6, -len * 0.7, 0);
    ctx.bezierCurveTo(-len * 0.65, h * 0.4, -len * 0.3, h * 0.5, -len * 0.05, h * 0.3);
    // Inner loop leaving the iconic blue circle
    ctx.bezierCurveTo(-len * 0.2, h * 0.15, -len * 0.35, -h * 0.1, -len * 0.25, -h * 0.35);
    ctx.bezierCurveTo(-len * 0.1, -h * 0.45, len * 0.1, -h * 0.45, len * 0.35, -h * 0.65);
    ctx.closePath();
    ctx.fill();

    // 6. Yellow wedge accent leading into tail
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(-len * 0.4, -1);
    ctx.lineTo(-len * 0.75, -h * 0.38);
    ctx.lineTo(-len * 0.75, h * 0.38);
    ctx.closePath();
    ctx.fill();

    // 7. Eye (large, intelligent, dark with bright cornea)
    ctx.save();
    ctx.translate(len * 0.44, -5);
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(0, 0, 4.0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(0.3, 0, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(1.0, -1.0, 1.0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 8. Translucent Pectoral Fin (Yellow with blue root)
    ctx.save();
    ctx.translate(len * 0.15, 2);
    ctx.rotate(finFlutter + 0.2);
    ctx.fillStyle = 'rgba(250, 204, 21, 0.85)';
    ctx.beginPath();
    ctx.ellipse(5, 2, 10, 5, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(2, 6, 23, 0.5)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  // ==========================================
  // 3. GOLDFISH (Ryukin / Veil-tail)
  // ==========================================
  private static renderGoldfish(
    ctx: CanvasRenderingContext2D,
    fish: FishEntity,
    causticGlow: number,
    bioluminescent: boolean
  ): void {
    const cycle = fish.swimCycle;
    const tailWave1 = Math.sin(cycle) * 0.45;
    const tailWave2 = Math.sin(cycle - 0.8) * 0.55;
    const bodyWiggle = Math.sin(cycle - 0.5) * 3;
    const finFlutter = Math.sin(fish.finCycle * 0.8) * 0.35;

    const len = 42;
    const h = 26; // plump, rounded Ryukin hump

    // 1. Magnificent Billowing Veil Tail (Quadruple Flowing Silky Fins)
    ctx.save();
    ctx.translate(-len * 0.65, bodyWiggle * 0.5);

    // Tail Fin 1 (Upper flow)
    ctx.save();
    ctx.rotate(tailWave1);
    const veilGrad1 = ctx.createLinearGradient(0, 0, -50, -25);
    veilGrad1.addColorStop(0, bioluminescent ? '#f59e0b' : '#ea580c');
    veilGrad1.addColorStop(0.5, 'rgba(251, 146, 60, 0.7)');
    veilGrad1.addColorStop(1, 'rgba(254, 243, 199, 0.2)');
    ctx.fillStyle = veilGrad1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-15, -25, -35, -35, -55, -28 + Math.sin(cycle) * 8);
    ctx.bezierCurveTo(-45, -15, -35, -5, -25, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Tail Fin 2 (Lower grand billowing veil)
    ctx.save();
    ctx.rotate(tailWave2);
    const veilGrad2 = ctx.createLinearGradient(0, 0, -55, 30);
    veilGrad2.addColorStop(0, '#f97316');
    veilGrad2.addColorStop(0.4, 'rgba(245, 158, 11, 0.75)');
    veilGrad2.addColorStop(1, 'rgba(255, 237, 213, 0.25)');
    ctx.fillStyle = veilGrad2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-18, 20, -38, 40, -62, 32 + Math.sin(cycle + 1) * 10);
    ctx.bezierCurveTo(-45, 18, -30, 8, -10, 0);
    ctx.closePath();
    ctx.fill();

    // Subtle fin ray texture
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 0.8;
    for (let r = -2; r <= 3; r++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-25, r * 8, -50, r * 10 + Math.sin(cycle + r) * 5);
      ctx.stroke();
    }
    ctx.restore();

    ctx.restore();

    // 2. High Arched Dorsal Fin
    ctx.save();
    ctx.fillStyle = 'rgba(249, 115, 22, 0.85)';
    ctx.beginPath();
    ctx.moveTo(4, -h * 0.95);
    ctx.bezierCurveTo(-8, -h * 1.6, -24, -h * 1.2, -len * 0.55, -h * 0.4);
    ctx.quadraticCurveTo(-12, -h * 0.7, 4, -h * 0.95);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // 3. Ventral Long Streamers
    ctx.save();
    ctx.fillStyle = 'rgba(251, 146, 60, 0.8)';
    ctx.beginPath();
    ctx.moveTo(-6, h * 0.9);
    ctx.quadraticCurveTo(-16, h * 1.7, -26, h * 1.5 + Math.sin(cycle) * 4);
    ctx.quadraticCurveTo(-12, h * 1.1, -6, h * 0.9);
    ctx.fill();
    ctx.restore();

    // 4. Plump Rounded Body with Specular Metallic Gold Gradient
    ctx.save();
    const goldGrad = ctx.createRadialGradient(len * 0.2, -4, 2, 0, 0, len * 0.65);
    goldGrad.addColorStop(0, '#fef08a'); // molten gold specular center
    goldGrad.addColorStop(0.3, '#f59e0b'); // radiant amber
    goldGrad.addColorStop(0.7, '#ea580c'); // rich deep orange-red
    goldGrad.addColorStop(1, '#9a3412'); // shadow edge

    ctx.fillStyle = goldGrad;
    ctx.beginPath();
    ctx.moveTo(len * 0.55, 0);
    // Distinctive arched Ryukin dorsal hump
    ctx.bezierCurveTo(len * 0.35, -h * 1.1, -len * 0.2, -h * 1.15, -len * 0.6, bodyWiggle * 0.3 - 2);
    ctx.lineTo(-len * 0.6, bodyWiggle * 0.3 + 2);
    // Plump swollen belly
    ctx.bezierCurveTo(-len * 0.15, h * 1.15, len * 0.35, h * 1.05, len * 0.55, 0);
    ctx.closePath();
    ctx.fill();

    // Subtle scale texture shine
    const scaleShine = ctx.createLinearGradient(0, -h * 0.8, 0, 0);
    scaleShine.addColorStop(0, `rgba(255, 255, 255, ${0.45 + causticGlow * 0.3})`);
    scaleShine.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = scaleShine;
    ctx.beginPath();
    ctx.ellipse(len * 0.1, -h * 0.45, len * 0.4, h * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    // 5. Eye (protruding dome)
    ctx.save();
    ctx.translate(len * 0.36, -6);
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(0, 0, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0.4, 0, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(1.2, -1.0, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 6. Fluttering Pectoral Fan Fin
    ctx.save();
    ctx.translate(len * 0.12, 4);
    ctx.rotate(finFlutter + 0.3);
    ctx.fillStyle = 'rgba(254, 215, 170, 0.85)';
    ctx.beginPath();
    ctx.ellipse(6, 4, 12, 6, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(234, 88, 12, 0.4)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  // ==========================================
  // 4. ANGELFISH (Pterophyllum scalare)
  // ==========================================
  private static renderAngelfish(
    ctx: CanvasRenderingContext2D,
    fish: FishEntity,
    causticGlow: number,
    bioluminescent: boolean
  ): void {
    const cycle = fish.swimCycle;
    const bodyWiggle = Math.sin(cycle) * 2;
    const finWiggle = Math.sin(cycle * 0.8) * 0.15;

    const len = 46;
    const h = 32;

    // 1. Long Elegant Dorsal Sail
    ctx.save();
    const dorsalGrad = ctx.createLinearGradient(0, 0, -20, -h * 2.2);
    dorsalGrad.addColorStop(0, '#475569');
    dorsalGrad.addColorStop(0.5, '#94a3b8');
    dorsalGrad.addColorStop(1, bioluminescent ? '#38bdf8' : '#e2e8f0');
    ctx.fillStyle = dorsalGrad;
    ctx.beginPath();
    ctx.moveTo(8, -h * 0.6);
    ctx.quadraticCurveTo(-10, -h * 1.5, -16 + finWiggle * 10, -h * 2.3);
    ctx.quadraticCurveTo(-14, -h * 1.4, -len * 0.65, -h * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // 2. Long Trailing Anal Fin & Ventral Streamers
    ctx.save();
    const analGrad = ctx.createLinearGradient(0, 0, -18, h * 2.2);
    analGrad.addColorStop(0, '#475569');
    analGrad.addColorStop(0.6, '#94a3b8');
    analGrad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = analGrad;
    ctx.beginPath();
    ctx.moveTo(4, h * 0.6);
    ctx.quadraticCurveTo(-8, h * 1.4, -14 - finWiggle * 8, h * 2.3);
    ctx.quadraticCurveTo(-12, h * 1.3, -len * 0.65, h * 0.35);
    ctx.closePath();
    ctx.fill();

    // Ventral thread-like feelers
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(len * 0.2, h * 0.4);
    ctx.quadraticCurveTo(len * 0.05, h * 1.6, -10 + Math.sin(cycle) * 6, h * 2.6);
    ctx.stroke();
    ctx.restore();

    // 3. Caudal Tail Fin (Fan with extended top/bottom tips)
    ctx.save();
    ctx.translate(-len * 0.72, bodyWiggle * 0.5);
    ctx.fillStyle = 'rgba(226, 232, 240, 0.8)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-24, -16);
    ctx.bezierCurveTo(-18, -4, -18, 4, -24, 16);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // 4. Diamond Compressed Body with Pearlescent Silver Gradient
    ctx.save();
    const bodyGrad = ctx.createLinearGradient(0, -h, 0, h);
    bodyGrad.addColorStop(0, '#334155');
    bodyGrad.addColorStop(0.3, '#cbd5e1'); // pearlescent silver
    bodyGrad.addColorStop(0.7, '#f1f5f9');
    bodyGrad.addColorStop(1, '#64748b');

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(len * 0.65, 0); // pointed snout
    ctx.lineTo(8, -h * 0.75); // high forehead peak
    ctx.lineTo(-len * 0.7, bodyWiggle * 0.3); // tail peduncle
    ctx.lineTo(4, h * 0.75); // bottom keel peak
    ctx.closePath();
    ctx.fill();

    // Specular silver shimmer
    const specGrad = ctx.createLinearGradient(0, -h * 0.7, 0, 0);
    specGrad.addColorStop(0, `rgba(255, 255, 255, ${0.5 + causticGlow * 0.3})`);
    specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = specGrad;
    ctx.beginPath();
    ctx.ellipse(len * 0.1, -h * 0.35, len * 0.35, h * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // 5. Vertical Dark Zebra Stripes
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    // Eye bar
    this.drawCurvedStripe(ctx, len * 0.4, -h * 0.5, len * 0.35, h * 0.5, 4.5, 1);
    // Mid body broad bar
    this.drawCurvedStripe(ctx, len * 0.05, -h * 0.72, len * 0.0, h * 0.72, 6.5, 2);
    // Rear bar
    this.drawCurvedStripe(ctx, -len * 0.4, -h * 0.5, -len * 0.42, h * 0.45, 4.5, 1.5);

    // 6. Eye (ruby / golden iris)
    ctx.save();
    ctx.translate(len * 0.42, -5);
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, 4.0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, 0, 3.0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.arc(0.4, 0, 2.0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(1.0, -0.8, 1.0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  // ==========================================
  // 5. TROPICAL CHROMIS (Chromis viridis)
  // ==========================================
  private static renderTropicalChromis(
    ctx: CanvasRenderingContext2D,
    fish: FishEntity,
    causticGlow: number,
    bioluminescent: boolean
  ): void {
    const cycle = fish.swimCycle;
    const tailAngle = Math.sin(cycle * 1.4) * 0.4;
    const bodyWiggle = Math.sin(cycle * 1.4 - 0.7) * 2.5;

    const len = 28;
    const h = 13;

    // Tail fin (deeply forked swallowtail)
    ctx.save();
    ctx.translate(-len * 0.75, bodyWiggle * 0.4);
    ctx.rotate(tailAngle);
    ctx.fillStyle = bioluminescent ? '#5eead4' : '#2dd4bf';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-14, -10);
    ctx.lineTo(-8, 0);
    ctx.lineTo(-14, 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Body with bright iridescent teal-cyan gradient
    ctx.save();
    const bodyGrad = ctx.createLinearGradient(0, -h, 0, h);
    bodyGrad.addColorStop(0, '#0f766e');
    bodyGrad.addColorStop(0.3, '#14b8a6');
    bodyGrad.addColorStop(0.7, '#2dd4bf');
    bodyGrad.addColorStop(1, '#99f6e4');

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(len * 0.6, 0);
    ctx.bezierCurveTo(len * 0.35, -h * 0.9, -len * 0.2, -h * 0.9, -len * 0.7, bodyWiggle * 0.3);
    ctx.bezierCurveTo(-len * 0.2, h * 0.9, len * 0.35, h * 0.9, len * 0.6, 0);
    ctx.closePath();
    ctx.fill();

    // Eye
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(len * 0.36, -3, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5eead4';
    ctx.beginPath();
    ctx.arc(len * 0.36, -3, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(len * 0.38, -3, 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ==========================================
  // 6. SCHOOL OF FISH (Cohesive Flock)
  // ==========================================
  public static renderSchoolFish(ctx: CanvasRenderingContext2D, fish: SchoolFishEntity): void {
    ctx.save();
    ctx.translate(fish.x, fish.y);
    const angle = Math.atan2(fish.vy, fish.vx);
    ctx.rotate(angle);
    ctx.scale(fish.scale, fish.scale);

    const tailWiggle = Math.sin(fish.swimCycle + fish.tailPhase) * 2;
    const len = 14;
    const h = 4.5;

    // Tail fin
    ctx.fillStyle = 'rgba(186, 230, 253, 0.7)';
    ctx.beginPath();
    ctx.moveTo(-len * 0.6, tailWiggle * 0.5);
    ctx.lineTo(-len * 0.95, tailWiggle - 3.5);
    ctx.lineTo(-len * 0.78, tailWiggle);
    ctx.lineTo(-len * 0.95, tailWiggle + 3.5);
    ctx.closePath();
    ctx.fill();

    // Torso (silvery blue baitfish)
    const bodyGrad = ctx.createLinearGradient(0, -h, 0, h);
    bodyGrad.addColorStop(0, '#0284c7');
    bodyGrad.addColorStop(0.5, '#7dd3fc');
    bodyGrad.addColorStop(1, '#ffffff');

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(len * 0.5, 0);
    ctx.quadraticCurveTo(0, -h, -len * 0.6, tailWiggle * 0.3);
    ctx.quadraticCurveTo(0, h, len * 0.5, 0);
    ctx.fill();

    // Tiny glint
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(len * 0.25, -1, 1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ==========================================
  // 7. SEA TURTLE (Chelonia mydas)
  // ==========================================
  private static renderSeaTurtle(ctx: CanvasRenderingContext2D, fish: FishEntity): void {
    const cycle = fish.swimCycle;
    // Flipper beat: slow majestic stroke
    const flipperStroke = Math.sin(cycle * 0.6);

    const s = 1.1;
    ctx.scale(s, s);

    // Rear rudder flippers
    ctx.save();
    ctx.fillStyle = '#1e3a24';
    ctx.beginPath();
    ctx.ellipse(-38, -12, 10, 4, -0.4, 0, Math.PI * 2);
    ctx.ellipse(-38, 12, 10, 4, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Front Wing-like flippers (top & bottom flapping)
    ctx.save();
    ctx.fillStyle = '#2d5a37';
    // Left / upper flipper
    ctx.save();
    ctx.translate(8, -14);
    ctx.rotate(-0.8 + flipperStroke * 0.45);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(12, -20, 24, -38, 14, -46);
    ctx.bezierCurveTo(4, -42, -6, -24, 0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Right / lower flipper
    ctx.save();
    ctx.translate(8, 14);
    ctx.rotate(0.8 - flipperStroke * 0.45);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(12, 20, 24, 38, 14, 46);
    ctx.bezierCurveTo(4, 42, -6, 24, 0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.restore();

    // Head and neck
    ctx.save();
    ctx.fillStyle = '#3a6645';
    ctx.beginPath();
    ctx.ellipse(32, 0, 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    // Turtle eye
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(36, -3, 2, 0, Math.PI * 2);
    ctx.arc(36, 3, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Carapace Shell (streamlined domed scutes)
    ctx.save();
    const shellGrad = ctx.createRadialGradient(-5, 0, 5, -5, 0, 36);
    shellGrad.addColorStop(0, '#578e63');
    shellGrad.addColorStop(0.5, '#3b6744');
    shellGrad.addColorStop(0.85, '#22442a');
    shellGrad.addColorStop(1, '#152b1b');

    ctx.fillStyle = shellGrad;
    ctx.beginPath();
    ctx.ellipse(-4, 0, 34, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Scute pattern plates on shell
    ctx.strokeStyle = '#152b1b';
    ctx.lineWidth = 1.6;
    for (let i = -2; i <= 2; i++) {
      ctx.strokeRect(-16 + i * 9, -6, 7, 12);
    }
    ctx.restore();
  }

  // ==========================================
  // 8. JELLYFISH (Aurelia aurita - Moon Jelly)
  // ==========================================
  private static renderJellyfish(
    ctx: CanvasRenderingContext2D,
    fish: FishEntity,
    bioluminescent: boolean
  ): void {
    const cycle = fish.swimCycle;
    // Rhythmic coronal contraction (bell contract fast, expand slow)
    const bellPulse = Math.sin(cycle * 1.2);
    const contract = bellPulse > 0 ? Math.pow(bellPulse, 1.8) * 0.25 : bellPulse * 0.1;

    const r = 24 * (1 - contract * 0.4);
    const h = 28 * (1 + contract * 0.5);

    // Trailing Oral Arms and Fine Tentacles
    ctx.save();
    const tentacleCount = 7;
    for (let i = 0; i < tentacleCount; i++) {
      const offsetX = (i - (tentacleCount - 1) / 2) * 5;
      const phase = cycle + i * 0.6;
      ctx.strokeStyle = bioluminescent ? 'rgba(192, 132, 252, 0.4)' : 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = i % 2 === 0 ? 1.5 : 0.8;
      ctx.beginPath();
      ctx.moveTo(offsetX, 0);
      ctx.bezierCurveTo(
        offsetX + Math.sin(phase) * 12,
        25,
        offsetX - Math.sin(phase + 1) * 16,
        50,
        offsetX + Math.sin(phase + 2) * 20,
        75 + i * 4
      );
      ctx.stroke();
    }
    ctx.restore();

    // Translucent Bell Dome
    ctx.save();
    const domeGrad = ctx.createRadialGradient(0, -h * 0.4, 4, 0, 0, r * 1.2);
    if (bioluminescent) {
      domeGrad.addColorStop(0, 'rgba(232, 121, 249, 0.65)');
      domeGrad.addColorStop(0.7, 'rgba(168, 85, 247, 0.35)');
      domeGrad.addColorStop(1, 'rgba(192, 132, 252, 0.1)');
    } else {
      domeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
      domeGrad.addColorStop(0.6, 'rgba(186, 230, 253, 0.3)');
      domeGrad.addColorStop(1, 'rgba(125, 211, 252, 0.08)');
    }

    ctx.fillStyle = domeGrad;
    ctx.beginPath();
    ctx.moveTo(-r, 0);
    ctx.bezierCurveTo(-r, -h, r, -h, r, 0);
    ctx.bezierCurveTo(r * 0.7, 4, -r * 0.7, 4, -r, 0);
    ctx.closePath();
    ctx.fill();

    // Horseshoe Gonad rings inside bell
    ctx.strokeStyle = bioluminescent ? 'rgba(240, 171, 252, 0.7)' : 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1.6;
    for (let a = 0; a < 4; a++) {
      const angle = (a * Math.PI) / 2 + Math.PI / 4;
      const gx = Math.cos(angle) * (r * 0.38);
      const gy = -h * 0.45 + Math.sin(angle) * (r * 0.28);
      ctx.beginPath();
      ctx.arc(gx, gy, 4.5, 0, Math.PI * 1.8);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ==========================================
  // 9. STINGRAY (Aetobatus narinari)
  // ==========================================
  private static renderStingray(ctx: CanvasRenderingContext2D, fish: FishEntity): void {
    const cycle = fish.swimCycle;
    const wingWave1 = Math.sin(cycle * 1.1) * 6;
    const wingWave2 = Math.sin(cycle * 1.1 + Math.PI) * 6;

    const w = 45;
    const len = 34;

    // Whip Tail
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-len * 0.7, 0);
    ctx.bezierCurveTo(-len * 1.5, Math.sin(cycle) * 4, -len * 2.4, Math.cos(cycle) * 8, -len * 3.2, 0);
    ctx.stroke();

    // Broad kite body with undulating pectoral wings
    ctx.save();
    const bodyGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, w);
    bodyGrad.addColorStop(0, '#334155');
    bodyGrad.addColorStop(0.7, '#1e293b');
    bodyGrad.addColorStop(1, '#0f172a');

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(len * 0.7, 0); // pointed snout
    ctx.quadraticCurveTo(0, -w * 0.8 + wingWave1, -len * 0.5, -4);
    ctx.lineTo(-len * 0.7, 0);
    ctx.lineTo(-len * 0.5, 4);
    ctx.quadraticCurveTo(0, w * 0.8 + wingWave2, len * 0.7, 0);
    ctx.closePath();
    ctx.fill();

    // White dorsal rosettes / spots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    const spots = [
      { x: -5, y: -10 },
      { x: -12, y: -16 },
      { x: -18, y: -8 },
      { x: -5, y: 10 },
      { x: -12, y: 16 },
      { x: -18, y: 8 },
      { x: 5, y: -6 },
      { x: 5, y: 6 },
    ];
    for (const sp of spots) {
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ==========================================
  // 10. SHARK SILHOUETTE (Distant Predator)
  // ==========================================
  private static renderSharkSilhouette(ctx: CanvasRenderingContext2D, fish: FishEntity): void {
    const cycle = fish.swimCycle;
    const tailWiggle = Math.sin(cycle * 0.8) * 5;

    const len = 90;
    const h = 20;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
    ctx.beginPath();
    // Snout
    ctx.moveTo(len * 0.55, 0);
    // Dorsal line with tall dorsal fin
    ctx.quadraticCurveTo(len * 0.25, -h * 0.6, 5, -h * 0.6);
    ctx.lineTo(-2, -h * 1.55); // tall sharp dorsal fin
    ctx.quadraticCurveTo(-14, -h * 0.8, -18, -h * 0.5);
    ctx.lineTo(-len * 0.55, tailWiggle * 0.3 - 2);
    // Heterocercal tail
    ctx.lineTo(-len * 0.78, tailWiggle - 18); // long upper lobe
    ctx.lineTo(-len * 0.66, tailWiggle);
    ctx.lineTo(-len * 0.74, tailWiggle + 10); // shorter lower lobe
    ctx.lineTo(-len * 0.55, tailWiggle * 0.3 + 2);
    // Ventral line with pectoral and pelvic fins
    ctx.quadraticCurveTo(-len * 0.2, h * 0.6, 5, h * 0.5);
    ctx.lineTo(len * 0.05, h * 1.3); // pectoral fin
    ctx.lineTo(len * 0.15, h * 0.4);
    ctx.quadraticCurveTo(len * 0.38, h * 0.4, len * 0.55, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ==========================================
  // 11. WHALE SILHOUETTE (Distant Humpback)
  // ==========================================
  private static renderWhaleSilhouette(ctx: CanvasRenderingContext2D, fish: FishEntity): void {
    const cycle = fish.swimCycle;
    const flukeStroke = Math.sin(cycle * 0.35) * 8;

    const len = 160;
    const h = 34;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
    ctx.beginPath();
    // Huge curved rostrum
    ctx.moveTo(len * 0.55, 0);
    ctx.bezierCurveTo(len * 0.4, -h * 0.8, 0, -h * 0.85, -len * 0.5, flukeStroke * 0.3 - 3);
    // Wide horizontal fluke
    ctx.lineTo(-len * 0.72, flukeStroke - 16);
    ctx.bezierCurveTo(-len * 0.65, flukeStroke, -len * 0.65, flukeStroke, -len * 0.72, flukeStroke + 16);
    ctx.lineTo(-len * 0.5, flukeStroke * 0.3 + 3);
    // Pleated throat grooves and massive belly
    ctx.bezierCurveTo(-len * 0.2, h * 1.1, len * 0.3, h * 1.1, len * 0.55, 0);
    ctx.closePath();
    ctx.fill();

    // Long pectoral flipper trailing below
    ctx.beginPath();
    ctx.moveTo(len * 0.15, h * 0.7);
    ctx.quadraticCurveTo(len * 0.05, h * 1.6, -len * 0.15, h * 1.9);
    ctx.quadraticCurveTo(len * 0.05, h * 1.3, len * 0.22, h * 0.7);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Helper: draw a smooth curving band with black outlines
   */
  private static drawCurvedStripe(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    width: number,
    curveOffset: number
  ): void {
    ctx.save();
    // White inner band
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(x1 - width * 0.5, y1);
    ctx.quadraticCurveTo((x1 + x2) * 0.5 + curveOffset, (y1 + y2) * 0.5, x2 - width * 0.5, y2);
    ctx.lineTo(x2 + width * 0.5, y2);
    ctx.quadraticCurveTo((x1 + x2) * 0.5 + curveOffset, (y1 + y2) * 0.5, x1 + width * 0.5, y1);
    ctx.closePath();
    ctx.fill();

    // Fine black border lines
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(x1 - width * 0.5, y1);
    ctx.quadraticCurveTo((x1 + x2) * 0.5 + curveOffset, (y1 + y2) * 0.5, x2 - width * 0.5, y2);
    ctx.moveTo(x1 + width * 0.5, y1);
    ctx.quadraticCurveTo((x1 + x2) * 0.5 + curveOffset, (y1 + y2) * 0.5, x2 + width * 0.5, y2);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Seabed Reef Crab (Benthic Crustacean)
   */
  public static renderSeabedCrab(ctx: CanvasRenderingContext2D, crab: SeabedCrab): void {
    ctx.save();
    ctx.translate(crab.x, crab.y);
    ctx.scale(crab.scale * crab.direction, crab.scale);

    const legWave = Math.sin(crab.legCycle * 6);

    // 1. Walking legs (4 per side)
    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const xOffset = -10 + i * 6;
      const legPhase = crab.legCycle * 6 + i * 0.8;
      const stepY = Math.sin(legPhase) * 3;

      // Left legs
      ctx.beginPath();
      ctx.moveTo(xOffset, 2);
      ctx.lineTo(xOffset - 10, -4 + stepY);
      ctx.lineTo(xOffset - 16, 8);
      ctx.stroke();

      // Right legs
      ctx.beginPath();
      ctx.moveTo(xOffset, 2);
      ctx.lineTo(xOffset + 10, -4 - stepY);
      ctx.lineTo(xOffset + 16, 8);
      ctx.stroke();
    }

    // 2. Large Front Chelae (Claws)
    ctx.save();
    ctx.fillStyle = '#ea580c';
    // Left claw
    ctx.save();
    ctx.translate(-14, -6);
    ctx.rotate(-0.4 + legWave * 0.15);
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 5, 0.4, 0, Math.PI * 2);
    ctx.fill();
    // Pincer
    ctx.strokeStyle = '#9a3412';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(6, -2, 4, 0, Math.PI * 0.7);
    ctx.arc(6, 2, 4, -Math.PI * 0.7, 0);
    ctx.stroke();
    ctx.restore();

    // Right claw
    ctx.save();
    ctx.translate(14, -6);
    ctx.rotate(0.4 - legWave * 0.15);
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 5, -0.4, 0, Math.PI * 2);
    ctx.fill();
    // Pincer
    ctx.strokeStyle = '#9a3412';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(-6, -2, 4, Math.PI * 0.3, Math.PI);
    ctx.arc(-6, 2, 4, Math.PI, Math.PI * 1.7);
    ctx.stroke();
    ctx.restore();
    ctx.restore();

    // 3. Carapace (Hard rounded shell)
    ctx.save();
    const carapaceGrad = ctx.createRadialGradient(0, -2, 2, 0, 0, 14);
    carapaceGrad.addColorStop(0, '#f97316');
    carapaceGrad.addColorStop(0.7, '#c2410c');
    carapaceGrad.addColorStop(1, '#7c2d12');

    ctx.fillStyle = carapaceGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 15, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shell speckles
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(-4, -2, 1, 0, Math.PI * 2);
    ctx.arc(4, -2, 1, 0, Math.PI * 2);
    ctx.arc(0, 2, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 4. Stalk Eyes
    ctx.save();
    ctx.fillStyle = '#7c2d12';
    ctx.fillRect(-5, -12, 2.5, 4);
    ctx.fillRect(2.5, -12, 2.5, 4);

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-4, -13, 2.2, 0, Math.PI * 2);
    ctx.arc(4, -13, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-3.5, -13.5, 0.8, 0, Math.PI * 2);
    ctx.arc(4.5, -13.5, 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }
}
