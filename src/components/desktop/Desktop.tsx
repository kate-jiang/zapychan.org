import { Suspense, useCallback } from "react";
import styled from "styled-components";
import { Hourglass } from "react95";
import { useWindowManager } from "../../hooks/useWindowManager";
import { useIsMobile } from "../../hooks/useIsMobile";
import { desktopIcons } from "../../data/desktopIcons";
import { DesktopIcon } from "./DesktopIcon";
import { Taskbar } from "./Taskbar";
import { ManagedWindow } from "../window/ManagedWindow";
import { windowRegistry } from "../window/windowRegistry";

const DesktopWrapper = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
  background-color: #ffc0cb;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Ctext x='15' y='35' font-size='20' opacity='0.15'%3E%E2%99%A5%3C/text%3E%3Ctext x='45' y='15' font-size='14' opacity='0.1'%3E%E2%9C%A6%3C/text%3E%3C/svg%3E");
`;

const IconGrid = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1;
`;

const WindowLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const LoadingFallback = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
`;

export function Desktop() {
  const { windows, openWindow } = useWindowManager();
  const isMobile = useIsMobile();

  const handleIconOpen = useCallback(
    (id: string, title: string, componentKey: string) => {
      const props: Record<string, unknown> = {};
      if (componentKey === "gallery") {
        props.galleryType = id === "paintings" ? "paintings" : "digital";
      }
      openWindow(id, title, componentKey, props);
    },
    [openWindow],
  );

  return (
    <DesktopWrapper>
      {!isMobile && (
        <IconGrid>
          {desktopIcons.map((icon) => (
            <DesktopIcon
              key={icon.id}
              label={icon.label}
              icon={icon.icon}
              onDoubleClick={() =>
                handleIconOpen(icon.id, icon.windowTitle, icon.componentKey)
              }
            />
          ))}
        </IconGrid>
      )}

      <WindowLayer>
        {windows.map((w) => {
          const Component = windowRegistry[w.componentKey];
          if (!Component) return null;
          return (
            <ManagedWindow key={w.id} windowState={w}>
              <Suspense
                fallback={
                  <LoadingFallback>
                    <Hourglass size={32} />
                  </LoadingFallback>
                }
              >
                <Component windowId={w.id} props={w.props} />
              </Suspense>
            </ManagedWindow>
          );
        })}
      </WindowLayer>

      <Taskbar />
    </DesktopWrapper>
  );
}
