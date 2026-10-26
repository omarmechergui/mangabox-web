import { executeTransaction } from "./database.js";

export const DEFAULT_SETTINGS = {
  theme: "system", // system | light | dark
  readerMode: "vertical", // vertical | paged
  readingDirection: "ltr", // ltr | rtl
  imageFit: "contain", // contain | width | height
};

/**
 * Get all current settings, falling back to defaults.
 *
 * @returns {Promise<Object>}
 */
export async function getSettings() {
  const records = await executeTransaction("settings", "readonly", (store) =>
    store.getAll()
  );

  const settings = { ...DEFAULT_SETTINGS };
  if (records && Array.isArray(records)) {
    for (const record of records) {
      if (record.key in DEFAULT_SETTINGS) {
        settings[record.key] = record.value;
      }
    }
  }

  return settings;
}

/**
 * Update one or more settings keys.
 *
 * @param {Object} partialSettings
 * @returns {Promise<Object>} Updated settings
 */
export async function updateSettings(partialSettings = {}) {
  const current = await getSettings();
  const updated = { ...current };

  for (const [key, value] of Object.entries(partialSettings)) {
    if (key in DEFAULT_SETTINGS) {
      updated[key] = value;
      await executeTransaction("settings", "readwrite", (store) =>
        store.put({ key, value })
      );
    }
  }

  return updated;
}

/**
 * Reset all settings to default values.
 *
 * @returns {Promise<Object>} Default settings
 */
export async function resetSettings() {
  await executeTransaction("settings", "readwrite", (store) =>
    store.clear()
  );
  return { ...DEFAULT_SETTINGS };
}
