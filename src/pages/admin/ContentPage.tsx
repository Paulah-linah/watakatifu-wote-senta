import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, CalendarRange, ExternalLink, Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Modal } from '@/components/common/Modal';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { Badge, Button, Card, errorMessage, FieldLabel, inputCls, PageHeader, Spinner, useConfirm, useToast } from './ui';
import { ImageUpload } from './ImageUpload';
import { RESOURCES, slugify, type FieldDef, type ResourceDef, type Row } from './resources';

// The resource config is data-driven, so table names are dynamic here; RLS still enforces every write.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const table = (name: ResourceDef['table']) => supabase.from(name as any) as any;

function useCategories(enabled: boolean) {
  return useQuery({
    queryKey: ['admin', 'content', 'categories-options'],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase.from('product_categories').select('id, name').order('sort_order');
      if (error) throw error;
      return data.map((c) => ({ value: c.id, label: c.name }));
    },
  });
}

/** Converts form strings back to the column types the database expects. */
function toPayload(def: ResourceDef, values: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const f of def.fields) {
    const v = values[f.name];
    switch (f.type) {
      case 'number':
      case 'money':
        out[f.name] = v === '' || v === null || v === undefined ? (f.name === 'sort_order' ? 0 : null) : Number(v);
        break;
      case 'list':
        out[f.name] = Array.isArray(v)
          ? v
          : String(v ?? '')
              .split('\n')
              .map((s) => s.trim())
              .filter(Boolean);
        break;
      case 'boolean':
        out[f.name] = !!v;
        break;
      case 'date':
      case 'time':
      case 'select':
        out[f.name] = v === '' || v === undefined ? null : v;
        break;
      default:
        out[f.name] = typeof v === 'string' ? v.trim() : (v ?? '');
    }
  }
  return out;
}

