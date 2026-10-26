import { defaultSourceManager } from "@/lib/sources";

/**
 * Service function to search titles through the source engine.
 *
 * @param {string} [query=""]
 * @param {Object} [options={}]
 * @param {string} [sourceId]
 * @returns {Promise<Array>}
 */
export async function searchManga(query = "", options = {}, sourceId) {
  return defaultSourceManager.search(query, options, sourceId);
}

/**
 * Service function to fetch a single manga title by ID.
 *
 * @param {string} mangaId
 * @param {string} [sourceId]
 * @returns {Promise<Object>}
 */
export async function getMangaDetails(mangaId, sourceId) {
  return defaultSourceManager.getManga(mangaId, sourceId);
}

/**
 * Service function to fetch chapters for a manga title.
 *
 * @param {string} mangaId
 * @param {Object} [options={}]
 * @param {string} [sourceId]
 * @returns {Promise<Array>}
 */
export async function getMangaChapters(mangaId, options = {}, sourceId) {
  return defaultSourceManager.getChapters(mangaId, options, sourceId);
}

/**
 * Service function to fetch pages for a manga chapter.
 *
 * @param {string} mangaId
 * @param {string} chapterId
 * @param {string} [sourceId]
 * @returns {Promise<Array>}
 */
export async function getChapterPages(mangaId, chapterId, sourceId) {
  return defaultSourceManager.getPages(mangaId, chapterId, sourceId);
}
