import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, X } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import type { Enums } from '@/lib/database.types';

// ---------------------------------------------------------------------------
// Toasts
// ---------------------------------------------------------------------------
type Toast = { id: number; kind: 'success' | 'error'; message: string };
const ToastContext = createContext<(kind: Toast['kind'], message: string) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const push = useCallback((kind: Toast['kind'], message: string) => {
    const id = nextId.current++;
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === 'error' ? 7000 : 3500);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] space-y-2 w-[min(24rem,calc(100vw-2rem))]" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.kind === 'error' ? 'alert' : 'status'}
            className={`flex items-start gap-2 p-3 rounded-xl shadow-lg border text-sm animate-in slide-in-from-bottom-2 ${
              t.kind === 'error' ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            {t.kind === 'error' ? <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> : <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />}
            <span className="flex-1">{t.message}</span>
            <button type="button" aria-label="Dismiss" onClick={() => setToasts((all) => all.filter((x) => x.id !== t.id))}>
              <X className="w-4 h-4 opacity-60" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const push = useContext(ToastContext);
  return { success: (m: string) => push('success', m), error: (m: string) => push('error', m) };
};

export const errorMessage = (e: unknown): string => {
  const msg = (e as { message?: string })?.message ?? String(e);
  if (/row-level security|permission denied/i.test(msg)) return 'You do not have permission to make this change.';
  if (/duplicate key/i.test(msg)) return 'An item with the same unique value (e.g. slug or code) already exists.';
  if (/Booking conflict|facility_bookings_slot_unique/i.test(msg)) return 'That hall already has a booking that overlaps this session.';
  return msg;
};

// ---------------------------------------------------------------------------
// Confirm dialog
// ---------------------------------------------------------------------------
export function useConfirm() {
  const [state, setState] = useState<{ message: string; confirmLabel: string; resolve: (ok: boolean) => void } | null>(null);
  const confirm = (message: string, confirmLabel = 'Delete') => new Promise<boolean>((resolve) => setState({ message, confirmLabel, resolve }));
  const close = (ok: boolean) => {
    state?.resolve(ok);
    setState(null);
  };
  const dialog = (
    <Modal isOpen={!!state} onClose={() => close(false)} title="Please confirm" maxWidth="sm">
      <p className="text-sm text-stone-700">{state?.message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={() => close(false)}>
          Cancel
        </Button>
        <Button variant="danger" onClick={() => close(true)} data-autofocus>
          {state?.confirmLabel}
        </Button>
      </div>
    </Modal>
  );
  return { confirm, dialog };
}

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------
const VARIANTS = {
  primary: 'bg-sky-800 hover:bg-sky-900 text-white',
  secondary: 'bg-white hover:bg-parchment text-sky-950 border border-sand',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white',
  ghost: 'text-stone-600 hover:bg-stone-100',
};

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof VARIANTS; loading?: boolean; size?: 'sm' | 'md' }
> = ({ variant = 'primary', loading, size = 'md', className = '', children, disabled, ...rest }) => (
  <button
    type="button"
    disabled={disabled || loading}
    className={`inline-flex items-center justify-center gap-1.5 rounded-full font-semibold transition-colors disabled:opacity-50 ${
      size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm'
    } ${VARIANTS[variant]} ${className}`}
    {...rest}
  >
    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
    {children}
  </button>
);

export const inputCls =
  'w-full px-3.5 py-2.5 rounded-xl border border-sand bg-white text-sm text-stone-800 focus:outline-hidden focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15 disabled:bg-stone-100';

export const FieldLabel: React.FC<{ label: string; htmlFor?: string; hint?: string; required?: boolean; children: React.ReactNode; className?: string }> = ({
  label,
  htmlFor,
  hint,
  required,
  children,
  className = '',
}) => (
  <div className={className}>
    <label htmlFor={htmlFor} className="block text-xs font-semibold text-stone-700 mb-1">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    {children}
    {hint && <p className="mt-1 text-[11px] text-stone-500">{hint}</p>}
  </div>
);

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`card ${className}`}>{children}</div>
);

export const PageHeader: React.FC<{ title: string; subtitle?: string; actions?: React.ReactNode }> = ({ title, subtitle, actions }) => (
  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
    <div>
      <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-sky-950">{title}</h1>
      {subtitle && <p className="text-sm text-stone-600 mt-1">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export const STATUS_TONES: Record<Enums<'inquiry_status'>, string> = {
  New: 'bg-amber-100 text-amber-800',
  'In Progress': 'bg-sky-100 text-sky-800',
  Responded: 'bg-purple-100 text-purple-800',
  Completed: 'bg-emerald-100 text-emerald-800',
  Cancelled: 'bg-stone-200 text-stone-600',
};

export const BOOKING_TONES: Record<Enums<'availability_status'>, string> = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  BOOKED: 'bg-rose-100 text-rose-800 border-rose-200',
  BLOCKED: 'bg-stone-200 text-stone-700 border-stone-300',
};

export const Badge: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = 'bg-stone-100 text-stone-700', children }) => (
  <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${className}`}>{children}</span>
);

export const Spinner: React.FC<{ label?: string }> = ({ label = 'Loading…' }) => (
  <div className="flex items-center justify-center gap-2 py-16 text-sm text-stone-500" role="status">
    <Loader2 className="w-5 h-5 animate-spin" /> {label}
  </div>
);
