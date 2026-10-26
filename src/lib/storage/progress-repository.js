import { executeTransaction, StorageError, StorageErrorCode } from "./database.js";

/**
 * Generate compound key for chapter progress records.
 */
export function buildProgressKey(sourceId, mangaId, chapterId) {
  if (!sourceId || !mangaId || !chapterId) {
    throw new StorageError(
      StorageErrorCode.INVALID_RECORD,
      "sourceId, mangaId, and chapterId are required for progress key."
    );
  }
  return `${sourceId}:${mangaId}:${chapterId}`;
}

/**
 * Save reading progress for a specific chapter.
 *
 * @param {Object} progress
 * @param {string} progress.sourceId
 * @param {string} progress.mangaId
 * @param {string} progress.chapterId
 * @param {number} progress.pageIndex - 0-indexed page number
 * @param {number} [progress.totalPages]
 * @param {string} [progress.chapterTitle]
 * @returns {Promise<Object>} The saved progress record
 */
export async function saveReadingProgress({
  sourceId,
  mangaId,
  chapterId,
  pageIndex = 0,
  totalPages = 1,
  chapterTitle = "",
}) {
  const compoundId = buildProgressKey(sourceId, mangaId, chapterId);
  const mangaCompoundId = `${sourceId}:${mangaId}`;

  const percentComplete =
    totalPages > 0
      ? Math.min(100, Math.round(((pageIndex + 1) / totalPages) * 100))
      : 0;

  const record = {
    compoundId,
    mangaCompoundId,
    sourceId,
    mangaId,
    chapterId,
    pageIndex,
    totalPages,
    chapterTitle,
    percentComplete,
    updatedAt: new Date().toISOString(),
  };

  await executeTransaction("progress", "readwrite", (store) =>
    store.put(record)
  );

  return record;
}

/**
 * Get reading progress for a specific chapter.
 *
 * @param {string} sourceId
 * @param {string} mangaId
 * @param {string} chapterId
 * @returns {Promise<Object|null>}
 */
export async function getChapterProgress(sourceId, mangaId, chapterId) {
  const compoundId = buildProgressKey(sourceId, mangaId, chapterId);
  const result = await executeTransaction("progress", "readonly", (store) =>
    store.get(compoundId)
  );
  return result || null;
}

/**
 * Get the latest reading progress for a manga title.
 *
 * @param {string} sourceId
 * @param {string} mangaId
 * @returns {Promise<Object|null>}
 */
export async function getMangaProgress(sourceId, mangaId) {
  const mangaCompoundId = `${sourceId}:${mangaId}`;
  const records = await executeTransaction("progress", "readonly", (store) => {
    const index = store.index("mangaCompoundId");
    return index.getAll(mangaCompoundId);
  });

  if (!records || records.length === 0) {
    return null;
  }

  // Sort newest updated first
  records.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  return records[0];
}

/**
 * List recently read titles across all manga.
 *
 * @param {number} [limit=10]
 * @returns {Promise<Array<Object>>}
 */
export async function listRecentHistory(limit = 10) {
  const records = await executeTransaction("progress", "readonly", (store) =>
    store.getAll()
  );

  if (!records || records.length === 0) {
    return [];
  }

  // Deduplicate by mangaCompoundId, keeping the most recent
  const seen = new Set();
  const deduped = [];

  records.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  for (const item of records) {
    if (!seen.has(item.mangaCompoundId)) {
      seen.add(item.mangaCompoundId);
      deduped.push(item);
      if (deduped.length >= limit) break;
    }
  }

  return deduped;
}
