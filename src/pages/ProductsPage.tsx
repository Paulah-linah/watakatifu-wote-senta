import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Eye, Filter, Info, Phone, Search, ShoppingBag, X } from 'lucide-react';
import { useProductCategories, useProducts, useSiteSettings, type Product } from '@/services/content';
import { useInquiryModal } from '@/context/InquiryModalContext';
import { SectionHeader } from '@/components/common/SectionHeader';
import { EmptyState, LoadingGrid, QueryState } from '@/components/common/States';
import { Modal } from '@/components/common/Modal';
import { formatKes, telHref } from '@/lib/format';
import { usePageMeta } from '@/lib/usePageMeta';

export const ProductsPage: React.FC = () => {
  usePageMeta({ title: 'Products Catalogue', description: 'Catholic books, Bibles, missals, rosaries and devotional gifts available at Watakatifu Wote Senta, Ngong.' });
  const { settings } = useSiteSettings();
  const { openInquiry } = useInquiryModal();
  const products = useProducts();
  const categories = useProductCategories();
  const [params, setParams] = useSearchParams();
  const [selected, setSelected] = useState<Product | null>(null);

  const category = params.get('category') ?? 'All';
  const query = params.get('q') ?? '';

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (!value || value === 'All') next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true, preventScrollReset: true });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (products.data ?? []).filter(
      (p) =>
        (category === 'All' || p.category?.name === category) &&
        (!q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
    );
  }, [products.data, category, query]);

  const inquire = (p: Product) => openInquiry('product', { productId: p.id, quantity: 1 });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      <SectionHeader
        level={1}
        badge="Products Catalogue"
        title="Catholic Books, Devotional & Gift Items"
        subtitle="Liturgical books, Bibles, prayer companions, rosaries and sacramental gifts. Ask about an item or buy it at our centre in Ngong."
      />

      <div className="bg-[#FAF8F5] border border-[#E3DAC9] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-stone-700">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-stone-900 block text-sm">How to buy</span>
            <span>This catalogue is for browsing. Purchases are completed at our office in Ngong or arranged by phone, email or an inquiry below.</span>
          </div>
        </div>
        <a
          href={telHref(settings.phone)}
          className="shrink-0 px-3 py-1.5 rounded-lg bg-white border border-stone-300 hover:bg-stone-50 font-semibold text-stone-800 inline-flex items-center gap-1.5"
        >
          <Phone className="w-3.5 h-3.5 text-sky-700" />
          <span>{settings.phone_display}</span>
        </a>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0" role="group" aria-label="Filter by category">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {['All', ...(categories.data ?? []).map((c) => c.name)].map((cat) => (
            <button
              key={cat}
              type="button"
              aria-pressed={category === cat}
              onClick={() => update('category', cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                category === cat ? 'bg-sky-700 text-white shadow-xs' : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden />
          <input
            type="search"
            aria-label="Search products"
            placeholder="Search Bibles, rosaries…"
            value={query}
            onChange={(e) => update('q', e.target.value)}
            className="w-full pl-9 pr-9 py-2 rounded-xl text-sm sm:text-xs bg-white border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500 shadow-2xs"
          />
          {query && (
            <button
              type="button"
              onClick={() => update('q', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <QueryState query={products} loading={<LoadingGrid count={8} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" />}>
        {() =>
          filtered.length === 0 ? (
            <EmptyState title="No products match your search" message="Try a different word, or show all categories.">
              <button
                type="button"
                onClick={() => setParams(new URLSearchParams(), { replace: true })}
                className="px-4 py-2 rounded-lg bg-stone-800 text-white text-xs font-semibold"
              >
                Clear filters
              </button>
            </EmptyState>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filtered.map((p) => (
                <article key={p.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div>
                    <div className="relative h-48 w-full overflow-hidden bg-stone-100 group">
                      {p.image_url && (
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                      )}
                      {p.category && (
                        <div className="absolute top-3 left-3 bg-stone-950/80 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded">{p.category.name}</div>
                      )}
                      {p.is_featured && <div className="absolute top-3 right-3 bg-amber-400 text-amber-950 text-[10px] font-bold uppercase px-2 py-0.5 rounded">Featured</div>}
                      <div className="absolute bottom-3 right-3 bg-white/95 text-sky-900 font-bold px-2.5 py-1 rounded-lg text-xs shadow-xs">{formatKes(p.price_kes)}</div>
                    </div>
                    <div className="p-5">
                      <span className="text-[10px] font-mono text-stone-400 block mb-1">SKU: {p.sku}</span>
                      <h2 className="font-serif text-lg font-bold text-stone-900 leading-snug mb-2 line-clamp-2">{p.name}</h2>
                      <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">{p.description}</p>
                      {!p.is_available && <p className="mt-2 text-[11px] font-semibold text-rose-700">Currently out of stock: ask us about restocking</p>}
                    </div>
                  </div>
                  <div className="p-5 pt-0 space-y-2">
                    <button
                      type="button"
                      onClick={() => setSelected(p)}
                      className="w-full py-2 px-3 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View details</span>
                    </button>
                    <button type="button" onClick={() => inquire(p)} className="w-full py-2 px-3 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold">
                      Ask about this item
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )
        }
      </QueryState>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name} maxWidth="lg">
        {selected && (
          <div className="space-y-4">
            {selected.image_url && (
              <div className="h-64 w-full rounded-xl overflow-hidden bg-stone-100">
                <img src={selected.image_url} alt={selected.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              {selected.category && (
                <span className="text-xs font-bold uppercase tracking-wider text-sky-800 bg-sky-100 px-2.5 py-1 rounded">{selected.category.name}</span>
              )}
              <span className="font-serif text-2xl font-bold text-sky-950">{formatKes(selected.price_kes)}</span>
            </div>
            <p className="text-sm text-stone-700 leading-relaxed">{selected.description}</p>
            <div className="text-xs text-stone-500">
              Product code: <strong>{selected.sku}</strong> · {selected.is_available ? 'In stock' : 'Out of stock'}
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-1">
              <div className="font-semibold text-stone-800">How to purchase</div>
              <p>
                Send an inquiry, or contact our resource coordinator on <strong>{settings.phone_display}</strong> or <strong>{settings.email}</strong>.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const p = selected;
                setSelected(null);
                inquire(p);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-xs"
            >
              Ask about this item
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};
