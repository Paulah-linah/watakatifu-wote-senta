import React, { useId } from 'react';
import { X } from 'lucide-react';
import { useDialog } from './useDialog';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
};

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = '2xl' }) => {
  const ref = useDialog(isOpen, onClose);
  const titleId = useId();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-sky-950/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative w-full ${maxWidthClasses[maxWidth]} bg-white rounded-3xl shadow-2xl border border-sand/70 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col focus:outline-hidden`}
      >
        <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-sand/70 bg-parchment">
          <h2 id={titleId} className="font-serif text-xl font-semibold text-sky-950 truncate">
            {title || 'Information'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
