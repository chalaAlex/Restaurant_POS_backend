const express = require('express');
const restaurantController = require('../controller/restaurantController');
const authController = require('../controller/authController');

const router = express.Router();

// Public registration endpoint (no auth required)
router.post('/register', restaurantController.registerRestaurant);

// Public read endpoints
router.route('/').get(restaurantController.getAllRestaurants);
router.route('/:id').get(restaurantController.getRestaurant);

// Protected endpoints (Owner only, own restaurant)
router
  .route('/:id')
  .patch(
    authController.protect,
    authController.restrictTo('Owner'),
    restaurantController.updateRestaurant
  );

router.patch(
  '/:id/deactivate',
  authController.protect,
  authController.restrictTo('Owner'),
  restaurantController.deactivateRestaurant
);

router.patch(
  '/:id/activate',
  authController.protect,
  authController.restrictTo('Owner'),
  restaurantController.activateRestaurant
);

module.exports = router;
