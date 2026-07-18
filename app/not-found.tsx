import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-4xl font-bold text-navy mb-4">404</h1>
      <p className="text-muted mb-8">The page you are looking for does not exist.</p>
      <Link
        href="/"
        className="inline-flex items-center justify-center font-medium rounded-lg px-4 py-2 text-sm bg-navy text-white hover:bg-navy-light shadow-sm hover:shadow-raised transition-all focus:outline-none focus:ring-2 focus:ring-navy/30"
      >
        Back to Home
      </Link>
    </div>
  );
}
