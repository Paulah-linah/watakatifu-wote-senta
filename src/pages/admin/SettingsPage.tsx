import React, { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { coreValuesOf, useSiteSettings, type CoreValue, type SiteSettings } from '@/services/content';
import { Button, Card, errorMessage, FieldLabel, inputCls, PageHeader, Spinner, useToast } from './ui';

type Editable = Omit<SiteSettings, 'id' | 'updated_at' | 'core_values' | 'social'>;

const SECTIONS: { title: string; fields: { name: keyof Editable; label: string; hint?: string; textarea?: boolean; type?: string }[] }[] = [
  {
    title: 'Contact details',
    fields: [
      { name: 'phone', label: 'Phone (international format)', hint: 'Used for "Call" links, e.g. +254704346417' },
      { name: 'phone_display', label: 'Phone as displayed', hint: 'e.g. +254 704 346 417' },
      { name: 'whatsapp_number', label: 'WhatsApp number (digits only)', hint: 'e.g. 254704346417' },
      { name: 'whatsapp_message', label: 'WhatsApp greeting message' },
      { name: 'email', label: 'Public email', type: 'email' },
      { name: 'office_hours', label: 'Office hours' },
    ],
  },
  {
    title: 'Identity & location',
    fields: [
      { name: 'name', label: 'Full name' },
      { name: 'short_name', label: 'Short name' },
      { name: 'diocese', label: 'Diocese' },
      { name: 'location', label: 'Short location', hint: 'Shown in the header bar.' },
      { name: 'address', label: 'Postal / street address' },
      { name: 'daily_mass_time', label: 'Daily Mass time', hint: 'Shown in the header, footer and home page.' },
      { name: 'founded_on', label: 'Founded on', type: 'date' },
      { name: 'map_link_url', label: 'Google Maps link', type: 'url', hint: 'Open the centre in Google Maps, then copy the share link.' },
      { name: 'map_embed_url', label: 'Google Maps embed URL', type: 'url', hint: 'Google Maps → Share → Embed a map → copy only the src="…" address.' },
    ],
  },
  {
    title: 'Mission & identity statements',
    fields: [
      { name: 'vision', label: 'Vision', textarea: true },
      { name: 'mission', label: 'Mission', textarea: true },
      { name: 'philosophy', label: 'Philosophy', textarea: true },
    ],
  },
];

export function SettingsPage() {
  const { can } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const query = useSiteSettings();
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [values, setValues] = useState<CoreValue[]>([]);

  useEffect(() => {
    if (query.data && !form) {
      setForm(query.data);
      setValues(coreValuesOf(query.data));
    }
  }, [query.data, form]);

  const save = useMutation({
    mutationFn: async () => {
      const { id: _id, updated_at: _u, ...rest } = form!;
      const { error } = await supabase
        .from('site_settings')
        .update({ ...rest, core_values: values.filter((v) => v.title.trim()) })
        .eq('id', 1);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Settings saved. The website now shows the new details.');
      qc.invalidateQueries({ queryKey: ['site_settings'] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  if (!can('settings')) return <Card className="p-8 text-center text-sm text-stone-600">Only the primary administrator can change site settings.</Card>;
  if (!form) return <Spinner />;

  const set = (name: keyof Editable, v: string) => setForm({ ...form, [name]: v === '' && (name === 'founded_on' || name.startsWith('map_')) ? null : v });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
    >
      <PageHeader
        title="Site settings"
        subtitle="Contact details and statements used across the whole website."
        actions={
          <Button type="submit" loading={save.isPending}>
            Save settings
          </Button>
        }
      />
      <div className="space-y-6">
        {SECTIONS.map((section) => (
          <Card key={section.title} className="p-5">
            <h2 className="font-serif text-lg font-bold mb-4">{section.title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {section.fields.map((f) => (
                <FieldLabel key={f.name} label={f.label} htmlFor={`s-${f.name}`} hint={f.hint} className={f.textarea || f.name.startsWith('map_') ? 'sm:col-span-2' : ''}>
                  {f.textarea ? (
                    <textarea id={`s-${f.name}`} rows={2} className={inputCls} value={String(form[f.name] ?? '')} onChange={(e) => set(f.name, e.target.value)} />
                  ) : (
                    <input id={`s-${f.name}`} type={f.type ?? 'text'} className={inputCls} value={String(form[f.name] ?? '')} onChange={(e) => set(f.name, e.target.value)} />
                  )}
                </FieldLabel>
              ))}
            </div>
          </Card>
        ))}

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg font-bold">Core values</h2>
            <Button size="sm" variant="secondary" onClick={() => setValues([...values, { title: '', description: '' }])}>
              <Plus className="w-3.5 h-3.5" /> Add value
            </Button>
          </div>
          <ul className="space-y-3">
            {values.map((v, idx) => (
              <li key={idx} className="grid grid-cols-1 sm:grid-cols-[12rem_1fr_auto] gap-2 items-start">
                <input
                  aria-label={`Value ${idx + 1} title`}
                  className={inputCls}
                  placeholder="Title"
                  value={v.title}
                  onChange={(e) => setValues(values.map((x, i) => (i === idx ? { ...x, title: e.target.value } : x)))}
                />
                <input
                  aria-label={`Value ${idx + 1} description`}
                  className={inputCls}
                  placeholder="Description"
                  value={v.description}
                  onChange={(e) => setValues(values.map((x, i) => (i === idx ? { ...x, description: e.target.value } : x)))}
                />
                <Button size="sm" variant="ghost" className="text-rose-700" aria-label="Remove value" onClick={() => setValues(values.filter((_, i) => i !== idx))}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </form>
  );
}
