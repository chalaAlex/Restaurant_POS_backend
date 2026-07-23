const express = require('express');
const orderController = require('../controller/orderController');
const authController = require('../controller/authController');

const router = express.Router();

router.use(authController.protect);

router
  .route('/')
  .get(orderController.getAllOrders)
  .post(
    authController.restrictTo('Cashier'),
    orderController.createOrder
  );

router
  .route('/:id')
  .get(orderController.getOrder);

router
  .route('/:id/void')
  .patch(
    authController.restrictTo('Owner'),
    orderController.voidOrder
  );

router
  .route('/:id/return')
  .patch(
    authController.restrictTo('Owner'),
    orderController.returnOrder
  );

module.exports = router;
