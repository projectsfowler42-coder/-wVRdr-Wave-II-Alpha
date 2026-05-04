import { Activity, AlertTriangle, Bitcoin, Gauge, Hexagon, TrendingUp } from "lucide-react";
import type { CSSProperties } from "react";
import type { MetricIconName, MiniMetric as MiniMetricData } from "../contracts/dashboardSnapshot";
import { GlassCard } from "./GlassCard";

const iconMap = {
  activity: Activity,
  alert: AlertTriangle,
  bitcoin: Bitcoin,
  gauge: Gauge,
  hexagon: Hexagon,
  trend: TrendingUp,
} satisfies Record<MetricIconName, typeof Activity>;

type OrbStyle = CSSProperties & { "--orb"?: string };

export function MiniMetric({ item }: { item: MiniMetricData }) {
  const Icon = iconMap[item.icon];
  const orbStyle: OrbStyle = { "--orb": item.color };

  return (
    <GlassCard className="mini-card" tint={`${item.color}11`} ariaLabel={`${item.label}: ${item.value}; ${item.truthClass}`}>
      <div className="mini-orb" style={orbStyle}>
        <Icon size={18} />
      </div>
      <div>
        <p>{item.label}</p>
        <b style={{ color: item.color }}>{item.value}</b>
      </div>
    </GlassCard>
  );
}
