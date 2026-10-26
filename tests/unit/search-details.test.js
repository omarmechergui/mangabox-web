import assert from "node:assert/strict";
import test from "node:test";
import { defaultSourceManager } from "../../src/lib/sources/index.js";
import { SourceError, SourceErrorCode } from "../../src/lib/sources/errors.js";

test("Search: retrieves filtered results by query keywords", async () => {
  const apothecary = await defaultSourceManager.search("herbalist");
  assert.ok(apothecary.length > 0);
  assert.equal(apothecary[0].id, "mock-apothecary");

  const altTitleSearch = await defaultSourceManager.search("solo leveling");
  assert.ok(altTitleSearch.length > 0);
  assert.equal(altTitleSearch[0].id, "mock-solitary-hunter");
});

test("Search: filters by genre and status correctly", async () => {
  const fantasyOnly = await defaultSourceManager.search("", { genre: "fantasy" });
  assert.ok(fantasyOnly.length >= 2);
  for (const m of fantasyOnly) {
    const hasGenre = m.genres.some((g) => g.toLowerCase() === "fantasy");
    assert.ok(hasGenre, `Expected ${m.title} to have Fantasy genre`);
  }

  const completedOnly = await defaultSourceManager.search("", { status: "completed" });
  assert.ok(completedOnly.length >= 1);
  for (const m of completedOnly) {
    assert.equal(m.status, "completed");
  }
});

test("Manga Details: retrieves manga and chapters through SourceManager", async () => {
  const manga = await defaultSourceManager.getManga("mock-apothecary");
  assert.equal(manga.id, "mock-apothecary");
  assert.ok(manga.title);
  assert.ok(manga.coverUrl);

  const chapters = await defaultSourceManager.getChapters("mock-apothecary");
  assert.ok(Array.isArray(chapters));
  assert.ok(chapters.length > 0);
  assert.ok(chapters[0].id);
  assert.ok(chapters[0].chapterNumber !== null);
});

test("Manga Details: throws NOT_FOUND on unknown mangaId", async () => {
  await assert.rejects(
    () => defaultSourceManager.getManga("non-existent-id"),
    (err) => err instanceof SourceError && err.code === SourceErrorCode.NOT_FOUND
  );

  await assert.rejects(
    () => defaultSourceManager.getChapters("non-existent-id"),
    (err) => err instanceof SourceError && err.code === SourceErrorCode.NOT_FOUND
  );
});

test("Chapter Sorting: supports ascending and descending order", async () => {
  const chaptersDesc = await defaultSourceManager.getChapters("mock-apothecary", { order: "desc" });
  const chaptersAsc = await defaultSourceManager.getChapters("mock-apothecary", { order: "asc" });

  assert.ok(chaptersDesc[0].chapterNumber > chaptersDesc[chaptersDesc.length - 1].chapterNumber);
  assert.ok(chaptersAsc[0].chapterNumber < chaptersAsc[chaptersAsc.length - 1].chapterNumber);
});
