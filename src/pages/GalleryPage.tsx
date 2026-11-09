import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Maximize2 } from 'lucide-react';
import { useGallery, type GalleryCategory } from '@/services/content';
import { Constants } from '@/lib/database.types';
import { PageHero } from '@/components/common/PageHero';
import { EmptyState, LoadingGrid, QueryState } from '@/components/common/States';
import { Lightbox } from '@/components/common/Lightbox';
import { usePageMeta } from '@/lib/usePageMeta';

const CATEGORIES: ('All' | GalleryCategory)[] = ['All', ...Constants.public.Enums.gallery_category];

export const GalleryPage: React.FC = () => {
  usePageMeta({ title: 'Photo Gallery', description: 'Photos of the conference halls, chapel, accommodation, catering and grounds at Watakatifu Wote Senta, Ngong.' });
  const gallery = useGallery();
  const [params, setParams] = useSearchParams();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const category = params.get('category') ?? 'All';

  const images = (gallery.data ?? []).filter((img) => category === 'All' || img.category === category);

  return (
    <div>
      <PageHero
        eyebrow="Gallery"
        title="Our grounds, halls and sacred spaces"
        subtitle="A look around the conference halls, chapel, accommodation and gardens in Ngong."
        image="https://lzphdqkpswzhxlwqwxbp.supabase.co/storage/v1/object/public/media/grounds/st-desmond-gardens.webp"
        crumbs={[{ label: "Gallery" }]}
      />
      <div className="container-page py-12 sm:py-16 space-y-10">

      <div className="flex items-center justify-start sm:justify-center">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 max-w-full" role="group" aria-label="Filter photos">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              aria-pressed={category === cat}
              onClick={() => setParams(cat === 'All' ? {} : { category: cat }, { replace: true, preventScrollReset: true })}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                category === cat ? 'bg-sky-900 text-white' : 'bg-white text-stone-700 border border-sand hover:border-sky-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <QueryState query={gallery} loading={<LoadingGrid count={6} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" itemClassName="h-72" />}>
        {() =>
          images.length === 0 ? (
            <EmptyState title="No photos in this category yet" />
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((img, idx) => (
                <li key={img.id}>
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(idx)}
                    className="group relative block w-full h-64 sm:h-72 rounded-3xl overflow-hidden shadow-xs border border-stone-200 bg-stone-100 text-left"
                    aria-label={`View ${img.title}`}
                  >
                    <img src={img.image_url} alt="" className="w-full h-full object-cover img-zoom" loading="lazy" />
                    <div className="absolute inset-0 bg-linear-to-t from-stone-950/80 via-transparent to-transparent opacity-80 group-hover:opacity-95 transition-opacity flex flex-col justify-end p-5 text-white">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-sky-300 tracking-wider">{img.category}</span>
                        <span className="p-1.5 rounded-full bg-white/20 text-white" aria-hidden>
                          <Maximize2 className="w-3.5 h-3.5" />
                        </span>
                      </div>
                      <span className="font-serif font-bold text-lg text-white mt-1 leading-snug">{img.title}</span>
                      <span className="text-xs text-stone-300 line-clamp-1 mt-0.5">{img.caption}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )
        }
      </QueryState>

      <Lightbox images={images} currentIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} onNavigate={setLightboxIndex} />
      </div>
    </div>
  );
};