function FieldInput({ def, field, value, onChange, categoryOptions }: { def: ResourceDef; field: FieldDef; value: unknown; onChange: (v: unknown) => void; categoryOptions: { value: string; label: string }[] }) {
  const id = `f-${field.name}`;
  const str = value === null || value === undefined ? '' : String(value);
  switch (field.type) {
    case 'textarea':
      return <textarea id={id} rows={4} className={inputCls} value={str} required={field.required} onChange={(e) => onChange(e.target.value)} />;
    case 'list':
      return (
        <textarea
          id={id}
          rows={4}
          className={inputCls}
          value={Array.isArray(value) ? value.join('\n') : str}
          onChange={(e) => onChange(e.target.value.split('\n'))}
        />
      );
    case 'number':
    case 'money':
      return <input id={id} type="number" min={0} step={field.type === 'money' ? '0.01' : '1'} className={inputCls} value={str} required={field.required} onChange={(e) => onChange(e.target.value)} />;
    case 'date':
      return <input id={id} type="date" className={inputCls} value={str} required={field.required} onChange={(e) => onChange(e.target.value)} />;
    case 'time':
      return <input id={id} type="time" className={inputCls} value={str.slice(0, 5)} onChange={(e) => onChange(e.target.value)} />;
    case 'boolean':
      return (
        <label className="inline-flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
          <input id={id} type="checkbox" className="w-4 h-4 rounded border-stone-300 text-sky-700" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
          Yes
        </label>
      );
    case 'select': {
      const options = field.options === 'product_categories' ? categoryOptions : field.options ?? [];
      return (
        <select id={id} className={inputCls} value={str} required={field.required} onChange={(e) => onChange(e.target.value)}>
          <option value="">Choose…</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    }
    case 'image':
      return <ImageUpload id={id} folder={def.key} value={str} onChange={onChange} />;
    case 'slug':
      return <input id={id} className={`${inputCls} font-mono`} value={str} required pattern="[a-z0-9-]+" onChange={(e) => onChange(slugify(e.target.value))} />;
    default:
      return <input id={id} className={inputCls} value={str} required={field.required} onChange={(e) => onChange(e.target.value)} />;
  }
}

function EditDialog({ def, row, nextOrder, onClose }: { def: ResourceDef; row: Row | null; nextOrder: number; onClose: () => void }) {
  const toast = useToast();
  const qc = useQueryClient();
  const categories = useCategories(def.fields.some((f) => f.options === 'product_categories'));
  const [values, setValues] = useState<Record<string, unknown>>(() => row ?? { ...def.defaults, sort_order: nextOrder });
  const [slugTouched, setSlugTouched] = useState(!!row);

  const set = (name: string, v: unknown) =>
    setValues((prev) => {
      const next = { ...prev, [name]: v };
      if (def.slugSource === name && !slugTouched) next.slug = slugify(String(v));
      return next;
    });

  const save = useMutation({
    mutationFn: async () => {
      const payload = toPayload(def, values);
      const { error } = row ? await table(def.table).update(payload).eq('id', row.id) : await table(def.table).insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(row ? 'Changes saved.' : `New ${def.singular} added.`);
      qc.invalidateQueries({ queryKey: ['admin', 'content'] });
      qc.invalidateQueries({ queryKey: ['public'] });
      onClose();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <Modal isOpen onClose={onClose} title={row ? `Edit ${def.singular}` : `Add ${def.singular}`} maxWidth="3xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
        className="space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {def.fields.map((field) => (
            <FieldLabel key={field.name} label={field.label} htmlFor={`f-${field.name}`} hint={field.hint} required={field.required} className={field.full || field.type === 'image' ? 'sm:col-span-2' : ''}>
              <FieldInput
                def={def}
                field={field}
                value={values[field.name]}
                categoryOptions={categories.data ?? []}
                onChange={(v) => {
                  if (field.type === 'slug') setSlugTouched(true);
                  set(field.name, v);
                }}
              />
            </FieldLabel>
          ))}
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={save.isPending}>
            {row ? 'Save changes' : `Add ${def.singular}`}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function ContentPage() {
  const { resource = '' } = useParams();
  const def = RESOURCES.find((r) => r.key === resource);
  const { can } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const { confirm, dialog } = useConfirm();
  const [editing, setEditing] = useState<Row | 'new' | null>(null);

  const list = useQuery({
    queryKey: ['admin', 'content', resource],
    enabled: !!def,
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await table(def!.table)
        .select(def!.select ?? '*')
        .order(def!.orderBy.column, { ascending: def!.orderBy.ascending })
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  if (!def) return <NotFoundPage />;
  if (!can(def.area)) return <Card className="p-8 text-center text-sm text-stone-600">Your role does not manage {def.title.toLowerCase()}.</Card>;

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin', 'content'] });
    qc.invalidateQueries({ queryKey: ['public'] });
  };

  const patch = async (row: Row, values: Record<string, unknown>, message: string) => {
    const { error } = await table(def.table).update(values).eq('id', row.id);
    if (error) return toast.error(errorMessage(error));
    toast.success(message);
    invalidate();
  };

  const move = async (index: number, delta: number) => {
    const rows = list.data ?? [];
    const a = rows[index];
    const b = rows[index + delta];
    if (!a || !b) return;
    // Normalise ordering to the current list positions, then swap the two rows.
    const updates = rows.map((r, i) => ({ id: r.id, sort_order: i === index ? index + delta : i === index + delta ? index : i }));
    const changed = updates.filter((u, i) => rows[i].sort_order !== u.sort_order);
    for (const u of changed) {
      const { error } = await table(def.table).update({ sort_order: u.sort_order }).eq('id', u.id);
      if (error) return toast.error(errorMessage(error));
    }
    invalidate();
  };

  const remove = async (row: Row) => {
    const name = String(row[def.titleField] ?? def.singular);
    if (!(await confirm(`Delete "${name}"? This cannot be undone.${def.hasPublished ? ' To hide it temporarily, unpublish it instead.' : ''}`))) return;
    const { error } = await table(def.table).delete().eq('id', row.id);
    if (error) return toast.error(/foreign key|violates/i.test(error.message) ? 'This item is still used elsewhere (e.g. products in this category). Move or delete those first.' : errorMessage(error));
    toast.success('Deleted.');
    invalidate();
  };

  const rows = list.data ?? [];

  return (
    <div>
      {dialog}
      <PageHeader
        title={def.title}
        subtitle={def.description}
        actions={
          <>
            <a href={def.publicPath} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 px-2">
              View on site <ExternalLink className="w-3.5 h-3.5" />
            </a>
            {def.pageLink && can('bookings_read') && (
              <Link
                to={def.pageLink.to}
                className="inline-flex items-center gap-1.5 rounded-full border border-sand bg-white px-4 py-2 text-sm font-semibold text-sky-900 hover:border-sky-300"
              >
                <CalendarRange className="w-4 h-4" /> {def.pageLink.label}
              </Link>
            )}
            <Button onClick={() => setEditing('new')}>
              <Plus className="w-4 h-4" /> Add {def.singular}
            </Button>
          </>
        }
      />

      {list.isPending ? (
        <Spinner />
      ) : list.isError ? (
        <Card className="p-6 text-sm text-rose-700">{errorMessage(list.error)}</Card>
      ) : rows.length === 0 ? (
        <Card className="p-12 text-center text-sm text-stone-500">Nothing here yet. Use &ldquo;Add {def.singular}&rdquo; to create the first one.</Card>
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-stone-100">
            {rows.map((row, index) => {
              const published = def.hasPublished ? !!row.is_published : true;
              return (
                <li key={row.id} className={`flex items-center gap-3 p-3 sm:p-4 ${published ? '' : 'bg-stone-50'}`}>
                  {def.imageField && (
                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                      {row[def.imageField] ? <img src={String(row[def.imageField])} alt="" className="w-full h-full object-cover" loading="lazy" /> : null}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`font-semibold truncate ${published ? 'text-stone-900' : 'text-stone-500'}`}>{String(row[def.titleField] ?? '')}</span>
                      {!published && <Badge>Hidden</Badge>}
                    </div>
                    <div className="text-xs text-stone-500 truncate">{def.subtitle(row)}</div>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    {def.reorderable && (
                      <>
                        <Button size="sm" variant="ghost" aria-label="Move up" disabled={index === 0} onClick={() => move(index, -1)}>
                          <ArrowUp className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" aria-label="Move down" disabled={index === rows.length - 1} onClick={() => move(index, 1)}>
                          <ArrowDown className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    )}
                    {def.hasPublished && (
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={published ? 'Hide from website' : 'Publish on website'}
                        title={published ? 'Hide from website' : 'Publish on website'}
                        onClick={() => patch(row, { is_published: !published }, published ? 'Hidden from the website.' : 'Published on the website.')}
                      >
                        {published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </Button>
                    )}
                    {def.rowLink && can('bookings_read') && (
                      <Link
                        to={def.rowLink.to(row)}
                        title={def.rowLink.label}
                        aria-label={`${def.rowLink.label}: ${String(row[def.titleField] ?? '')}`}
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold text-sky-800 hover:bg-sky-50"
                      >
                        <CalendarRange className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">{def.rowLink.label}</span>
                      </Link>
                    )}
                    <Button size="sm" variant="ghost" aria-label="Edit" onClick={() => setEditing(row)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" aria-label="Delete" className="text-rose-700" onClick={() => remove(row)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {editing && (
        <EditDialog
          key={editing === 'new' ? 'new' : editing.id}
          def={def}
          row={editing === 'new' ? null : editing}
          nextOrder={rows.length}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
