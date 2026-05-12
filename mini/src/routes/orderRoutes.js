const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { validate, orderSchema } = require('../middleware/validation');

router.post('/', validate(orderSchema), orderController.createOrder);
router.get('/', orderController.getAllOrders);

module.exports = router;