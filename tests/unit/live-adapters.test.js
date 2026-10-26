import assert from "node:assert/strict";
import test from "node:test";
import {
  OpenMangaAdapter,
  JikanCatalogAdapter,
  SourceError,
  SourceErrorCode,
  defaultSourceManager,
} from "../../src/lib/sources/index.js";

test("OpenMangaAdapter: search, manga details, chapter, and pages flow", async () => {
  const adapter = new OpenMangaAdapter();
  assert.equal(adapter.id, "open-manga");
  assert.equal(adapter.capabilities.search, true);
  assert.equal(adapter.capabilities.pageList, true);

  // Search
  const results = await adapter.search("bobby");
  assert.ok(results.length > 0);
  assert.equal(results[0].id, "open-classic-bobby");
  assert.equal(results[0].sourceId, "open-manga");

  // Details
  const manga = await adapter.getManga("open-classic-bobby");
  assert.equal(manga.title, "Bobby Make-Believe (1915 Collection)");

  // Chapters
  const chapters = await adapter.getChapters("open-classic-bobby");
  assert.ok(chapters.length > 0);
  assert.equal(chapters[0].id, "open-classic-bobby-ch-1");

  // Pages
  const pages = await adapter.getPages("open-classic-bobby", "open-classic-bobby-ch-1");
  assert.ok(pages.length >= 2);
  assert.ok(pages[0].imageUrl);
});

test("OpenMangaAdapter: missing records throw typed SourceError NOT_FOUND", async () => {
  const adapter = new OpenMangaAdapter();
  await assert.rejects(
    () => adapter.getManga("unknown-open-id"),
    (err) => err instanceof SourceError && err.code === SourceErrorCode.NOT_FOUND
  );
});

test("JikanCatalogAdapter: mocks HTTP fetch responses cleanly", async () => {
  // Mock fetch simulating successful Jikan response
  const mockFetch = async (url) => {
    if (url.includes("limit=10")) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          data: [
            {
              mal_id: 13,
              title: "One Piece",
              title_english: "One Piece",
              title_japanese: "ONE PIECE",
              synopsis: "Gol D. Roger was known as the Pirate King...",
              images: { webp: { image_url: "https://example.com/op.webp" } },
              authors: [{ name: "Oda, Eiichiro" }],
              genres: [{ name: "Action" }, { name: "Adventure" }],
              publishing: true,
              chapters: null,
            },
          ],
        }),
      };
    }

    if (url.includes("/manga/13")) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            mal_id: 13,
            title: "One Piece",
            synopsis: "Gol D. Roger was known as the Pirate King...",
            images: { webp: { large_image_url: "https://example.com/op-large.webp" } },
            authors: [{ name: "Oda, Eiichiro" }],
            genres: [{ name: "Action" }],
            publishing: true,
            chapters: null,
          },
        }),
      };
    }

    return { ok: false, status: 404 };
  };

  const adapter = new JikanCatalogAdapter({ fetchFn: mockFetch });

  // Test search
  const results = await adapter.search("one piece");
  assert.equal(results.length, 1);
  assert.equal(results[0].id, "mal-13");
  assert.equal(results[0].title, "One Piece");

  // Test getManga
  const details = await adapter.getManga("mal-13");
  assert.equal(details.title, "One Piece");

  // Test honest capabilities: chapterList and pageList are unsupported
  assert.equal(adapter.capabilities.chapterList, false);
  assert.equal(adapter.capabilities.pageList, false);

  await assert.rejects(
    () => adapter.getChapters("mal-13"),
    (err) => err instanceof SourceError && err.code === SourceErrorCode.OPERATION_NOT_SUPPORTED
  );
  await assert.rejects(
    () => adapter.getPages("mal-13", "ch-1"),
    (err) => err instanceof SourceError && err.code === SourceErrorCode.OPERATION_NOT_SUPPORTED
  );
});

test("JikanCatalogAdapter: maps rate limits (429) to RATE_LIMITED error", async () => {
  const mock429Fetch = async () => ({
    ok: false,
    status: 429,
  });

  const adapter = new JikanCatalogAdapter({ fetchFn: mock429Fetch });
  await assert.rejects(
    () => adapter.search("naruto"),
    (err) => err instanceof SourceError && err.code === SourceErrorCode.RATE_LIMITED
  );
});

test("SourceManager: recognizes all registered sources and permits source-specific delegation", async () => {
  const sources = defaultSourceManager.listSources();
  const sourceIds = sources.map((s) => s.id);

  assert.ok(sourceIds.includes("mock"));
  assert.ok(sourceIds.includes("open-manga"));
  assert.ok(sourceIds.includes("jikan-catalog"));

  // Delegated search targeting open-manga
  const openResults = await defaultSourceManager.search("bobby", {}, "open-manga");
  assert.ok(openResults.length > 0);
  assert.equal(openResults[0].id, "open-classic-bobby");
});
