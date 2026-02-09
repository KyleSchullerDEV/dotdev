import Link from "next/link";
import { MobileNav } from "./MobileNav";
import { AuthNav } from "./AuthNav";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
] as const;

export function Header() {
  return (
    <header className="border-border bg-bg/80 sticky top-0 z-50 border-b backdrop-blur-sm">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-text text-lg font-semibold tracking-tight no-underline">
          Kyle Schuller
        </Link>

        {/* Desktop nav + auth */}
        <div className="hidden items-center gap-6 sm:flex">
          <nav aria-label="Main navigation">
            <ul className="flex gap-6">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-text-secondary hover:text-text text-sm font-medium no-underline transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <AuthNav />
        </div>

        {/* Mobile nav */}
        <MobileNav links={navLinks} />
      </div>
    </header>
  );
}
