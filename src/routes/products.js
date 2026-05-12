const express = require('express');
const productController = require('../controllers/product.controller');
const { createProductValidation, updateStockValidation } = require('../validators/product.validator');
const { validateRequest } = require('../middleware/validate.middleware');

const router = express.Router();

router.post('/', createProductValidation, validateRequest, productController.createProduct);
router.get('/', productController.listProducts);
router.patch('/:id/stock', updateStockValidation, validateRequest, productController.updateStock);

module.exports = router;
