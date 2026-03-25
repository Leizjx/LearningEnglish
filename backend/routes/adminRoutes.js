const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

// Admin routes (protected)
router.get('/overview', verifyToken, checkRole('admin'), adminController.getDashboardOverview);
router.get('/users', verifyToken, checkRole('admin'), adminController.getAllUsers);
router.post('/users', verifyToken, checkRole('admin'), adminController.createUser);
router.put('/users/:id', verifyToken, checkRole('admin'), adminController.updateUser);
router.delete('/users/:id', verifyToken, checkRole('admin'), adminController.deleteUser);

module.exports = router;
