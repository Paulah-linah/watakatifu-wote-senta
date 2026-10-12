import React from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import { MessageSquare, Phone } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { InquiryModalProvider } from '@/context/InquiryModalContext';
import { useSiteSettings } from '@/services/content';
import { telHref, whatsappHref } from '@/lib/format';

export function RootLayout() {
  const { settings } = useSiteSettings();
  return (
    <InquiryModalProvider>
      <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-stone-900 font-sans selection:bg-sky-200 selection:text-sky-900">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-white focus:shadow"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main" className="grow">
          <Outlet />
        </main>
        <Footer />

        <div className="fixed bottom-5 right-4 z-30 flex flex-col items-end gap-2.5">
          <a
            href={whatsappHref(settings)}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 sm:px-4 sm:py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg flex items-center gap-2 active:scale-95"
            aria-label="Chat with us on WhatsApp"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-xs font-bold hidden sm:inline-block">WhatsApp Us</span>
          </a>
          <a
            href={telHref(settings.phone)}
            className="p-3 rounded-full bg-sky-800 hover:bg-sky-700 text-white shadow-lg active:scale-95 sm:hidden"
            aria-label="Call us"
          >
            <Phone className="w-5 h-5" />
          </a>
        </div>
      </div>
      <ScrollRestoration />
    </InquiryModalProvider>
  );
}
