'use client';

import React, { useEffect, useRef } from 'react';

interface GameCanvasProps {
  distancePercent: number; // 0 (caught) to 100 (safe)
  isDashing: boolean;
  isStumbling: boolean;
  isHyperBoost: boolean;
  streak: number;
}

// Pre-generated static starfield
const STATIC_STARS = Array.from({ length: 85 }, (_, i) => ({
  x: (i * 137.5) % 960,
  y: (i * 47.3) % 190,
  size: (i % 3) * 0.8 + 0.8,
  speed: ((i % 5) + 1) * 0.05,
  twinkleSpeed: ((i % 7) + 2) * 0.04,
  brightness: 0.4 + ((i % 6) / 6) * 0.6,
}));

// Pre-generated city buildings for realistic parallax
const CITY_BUILDINGS = Array.from({ length: 24 }, (_, i) => ({
  width: 36 + ((i * 17) % 32),
  height: 45 + ((i * 23) % 65),
  hasAntenna: i % 3 === 0,
  neonColor:
    i % 4 === 0
      ? 'rgba(56, 189, 248, 0.85)' // cyan
      : i % 4 === 1
        ? 'rgba(244, 63, 94, 0.85)' // rose
        : i % 4 === 2
          ? 'rgba(250, 204, 21, 0.85)' // yellow
          : 'rgba(168, 85, 247, 0.85)', // purple
  neonSign:
    i % 5 === 0
      ? '新幹線'
      : i % 5 === 1
        ? '夜走'
        : i % 5 === 2
          ? '鬼'
          : i % 5 === 3
            ? '電光'
            : '東京',
  windows: Array.from({ length: 12 }, (_, w) => ({
    lit: (w + i * 3) % 3 !== 0,
    color:
      (w + i) % 2 === 0
        ? 'rgba(254, 240, 138, 0.7)'
        : 'rgba(56, 189, 248, 0.6)',
  })),
}));

