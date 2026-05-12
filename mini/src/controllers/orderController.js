const orderService = require('../services/orderService');

class OrderController {
  async createOrder(req, res) {
    const order = await orderService.createOrder(req.body);
    res.status(201).json(order);
  }

  async getAllOrders(req, res) {
    const orders = await orderService.getAllOrders();
    res.json(orders);
  }
}

module.exports = new OrderController();