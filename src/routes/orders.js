const express = require('express');
const orderController = require('../controllers/order.controller');
const { createOrderValidation } = require('../validators/order.validator');
const { validateRequest } = require('../middleware/validate.middleware');

const router = express.Router();

router.post('/', createOrderValidation, validateRequest, orderController.createOrder);
router.patch('/:id/cancel', orderController.cancelOrder);
router.get('/:id', orderController.getOrderById);
router.get('/', orderController.listOrders);

module.exports = router;
