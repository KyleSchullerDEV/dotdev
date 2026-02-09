"use client";

import { Button as AriaButton, type ButtonProps as AriaButtonProps } from "react-aria-components";

const variants = {
  primary: "bg-accent text-white pressed:bg-accent-hover hover:bg-accent-hover disabled:opacity-50",
  secondary:
    "border border-border text-text-secondary pressed:bg-bg-secondary hover:border-border-secondary hover:text-text disabled:opacity-50",
  ghost: "text-text-secondary pressed:bg-bg-secondary hover:text-text disabled:opacity-50",
} as const;

const sizes = {
  sm: "rounded-md px-3 py-1.5 text-sm",
  md: "rounded-md px-4 py-2 text-sm",
  lg: "rounded-md px-6 py-3 text-sm",
} as const;

interface ButtonProps extends AriaButtonProps {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <AriaButton
      className={`focus-visible:outline-accent inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
