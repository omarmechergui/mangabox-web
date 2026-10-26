import Link from "next/link";

export default function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  type = "button",
  onClick,
  disabled = false,
  className = "",
  ariaLabel,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

  const variants = {
    primary: "bg-accent text-white hover:bg-accent-hover shadow-xs",
    secondary: "bg-surface-secondary text-text-primary hover:bg-border/60 border border-border",
    outline: "border border-border text-text-primary hover:bg-surface-secondary bg-transparent",
    ghost: "text-text-secondary hover:text-text-primary hover:bg-surface-secondary bg-transparent",
    danger: "bg-error text-white hover:bg-error/90",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs gap-1.5",
    md: "h-10 px-4 text-sm gap-2 min-h-[40px]",
    lg: "h-11 px-6 text-base gap-2.5 min-h-[44px]",
    icon: "h-10 w-10 p-2 min-h-[40px] min-w-[40px]",
  };

  const combinedStyles = `${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedStyles} aria-label={ariaLabel} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedStyles}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </button>
  );
}
