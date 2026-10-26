"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchBar from "@/components/search/SearchBar";

export default function Header() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/search", label: "Search" },
    { href: "/library", label: "Library" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand logo & wordmark */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-text-primary hover:text-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md py-1"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white font-bold text-base shadow-xs">
              M
            </div>
            <span className="font-bold text-lg tracking-tight">MangaBox</span>
            <span className="hidden sm:inline-block rounded bg-surface-secondary px-1.5 py-0.5 text-[10px] font-mono text-text-secondary border border-border">
              MOCK
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-surface-secondary text-text-primary"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary/60"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Global search in header */}
        <div className="flex flex-1 max-w-md items-center justify-end gap-3">
          <div className="w-full hidden sm:block">
            <SearchBar placeholder="Search manga titles..." />
          </div>

          {/* Mobile search icon link */}
          <Link
            href="/search"
            aria-label="Search"
            className="sm:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
          >
            <svg
              className="w-5 h-5"
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
          </Link>

          {/* Mobile Navigation Links */}
          <nav className="flex md:hidden items-center gap-1">
            <Link
              href="/library"
              aria-label="Library"
              className={`flex h-10 w-10 items-center justify-center rounded-lg border border-border transition-colors ${
                pathname === "/library"
                  ? "bg-surface-secondary text-accent"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </Link>
            <Link
              href="/settings"
              aria-label="Settings"
              className={`flex h-10 w-10 items-center justify-center rounded-lg border border-border transition-colors ${
                pathname === "/settings"
                  ? "bg-surface-secondary text-accent"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <circle cx="12" cy="12" r="3" strokeWidth="2" />
              </svg>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
