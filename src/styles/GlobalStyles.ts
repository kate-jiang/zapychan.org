import { createGlobalStyle } from "styled-components";
import { styleReset } from "react95";

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

  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 16px;
    height: 16px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ $isEvil }) => ($isEvil ? "#c98aa4" : "#ffe4f0")};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ $isEvil }) => ($isEvil ? "#8b5070" : "#ff69b4")};
    border: 2px solid ${({ $isEvil }) => ($isEvil ? "#6b2040" : "#d4578a")};
  }

  ::-webkit-scrollbar-button {
    background: ${({ $isEvil }) => ($isEvil ? "#c98aa4" : "#ffb6c1")};
    border: 1px outset ${({ $isEvil }) => ($isEvil ? "#8b5070" : "#ff69b4")};
  }

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
