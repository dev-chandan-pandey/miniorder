const mongoose = require('mongoose');

const orderProductSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: { type: [orderProductSchema], required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['PLACED', 'CANCELLED'],
      default: 'PLACED',
    },
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Order', orderSchema);
