import Link from "next/link";
import Image from "next/image";

export default function ContinueReadingCard({ item }) {
  if (!item) return null;

  const {
    mangaId,
    title,
    coverUrl,
    chapterId,
    chapterTitle,
    pageProgress,
    totalPages,
    percentComplete,
  } = item;

  return (
    <Link
      href={`/reader/${encodeURIComponent(mangaId)}/${encodeURIComponent(chapterId)}`}
      className="group flex items-center gap-3.5 p-3 rounded-xl border border-border bg-surface hover:border-accent/40 hover:shadow-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div className="relative h-18 w-13 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-secondary">
        <Image
          src={coverUrl || "/images/placeholders/cover-apothecary.svg"}
          alt=""
          fill
          sizes="56px"
          className="object-cover"
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <h4 className="text-sm font-semibold text-text-primary line-clamp-1 group-hover:text-accent transition-colors">
            {title}
          </h4>
          <p className="text-xs text-text-secondary line-clamp-1 mt-0.5">
            {chapterTitle}
          </p>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 flex-1 bg-surface-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-300"
              style={{ width: `${percentComplete}%` }}
              role="progressbar"
              aria-valuenow={percentComplete}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>
          <span className="text-[11px] font-mono text-text-secondary shrink-0">
            {pageProgress}/{totalPages}
          </span>
        </div>
      </div>
    </Link>
  );
}
