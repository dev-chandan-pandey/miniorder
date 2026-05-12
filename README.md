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
