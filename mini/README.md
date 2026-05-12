# Mini Order Management System API

A Node.js backend API for managing users, products, and orders using Express and MongoDB.

## Setup

1. Install dependencies: `npm install`
2. Set up MongoDB and update `.env` with your MONGO_URI
3. Start the server: `npm start` or `npm run dev`

## API Endpoints

### Users

- **POST /api/users** - Create a user
  - Body: `{ "name": "string", "email": "string", "phone": "string" }`

- **GET /api/users** - Get all users

- **GET /api/users/:id** - Get user by ID

### Products

- **POST /api/products** - Create a product
  - Body: `{ "name": "string", "price": number, "stock": number, "category": "string" }`

- **GET /api/products** - Get all products

- **PUT /api/products/:id/stock** - Update product stock
  - Body: `{ "stock": number }`

### Orders

- **POST /api/orders** - Create an order
  - Body: `{ "userId": "string", "products": [{ "productId": "string", "quantity": number }] }`

- **GET /api/orders** - Get all orders

## Features

- Input validation with Joi
- Error handling
- Atomic stock deduction for orders
- Environment-based configuration