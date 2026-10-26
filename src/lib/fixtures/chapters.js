/**
 * Deterministic mock chapters and pages for MangaBox Web.
 */

export const MOCK_CHAPTERS = {
  "mock-apothecary": [
    {
      id: "mock-apothecary-ch-74",
      mangaId: "mock-apothecary",
      title: "Chapter 74: Imperial Banquet Preparations",
      chapterNumber: 74,
      volumeNumber: 12,
      publishedAt: "2026-10-20T10:00:00Z",
      pageCount: 2,
    },
    {
      id: "mock-apothecary-ch-73",
      mangaId: "mock-apothecary",
      title: "Chapter 73: The Rare Orchid",
      chapterNumber: 73,
      volumeNumber: 12,
      publishedAt: "2026-10-10T10:00:00Z",
      pageCount: 2,
    },
    {
      id: "mock-apothecary-ch-1",
      mangaId: "mock-apothecary",
      title: "Chapter 1: The Curse of the Powder",
      chapterNumber: 1,
      volumeNumber: 1,
      publishedAt: "2024-01-15T10:00:00Z",
      pageCount: 2,
    },
  ],
  "mock-frieren": [
    {
      id: "mock-frieren-ch-132",
      mangaId: "mock-frieren",
      title: "Chapter 132: The Quiet Village",
      chapterNumber: 132,
      volumeNumber: 13,
      publishedAt: "2026-10-19T11:15:00Z",
      pageCount: 2,
    },
    {
      id: "mock-frieren-ch-131",
      mangaId: "mock-frieren",
      title: "Chapter 131: The Golden Land (Part 4)",
      chapterNumber: 131,
      volumeNumber: 13,
      publishedAt: "2026-10-12T11:15:00Z",
      pageCount: 2,
    },
  ],
};

export const MOCK_PAGES = {
  default: [
    {
      id: "page-1",
      index: 0,
      imageUrl: "/images/demo/page-1.svg",
      width: 800,
      height: 1200,
    },
    {
      id: "page-2",
      index: 1,
      imageUrl: "/images/demo/page-2.svg",
      width: 800,
      height: 1200,
    },
  ],
};
