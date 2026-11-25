'use client';

import { useRef, useState } from 'react';
import { fileToCompressedDataUrl } from '@/lib/imageUpload';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxWidth?: number;
  quality?: number;
  hint?: string;
};

export default function ImageUploadField({
  label,
  value,
  onChange,
  maxWidth = 1000,
  quality = 0.82,
  hint = 'می‌توانید تصویر را آپلود کنید یا لینک/مسیر وارد کنید',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onFileChange(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError('');
    const result = await fileToCompressedDataUrl(file, { maxWidth, quality });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onChange(result.dataUrl);
  }

  return (
    <div className="image-upload">
      <span className="image-upload-label">{label}</span>

      <div className="image-upload-preview">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={value || '/images/hero-disco.jpg'} alt="پیش‌نمایش" />
      </div>

      <div className="image-upload-actions">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="image-upload-input"
          onChange={(e) => onFileChange(e.target.files?.[0])}
        />
        <button
          type="button"
          className="admin-primary"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? 'در حال آپلود...' : 'انتخاب و آپلود تصویر'}
        </button>
        {value.startsWith('data:') ? (
          <button
            type="button"
            className="admin-ghost"
            onClick={() => {
              onChange('/images/hero-disco.jpg');
              setError('');
              if (inputRef.current) inputRef.current.value = '';
            }}
          >
            حذف تصویر آپلودشده
          </button>
        ) : null}
      </div>

      {error ? <div className="admin-error">{error}</div> : null}
      <p className="image-upload-hint">{hint}</p>

      <label>
        یا لینک / مسیر تصویر
        <input
          value={value.startsWith('data:') ? '' : value}
          placeholder={value.startsWith('data:') ? 'تصویر از دستگاه آپلود شده است' : '/images/... یا https://...'}
          onChange={(e) => {
            setError('');
            onChange(e.target.value);
          }}
          disabled={value.startsWith('data:')}
        />
      </label>
    </div>
  );
}
