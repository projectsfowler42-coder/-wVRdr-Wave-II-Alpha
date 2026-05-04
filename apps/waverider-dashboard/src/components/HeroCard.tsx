import type { HeroMetric } from "../contracts/dashboardSnapshot";
import { GlassCard } from "./GlassCard";
import { HeroGauge } from "./HeroGauge";

export function HeroCard({ hero }: { hero: HeroMetric }) {
  return (
    <GlassCard className="hero-card" tint={`${hero.outer}14`} ariaLabel={`${hero.title} hero metric, ${hero.truthClass}`}>
      <div className="hero-title-row">
        <h2>{hero.title}</h2>
        <span>{hero.truthClass} / ACTIONABILITY</span>
      </div>
      <HeroGauge hero={hero} />
    </GlassCard>
  );
}
