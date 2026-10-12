import React from 'react';
import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import { usePageMeta } from '@/lib/usePageMeta';

export function NotFoundPage() {
  usePageMeta({ title: 'Page not found', noindex: true });
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <Compass className="w-12 h-12 text-sky-700 mx-auto mb-4" />
      <p className="text-xs font-bold uppercase tracking-wider text-sky-800">Page not found</p>
      <h1 className="font-serif text-4xl font-bold text-stone-900 mt-2">We couldn&apos;t find that page</h1>
      <p className="text-sm text-stone-600 mt-3">The link may be out of date, or the address may have a typo.</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-sm font-semibold">
          <Home className="w-4 h-4" /> Go to the home page
        </Link>
        <Link to="/contact" className="px-5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-800 text-sm font-semibold hover:bg-stone-50">
          Contact us
        </Link>
      </div>
    </div>
  );
}

export function RouteErrorPage() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />;
  console.error(error);
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <h1 className="font-serif text-3xl font-bold text-stone-900">Something went wrong</h1>
      <p className="text-sm text-stone-600 mt-3">Please refresh the page. If the problem continues, contact us by phone or WhatsApp.</p>
      <a href="/" className="inline-block mt-6 px-5 py-2.5 rounded-xl bg-sky-700 text-white text-sm font-semibold">
        Back to home
      </a>
    </div>
  );
}
