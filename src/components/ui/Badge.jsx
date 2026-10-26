export default function Badge({
  children,
  variant = "neutral",
  size = "md",
  className = "",
}) {
  const variantStyles = {
    neutral: "bg-surface-secondary text-text-secondary border-border",
    accent: "bg-accent-light text-accent border-accent/20 font-medium",
    success: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40",
    warning: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800/40",
    error: "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800/40",
  };

  const sizeStyles = {
    sm: "text-[11px] px-1.5 py-0.5",
    md: "text-xs px-2 py-0.5",
    lg: "text-sm px-2.5 py-1",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border font-sans leading-none tracking-tight ${variantStyles[variant] || variantStyles.neutral} ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      {children}
    </span>
  );
}
