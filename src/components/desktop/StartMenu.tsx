import { useCallback } from "react";
import { MenuList, MenuListItem, Separator } from "react95";
import styled from "styled-components";
import { useWindowManager } from "../../hooks/useWindowManager";

interface StartMenuProps {
  onClose: () => void;
}

const MenuWrapper = styled.div`
  position: absolute;
  bottom: 100%;
  left: 0;
  z-index: 10000;
  width: 220px;
  margin-bottom: 2px;
`;

const MenuBanner = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 28px;
  background: linear-gradient(to top, #ff69b4, #ff1493);
  display: flex;
  align-items: flex-end;
  padding-bottom: 8px;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  color: white;
  font-weight: bold;
  font-size: 14px;
  letter-spacing: 2px;
  z-index: 1;
`;

const MenuContent = styled(MenuList)`
  padding-left: 28px;
  width: 100%;
`;

const MenuIcon = styled.span`
  display: inline-block;
  width: 24px;
  text-align: center;
  margin-right: 8px;
  font-size: 16px;
`;

export function StartMenu({ onClose }: StartMenuProps) {
  const { openWindow } = useWindowManager();

  const handleOpen = useCallback(
    (id: string, title: string, componentKey: string, props?: Record<string, unknown>) => {
      openWindow(id, title, componentKey, props);
      onClose();
    },
    [openWindow, onClose],
  );

  return (
    <MenuWrapper>
      <MenuBanner>zapychan95</MenuBanner>
      <MenuContent>
        <MenuListItem
          onClick={() =>
            handleOpen("paintings", "My Paintings", "gallery", {
              galleryType: "paintings",
            })
          }
        >
          <MenuIcon>🎨</MenuIcon>
          My Paintings
        </MenuListItem>
        <MenuListItem
          onClick={() =>
            handleOpen("digital", "Digital Works", "gallery", {
              galleryType: "digital",
            })
          }
        >
          <MenuIcon>💻</MenuIcon>
          Digital Works
        </MenuListItem>
        <Separator />
        <MenuListItem
          onClick={() => handleOpen("about", "About Me", "about")}
        >
          <MenuIcon>📝</MenuIcon>
          About Me
        </MenuListItem>
        <MenuListItem
          onClick={() => handleOpen("guestbook", "Guestbook", "guestbook")}
        >
          <MenuIcon>📖</MenuIcon>
          Guestbook
        </MenuListItem>
        <MenuListItem
          onClick={() => handleOpen("links", "Cool Links", "links")}
        >
          <MenuIcon>🔗</MenuIcon>
          Cool Links
        </MenuListItem>
        <MenuListItem
          onClick={() => handleOpen("contact", "Contact Me", "contact")}
        >
          <MenuIcon>💌</MenuIcon>
          Contact Me
        </MenuListItem>
        <Separator />
        <MenuListItem disabled>
          <MenuIcon>🌸</MenuIcon>
          Shut Down...
        </MenuListItem>
      </MenuContent>
    </MenuWrapper>
  );
}
