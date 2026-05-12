const User = require('../models/User');

class UserService {
  async createUser(userData) {
    const user = new User(userData);
    return await user.save();
  }

  async getUserById(id) {
    return await User.findById(id);
  }

  async getAllUsers() {
    return await User.find();
  }
}

module.exports = new UserService();