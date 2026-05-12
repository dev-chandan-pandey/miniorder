const { body } = require('express-validator');

const createProductValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('category').trim().notEmpty().withMessage('Category is required'),
];

const updateStockValidation = [
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];

module.exports = { createProductValidation, updateStockValidation };
