const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { validate, productSchema, stockUpdateSchema } = require('../middleware/validation');

router.post('/', validate(productSchema), productController.createProduct);
router.get('/', productController.getAllProducts);
router.put('/:id/stock', validate(stockUpdateSchema), productController.updateStock);

module.exports = router;