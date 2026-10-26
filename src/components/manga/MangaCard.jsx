import Link from "next/link";
import Image from "next/image";
import Badge from "@/components/ui/Badge";

export default function MangaCard({ manga, priority = false }) {
  if (!manga) return null;

  const { id, title, coverUrl, genres = [], status, latestChapter } = manga;

  const statusVariant = {
    ongoing: "accent",
    completed: "success",
    hiatus: "warning",
    unknown: "neutral",
  }[status || "unknown"] || "neutral";

  return (
    <Link
      href={`/manga/${encodeURIComponent(id)}`}
      className="group flex flex-col gap-2 rounded-xl transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-border bg-surface-secondary shadow-xs transition-shadow duration-200 group-hover:shadow-md">
        <Image
          src={coverUrl || "/images/placeholders/cover-apothecary.svg"}
          alt={`Cover for ${title}`}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 16vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          priority={priority}
        />
        <div className="absolute top-2 right-2">
          <Badge variant={statusVariant} size="sm">
            {status || "mock"}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col gap-1 px-0.5">
        <h3 className="line-clamp-2 text-sm font-semibold text-text-primary transition-colors group-hover:text-accent">
          {title}
        </h3>

        <div className="flex items-center justify-between gap-2 text-xs text-text-secondary">
          <span className="line-clamp-1">{genres[0] || "Manga"}</span>
          {latestChapter && (
            <span className="font-mono text-[11px] text-text-secondary/80">
              {latestChapter}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
