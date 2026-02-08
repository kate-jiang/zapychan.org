import { useCallback } from "react";
import styled from "styled-components";

interface DesktopIconProps {
  label: string;
  icon: string;
  onDoubleClick: () => void;
  style?: React.CSSProperties;
  className?: string;
}

const IconWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80px;
  padding: 4px;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;

  &:hover .icon-label {
    background: #ff69b4;
    color: white;
  }
`;

const IconEmoji = styled.div`
  font-size: 32px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
`;

const IconLabel = styled.span`
  font-size: 11px;
  text-align: center;
  color: #8b0045;
  padding: 1px 4px;
  word-break: break-word;
  line-height: 1.2;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
`;

export function DesktopIcon({
  label,
  icon,
  onDoubleClick,
  style,
  className,
}: DesktopIconProps) {
  const handleDoubleClick = useCallback(() => {
    onDoubleClick();
  }, [onDoubleClick]);

  return (
    <IconWrapper
      onDoubleClick={handleDoubleClick}
      style={style}
      className={className}
    >
      <IconEmoji>{icon}</IconEmoji>
      <IconLabel className="icon-label">{label}</IconLabel>
    </IconWrapper>
  );
}
