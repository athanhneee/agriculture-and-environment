interface AlertBadgeProps {
  severity: string;
}

export function AlertBadge({ severity }: AlertBadgeProps) {
  const severityConfig: Record<string, { label: string; className: string }> = {
    INFO: {
      label: "Thông tin",
      className:
        "bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20",
    },
    WARNING: {
      label: "Cảnh báo",
      className:
        "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
    },
    CRITICAL: {
      label: "Nghiêm trọng",
      className: "bg-destructive/10 text-destructive border border-destructive/20",
    },
  };
  const config = severityConfig[severity] ?? severityConfig.INFO;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${config.className}`}
    >
      {config.label}
    </span>
  );
}
