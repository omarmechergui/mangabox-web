import { normalizeManga, normalizeChapter, normalizePage } from "../contracts.js";
import { SourceError, SourceErrorCode } from "../errors.js";

/**
 * Internet Archive IIIF v3 Adapter — Tier B verified live source.
 *
 * Connects directly to Internet Archive's browser-CORS-enabled endpoints:
 *  - Search: archive.org/advancedsearch.php (CORS: *)
 *  - Manifests: iiif.archive.org/iiif/3/{id}/manifest.json (CORS: *)
 *  - Page images: iiif.archive.org/image/iiif/3/... (CORS: *)
 *  - Cover thumbnails: archive.org/services/img/{id} (no CORS, but <img> works)
 *
 * NOTE: archive.org/metadata/{id} does NOT send CORS headers so it cannot
 * be fetched via browser JavaScript. All metadata is extracted from the
 * IIIF manifest and search response instead.
 */
export class InternetArchiveIIIFAdapter {
  constructor(options = {}) {
    this.id = options.id || "internet-archive";
    this.name = options.name || "Internet Archive (IIIF)";
    this.kind = "public-api";
    this.version = "3.0.0";
    this.capabilities = {
      search: true,
      mangaDetails: true,
      chapterList: true,
      pageList: true,
      latestUpdates: false,
      filterByGenre: false,
    };
    this.fetchFn =
      options.fetchFn ||
      (typeof fetch !== "undefined" ? fetch.bind(globalThis) : null);

    // In-memory cache to avoid refetching manifests during a session.
    // Key: identifier, Value: { manifest, timestamp }
    this._manifestCache = new Map();
    this._CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

    // Minimum delay between consecutive network requests (ms).
    this._lastRequestTime = 0;
    this._MIN_REQUEST_GAP_MS = options.minRequestGapMs ?? 350;
  }

