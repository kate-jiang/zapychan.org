import { useRef, useState, useCallback, useEffect } from "react";
import styled from "styled-components";
import { Button, Toolbar, MenuList, MenuListItem, Separator, Frame } from "react95";
import { useIsMobile } from "../../hooks/useIsMobile";
import {
  type PaintTool,
  MS_PAINT_COLORS,
  BRUSH_SIZES,
} from "./paintConstants";

interface MSPaintWindowProps {
  windowId: string;
  props?: Record<string, unknown>;
}

// --- Styled Components ---

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  margin: -8px;
  user-select: none;
  -webkit-user-select: none;
`;

const MenuBar = styled(Toolbar)`
  flex-shrink: 0;
  padding: 0 4px;
  gap: 2px;
  min-height: 24px;
`;

const MainArea = styled.div<{ $isMobile: boolean }>`
  display: flex;
  flex-direction: ${({ $isMobile }) => ($isMobile ? "column" : "row")};
  flex: 1;
  min-height: 0;
`;

const ToolPanel = styled.div<{ $isMobile: boolean }>`
  ${({ $isMobile, theme }) =>
    $isMobile
      ? `
    display: flex;
    flex-direction: row;
    flex-shrink: 0;
    overflow-x: auto;
    padding: 2px 4px;
    gap: 2px;
    border-bottom: 2px solid ${theme.borderDark};
  `
      : `
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px;
    padding: 4px 8px 4px 4px;
    width: 64px;
    flex-shrink: 0;
    align-content: start;
    border-right: 2px solid ${theme.borderDark};
  `}
`;

const ToolBtn = styled.button<{ $selected?: boolean }>`
  width: 24px;
  height: 24px;
  min-width: 24px;
  padding: 0;
  border: none;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
  cursor: pointer;
  color: ${({ theme }) => theme.materialText};
  background: ${({ $selected, theme }) => ($selected ? theme.flatLight : theme.material)};
  box-shadow: ${({ $selected, theme }) =>
    $selected
      ? `inset 1px 1px 0 0 ${theme.borderDark}, inset -1px -1px 0 0 ${theme.borderLightest}`
      : `inset -1px -1px 0 0 ${theme.borderDark}, inset 1px 1px 0 0 ${theme.borderLightest}`};

  &:hover {
    background: ${({ theme }) => theme.flatLight};
  }
`;

const BrushSizeSelector = styled.div<{ $isMobile: boolean }>`
  ${({ $isMobile, theme }) =>
    $isMobile
      ? `
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 2px;
    margin-left: 4px;
    padding-left: 4px;
    border-left: 1px solid ${theme.borderDark};
  `
      : `
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    margin-top: 8px;
    padding-top: 4px;
    border-top: 1px solid ${theme.borderDark};
  `}
`;

const BrushDotBtn = styled(Button)`
  width: 20px;
  height: 20px;
  min-width: 20px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BrushDotInner = styled.span<{ $size: number }>`
  display: block;
  width: ${({ $size }) => Math.min($size + 1, 12)}px;
  height: ${({ $size }) => Math.min($size + 1, 12)}px;
  border-radius: 50%;
  background: currentColor;
`;

const CanvasArea = styled(Frame)`
  flex: 1;
  min-height: 0;
  min-width: 0;
  position: relative;
  overflow: hidden;
`;

const CanvasEl = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  touch-action: none;
`;

const TextInputOverlay = styled.textarea<{ $fontSize: number }>`
  position: absolute;
  z-index: 3;
  background: transparent;
  border: 1px dashed #000;
  outline: none;
  resize: none;
  font-family: Arial, sans-serif;
  font-size: ${({ $fontSize }) => $fontSize}px;
  line-height: 1.2;
  padding: 2px;
  min-width: 20px;
  min-height: ${({ $fontSize }) => $fontSize * 1.2 + 4}px;
  overflow: hidden;
  color: inherit;
`;

const BottomBar = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
`;

const ColorPalette = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 4px;
  gap: 4px;
`;

const ActiveColors = styled.div`
  position: relative;
  width: 28px;
  height: 28px;
  margin-right: 4px;
  flex-shrink: 0;
  cursor: pointer;
