import type { DashboardMetric } from "@/types/dashboard";

const toneStyles: Record<DashboardMetric["tone"], string> = {
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  violet: "bg-violet-50 text-violet-700 ring-violet-100",
};

type MetricCardProps = {
  metric: DashboardMetric;
};

export function MetricCard({ metric }: MetricCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div
        className={`mb-6 inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${toneStyles[metric.tone]}`}
      >
        {metric.label}
      </div>
      <p className="text-3xl font-semibold tracking-tight text-slate-950">
        {metric.value}
      </p>
      <p className="mt-3 text-sm leading-6 text-slate-500">{metric.detail}</p>
    </article>
  );
}
