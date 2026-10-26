import { notFound } from "next/navigation";
import { defaultSourceManager } from "@/lib/sources";
import { SourceError, SourceErrorCode } from "@/lib/sources/errors";
import { MOCK_CHAPTERS } from "@/lib/fixtures/chapters";
import ReaderViewClient from "./ReaderViewClient";

export function generateStaticParams() {
  const params = [];
  for (const [mangaId, chapters] of Object.entries(MOCK_CHAPTERS)) {
    for (const ch of chapters) {
      params.push({
        mangaId,
        chapterId: ch.id,
      });
    }
  }

  // Include open-manga verified chapter params
  params.push(
    { mangaId: "open-classic-bobby", chapterId: "open-classic-bobby-ch-1" },
    { mangaId: "open-lunar-chronicles", chapterId: "open-lunar-chronicles-ch-1" }
  );

  return params;
}

function resolveSourceForManga(mangaId) {
  if (mangaId.startsWith("open-")) return "open-manga";
  if (mangaId.startsWith("mal-")) return "jikan-catalog";
  return "mock";
}

export async function generateMetadata({ params }) {
  const { mangaId, chapterId } = await params;
  const sourceId = resolveSourceForManga(mangaId);
  try {
    const [manga, chapters] = await Promise.all([
      defaultSourceManager.getManga(mangaId, sourceId),
      defaultSourceManager.getChapters(mangaId, {}, sourceId),
    ]);
    const chapter = chapters.find((c) => c.id === chapterId);
    return {
      title: `${chapter?.title || "Chapter"} — ${manga.title} — MangaBox Web`,
      description: `Read ${manga.title} ${chapter?.title || ""} online in MangaBox reader.`,
    };
  } catch {
    return {
      title: "Reader — MangaBox Web",
    };
  }
}

export default async function ReaderPage({ params }) {
  const { mangaId, chapterId } = await params;
  const sourceId = resolveSourceForManga(mangaId);

  let manga;
  let chapters;
  let pages;

  try {
    [manga, chapters, pages] = await Promise.all([
      defaultSourceManager.getManga(mangaId, sourceId),
      defaultSourceManager.getChapters(mangaId, { order: "asc" }, sourceId),
      defaultSourceManager.getPages(mangaId, chapterId, sourceId),
    ]);
  } catch (err) {
    if (err instanceof SourceError && err.code === SourceErrorCode.NOT_FOUND) {
      notFound();
    }
    throw err;
  }

  const currentChapterIndex = chapters.findIndex((c) => c.id === chapterId);
  if (currentChapterIndex === -1) {
    notFound();
  }

  const chapter = chapters[currentChapterIndex];
  const prevChapter = currentChapterIndex > 0 ? chapters[currentChapterIndex - 1] : null;
  const nextChapter =
    currentChapterIndex < chapters.length - 1 ? chapters[currentChapterIndex + 1] : null;

  return (
    <ReaderViewClient
      manga={manga}
      chapter={chapter}
      pages={pages}
      prevChapter={prevChapter}
      nextChapter={nextChapter}
    />
  );
}
