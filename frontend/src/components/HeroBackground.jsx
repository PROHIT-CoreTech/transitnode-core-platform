"use client";

import React, { useEffect, useRef } from 'react';

export default function HeroBackground() {
  const canvasRef = useRef(null);
  const lastScrollY = useRef(0);
  const speedMultiplier = useRef(1);
  const dashOffset = useRef(0);
  const pulseTime = useRef(0);
  const animationFrameId = useRef(null);
  const trucksRef = useRef([
    { lane: 'left', progress: 0.15, speed: 0.0016, color: '#d97706' },
    { lane: 'right', progress: 0.55, speed: 0.0011, color: '#0284c7' }
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Handle resizing
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // Initialize lastScrollY to prevent a huge speed spike on load
    lastScrollY.current = window.scrollY;

    const baseSpeed = 0.0035; // speed of dash offset flow per frame

    // Animation render loop
    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // 1. Calculate scroll velocity and lerp the speed multiplier
      const currentScrollY = window.scrollY;
      const deltaScroll = Math.abs(currentScrollY - lastScrollY.current);
      lastScrollY.current = currentScrollY;

      // Idle is 1.0, fast scroll scales up to 6.0
      const targetMultiplier = 1.0 + Math.min(deltaScroll * 0.07, 5.0);
      
      // Smooth lerp decay: speedMultiplier = current + (target - current) * lerpFactor
      speedMultiplier.current += (targetMultiplier - speedMultiplier.current) * 0.05;

      // 2. Increment animations based on speed multiplier
      dashOffset.current = (dashOffset.current + baseSpeed * speedMultiplier.current) % 1.0;
      pulseTime.current += 0.012 * speedMultiplier.current;

      // 3. Clear canvas & Draw Background Navy Fill
      ctx.fillStyle = '#07111a';
      ctx.fillRect(0, 0, width, height);

      const horizonY = height * 0.38;
      const centerX = width / 2;

      // 4. Draw Sky Region (Above Horizon) with linear gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, '#02060c');
      skyGrad.addColorStop(1, '#0c1b29');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, horizonY);

      // 5. Draw Road Surface (Below Horizon)
      const roadGrad = ctx.createLinearGradient(0, horizonY, 0, height);
      roadGrad.addColorStop(0, '#0a1722');
      roadGrad.addColorStop(1, '#0e2436');
      ctx.fillStyle = roadGrad;
      ctx.fillRect(0, horizonY, width, height - horizonY);

      // 6. Draw Vanishing Point Teal Glow (#1D9E75)
      const glowRadius = 90 + Math.sin(pulseTime.current) * 20;
      const glowGrad = ctx.createRadialGradient(centerX, horizonY, 0, centerX, horizonY, glowRadius);
      glowGrad.addColorStop(0, 'rgba(29, 158, 117, 0.45)');
      glowGrad.addColorStop(0.4, 'rgba(29, 158, 117, 0.15)');
      glowGrad.addColorStop(1, 'rgba(29, 158, 117, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, horizonY, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // 7. Calculate perspective road metrics
      // Responsive road width at the bottom of the screen
      const bottomRoadWidth = Math.max(width * 0.55, 450);
      const bottomLeftX = centerX - bottomRoadWidth / 2;
      const bottomRightX = centerX + bottomRoadWidth / 2;

      // Left edge line
      ctx.beginPath();
      ctx.moveTo(centerX, horizonY);
      ctx.lineTo(bottomLeftX, height);
      ctx.strokeStyle = 'rgba(29, 158, 117, 0.7)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Right edge line
      ctx.beginPath();
      ctx.moveTo(centerX, horizonY);
      ctx.lineTo(bottomRightX, height);
      ctx.strokeStyle = 'rgba(29, 158, 117, 0.7)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Faint Outer Guidelines (Left and Right)
      ctx.strokeStyle = 'rgba(29, 158, 117, 0.15)';
      ctx.lineWidth = 1;

      // Far Left Guideline
      ctx.beginPath();
      ctx.moveTo(centerX, horizonY);
      ctx.lineTo(centerX - bottomRoadWidth * 0.8, height);
      ctx.stroke();

      // Far Right Guideline
      ctx.beginPath();
      ctx.moveTo(centerX, horizonY);
      ctx.lineTo(centerX + bottomRoadWidth * 0.8, height);
      ctx.stroke();

      // --- Draw MSEB street light poles (Both Sides) ---
      const maxPoles = 6;
      for (let i = 0; i < maxPoles; i++) {
        const fraction = (i + dashOffset.current) / maxPoles;
        if (fraction > 1.0) continue;
        if (fraction < 0.01) continue; // don't draw extremely close to vanishing point

        const t = Math.pow(fraction, 3.0);
        const y = horizonY + (height - horizonY) * t;

        // Position poles slightly outside the road guidelines
        const xOffset = (bottomRoadWidth * 0.62) * t;
        const xLeft = centerX - xOffset;
        const xRight = centerX + xOffset;

        const currentHeight = 170 * t; // max height of pole in pixels
        const poleWidth = 1 + t * 4.5;
        const armLength = currentHeight * 0.16;
        const armDrop = currentHeight * 0.08;

        // Lamp head coordinates (arm reaches out towards the center of the road)
        const lxLeft = xLeft + armLength;
        const lyLeft = y - currentHeight + armDrop;

        const lxRight = xRight - armLength;
        const lyRight = y - currentHeight + armDrop;

        // 1. Draw Spotlight Cones (drawn first so they render behind the pole outlines)
        // Left Light Cone
        const leftConeGrad = ctx.createLinearGradient(lxLeft, lyLeft, lxLeft, y);
        leftConeGrad.addColorStop(0, 'rgba(253, 224, 71, 0.28)');
        leftConeGrad.addColorStop(0.5, 'rgba(253, 224, 71, 0.12)');
        leftConeGrad.addColorStop(1, 'rgba(253, 224, 71, 0)');

        ctx.fillStyle = leftConeGrad;
        ctx.beginPath();
        ctx.moveTo(lxLeft, lyLeft);
        ctx.lineTo(lxLeft - currentHeight * 0.35, y);
        ctx.lineTo(lxLeft + currentHeight * 0.35, y);
        ctx.closePath();
        ctx.fill();

        // Right Light Cone
        const rightConeGrad = ctx.createLinearGradient(lxRight, lyRight, lxRight, y);
        rightConeGrad.addColorStop(0, 'rgba(253, 224, 71, 0.28)');
        rightConeGrad.addColorStop(0.5, 'rgba(253, 224, 71, 0.12)');
        rightConeGrad.addColorStop(1, 'rgba(253, 224, 71, 0)');

        ctx.fillStyle = rightConeGrad;
        ctx.beginPath();
        ctx.moveTo(lxRight, lyRight);
        ctx.lineTo(lxRight - currentHeight * 0.35, y);
        ctx.lineTo(lxRight + currentHeight * 0.35, y);
        ctx.closePath();
        ctx.fill();

        // 2. Draw Steel Utility Poles
        ctx.strokeStyle = '#475569'; // steel slate color
        ctx.lineWidth = poleWidth;
        ctx.lineCap = 'round';

        // Left Pole main structure
        ctx.beginPath();
        ctx.moveTo(xLeft, y);
        ctx.lineTo(xLeft, y - currentHeight); // vertical post
        ctx.quadraticCurveTo(xLeft, y - currentHeight - currentHeight * 0.05, lxLeft, lyLeft); // curved arm hanger
        ctx.stroke();

        // Right Pole main structure
        ctx.beginPath();
        ctx.moveTo(xRight, y);
        ctx.lineTo(xRight, y - currentHeight); // vertical post
        ctx.quadraticCurveTo(xRight, y - currentHeight - currentHeight * 0.05, lxRight, lyRight); // curved arm hanger
        ctx.stroke();

        // 3. Draw Bright Glowing Lamp Bulbs
        const bulbRadius = 1.5 + t * 4.5;
        
        // Left Bulb
        ctx.fillStyle = '#fef08a'; // bright yellow
        ctx.beginPath();
        ctx.arc(lxLeft, lyLeft, bulbRadius, 0, Math.PI * 2);
        ctx.fill();

        // Right Bulb
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(lxRight, lyRight, bulbRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 8. Draw Center Dashed Lane Line (Cubic Perspective math projection)
      // N is the number of prospective dashes
      const maxDashes = 15;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      
      for (let i = 0; i < maxDashes; i++) {
        // Map fraction from vanishing point to bottom of screen
        const fraction = (i + dashOffset.current) / maxDashes;
        if (fraction > 1.0) continue;

        // Cubic curve mappings create exponential perspective spacing & scaling
        const tStart = Math.pow(fraction, 3.5);
        const tEnd = Math.pow(fraction + 0.045, 3.5); // 0.045 represents raw dash length

        const yStart = horizonY + (height - horizonY) * tStart;
        const yEnd = horizonY + (height - horizonY) * tEnd;

        // Line gets slightly thicker as it approaches the screen bottom
        ctx.lineWidth = 1 + tStart * 3.5;

        ctx.beginPath();
        ctx.moveTo(centerX, yStart);
        ctx.lineTo(centerX, yEnd);
        ctx.stroke();
      }

      // 9. Update and draw oncoming perspective transport trucks with headlights
      trucksRef.current.forEach((truck) => {
        // Increment progress based on speed and speedMultiplier
        truck.progress += truck.speed * speedMultiplier.current;

        // Reset truck if it passes off the bottom of the screen
        if (truck.progress >= 1.0) {
          truck.progress = 0.0;
          // Randomize color, speed, and lane
          const lanes = ['left', 'right'];
          truck.lane = lanes[Math.floor(Math.random() * lanes.length)];
          const colors = ['#d97706', '#0284c7', '#059669', '#dc2626', '#475569'];
          truck.color = colors[Math.floor(Math.random() * colors.length)];
          truck.speed = 0.001 + Math.random() * 0.0015;
        }

        // Only draw if it's far enough from the horizon to be visible
        if (truck.progress < 0.05) return;

        // Perspective factor (matches the road perspective scale)
        const t_truck = Math.pow(truck.progress, 3.0);
        const y_truck = horizonY + (height - horizonY) * t_truck;

        // Calculate horizontal position based on lane (left or right side of center line)
        const xOffset = (bottomRoadWidth / 4.5) * t_truck;
        const centerX_lane = truck.lane === 'left' 
          ? centerX - xOffset 
          : centerX + xOffset;

        // Scale truck size in perspective (gets larger as it approaches screen bottom)
        const w_truck = 70 * t_truck;
        const h_truck = 76 * t_truck;

        const lxLeft = centerX_lane - w_truck * 0.32;
        const lyLeft = y_truck - h_truck * 0.22;

        const lxRight = centerX_lane + w_truck * 0.32;
        const lyRight = y_truck - h_truck * 0.22;

        // 1. Draw Headlight Beams (Spotlight Cones) first so they are behind the truck itself
        // Left headlight beam cone
        const leftBeam = ctx.createLinearGradient(lxLeft, lyLeft, lxLeft, height);
        leftBeam.addColorStop(0, 'rgba(254, 240, 138, 0.22)');
        leftBeam.addColorStop(0.4, 'rgba(254, 240, 138, 0.08)');
        leftBeam.addColorStop(1, 'rgba(254, 240, 138, 0)');

        ctx.fillStyle = leftBeam;
        ctx.beginPath();
        ctx.moveTo(lxLeft, lyLeft);
        ctx.lineTo(lxLeft - w_truck * 2.5, height);
        ctx.lineTo(lxLeft + w_truck * 1.0, height);
        ctx.closePath();
        ctx.fill();

        // Right headlight beam cone
        const rightBeam = ctx.createLinearGradient(lxRight, lyRight, lxRight, height);
        rightBeam.addColorStop(0, 'rgba(254, 240, 138, 0.22)');
        rightBeam.addColorStop(0.4, 'rgba(254, 240, 138, 0.08)');
        rightBeam.addColorStop(1, 'rgba(254, 240, 138, 0)');

        ctx.fillStyle = rightBeam;
        ctx.beginPath();
        ctx.moveTo(lxRight, lyRight);
        ctx.lineTo(lxRight - w_truck * 1.0, height);
        ctx.lineTo(lxRight + w_truck * 2.5, height);
        ctx.closePath();
        ctx.fill();

        // 2. Draw Oncoming Truck Cab body shape
        ctx.fillStyle = truck.color;
        ctx.beginPath();
        // Start bottom left
        ctx.moveTo(centerX_lane - w_truck * 0.45, y_truck - h_truck * 0.1);
        // Up to engine hood shoulder
        ctx.lineTo(centerX_lane - w_truck * 0.45, y_truck - h_truck * 0.45);
        // Inward to windshield base
        ctx.lineTo(centerX_lane - w_truck * 0.38, y_truck - h_truck * 0.5);
        // Up to top left roof
        ctx.lineTo(centerX_lane - w_truck * 0.36, y_truck - h_truck);
        // Across roof top
        ctx.lineTo(centerX_lane + w_truck * 0.36, y_truck - h_truck);
        // Down to top right windshield
        ctx.lineTo(centerX_lane + w_truck * 0.38, y_truck - h_truck * 0.5);
        // Out to right engine hood shoulder
        ctx.lineTo(centerX_lane + w_truck * 0.45, y_truck - h_truck * 0.45);
        // Down to bottom right
        ctx.lineTo(centerX_lane + w_truck * 0.45, y_truck - h_truck * 0.1);
        ctx.closePath();
        ctx.fill();

        // Stroke body for outline definition
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.lineWidth = 1 + t_truck * 1.2;
        ctx.stroke();

        // 3. Draw Dark Windshield Glass
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(centerX_lane - w_truck * 0.32, y_truck - h_truck * 0.88);
        ctx.lineTo(centerX_lane + w_truck * 0.32, y_truck - h_truck * 0.88);
        ctx.lineTo(centerX_lane + w_truck * 0.34, y_truck - h_truck * 0.54);
        ctx.lineTo(centerX_lane - w_truck * 0.34, y_truck - h_truck * 0.54);
        ctx.closePath();
        ctx.fill();

        // Center windshield divider panel line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1 + t_truck * 0.8;
        ctx.beginPath();
        ctx.moveTo(centerX_lane, y_truck - h_truck * 0.88);
        ctx.lineTo(centerX_lane, y_truck - h_truck * 0.54);
        ctx.stroke();

        // 4. Draw Side View Mirrors
        ctx.strokeStyle = '#090f16';
        ctx.lineWidth = 1 + t_truck * 1.5;
        // Left mirror bracket & mirror
        ctx.beginPath();
        ctx.moveTo(centerX_lane - w_truck * 0.36, y_truck - h_truck * 0.72);
        ctx.lineTo(centerX_lane - w_truck * 0.46, y_truck - h_truck * 0.68);
        ctx.lineTo(centerX_lane - w_truck * 0.46, y_truck - h_truck * 0.52);
        ctx.stroke();
        // Right mirror bracket & mirror
        ctx.beginPath();
        ctx.moveTo(centerX_lane + w_truck * 0.36, y_truck - h_truck * 0.72);
        ctx.lineTo(centerX_lane + w_truck * 0.46, y_truck - h_truck * 0.68);
        ctx.lineTo(centerX_lane + w_truck * 0.46, y_truck - h_truck * 0.52);
        ctx.stroke();

        // 5. Draw Chrome Front Grill
        const grillW = w_truck * 0.48;
        const grillH = h_truck * 0.3;
        const grillX = centerX_lane - grillW / 2;
        const grillY = y_truck - h_truck * 0.45;
        ctx.fillStyle = '#1e293b'; // grill frame base dark grey
        ctx.fillRect(grillX, grillY, grillW, grillH);

        // Chrome vertical bars
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1 + t_truck * 0.8;
        const barSpacing = grillW / 6;
        for (let j = 1; j < 6; j++) {
          ctx.beginPath();
          ctx.moveTo(grillX + j * barSpacing, grillY + 2);
          ctx.lineTo(grillX + j * barSpacing, grillY + grillH - 2);
          ctx.stroke();
        }

        // Draw grill frame outline
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.strokeRect(grillX, grillY, grillW, grillH);

        // 6. Draw Steel Front Bumper
        ctx.fillStyle = '#334155'; // steel grey
        ctx.fillRect(centerX_lane - w_truck * 0.47, y_truck - h_truck * 0.12, w_truck * 0.94, h_truck * 0.12);
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.strokeRect(centerX_lane - w_truck * 0.47, y_truck - h_truck * 0.12, w_truck * 0.94, h_truck * 0.12);

        // Draw Front Wheels visible under bumper (small black boxes)
        const wheelW = w_truck * 0.18;
        const wheelH = h_truck * 0.08;
        ctx.fillStyle = '#090f16';
        ctx.fillRect(centerX_lane - w_truck * 0.4, y_truck, wheelW, wheelH);
        ctx.fillRect(centerX_lane + w_truck * 0.4 - wheelW, y_truck, wheelW, wheelH);

        // 7. Draw Orange Roof Marker Lights (glowing)
        const markerR = 1 + t_truck * 2.0;
        ctx.fillStyle = '#f97316'; // orange glow
        
        const roofY = y_truck - h_truck * 0.96;
        const markerPositions = [
          centerX_lane - w_truck * 0.22,
          centerX_lane,
          centerX_lane + w_truck * 0.22
        ];
        
        markerPositions.forEach((pos) => {
          ctx.beginPath();
          ctx.arc(pos, roofY, markerR, 0, Math.PI * 2);
          ctx.fill();
        });

        // 8. Draw Headlights (Glowing Yellow/White cores with radial glows)
        const bulbR = 2.0 + t_truck * 4.5;
        
        // Left Headlight core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(lxLeft, lyLeft, bulbR, 0, Math.PI * 2);
        ctx.fill();

        // Left Headlight yellow bloom glow
        const leftBulbGlow = ctx.createRadialGradient(lxLeft, lyLeft, 0, lxLeft, lyLeft, bulbR * 4.0);
        leftBulbGlow.addColorStop(0, 'rgba(253, 224, 71, 0.8)');
        leftBulbGlow.addColorStop(0.3, 'rgba(253, 224, 71, 0.4)');
        leftBulbGlow.addColorStop(1, 'rgba(253, 224, 71, 0)');
        ctx.fillStyle = leftBulbGlow;
        ctx.beginPath();
        ctx.arc(lxLeft, lyLeft, bulbR * 4.0, 0, Math.PI * 2);
        ctx.fill();

        // Right Headlight core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(lxRight, lyRight, bulbR, 0, Math.PI * 2);
        ctx.fill();

        // Right Headlight yellow bloom glow
        const rightBulbGlow = ctx.createRadialGradient(lxRight, lyRight, 0, lxRight, lyRight, bulbR * 4.0);
        rightBulbGlow.addColorStop(0, 'rgba(253, 224, 71, 0.8)');
        rightBulbGlow.addColorStop(0.3, 'rgba(253, 224, 71, 0.4)');
        rightBulbGlow.addColorStop(1, 'rgba(253, 224, 71, 0)');
        ctx.fillStyle = rightBulbGlow;
        ctx.beginPath();
        ctx.arc(lxRight, lyRight, bulbR * 4.0, 0, Math.PI * 2);
        ctx.fill();
      });

      // Loop frame
      animationFrameId.current = requestAnimationFrame(render);
    };

    // Start loop
    animationFrameId.current = requestAnimationFrame(render);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
