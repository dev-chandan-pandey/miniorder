const express = require('express');
const userController = require('../controllers/user.controller');
const { createUserValidation } = require('../validators/user.validator');
const { validateRequest } = require('../middleware/validate.middleware');

const router = express.Router();

router.post('/', createUserValidation, validateRequest, userController.createUser);
router.get('/', userController.listUsers);
router.get('/:id', userController.getUserById);

module.exports = router;
