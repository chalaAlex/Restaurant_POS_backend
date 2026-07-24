const express = require('express');
const cashierController = require('../controller/cashierController');
const authController = require('../controller/authController');

const router = express.Router();

// All routes require authentication and Owner role
router.use(authController.protect);
router.use(authController.restrictTo('Owner'));

router
  .route('/')
  .get(cashierController.getAllCashiers)
  .post(cashierController.createCashier);

router
  .route('/:id')
  .get(cashierController.getCashier)
  .patch(cashierController.updateCashier)
  .delete(cashierController.deleteCashier);

router
  .route('/:id/activate')
  .patch(cashierController.activateCashier);

router
  .route('/:id/deactivate')
  .patch(cashierController.deactivateCashier);

router
  .route('/:id/reset-password')
  .patch(cashierController.resetCashierPassword);

module.exports = router;
