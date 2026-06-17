import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
  loading?: boolean;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className = "",
  loading = false,
}: MetricCardProps) {
  if (loading) {
    return (
      <div className={`animate-pulse rounded-2xl border bg-card p-5 shadow-sm ${className}`}>
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="size-10 rounded-3xl bg-muted" />
        </div>
        <div className="mt-4 h-8 w-16 rounded bg-muted" />
        <div className="mt-2 h-3 w-32 rounded bg-muted" />
      </div>
    );
  }

  return (
    <article className={`rounded-2xl border bg-card p-5 shadow-sm transition hover:shadow-md ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div className="flex size-10 items-center justify-center rounded-3xl bg-emerald-100/80 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300">
          <Icon className="size-5" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight">{value}</span>
        {trend && (
          <span
            className={`text-xs font-semibold ${trend.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
              }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {description && (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      )}
    </article>
  );
}
