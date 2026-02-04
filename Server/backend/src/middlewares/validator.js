import { body, validationResult } from 'express-validator';

/**
 * Validation middleware to check for errors
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

/**
 * Validation rules for send OTP
 */
const validateSendOTP = [
    body('mobile_number')
        .trim()
        .notEmpty()
        .withMessage('Mobile number is required')
        .matches(/^[6-9]\d{9}$|^91[6-9]\d{9}$/)
        .withMessage('Please enter a valid 10-digit Indian mobile number'),
    validate
];

/**
 * Validation rules for verify OTP
 */
const validateVerifyOTP = [
    body('mobile_number')
        .trim()
        .notEmpty()
        .withMessage('Mobile number is required')
        .matches(/^[6-9]\d{9}$|^91[6-9]\d{9}$/)
        .withMessage('Please enter a valid 10-digit Indian mobile number'),
    body('otp')
        .trim()
        .notEmpty()
        .withMessage('OTP is required')
        .isLength({ min: 6, max: 6 })
        .withMessage('OTP must be 6 digits')
        .isNumeric()
        .withMessage('OTP must contain only numbers'),
    validate
];

/**
 * Validation rules for user creation
 */
const validateCreateUser = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    body('mobile_number')
        .trim()
        .notEmpty()
        .withMessage('Mobile number is required')
        .matches(/^[6-9]\d{9}$|^91[6-9]\d{9}$/)
        .withMessage('Please enter a valid 10-digit Indian mobile number'),
    body('age')
        .optional()
        .isInt({ min: 1, max: 120 })
        .withMessage('Age must be between 1 and 120'),
    body('aadhaar_number')
        .optional()
        .matches(/^\d{12}$/)
        .withMessage('Aadhaar number must be 12 digits'),
    validate
];

/**
 * Validation rules for user update
 */
const validateUpdateUser = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    body('age')
        .optional()
        .isInt({ min: 1, max: 120 })
        .withMessage('Age must be between 1 and 120'),
    body('mobile_number')
        .optional()
        .matches(/^[6-9]\d{9}$|^91[6-9]\d{9}$/)
        .withMessage('Please enter a valid 10-digit Indian mobile number'),
    validate
];

export {
    validate,
    validateSendOTP,
    validateVerifyOTP,
    validateCreateUser,
    validateUpdateUser
};
