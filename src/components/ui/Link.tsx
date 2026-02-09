"use client";

import { Link as AriaLink, type LinkProps as AriaLinkProps } from "react-aria-components";

interface LinkProps extends AriaLinkProps {
  variant?: "default" | "nav" | "muted";
}

const variants = {
  default: "text-accent hover:text-accent-hover",
  nav: "text-text-secondary hover:text-text no-underline",
  muted: "text-text-tertiary hover:text-text-secondary",
} as const;

export function Link({ variant = "default", className = "", ...props }: LinkProps) {
  return (
    <AriaLink
      className={`focus-visible:outline-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
