const express = require('express');
const users = require('./users');
const products = require('./products');
const orders = require('./orders');

const router = express.Router();

router.use('/users', users);
router.use('/products', products);
router.use('/orders', orders);

module.exports = router;
