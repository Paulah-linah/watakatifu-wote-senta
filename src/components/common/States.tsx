import React from 'react';
import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react';

export const LoadingGrid: React.FC<{ count?: number; className?: string; itemClassName?: string }> = ({
  count = 3,
  className = 'grid grid-cols-1 md:grid-cols-3 gap-6',
  itemClassName = 'h-80',
}) => (
  <div className={className} aria-busy="true" aria-label="Loading">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`${itemClassName} rounded-3xl bg-sand/50 animate-pulse`} />
    ))}
  </div>
);

export const ErrorState: React.FC<{ message?: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div role="alert" className="text-center py-12 px-6 card border-rose-200! max-w-lg mx-auto">
    <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
    <h3 className="font-serif text-xl font-semibold text-sky-950">We couldn&apos;t load this section</h3>
    <p className="text-xs text-stone-500 mt-1">{message || 'Please check your connection and try again.'}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold"
      >
        <RefreshCw className="w-3.5 h-3.5" /> Try again
      </button>
    )}
  </div>
);

export const EmptyState: React.FC<{ title: string; message?: string; children?: React.ReactNode }> = ({ title, message, children }) => (
  <div className="text-center py-14 px-6 card max-w-lg mx-auto">
    <Inbox className="w-10 h-10 text-stone-300 mx-auto mb-3" />
    <h3 className="font-serif text-xl font-semibold text-sky-950">{title}</h3>
    {message && <p className="text-xs text-stone-500 mt-1">{message}</p>}
    {children && <div className="mt-4">{children}</div>}
  </div>
);

interface QueryLike<T> {
  data: T | undefined;
  isPending: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => unknown;
}

/** Renders loading / error / content for a react-query result. */
export function QueryState<T>({
  query,
  loading,
  children,
}: {
  query: QueryLike<T>;
  loading?: React.ReactNode;
  children: (data: T) => React.ReactNode;
}) {
  if (query.isPending) return <>{loading ?? <LoadingGrid />}</>;
  if (query.isError || query.data === undefined)
    return <ErrorState message={(query.error as Error | null)?.message} onRetry={() => query.refetch()} />;
  return <>{children(query.data)}</>;
}
