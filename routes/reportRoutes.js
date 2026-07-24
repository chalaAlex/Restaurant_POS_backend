const express = require('express');
const reportController = require('../controller/reportController');
const authController = require('../controller/authController');

const router = express.Router();

// All routes require authentication and Owner role
router.use(authController.protect);
router.use(authController.restrictTo('Owner'));

router.get('/dashboard', reportController.getDashboard);
router.get('/daily', reportController.getDailySales);
router.get('/monthly', reportController.getMonthlySales);
router.get('/cashiers', reportController.getSalesByCashier);
router.get('/top-foods', reportController.getTopFoods);
router.get('/least-foods', reportController.getLeastFoods);
router.get('/orders', reportController.getOrderStatistics);
router.get('/payments', reportController.getPaymentMethodReport);

module.exports = router;
