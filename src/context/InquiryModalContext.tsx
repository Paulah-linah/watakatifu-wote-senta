import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { InquiryForm } from '@/components/inquiry/InquiryForm';
import { INQUIRY_TYPE_LABELS, type InquiryPrefill, type InquiryType } from '@/services/inquiries';

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
        title={state ? `Booking & Inquiry: ${INQUIRY_TYPE_LABELS[state.type]}` : ''}
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
