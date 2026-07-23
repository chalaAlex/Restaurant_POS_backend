const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { promisify } = require('util');
const User = require('../model/userModel');
const Restaurant = require('../model/restaurantModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Sign JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d',
  });
};

// Create and send token
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 90) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.passwordHash = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// Signup (Owner creates Cashier)
exports.signup = catchAsync(async (req, res, next) => {
  const { restaurantId, name, phone, password, role } = req.body;

  // Check if restaurant exists and is active
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    return next(new AppError('Restaurant not found', 404));
  }

  if (!restaurant.isActive) {
    return next(new AppError('Cannot create user for inactive restaurant', 400));
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  const newUser = await User.create({
    restaurantId,
    name,
    phone,
    passwordHash,
    role: role || 'Cashier',
  });

  createSendToken(newUser, 201, res);
});

// Login
exports.login = catchAsync(async (req, res, next) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return next(new AppError('Please provide phone and password', 400));
  }

  const user = await User.findOne({ phone }).populate('restaurantId');

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return next(new AppError('Incorrect phone or password', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Your account is inactive', 401));
  }

  if (!user.restaurantId.isActive) {
    return next(new AppError('Restaurant is inactive', 401));
  }

  createSendToken(user, 200, res);
});

// Protect middleware
exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in', 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('User no longer exists', 401));
  }

  if (!currentUser.isActive) {
    return next(new AppError('User is inactive', 401));
  }

  req.user = currentUser;
  next();
});

// Restrict to roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission', 403));
    }
    next();
  };
};
