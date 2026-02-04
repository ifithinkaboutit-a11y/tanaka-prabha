import express from 'express';
import {
    uploadBannerImage,
    uploadSchemeImageHandler,
    uploadSchemeHeroHandler,
    uploadSchemeImagesHandler,
    uploadProfessionalImageHandler,
    uploadUserPhotoHandler,
    uploadGeneralHandler,
    deleteImageHandler,
    uploadFromUrlHandler,
} from '../controllers/uploadController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/upload/banner
 * @desc    Upload a banner image to Cloudinary
 * @access  Protected
 * @body    FormData with 'image' field
 */
router.post('/banner', authMiddleware, ...uploadBannerImage);

/**
 * @route   POST /api/upload/scheme
 * @desc    Upload a scheme thumbnail image to Cloudinary
 * @access  Protected
 * @body    FormData with 'image' field
 */
router.post('/scheme', authMiddleware, ...uploadSchemeImageHandler);

/**
 * @route   POST /api/upload/scheme-hero
 * @desc    Upload a scheme hero/banner image to Cloudinary
 * @access  Protected
 * @body    FormData with 'image' field
 */
router.post('/scheme-hero', authMiddleware, ...uploadSchemeHeroHandler);

/**
 * @route   POST /api/upload/scheme-images
 * @desc    Upload both scheme thumbnail and hero images
 * @access  Protected
 * @body    FormData with 'image' and 'hero_image' fields
 */
router.post('/scheme-images', authMiddleware, ...uploadSchemeImagesHandler);

/**
 * @route   POST /api/upload/professional
 * @desc    Upload a professional profile image to Cloudinary
 * @access  Protected
 * @body    FormData with 'image' field
 */
router.post('/professional', authMiddleware, ...uploadProfessionalImageHandler);

/**
 * @route   POST /api/upload/user-photo
 * @desc    Upload a user photo to Cloudinary
 * @access  Protected
 * @body    FormData with 'photo' field
 */
router.post('/user-photo', authMiddleware, ...uploadUserPhotoHandler);

/**
 * @route   POST /api/upload/general
 * @desc    Upload a general file to Cloudinary
 * @access  Protected
 * @body    FormData with 'file' field
 */
router.post('/general', authMiddleware, ...uploadGeneralHandler);

/**
 * @route   DELETE /api/upload/delete
 * @desc    Delete an image from Cloudinary
 * @access  Protected
 * @body    { url: string } or { public_id: string }
 */
router.delete('/delete', authMiddleware, deleteImageHandler);

/**
 * @route   POST /api/upload/from-url
 * @desc    Upload an image to Cloudinary from an external URL
 * @access  Protected
 * @body    { url: string, folder?: string, type?: 'banner' | 'scheme' | 'scheme-hero' | 'professional' | 'user' }
 */
router.post('/from-url', authMiddleware, uploadFromUrlHandler);

export default router;
