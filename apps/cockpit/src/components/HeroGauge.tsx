import type { CSSProperties } from 'react';

type HeroGaugeProps = {
  title: string;
  value: number;
  label: string;
  accent?: string;
};

type GaugeStyle = CSSProperties & {
  '--gauge-accent': string;
  '--gauge-offset': number;
  '--gauge-fill': string;
};

function clampGaugeValue(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function gaugeAccent(value: number): string {
  if (value <= 40) return '#00FFFF';
  if (value <= 60) return '#FFD700';
  if (value <= 80) return '#FFA500';
  return '#FF69B4';
}

function gaugeFill(value: number, accent: string): string {
  const safeValue = clampGaugeValue(value);
  return `linear-gradient(135deg, ${accent}22 0%, rgba(255,255,255,0.54) ${Math.max(
    28,
    safeValue,
  )}%, ${accent}30 100%)`;
}

export function HeroGauge({ title, value, label, accent }: HeroGaugeProps) {
  const safeValue = clampGaugeValue(value);
  const stroke = accent ?? gaugeAccent(safeValue);
  const dashOffset = 100 - safeValue;
  const roundedValue = Math.round(safeValue).toString().padStart(2, '0');
  const gaugeStyle: GaugeStyle = {
    '--gauge-accent': stroke,
    '--gauge-offset': dashOffset,
    '--gauge-fill': gaugeFill(safeValue, stroke),
  };

  return (
    <article
      className="hero-gauge-card"
      style={gaugeStyle}
      aria-label={`${title} ${Math.round(safeValue)} percent ${label}`}
    >
      <div className="hero-gauge-sheen" aria-hidden="true" />
      <div className="hero-gauge-title-row">
        <span>{title}</span>
        <small>READ ONLY</small>
      </div>

      <div className="hero-gauge-arc-wrap">
        <svg className="hero-gauge-svg" viewBox="0 0 120 78" role="img" aria-hidden="true">
          <path className="hero-gauge-track" d="M 10 64 A 50 50 0 0 1 110 64" pathLength={100} />
          <path className="hero-gauge-glass-line" d="M 10 64 A 50 50 0 0 1 110 64" pathLength={100} />
          <path className="hero-gauge-fill" d="M 10 64 A 50 50 0 0 1 110 64" pathLength={100} />
        </svg>

        <div className="hero-gauge-ticks" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="hero-gauge-value">
          <strong>{roundedValue}</strong>
          <span>%</span>
        </div>
      </div>

      <div className="hero-gauge-label">{label}</div>
    </article>
  );
}
