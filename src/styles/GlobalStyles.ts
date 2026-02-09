import { createGlobalStyle } from "styled-components";
import { styleReset, createScrollbars } from "react95";

export const GlobalStyles = createGlobalStyle<{ $isEvil?: boolean }>`
  ${styleReset}

  @font-face {
    font-family: 'ms_sans_serif';
    src: url('https://unpkg.com/react95@4.0.0/dist/fonts/ms_sans_serif.woff2') format('woff2');
    font-weight: 400;
    font-style: normal;
  }

  @font-face {
    font-family: 'ms_sans_serif';
    src: url('https://unpkg.com/react95@4.0.0/dist/fonts/ms_sans_serif_bold.woff2') format('woff2');
    font-weight: 700;
    font-style: normal;
  }

  * {
    box-sizing: border-box;
  }

  html, body, #root {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  body {
    font-family: 'ms_sans_serif', 'Tahoma', sans-serif;
    font-size: 13px;
    color: ${({ $isEvil }) => ($isEvil ? "#4a0e2a" : "#8b0045")};
  }

  /* Windows 95 scrollbar styling via react95 */
  ${createScrollbars()}

  /* Evil mode scanline overlay - applied via pseudo-element on body */
  ${({ $isEvil }) =>
    $isEvil
      ? `
    body::after {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 99999;
      background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(75, 14, 42, 0.03) 2px,
        rgba(75, 14, 42, 0.03) 4px
      );
      animation: scanlineFlicker 8s infinite;
    }

    @keyframes scanlineFlicker {
      0%, 94%, 100% { opacity: 1; }
      95% { opacity: 0.6; }
      96% { opacity: 1; }
      97% { opacity: 0.8; }
    }
  `
      : ""}
`;
