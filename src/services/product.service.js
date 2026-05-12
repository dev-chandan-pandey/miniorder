const Product = require('../models/product.model');

const createProduct = async (payload) => {
  const product = await Product.create(payload);
  return product;
};

const listProducts = async () => {
  return Product.find().sort({ createdAt: -1 }).lean();
};

const updateProductStock = async (productId, stock) => {
  const product = await Product.findByIdAndUpdate(
    productId,
    { stock },
    { new: true, runValidators: true }
  ).lean();
  return product;
};

module.exports = {
  createProduct,
  listProducts,
  updateProductStock,
};
