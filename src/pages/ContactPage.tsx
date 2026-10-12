import React from 'react';
import { Clock, ExternalLink, Mail, MapPin, MessageSquare, Phone } from 'lucide-react';
import { useSiteSettings } from '@/services/content';
import { SectionHeader } from '@/components/common/SectionHeader';
import { InquiryForm } from '@/components/inquiry/InquiryForm';
import { telHref, whatsappHref } from '@/lib/format';
import { usePageMeta } from '@/lib/usePageMeta';

export const ContactPage: React.FC = () => {
  usePageMeta({ title: 'Contact Us', description: 'Call, WhatsApp, email or visit Watakatifu Wote Senta on Kahara Road, Ngong, Kenya.' });
  const { settings } = useSiteSettings();

  const channels = [
    {
      href: telHref(settings.phone),
      icon: Phone,
      tone: 'bg-sky-100 text-sky-800',
      label: 'Telephone',
      title: settings.phone_display,
      text: `Office hours: ${settings.office_hours}.`,
      cta: 'Call now',
      ctaTone: 'text-sky-700',
    },
    {
      href: whatsappHref(settings),
      external: true,
      icon: MessageSquare,
      tone: 'bg-emerald-100 text-emerald-800',
      label: 'WhatsApp',
      title: 'WhatsApp Chat',
      text: 'Quick questions about dates, catering and products.',
      cta: 'Open WhatsApp',
      ctaTone: 'text-emerald-700',
    },
    {
      href: `mailto:${settings.email}`,
      icon: Mail,
      tone: 'bg-sky-100 text-sky-800',
      label: 'Email',
      title: settings.email,
      text: 'Official booking letters and event proposals.',
      cta: 'Send email',
      ctaTone: 'text-sky-700',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
      <SectionHeader
        level={1}
        badge="Get in touch"
        title="Contact Watakatifu Wote Senta"
        subtitle="Find us on Kahara Road in Ngong. Call, WhatsApp, email or send an inquiry online."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {channels.map(({ href, external, icon: Icon, tone, label, title, text, cta, ctaTone }) => (
          <a
            key={label}
            href={href}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs hover:shadow-md hover:border-sky-300 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className={`w-12 h-12 rounded-xl ${tone} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">{label}</span>
              <h2 className="font-serif text-lg font-bold text-stone-900 mt-1 mb-2 break-all">{title}</h2>
              <p className="text-xs text-stone-500">{text}</p>
            </div>
            <div className={`text-xs font-bold ${ctaTone} mt-4 pt-2 border-t border-stone-100 flex items-center gap-1`}>
              <span>{cta}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </a>
        ))}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Location</span>
            <h2 className="font-serif text-lg font-bold text-stone-900 mt-1 mb-2">Kahara Road, Ngong</h2>
            <p className="text-xs text-stone-500">{settings.diocese}, Kajiado County, Kenya.</p>
          </div>
          <div className="text-xs font-bold text-amber-800 mt-4 pt-2 border-t border-stone-100 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Daily Mass: {settings.daily_mass_time}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
            <h2 className="font-serif text-2xl font-bold text-stone-900">Visit us</h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              The centre is on Kahara Road in Ngong, easy to reach from Nairobi, Karen and Kiserian. Secure parking is available inside the gate.
            </p>
            {settings.map_embed_url && (
              <div className="relative h-64 w-full rounded-2xl overflow-hidden border border-stone-200 bg-stone-100">
                <iframe title="Map showing Watakatifu Wote Senta" src={settings.map_embed_url} className="w-full h-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
            )}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-2">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                <MapPin className="w-4 h-4 text-sky-700 shrink-0" />
                <span>{settings.address}</span>
              </div>
              {settings.map_link_url && (
                <a href={settings.map_link_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-sky-700 hover:text-sky-900 pt-1">
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="lg:col-span-7">
          <InquiryForm initialType="general" source="contact" />
        </div>
      </div>
    </div>
  );
};
