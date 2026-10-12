import React, { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { errorMessage, inputCls, useToast } from './ui';

const MAX_EDGE = 1800;

/** Downscales large photos in the browser and converts to WebP before upload. */
async function compress(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.85));
  return blob ?? file;
}

export const ImageUpload: React.FC<{ id: string; folder: string; value: string; onChange: (url: string) => void }> = ({ id, folder, value, onChange }) => {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const upload = async (file: File) => {
    if (file.size > 20 * 1024 * 1024) return toast.error('That file is larger than 20 MB.');
    setBusy(true);
    try {
      const blob = await compress(file);
      const ext = blob.type === 'image/webp' ? 'webp' : file.name.split('.').pop() || 'jpg';
      const path = `${folder}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from('media').upload(path, blob, { contentType: blob.type, cacheControl: '31536000' });
      if (error) throw error;
      onChange(supabase.storage.from('media').getPublicUrl(path).data.publicUrl);
      toast.success('Image uploaded.');
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start">
      <div className="w-full sm:w-40 h-28 rounded-xl border border-stone-200 bg-stone-100 overflow-hidden flex items-center justify-center shrink-0">
        {value ? <img src={value} alt="" className="w-full h-full object-cover" /> : <ImagePlus className="w-6 h-6 text-stone-400" />}
      </div>
      <div className="flex-1 w-full space-y-2">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
            {value ? 'Replace photo' : 'Upload photo'}
          </button>
          {value && (
            <button type="button" onClick={() => onChange('')} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-rose-700 hover:bg-rose-50">
              <Trash2 className="w-3.5 h-3.5" /> Remove
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
            e.target.value = '';
          }}
        />
        <input id={id} type="url" className={inputCls} placeholder="…or paste an image URL" value={value} onChange={(e) => onChange(e.target.value)} />
        <p className="text-[11px] text-stone-500">Photos are resized automatically. Landscape images around 1600 px wide look best.</p>
      </div>
    </div>
  );
};
