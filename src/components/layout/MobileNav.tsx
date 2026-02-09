"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useConvexAuth } from "convex/react";

interface MobileNavProps {
  links: ReadonlyArray<{ readonly href: string; readonly label: string }>;
}

export function MobileNav({ links }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, isLoading } = useConvexAuth();

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        className="text-text-secondary hover:text-text relative z-50 flex h-10 w-10 items-center justify-center rounded-md"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {isOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>

      {isOpen && (
        <div
          id="mobile-menu"
          className="bg-bg fixed inset-0 z-40 pt-20"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <nav aria-label="Mobile navigation">
            <ul className="flex flex-col items-center gap-6 px-4">
              {links.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-text text-lg font-medium no-underline"
                    onClick={() => setIsOpen(false)}
                  >
                    {label}
                  </Link>
                </li>
              ))}
              {/* Auth link — uses <a> tag for external redirect to WorkOS */}
              {!isLoading && (
                <li className="border-border mt-2 border-t pt-4">
                  {isAuthenticated ? (
                    <a
                      href="/sign-out"
                      className="text-text-secondary text-lg font-medium no-underline"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign out
                    </a>
                  ) : (
                    <a
                      href="/sign-in"
                      className="text-text-secondary text-lg font-medium no-underline"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign in
                    </a>
                  )}
                </li>
              )}
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
