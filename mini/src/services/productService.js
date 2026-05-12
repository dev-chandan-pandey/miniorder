const Product = require('../models/Product');

class ProductService {
  async createProduct(productData) {
    const product = new Product(productData);
    return await product.save();
  }

  async getAllProducts() {
    return await Product.find();
  }

  async updateStock(id, newStock) {
    return await Product.findByIdAndUpdate(id, { stock: newStock }, { new: true });
  }

  async getProductById(id) {
    return await Product.findById(id);
  }
}

module.exports = new ProductService();