import Button from "./Button";

export default function EmptyState({
  title = "No manga found",
  description = "Try adjusting your search terms or filters to find what you are looking for.",
  actionLabel,
  actionHref,
  onAction,
  icon,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-border rounded-2xl bg-surface/50 max-w-lg mx-auto ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-surface-secondary text-text-secondary flex items-center justify-center mb-4 text-xl">
        {icon || (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        )}
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-1.5">{title}</h3>
      <p className="text-sm text-text-secondary max-w-sm mb-6">{description}</p>
      {actionLabel && (
        <Button
          href={actionHref}
          onClick={onAction}
          variant="primary"
          size="md"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
