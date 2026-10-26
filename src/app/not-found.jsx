import Link from "next/link";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-secondary text-accent text-2xl font-bold mb-4 border border-border">
        404
      </div>
      <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-2">
        Page Not Found
      </h1>
      <p className="max-w-md text-sm text-text-secondary mb-8">
        The manga title, chapter, or route you are looking for does not exist in the mock library or has been moved.
      </p>
      <div className="flex items-center gap-3">
        <Button href="/" variant="primary" size="md">
          Back to Home
        </Button>
        <Button href="/search" variant="secondary" size="md">
          Search Titles
        </Button>
      </div>
    </div>
  );
}
