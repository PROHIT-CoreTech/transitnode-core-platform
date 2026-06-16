const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');

const authGuard = require('../middleware/authGuard');

// Special route for post-billing admin setup
router.post('/setup-admin', userController.setupAdmin);

// Apply middleware to all other user routes: Must be logged in AND have 'Admin' role
router.use(verifyToken, checkRole('ADMIN')); // Ensure role is uppercase ADMIN as created in saasController

// CRUD operations
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
