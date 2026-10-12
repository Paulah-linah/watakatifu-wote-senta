import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, Mail, MapPin, MessageSquare, Phone } from 'lucide-react';
import { PageHero } from '@/components/common/PageHero';
import { InquiryForm } from '@/components/inquiry/InquiryForm';
import { useSiteSettings } from '@/services/content';
import { isInquiryType, type InquiryPrefill } from '@/services/inquiries';
import { telHref, whatsappHref } from '@/lib/format';
import { usePageMeta } from '@/lib/usePageMeta';

/**
 * Supports deep links such as /inquiry?type=retreat&retreat=<id> or /inquiry?type=conference&facility=<id>&date=2026-11-20
 */
export const InquiryPage: React.FC = () => {
  usePageMeta({ title: 'Make an Inquiry', description: 'Request a conference hall, accommodation, catering, a retreat or other services at Watakatifu Wote Senta.' });
  const { settings } = useSiteSettings();
  const [params] = useSearchParams();
  const typeParam = params.get('type');
  const type = isInquiryType(typeParam) ? typeParam : 'conference';
  const get = (k: string) => params.get(k) ?? undefined;
  const prefill: InquiryPrefill = {
    facilityId: get('facility'),
    date: get('date'),
    accommodationId: get('accommodation'),
    cateringId: get('catering'),
    retreatId: get('retreat'),
    formationId: get('formation'),
    eventId: get('event'),
    productId: get('product'),
    subject: get('subject'),
  };

  return (
    <div>
      <PageHero
        eyebrow="Bookings & inquiries"
        title="Plan your visit"
        subtitle="Tell us what you need, your dates and your group size. We will confirm availability and rates."
        image="https://images.unsplash.com/photo-1462826303086-329426d1aef5?auto=format&fit=crop&w=1800&q=70"
        crumbs={[{ label: "Book & inquire" }]}
      />
      <div className="container-page py-12 sm:py-16 space-y-10">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8">
          <InquiryForm key={params.toString()} initialType={type} prefill={prefill} source="web" />
        </div>

        <aside className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl bg-parchment-deep p-6 sm:p-8 space-y-4">
            <h2 className="font-serif text-xl font-semibold text-sky-950">What happens next</h2>
            <ul className="space-y-2.5 text-xs text-stone-600">
              {[
                'You receive a reference number as soon as you submit.',
                'Your inquiry goes straight to the right office: hospitality, ministry or the products desk.',
                'We confirm availability, rates and details by phone or email.',
              ].map((step) => (
                <li key={step} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-6 sm:p-8 space-y-3">
            <h2 className="font-serif text-base font-semibold text-sky-950">Prefer to talk?</h2>
            <div className="space-y-2 text-xs text-stone-600">
              <a href={telHref(settings.phone)} className="flex items-center gap-2 font-semibold text-sky-800">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                {settings.phone_display}
              </a>
              <a href={`mailto:${settings.email}`} className="flex items-center gap-2 text-stone-700 break-all">
                <Mail className="w-3.5 h-3.5 text-stone-400" />
                {settings.email}
              </a>
              <a href={whatsappHref(settings)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-emerald-700 font-semibold">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                WhatsApp us
              </a>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span>{settings.location}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
      </div>
    </div>
  );
};
