interface CalloutProps {
  type?: "info" | "warning" | "error";
  title?: string;
  children: React.ReactNode;
}

const styles = {
  info: "border-callout-info-border bg-callout-info-bg",
  warning: "border-callout-warning-border bg-callout-warning-bg",
  error: "border-callout-error-border bg-callout-error-bg",
} as const;

const icons = {
  info: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  warning: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  error: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
};

export function Callout({ type = "info", title, children }: CalloutProps) {
  return (
    <aside role="note" className={`my-6 rounded-lg border-l-4 p-4 ${styles[type]}`}>
      <div className="flex gap-3">
        <div className="shrink-0 pt-0.5">{icons[type]}</div>
        <div>
          {title && <strong className="mb-1 block font-semibold">{title}</strong>}
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </aside>
  );
}
