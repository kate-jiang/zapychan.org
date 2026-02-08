import { useEffect, useRef, useCallback } from "react";
import styled from "styled-components";
import { useIsMobile } from "../../hooks/useIsMobile";

const TrailContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 99998;
  overflow: hidden;
`;

interface CursorTrailProps {
  isEvil?: boolean;
}

const TRAIL_CHARS = ["✦", "♥", "✧", "⋆", "✿", "♡", "˚", "⊹"];
const EVIL_TRAIL_CHARS = ["✦", "◈", "✧", "⊗", "⬥", "☆", "†", "⛧"];

const TRAIL_COLORS = [
  "#ff69b4", // hot pink
  "#ff1493", // deep pink
  "#ff85cb", // light hot pink
  "#ff44aa", // vivid pink
  "#ffb6c1", // light pink
  "#f0f", // magenta
  "#ff6ec7", // neon pink
  "#e84de0", // pink-purple
];

const EVIL_TRAIL_COLORS = [
  "#cc3366", // dark rose
  "#8b2252", // bruised pink
  "#a0204a", // deep crimson-pink
  "#660033", // dark wine
  "#993355", // muted rose
  "#bb1155", // blood pink
];

export function CursorTrail({ isEvil }: CursorTrailProps) {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const throttleRef = useRef(0);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const now = Date.now();
      if (now - throttleRef.current < 25) return; // throttle to ~40fps
      throttleRef.current = now;

      const container = containerRef.current;
      if (!container) return;

      const chars = isEvil ? EVIL_TRAIL_CHARS : TRAIL_CHARS;
      const colors = isEvil ? EVIL_TRAIL_COLORS : TRAIL_COLORS;
      const count = 2 + Math.floor(Math.random() * 2); // 2-3 particles per tick
      for (let i = 0; i < count; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)] ?? colors[0];
        const size = 6 + Math.random() * 8;
        const offsetX = (Math.random() - 0.5) * 28;
        const offsetY = (Math.random() - 0.5) * 28;
        const particle = document.createElement("div");
        particle.textContent = chars[Math.floor(Math.random() * chars.length)] ?? "✦";
        particle.style.cssText = `
          position: fixed;
          left: ${e.clientX + offsetX}px;
          top: ${e.clientY + offsetY}px;
          font-size: ${size}px;
          pointer-events: none;
          animation: cursorFade 0.6s ease-out forwards;
          color: ${color};
          text-shadow: 0 0 6px ${color}, 0 0 12px ${color}88;
          filter: saturate(1.4) brightness(1.15);
          z-index: 99998;
        `;
        container.appendChild(particle);
        setTimeout(() => particle.remove(), 600);
      }
    },
    [isEvil],
  );

  useEffect(() => {
    if (isMobile) return;
    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [isMobile, handleMouseMove]);

  if (isMobile) return null;

  return (
    <>
      <style>{`
        @keyframes cursorFade {
          0% { opacity: 1; transform: scale(1) translate(0, 0); }
          40% { opacity: 0.8; transform: scale(1.1) translate(0, -4px); }
          100% { opacity: 0; transform: scale(0.3) translate(0, -14px); }
        }
      `}</style>
      <TrailContainer ref={containerRef} />
    </>
  );
}
