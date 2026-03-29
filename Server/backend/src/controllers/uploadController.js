import {
    uploadBanner,
    uploadSchemeImage,
    uploadSchemeHero,
    uploadProfessionalImage,
    uploadUserPhoto,
    uploadGeneral,
    uploadMedia,
    deleteImage,
    uploadFromUrl,
} from '../config/cloudinary.js';

/**
 * Upload a single banner image
 * @route POST /api/upload/banner
 */
export const uploadBannerImage = [
    uploadBanner.single('image'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    status: 'error',
                    message: 'No image file provided',
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Banner image uploaded successfully',
                data: {
                    url: req.file.path,
                    public_id: req.file.filename,
                    format: req.file.format || 'auto',
                    width: req.file.width,
                    height: req.file.height,
                },
            });
        } catch (error) {
            console.error('Error uploading banner image:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to upload banner image',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    },
];

/**
 * Upload a scheme thumbnail image
 * @route POST /api/upload/scheme
 */
export const uploadSchemeImageHandler = [
    uploadSchemeImage.single('image'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    status: 'error',
                    message: 'No image file provided',
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Scheme image uploaded successfully',
                data: {
                    url: req.file.path,
                    public_id: req.file.filename,
                    format: req.file.format || 'auto',
                    width: req.file.width,
                    height: req.file.height,
                },
            });
        } catch (error) {
            console.error('Error uploading scheme image:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to upload scheme image',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    },
];

/**
 * Upload a scheme hero image (large banner)
 * @route POST /api/upload/scheme-hero
 */
export const uploadSchemeHeroHandler = [
    uploadSchemeHero.single('image'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    status: 'error',
                    message: 'No image file provided',
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Scheme hero image uploaded successfully',
                data: {
                    url: req.file.path,
                    public_id: req.file.filename,
                    format: req.file.format || 'auto',
                    width: req.file.width,
                    height: req.file.height,
                },
            });
        } catch (error) {
            console.error('Error uploading scheme hero image:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to upload scheme hero image',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    },
];

/**
 * Upload both scheme thumbnail and hero images
 * @route POST /api/upload/scheme-images
 */
export const uploadSchemeImagesHandler = [
    uploadSchemeImage.fields([
        { name: 'image', maxCount: 1 },
        { name: 'hero_image', maxCount: 1 },
    ]),
    async (req, res) => {
        try {
            const result = {
                image_url: null,
                hero_image_url: null,
            };

            if (req.files?.image?.[0]) {
                result.image_url = req.files.image[0].path;
            }

            if (req.files?.hero_image?.[0]) {
                result.hero_image_url = req.files.hero_image[0].path;
            }

            if (!result.image_url && !result.hero_image_url) {
                return res.status(400).json({
                    status: 'error',
                    message: 'No image files provided',
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Scheme images uploaded successfully',
                data: result,
            });
        } catch (error) {
            console.error('Error uploading scheme images:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to upload scheme images',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    },
];

/**
 * Upload a professional profile image
 * @route POST /api/upload/professional
 */
export const uploadProfessionalImageHandler = [
    uploadProfessionalImage.single('image'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    status: 'error',
                    message: 'No image file provided',
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Professional image uploaded successfully',
                data: {
                    url: req.file.path,
                    public_id: req.file.filename,
                    format: req.file.format || 'auto',
                    width: req.file.width,
                    height: req.file.height,
                },
            });
        } catch (error) {
            console.error('Error uploading professional image:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to upload professional image',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    },
];

/**
 * Upload a user photo
 * @route POST /api/upload/user-photo
 */
export const uploadUserPhotoHandler = [
    uploadUserPhoto.single('photo'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    status: 'error',
                    message: 'No photo file provided',
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'User photo uploaded successfully',
                data: {
                    url: req.file.path,
                    public_id: req.file.filename,
                    format: req.file.format || 'auto',
                    width: req.file.width,
                    height: req.file.height,
                },
            });
        } catch (error) {
            console.error('Error uploading user photo:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to upload user photo',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    },
];

/**
 * Upload a general file
 * @route POST /api/upload/general
 */
export const uploadGeneralHandler = [
    uploadGeneral.single('file'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    status: 'error',
                    message: 'No file provided',
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'File uploaded successfully',
                data: {
                    url: req.file.path,
                    public_id: req.file.filename,
                    format: req.file.format || 'auto',
                },
            });
        } catch (error) {
            console.error('Error uploading file:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to upload file',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    },
];

/**
 * Upload a media file (image or video) for programme logging
 * @route POST /api/upload/media
 */
export const uploadMediaHandler = [
    uploadMedia.single('file'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    status: 'error',
                    message: 'No file provided',
                });
            }

            res.status(200).json({
                status: 'success',
                data: {
                    url: req.file.path,
                    public_id: req.file.filename,
                },
            });
        } catch (error) {
            console.error('Error uploading media file:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to upload media file',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    },
];

/**
 * Delete an image from Cloudinary
 * @route DELETE /api/upload/delete
 */
export const deleteImageHandler = async (req, res) => {
    try {
        const { url, public_id } = req.body;

        if (!url && !public_id) {
            return res.status(400).json({
                status: 'error',
                message: 'Image URL or public_id is required',
            });
        }

        const result = await deleteImage(url || public_id);

        res.status(200).json({
            status: 'success',
            message: 'Image deleted successfully',
            data: result,
        });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete image',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

/**
 * Upload image from external URL
 * @route POST /api/upload/from-url
 */
export const uploadFromUrlHandler = async (req, res) => {
    try {
        const { url, folder, type } = req.body;

        if (!url) {
            return res.status(400).json({
                status: 'error',
                message: 'Image URL is required',
            });
        }

        // Determine folder based on type
        let uploadFolder = folder || 'tanak-prabha/general';
        let transformations = {};

        switch (type) {
            case 'banner':
                uploadFolder = 'tanak-prabha/banners';
                transformations = {
                    width: 1200,
                    height: 600,
                    crop: 'fill',
                    gravity: 'auto',
                    quality: 'auto:best',
                    fetch_format: 'auto',
                };
                break;
            case 'scheme':
                uploadFolder = 'tanak-prabha/schemes';
                transformations = {
                    width: 800,
                    height: 400,
                    crop: 'fill',
                    gravity: 'auto',
                    quality: 'auto:good',
                    fetch_format: 'auto',
                };
                break;
            case 'scheme-hero':
                uploadFolder = 'tanak-prabha/schemes/hero';
                transformations = {
                    width: 1600,
                    height: 800,
                    crop: 'fill',
                    gravity: 'auto',
                    quality: 'auto:best',
                    fetch_format: 'auto',
                };
                break;
            case 'professional':
                uploadFolder = 'tanak-prabha/professionals';
                transformations = {
                    width: 400,
                    height: 400,
                    crop: 'fill',
                    gravity: 'face',
                    quality: 'auto:good',
                    fetch_format: 'auto',
                };
                break;
            case 'user':
                uploadFolder = 'tanak-prabha/users';
                transformations = {
                    width: 300,
                    height: 300,
                    crop: 'fill',
                    gravity: 'face',
                    quality: 'auto:good',
                    fetch_format: 'auto',
                };
                break;
        }

        const result = await uploadFromUrl(url, uploadFolder, transformations);

        res.status(200).json({
            status: 'success',
            message: 'Image uploaded from URL successfully',
            data: {
                url: result.secure_url,
                public_id: result.public_id,
                format: result.format,
                width: result.width,
                height: result.height,
            },
        });
    } catch (error) {
        console.error('Error uploading from URL:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to upload image from URL',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};
