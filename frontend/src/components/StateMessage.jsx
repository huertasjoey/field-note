import { Loader2, AlertCircle, Inbox } from "lucide-react";

export function Loading({ label = "Loading…" }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-16 text-muted">
      <Loader2 className="animate-spin" size={20} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" className="mx-auto max-w-md py-16 text-center">
      <AlertCircle className="mx-auto text-accent" size={32} aria-hidden="true" />
      <p className="mt-3 font-medium">Something went wrong</p>
      <p className="mt-1 text-sm text-muted">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-full border border-ink px-5 py-2 text-sm transition-colors hover:bg-ink hover:text-white"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, children }) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <Inbox className="mx-auto text-muted" size={32} aria-hidden="true" />
      <p className="mt-3 font-medium">{title}</p>
      {children && <div className="mt-1 text-sm text-muted">{children}</div>}
    </div>
  );
}
