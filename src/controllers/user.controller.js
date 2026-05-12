const userService = require('../services/user.service');

const createUser = async (req, res) => {
  const user = await userService.createUser(req.body);
  return res.status(201).json({ success: true, data: user });
};

const getUserById = async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  return res.json({ success: true, data: user });
};

const listUsers = async (req, res) => {
  const users = await userService.listUsers();
  return res.json({ success: true, data: users });
};

module.exports = {
  createUser,
  getUserById,
  listUsers,
};
