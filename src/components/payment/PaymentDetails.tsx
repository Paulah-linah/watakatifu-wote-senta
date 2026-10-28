import React, { useState } from 'react';
import { Building, Check, Copy, Smartphone } from 'lucide-react';

/** Official payment channels supplied by the centre. */
export const PAYMENT = {
  mpesa: { businessNo: '880100', account: '121791' },
  bank: { accountName: 'Watakatifu Wote Senta', accountNo: '1217911105', bank: 'NCBA', branch: 'Ngong' },
} as const;

const CopyValue: React.FC<{ label: string; value: string; mono?: boolean }> = ({ label, value, mono = true }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable: the value is still visible to copy by hand */
    }
  };
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-sand/60 last:border-0">
      <div className="min-w-0">
        <div className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-stone-500">{label}</div>
        <div className={`text-base font-semibold text-sky-950 ${mono ? 'font-mono tracking-wide' : ''}`}>{value}</div>
      </div>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 inline-flex items-center gap-1 rounded-full border border-sand px-2.5 py-1 text-xs font-semibold text-sky-800 hover:bg-sky-50"
        aria-label={`Copy ${label}`}
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
};

/** "How to pay" panel: M-Pesa Paybill and bank transfer (EFT) details with copy buttons. */
export const PaymentDetails: React.FC<{
  reference?: string;
  compact?: boolean;
  className?: string;
  /** Overrides the default heading ("How to pay"). */
  title?: string;
  /** Overrides the default explanation paragraph. */
  intro?: React.ReactNode;
}> = ({ reference, compact = false, className = '', title = 'How to pay', intro }) => (
  <section aria-labelledby="payment-heading" className={className}>
    <p className="eyebrow">Payments</p>
    <h2 id="payment-heading" className={`mt-2 font-serif font-semibold text-sky-950 ${compact ? 'text-2xl' : 'text-3xl'}`}>
      {title}
    </h2>
    <p className="mt-2 text-sm text-stone-600 leading-relaxed">
      {intro ?? (
        <>
      Please pay once our office has confirmed your booking and the amount due.
      {reference ? (
        <>
          {' '}
          Quote your reference <strong className="font-mono text-sky-900">{reference}</strong> when you share your payment confirmation.
        </>
      ) : (
        ' Keep your M-Pesa or bank confirmation and share it with the office.'
      )}
        </>
      )}
    </p>

    <div className={`mt-5 grid gap-4 ${compact ? '' : 'md:grid-cols-2'}`}>
      <div className="rounded-2xl border border-sand/70 bg-white p-5">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="inline-flex w-9 h-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Smartphone className="w-5 h-5" />
          </span>
          <div>
            <h3 className="font-sans text-sm font-bold text-sky-950">M-Pesa Paybill</h3>
            <p className="text-xs text-stone-500">Lipa na M-Pesa → Pay Bill</p>
          </div>
        </div>
        <CopyValue label="Business number" value={PAYMENT.mpesa.businessNo} />
        <CopyValue label="Account number" value={PAYMENT.mpesa.account} />
      </div>

      <div className="rounded-2xl border border-sand/70 bg-white p-5">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="inline-flex w-9 h-9 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
            <Building className="w-5 h-5" />
          </span>
          <div>
            <h3 className="font-sans text-sm font-bold text-sky-950">Bank transfer (EFT)</h3>
            <p className="text-xs text-stone-500">
              {PAYMENT.bank.bank} Bank · {PAYMENT.bank.branch} branch
            </p>
          </div>
        </div>
        <CopyValue label="Account name" value={PAYMENT.bank.accountName} mono={false} />
        <CopyValue label="Account number" value={PAYMENT.bank.accountNo} />
        <div className="grid grid-cols-2 gap-3 pt-2.5">
          <div>
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-stone-500">Bank</div>
            <div className="text-base font-semibold text-sky-950">{PAYMENT.bank.bank}</div>
          </div>
          <div>
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-stone-500">Branch</div>
            <div className="text-base font-semibold text-sky-950">{PAYMENT.bank.branch}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
