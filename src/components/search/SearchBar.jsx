"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar({
  initialQuery = "",
  placeholder = "Search manga by title or genre...",
  autoFocus = false,
  className = "",
}) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push(`/search`);
    }
  };

  const handleClear = () => {
    setQuery("");
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={`relative flex items-center w-full ${className}`}
    >
      <div className="absolute left-3.5 text-text-secondary pointer-events-none flex items-center">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-label="Search manga titles"
        className="w-full h-10 pl-10 pr-9 rounded-lg border border-border bg-surface text-sm text-text-primary placeholder:text-text-secondary/70 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
      />

      {query && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search query"
          className="absolute right-3 text-text-secondary hover:text-text-primary p-0.5 rounded cursor-pointer"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </form>
  );
}
