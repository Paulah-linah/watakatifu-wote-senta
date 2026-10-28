import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { InquiryForm } from '@/components/inquiry/InquiryForm';
import type { InquiryPrefill, InquiryType } from '@/services/inquiries';

interface InquiryModalApi {
  openInquiry: (type?: InquiryType, prefill?: InquiryPrefill) => void;
}

const InquiryModalContext = createContext<InquiryModalApi | null>(null);

export function InquiryModalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ type: InquiryType; prefill: InquiryPrefill; key: number } | null>(null);

  const openInquiry = useCallback((type: InquiryType = 'conference', prefill: InquiryPrefill = {}) => {
    setState({ type, prefill, key: Date.now() });
  }, []);
  const close = useCallback(() => setState(null), []);
  const api = useMemo(() => ({ openInquiry }), [openInquiry]);

  return (
    <InquiryModalContext.Provider value={api}>
      {children}
      <Modal
        isOpen={state !== null}
        onClose={close}
        title="Make a booking or inquiry"
        description="Tell us what you need. Our office will confirm availability and rates."
        maxWidth="3xl"
      >
        {state && (
          <InquiryForm key={state.key} initialType={state.type} prefill={state.prefill} source="modal" onClose={close} />
        )}
      </Modal>
    </InquiryModalContext.Provider>
  );
}

export function useInquiryModal(): InquiryModalApi {
  const ctx = useContext(InquiryModalContext);
  if (!ctx) throw new Error('useInquiryModal must be used inside InquiryModalProvider');
  return ctx;
}
