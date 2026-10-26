import { Suspense } from "react";
import SettingsPageClient from "./SettingsPageClient";

export const metadata = {
  title: "Settings — MangaBox Web",
  description: "Customize reading preferences, appearance, and local storage settings.",
};

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-4xl px-4 py-8 space-y-6">
          <div className="h-8 w-36 bg-surface-secondary animate-pulse rounded-md" />
          <div className="h-64 w-full bg-surface-secondary animate-pulse rounded-2xl" />
        </div>
      }
    >
      <SettingsPageClient />
    </Suspense>
  );
}
