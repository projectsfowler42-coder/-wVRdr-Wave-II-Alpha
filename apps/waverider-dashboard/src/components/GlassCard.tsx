import type { CSSProperties, ReactNode } from "react";

type GlassStyle = CSSProperties & { "--tint"?: string };

export function GlassCard({
  children,
  className = "",
  tint = "rgba(255,255,255,.12)",
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  tint?: string;
  ariaLabel?: string;
}) {
  const style: GlassStyle = { "--tint": tint };

  return (
    <section className={`glass-card ${className}`} style={style} aria-label={ariaLabel}>
      {children}
    </section>
  );
}
