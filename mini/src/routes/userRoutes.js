const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validate, userSchema } = require('../middleware/validation');

router.post('/', validate(userSchema), userController.createUser);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);

module.exports = router;