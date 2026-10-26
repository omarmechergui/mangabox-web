import { notFound } from "next/navigation";
import { defaultSourceManager } from "@/lib/sources";
import { SourceError, SourceErrorCode } from "@/lib/sources/errors";
import { MOCK_MANGA_LIST } from "@/lib/fixtures/manga";
import MangaDetailsClient from "./MangaDetailsClient";

export function generateStaticParams() {
  const staticList = [
    ...MOCK_MANGA_LIST.map((m) => ({ mangaId: m.id })),
    { mangaId: "open-classic-bobby" },
    { mangaId: "open-lunar-chronicles" },
  ];
  return staticList;
}

/**
 * Helper to determine which source adapter owns a mangaId.
 */
function resolveSourceForManga(mangaId) {
  if (mangaId.startsWith("open-")) return "open-manga";
  if (mangaId.startsWith("mal-")) return "jikan-catalog";
  return "mock";
}

export async function generateMetadata({ params }) {
  const { mangaId } = await params;
  const sourceId = resolveSourceForManga(mangaId);
  try {
    const manga = await defaultSourceManager.getManga(mangaId, sourceId);
    return {
      title: `${manga.title} — MangaBox Web`,
      description: manga.description || `Read ${manga.title} on MangaBox Web.`,
    };
  } catch {
    return {
      title: "Manga Title — MangaBox Web",
    };
  }
}

export default async function MangaDetailsPage({ params }) {
  const { mangaId } = await params;
  const sourceId = resolveSourceForManga(mangaId);

  let manga;
  let chapters = [];

  try {
    manga = await defaultSourceManager.getManga(mangaId, sourceId);
    try {
      chapters = await defaultSourceManager.getChapters(mangaId, {}, sourceId);
    } catch (chapterErr) {
      // If the source does not support chapters (e.g. Jikan), handle gracefully
      if (
        chapterErr instanceof SourceError &&
        chapterErr.code === SourceErrorCode.OPERATION_NOT_SUPPORTED
      ) {
        chapters = [];
      } else {
        throw chapterErr;
      }
    }
  } catch (err) {
    if (err instanceof SourceError && err.code === SourceErrorCode.NOT_FOUND) {
      notFound();
    }
    throw err;
  }

  return <MangaDetailsClient manga={manga} initialChapters={chapters} />;
}
