export default function Footer() {
  return (
    <footer className="w-full border-t border-border bg-surface py-8 mt-auto">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:text-left sm:px-6 lg:px-8">
        <div>
          <p className="text-xs text-text-secondary">
            <span className="font-semibold text-text-primary">MangaBox Web</span> — Browser-only reader prototype.
          </p>
          <p className="text-[11px] text-text-secondary/70 mt-1">
            Deterministic mock data. No third-party APK execution or unlicensed assets bundled.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-text-secondary">
          <span>v0.1.0 (Phase 1)</span>
          <span className="text-border">•</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Mock Engine Ready
          </span>
        </div>
      </div>
    </footer>
  );
}
