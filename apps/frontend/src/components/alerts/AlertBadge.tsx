interface AlertBadgeProps {
  severity: string;
}

export function AlertBadge({ severity }: AlertBadgeProps) {
  const isCritical = severity === "CRITICAL";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
        isCritical
          ? "bg-destructive/10 text-destructive border border-destructive/20"
          : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
      }`}
    >
      {isCritical ? "Nguy cấp" : "Cảnh báo"}
    </span>
  );
}
