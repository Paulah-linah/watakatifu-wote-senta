import React from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { InquiryModalProvider } from '@/context/InquiryModalContext';
import { useSiteSettings } from '@/services/content';
import { whatsappHref } from '@/lib/format';

export function RootLayout() {
  const { settings } = useSiteSettings();
  return (
    <InquiryModalProvider>
      <div className="min-h-screen flex flex-col bg-parchment text-ink font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:rounded-full focus:bg-white focus:shadow-lift"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main" className="grow">
          <Outlet />
        </main>
        <Footer />

        <a
          href={whatsappHref(settings)}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 rounded-full bg-[#1f8f5f] hover:bg-[#187a50] text-white shadow-lift p-3.5 sm:pl-4 sm:pr-5 transition-colors"
          aria-label="Chat with us on WhatsApp"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="hidden sm:inline text-sm font-semibold">WhatsApp</span>
        </a>
      </div>
      <ScrollRestoration />
    </InquiryModalProvider>
  );
}
