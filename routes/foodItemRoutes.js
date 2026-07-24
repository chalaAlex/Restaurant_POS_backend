const express = require('express');
const foodItemController = require('../controller/foodItemController');
const authController = require('../controller/authController');

const router = express.Router();

router.use(authController.protect);

router
  .route('/')
  .get(foodItemController.getAllFoodItems)
  .post(
    authController.restrictTo('Owner'),
    foodItemController.createFoodItem
  );

router
  .route('/:id')
  .get(foodItemController.getFoodItem)
  .patch(
    authController.restrictTo('Owner'),
    foodItemController.updateFoodItem
  )
  .delete(
    authController.restrictTo('Owner'),
    foodItemController.deleteFoodItem
  );

router
  .route('/:id/availability')
  .patch(
    authController.restrictTo('Owner'),
    foodItemController.changeAvailability
  );

module.exports = router;
