const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const mongoose = require('mongoose');

class OrderService {
  async createOrder(orderData) {
    const { userId, products } = orderData;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Validate products and calculate total
    let totalAmount = 0;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      for (const item of products) {
        const product = await Product.findById(item.productId).session(session);
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}`);
        }
        totalAmount += product.price * item.quantity;

        // Deduct stock
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } }, { session });
      }

      // Create order
      const order = new Order({
        userId,
        products,
        totalAmount
      });
      await order.save({ session });

      await session.commitTransaction();
      return order;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getAllOrders() {
    return await Order.find().populate('userId').populate('products.productId');
  }
}

module.exports = new OrderService();