export function GameCanvas({
  distancePercent,
  isDashing,
  isStumbling,
  isHyperBoost,
  streak,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Animation states tracked in refs to prevent React re-renders
  const stateRef = useRef({
    tick: 0,
    trainOffset: 0,
    cityOffset: 0,
    mountainOffset: 0,
    gantryOffset: 0,
    shakeIntensity: 0,
    // Dynamic particles (sparks, petals, embers, smoke)
    particles: [] as Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      life: number;
      type: 'spark' | 'petal' | 'smoke' | 'ember';
      rot?: number;
      vRot?: number;
    }>,
    // Shooting stars
    shootingStars: [] as Array<{
      x: number;
      y: number;
      len: number;
      vx: number;
      vy: number;
      alpha: number;
    }>,
  });

  // Trigger shake on stumble
  useEffect(() => {
    if (isStumbling) {
      stateRef.current.shakeIntensity = 16;
    }
  }, [isStumbling]);

  // Spawn dash / hyperboost burst particles
  useEffect(() => {
    if (isDashing || isHyperBoost) {
      const state = stateRef.current;
      const count = isHyperBoost ? 24 : 14;
      for (let i = 0; i < count; i++) {
        state.particles.push({
          x: 520 + (Math.random() - 0.5) * 20,
          y: 280 + Math.random() * 15,
          vx: -(Math.random() * 14 + 10),
          vy: (Math.random() - 0.6) * 5,
          size: Math.random() * 4 + 2,
          color: isHyperBoost
            ? Math.random() > 0.5
              ? '#f59e0b'
              : '#fef08a'
            : Math.random() > 0.5
              ? '#38bdf8'
              : '#0284c7',
          life: 1,
          type: 'spark',
        });
      }
    }
  }, [isDashing, isHyperBoost]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;

    const render = () => {
      if (!isMounted) return;

      const state = stateRef.current;
      state.tick++;

      const width = canvas.width;
      const height = canvas.height;

      // Base speed calculation
      const baseSpeed = isHyperBoost ? 20 : isDashing ? 15 : 10;
      state.trainOffset = (state.trainOffset + baseSpeed) % 120;
      state.cityOffset = (state.cityOffset + baseSpeed * 0.45) % width;
      state.mountainOffset = (state.mountainOffset + baseSpeed * 0.08) % width;
      state.gantryOffset = (state.gantryOffset + baseSpeed * 1.6) % 1400;

      // Ambient Sakura Petals & Embers generation
      if (state.tick % 4 === 0 && state.particles.length < 90) {
        state.particles.push({
          x: width + 20,
          y: Math.random() * (height * 0.75),
          vx: -(Math.random() * 8 + baseSpeed * 0.7),
          vy: (Math.random() - 0.4) * 2.5,
          size: Math.random() * 4 + 3,
          color:
            Math.random() > 0.3
              ? 'rgba(244, 114, 182, 0.85)' // Sakura pink
              : 'rgba(251, 146, 60, 0.85)', // Amber ember
          life: 1,
          type: Math.random() > 0.5 ? 'petal' : 'ember',
          rot: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.15,
        });
      }

      // Random shooting star
      if (Math.random() < 0.015 && state.shootingStars.length < 3) {
        state.shootingStars.push({
          x: Math.random() * width * 0.8 + 100,
          y: Math.random() * 70 + 10,
          len: Math.random() * 70 + 50,
          vx: -(Math.random() * 16 + 18),
          vy: Math.random() * 5 + 4,
          alpha: 1,
        });
      }

      // Screen shake decay
      let shakeX = 0;
      let shakeY = 0;
      if (state.shakeIntensity > 0) {
        shakeX = (Math.random() - 0.5) * state.shakeIntensity;
        shakeY = (Math.random() - 0.5) * state.shakeIntensity;
        state.shakeIntensity *= 0.86;
        if (state.shakeIntensity < 0.4) state.shakeIntensity = 0;
      }

      ctx.save();
      ctx.translate(shakeX, shakeY);

      // ==========================================
      // 1. NIGHT SKY GRADIENT & NEBULA
      // ==========================================
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#050711');
      skyGrad.addColorStop(0.35, '#0d1326');
      skyGrad.addColorStop(0.7, '#1b1b3a');
      skyGrad.addColorStop(1, '#2d1b4e');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Distant cosmic aurora/nebula glow
      const nebulaGrad = ctx.createRadialGradient(
        width * 0.35,
        90,
        20,
        width * 0.35,
        90,
        260,
      );
      nebulaGrad.addColorStop(0, 'rgba(147, 51, 234, 0.22)');
      nebulaGrad.addColorStop(0.5, 'rgba(59, 130, 246, 0.12)');
      nebulaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebulaGrad;
      ctx.fillRect(0, 0, width, height);

      // ==========================================
      // 2. TWINKLING STARS & SHOOTING STARS
      // ==========================================
      for (const star of STATIC_STARS) {
        const starX =
          (((star.x - state.tick * star.speed) % width) + width) % width;
        const twinkle =
          star.brightness *
          (0.65 + Math.sin(state.tick * star.twinkleSpeed + star.x) * 0.35);
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
        ctx.beginPath();
        ctx.arc(starX, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Shooting stars
      for (let i = state.shootingStars.length - 1; i >= 0; i--) {
        const ss = state.shootingStars[i];
        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.alpha -= 0.035;

        if (ss.alpha <= 0 || ss.x < -100) {
          state.shootingStars.splice(i, 1);
          continue;
        }

        const ssGrad = ctx.createLinearGradient(
          ss.x,
          ss.y,
          ss.x - ss.vx * (ss.len / 20),
          ss.y - ss.vy * (ss.len / 20),
        );
        ssGrad.addColorStop(0, `rgba(255, 255, 255, ${ss.alpha})`);
        ssGrad.addColorStop(0.3, `rgba(147, 197, 253, ${ss.alpha * 0.8})`);
        ssGrad.addColorStop(1, 'rgba(147, 197, 253, 0)');

        ctx.strokeStyle = ssGrad;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x - ss.vx * (ss.len / 20), ss.y - ss.vy * (ss.len / 20));
        ctx.stroke();
      }

      // ==========================================
      // 3. GLORIOUS HARVEST MOON & CLOUD DRIFTS
      // ==========================================
      const moonX = width * 0.82;
      const moonY = 82;
      const moonRadius = 48;

      // Outer moon corona aura
      const moonAura = ctx.createRadialGradient(
        moonX,
        moonY,
        moonRadius * 0.6,
        moonX,
        moonY,
        moonRadius * 2.8,
      );
      moonAura.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
      moonAura.addColorStop(0.4, 'rgba(253, 224, 71, 0.18)');
      moonAura.addColorStop(0.7, 'rgba(234, 179, 8, 0.07)');
      moonAura.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = moonAura;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius * 2.8, 0, Math.PI * 2);
      ctx.fill();

      // Moon body
      const moonBodyGrad = ctx.createRadialGradient(
        moonX - 12,
        moonY - 12,
        8,
        moonX,
        moonY,
        moonRadius,
      );
      moonBodyGrad.addColorStop(0, '#ffffff');
      moonBodyGrad.addColorStop(0.6, '#fef08a');
      moonBodyGrad.addColorStop(1, '#fde047');
      ctx.fillStyle = moonBodyGrad;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
      ctx.fill();

      // Moon Maria (Crater details)
      ctx.fillStyle = 'rgba(202, 138, 4, 0.22)';
      ctx.beginPath();
      ctx.arc(moonX - 14, moonY - 12, 12, 0, Math.PI * 2);
      ctx.arc(moonX + 16, moonY + 14, 16, 0, Math.PI * 2);
      ctx.arc(moonX - 18, moonY + 20, 9, 0, Math.PI * 2);
      ctx.arc(moonX + 8, moonY - 22, 7, 0, Math.PI * 2);
      ctx.fill();

      // Japanese Stylized Night Clouds drifting over Moon
      const cloudOffset1 = (state.tick * 0.35) % (width + 300);
      ctx.fillStyle = 'rgba(30, 27, 75, 0.45)';
      ctx.beginPath();
      ctx.roundRect(width - cloudOffset1 + 100, 72, 140, 16, 8);
      ctx.roundRect(width - cloudOffset1 + 150, 60, 90, 14, 7);
      ctx.roundRect(width - cloudOffset1 + 50, 94, 160, 14, 7);
      ctx.fill();

      // ==========================================
      // 4. MAJESTIC MT. FUJI (FAR PARALLAX)
      // ==========================================
      const fujiX =
        (((width * 0.42 - state.mountainOffset) % width) + width) % width;
      const fujiBaseY = height * 0.72;

      // Distant mountain ranges
      ctx.fillStyle = '#10172a';
      ctx.beginPath();
      ctx.moveTo(0, fujiBaseY);
      for (let x = 0; x <= width; x += 80) {
        const my =
          fujiBaseY - 25 - Math.sin((x + state.mountainOffset) * 0.015) * 20;
        ctx.lineTo(x, my);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Mt. Fuji Body
      const fujiGrad = ctx.createLinearGradient(0, height * 0.32, 0, fujiBaseY);
      fujiGrad.addColorStop(0, '#1e1b4b');
      fujiGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = fujiGrad;
      ctx.beginPath();
      ctx.moveTo(fujiX - 160, fujiBaseY);
      ctx.lineTo(fujiX - 36, height * 0.34);
      ctx.lineTo(fujiX + 36, height * 0.34);
      ctx.lineTo(fujiX + 160, fujiBaseY);
      ctx.closePath();
      ctx.fill();

      // Mt. Fuji Snow Cap with moonlit highlight
      const snowGrad = ctx.createLinearGradient(
        0,
        height * 0.34,
        0,
        height * 0.48,
      );
      snowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
      snowGrad.addColorStop(0.5, 'rgba(224, 231, 255, 0.55)');
      snowGrad.addColorStop(1, 'rgba(147, 197, 253, 0.05)');
      ctx.fillStyle = snowGrad;
      ctx.beginPath();
      ctx.moveTo(fujiX - 36, height * 0.34);
      ctx.lineTo(fujiX + 36, height * 0.34);
      ctx.lineTo(fujiX + 58, height * 0.46);
      ctx.lineTo(fujiX + 30, height * 0.49);
      ctx.lineTo(fujiX + 10, height * 0.45);
      ctx.lineTo(fujiX - 12, height * 0.5);
      ctx.lineTo(fujiX - 32, height * 0.46);
      ctx.lineTo(fujiX - 58, height * 0.46);
      ctx.closePath();
      ctx.fill();

      // ==========================================
      // 5. CYBERPUNK TOKYO SKYLINE (MIDGROUND PARALLAX)
      // ==========================================
      const cityY = height * 0.72;
      let currBuildingX = -state.cityOffset;

      while (currBuildingX < width + 120) {
        const bIndex =
          Math.abs(Math.floor(currBuildingX / 55)) % CITY_BUILDINGS.length;
        const b = CITY_BUILDINGS[bIndex];
        const bX = currBuildingX;
        const bY = cityY - b.height;

        // Building silhouette
        ctx.fillStyle = '#111424';
        ctx.fillRect(bX, bY, b.width, b.height + 30);

        // Building side outline
        ctx.strokeStyle = '#1e243d';
        ctx.lineWidth = 1;
        ctx.strokeRect(bX, bY, b.width, b.height + 30);

        // Lit Windows
        const cols = Math.floor(b.width / 9);
        const rows = Math.floor(b.height / 12);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const win = b.windows[(r * cols + c) % b.windows.length];
            if (win.lit) {
              ctx.fillStyle = win.color;
              ctx.fillRect(bX + 4 + c * 8, bY + 6 + r * 11, 4, 6);
            }
          }
        }

        // Rooftop Antenna with blinking beacon
        if (b.hasAntenna) {
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(bX + b.width / 2, bY);
          ctx.lineTo(bX + b.width / 2, bY - 18);
          ctx.stroke();

          // Blinking red aviation light
          const beaconBlink = Math.sin(state.tick * 0.1 + bIndex) > 0.3;
          if (beaconBlink) {
            ctx.fillStyle = '#ef4444';
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(bX + b.width / 2, bY - 18, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }

        // Glowing Kanji Neon Billboard
        if (bIndex % 4 === 0) {
          ctx.fillStyle = b.neonColor;
          ctx.shadowColor = b.neonColor;
          ctx.shadowBlur = 10;
          ctx.font = 'bold 9px monospace';
          ctx.fillText(b.neonSign, bX + 3, bY - 4);
          ctx.shadowBlur = 0;
        }

        currBuildingX += b.width + 12;
      }

      // ==========================================
      // 6. HIGH-SPEED OVERHEAD GANTRIES (架線柱)
      // ==========================================
      const gantryX = width + 200 - state.gantryOffset;
      if (gantryX > -100 && gantryX < width + 250) {
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 4;
        // Left pillar
        ctx.beginPath();
        ctx.moveTo(gantryX, 100);
        ctx.lineTo(gantryX, height);
        // Top crossbeam
        ctx.moveTo(gantryX - 40, 120);
        ctx.lineTo(gantryX + 160, 120);
        ctx.stroke();

        // Gantry signal lights
        ctx.fillStyle = '#22c55e'; // Green signal
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(gantryX + 60, 120, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ==========================================
      // 7. THE SHINKANSEN (BULLET TRAIN) ROOF
      // ==========================================
      const trainY = 270;
      const trainH = height - trainY;

      // Train roof metallic gradient with top reflection sheen
      const trainGrad = ctx.createLinearGradient(0, trainY - 5, 0, height);
      trainGrad.addColorStop(0, '#f8fafc'); // White roof highlight
      trainGrad.addColorStop(0.08, '#e2e8f0'); // Silver
      trainGrad.addColorStop(0.25, '#94a3b8'); // Metallic shading
      trainGrad.addColorStop(0.35, '#0284c7'); // Shinkansen iconic blue stripe
      trainGrad.addColorStop(0.48, '#0369a1');
      trainGrad.addColorStop(0.55, '#1e293b'); // Dark undercarriage
      trainGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = trainGrad;
      ctx.fillRect(0, trainY, width, trainH);

      // Top roof gloss white highlight edge
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, trainY, width, 2);

      // Shinkansen speed aerodynamic blue racing line
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 6;
      ctx.fillRect(0, trainY + 14, width, 4);
      ctx.shadowBlur = 0;

      // High-speed roof panel seams & rivets
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      for (let x = -state.trainOffset; x < width + 120; x += 120) {
        // Vertical seam
        ctx.beginPath();
        ctx.moveTo(x, trainY);
        ctx.lineTo(x, trainY + 28);
        ctx.stroke();

        // Rivets
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.arc(x + 8, trainY + 6, 1.5, 0, Math.PI * 2);
        ctx.arc(x + 8, trainY + 20, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Hazard Warning Stripes on Car Connection
      for (let x = -state.trainOffset + 90; x < width + 120; x += 120) {
        ctx.fillStyle = '#eab308';
        ctx.fillRect(x, trainY + 2, 14, 8);
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(x + 3, trainY + 10);
        ctx.lineTo(x + 8, trainY + 2);
        ctx.lineTo(x + 11, trainY + 2);
        ctx.lineTo(x + 6, trainY + 10);
        ctx.closePath();
        ctx.fill();
      }

      // High-voltage overhead electrical sparks (Pantograph crackle)
      if (Math.random() < 0.25) {
        const sparkX = Math.random() * width;
        ctx.strokeStyle = '#67e8f9';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 15;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sparkX, 125);
        ctx.lineTo(
          sparkX + (Math.random() - 0.5) * 20,
          135 + Math.random() * 10,
        );
        ctx.lineTo(sparkX + (Math.random() - 0.5) * 30, 145);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // High-speed rail motion blur underglow (neon blue track ties)
      const trackGrad = ctx.createLinearGradient(0, height - 30, 0, height);
      trackGrad.addColorStop(0, 'rgba(2, 132, 199, 0.4)');
      trackGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');
      ctx.fillStyle = trackGrad;
      ctx.fillRect(0, height - 30, width, 30);

      // ==========================================
      // 8. AERODYNAMIC WIND & SPEED STREAKS
      // ==========================================
      const streakCount = isHyperBoost ? 18 : isDashing ? 12 : 7;
      ctx.lineWidth = isHyperBoost ? 2.5 : 1.5;
      for (let i = 0; i < streakCount; i++) {
        const lineY = 25 + i * 36 + Math.sin(state.tick * 0.15 + i) * 8;
        const lineLen = 80 + i * 25 + (isHyperBoost ? 70 : 0);
        const lineX =
          ((width + 250 - (state.tick * (baseSpeed * 2.4) + i * 160)) %
            (width + 400)) -
          100;

        const lineGrad = ctx.createLinearGradient(
          lineX,
          lineY,
          lineX - lineLen,
          lineY,
        );
        if (isHyperBoost) {
          lineGrad.addColorStop(0, 'rgba(251, 191, 36, 0.85)');
          lineGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
        } else {
          lineGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
          lineGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        }

        ctx.strokeStyle = lineGrad;
        ctx.beginPath();
        ctx.moveTo(lineX, lineY);
        ctx.lineTo(lineX - lineLen, lineY);
        ctx.stroke();
      }

      // ==========================================
      // 9. THE MENACING ONI (DEMON BOSS)
      // ==========================================
      // distancePercent: 100% = far back (x = 30), 0% = caught (x = 440)
      const clampedDist = Math.max(0, Math.min(100, distancePercent));
      const oniTargetX = 440 - (clampedDist / 100) * 410;
      const oniBob = Math.sin(state.tick * 0.28) * 10;
      const oniY = trainY - 110 + oniBob;

      // Infernal Demon Aura (Flames & Dark Smoke)
      const auraRadius = 95 + Math.sin(state.tick * 0.2) * 10;
      const oniAura = ctx.createRadialGradient(
        oniTargetX + 50,
        oniY + 55,
        15,
        oniTargetX + 50,
        oniY + 55,
        auraRadius,
      );
      oniAura.addColorStop(0, 'rgba(239, 68, 68, 0.75)');
      oniAura.addColorStop(0.4, 'rgba(185, 28, 28, 0.45)');
      oniAura.addColorStop(0.75, 'rgba(127, 29, 29, 0.2)');
      oniAura.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = oniAura;
      ctx.beginPath();
      ctx.arc(oniTargetX + 50, oniY + 55, auraRadius, 0, Math.PI * 2);
      ctx.fill();

      // Spawn fiery ember particles from Oni
      if (state.tick % 2 === 0 && state.particles.length < 90) {
        state.particles.push({
          x: oniTargetX + 40 + (Math.random() - 0.5) * 40,
          y: oniY + 50 + (Math.random() - 0.5) * 40,
          vx: -(Math.random() * 6 + 4),
          vy: (Math.random() - 0.5) * 4,
          size: Math.random() * 4 + 2,
          color: Math.random() > 0.4 ? '#ef4444' : '#f97316',
          life: 0.8,
          type: 'ember',
        });
      }

      // Oni Muscular Torso & Demon Skin
      const oniSkinGrad = ctx.createRadialGradient(
        oniTargetX + 50,
        oniY + 55,
        10,
        oniTargetX + 50,
        oniY + 55,
        50,
      );
      oniSkinGrad.addColorStop(0, '#b91c1c'); // Crimson red
      oniSkinGrad.addColorStop(0.7, '#7f1d1d');
      oniSkinGrad.addColorStop(1, '#450a0a'); // Deep dark blood red

      ctx.fillStyle = oniSkinGrad;
      ctx.beginPath();
      ctx.ellipse(oniTargetX + 50, oniY + 65, 42, 46, 0, 0, Math.PI * 2);
      ctx.fill();

      // Demon Samurai Shoulder Armor (Sode)
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(oniTargetX + 8, oniY + 42, 22, 16);
      ctx.fillStyle = '#f59e0b'; // Gold studs
      ctx.fillRect(oniTargetX + 12, oniY + 46, 4, 4);
      ctx.fillRect(oniTargetX + 22, oniY + 46, 4, 4);

      // Talisman Rope Belt (Shimenawa)
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(oniTargetX + 50, oniY + 75, 40, 0.2, Math.PI - 0.2);
      ctx.stroke();

      // Oni Fierce Head
      ctx.fillStyle = oniSkinGrad;
      ctx.beginPath();
      ctx.arc(oniTargetX + 50, oniY + 28, 28, 0, Math.PI * 2);
      ctx.fill();

      // Menacing Horns (Curved Golden Demon Horns)
      const hornGrad = ctx.createLinearGradient(
        oniTargetX + 50,
        oniY + 15,
        oniTargetX + 50,
        oniY - 30,
      );
      hornGrad.addColorStop(0, '#fef08a');
      hornGrad.addColorStop(0.6, '#f59e0b');
      hornGrad.addColorStop(1, '#b45309');
      ctx.fillStyle = hornGrad;

      // Left horn
      ctx.beginPath();
      ctx.moveTo(oniTargetX + 34, oniY + 14);
      ctx.quadraticCurveTo(
        oniTargetX + 22,
        oniY - 14,
        oniTargetX + 12,
        oniY - 26,
      );
      ctx.quadraticCurveTo(
        oniTargetX + 34,
        oniY - 8,
        oniTargetX + 42,
        oniY + 12,
      );
      ctx.closePath();
      ctx.fill();

      // Right horn
      ctx.beginPath();
      ctx.moveTo(oniTargetX + 66, oniY + 14);
      ctx.quadraticCurveTo(
        oniTargetX + 78,
        oniY - 14,
        oniTargetX + 88,
        oniY - 26,
      );
      ctx.quadraticCurveTo(
        oniTargetX + 66,
        oniY - 8,
        oniTargetX + 58,
        oniY + 12,
      );
      ctx.closePath();
      ctx.fill();

      // Fiery Eyes with Anime Fire Streaks
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      // Left eye
      ctx.ellipse(oniTargetX + 40, oniY + 26, 6, 3.5, -0.2, 0, Math.PI * 2);
      // Right eye
      ctx.ellipse(oniTargetX + 60, oniY + 26, 6, 3.5, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Eye Fire Trails (Streaming backward)
      ctx.fillStyle = 'rgba(239, 68, 68, 0.65)';
      ctx.beginPath();
      ctx.moveTo(oniTargetX + 37, oniY + 26);
      ctx.lineTo(oniTargetX + 15, oniY + 20 + Math.sin(state.tick * 0.4) * 4);
      ctx.lineTo(oniTargetX + 38, oniY + 29);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Menacing Fangs & Grin
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(oniTargetX + 38, oniY + 40, 24, 10, 4);
      ctx.fill();

      // Razor sharp fangs
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(oniTargetX + 41, oniY + 40);
      ctx.lineTo(oniTargetX + 44, oniY + 48);
      ctx.lineTo(oniTargetX + 47, oniY + 40);
      ctx.moveTo(oniTargetX + 53, oniY + 40);
      ctx.lineTo(oniTargetX + 56, oniY + 48);
      ctx.lineTo(oniTargetX + 59, oniY + 40);
      ctx.fill();

      // Giant Spiked Kanabō Iron Club
      const clubSwing = Math.sin(state.tick * 0.22) * 22;
      ctx.save();
      ctx.translate(oniTargetX + 96, oniY + 46);
      ctx.rotate((clubSwing * Math.PI) / 180);

      // Club handle & shaft
      ctx.fillStyle = '#09090b';
      ctx.fillRect(-10, -58, 20, 78);
      // Red rune wrap on club
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(-10, -42, 20, 6);
      ctx.fillRect(-10, -26, 20, 6);

      // Steel spikes
      ctx.fillStyle = '#e2e8f0';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 4;
      ctx.fillRect(-16, -52, 6, 8);
      ctx.fillRect(10, -52, 6, 8);
      ctx.fillRect(-16, -36, 6, 8);
      ctx.fillRect(10, -36, 6, 8);
      ctx.fillRect(-16, -20, 6, 8);
      ctx.fillRect(10, -20, 6, 8);
      ctx.shadowBlur = 0;
      ctx.restore();

      // ==========================================
      // 10. THE SHINOBI (NINJA RUNNER)
      // ==========================================
      const playerX = 540;
      const runCycle = Math.sin(state.tick * 0.4);
      const playerBob = Math.abs(runCycle) * 7;
      const playerY = trainY - 60 + playerBob;

      // Dynamic leaning angle
      let playerRot = 0.18; // Aerodynamic sprint lean
      if (isStumbling) playerRot = -0.38;
      if (isDashing) playerRot = 0.42;

      ctx.save();
      ctx.translate(playerX, playerY);
      ctx.rotate(playerRot);

      // Afterimage Ghost Trails (Dashing / HyperBoost)
      if (isDashing || isHyperBoost) {
        for (let g = 1; g <= 3; g++) {
          ctx.fillStyle = isHyperBoost
            ? `rgba(251, 191, 36, ${0.45 / g})`
            : `rgba(56, 189, 248, ${0.45 / g})`;
          ctx.fillRect(-40 * g, -16, 28, 42);
        }
      }

      // Long Fluttering Shinobi Scarf (Fluid Wave)
      const scarfWav1 = Math.sin(state.tick * 0.5) * 12;
      const scarfWav2 = Math.cos(state.tick * 0.45) * 10;
      const scarfGrad = ctx.createLinearGradient(-10, 5, -65, 0);
      if (isHyperBoost) {
        scarfGrad.addColorStop(0, '#fbbf24');
        scarfGrad.addColorStop(1, 'rgba(245, 158, 11, 0.2)');
      } else {
        scarfGrad.addColorStop(0, '#38bdf8');
        scarfGrad.addColorStop(1, 'rgba(2, 132, 199, 0.2)');
      }

      ctx.fillStyle = scarfGrad;
      ctx.shadowColor = isHyperBoost ? '#fbbf24' : '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(-10, 6);
      ctx.bezierCurveTo(
        -30,
        2 + scarfWav1,
        -50,
        -8 + scarfWav2,
        -70,
        scarfWav1,
      );
      ctx.lineTo(-65, 14 + scarfWav1);
      ctx.bezierCurveTo(-45, 16 + scarfWav2, -25, 18 + scarfWav1, -8, 18);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Katana Sheathed on Back (Diagonal)
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-18, -24);
      ctx.lineTo(8, 22);
      ctx.stroke();
      // Katana gold guard & handle
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-22, -28, 6, 6);

      // Shinobi Body / Suit
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(-12, -2, 24, 30, 6);
      ctx.fill();

      // Shinobi Torso Armor Plate
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(-8, 2, 16, 20, 4);
      ctx.fill();

      // Shinobi Head & Ninja Cowl
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, -14, 15, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Neon Visor / Headband
      ctx.fillStyle = isHyperBoost ? '#fbbf24' : '#38bdf8';
      ctx.shadowColor = isHyperBoost ? '#fbbf24' : '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.fillRect(-15, -20, 30, 6);

      // Focused Eye Gaze
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(4, -15, 7, 4);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(8, -15, 3, 4);
      ctx.shadowBlur = 0;

      // Articulated Running Legs
      const legAngle1 = Math.sin(state.tick * 0.4) * 0.85;
      const legAngle2 = -legAngle1;

      // Leg 1 (Front leg)
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-5, 26);
      ctx.lineTo(-5 + Math.sin(legAngle1) * 18, 26 + Math.cos(legAngle1) * 20);
      ctx.stroke();

      // Leg 2 (Back leg)
      ctx.strokeStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(5, 26);
      ctx.lineTo(5 + Math.sin(legAngle2) * 18, 26 + Math.cos(legAngle2) * 20);
      ctx.stroke();

      ctx.restore();

      // Footstep Friction Sparks on Train Roof
      if (state.tick % 2 === 0) {
        state.particles.push({
          x: playerX - 10 + (Math.random() - 0.5) * 15,
          y: trainY - 2,
          vx: -(Math.random() * 10 + 6),
          vy: -(Math.random() * 3 + 1),
          size: Math.random() * 3 + 1.5,
          color: isHyperBoost ? '#fef08a' : '#67e8f9',
          life: 0.6,
          type: 'spark',
        });
      }

      // ==========================================
      // 11. DYNAMIC PARTICLES ENGINE (SPARKS, SAKURA, EMBERS)
      // ==========================================
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.035;

        if (p.life <= 0 || p.x < -40) {
          state.particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;

        if (p.type === 'petal') {
          // Rotating sakura petal
          p.rot = (p.rot || 0) + (p.vRot || 0.05);
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 1.5, p.size * 0.8, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Spark / Ember circle
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // ==========================================
      // 12. DANGER PULSING VIGNETTE & WARNING SCANLINES (< 28% DISTANCE)
      // ==========================================
      if (clampedDist < 28) {
        const pulse = (Math.sin(state.tick * 0.22) + 1) * 0.5;
        const vignetteAlpha = (1 - clampedDist / 28) * 0.55 * pulse;
        const vigGrad = ctx.createRadialGradient(
          width / 2,
          height / 2,
          width * 0.25,
          width / 2,
          height / 2,
          width * 0.65,
        );
        vigGrad.addColorStop(0, 'rgba(239, 68, 68, 0)');
        vigGrad.addColorStop(0.7, `rgba(239, 68, 68, ${vignetteAlpha * 0.5})`);
        vigGrad.addColorStop(1, `rgba(220, 38, 38, ${vignetteAlpha})`);
        ctx.fillStyle = vigGrad;
        ctx.fillRect(0, 0, width, height);

        // Warning Alert Banner on top
        if (pulse > 0.4) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
          ctx.font = 'black 11px monospace';
          ctx.fillText('⚠️ DANGER: ONI APPROACHING! ⚠️', width / 2 - 110, 26);
        }
      }

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      isMounted = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [distancePercent, isDashing, isStumbling, isHyperBoost, streak]);

  return (
    <div className='relative w-full overflow-hidden rounded-3xl border border-(--border-color) bg-[#070913] shadow-2xl transition-all'>
      <canvas
        ref={canvasRef}
        width={960}
        height={380}
        className='block h-auto w-full'
      />
    </div>
  );
}
