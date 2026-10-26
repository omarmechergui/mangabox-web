/**
 * Custom Error for database and persistence operations.
 */
export class StorageError extends Error {
  constructor(code, message, cause = null) {
    super(message);
    this.name = "StorageError";
    this.code = code;
    this.cause = cause;
  }
}

export const StorageErrorCode = {
  UNAVAILABLE: "STORAGE_UNAVAILABLE",
  BLOCKED: "STORAGE_BLOCKED",
  TRANSACTION_FAILED: "TRANSACTION_FAILED",
  INVALID_RECORD: "INVALID_RECORD",
};

const DB_NAME = "mangabox-db";
const DB_VERSION = 1;

/**
 * Check if IndexedDB is supported in the current environment.
 */
export function isIndexedDBAvailable() {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return false;
  }
  try {
    return window.indexedDB !== null && window.indexedDB !== undefined;
  } catch {
    return false;
  }
}

let dbInstancePromise = null;

/**
 * Initialize or retrieve the singleton IndexedDB connection.
 * Creates the object stores: 'library', 'progress', 'settings'.
 *
 * @returns {Promise<IDBDatabase>}
 */
export function openDatabase() {
  if (!isIndexedDBAvailable()) {
    return Promise.reject(
      new StorageError(
        StorageErrorCode.UNAVAILABLE,
        "IndexedDB is not supported or accessible in this environment."
      )
    );
  }

  if (dbInstancePromise) {
    return dbInstancePromise;
  }

  dbInstancePromise = new Promise((resolve, reject) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Library store: compound key [sourceId, mangaId]
        if (!db.objectStoreNames.contains("library")) {
          const libraryStore = db.createObjectStore("library", {
            keyPath: "compoundId",
          });
          libraryStore.createIndex("sourceId", "sourceId", { unique: false });
          libraryStore.createIndex("savedAt", "savedAt", { unique: false });
        }

        // Progress store: key is compoundId [sourceId, mangaId, chapterId]
        if (!db.objectStoreNames.contains("progress")) {
          const progressStore = db.createObjectStore("progress", {
            keyPath: "compoundId",
          });
          progressStore.createIndex("mangaCompoundId", "mangaCompoundId", { unique: false });
          progressStore.createIndex("updatedAt", "updatedAt", { unique: false });
        }

        // Settings store: key is string key (e.g. 'theme', 'readerMode')
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "key" });
        }
      };

      request.onsuccess = (event) => {
        const db = event.target.result;
        db.onversionchange = () => {
          db.close();
          dbInstancePromise = null;
        };
        resolve(db);
      };

      request.onerror = (event) => {
        dbInstancePromise = null;
        reject(
          new StorageError(
            StorageErrorCode.TRANSACTION_FAILED,
            "Failed to open IndexedDB database.",
            event.target.error
          )
        );
      };

      request.onblocked = () => {
        reject(
          new StorageError(
            StorageErrorCode.BLOCKED,
            "Database upgrade is blocked by an open tab or process."
          )
        );
      };
    } catch (err) {
      dbInstancePromise = null;
      reject(
        new StorageError(
          StorageErrorCode.UNAVAILABLE,
          err.message || "Failed to initialize IndexedDB.",
          err
        )
      );
    }
  });

  return dbInstancePromise;
}

/**
 * Execute a transaction on an object store safely.
 *
 * @param {string} storeName
 * @param {"readonly"|"readwrite"} mode
 * @param {Function} callback (store) => IDBRequest
 * @returns {Promise<*>}
 */
export async function executeTransaction(storeName, mode, callback) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      const request = callback(store);

      tx.onerror = (event) => {
        reject(
          new StorageError(
            StorageErrorCode.TRANSACTION_FAILED,
            `Transaction error on store '${storeName}': ${event.target?.error?.message || "unknown"}`,
            event.target?.error
          )
        );
      };

      if (request) {
        request.onsuccess = (event) => {
          resolve(event.target.result);
        };
        request.onerror = (event) => {
          reject(
            new StorageError(
              StorageErrorCode.TRANSACTION_FAILED,
              `Request error on store '${storeName}': ${event.target?.error?.message || "unknown"}`,
              event.target?.error
            )
          );
        };
      } else {
        tx.oncomplete = () => resolve(true);
      }
    } catch (err) {
      reject(
        new StorageError(
          StorageErrorCode.TRANSACTION_FAILED,
          `Failed to execute transaction on store '${storeName}': ${err.message}`,
          err
        )
      );
    }
  });
}

/**
 * Clear all data from all object stores.
 * Requires explicit user confirmation parameter to prevent accidental deletion.
 *
 * @param {boolean} confirmed
 * @returns {Promise<boolean>}
 */
export async function clearAllData(confirmed) {
  if (confirmed !== true) {
    throw new StorageError(
      StorageErrorCode.TRANSACTION_FAILED,
      "Cannot clear database without explicit confirmation."
    );
  }

  const stores = ["library", "progress", "settings"];
  for (const store of stores) {
    await executeTransaction(store, "readwrite", (s) => s.clear());
  }

  return true;
}
