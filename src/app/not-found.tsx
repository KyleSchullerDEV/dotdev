import { Link } from "@/components/ui/Link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Page not found</h1>
      <p className="text-text-secondary mt-4 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="bg-accent pressed:bg-accent-hover hover:bg-accent-hover mt-8 rounded-md px-6 py-3 text-sm font-medium text-white no-underline transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
}
