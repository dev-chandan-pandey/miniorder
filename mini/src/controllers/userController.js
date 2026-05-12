const userService = require('../services/userService');

class UserController {
  async createUser(req, res) {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  }

  async getUserById(req, res) {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  }

  async getAllUsers(req, res) {
    const users = await userService.getAllUsers();
    res.json(users);
  }
}

module.exports = new UserController();