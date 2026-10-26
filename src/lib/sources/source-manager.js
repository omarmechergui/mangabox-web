import { SourceError, SourceErrorCode } from "./errors.js";
import { MockAdapter } from "./adapters/mock-adapter.js";
import { OpenMangaAdapter } from "./adapters/open-manga-adapter.js";
import { JikanCatalogAdapter } from "./adapters/jikan-adapter.js";

/**
 * SourceManager manages registered source adapters, provides unified operations,
 * validates capabilities, and normalizes unexpected errors into SourceError instances.
 */
export class SourceManager {
  constructor() {
    this._adapters = new Map();
    this._defaultSourceId = null;
  }

  /**
   * Register a source adapter instance.
   *
   * @param {Object} adapter - An adapter implementing the source contract
   * @param {boolean} [isDefault=false]
   */
  register(adapter, isDefault = false) {
    if (!adapter || typeof adapter !== "object" || !adapter.id) {
      throw new SourceError(
        SourceErrorCode.INVALID_RESPONSE,
        "Cannot register adapter: missing valid adapter instance or adapter.id"
      );
    }

    this._adapters.set(adapter.id, adapter);

    if (isDefault || !this._defaultSourceId) {
      this._defaultSourceId = adapter.id;
    }
  }

  /**
   * Get an adapter by ID or return the default adapter.
   *
   * @param {string} [sourceId]
   * @returns {Object}
   */
  getAdapter(sourceId) {
    const id = sourceId || this._defaultSourceId;
    if (!id || !this._adapters.has(id)) {
      throw new SourceError(
        SourceErrorCode.SOURCE_NOT_FOUND,
        `Source adapter '${sourceId || "default"}' is not registered.`
      );
    }
    return this._adapters.get(id);
  }

  /**
   * Lists all registered sources with metadata and capabilities.
   *
   * @returns {Array<Object>}
   */
  listSources() {
    return Array.from(this._adapters.values()).map((adapter) => ({
      id: adapter.id,
      name: adapter.name,
      kind: adapter.kind,
      version: adapter.version,
      capabilities: adapter.capabilities || {},
      isDefault: adapter.id === this._defaultSourceId,
    }));
  }

  /**
   * Sets the default source ID.
   *
   * @param {string} sourceId
   */
  setDefaultSource(sourceId) {
    if (!this._adapters.has(sourceId)) {
      throw new SourceError(
        SourceErrorCode.SOURCE_NOT_FOUND,
        `Cannot set default source: '${sourceId}' is not registered.`
      );
    }
    this._defaultSourceId = sourceId;
  }

  /**
   * Executes an adapter operation safely, mapping unknown exceptions to SourceError.
   */
  async _execute(sourceId, operationName, operationFn) {
    const adapter = this.getAdapter(sourceId);

    if (adapter.capabilities && adapter.capabilities[operationName] === false) {
      throw new SourceError(
        SourceErrorCode.OPERATION_NOT_SUPPORTED,
        `Operation '${operationName}' is not supported by source '${adapter.id}'.`,
        adapter.id
      );
    }

    try {
      return await operationFn(adapter);
    } catch (err) {
      if (err instanceof SourceError) {
        throw err;
      }
      throw new SourceError(
        SourceErrorCode.UNKNOWN_ERROR,
        err.message || `An error occurred while executing '${operationName}'.`,
        adapter.id,
        err
      );
    }
  }

  /**
   * Search titles across the specified source (or default).
   */
  async search(query = "", options = {}, sourceId) {
    return this._execute(sourceId, "search", (adapter) =>
      adapter.search(query, options)
    );
  }

  /**
   * Get single manga details.
   */
  async getManga(mangaId, sourceId) {
    return this._execute(sourceId, "mangaDetails", (adapter) =>
      adapter.getManga(mangaId)
    );
  }

  /**
   * Get chapter list for a manga.
   */
  async getChapters(mangaId, options = {}, sourceId) {
    return this._execute(sourceId, "chapterList", (adapter) =>
      adapter.getChapters(mangaId, options)
    );
  }

  /**
   * Get page list for a chapter.
   */
  async getPages(mangaId, chapterId, sourceId) {
    return this._execute(sourceId, "pageList", (adapter) =>
      adapter.getPages(mangaId, chapterId)
    );
  }

  /**
   * Check status of source.
   */
  async getStatus(sourceId) {
    return this._execute(sourceId, "status", (adapter) =>
      typeof adapter.getStatus === "function"
        ? adapter.getStatus()
        : Promise.resolve({ available: true, message: "OK" })
    );
  }
}

/**
 * Singleton instance pre-configured with default MockAdapter and live verified adapters.
 */
export const defaultSourceManager = new SourceManager();
defaultSourceManager.register(new MockAdapter(), true);
defaultSourceManager.register(new OpenMangaAdapter());
defaultSourceManager.register(new JikanCatalogAdapter());

