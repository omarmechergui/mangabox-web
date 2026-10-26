import { SourceError, SourceErrorCode } from "./errors.js";

/**
 * Validates and normalizes a Manga entity.
 * Unknown / missing fields default to null, empty arrays, or "unknown".
 *
 * @param {Object} raw
 * @param {string} sourceId
 * @returns {Object} Normalized manga object
 */
export function normalizeManga(raw, sourceId) {
  if (!raw || typeof raw !== "object") {
    throw new SourceError(
      SourceErrorCode.INVALID_RESPONSE,
      "Invalid manga record: expected an object",
      sourceId
    );
  }

  if (!raw.id || typeof raw.id !== "string") {
    throw new SourceError(
      SourceErrorCode.INVALID_RESPONSE,
      "Invalid manga record: missing or invalid string 'id'",
      sourceId
    );
  }

  if (!raw.title || typeof raw.title !== "string") {
    throw new SourceError(
      SourceErrorCode.INVALID_RESPONSE,
      `Invalid manga record '${raw.id}': missing or invalid string 'title'`,
      sourceId
    );
  }

  const validStatuses = ["ongoing", "completed", "hiatus", "unknown"];
  const status = validStatuses.includes(raw.status) ? raw.status : "unknown";

  return {
    id: String(raw.id),
    sourceId: String(sourceId),
    title: String(raw.title).trim(),
    altTitles: Array.isArray(raw.altTitles) ? raw.altTitles.map(String) : [],
    description: typeof raw.description === "string" ? raw.description.trim() : "",
    coverUrl: typeof raw.coverUrl === "string" ? raw.coverUrl : null,
    authors: Array.isArray(raw.authors) ? raw.authors.map(String) : [],
    artists: Array.isArray(raw.artists) ? raw.artists.map(String) : [],
    genres: Array.isArray(raw.genres) ? raw.genres.map(String) : [],
    status,
    contentRating: typeof raw.contentRating === "string" ? raw.contentRating : "unknown",
    language: typeof raw.language === "string" ? raw.language : "en",
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : null,
    latestChapter: typeof raw.latestChapter === "string" ? raw.latestChapter : null,
  };
}

/**
 * Validates and normalizes a Chapter entity.
 *
 * @param {Object} raw
 * @param {string} mangaId
 * @param {string} sourceId
 * @returns {Object} Normalized chapter object
 */
export function normalizeChapter(raw, mangaId, sourceId) {
  if (!raw || typeof raw !== "object") {
    throw new SourceError(
      SourceErrorCode.INVALID_RESPONSE,
      "Invalid chapter record: expected an object",
      sourceId
    );
  }

  if (!raw.id || typeof raw.id !== "string") {
    throw new SourceError(
      SourceErrorCode.INVALID_RESPONSE,
      "Invalid chapter record: missing or invalid string 'id'",
      sourceId
    );
  }

  const chapterNumber =
    typeof raw.chapterNumber === "number" && !isNaN(raw.chapterNumber)
      ? raw.chapterNumber
      : typeof raw.chapterNumber === "string" && !isNaN(parseFloat(raw.chapterNumber))
      ? parseFloat(raw.chapterNumber)
      : null;

  return {
    id: String(raw.id),
    mangaId: String(mangaId),
    sourceId: String(sourceId),
    title: typeof raw.title === "string" ? raw.title.trim() : `Chapter ${chapterNumber ?? raw.id}`,
    chapterNumber,
    volumeNumber:
      typeof raw.volumeNumber === "number" && !isNaN(raw.volumeNumber)
        ? raw.volumeNumber
        : null,
    publishedAt: typeof raw.publishedAt === "string" ? raw.publishedAt : null,
    pageCount: typeof raw.pageCount === "number" ? raw.pageCount : null,
  };
}

/**
 * Validates and normalizes a Page entity.
 *
 * @param {Object} raw
 * @param {number} defaultIndex
 * @param {string} sourceId
 * @returns {Object} Normalized page object
 */
export function normalizePage(raw, defaultIndex, sourceId) {
  if (!raw || typeof raw !== "object") {
    throw new SourceError(
      SourceErrorCode.INVALID_RESPONSE,
      "Invalid page record: expected an object",
      sourceId
    );
  }

  const id = raw.id ? String(raw.id) : `page-${defaultIndex + 1}`;
  const index = typeof raw.index === "number" ? raw.index : defaultIndex;
  const imageUrl = typeof raw.imageUrl === "string" ? raw.imageUrl : "";

  if (!imageUrl) {
    throw new SourceError(
      SourceErrorCode.INVALID_RESPONSE,
      `Invalid page record '${id}': missing 'imageUrl'`,
      sourceId
    );
  }

  return {
    id,
    index,
    imageUrl,
    width: typeof raw.width === "number" ? raw.width : null,
    height: typeof raw.height === "number" ? raw.height : null,
  };
}
