import assert from "node:assert/strict";
import test from "node:test";
import { defaultSourceManager } from "../../src/lib/sources/index.js";
import { buildProgressKey } from "../../src/lib/storage/progress-repository.js";

test("Reader Flow: retrieves chapters and pages for reader route", async () => {
  const manga = await defaultSourceManager.getManga("mock-apothecary");
  assert.equal(manga.id, "mock-apothecary");

  const chaptersAsc = await defaultSourceManager.getChapters("mock-apothecary", { order: "asc" });
  assert.ok(chaptersAsc.length >= 2);
  assert.ok(chaptersAsc[0].chapterNumber < chaptersAsc[chaptersAsc.length - 1].chapterNumber);

  const firstChapter = chaptersAsc[0];
  const pages = await defaultSourceManager.getPages(manga.id, firstChapter.id);
  assert.ok(pages.length >= 2);
  assert.equal(pages[0].index, 0);
  assert.ok(pages[0].imageUrl);
});

test("Reader Logic: chapter navigation calculation", () => {
  const chapters = [
    { id: "ch-1", chapterNumber: 1 },
    { id: "ch-2", chapterNumber: 2 },
    { id: "ch-3", chapterNumber: 3 },
  ];

  const currentIdx = 1; // ch-2
  const prevChapter = currentIdx > 0 ? chapters[currentIdx - 1] : null;
  const nextChapter = currentIdx < chapters.length - 1 ? chapters[currentIdx + 1] : null;

  assert.equal(prevChapter.id, "ch-1");
  assert.equal(nextChapter.id, "ch-3");
});

test("Reader Logic: paged mode navigation boundary clamps", () => {
  const totalPages = 5;
  const clampPage = (p) => Math.min(Math.max(0, p), totalPages - 1);

  assert.equal(clampPage(-1), 0);
  assert.equal(clampPage(0), 0);
  assert.equal(clampPage(2), 2);
  assert.equal(clampPage(5), 4);
  assert.equal(clampPage(10), 4);
});

test("Reader Logic: reading progress percentage formula", () => {
  const calculatePercent = (pageIndex, totalPages) =>
    totalPages > 0 ? Math.min(100, Math.round(((pageIndex + 1) / totalPages) * 100)) : 0;

  assert.equal(calculatePercent(0, 10), 10);
  assert.equal(calculatePercent(4, 10), 50);
  assert.equal(calculatePercent(9, 10), 100);
});

test("Reader Progress: compound key stability", () => {
  const key = buildProgressKey("mock", "mock-apothecary", "ch-1");
  assert.equal(key, "mock:mock-apothecary:ch-1");
});
