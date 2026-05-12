const User = require('../models/user.model');

const createUser = async (payload) => {
  const user = await User.create(payload);
  return user;
};

const getUserById = async (id) => {
  return User.findById(id).lean();
};

const listUsers = async () => {
  return User.find().sort({ createdAt: -1 }).lean();
};

module.exports = {
  createUser,
  getUserById,
  listUsers,
};
