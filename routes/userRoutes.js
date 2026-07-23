const express = require('express');
const userController = require('../controller/userController');
const authController = require('../controller/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.use(authController.protect);

router
  .route('/')
  .get(userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(
    authController.restrictTo('Owner'),
    userController.updateUser
  )
  .delete(
    authController.restrictTo('Owner'),
    userController.deleteUser
  );

module.exports = router;
