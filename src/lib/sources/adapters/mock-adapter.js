import { normalizeManga, normalizeChapter, normalizePage } from "../contracts.js";
import { SourceError, SourceErrorCode } from "../errors.js";
import { MOCK_MANGA_LIST } from "../../fixtures/manga.js";
import { MOCK_CHAPTERS, MOCK_PAGES } from "../../fixtures/chapters.js";

/**
 * MockAdapter implements the MangaBox source adapter contract
 * using deterministic in-memory fixtures.
 */
export class MockAdapter {
  constructor(options = {}) {
    this.id = options.id || "mock";
    this.name = options.name || "Mock Catalog";
    this.kind = "mock";
    this.version = "1.0.0";
    this.capabilities = {
      search: true,
      mangaDetails: true,
      chapterList: true,
      pageList: true,
      latestUpdates: true,
      filterByGenre: true,
    };
    this.latencyMs = options.latencyMs || 0;
  }

  /**
   * Helper to simulate artificial deterministic latency if configured.
   */
  async _delay() {
    if (this.latencyMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.latencyMs));
    }
  }

  /**
   * Returns current source status.
   */
  async getStatus() {
    return {
      available: true,
      message: "Mock catalog operational with local fixtures.",
    };
  }

  /**
   * Search titles by query and options.
   *
   * @param {string} [query=""]
   * @param {Object} [options={}]
   * @returns {Promise<Array>}
   */
  async search(query = "", options = {}) {
    await this._delay();
    const cleanQuery = (query || "").trim().toLowerCase();
    const genre = options.genre ? options.genre.toLowerCase() : null;
    const status = options.status ? options.status.toLowerCase() : null;

    let results = MOCK_MANGA_LIST;

    if (cleanQuery) {
      results = results.filter((m) => {
        const titleMatch = m.title.toLowerCase().includes(cleanQuery);
        const altMatch = m.altTitles?.some((alt) => alt.toLowerCase().includes(cleanQuery));
        return titleMatch || altMatch;
      });
    }

    if (genre) {
      results = results.filter((m) =>
        m.genres?.some((g) => g.toLowerCase() === genre)
      );
    }

    if (status) {
      results = results.filter((m) => m.status?.toLowerCase() === status);
    }

    return results.map((item) => normalizeManga(item, this.id));
  }

  /**
   * Get single manga details by ID.
   *
   * @param {string} mangaId
   * @returns {Promise<Object>}
   */
  async getManga(mangaId) {
    await this._delay();
    if (!mangaId) {
      throw new SourceError(
        SourceErrorCode.INVALID_RESPONSE,
        "mangaId is required",
        this.id
      );
    }

    const item = MOCK_MANGA_LIST.find((m) => m.id === mangaId);
    if (!item) {
      throw new SourceError(
        SourceErrorCode.NOT_FOUND,
        `Manga with ID '${mangaId}' was not found in mock catalog.`,
        this.id
      );
    }

    return normalizeManga(item, this.id);
  }

  /**
   * List chapters for a manga ID.
   *
   * @param {string} mangaId
   * @param {Object} [options={}]
   * @returns {Promise<Array>}
   */
  async getChapters(mangaId, options = {}) {
    await this._delay();
    if (!mangaId) {
      throw new SourceError(
        SourceErrorCode.INVALID_RESPONSE,
        "mangaId is required",
        this.id
      );
    }

    // Verify manga exists first
    const manga = MOCK_MANGA_LIST.find((m) => m.id === mangaId);
    if (!manga) {
      throw new SourceError(
        SourceErrorCode.NOT_FOUND,
        `Cannot load chapters: manga '${mangaId}' not found.`,
        this.id
      );
    }

    const chapters = MOCK_CHAPTERS[mangaId] || [
      {
        id: `${mangaId}-ch-1`,
        mangaId,
        title: "Chapter 1: The Beginning",
        chapterNumber: 1,
        volumeNumber: 1,
        publishedAt: "2025-01-01T00:00:00Z",
        pageCount: 2,
      },
    ];

    const sortOrder = options.order === "asc" ? "asc" : "desc";
    const sorted = [...chapters].sort((a, b) => {
      const numA = a.chapterNumber ?? 0;
      const numB = b.chapterNumber ?? 0;
      return sortOrder === "asc" ? numA - numB : numB - numA;
    });

    return sorted.map((ch) => normalizeChapter(ch, mangaId, this.id));
  }

  /**
   * List pages for a chapter.
   *
   * @param {string} mangaId
   * @param {string} chapterId
   * @returns {Promise<Array>}
   */
  async getPages(mangaId, chapterId) {
    await this._delay();
    if (!mangaId || !chapterId) {
      throw new SourceError(
        SourceErrorCode.INVALID_RESPONSE,
        "Both mangaId and chapterId are required",
        this.id
      );
    }

    const pages = MOCK_PAGES[chapterId] || MOCK_PAGES.default;
    return pages.map((page, index) => normalizePage(page, index, this.id));
  }

  /**
   * Optional cleanup
   */
  dispose() {}
}
