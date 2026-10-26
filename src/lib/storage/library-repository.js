import { executeTransaction, StorageError, StorageErrorCode } from "./database.js";

/**
 * Generate compound key for library items.
 */
export function buildLibraryKey(sourceId, mangaId) {
  if (!sourceId || !mangaId) {
    throw new StorageError(
      StorageErrorCode.INVALID_RECORD,
      "Both sourceId and mangaId are required for library compound key."
    );
  }
  return `${sourceId}:${mangaId}`;
}

/**
 * Check if a manga is saved in the library.
 *
 * @param {string} sourceId
 * @param {string} mangaId
 * @returns {Promise<boolean>}
 */
export async function isInLibrary(sourceId, mangaId) {
  const compoundId = buildLibraryKey(sourceId, mangaId);
  const result = await executeTransaction("library", "readonly", (store) =>
    store.get(compoundId)
  );
  return Boolean(result);
}

/**
 * Add or update a manga in the library.
 *
 * @param {Object} manga - Normalized manga object
 * @returns {Promise<Object>} The saved record
 */
export async function addToLibrary(manga) {
  if (!manga || !manga.id || !manga.sourceId || !manga.title) {
    throw new StorageError(
      StorageErrorCode.INVALID_RECORD,
      "Invalid manga object: id, sourceId, and title are required."
    );
  }

  const compoundId = buildLibraryKey(manga.sourceId, manga.id);
  const record = {
    compoundId,
    sourceId: manga.sourceId,
    mangaId: manga.id,
    title: manga.title,
    coverUrl: manga.coverUrl || null,
    genres: Array.isArray(manga.genres) ? manga.genres : [],
    status: manga.status || "unknown",
    savedAt: new Date().toISOString(),
  };

  await executeTransaction("library", "readwrite", (store) =>
    store.put(record)
  );

  return record;
}

/**
 * Remove a manga from the library by sourceId and mangaId.
 *
 * @param {string} sourceId
 * @param {string} mangaId
 * @returns {Promise<boolean>}
 */
export async function removeFromLibrary(sourceId, mangaId) {
  const compoundId = buildLibraryKey(sourceId, mangaId);
  await executeTransaction("library", "readwrite", (store) =>
    store.delete(compoundId)
  );
  return true;
}

/**
 * List all saved manga from the library.
 *
 * @returns {Promise<Array<Object>>}
 */
export async function listLibrary() {
  const records = await executeTransaction("library", "readonly", (store) =>
    store.getAll()
  );

  return (records || []).sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  );
}
