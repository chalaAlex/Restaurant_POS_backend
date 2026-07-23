const express = require('express');
const restaurantController = require('../controller/restaurantController');
const authController = require('../controller/authController');

const router = express.Router();

router
  .route('/')
  .get(restaurantController.getAllRestaurants)
  .post(restaurantController.createRestaurant);

router
  .route('/:id')
  .get(restaurantController.getRestaurant)
  .patch(
    authController.protect,
    authController.restrictTo('Owner'),
    restaurantController.updateRestaurant
  )
  .delete(
    authController.protect,
    authController.restrictTo('Owner'),
    restaurantController.deleteRestaurant
  );

module.exports = router;
