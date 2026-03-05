/**
 * cloudinaryUtils.ts
 *
 * Client-side Cloudinary URL optimisation helpers.
 *
 * Why this matters for cost:
 *   Cloudinary Free = 25 credits/month.
 *   1 credit = 1,000 transformations OR 1 GB bandwidth OR 1 GB storage.
 *
 *   f_auto  → serves WebP/AVIF instead of JPEG (40–60 % smaller → less bandwidth credit)
 *   q_auto  → Cloudinary auto-picks quality (smaller files → less bandwidth)
 *   dpr_auto→ correct DPI per device (no over-fetching on low-DPI screens)
 *
 *   When the CDN already has a transformed URL cached, repeat serves consume
 *   ZERO transformation credits — only bandwidth credits (and those are small
 *   because the files are now WebP).
 *
 * Usage (before passing to <Image source={{ uri }}> anywhere in the app):
 *   import { cdn } from '@/utils/cloudinaryUtils';
 *   <Image source={{ uri: cdn(user.photo_url) }} />
 *
 * You can also pass a width/crop for further savings:
 *   <Image source={{ uri: cdn(scheme.image_url, { w: 400, c: 'fill' }) }} />
 */

/** Shape of optional extra transforms */
interface CloudinaryTransformOptions {
    /** Width in pixels */
    w?: number;
    /** Height in pixels */
    h?: number;
    /** Crop mode: fill | fit | scale | thumb | auto */
    c?: 'fill' | 'fit' | 'scale' | 'thumb' | 'auto' | 'pad';
    /** Gravity for cropping: auto | face | center */
    g?: 'auto' | 'face' | 'center' | 'north' | 'south';
}

/**
 * Inject f_auto,q_auto,dpr_auto (and optional dimension transforms) into any
 * Cloudinary URL that came from the API/database.
 *
 * Safe to call with null/undefined — returns '' so <Image> stays quiet.
 *
 * Examples:
 *   cdn('https://res.cloudinary.com/xyz/image/upload/v1/folder/img.jpg')
 *   → 'https://res.cloudinary.com/xyz/image/upload/f_auto,q_auto,dpr_auto/v1/folder/img.jpg'
 *
 *   cdn(url, { w: 400, c: 'fill' })
 *   → '...upload/f_auto,q_auto,dpr_auto,w_400,c_fill/v1/...'
 */
export function cdn(
    url: string | null | undefined,
    opts: CloudinaryTransformOptions = {}
): string {
    if (!url) return '';

    // Not a Cloudinary URL (e.g. local asset, external CDN) — return as-is
    if (!url.includes('res.cloudinary.com')) return url;

    // Already optimised (idempotent — don't double-insert)
    if (url.includes('/upload/f_auto')) return url;

    // Build the transform string
    const parts: string[] = ['f_auto', 'q_auto', 'dpr_auto'];
    if (opts.w) parts.push(`w_${opts.w}`);
    if (opts.h) parts.push(`h_${opts.h}`);
    if (opts.c) parts.push(`c_${opts.c}`);
    if (opts.g) parts.push(`g_${opts.g}`);

    const transforms = parts.join(',');

    // Insert right after '/upload/'
    return url.replace('/upload/', `/upload/${transforms}/`);
}

/**
 * Pre-defined thumbnail helper — commonly used for list cards.
 * Outputs a 400×400 fill-cropped, face-detected, WebP thumbnail.
 */
export function thumbnail(url: string | null | undefined): string {
    return cdn(url, { w: 400, h: 400, c: 'fill', g: 'auto' });
}

/**
 * Pre-defined banner helper — 1200×600 landscape, fill crop.
 */
export function banner(url: string | null | undefined): string {
    return cdn(url, { w: 1200, h: 600, c: 'fill', g: 'auto' });
}

/**
 * Pre-defined avatar helper — 200×200 face-detected circle-crop.
 * Use with borderRadius in the Image style for circular avatars.
 */
export function avatar(url: string | null | undefined): string {
    return cdn(url, { w: 200, h: 200, c: 'fill', g: 'face' });
}

export default { cdn, thumbnail, banner, avatar };
