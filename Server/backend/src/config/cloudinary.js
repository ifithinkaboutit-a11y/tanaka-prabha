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
 * Get optimized URL for an existing Cloudinary image
 * @param {string} publicId - The public_id of the image
 * @param {object} transformations - Transformation options
 * @returns {string} - Optimized image URL
 */
export const getOptimizedUrl = (publicId, transformations = {}) => {
    return cloudinary.url(publicId, {
        fetch_format: 'auto',
        quality: 'auto',
        ...transformations,
    });
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
    deleteImage,
    uploadFromUrl,
    getOptimizedUrl,
};
