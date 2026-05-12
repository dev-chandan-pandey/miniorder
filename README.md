# Mini Order Management System API

Simple Node.js backend for product order management with MongoDB.

## Setup

1. Copy `.env.example` to `.env` and set `MONGO_URI`.
2. Run `npm install`.
3. Start with `npm run dev`.

## Features

- User creation, retrieval, list
- Product creation, listing, stock update
- Order creation, cancellation with stock restore
- MongoDB transactions and atomic stock operations
- Centralized error handling and validation middleware

# Mini Order Management System API — Node.js Backend Assignment

## Recommended Stack

* Node.js + Express
* MongoDB + Mongoose
* JWT Authentication (Bonus)
* dotenv for environment config
* express-validator or Joi for validation
* morgan for logging
* express-rate-limit for rate limiting
* swagger-ui-express for API docs

---

# Project Structure

```bash
src/
│
├── config/
│   ├── db.js
│   └── env.js
│
├── controllers/
│   ├── user.controller.js
│   ├── product.controller.js
│   └── order.controller.js
│
├── services/
│   ├── user.service.js
│   ├── product.service.js
│   └── order.service.js
│
├── models/
│   ├── User.js
│   ├── Product.js
│   └── Order.js
│
├── routes/
│   ├── user.routes.js
│   ├── product.routes.js
│   └── order.routes.js
│
├── middlewares/
│   ├── error.middleware.js
│   ├── validate.middleware.js
│   ├── auth.middleware.js
│   └── logger.middleware.js
│
├── validators/
│   ├── user.validator.js
│   ├── product.validator.js
│   └── order.validator.js
│
├── utils/
│   └── ApiError.js
│
├── app.js
└── server.js
```

---

# Installation

```bash
npm init -y

npm install express mongoose dotenv cors morgan express-rate-limit bcryptjs jsonwebtoken swagger-ui-express swagger-jsdoc

npm install express-validator

npm install --save-dev nodemon
```

---

# Environment Variables

## `.env`

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/order-management
JWT_SECRET=mysecretkey
NODE_ENV=development
```

---

# Database Configuration

## `src/config/db.js`

```js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

---

# Models

## User Model

### `src/models/User.js`

```js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
```

---

## Product Model

### `src/models/Product.js`

```js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    category: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
```

---

## Order Model

### `src/models/Order.js`

```js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        quantity: Number,
        price: Number,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['PLACED', 'CANCELLED'],
      default: 'PLACED',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);
```

---

# Services Layer

## User Service

### `src/services/user.service.js`

```js
const User = require('../models/User');

const createUser = async (data) => {
  return await User.create(data);
};

const getUserById = async (id) => {
  return await User.findById(id);
};

const getAllUsers = async () => {
  return await User.find();
};

module.exports = {
  createUser,
  getUserById,
  getAllUsers,
};
```

---

## Product Service

### `src/services/product.service.js`

```js
const Product = require('../models/Product');

const createProduct = async (data) => {
  return await Product.create(data);
};

const getProducts = async (page, limit) => {
  const skip = (page - 1) * limit;

  return await Product.find()
    .skip(skip)
    .limit(limit);
};

const updateStock = async (id, stock) => {
  return await Product.findByIdAndUpdate(
    id,
    { stock },
    { new: true }
  );
};

module.exports = {
  createProduct,
  getProducts,
  updateStock,
};
```

---

## Order Service (Core Logic)

### `src/services/order.service.js`

```js
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const createOrder = async ({ userId, products }) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    let totalAmount = 0;
    const orderProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.productId).session(session);

      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      product.stock -= item.quantity;
      await product.save({ session });

      const amount = product.price * item.quantity;
      totalAmount += amount;

      orderProducts.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const order = await Order.create(
      [
        {
          userId,
          products: orderProducts,
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

module.exports = {
  createOrder,
};
```

---

# Controllers

## User Controller

### `src/controllers/user.controller.js`

```js
const userService = require('../services/user.service');

const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  getUserById,
  getAllUsers,
};
```

---

## Product Controller

### `src/controllers/product.controller.js`

