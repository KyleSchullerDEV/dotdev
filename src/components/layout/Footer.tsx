export function Footer() {
  return (
    <footer className="border-border border-t py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-text-tertiary text-center text-sm">
          <span>&copy; {new Date().getFullYear()} Kyle Schuller</span>
          <span className="mx-2" aria-hidden="true">
            &middot;
          </span>
          <a
            href="https://github.com/KyleSchullerDEV"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-tertiary hover:text-text-secondary"
          >
            GitHub
          </a>
        </p>
      </div>
    </footer>
  );
}