  async getStatus() {
    return {
      available: true,
      message:
        "Internet Archive IIIF v3 service — public domain comics via browser CORS.",
    };
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  /**
   * Throttle requests to respect IA guidelines (~1 req/sec recommended).
   */
  async _paceRequest() {
    const now = Date.now();
    const elapsed = now - this._lastRequestTime;
    if (elapsed < this._MIN_REQUEST_GAP_MS) {
      await new Promise((resolve) =>
        setTimeout(resolve, this._MIN_REQUEST_GAP_MS - elapsed)
      );
    }
    this._lastRequestTime = Date.now();
  }

  /**
   * Perform a fetch with standard error mapping.
   */
  async _fetch(url) {
    if (!this.fetchFn) {
      throw new SourceError(
        SourceErrorCode.NETWORK_ERROR,
        "Fetch API is not available in the current environment.",
        this.id
      );
    }

    await this._paceRequest();

    try {
      const response = await this.fetchFn(url);

      if (response.status === 429) {
        throw new SourceError(
          SourceErrorCode.RATE_LIMITED,
          "Internet Archive rate limit reached. Please wait a moment and try again.",
          this.id
        );
      }

      if (response.status === 404) {
        throw new SourceError(
          SourceErrorCode.NOT_FOUND,
          `Resource not found: ${url}`,
          this.id
        );
      }

      if (!response.ok) {
        throw new SourceError(
          SourceErrorCode.NETWORK_ERROR,
          `Internet Archive request failed with status ${response.status}`,
          this.id
        );
      }

      return response;
    } catch (err) {
      if (err instanceof SourceError) throw err;

      // Detect CORS or network-level failures
      if (
        err.name === "TypeError" &&
        (err.message.includes("fetch") || err.message.includes("network"))
      ) {
        throw new SourceError(
          SourceErrorCode.NETWORK_ERROR,
          `Network error accessing Internet Archive: ${err.message}`,
          this.id,
          err
        );
      }

      throw new SourceError(
        SourceErrorCode.NETWORK_ERROR,
        `Error fetching from Internet Archive: ${err.message}`,
        this.id,
        err
      );
    }
  }

  /**
   * Fetch and cache a IIIF v3 manifest.
   */
  async _getManifest(identifier) {
    // Check cache
    const cached = this._manifestCache.get(identifier);
    if (cached && Date.now() - cached.timestamp < this._CACHE_TTL_MS) {
      return cached.manifest;
    }

    const url = `https://iiif.archive.org/iiif/3/${encodeURIComponent(identifier)}/manifest.json`;
    const response = await this._fetch(url);

    let manifest;
    try {
      manifest = await response.json();
    } catch (parseErr) {
      throw new SourceError(
        SourceErrorCode.INVALID_RESPONSE,
        `Failed to parse IIIF manifest for '${identifier}'.`,
        this.id,
        parseErr
      );
    }

    if (!manifest || manifest.type !== "Manifest") {
      throw new SourceError(
        SourceErrorCode.INVALID_RESPONSE,
        `Invalid IIIF manifest structure for '${identifier}': missing or wrong 'type'.`,
        this.id
      );
    }

    this._manifestCache.set(identifier, {
      manifest,
      timestamp: Date.now(),
    });

    return manifest;
  }

  /**
   * Extract a readable label from IIIF v3 label objects.
   * Labels are shaped like { "none": ["text"], "en": ["text"] }.
   */
  _extractLabel(labelObj) {
    if (!labelObj || typeof labelObj !== "object") return "";
    // Try common language keys in priority order
    for (const key of ["en", "none", "ja", "fr", "de"]) {
      if (Array.isArray(labelObj[key]) && labelObj[key].length > 0) {
        return labelObj[key].join(", ");
      }
    }
    // Fallback: first available key
    const firstKey = Object.keys(labelObj)[0];
    if (firstKey && Array.isArray(labelObj[firstKey])) {
      return labelObj[firstKey].join(", ");
    }
    return "";
  }

  /**
   * Extract metadata fields from IIIF manifest metadata array.
   * Manifest metadata is an array of { label: {...}, value: {...} } objects.
   */
  _extractMetadataField(metadataArray, fieldName) {
    if (!Array.isArray(metadataArray)) return null;
    const entry = metadataArray.find((m) => {
      const label = this._extractLabel(m.label);
      return label.toLowerCase() === fieldName.toLowerCase();
    });
    if (!entry) return null;
    return this._extractLabel(entry.value);
  }

  /**
   * Extract the image URL from a IIIF v3 canvas.
   *
   * Canvas structure can vary:
   *  - canvas.items[0].items[0].body.id (direct full-size image)
   *  - canvas.items[0].items[0].body.service[0].id (IIIF Image Service)
   *
   * We prefer the Image Service endpoint with a controlled size to avoid
   * downloading excessively large images.
   */
  _extractPageImageFromCanvas(canvas, maxWidth = 1200) {
    if (!canvas || !Array.isArray(canvas.items)) return null;

    for (const annotationPage of canvas.items) {
      if (!Array.isArray(annotationPage.items)) continue;

      for (const annotation of annotationPage.items) {
        const body = annotation.body;
        if (!body) continue;

        // If there's an Image Service, use it for controlled sizing
        if (Array.isArray(body.service) && body.service.length > 0) {
          const service = body.service[0];
          if (service.id) {
            return `${service.id}/full/${maxWidth},/0/default.jpg`;
          }
        }

        // Fallback: direct image URL
        if (body.id && body.type === "Image") {
          return body.id;
        }
      }
    }

    return null;
  }

  /**
   * Build a normalized manga ID from an IA identifier.
   */
  _makeMangaId(identifier) {
    return `ia-${identifier}`;
  }

  /**
   * Extract the original IA identifier from a manga ID.
   */
  _extractIdentifier(mangaId) {
    return mangaId.replace(/^ia-/, "");
  }

  // ---------------------------------------------------------------------------
  // Public adapter operations
  // ---------------------------------------------------------------------------

  /**
   * Search Internet Archive for comic books / texts.
   *
   * Uses the Advanced Search API which returns CORS-enabled JSON.
   * Restricts to mediatype:texts and subject:comic for relevance.
   */
  async search(query = "", options = {}) {
    if (!query || !query.trim()) {
      return [];
    }

    const cleanQuery = query.trim();
    const searchTerms = [
      "mediatype:texts",
      "subject:(comic OR comics OR manga OR \"comic book\")",
      cleanQuery,
    ].join(" AND ");

    const params = new URLSearchParams({
      q: searchTerms,
      "fl[]": "identifier,title,creator,date,description,subject,rights,licenseurl",
      rows: "20",
      page: "1",
      output: "json",
    });

    // fl[] needs special handling — URLSearchParams doesn't repeat keys.
    // Build the URL manually with the correct repeated fl[] params.
    const fields = [
      "identifier",
      "title",
      "creator",
      "date",
      "description",
      "subject",
      "rights",
      "licenseurl",
    ];
    const fieldParams = fields.map((f) => `fl[]=${f}`).join("&");
    const url = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(searchTerms)}&${fieldParams}&rows=20&page=1&output=json`;

    const response = await this._fetch(url);

    let json;
    try {
      json = await response.json();
    } catch (parseErr) {
      throw new SourceError(
        SourceErrorCode.INVALID_RESPONSE,
        "Failed to parse Internet Archive search response.",
        this.id,
        parseErr
      );
    }

    const docs = json?.response?.docs;
    if (!Array.isArray(docs)) {
      return [];
    }

    return docs
      .filter((doc) => doc.identifier && doc.title)
      .map((doc) => {
        const creator = Array.isArray(doc.creator)
          ? doc.creator
          : doc.creator
            ? [doc.creator]
            : [];
        const subjects = Array.isArray(doc.subject)
          ? doc.subject
          : doc.subject
            ? [doc.subject]
            : [];
        const description = Array.isArray(doc.description)
          ? doc.description.join(" — ")
          : doc.description || "";

        return normalizeManga(
          {
            id: this._makeMangaId(doc.identifier),
            title: doc.title,
            altTitles: [],
            description: description.slice(0, 500),
            // Cover: archive.org/services/img works for <img> display (no CORS needed)
            coverUrl: `https://archive.org/services/img/${doc.identifier}`,
            authors: creator,
            artists: [],
            genres: subjects.slice(0, 8),
            status: "completed",
            contentRating: "safe",
            language: "en",
            updatedAt: doc.date || null,
            latestChapter: null,
          },
          this.id
        );
      });
  }

  /**
   * Get manga details by fetching the IIIF manifest.
   *
   * Since archive.org/metadata lacks CORS, we extract all metadata
   * from the manifest itself (which has metadata embedded) plus the
   * known cover image URL pattern.
   */
  async getManga(mangaId) {
    if (!mangaId) {
      throw new SourceError(
        SourceErrorCode.INVALID_RESPONSE,
        "mangaId is required",
        this.id
      );
    }

    const identifier = this._extractIdentifier(mangaId);
    const manifest = await this._getManifest(identifier);

    const title = this._extractLabel(manifest.label) || identifier;
    const metadata = manifest.metadata || [];

    const creator = this._extractMetadataField(metadata, "creator") || "";
    const date = this._extractMetadataField(metadata, "date") || null;
    const language = this._extractMetadataField(metadata, "language") || "en";
    const rights =
      this._extractMetadataField(metadata, "rights") ||
      this._extractMetadataField(metadata, "licenseurl") ||
      null;

    // Extract description from manifest summary or requiredStatement
    let description = "";
    if (manifest.summary) {
      description = this._extractLabel(manifest.summary);
    }
    if (!description && manifest.requiredStatement) {
      description = this._extractLabel(manifest.requiredStatement.value);
    }

    // Add rights attribution to description if available
    if (rights) {
      description = description
        ? `${description}\n\nRights: ${rights}`
        : `Rights: ${rights}`;
    }

    const authors = creator ? creator.split(",").map((s) => s.trim()) : [];
    const pageCount = Array.isArray(manifest.items) ? manifest.items.length : 0;

    return normalizeManga(
      {
        id: mangaId,
        title,
        altTitles: [],
        description,
        coverUrl: `https://archive.org/services/img/${identifier}`,
        authors,
        artists: [],
        genres: ["Internet Archive", "Scanned"],
        status: "completed",
        contentRating: "safe",
        language: language.slice(0, 5),
        updatedAt: date,
        latestChapter: pageCount > 0 ? `${pageCount} pages` : null,
      },
      this.id
    );
  }

  /**
   * Get chapters for a manga.
   *
   * Each Internet Archive item (book/issue) maps to exactly ONE chapter
   * representing the entire issue. We do not invent artificial chapter
   * divisions for scanned publications.
   */
  async getChapters(mangaId, options = {}) {
    if (!mangaId) {
      throw new SourceError(
        SourceErrorCode.INVALID_RESPONSE,
        "mangaId is required",
        this.id
      );
    }

    const identifier = this._extractIdentifier(mangaId);
    const manifest = await this._getManifest(identifier);

    const title = this._extractLabel(manifest.label) || identifier;
    const pageCount = Array.isArray(manifest.items) ? manifest.items.length : 0;
    const date = this._extractMetadataField(manifest.metadata || [], "date");

    const chapter = normalizeChapter(
      {
        id: `ia-ch-${identifier}`,
        title: `Full Issue: ${title}`,
        chapterNumber: 1,
        volumeNumber: null,
        publishedAt: date,
        pageCount,
      },
      mangaId,
      this.id
    );

    return [chapter];
  }

  /**
   * Get pages by parsing ordered canvases from the IIIF v3 manifest.
   */
  async getPages(mangaId, chapterId) {
    if (!mangaId || !chapterId) {
      throw new SourceError(
        SourceErrorCode.INVALID_RESPONSE,
        "Both mangaId and chapterId are required",
        this.id
      );
    }

    const identifier = this._extractIdentifier(mangaId);
    const expectedChapterId = `ia-ch-${identifier}`;

    if (chapterId !== expectedChapterId) {
      throw new SourceError(
        SourceErrorCode.NOT_FOUND,
        `Chapter '${chapterId}' not found for manga '${mangaId}'.`,
        this.id
      );
    }

    const manifest = await this._getManifest(identifier);
    const canvases = manifest.items;

    if (!Array.isArray(canvases) || canvases.length === 0) {
      throw new SourceError(
        SourceErrorCode.INVALID_RESPONSE,
        `No pages found in manifest for '${identifier}'.`,
        this.id
      );
    }

    const pages = [];
    for (let i = 0; i < canvases.length; i++) {
      const canvas = canvases[i];
      const imageUrl = this._extractPageImageFromCanvas(canvas);

      if (!imageUrl) {
        // Skip canvases that don't have usable images
        continue;
      }

      pages.push(
        normalizePage(
          {
            id: `ia-page-${identifier}-${i}`,
            index: pages.length,
            imageUrl,
            width: canvas.width || null,
            height: canvas.height || null,
          },
          pages.length,
          this.id
        )
      );
    }

    if (pages.length === 0) {
      throw new SourceError(
        SourceErrorCode.INVALID_RESPONSE,
        `No usable page images found in manifest for '${identifier}'.`,
        this.id
      );
    }

    return pages;
  }

  dispose() {
    this._manifestCache.clear();
  }
}
