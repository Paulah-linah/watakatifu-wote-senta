import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface PageHeroProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  image?: string;
  crumbs?: { label: string; to?: string }[];
  children?: React.ReactNode;
}

/** Banner at the top of every inner page: breadcrumb, eyebrow, title and optional backdrop photo. */
export const PageHero: React.FC<PageHeroProps> = ({ eyebrow, title, subtitle, image, crumbs = [], children }) => (
  <section className="relative overflow-hidden bg-sky-950 text-white">
    {image && (
      <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" loading="eager" />
    )}
    <div className="absolute inset-0 bg-linear-to-r from-sky-950 via-sky-950/90 to-sky-950/40" aria-hidden />
    <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-gold-400/60 to-transparent" aria-hidden />

    <div className="relative container-page py-12 sm:py-16 lg:py-20">
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-sky-200/80">
          <li>
            <Link to="/" className="hover:text-white">
              Home
            </Link>
          </li>
          {crumbs.map((c) => (
            <li key={c.label} className="flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 opacity-60" aria-hidden />
              {c.to ? (
                <Link to={c.to} className="hover:text-white">
                  {c.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-white">
                  {c.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <p className="eyebrow text-gold-300!">{eyebrow}</p>
      <h1 className="mt-3 font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] max-w-3xl text-balance">{title}</h1>
      {subtitle && <p className="mt-5 max-w-2xl text-base sm:text-lg text-sky-100/85 leading-relaxed text-pretty">{subtitle}</p>}
      {children && <div className="mt-8">{children}</div>}
    </div>
  </section>
);