`;

const FgSwatch = styled(Frame)<{ $color: string }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 18px;
  height: 18px;
  background: ${({ $color }) => $color};
  z-index: 1;
`;

const BgSwatch = styled(Frame)<{ $color: string }>`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 18px;
  height: 18px;
  background: ${({ $color }) => $color};
`;

const PaletteGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(14, 16px);
  grid-template-rows: 16px 16px;
  gap: 1px;
`;

const PaletteColor = styled.button<{ $color: string }>`
  width: 16px;
  height: 16px;
  padding: 0;
  background: ${({ $color }) => $color};
  border: 1px solid ${({ theme }) => theme.borderDark};
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.borderLightest};
  }
`;

const StatusBarFrame = styled(Frame)`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 2px 8px;
  font-size: 11px;
  gap: 16px;
  min-height: 20px;
`;

const DropdownMenu = styled(MenuList)`
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 100;
  min-width: 140px;
  font-size: 12px;
`;

const MenuBarItem = styled.div`
  position: relative;
  display: inline-block;
`;

// --- Tool icons (emoji stand-ins, compact) ---

const TOOL_ICONS: Record<PaintTool, React.ReactNode> = {
  pencil: <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"/></svg>,
  eraser: <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M8.086 2.207a2 2 0 0 1 2.828 0l3.879 3.879a2 2 0 0 1 0 2.828l-5.5 5.5A2 2 0 0 1 7.879 15H5.12a2 2 0 0 1-1.414-.586l-2.5-2.5a2 2 0 0 1 0-2.828zm.66 11.34L3.453 8.254 1.914 9.793a1 1 0 0 0 0 1.414l2.5 2.5a1 1 0 0 0 .707.293H7.88a1 1 0 0 0 .707-.293z"/></svg>,
  fill: <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M6.192 2.78c-.458-.677-.927-1.248-1.35-1.643a3 3 0 0 0-.71-.515c-.217-.104-.56-.205-.882-.02-.367.213-.427.63-.43.896-.003.304.064.664.173 1.044.196.687.556 1.528 1.035 2.402L.752 8.22c-.277.277-.269.656-.218.918.055.283.187.593.36.903.348.627.92 1.361 1.626 2.068.707.707 1.441 1.278 2.068 1.626.31.173.62.305.903.36.262.05.64.059.918-.218l5.615-5.615c.118.257.092.512.05.939-.03.292-.068.665-.073 1.176v.123h.003a1 1 0 0 0 1.993 0H14v-.057a1 1 0 0 0-.004-.117c-.055-1.25-.7-2.738-1.86-3.494a4 4 0 0 0-.211-.434c-.349-.626-.92-1.36-1.627-2.067S8.857 3.052 8.23 2.704c-.31-.172-.62-.304-.903-.36-.262-.05-.64-.058-.918.219zM4.16 1.867c.381.356.844.922 1.311 1.632l-.704.705c-.382-.727-.66-1.402-.813-1.938a3.3 3.3 0 0 1-.131-.673q.137.09.337.274m.394 3.965c.54.852 1.107 1.567 1.607 2.033a.5.5 0 1 0 .682-.732c-.453-.422-1.017-1.136-1.564-2.027l1.088-1.088q.081.181.183.365c.349.627.92 1.361 1.627 2.068.706.707 1.44 1.278 2.068 1.626q.183.103.365.183l-4.861 4.862-.068-.01c-.137-.027-.342-.104-.608-.252-.524-.292-1.186-.8-1.846-1.46s-1.168-1.32-1.46-1.846c-.147-.265-.225-.47-.251-.607l-.01-.068zm2.87-1.935a2.4 2.4 0 0 1-.241-.561c.135.033.324.11.562.241.524.292 1.186.8 1.846 1.46.45.45.83.901 1.118 1.31a3.5 3.5 0 0 0-1.066.091 11 11 0 0 1-.76-.694c-.66-.66-1.167-1.322-1.458-1.847z"/></svg>,
  line: "╱",
  rectangle: "▭",
  ellipse: "◯",
  colorPicker: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20.477 3.511c-1.171-1.172-3.071-1.172-4.243 0l-1.533 1.533c-1.112-.535-2.487-.341-3.41.581l-.714.714c-.781.781-.781 2.048 0 2.829l-6.485 6.485a2.99 2.99 0 0 0-.878 2.121v1.8c0 .663.537 1.2 1.2 1.2h1.8a2.99 2.99 0 0 0 2.121-.879l6.486-6.485c.78.781 2.047.781 2.828 0l.714-.714c.922-.923 1.116-2.297.581-3.41l1.533-1.533c1.171-1.171 1.171-3.071 0-4.243zM5.507 17.068l6.485-6.486 1.414 1.414-6.485 6.486a.997.997 0 0 1-.707.293h-1v-1c0-.265.105-.52.293-.707z"/></svg>,
  text: "A",
};

const TOOL_LABELS: Record<PaintTool, string> = {
  pencil: "Pencil",
  eraser: "Eraser",
  fill: "Fill",
  line: "Line",
  rectangle: "Rectangle",
  ellipse: "Ellipse",
  colorPicker: "Color Picker",
  text: "Text",
};


const ALL_TOOLS: PaintTool[] = [
  "pencil",
  "eraser",
  "fill",
  "line",
  "rectangle",
  "ellipse",
  "colorPicker",
  "text",
];

const TEXT_SIZE_MULTIPLIER = 6;

// --- Flood fill (iterative, no recursion) ---

function floodFill(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fillColor: string,
) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  // Parse fill color
  const tmp = document.createElement("canvas");
  tmp.width = tmp.height = 1;
  const tmpCtx = tmp.getContext("2d")!;
  tmpCtx.fillStyle = fillColor;
  tmpCtx.fillRect(0, 0, 1, 1);
  const fc = tmpCtx.getImageData(0, 0, 1, 1).data;

  const sx = Math.floor(startX);
  const sy = Math.floor(startY);
  if (sx < 0 || sx >= w || sy < 0 || sy >= h) return;

  const startIdx = (sy * w + sx) * 4;
  const sr = data[startIdx]!;
  const sg = data[startIdx + 1]!;
  const sb = data[startIdx + 2]!;
  const sa = data[startIdx + 3]!;

  // Don't fill if target === fill color
  if (sr === fc[0] && sg === fc[1] && sb === fc[2] && sa === fc[3]) return;

  const match = (i: number) =>
    data[i] === sr &&
    data[i + 1] === sg &&
    data[i + 2] === sb &&
    data[i + 3] === sa;

  // Scanline flood fill
  const visited = new Uint8Array(w * h);
  const stack = [sx, sy];
  while (stack.length > 0) {
    const y = stack.pop()!;
    let x = stack.pop()!;
    if (y < 0 || y >= h) continue;

    // Walk left to find the start of this scanline segment
    while (x > 0 && match((y * w + x - 1) * 4) && !visited[y * w + x - 1]) {
      x--;
    }

    // Fill rightward, pushing neighbors above and below
    let abovePushed = false;
    let belowPushed = false;
    while (x < w) {
      const pi = y * w + x;
      const idx = pi * 4;
      if (visited[pi] || !match(idx)) break;

      visited[pi] = 1;
      data[idx] = fc[0]!;
      data[idx + 1] = fc[1]!;
      data[idx + 2] = fc[2]!;
      data[idx + 3] = fc[3]!;

      // Check pixel above
      if (y > 0) {
        const aboveMatch = match((pi - w) * 4) && !visited[pi - w];
        if (aboveMatch && !abovePushed) {
          stack.push(x, y - 1);
          abovePushed = true;
        } else if (!aboveMatch) {
          abovePushed = false;
        }
      }

      // Check pixel below
      if (y < h - 1) {
        const belowMatch = match((pi + w) * 4) && !visited[pi + w];
        if (belowMatch && !belowPushed) {
          stack.push(x, y + 1);
          belowPushed = true;
        } else if (!belowMatch) {
          belowPushed = false;
        }
      }

      x++;
    }
  }

  // Edge cleanup: fill anti-aliased fringe pixels that border the filled region.
  // Any non-filled pixel with ≥2 filled neighbors gets filled too.
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const pi = y * w + x;
      if (visited[pi]) continue;
      let filledNeighbors = 0;
      if (x > 0 && visited[pi - 1]) filledNeighbors++;
      if (x < w - 1 && visited[pi + 1]) filledNeighbors++;
      if (y > 0 && visited[pi - w]) filledNeighbors++;
      if (y < h - 1 && visited[pi + w]) filledNeighbors++;
      if (filledNeighbors >= 2) {
        const idx = pi * 4;
        data[idx] = fc[0]!;
        data[idx + 1] = fc[1]!;
        data[idx + 2] = fc[2]!;
        data[idx + 3] = fc[3]!;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

// --- Main Component ---

export function MSPaintWindow({ windowId: _windowId }: MSPaintWindowProps) {
  const isMobile = useIsMobile();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [tool, setTool] = useState<PaintTool>("pencil");
  const [brushSize, setBrushSize] = useState(isMobile ? 3 : 2);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [textInput, setTextInput] = useState<{
    visible: boolean;
    x: number;
    y: number;
    value: string;
  } | null>(null);
  const textInputRef = useRef(textInput);
  textInputRef.current = textInput;

  // Undo stack
  const undoStackRef = useRef<ImageData[]>([]);
  const MAX_UNDO = 20;

  // Drawing state refs
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef({ x: 0, y: 0 });

  // Initialize canvas with white background
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    undoStackRef.current = [];
  }, []);

  // Resize canvas to match container
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!container || !canvas || !overlay) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const w = Math.floor(width);
        const h = Math.floor(height);
        if (w <= 0 || h <= 0) continue;

        // Save current drawing
        const ctx = canvas.getContext("2d");
        let savedData: ImageData | null = null;
        if (ctx && canvas.width > 0 && canvas.height > 0) {
          savedData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }

        canvas.width = w;
        canvas.height = h;
        overlay.width = w;
        overlay.height = h;

        // Restore: fill white first, then put saved data back
        if (ctx) {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, w, h);
          if (savedData) {
            ctx.putImageData(savedData, 0, 0);
          }
        }
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // First-time init
  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  const saveUndoState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStackRef.current.push(data);
    if (undoStackRef.current.length > MAX_UNDO) {
      undoStackRef.current.shift();
    }
  }, []);

  const commitText = useCallback(
    (input: { x: number; y: number; value: string } | null) => {
      if (!input || !input.value.trim()) {
        setTextInput(null);
        return;
      }
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      saveUndoState();
      const fontSize = brushSize * TEXT_SIZE_MULTIPLIER;
      ctx.font = `${fontSize}px Arial, sans-serif`;
      ctx.fillStyle = fgColor;
      ctx.textBaseline = "top";
      const lines = input.value.split("\n");
      for (const [i, line] of lines.entries()) {
        ctx.fillText(line, input.x, input.y + i * fontSize * 1.2);
      }
      setTextInput(null);
    },
    [brushSize, fgColor, saveUndoState],
  );

  const undo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const stack = undoStackRef.current;
    if (stack.length === 0) return;
    const data = stack.pop()!;
    ctx.putImageData(data, 0, 0);
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo]);

  // Commit text input when switching away from text tool
  useEffect(() => {
    if (tool !== "text" && textInputRef.current) {
      commitText(textInputRef.current);
    }
  }, [tool, commitText]);

  const getCanvasCoords = useCallback(
    (e: React.PointerEvent): { x: number; y: number } => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    [],
  );

  const getDrawColor = useCallback(
    (e: React.PointerEvent) => {
      // Right click = bg color, left click = fg color
      if (tool === "eraser") return bgColor;
      return e.button === 2 ? bgColor : fgColor;
    },
    [tool, fgColor, bgColor],
  );

  const clearOverlay = useCallback(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, overlay.width, overlay.height);
  }, []);

  // --- Pointer handlers ---

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);

      const pos = getCanvasCoords(e);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      isDrawingRef.current = true;
      lastPosRef.current = pos;
      startPosRef.current = pos;

      const color = getDrawColor(e);

      if (tool === "pencil" || tool === "eraser") {
        saveUndoState();
        ctx.strokeStyle = color;
        ctx.lineWidth = tool === "eraser" ? brushSize * 3 : brushSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        // Draw a dot for single click
        ctx.lineTo(pos.x + 0.1, pos.y + 0.1);
        ctx.stroke();
      } else if (tool === "fill") {
        saveUndoState();
        floodFill(ctx, pos.x, pos.y, color);
        isDrawingRef.current = false;
      } else if (tool === "colorPicker") {
        const pixel = ctx.getImageData(Math.floor(pos.x), Math.floor(pos.y), 1, 1).data;
        const hex = `#${(pixel[0] ?? 0).toString(16).padStart(2, "0")}${(pixel[1] ?? 0).toString(16).padStart(2, "0")}${(pixel[2] ?? 0).toString(16).padStart(2, "0")}`.toUpperCase();
        if (e.button === 2) {
          setBgColor(hex);
        } else {
          setFgColor(hex);
        }
        isDrawingRef.current = false;
      } else if (tool === "text") {
        // Commit existing text first if it has content
        if (textInputRef.current && textInputRef.current.value.trim()) {
          commitText(textInputRef.current);
        }
        setTextInput({ visible: true, x: pos.x, y: pos.y, value: "" });
        isDrawingRef.current = false;
      } else if (tool === "line" || tool === "rectangle" || tool === "ellipse") {
        saveUndoState();
      }
    },
    [tool, brushSize, getCanvasCoords, getDrawColor, saveUndoState, commitText],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const pos = getCanvasCoords(e);
      setMousePos({ x: Math.floor(pos.x), y: Math.floor(pos.y) });

      if (!isDrawingRef.current) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (tool === "pencil" || tool === "eraser") {
        const color = tool === "eraser" ? bgColor : (e.buttons === 2 ? bgColor : fgColor);
        ctx.strokeStyle = color;
        ctx.lineWidth = tool === "eraser" ? brushSize * 3 : brushSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        lastPosRef.current = pos;
      } else if (tool === "line" || tool === "rectangle" || tool === "ellipse") {
        // Draw preview on overlay
        const overlay = overlayRef.current;
        if (!overlay) return;
        const oCtx = overlay.getContext("2d");
        if (!oCtx) return;
        oCtx.clearRect(0, 0, overlay.width, overlay.height);

        const color = e.buttons === 2 ? bgColor : fgColor;
        oCtx.strokeStyle = color;
        oCtx.lineWidth = brushSize;
        oCtx.lineCap = "round";

        const start = startPosRef.current;

        if (tool === "line") {
          oCtx.beginPath();
          oCtx.moveTo(start.x, start.y);
          oCtx.lineTo(pos.x, pos.y);
          oCtx.stroke();
        } else if (tool === "rectangle") {
          oCtx.strokeRect(
            start.x,
            start.y,
            pos.x - start.x,
            pos.y - start.y,
          );
        } else if (tool === "ellipse") {
          const cx = (start.x + pos.x) / 2;
          const cy = (start.y + pos.y) / 2;
          const rx = Math.abs(pos.x - start.x) / 2;
          const ry = Math.abs(pos.y - start.y) / 2;
          oCtx.beginPath();
          oCtx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          oCtx.stroke();
        }
      }
    },
    [tool, brushSize, fgColor, bgColor, getCanvasCoords],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (tool === "line" || tool === "rectangle" || tool === "ellipse") {
        // Commit shape from overlay to main canvas
        const pos = getCanvasCoords(e);
        const color = e.button === 2 ? bgColor : fgColor;
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";

        const start = startPosRef.current;

        if (tool === "line") {
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(pos.x, pos.y);
          ctx.stroke();
        } else if (tool === "rectangle") {
          ctx.strokeRect(
            start.x,
            start.y,
            pos.x - start.x,
            pos.y - start.y,
          );
        } else if (tool === "ellipse") {
          const cx = (start.x + pos.x) / 2;
          const cy = (start.y + pos.y) / 2;
          const rx = Math.abs(pos.x - start.x) / 2;
          const ry = Math.abs(pos.y - start.y) / 2;
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        clearOverlay();
      }
    },
    [tool, brushSize, fgColor, bgColor, getCanvasCoords, clearOverlay],
  );

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  // --- Menu actions ---

  const handleNew = useCallback(() => {
    saveUndoState();
    initCanvas();
    setOpenMenu(null);
  }, [saveUndoState, initCanvas]);

  const handleSave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "masterpiece.png";
    a.click();
    setOpenMenu(null);
  }, []);

  const handleUndo = useCallback(() => {
    undo();
    setOpenMenu(null);
  }, [undo]);

  // --- Image menu handlers ---

  const handleFlipHorizontal = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    saveUndoState();
    const tmp = document.createElement("canvas");
    tmp.width = canvas.width;
    tmp.height = canvas.height;
    const tCtx = tmp.getContext("2d")!;
    tCtx.scale(-1, 1);
    tCtx.drawImage(canvas, -canvas.width, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tmp, 0, 0);
    setOpenMenu(null);
  }, [saveUndoState]);

  const handleFlipVertical = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    saveUndoState();
    const tmp = document.createElement("canvas");
    tmp.width = canvas.width;
    tmp.height = canvas.height;
    const tCtx = tmp.getContext("2d")!;
    tCtx.scale(1, -1);
    tCtx.drawImage(canvas, 0, -canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tmp, 0, 0);
    setOpenMenu(null);
  }, [saveUndoState]);

  const handleRotate90CW = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    saveUndoState();
    const w = canvas.width;
    const h = canvas.height;
    const tmp = document.createElement("canvas");
    tmp.width = w;
    tmp.height = h;
    const tCtx = tmp.getContext("2d")!;
    tCtx.fillStyle = "#FFFFFF";
    tCtx.fillRect(0, 0, w, h);
    tCtx.translate(w / 2, h / 2);
    tCtx.rotate(Math.PI / 2);
    tCtx.drawImage(canvas, -w / 2, -h / 2);
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(tmp, 0, 0);
    setOpenMenu(null);
  }, [saveUndoState]);

  const handleRotate180 = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    saveUndoState();
    const tmp = document.createElement("canvas");
    tmp.width = canvas.width;
    tmp.height = canvas.height;
    const tCtx = tmp.getContext("2d")!;
    tCtx.scale(-1, -1);
    tCtx.drawImage(canvas, -canvas.width, -canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tmp, 0, 0);
    setOpenMenu(null);
  }, [saveUndoState]);

  const handleInvertColors = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    saveUndoState();
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i]!;
      data[i + 1] = 255 - data[i + 1]!;
      data[i + 2] = 255 - data[i + 2]!;
    }
    ctx.putImageData(imageData, 0, 0);
    setOpenMenu(null);
  }, [saveUndoState]);

  // Close menu on click outside
  useEffect(() => {
    if (!openMenu) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-menu]")) {
        setOpenMenu(null);
      }
    };
    // Delay to avoid closing immediately on the click that opened it
    const timer = setTimeout(() => {
      document.addEventListener("click", handler);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handler);
    };
  }, [openMenu]);

  return (
    <Wrapper>
      {/* Menu Bar */}
      <MenuBar>
        <MenuBarItem data-menu>
          <Button
            variant="thin"
            size="sm"
            active={openMenu === "file"}
            onClick={() => setOpenMenu(openMenu === "file" ? null : "file")}
          >
            File
          </Button>
          {openMenu === "file" && (
            <DropdownMenu>
              <MenuListItem size="sm" onClick={handleNew}>New</MenuListItem>
              <Separator />
              <MenuListItem size="sm" onClick={handleSave}>Save As PNG</MenuListItem>
            </DropdownMenu>
          )}
        </MenuBarItem>
        <MenuBarItem data-menu>
          <Button
            variant="thin"
            size="sm"
            active={openMenu === "edit"}
            onClick={() => setOpenMenu(openMenu === "edit" ? null : "edit")}
          >
            Edit
          </Button>
          {openMenu === "edit" && (
            <DropdownMenu>
              <MenuListItem size="sm" onClick={handleUndo}>
                Undo{" "}
                <span style={{ opacity: 0.6, fontSize: 10 }}>Ctrl+Z</span>
              </MenuListItem>
            </DropdownMenu>
          )}
        </MenuBarItem>
        <MenuBarItem data-menu>
          <Button
            variant="thin"
            size="sm"
            active={openMenu === "image"}
            onClick={() => setOpenMenu(openMenu === "image" ? null : "image")}
          >
            Image
          </Button>
          {openMenu === "image" && (
            <DropdownMenu>
              <MenuListItem size="sm" onClick={handleFlipHorizontal}>Flip Horizontal</MenuListItem>
              <MenuListItem size="sm" onClick={handleFlipVertical}>Flip Vertical</MenuListItem>
              <Separator />
              <MenuListItem size="sm" onClick={handleRotate90CW}>Rotate 90° CW</MenuListItem>
              <MenuListItem size="sm" onClick={handleRotate180}>Rotate 180°</MenuListItem>
              <Separator />
              <MenuListItem size="sm" onClick={handleInvertColors}>Invert Colors</MenuListItem>
            </DropdownMenu>
          )}
        </MenuBarItem>
      </MenuBar>

      {/* Main area: tools + canvas */}
      <MainArea $isMobile={isMobile}>
        <ToolPanel $isMobile={isMobile}>
          {ALL_TOOLS.map((t) => (
            <ToolBtn
              key={t}
              $selected={tool === t}
              onClick={() => setTool(t)}
              title={TOOL_LABELS[t]}
            >
              {TOOL_ICONS[t]}
            </ToolBtn>
          ))}
          <BrushSizeSelector $isMobile={isMobile}>
            {BRUSH_SIZES.map((size) => (
              <BrushDotBtn
                key={size}
                square
                active={brushSize === size}
                onClick={() => setBrushSize(size)}
                title={`${size}px`}
              >
                <BrushDotInner $size={size} />
              </BrushDotBtn>
            ))}
          </BrushSizeSelector>
        </ToolPanel>

        <CanvasArea variant="field" ref={containerRef}>
          <CanvasEl ref={canvasRef} style={{ zIndex: 1 }} />
          <CanvasEl
            ref={overlayRef}
            style={{ zIndex: 2 }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onContextMenu={handleContextMenu}
          />
          {textInput?.visible && (
            <TextInputOverlay
              $fontSize={brushSize * TEXT_SIZE_MULTIPLIER}
              style={{
                left: textInput.x,
                top: textInput.y,
                color: fgColor,
              }}
              value={textInput.value}
              autoFocus
              onChange={(e) =>
                setTextInput((prev) =>
                  prev ? { ...prev, value: e.target.value } : null,
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  commitText(textInput);
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  setTextInput(null);
                }
              }}
              onBlur={() => commitText(textInput)}
            />
          )}
        </CanvasArea>
      </MainArea>

      {/* Bottom: palette + status */}
      <BottomBar>
        <ColorPalette>
          <ActiveColors onClick={() => { setFgColor(bgColor); setBgColor(fgColor); }}>
            <FgSwatch variant="field" $color={fgColor} title={`Foreground: ${fgColor}`} />
            <BgSwatch variant="field" $color={bgColor} title={`Background: ${bgColor}`} />
          </ActiveColors>
          <PaletteGrid>
            {MS_PAINT_COLORS.map((color) => (
              <PaletteColor
                key={color}
                $color={color}
                title={color}
                onClick={() => setFgColor(color)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setBgColor(color);
                }}
              />
            ))}
          </PaletteGrid>
        </ColorPalette>
        <StatusBarFrame variant="status">
          <span>{TOOL_LABELS[tool]}</span>
          <span>
            {mousePos.x}, {mousePos.y}
          </span>
        </StatusBarFrame>
      </BottomBar>
    </Wrapper>
  );
}
