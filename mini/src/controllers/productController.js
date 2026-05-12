const productService = require('../services/productService');

class ProductController {
  async createProduct(req, res) {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  }

  async getAllProducts(req, res) {
    const products = await productService.getAllProducts();
    res.json(products);
  }

  async updateStock(req, res) {
    const { id } = req.params;
    const { stock } = req.body;
    const product = await productService.updateStock(id, stock);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  }
}

module.exports = new ProductController();