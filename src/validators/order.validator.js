const { body } = require('express-validator');

const createOrderValidation = [
  body('userId').isMongoId().withMessage('Valid userId is required'),
  body('products').isArray({ min: 1 }).withMessage('Products array is required'),
  body('products.*.productId').isMongoId().withMessage('Valid productId is required'),
  body('products.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

module.exports = { createOrderValidation };
