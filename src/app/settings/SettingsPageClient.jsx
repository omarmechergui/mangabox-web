"use client";

import { useState, useEffect } from "react";
import {
  getSettings,
  updateSettings,
  resetSettings,
  DEFAULT_SETTINGS,
} from "@/lib/storage/settings-repository";
import { clearAllData } from "@/lib/storage/database";
import Button from "@/components/ui/Button";

export default function SettingsPageClient() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    let ignore = false;
    getSettings()
      .then((loaded) => {
        if (!ignore) {
          setSettings(loaded);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleChange = async (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);

    // Apply theme immediately to document root if changed
    if (key === "theme") {
      if (value === "dark") {
        document.documentElement.classList.add("dark");
      } else if (value === "light") {
        document.documentElement.classList.remove("dark");
      } else {
        // System preference
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    }

    try {
      await updateSettings({ [key]: value });
      setStatusMessage({ type: "success", text: "Settings saved to browser storage." });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      setStatusMessage({ type: "error", text: `Failed to save: ${err.message}` });
    }
  };

  const handleResetSettings = async () => {
    try {
      const defaults = await resetSettings();
      setSettings(defaults);
      setStatusMessage({ type: "success", text: "Settings reset to defaults." });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      setStatusMessage({ type: "error", text: `Failed to reset: ${err.message}` });
    }
  };

  const handleClearAllData = async () => {
    setIsClearing(true);
    try {
      await clearAllData(true);
      setIsConfirmingClear(false);
      setIsClearing(false);
      setSettings(DEFAULT_SETTINGS);
      setStatusMessage({
        type: "success",
        text: "All local data (library, reading progress, and settings) has been cleared.",
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      setIsClearing(false);
      setStatusMessage({ type: "error", text: `Failed to clear data: ${err.message}` });
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-8 space-y-6">
        <div className="h-8 w-36 bg-surface-secondary animate-pulse rounded-md" />
        <div className="h-64 w-full bg-surface-secondary animate-pulse rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Settings
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Customize your appearance and reader preferences stored locally in your browser.
        </p>
      </div>

      {statusMessage && (
        <div
          role="status"
          className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/40"
              : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800/40"
          }`}
        >
          <span>{statusMessage.text}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-[11px] underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Appearance Preferences */}
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6 space-y-4">
        <h2 className="text-base font-semibold text-text-primary border-b border-border pb-2.5">
          App Appearance
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label htmlFor="theme-select" className="text-sm font-medium text-text-primary block">
              Color Theme
            </label>
            <p className="text-xs text-text-secondary">
              Theme for navigation shell. Reader retains its dark editorial palette.
            </p>
          </div>

          <select
            id="theme-select"
            value={settings.theme}
            onChange={(e) => handleChange("theme", e.target.value)}
            className="h-9 w-full sm:w-44 rounded-lg border border-border bg-surface px-3 text-xs text-text-primary focus:outline-none focus:border-accent"
          >
            <option value="system">System Default</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </section>

      {/* Reader Preferences */}
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6 space-y-5">
        <h2 className="text-base font-semibold text-text-primary border-b border-border pb-2.5">
          Reader Defaults
        </h2>

        {/* Reader Mode */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label htmlFor="reader-mode-select" className="text-sm font-medium text-text-primary block">
              Default Reading Mode
            </label>
            <p className="text-xs text-text-secondary">
              Choose between continuous vertical scroll or one page at a time.
            </p>
          </div>

          <select
            id="reader-mode-select"
            value={settings.readerMode}
            onChange={(e) => handleChange("readerMode", e.target.value)}
            className="h-9 w-full sm:w-44 rounded-lg border border-border bg-surface px-3 text-xs text-text-primary focus:outline-none focus:border-accent"
          >
            <option value="vertical">Vertical Scroll</option>
            <option value="paged">Paged</option>
          </select>
        </div>

        {/* Reading Direction */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label htmlFor="reading-direction-select" className="text-sm font-medium text-text-primary block">
              Paged Reading Direction
            </label>
            <p className="text-xs text-text-secondary">
              Determines whether clicking next or pressing Right Arrow moves forward or backward.
            </p>
          </div>

          <select
            id="reading-direction-select"
            value={settings.readingDirection}
            onChange={(e) => handleChange("readingDirection", e.target.value)}
            className="h-9 w-full sm:w-44 rounded-lg border border-border bg-surface px-3 text-xs text-text-primary focus:outline-none focus:border-accent"
          >
            <option value="ltr">Left to Right (LTR)</option>
            <option value="rtl">Right to Left (RTL / Manga)</option>
          </select>
        </div>

        {/* Image Fit */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label htmlFor="image-fit-select" className="text-sm font-medium text-text-primary block">
              Default Image Scaling
            </label>
            <p className="text-xs text-text-secondary">
              How chapter pages scale within the reading viewport.
            </p>
          </div>

          <select
            id="image-fit-select"
            value={settings.imageFit}
            onChange={(e) => handleChange("imageFit", e.target.value)}
            className="h-9 w-full sm:w-44 rounded-lg border border-border bg-surface px-3 text-xs text-text-primary focus:outline-none focus:border-accent"
          >
            <option value="contain">Contain (Fit screen)</option>
            <option value="width">Fit Width</option>
            <option value="height">Fit Height</option>
          </select>
        </div>

        <div className="pt-2 border-t border-border flex justify-end">
          <Button variant="ghost" size="sm" onClick={handleResetSettings} className="text-xs">
            Reset Reader Defaults
          </Button>
        </div>
      </section>

      {/* Clear Local Data Section */}
      <section className="rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/10 p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-rose-800 dark:text-rose-400">
            Clear Local Data
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Permanently erases all saved manga in your Library, reading progress history, and custom settings from this browser&apos;s IndexedDB. This action cannot be undone.
          </p>
        </div>

        {isConfirmingClear ? (
          <div className="p-4 rounded-xl border border-rose-300 dark:border-rose-800 bg-surface space-y-3">
            <p className="text-xs font-semibold text-rose-700 dark:text-rose-400">
              Are you sure? This will delete all your local reading history and library entries.
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="danger"
                size="sm"
                disabled={isClearing}
                onClick={handleClearAllData}
              >
                {isClearing ? "Deleting..." : "Yes, Delete Everything"}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={isClearing}
                onClick={() => setIsConfirmingClear(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsConfirmingClear(true)}
          >
            Clear All Data...
          </Button>
        )}
      </section>
    </div>
  );
}
