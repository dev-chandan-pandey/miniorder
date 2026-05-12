const productService = require('../services/product.service');

const createProduct = async (req, res) => {
  const product = await productService.createProduct(req.body);
  return res.status(201).json({ success: true, data: product });
};

const listProducts = async (req, res) => {
  const products = await productService.listProducts();
  return res.json({ success: true, data: products });
};

const updateStock = async (req, res) => {
  const product = await productService.updateProductStock(req.params.id, req.body.stock);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  return res.json({ success: true, data: product });
};

module.exports = {
  createProduct,
  listProducts,
  updateStock,
};
