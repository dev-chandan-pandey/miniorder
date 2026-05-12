const mongoose = require('mongoose');
const Order = require('../models/order.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');

const createOrder = async ({ userId, products }) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new Error('User not found');
    }

    const productIds = products.map((item) => item.productId);
    const existingProducts = await Product.find({ _id: { $in: productIds } })
      .session(session)
      .lean();

    if (existingProducts.length !== products.length) {
      throw new Error('One or more products do not exist');
    }

    const productById = existingProducts.reduce((acc, product) => {
      acc[product._id.toString()] = product;
      return acc;
    }, {});

    const orderItems = products.map((item) => {
      const product = productById[item.productId];
      if (!product) {
        throw new Error('One or more products do not exist');
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.name}`);
      }
      return {
        productId: product._id,
        quantity: item.quantity,
        price: product.price,
      };
    });

    const updateOperations = orderItems.map((item) => ({
      updateOne: {
        filter: { _id: item.productId, stock: { $gte: item.quantity } },
        update: { $inc: { stock: -item.quantity } },
      },
    }));

    const productUpdateResult = await Product.bulkWrite(updateOperations, { session });

    if (productUpdateResult.modifiedCount !== orderItems.length) {
      throw new Error('Unable to reserve stock for all products');
    }

    const totalAmount = orderItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

    const order = await Order.create(
      [
        {
          userId,
          products: orderItems,
          totalAmount,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return order[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const cancelOrder = async (orderId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId).session(session);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status === 'CANCELLED') {
      throw new Error('Order has already been cancelled');
    }

    const restoreOperations = order.products.map((item) => ({
      updateOne: {
        filter: { _id: item.productId },
        update: { $inc: { stock: item.quantity } },
      },
    }));

    await Product.bulkWrite(restoreOperations, { session });
    order.status = 'CANCELLED';
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    return order;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getOrderById = async (orderId) => {
  return Order.findById(orderId).populate('userId', 'name email phone').populate('products.productId', 'name price category').lean();
};

const listOrders = async () => {
  return Order.find().sort({ createdAt: -1 }).lean();
};

module.exports = {
  createOrder,
  cancelOrder,
  getOrderById,
  listOrders,
};
