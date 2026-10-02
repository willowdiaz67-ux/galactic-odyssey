import React, { useRef, useEffect } from 'react';

interface WarpVector {
  dx: number;
  dy: number;
  dist: number;
}

interface ParallaxStarfieldCanvasProps {
  currentSector: string;
  isWarping?: boolean;
  warpVector?: WarpVector;
  interactive?: boolean;
  className?: string;
}

interface Star {
  x: number;
  y: number;
  z: number; // 0 (far) to 1 (near)
  baseSize: number;
  color: string;
  twinkleSpeed: number;
  twinklePhase: number;
  alpha: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  life: number;
  maxLife: number;
  color: string;
}

const SECTOR_PALETTES: Record<string, { nebula1: string; nebula2: string; accent: string }> = {
  alpha: {
    nebula1: 'rgba(56, 189, 248, 0.07)',  // Cyan
    nebula2: 'rgba(99, 102, 241, 0.05)',  // Indigo
    accent: '#38BDF8'
  },
  beta: {
    nebula1: 'rgba(168, 85, 247, 0.08)', // Purple
    nebula2: 'rgba(236, 72, 153, 0.06)', // Rose / Magenta
    accent: '#C084FC'
  },
  gamma: {
    nebula1: 'rgba(20, 184, 166, 0.08)', // Teal
    nebula2: 'rgba(245, 158, 11, 0.05)', // Amber
    accent: '#2DD4BF'
  },
  soul_society: {
    nebula1: 'rgba(147, 51, 234, 0.11)', // Spiritual Violet
    nebula2: 'rgba(56, 189, 248, 0.08)', // Reishi Blue
    accent: '#A855F7'
  }
};

