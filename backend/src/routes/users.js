const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');

// Apply middleware to all user routes: Must be logged in AND have 'Admin' role
router.use(verifyToken, checkRole('Admin'));

// CRUD operations
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
