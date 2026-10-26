import MangaCard from "@/components/manga/MangaCard";
import ContinueReadingSection from "@/components/manga/ContinueReadingSection";
import Button from "@/components/ui/Button";
import { MOCK_MANGA_LIST } from "@/lib/fixtures/manga";

export const metadata = {
  title: "MangaBox Web — Home",
  description: "Discover and read manga with clean typography and instant browser persistence.",
};

export default function HomePage() {
  const featured = MOCK_MANGA_LIST.slice(0, 4);
  const recentlyUpdated = MOCK_MANGA_LIST;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 space-y-10">
      {/* Notice banner clarifying mock data status */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-accent/20 bg-accent-light/60 p-3.5 sm:px-4 text-xs text-text-primary">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
          <p>
            <strong className="font-semibold">Mock Mode:</strong> All manga titles and reading history shown are deterministic mock fixtures for UI verification.
          </p>
        </div>
        <Button href="/search" variant="ghost" size="sm" className="hidden sm:inline-flex">
          Explore All →
        </Button>
      </div>

      {/* Continue Reading Section (dynamically loaded from IndexedDB) */}
      <ContinueReadingSection />

      {/* Featured Section */}
      <section aria-labelledby="featured-heading">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2
              id="featured-heading"
              className="text-lg font-bold text-text-primary tracking-tight"
            >
              Featured Titles
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Curated highlights from the mock library
            </p>
          </div>
          <Button href="/search" variant="outline" size="sm">
            Browse all
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
          {featured.map((manga, idx) => (
            <MangaCard key={manga.id} manga={manga} priority={idx < 2} />
          ))}
        </div>
      </section>

      {/* Recently Updated Section */}
      <section aria-labelledby="recently-updated-heading">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2
              id="recently-updated-heading"
              className="text-lg font-bold text-text-primary tracking-tight"
            >
              Recently Updated
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Fresh chapters available in mock fixtures
            </p>
          </div>
          <span className="text-xs text-text-secondary font-mono">
            {recentlyUpdated.length} titles
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
          {recentlyUpdated.map((manga) => (
            <MangaCard key={`recent-${manga.id}`} manga={manga} />
          ))}
        </div>
      </section>
    </div>
  );
}
