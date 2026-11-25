/** Compress & convert an image File to a data URL for local storage */

export type ImageUploadResult =
  | { ok: true; dataUrl: string }
  | { ok: false; error: string };

const MAX_INPUT_BYTES = 8 * 1024 * 1024; // 8MB

export async function fileToCompressedDataUrl(
  file: File,
  options?: { maxWidth?: number; quality?: number },
): Promise<ImageUploadResult> {
  if (!file.type.startsWith('image/')) {
    return { ok: false, error: 'فقط فایل تصویری مجاز است (JPG، PNG، WEBP، …)' };
  }
  if (file.size > MAX_INPUT_BYTES) {
    return { ok: false, error: 'حجم تصویر نباید بیشتر از ۸ مگابایت باشد' };
  }

  const maxWidth = options?.maxWidth ?? 1000;
  const quality = options?.quality ?? 0.82;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxWidth / bitmap.width);
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close();
      return { ok: false, error: 'امکان پردازش تصویر در این مرورگر وجود ندارد' };
    }

    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    const dataUrl = canvas.toDataURL(mime, mime === 'image/jpeg' ? quality : undefined);

    // Soft guard for localStorage pressure (~1.8MB string)
    if (dataUrl.length > 1_800_000) {
      const tighter = canvas.toDataURL('image/jpeg', 0.65);
      if (tighter.length > 1_800_000) {
        return {
          ok: false,
          error: 'تصویر بعد از فشرده‌سازی هنوز خیلی بزرگ است. تصویر کوچک‌تری انتخاب کنید',
        };
      }
      return { ok: true, dataUrl: tighter };
    }

    return { ok: true, dataUrl };
  } catch {
    return { ok: false, error: 'خطا در خواندن تصویر. فایل دیگری را امتحان کنید' };
  }
}
