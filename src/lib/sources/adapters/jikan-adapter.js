import { normalizeManga } from "../contracts.js";
import { SourceError, SourceErrorCode } from "../errors.js";

/**
 * JikanCatalogAdapter is a Tier C metadata-only source adapter connected
 * to the Jikan REST API (MyAnimeList open mirror) with native CORS support.
 *
 * It transparently declares that chapter lists and page streams are not supported,
 * fulfilling Rule 5 ("Honest capabilities") and Rule 9 ("Do not claim a chapter is readable").
 */
export class JikanCatalogAdapter {
  constructor(options = {}) {
    this.id = options.id || "jikan-catalog";
    this.name = options.name || "MyAnimeList Catalog (via Jikan)";
    this.kind = "public-api";
    this.version = "4.0.0";
    this.capabilities = {
      search: true,
      mangaDetails: true,
      chapterList: false, // Honestly declared: catalog-only
      pageList: false,    // Honestly declared: no chapter reader pages
      latestUpdates: false,
      filterByGenre: false,
    };
    this.fetchFn = options.fetchFn || (typeof fetch !== "undefined" ? fetch.bind(globalThis) : null);
  }

  async getStatus() {
    return {
      available: true,
      message: "Jikan API v4 operational with browser CORS support (Metadata catalog only).",
    };
  }

  async search(query = "") {
    if (!query || !query.trim()) {
      return [];
    }

    if (!this.fetchFn) {
      throw new SourceError(
        SourceErrorCode.NETWORK_ERROR,
        "Fetch API is not available in the current environment.",
        this.id
      );
    }

    const cleanQuery = encodeURIComponent(query.trim());
    const url = `https://api.jikan.moe/v4/manga?q=${cleanQuery}&limit=10`;

    try {
      const response = await this.fetchFn(url);
      if (response.status === 429) {
        throw new SourceError(
          SourceErrorCode.RATE_LIMITED,
          "Jikan API rate limit reached (max 3 req/sec). Please wait a moment.",
          this.id
        );
      }
      if (!response.ok) {
        throw new SourceError(
          SourceErrorCode.NETWORK_ERROR,
          `Jikan API request failed with status: ${response.status}`,
          this.id
        );
      }

      const json = await response.json();
      const rawList = Array.isArray(json.data) ? json.data : [];

      return rawList.map((item) =>
        normalizeManga(
          {
            id: `mal-${item.mal_id}`,
            title: item.title || "Untitled",
            altTitles: [item.title_english, item.title_japanese].filter(Boolean),
            description: item.synopsis || "",
            coverUrl: item.images?.webp?.image_url || item.images?.jpg?.image_url || null,
            authors: (item.authors || []).map((a) => a.name),
            artists: [],
            genres: (item.genres || []).map((g) => g.name),
            status: item.publishing ? "ongoing" : "completed",
            contentRating: "safe",
            language: "ja",
            updatedAt: null,
            latestChapter: item.chapters ? `Ch. ${item.chapters}` : null,
          },
          this.id
        )
      );
    } catch (err) {
      if (err instanceof SourceError) throw err;
      throw new SourceError(
        SourceErrorCode.NETWORK_ERROR,
        `Network error querying Jikan API: ${err.message}`,
        this.id,
        err
      );
    }
  }

  async getManga(mangaId) {
    if (!mangaId) {
      throw new SourceError(
        SourceErrorCode.INVALID_RESPONSE,
        "mangaId is required",
        this.id
      );
    }

    const malId = mangaId.replace(/^mal-/, "");
    const url = `https://api.jikan.moe/v4/manga/${encodeURIComponent(malId)}`;

    try {
      const response = await this.fetchFn(url);
      if (response.status === 404) {
        throw new SourceError(
          SourceErrorCode.NOT_FOUND,
          `Manga with ID '${mangaId}' was not found on MyAnimeList.`,
          this.id
        );
      }
      if (response.status === 429) {
        throw new SourceError(
          SourceErrorCode.RATE_LIMITED,
          "Jikan API rate limit reached. Please wait a moment.",
          this.id
        );
      }
      if (!response.ok) {
        throw new SourceError(
          SourceErrorCode.NETWORK_ERROR,
          `Jikan API details failed with status: ${response.status}`,
          this.id
        );
      }

      const json = await response.json();
      const item = json.data;

      return normalizeManga(
        {
          id: `mal-${item.mal_id}`,
          title: item.title || "Untitled",
          altTitles: [item.title_english, item.title_japanese].filter(Boolean),
          description: item.synopsis || "",
          coverUrl: item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url || null,
          authors: (item.authors || []).map((a) => a.name),
          artists: [],
          genres: (item.genres || []).map((g) => g.name),
          status: item.publishing ? "ongoing" : "completed",
          contentRating: "safe",
          language: "ja",
          updatedAt: null,
          latestChapter: item.chapters ? `Ch. ${item.chapters}` : null,
        },
        this.id
      );
    } catch (err) {
      if (err instanceof SourceError) throw err;
      throw new SourceError(
        SourceErrorCode.NETWORK_ERROR,
        `Error fetching manga details from Jikan: ${err.message}`,
        this.id,
        err
      );
    }
  }

  async getChapters() {
    throw new SourceError(
      SourceErrorCode.OPERATION_NOT_SUPPORTED,
      "The Jikan/MyAnimeList catalog provider does not host or index chapter page streams.",
      this.id
    );
  }

  async getPages() {
    throw new SourceError(
      SourceErrorCode.OPERATION_NOT_SUPPORTED,
      "The Jikan/MyAnimeList catalog provider does not host reading page streams.",
      this.id
    );
  }

  dispose() {}
}
