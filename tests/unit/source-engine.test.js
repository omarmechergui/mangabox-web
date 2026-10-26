import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeManga,
  normalizeChapter,
  normalizePage,
  SourceError,
  SourceErrorCode,
  MockAdapter,
  SourceManager,
} from "../../src/lib/sources/index.js";

test("Contracts: normalizeManga with complete data", () => {
  const raw = {
    id: "manga-1",
    title: "Test Title",
    altTitles: ["Alt 1"],
    description: "Sample description",
    coverUrl: "/images/placeholders/cover-apothecary.svg",
    genres: ["Fantasy"],
    status: "ongoing",
  };

  const normalized = normalizeManga(raw, "mock");
  assert.equal(normalized.id, "manga-1");
  assert.equal(normalized.sourceId, "mock");
  assert.equal(normalized.title, "Test Title");
  assert.equal(normalized.status, "ongoing");
  assert.deepEqual(normalized.altTitles, ["Alt 1"]);
});

test("Contracts: normalizeManga handles missing / unknown fields gracefully", () => {
  const raw = {
    id: "manga-2",
    title: "Minimal Title",
  };

  const normalized = normalizeManga(raw, "mock");
  assert.equal(normalized.id, "manga-2");
  assert.equal(normalized.status, "unknown");
  assert.deepEqual(normalized.genres, []);
  assert.deepEqual(normalized.authors, []);
  assert.equal(normalized.description, "");
  assert.equal(normalized.coverUrl, null);
});

test("Contracts: normalizeManga rejects invalid input", () => {
  assert.throws(
    () => normalizeManga(null, "mock"),
    (err) => err instanceof SourceError && err.code === SourceErrorCode.INVALID_RESPONSE
  );

  assert.throws(
    () => normalizeManga({ title: "No ID" }, "mock"),
    (err) => err instanceof SourceError && err.code === SourceErrorCode.INVALID_RESPONSE
  );
});

test("Contracts: normalizeChapter and normalizePage", () => {
  const chapter = normalizeChapter(
    { id: "ch-1", chapterNumber: "12.5" },
    "manga-1",
    "mock"
  );
  assert.equal(chapter.id, "ch-1");
  assert.equal(chapter.mangaId, "manga-1");
  assert.equal(chapter.chapterNumber, 12.5);

  const page = normalizePage({ imageUrl: "/images/demo/page-1.svg" }, 0, "mock");
  assert.equal(page.id, "page-1");
  assert.equal(page.index, 0);
  assert.equal(page.imageUrl, "/images/demo/page-1.svg");
});

test("MockAdapter: search returns normalized matching results", async () => {
  const adapter = new MockAdapter();

  // Search by query
  const herbalistResults = await adapter.search("herbalist");
  assert.ok(herbalistResults.length > 0);
  assert.equal(herbalistResults[0].id, "mock-apothecary");

  // Search by genre
  const mysteryResults = await adapter.search("", { genre: "mystery" });
  assert.ok(mysteryResults.some((m) => m.id === "mock-apothecary"));

  // Search non-existent
  const emptyResults = await adapter.search("nonexistent-query-xyz");
  assert.equal(emptyResults.length, 0);
});

test("MockAdapter: getManga returns details or throws NOT_FOUND", async () => {
  const adapter = new MockAdapter();

  const manga = await adapter.getManga("mock-apothecary");
  assert.equal(manga.title, "The Herbalist's Journal");

  await assert.rejects(
    () => adapter.getManga("invalid-id"),
    (err) => err instanceof SourceError && err.code === SourceErrorCode.NOT_FOUND
  );
});

test("MockAdapter: getChapters returns sorted chapters", async () => {
  const adapter = new MockAdapter();

  const chaptersDesc = await adapter.getChapters("mock-apothecary", { order: "desc" });
  assert.ok(chaptersDesc.length >= 2);
  assert.ok(chaptersDesc[0].chapterNumber > chaptersDesc[chaptersDesc.length - 1].chapterNumber);
});

test("MockAdapter: getPages returns valid chapter pages", async () => {
  const adapter = new MockAdapter();
  const pages = await adapter.getPages("mock-apothecary", "mock-apothecary-ch-74");
  assert.ok(pages.length >= 2);
  assert.ok(pages[0].imageUrl);
});

test("SourceManager: registry, delegation, and error handling", async () => {
  const manager = new SourceManager();
  const mockAdapter = new MockAdapter();

  manager.register(mockAdapter, true);

  const sources = manager.listSources();
  assert.equal(sources.length, 1);
  assert.equal(sources[0].id, "mock");
  assert.equal(sources[0].isDefault, true);

  // Delegation
  const searchResults = await manager.search("shadow");
  assert.ok(searchResults.length > 0);
  assert.equal(searchResults[0].id, "mock-solitary-hunter");

  // Source not found
  await assert.rejects(
    () => manager.search("test", {}, "unknown-source"),
    (err) => err instanceof SourceError && err.code === SourceErrorCode.SOURCE_NOT_FOUND
  );

  // Unsupported operation handling
  const limitedAdapter = {
    id: "limited",
    name: "Limited Source",
    kind: "mock",
    capabilities: { search: false },
  };
  manager.register(limitedAdapter);
  await assert.rejects(
    () => manager.search("test", {}, "limited"),
    (err) => err instanceof SourceError && err.code === SourceErrorCode.OPERATION_NOT_SUPPORTED
  );
});
