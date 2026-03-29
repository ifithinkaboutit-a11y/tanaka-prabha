import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary with credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage configuration for banners
const bannerStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'tanak-prabha/banners',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: [
            { width: 1200, height: 600, crop: 'fill', gravity: 'auto' },
            { quality: 'auto:best' },
            { fetch_format: 'auto' }
        ],
    },
});

// Storage configuration for scheme images (thumbnails)
const schemeImageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'tanak-prabha/schemes',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: [
            { width: 800, height: 400, crop: 'fill', gravity: 'auto' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
        ],
    },
});

// Storage configuration for scheme hero images (large banners)
const schemeHeroStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'tanak-prabha/schemes/hero',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: [
            { width: 1600, height: 800, crop: 'fill', gravity: 'auto' },
            { quality: 'auto:best' },
            { fetch_format: 'auto' }
        ],
    },
});

// Storage configuration for professional profile images
const professionalImageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'tanak-prabha/professionals',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
        ],
    },
});

// Storage configuration for user photos
const userPhotoStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'tanak-prabha/users',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
            { width: 300, height: 300, crop: 'fill', gravity: 'face' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
        ],
    },
});

// General purpose storage (no transformations)
const generalStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'tanak-prabha/general',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf'],
        resource_type: 'auto',
    },
});

// Media storage for programme photos and videos
const mediaStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'tanak-prabha/media',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'mov', 'webm'],
        resource_type: 'auto',
    },
});

// File filter for images only
const imageFileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.'), false);
    }
};

// Multer upload configurations
export const uploadBanner = multer({
    storage: bannerStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
    },
});

export const uploadSchemeImage = multer({
    storage: schemeImageStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
    },
});

export const uploadSchemeHero = multer({
    storage: schemeHeroStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
    },
});

export const uploadProfessionalImage = multer({
    storage: professionalImageStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
    },
});

export const uploadUserPhoto = multer({
    storage: userPhotoStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
    },
});

export const uploadGeneral = multer({
    storage: generalStorage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
    },
});

// File filter for images and videos
const mediaFileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif',
        'video/mp4', 'video/quicktime', 'video/webm',
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images (JPEG, PNG, WebP, GIF) and videos (MP4, MOV, WebM) are allowed.'), false);
    }
};

export const uploadMedia = multer({
    storage: mediaStorage,
    fileFilter: mediaFileFilter,
    limits: {
        fileSize: 200 * 1024 * 1024, // 200MB max (for videos)
    },
});

/**
 * Delete an image from Cloudinary by its public_id or URL
 * @param {string} imageUrlOrPublicId - The Cloudinary URL or public_id
 * @returns {Promise<object>} - Cloudinary deletion result
 */
export const deleteImage = async (imageUrlOrPublicId) => {
    try {
        let publicId = imageUrlOrPublicId;

        // If it's a URL, extract the public_id
        if (imageUrlOrPublicId.includes('cloudinary.com')) {
            // Extract public_id from URL
            // URL format: https://res.cloudinary.com/cloud_name/image/upload/v123456/folder/filename.ext
            const urlParts = imageUrlOrPublicId.split('/');
            const uploadIndex = urlParts.indexOf('upload');
            if (uploadIndex !== -1) {
                // Get everything after 'upload' and version, remove extension
                const pathParts = urlParts.slice(uploadIndex + 2); // Skip 'upload' and version
                const fileNameWithExt = pathParts.join('/');
                publicId = fileNameWithExt.replace(/\.[^/.]+$/, ''); // Remove extension
            }
        }

        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        throw error;
    }
};

/**
 * Upload an image directly from a URL
 * @param {string} imageUrl - The URL of the image to upload
 * @param {string} folder - The folder in Cloudinary
 * @param {object} options - Additional transformation options
 * @returns {Promise<object>} - Cloudinary upload result with secure_url
 */
export const uploadFromUrl = async (imageUrl, folder = 'tanak-prabha/general', options = {}) => {
    try {
        const result = await cloudinary.uploader.upload(imageUrl, {
            folder,
            ...options,
        });
        return result;
    } catch (error) {
        console.error('Error uploading image from URL:', error);
        throw error;
    }
};

/**
 * Get an optimized delivery URL for an existing Cloudinary asset.
 *
 * Applies the three transformations that keep you within the free‑tier credit
 * budget by maximising CDN cache reuse:
 *   f_auto  → serves WebP/AVIF to modern browsers (40–60 % smaller than JPEG)
 *   q_auto  → Cloudinary picks the best quality for each device
 *   dpr_auto→ sends the right resolution for each screen density
 *
 * All three are SINGLE transformations, so they count as ONE unique transform
 * in the Cloudinary credit model, not three.
 *
 * @param {string} publicId - The Cloudinary public_id of the asset
 * @param {object} extra    - Any additional transformation options (e.g. width)
 * @returns {string} - CDN‑optimized secure HTTPS URL
 */
export const getOptimizedUrl = (publicId, extra = {}) => {
    return cloudinary.url(publicId, {
        secure: true,            // always HTTPS
        fetch_format: 'auto',    // f_auto
        quality: 'auto',         // q_auto
        dpr: 'auto',             // dpr_auto — correct resolution per device
        ...extra,
    });
};

/**
 * Inject f_auto, q_auto, dpr_auto into any raw Cloudinary URL string.
 *
 * Use this on the CLIENT side (or anywhere you only have the URL, not the
 * public_id) so images already stored in the database get delivery‑optimised
 * without re‑uploading.
 *
 * Before: https://res.cloudinary.com/demo/image/upload/v123/folder/img.jpg
 * After:  https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,dpr_auto/v123/folder/img.jpg
 *
 * @param {string|null|undefined} url  - Raw Cloudinary URL from the database
 * @param {string}                [extra] - Additional comma‑separated transforms, e.g. 'w_400,h_400,c_fill'
 * @returns {string} - Optimized URL (or the original string if not a Cloudinary URL)
 */
export const transformCloudinaryUrl = (url, extra = '') => {
    if (!url || !url.includes('res.cloudinary.com')) return url ?? '';

    const transforms = ['f_auto', 'q_auto', 'dpr_auto', extra].filter(Boolean).join(',');

    // Insert the transform chain right after '/upload/'
    return url.replace(/\/upload\/(?!f_auto)/, `/upload/${transforms}/`);
};

export { cloudinary };
export default {
    cloudinary,
    uploadBanner,
    uploadSchemeImage,
    uploadSchemeHero,
    uploadProfessionalImage,
    uploadUserPhoto,
    uploadGeneral,
    uploadMedia,
    deleteImage,
    uploadFromUrl,
    getOptimizedUrl,
    transformCloudinaryUrl,
};

