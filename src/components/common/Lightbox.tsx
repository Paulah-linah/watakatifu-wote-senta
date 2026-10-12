import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { GalleryImage } from '@/services/content';
import { useDialog } from './useDialog';

interface LightboxProps {
  images: GalleryImage[];
  currentIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ images, currentIndex, onClose, onNavigate }) => {
  const isOpen = currentIndex !== null && !!images[currentIndex];
  const ref = useDialog(isOpen, onClose);

  useEffect(() => {
    if (!isOpen || currentIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentIndex < images.length - 1) onNavigate(currentIndex + 1);
      if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, currentIndex, images.length, onNavigate]);

  if (!isOpen || currentIndex === null) return null;
  const current = images[currentIndex];

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={`${current.title}, image ${currentIndex + 1} of ${images.length}`}
      tabIndex={-1}
      className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none animate-in fade-in duration-200 focus:outline-hidden"
    >
      <div className="w-full max-w-6xl flex items-center justify-between py-2 text-stone-300">
        <div className="text-xs font-semibold uppercase tracking-wider text-sky-400">
          {current.category} • {currentIndex + 1} of {images.length}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full bg-stone-800/80 hover:bg-stone-700 text-white transition-colors"
          aria-label="Close gallery"
          data-autofocus
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="relative w-full max-w-5xl max-h-[75vh] flex items-center justify-center my-auto">
        <img src={current.image_url} alt={current.title} className="max-h-[72vh] max-w-full object-contain rounded-lg shadow-2xl" />

        {currentIndex > 0 && (
          <button
            type="button"
            onClick={() => onNavigate(currentIndex - 1)}
            className="absolute left-2 sm:-left-6 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-stone-900/80 hover:bg-stone-800 text-white shadow-lg border border-stone-700"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        {currentIndex < images.length - 1 && (
          <button
            type="button"
            onClick={() => onNavigate(currentIndex + 1)}
            className="absolute right-2 sm:-right-6 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-stone-900/80 hover:bg-stone-800 text-white shadow-lg border border-stone-700"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="w-full max-w-2xl text-center mt-3 text-stone-200">
        <h3 className="font-serif text-lg font-bold text-white">{current.title}</h3>
        <p className="text-xs text-stone-400 mt-1">{current.caption}</p>
      </div>
    </div>
  );
};
