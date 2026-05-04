import type { HeroMetric } from "../contracts/dashboardSnapshot";
import { arcPath, clampMetric } from "../lib/svgArc";

export function HeroGauge({ hero }: { hero: HeroMetric }) {
  const id = hero.id;
  const mainValue = clampMetric(hero.mainValue);
  const secondaryValue = clampMetric(hero.secondaryValue);
  const outerEnd = 220 + mainValue * 2.72;
  const innerEnd = 220 + secondaryValue * 2.72;
  const label = `${hero.title}: ${mainValue}% ${hero.mainLabel.replace(/\n/g, " ")}; ${secondaryValue}% ${hero.secondaryLabel.replace(/\n/g, " ")}; truth ${hero.truthClass}; source ${hero.sourceId}`;

  return (
    <div className="hero-gauge-shell" role="img" aria-label={label}>
      <svg viewBox="0 0 320 170" className="hero-gauge-svg" aria-hidden="true">
        <defs>
          <linearGradient id={`${id}-outer`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={hero.outer} stopOpacity="0.70" />
            <stop offset="55%" stopColor={hero.outer} stopOpacity="0.92" />
            <stop offset="100%" stopColor={hero.outer} stopOpacity="0.52" />
          </linearGradient>
          <linearGradient id={`${id}-inner`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={hero.inner} stopOpacity="0.52" />
            <stop offset="100%" stopColor={hero.inner} stopOpacity="0.92" />
          </linearGradient>
          <filter id={`${id}-glow`} x="-45%" y="-45%" width="190%" height="190%">
            <feDropShadow dx="0" dy="10" stdDeviation="11" floodColor={hero.outer} floodOpacity="0.30" />
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={hero.inner} floodOpacity="0.22" />
          </filter>
        </defs>
        <path d={arcPath(122, 138, 104, 220, 500)} className="hero-track" />
        <path d={arcPath(122, 138, 104, 220, outerEnd)} stroke={`url(#${id}-outer)`} className="hero-outer" filter={`url(#${id}-glow)`} />
        <path d={arcPath(205, 138, 58, 220, 500)} className="hero-track hero-inner-track" />
        <path d={arcPath(205, 138, 58, 220, innerEnd)} stroke={`url(#${id}-inner)`} className="hero-inner" filter={`url(#${id}-glow)`} />
      </svg>
      <div className="hero-main-readout">
        <div className="kicker">{hero.mainKicker}</div>
        <div className="hero-main-number">{mainValue}<span>%</span></div>
        <div className="hero-main-label">{hero.mainLabel}</div>
      </div>
      <div className="hero-secondary-readout">
        <div className="hero-secondary-number">{secondaryValue}<span>%</span></div>
        <div className="hero-secondary-label">{hero.secondaryLabel}</div>
      </div>
      {hero.caution && <div className="hero-caution" aria-hidden="true">△</div>}
    </div>
  );
}
