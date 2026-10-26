import assert from "node:assert/strict";
import test from "node:test";
import {
  StorageError,
  StorageErrorCode,
  isIndexedDBAvailable,
} from "../../src/lib/storage/database.js";
import {
  buildLibraryKey,
} from "../../src/lib/storage/library-repository.js";
import {
  buildProgressKey,
} from "../../src/lib/storage/progress-repository.js";
import {
  DEFAULT_SETTINGS,
} from "../../src/lib/storage/settings-repository.js";

test("Storage: isIndexedDBAvailable safely returns boolean in Node environment", () => {
  // In Node.js environment without window, must safely return false
  const available = isIndexedDBAvailable();
  assert.equal(available, false);
});

test("Library Repository: buildLibraryKey formats compound keys correctly", () => {
  const key = buildLibraryKey("mock", "manga-123");
  assert.equal(key, "mock:manga-123");

  assert.throws(
    () => buildLibraryKey("", "manga-123"),
    (err) => err instanceof StorageError && err.code === StorageErrorCode.INVALID_RECORD
  );

  assert.throws(
    () => buildLibraryKey("mock", ""),
    (err) => err instanceof StorageError && err.code === StorageErrorCode.INVALID_RECORD
  );
});

test("Progress Repository: buildProgressKey formats compound keys correctly", () => {
  const key = buildProgressKey("mock", "manga-123", "ch-1");
  assert.equal(key, "mock:manga-123:ch-1");

  assert.throws(
    () => buildProgressKey("mock", "manga-123", ""),
    (err) => err instanceof StorageError && err.code === StorageErrorCode.INVALID_RECORD
  );
});

test("Settings Repository: DEFAULT_SETTINGS contract", () => {
  assert.equal(DEFAULT_SETTINGS.theme, "system");
  assert.equal(DEFAULT_SETTINGS.readerMode, "vertical");
  assert.equal(DEFAULT_SETTINGS.readingDirection, "ltr");
  assert.equal(DEFAULT_SETTINGS.imageFit, "contain");
});
