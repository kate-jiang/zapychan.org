import { useMemo } from "react";
import styled, { keyframes } from "styled-components";

const twinkle = keyframes`
  0%, 100% { opacity: 0; transform: scale(0.5) rotate(90deg); }
  50% { opacity: 1; transform: scale(1) rotate(-15deg); }
`;

const SparkleContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
`;

const SPARKLE_COLOR = "#fffef0";

const Sparkle = styled.div<{
  $x: number;
  $y: number;
  $delay: number;
  $duration: number;
  $size: number;
  $color: string;
}>`
  position: absolute;
  left: ${({ $x }) => $x}%;
  top: ${({ $y }) => $y}%;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  opacity: 0;
  animation: ${twinkle} ${({ $duration }) => $duration}s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay}s;
  font-size: ${({ $size }) => $size}px;
  line-height: 1;
  color: ${({ $color }) => $color};
  text-shadow: 0 0 12px ${({ $color }) => $color}, 0 0 30px ${({ $color }) => $color}, 0 0 60px ${({ $color }) => $color};
  filter: brightness(1.6);
`;

interface SparklesProps {
  count?: number;
}

export function Sparkles({ count = 100 }: SparklesProps) {
  const sparkles = useMemo(() => {
    const items = [];
    const chars = ["✦", "✧", "♥", "✿", "⋆", "☆"];
    for (let i = 0; i < count; i++) {
      items.push({
        id: i,
        x: Math.random() * 95,
        y: Math.random() * 90,
        delay: Math.random() * 6,
        duration: 2 + Math.random() * 4,
        size: 10 + Math.random() * 14,
        char: chars[i % chars.length],
        color: SPARKLE_COLOR,
      });
    }
    return items;
  }, [count]);

  return (
    <SparkleContainer>
      {sparkles.map((s) => (
        <Sparkle
          key={s.id}
          $x={s.x}
          $y={s.y}
          $delay={s.delay}
          $duration={s.duration}
          $size={s.size}
          $color={s.color}
        >
          {s.char}
        </Sparkle>
      ))}
    </SparkleContainer>
  );
}