```js
const productService = require('../services/product.service');

const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const products = await productService.getProducts(page, limit);

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

const updateStock = async (req, res, next) => {
  try {
    const product = await productService.updateStock(
      req.params.id,
      req.body.stock
    );

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getProducts,
  updateStock,
};
```

---

## Order Controller

### `src/controllers/order.controller.js`

```js
const orderService = require('../services/order.service');

const createOrder = async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.body);

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
};
```

---

# Routes

## User Routes

### `src/routes/user.routes.js`

```js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

router.post('/', userController.createUser);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);

module.exports = router;
```

---

## Product Routes

### `src/routes/product.routes.js`

```js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

router.post('/', productController.createProduct);
router.get('/', productController.getProducts);
router.patch('/:id/stock', productController.updateStock);

module.exports = router;
```

---

## Order Routes

### `src/routes/order.routes.js`

```js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');

router.post('/', orderController.createOrder);

module.exports = router;
```

---

# Validation Example

## `src/validators/user.validator.js`

```js
const { body } = require('express-validator');

exports.createUserValidation = [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('phone').notEmpty(),
];
```

---

# Error Middleware

## `src/middlewares/error.middleware.js`

```js
const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};

module.exports = errorMiddleware;
```

---

# App Setup

## `src/app.js`

```js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.use(errorMiddleware);

module.exports = app;
```

---

# Server Entry

## `src/server.js`

```js
require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

# API Endpoints

## User APIs

| Method | Endpoint       | Description    |
| ------ | -------------- | -------------- |
| POST   | /api/users     | Create user    |
| GET    | /api/users     | List users     |
| GET    | /api/users/:id | Get user by ID |

---

## Product APIs

| Method | Endpoint                | Description    |
| ------ | ----------------------- | -------------- |
| POST   | /api/products           | Create product |
| GET    | /api/products           | List products  |
| PATCH  | /api/products/:id/stock | Update stock   |

---

## Order APIs

| Method | Endpoint    | Description  |
| ------ | ----------- | ------------ |
| POST   | /api/orders | Create order |

---

# Sample Order Request

```json
{
  "userId": "6640a8e3d2f8f8c9d9d9d9d9",
  "products": [
    {
      "productId": "6640a8e3d2f8f8c9d9d9d9a1",
      "quantity": 2
    },
    {
      "productId": "6640a8e3d2f8f8c9d9d9d9a2",
      "quantity": 1
    }
  ]
}
```

---

# Important Interview Discussion Points

## Why Transactions?

Transactions ensure:

* Stock deduction is atomic
* Order creation and stock update happen together
* No inconsistent database state

---

## Why Services Layer?

Benefits:

* Business logic separation
* Easier testing
* Cleaner controllers
* Better scalability

---

## Improvements You Can Mention

* Add Redis caching
* Add RabbitMQ/Kafka for async order processing
* Add payment integration
* Add inventory reservation system
* Add unit/integration tests
* Add CI/CD pipeline

---

# Docker Setup (Bonus)

## Dockerfile

```dockerfile
FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
```

---

## docker-compose.yml

```yaml
version: '3'

services:
  app:
    build: .
    ports:
      - '5000:5000'
    env_file:
      - .env
    depends_on:
      - mongo

  mongo:
    image: mongo
    ports:
      - '27017:27017'
```

---

# README Checklist

Include:

* Setup steps
* Environment variables
* API endpoints
* Postman collection
* Architecture explanation
* Assumptions
* Bonus features implemented

---

# Final Tips for Submission

1. Keep API responses consistent
2. Use proper HTTP status codes
3. Handle edge cases
4. Write clean commit messages
5. Add Postman collection export
6. Ensure order logic works correctly
7. Focus heavily on transaction handling
8. Keep naming conventions consistent

---

# Suggested Timeline for 1 Hour

| Time      | Task                             |
| --------- | -------------------------------- |
| 0-10 min  | Project setup + folder structure |
| 10-20 min | User APIs                        |
| 20-30 min | Product APIs                     |
| 30-45 min | Order transaction logic          |
| 45-55 min | Validation + middleware          |
| 55-60 min | README + testing                 |
