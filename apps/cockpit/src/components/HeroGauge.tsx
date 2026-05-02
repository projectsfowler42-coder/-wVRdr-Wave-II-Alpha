type HeroGaugeProps = {
  title: string;
  value: number;
  label: string;
  accent?: string;
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

export function HeroGauge({ title, value, label, accent }: HeroGaugeProps) {
  const safeValue = clampGaugeValue(value);
  const stroke = accent ?? gaugeAccent(safeValue);
  const arcLength = 157;
  const dashOffset = arcLength - (arcLength * safeValue) / 100;

  return (
    <article className="hero-gauge-card" aria-label={`${title} ${safeValue}% ${label}`}>
      <div className="hero-gauge-title-row">
        <span>{title}</span>
        <small>READ ONLY</small>
      </div>

      <div className="hero-gauge-arc-wrap">
        <svg className="hero-gauge-svg" viewBox="0 0 120 72" role="img" aria-hidden="true">
          <path
            className="hero-gauge-track"
            d="M 10 62 A 50 50 0 0 1 110 62"
            pathLength={arcLength}
          />
          <path
            className="hero-gauge-fill"
            d="M 10 62 A 50 50 0 0 1 110 62"
            pathLength={arcLength}
            style={{
              stroke,
              strokeDasharray: arcLength,
              strokeDashoffset: dashOffset,
              filter: `drop-shadow(0 0 10px ${stroke})`,
            }}
          />
        </svg>
        <div className="hero-gauge-value">
          <strong>{Math.round(safeValue)}</strong>
          <span>%</span>
        </div>
      </div>

      <div className="hero-gauge-label">{label}</div>
    </article>
  );
}
