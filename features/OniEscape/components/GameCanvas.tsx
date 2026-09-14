'use client';

import React, { useEffect, useRef } from 'react';

interface GameCanvasProps {
  distancePercent: number; // 0 (caught) to 100 (safe)
  isDashing: boolean;
  isStumbling: boolean;
  isHyperBoost: boolean;
  streak: number;
}

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
    shakeIntensity: 0,
    particles: [] as Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      life: number;
    }>,
  });

  // Trigger shake on stumble
  useEffect(() => {
    if (isStumbling) {
      stateRef.current.shakeIntensity = 12;
    }
  }, [isStumbling]);

  // Spawn dash particles
  useEffect(() => {
    if (isDashing) {
      const state = stateRef.current;
      for (let i = 0; i < 16; i++) {
        state.particles.push({
          x: 480 + Math.random() * 20,
          y: 285 + Math.random() * 20,
          vx: -(Math.random() * 12 + 8),
          vy: (Math.random() - 0.5) * 4,
          size: Math.random() * 4 + 2,
          color: isHyperBoost ? '#f59e0b' : '#38bdf8',
          life: 1,
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

      // Base speed
      const baseSpeed = isHyperBoost ? 18 : isDashing ? 14 : 9;
      state.trainOffset = (state.trainOffset + baseSpeed) % 80;
      state.cityOffset = (state.cityOffset + baseSpeed * 0.4) % width;
      state.mountainOffset = (state.mountainOffset + baseSpeed * 0.1) % width;

      // Decay screen shake
      let shakeX = 0;
      let shakeY = 0;
      if (state.shakeIntensity > 0) {
        shakeX = (Math.random() - 0.5) * state.shakeIntensity;
        shakeY = (Math.random() - 0.5) * state.shakeIntensity;
        state.shakeIntensity *= 0.85;
        if (state.shakeIntensity < 0.5) state.shakeIntensity = 0;
      }

      ctx.save();
      ctx.translate(shakeX, shakeY);

      // 1. Night Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#090d16');
      skyGrad.addColorStop(0.6, '#131b2e');
      skyGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Giant Moon
      const moonX = width * 0.82;
      const moonY = 80;
      const moonRadius = 45;

      const moonGlow = ctx.createRadialGradient(
        moonX,
        moonY,
        moonRadius * 0.5,
        moonX,
        moonY,
        moonRadius * 2.2,
      );
      moonGlow.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
      moonGlow.addColorStop(0.5, 'rgba(253, 224, 71, 0.15)');
      moonGlow.addColorStop(1, 'rgba(253, 224, 71, 0)');
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius * 2.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
      ctx.fill();

      // Moon crater accents
      ctx.fillStyle = 'rgba(234, 179, 8, 0.2)';
      ctx.beginPath();
      ctx.arc(moonX - 12, moonY - 10, 10, 0, Math.PI * 2);
      ctx.arc(moonX + 14, moonY + 12, 14, 0, Math.PI * 2);
      ctx.arc(moonX - 15, moonY + 18, 8, 0, Math.PI * 2);
      ctx.fill();

      // 3. Far Mountains (Mt. Fuji Silhouette)
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(0, height * 0.72);
      const fujiX =
        (((width * 0.45 - state.mountainOffset) % width) + width) % width;
      ctx.lineTo(fujiX - 120, height * 0.72);
      ctx.lineTo(fujiX - 30, height * 0.35);
      ctx.lineTo(fujiX + 30, height * 0.35);
      ctx.lineTo(fujiX + 120, height * 0.72);
      ctx.lineTo(width, height * 0.72);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Fuji snow cap
      ctx.fillStyle = 'rgba(241, 245, 249, 0.25)';
      ctx.beginPath();
      ctx.moveTo(fujiX - 45, height * 0.44);
      ctx.lineTo(fujiX - 30, height * 0.35);
      ctx.lineTo(fujiX + 30, height * 0.35);
      ctx.lineTo(fujiX + 45, height * 0.44);
      ctx.lineTo(fujiX + 20, height * 0.46);
      ctx.lineTo(fujiX, height * 0.43);
      ctx.lineTo(fujiX - 20, height * 0.47);
      ctx.closePath();
      ctx.fill();

      // 4. Midground City Silhouettes
      ctx.fillStyle = '#1e2235';
      const cityStep = 60;
      for (let x = -state.cityOffset; x < width + cityStep; x += cityStep) {
        const bHeight = 40 + (Math.sin(x * 12.3) + 1) * 35;
        ctx.fillRect(x, height * 0.72 - bHeight, cityStep - 8, bHeight + 20);
      }

      // 5. The Shinkansen (Bullet Train) Roof
      const trainY = 270;
      const trainH = height - trainY;

      // Train roof gradient
      const trainGrad = ctx.createLinearGradient(0, trainY, 0, height);
      trainGrad.addColorStop(0, '#e2e8f0');
      trainGrad.addColorStop(0.15, '#cbd5e1');
      trainGrad.addColorStop(0.4, '#1e3a8a');
      trainGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = trainGrad;
      ctx.fillRect(0, trainY, width, trainH);

      // Shinkansen speed racing lines on roof
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, trainY + 12);
      ctx.lineTo(width, trainY + 12);
      ctx.stroke();

      // Roof panels / seams scrolling
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      for (let x = -state.trainOffset; x < width + 80; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, trainY);
        ctx.lineTo(x, trainY + 24);
        ctx.stroke();
      }

      // 6. Horizontal Wind & Speed Lines
      ctx.strokeStyle = isHyperBoost
        ? 'rgba(251, 191, 36, 0.4)'
        : 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.5;
      const lineCount = isHyperBoost ? 14 : 7;
      for (let i = 0; i < lineCount; i++) {
        const lineY = 40 + i * 38 + Math.sin(state.tick * 0.1 + i) * 6;
        const lineLen = 60 + i * 18;
        const lineX =
          ((width + 200 - (state.tick * (baseSpeed * 2.2) + i * 150)) %
            (width + 300)) -
          100;
        ctx.beginPath();
        ctx.moveTo(lineX, lineY);
        ctx.lineTo(lineX - lineLen, lineY);
        ctx.stroke();
      }

      // 7. Render The Menacing Oni (Pursuer)
      // distancePercent: 100% = far away (x = -40), 0% = caught (x = 420)
      const clampedDist = Math.max(0, Math.min(100, distancePercent));
      const oniTargetX = 430 - (clampedDist / 100) * 440;
      const oniBob = Math.sin(state.tick * 0.25) * 8;
      const oniY = trainY - 95 + oniBob;

      // Oni dark aura / red mist
      const auraRadius = 80;
      const oniAura = ctx.createRadialGradient(
        oniTargetX + 45,
        oniY + 50,
        15,
        oniTargetX + 45,
        oniY + 50,
        auraRadius,
      );
      oniAura.addColorStop(0, 'rgba(220, 38, 38, 0.6)');
      oniAura.addColorStop(0.5, 'rgba(153, 27, 27, 0.35)');
      oniAura.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = oniAura;
      ctx.beginPath();
      ctx.arc(oniTargetX + 45, oniY + 50, auraRadius, 0, Math.PI * 2);
      ctx.fill();

      // Oni Body (Demon silhouette)
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      // Broad shoulders / torso
      ctx.ellipse(oniTargetX + 45, oniY + 55, 38, 42, 0, 0, Math.PI * 2);
      ctx.fill();

      // Oni Head
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.arc(oniTargetX + 45, oniY + 25, 26, 0, Math.PI * 2);
      ctx.fill();

      // Horns
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      // Left horn
      ctx.moveTo(oniTargetX + 32, oniY + 12);
      ctx.quadraticCurveTo(
        oniTargetX + 24,
        oniY - 14,
        oniTargetX + 18,
        oniY - 22,
      );
      ctx.quadraticCurveTo(
        oniTargetX + 32,
        oniY - 6,
        oniTargetX + 38,
        oniY + 10,
      );
      // Right horn
      ctx.moveTo(oniTargetX + 58, oniY + 12);
      ctx.quadraticCurveTo(
        oniTargetX + 66,
        oniY - 14,
        oniTargetX + 72,
        oniY - 22,
      );
      ctx.quadraticCurveTo(
        oniTargetX + 58,
        oniY - 6,
        oniTargetX + 52,
        oniY + 10,
      );
      ctx.fill();

      // Glowing Oni Eyes
      ctx.fillStyle = '#facc15';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.ellipse(oniTargetX + 37, oniY + 24, 5, 3, -0.2, 0, Math.PI * 2);
      ctx.ellipse(oniTargetX + 53, oniY + 24, 5, 3, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      // Menacing Fangs / Grin
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(oniTargetX + 38, oniY + 36);
      ctx.lineTo(oniTargetX + 41, oniY + 44);
      ctx.lineTo(oniTargetX + 44, oniY + 36);
      ctx.lineTo(oniTargetX + 48, oniY + 36);
      ctx.lineTo(oniTargetX + 51, oniY + 44);
      ctx.lineTo(oniTargetX + 54, oniY + 36);
      ctx.fill();

      // Spiked Club (Kanabō)
      const clubSwing = Math.sin(state.tick * 0.2) * 15;
      ctx.save();
      ctx.translate(oniTargetX + 85, oniY + 40);
      ctx.rotate((clubSwing * Math.PI) / 180);
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(-8, -50, 16, 65);
      // Club spikes
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-12, -45, 4, 6);
      ctx.fillRect(8, -45, 4, 6);
      ctx.fillRect(-12, -30, 4, 6);
      ctx.fillRect(8, -30, 4, 6);
      ctx.fillRect(-12, -15, 4, 6);
      ctx.fillRect(8, -15, 4, 6);
      ctx.restore();

      // 8. Render The Player (Shinobi / Runner)
      const playerX = 520;
      const runCycle = Math.sin(state.tick * 0.35);
      const playerBob = Math.abs(runCycle) * 6;
      const playerY = trainY - 55 + playerBob;

      // Stumble wobble
      let playerRot = 0.1;
      if (isStumbling) playerRot = -0.35;
      if (isDashing) playerRot = 0.35;

      ctx.save();
      ctx.translate(playerX, playerY);
      ctx.rotate(playerRot);

      // Dash Ghost Trail
      if (isDashing || isHyperBoost) {
        ctx.fillStyle = isHyperBoost
          ? 'rgba(251, 191, 36, 0.35)'
          : 'rgba(56, 189, 248, 0.35)';
        ctx.fillRect(-45, -15, 30, 40);
        ctx.fillRect(-75, -10, 25, 35);
      }

      // Fluttering Cloak / Scarf
      const scarfWav = Math.sin(state.tick * 0.5) * 8;
      ctx.fillStyle = isHyperBoost ? '#f59e0b' : '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(-10, 5);
      ctx.lineTo(-45, -2 + scarfWav);
      ctx.lineTo(-40, 14 + scarfWav);
      ctx.lineTo(-8, 16);
      ctx.closePath();
      ctx.fill();

      // Shinobi Body / Suit
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-10, 0, 20, 28);

      // Shinobi Head & Mask
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(0, -12, 14, 0, Math.PI * 2);
      ctx.fill();

      // Headband / Headwear
      ctx.fillStyle = isHyperBoost ? '#fbbf24' : '#0284c7';
      ctx.fillRect(-14, -18, 28, 6);

      // Shinobi Focused Eye Gaze
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(3, -13, 6, 4);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(6, -13, 3, 4);

      // Running Legs
      const legAngle1 = Math.sin(state.tick * 0.35) * 0.7;
      const legAngle2 = -legAngle1;

      // Leg 1
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-4, 28);
      ctx.lineTo(-4 + Math.sin(legAngle1) * 16, 28 + Math.cos(legAngle1) * 18);
      ctx.stroke();

      // Leg 2
      ctx.beginPath();
      ctx.moveTo(4, 28);
      ctx.lineTo(4 + Math.sin(legAngle2) * 16, 28 + Math.cos(legAngle2) * 18);
      ctx.stroke();

      ctx.restore();

      // 9. Particles (Sparks & Dash embers)
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.04;

        if (p.life <= 0) {
          state.particles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // 10. High Danger Warning Vignette (< 25% Distance)
      if (clampedDist < 28) {
        const pulse = (Math.sin(state.tick * 0.2) + 1) * 0.5;
        const vignetteAlpha = (1 - clampedDist / 28) * 0.45 * pulse;
        const vigGrad = ctx.createRadialGradient(
          width / 2,
          height / 2,
          width * 0.3,
          width / 2,
          height / 2,
          width * 0.65,
        );
        vigGrad.addColorStop(0, 'rgba(239, 68, 68, 0)');
        vigGrad.addColorStop(1, `rgba(239, 68, 68, ${vignetteAlpha})`);
        ctx.fillStyle = vigGrad;
        ctx.fillRect(0, 0, width, height);
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
    <div className='relative w-full overflow-hidden rounded-3xl border border-(--border-color) bg-slate-950 shadow-2xl'>
      <canvas
        ref={canvasRef}
        width={960}
        height={380}
        className='block h-auto w-full'
      />
    </div>
  );
}
