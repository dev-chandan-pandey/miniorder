const orderService = require('../services/order.service');

const createOrder = async (req, res) => {
  const order = await orderService.createOrder(req.body);
  return res.status(201).json({ success: true, data: order });
};

const cancelOrder = async (req, res) => {
  const order = await orderService.cancelOrder(req.params.id);
  return res.json({ success: true, data: order });
};

const getOrderById = async (req, res) => {
  const order = await orderService.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  return res.json({ success: true, data: order });
};

const listOrders = async (req, res) => {
  const orders = await orderService.listOrders();
  return res.json({ success: true, data: orders });
};

module.exports = {
  createOrder,
  cancelOrder,
  getOrderById,
  listOrders,
};