export const ParallaxStarfieldCanvas: React.FC<ParallaxStarfieldCanvasProps> = ({
  currentSector = 'alpha',
  isWarping = false,
  warpVector = { dx: 0, dy: 0, dist: 0 },
  interactive = true,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // References for mutable animation state
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0
  });

  const warpStateRef = useRef<{
    currentSpeed: number;
    targetSpeed: number;
    dirX: number;
    dirY: number;
    warpFlash: number;
  }>({
    currentSpeed: 1,
    targetSpeed: 1,
    dirX: 0,
    dirY: -1,
    warpFlash: 0
  });

  // Keep warp props updated in ref
  useEffect(() => {
    if (isWarping) {
      // Calculate normalized direction vector from warpVector
      const len = Math.hypot(warpVector.dx, warpVector.dy) || 1;
      warpStateRef.current.dirX = warpVector.dx / len;
      warpStateRef.current.dirY = warpVector.dy / len;
      // High warp velocity proportional to jump distance
      warpStateRef.current.targetSpeed = 28 + Math.min(20, warpVector.dist * 0.4);
      warpStateRef.current.warpFlash = 1.0;
    } else {
      warpStateRef.current.targetSpeed = 1;
    }
  }, [isWarping, warpVector]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const normX = (e.clientX / width - 0.5) * 2;
      const normY = (e.clientY / height - 0.5) * 2;
      mouseRef.current.targetX = normX;
      mouseRef.current.targetY = normY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Initialize 360 layered stars with diverse depths and realistic stellar colors
    const STAR_COUNT = 360;
    const starColors = [
      '#F8FAFC', // Crisp White
      '#BAE6FD', // Sky/Cyan Blue
      '#E0E7FF', // Pale Indigo
      '#FDE68A', // Warm Amber
      '#E9D5FF', // Violet Soft
      '#FED7AA'  // Pale Peach
    ];

    const stars: Star[] = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      const z = Math.pow(Math.random(), 1.8); // Bias toward distant stars for realistic deep field
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z,
        baseSize: 0.6 + z * 1.8,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        twinkleSpeed: 0.02 + Math.random() * 0.04,
        twinklePhase: Math.random() * Math.PI * 2,
        alpha: 0.35 + z * 0.55
      });
    }

    // Occasional shooting stars pool
    const shootingStars: ShootingStar[] = [];
    let nextShootingStarTime = Date.now() + 3000 + Math.random() * 4000;

    let time = 0;

    const render = () => {
      time += 0.016;

      // Smooth mouse parallax interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Warp speed smooth lerp
      const warp = warpStateRef.current;
      warp.currentSpeed += (warp.targetSpeed - warp.currentSpeed) * (isWarping ? 0.09 : 0.04);
      if (warp.warpFlash > 0) {
        warp.warpFlash = Math.max(0, warp.warpFlash - 0.025);
      }

      // Base clear
      ctx.clearRect(0, 0, width, height);

      // Deep space base fill with rich cosmic undertone
      ctx.fillStyle = '#04060C';
      ctx.fillRect(0, 0, width, height);

      // Current sector ambient nebula clouds
      const palette = SECTOR_PALETTES[currentSector] || SECTOR_PALETTES.alpha;

      // Nebula Cloud 1: Drifting slowly
      const neb1X = width * 0.35 + Math.sin(time * 0.25) * 60;
      const neb1Y = height * 0.45 + Math.cos(time * 0.2) * 50;
      const nebGrad1 = ctx.createRadialGradient(neb1X, neb1Y, 30, neb1X, neb1Y, Math.max(width, height) * 0.65);
      nebGrad1.addColorStop(0, palette.nebula1);
      nebGrad1.addColorStop(0.5, 'rgba(15, 23, 42, 0.03)');
      nebGrad1.addColorStop(1, 'transparent');
      ctx.fillStyle = nebGrad1;
      ctx.fillRect(0, 0, width, height);

      // Nebula Cloud 2: Counter-drifting ambient glow
      const neb2X = width * 0.75 + Math.cos(time * 0.18) * 80;
      const neb2Y = height * 0.65 + Math.sin(time * 0.22) * 70;
      const nebGrad2 = ctx.createRadialGradient(neb2X, neb2Y, 40, neb2X, neb2Y, Math.max(width, height) * 0.55);
      nebGrad2.addColorStop(0, palette.nebula2);
      nebGrad2.addColorStop(0.6, 'rgba(15, 23, 42, 0.02)');
      nebGrad2.addColorStop(1, 'transparent');
      ctx.fillStyle = nebGrad2;
      ctx.fillRect(0, 0, width, height);

      // Hyperspace Warp Ring Pulse during transition
      if (warp.warpFlash > 0.05) {
        const cx = width / 2;
        const cy = height / 2;
        const ringRadius = (1 - warp.warpFlash) * Math.max(width, height) * 0.8;
        
        ctx.save();
        ctx.strokeStyle = palette.accent;
        ctx.lineWidth = warp.warpFlash * 5;
        ctx.globalAlpha = warp.warpFlash * 0.7;
        ctx.beginPath();
        ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
        ctx.stroke();

        const flashGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, ringRadius * 0.9);
        flashGrad.addColorStop(0, `${palette.accent}22`);
        flashGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = flashGrad;
        ctx.fill();
        ctx.restore();
      }

      // Parallax mouse offsets
      const mouseOffsetX = mouseRef.current.x * 24;
      const mouseOffsetY = mouseRef.current.y * 24;

      // Base cosmic sub-light drift velocity (vector direction or gentle default drift)
      const baseDriftX = (warp.dirX || 0.3) * 0.25;
      const baseDriftY = (warp.dirY || -0.4) * 0.25;

      // Render & Update Stars
      const isStreaking = warp.currentSpeed > 2.5;

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Depth factor (0.2 for far, 1.0 for near)
        const depth = 0.2 + star.z * 0.8;

        // Position drift updated with warp speed multiplier
        const speed = isStreaking ? warp.currentSpeed * depth : 0.6 * depth;
        star.x += baseDriftX * speed;
        star.y += baseDriftY * speed;

        // Screen wrap
        if (star.x < -40) star.x = width + 40;
        if (star.x > width + 40) star.x = -40;
        if (star.y < -40) star.y = height + 40;
        if (star.y > height + 40) star.y = -40;

        // Calculate rendered screen coordinate with parallax layer offset
        const drawX = star.x + mouseOffsetX * depth;
        const drawY = star.y + mouseOffsetY * depth;

        // Twinkle luminance calculation
        const twinkle = Math.sin(time * 3 * star.twinkleSpeed + star.twinklePhase) * 0.25;
        const finalAlpha = Math.min(1, Math.max(0.15, star.alpha + twinkle));

        if (isStreaking) {
          // HYPERSPACE WARP STREAKS
          const streakLength = Math.min(90, (warp.currentSpeed * depth * 3.5));
          const tailX = drawX - warp.dirX * streakLength;
          const tailY = drawY - warp.dirY * streakLength;

          ctx.save();
          const grad = ctx.createLinearGradient(drawX, drawY, tailX, tailY);
          grad.addColorStop(0, star.color);
          grad.addColorStop(0.3, `${star.color}99`);
          grad.addColorStop(1, 'transparent');

          ctx.strokeStyle = grad;
          ctx.lineWidth = Math.max(1, star.baseSize * (1 + (warp.currentSpeed / 30)));
          ctx.beginPath();
          ctx.moveTo(drawX, drawY);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();

          // Bright head point
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(drawX, drawY, star.baseSize * 0.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          // NORMAL SUB-LIGHT STAR POINT WITH SOFT DIFFUSION
          ctx.save();
          ctx.globalAlpha = finalAlpha;
          ctx.fillStyle = star.color;

          // Outer delicate glow for brighter/closer stars
          if (star.z > 0.65) {
            ctx.shadowColor = star.color;
            ctx.shadowBlur = star.baseSize * 2.5;
          }

          ctx.beginPath();
          ctx.arc(drawX, drawY, star.baseSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // Shooting Star / Meteor logic (only during sublight navigation)
      if (!isStreaking) {
        const now = Date.now();
        if (now > nextShootingStarTime && shootingStars.length < 2) {
          const startX = Math.random() * width;
          const startY = Math.random() * (height * 0.4);
          const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.4;
          const speed = 12 + Math.random() * 8;
          shootingStars.push({
            x: startX,
            y: startY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            length: 45 + Math.random() * 40,
            life: 0,
            maxLife: 30 + Math.random() * 20,
            color: palette.accent
          });
          nextShootingStarTime = now + 4000 + Math.random() * 6000;
        }

        // Render & update shooting stars
        for (let s = shootingStars.length - 1; s >= 0; s--) {
          const comet = shootingStars[s];
          comet.life++;
          comet.x += comet.vx;
          comet.y += comet.vy;

          const progress = comet.life / comet.maxLife;
          const cometAlpha = Math.sin(progress * Math.PI);

          const tailX = comet.x - (comet.vx / 10) * comet.length;
          const tailY = comet.y - (comet.vy / 10) * comet.length;

          ctx.save();
          const cometGrad = ctx.createLinearGradient(comet.x, comet.y, tailX, tailY);
          cometGrad.addColorStop(0, '#FFFFFF');
          cometGrad.addColorStop(0.2, comet.color);
          cometGrad.addColorStop(1, 'transparent');

          ctx.strokeStyle = cometGrad;
          ctx.lineWidth = 1.8;
          ctx.globalAlpha = cometAlpha * 0.85;
          ctx.beginPath();
          ctx.moveTo(comet.x, comet.y);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();
          ctx.restore();

          if (comet.life >= comet.maxLife) {
            shootingStars.splice(s, 1);
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [currentSector, interactive, isWarping]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  );
};
