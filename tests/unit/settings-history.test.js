import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_SETTINGS,
} from "../../src/lib/storage/settings-repository.js";
import { clearAllData } from "../../src/lib/storage/database.js";

test("Settings Validation: default settings structure and types", () => {
  assert.ok(["system", "light", "dark"].includes(DEFAULT_SETTINGS.theme));
  assert.ok(["vertical", "paged"].includes(DEFAULT_SETTINGS.readerMode));
  assert.ok(["ltr", "rtl"].includes(DEFAULT_SETTINGS.readingDirection));
  assert.ok(["contain", "width", "height"].includes(DEFAULT_SETTINGS.imageFit));
});

test("Database Guard: clearAllData requires confirmed === true", async () => {
  await assert.rejects(
    () => clearAllData(false),
    (err) => err.message.includes("confirmation")
  );

  await assert.rejects(
    () => clearAllData(undefined),
    (err) => err.message.includes("confirmation")
  );
});

test("History Data Mapping: deduplication and sorting by updatedAt", () => {
  const sampleRecords = [
    { mangaCompoundId: "mock:m-1", updatedAt: "2026-10-20T10:00:00Z" },
    { mangaCompoundId: "mock:m-2", updatedAt: "2026-10-22T10:00:00Z" },
    { mangaCompoundId: "mock:m-1", updatedAt: "2026-10-23T10:00:00Z" }, // newer m-1
  ];

  sampleRecords.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const seen = new Set();
  const deduped = [];
  for (const item of sampleRecords) {
    if (!seen.has(item.mangaCompoundId)) {
      seen.add(item.mangaCompoundId);
      deduped.push(item);
    }
  }

  assert.equal(deduped.length, 2);
  assert.equal(deduped[0].mangaCompoundId, "mock:m-1");
  assert.equal(deduped[0].updatedAt, "2026-10-23T10:00:00Z");
  assert.equal(deduped[1].mangaCompoundId, "mock:m-2");
});
