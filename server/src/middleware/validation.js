const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation
const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('name.first')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('name.last')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('role')
    .optional()
    .isIn(['tenant', 'agent'])
    .withMessage('Role must be either tenant or agent'),
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Property validation
const validateProperty = [
  body('title')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 50, max: 10000 })
    .withMessage('Description must be between 50 and 10000 characters'),
  body('space')
    .isMongoId()
    .withMessage('Valid space ID is required'),
  body('address.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  body('address.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('address.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('address.zipCode')
    .trim()
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('Please provide a valid ZIP code'),
  body('details.propertyType')
    .isIn(['apartment', 'house', 'condo', 'townhouse', 'studio', 'loft', 'duplex'])
    .withMessage('Invalid property type'),
  body('details.bedrooms')
    .isInt({ min: 0, max: 20 })
    .withMessage('Bedrooms must be between 0 and 20'),
  body('details.bathrooms')
    .isInt({ min: 0, max: 20 })
    .withMessage('Bathrooms must be between 0 and 20'),
  body('details.squareFeet')
    .isInt({ min: 100, max: 50000 })
    .withMessage('Square footage must be between 100 and 50000'),
  body('pricing.rent')
    .isFloat({ min: 0 })
    .withMessage('Rent must be a positive number'),
  body('pricing.securityDeposit')
    .isFloat({ min: 0 })
    .withMessage('Security deposit must be a positive number'),
  body('availability.availableDate')
    .isISO8601()
    .withMessage('Please provide a valid available date'),
  handleValidationErrors
];

// Application validation
const validateApplication = [
  body('propertyId')
    .isMongoId()
    .withMessage('Valid property ID is required'),
  body('personalInfo.firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),
  body('personalInfo.lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required'),
  body('personalInfo.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('personalInfo.phone')
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),
  body('employmentInfo.income')
    .isFloat({ min: 0 })
    .withMessage('Income must be a positive number'),
  handleValidationErrors
];

// Message validation
const validateMessage = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters'),
  body('conversationId')
    .isMongoId()
    .withMessage('Valid conversation ID is required'),
  handleValidationErrors
];

// Maintenance request validation
const validateMaintenanceRequest = [
  body('propertyId')
    .isMongoId()
    .withMessage('Valid property ID is required'),
  body('category')
    .isIn(['plumbing', 'electrical', 'hvac', 'appliance', 'pest_control', 'structural', 'other'])
    .withMessage('Invalid category'),
  body('priority')
    .isIn(['low', 'medium', 'high', 'emergency'])
    .withMessage('Invalid priority'),
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),
  handleValidationErrors
];

// Payment validation
const validatePayment = [
  body('leaseId')
    .isMongoId()
    .withMessage('Valid lease ID is required'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('type')
    .isIn(['rent', 'security_deposit', 'application_fee', 'late_fee', 'maintenance', 'utilities', 'other'])
    .withMessage('Invalid payment type'),
  body('dueDate')
    .isISO8601()
    .withMessage('Please provide a valid due date'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateProperty,
  validateApplication,
  validateMessage,
  validateMaintenanceRequest,
  validatePayment
};