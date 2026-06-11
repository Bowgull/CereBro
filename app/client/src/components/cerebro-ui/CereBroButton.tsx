import { Slot } from "@radix-ui/react-slot";
import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cerebroBrand as B } from "@/lib/cerebroTheme";

type CereBroButtonVariant = "plaque" | "active" | "ghost" | "danger";

type CereBroButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  icon?: ReactNode;
  variant?: CereBroButtonVariant;
};

const buttonSurface: Record<CereBroButtonVariant, string> = {
  plaque: B.surface.plaque,
  active: B.surface.plaqueActive,
  ghost: "rgba(8, 14, 13, 0.74)",
  danger: `linear-gradient(180deg, rgba(82, 31, 23, 0.96), ${B.color.ink900})`,
};

const buttonColor: Record<CereBroButtonVariant, string> = {
  plaque: B.color.parchment200,
  active: B.color.gold300,
  ghost: B.color.muted500,
  danger: B.color.parchment100,
};

export function CereBroButton({ asChild, icon, children, className = "", variant = "plaque", style, ...props }: CereBroButtonProps) {
  const Component = asChild ? Slot : "button";
  return (
    <Component
      className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-[var(--cb-radius-control)] px-3 text-[12px] font-semibold transition duration-150 hover:-translate-y-0.5 active:translate-y-0 disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${className}`}
      style={{
        background: buttonSurface[variant],
        border: `1px solid ${variant === "active" ? B.color.gold500 : B.line.brassSoft}`,
        boxShadow: B.shadow.bevel,
        color: buttonColor[variant],
        ...style,
      }}
      {...props}
    >
      {icon}
      {children}
    </Component>
  );
}
