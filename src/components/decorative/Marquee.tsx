import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";

const scroll = keyframes`
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
`;

const MarqueeWrapper = styled.div`
  width: 100%;
  overflow: hidden;
  background: linear-gradient(90deg, #ff69b4, #ff1493, #ff69b4);
  padding: 3px 0;
  position: relative;
  z-index: 2;
  border-bottom: 2px solid #d4578a;
  border-top: 2px solid #ffcce0;
`;

const MarqueeText = styled.div`
  display: inline-block;
  white-space: nowrap;
  animation: ${scroll} 20s linear infinite;
  color: white;
  font-size: 12px;
  font-weight: bold;
  text-shadow: 1px 1px 0 #b03060;
  letter-spacing: 1px;
`;

export function Marquee() {
  const [hitCount, setHitCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/hits")
      .then((r) => r.json())
      .then((d: { count: number }) => setHitCount(d.count))
      .catch(() => setHitCount(1337));
  }, []);

  const text = `~*~ welcome to zapy chan dot org!! ~*~ You are visitor #${hitCount ?? "..."} ~*~ Thanks for stopping by!! ~*~ (ﾉ◕ヮ◕)ﾉ*:・゚✧ ~*~ ♥ ♥ ♥ ~*~`;

  return (
    <MarqueeWrapper>
      <MarqueeText>{text}</MarqueeText>
    </MarqueeWrapper>
  );
}
