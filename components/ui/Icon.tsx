import { LucideIcon } from "lucide-react";

type IconTone =
  | "default"
  | "muted"
  | "accent"
  | "success"
  | "danger";

type IconSize =
  | "sm"
  | "md"
  | "lg"
  | "xl";

type IconProps = {
  icon: LucideIcon;
  tone?: IconTone;
  size?: IconSize;
  strokeWidth?: number;
  className?: string;
};

const toneClasses: Record<IconTone, string> = {
  default: "text-[var(--text)]",
  muted: "text-[var(--text-muted)]",
  accent: "text-[var(--primary)]",
  success: "text-[var(--success)]",
  danger: "text-[var(--danger)]",
};

const sizeMap: Record<IconSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
};

export default function Icon({
  icon: LucideIcon,
  tone = "default",
  size = "md",
  strokeWidth = 2,
  className = "",
}: IconProps) {
  return (
    <LucideIcon
      size={sizeMap[size]}
      strokeWidth={strokeWidth}
      className={`
        shrink-0
        transition-colors
        duration-200
        ${toneClasses[tone]}
        ${className}
      `}
    />
  );
}