const bcrypt = require('bcryptjs');
const User = require('../model/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

// Create Cashier
exports.createCashier = catchAsync(async (req, res, next) => {
  const { name, phone, password } = req.body;

  // Validate required fields
  if (!name || !phone || !password) {
    return next(new AppError('Please provide name, phone and password', 400));
  }

  // Validate password length
  if (password.length < 8) {
    return next(new AppError('Password must be at least 8 characters', 400));
  }

  // Validate name length
  if (name.trim().length < 2) {
    return next(new AppError('Name must be at least 2 characters', 400));
  }

  if (name.trim().length > 100) {
    return next(new AppError('Name must not exceed 100 characters', 400));
  }

  // Get restaurantId from authenticated owner
  const restaurantId = req.user.restaurantId;

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Create cashier
  const cashier = await User.create({
    restaurantId,
    name,
    phone,
    passwordHash,
    role: 'Cashier',
    isActive: true,
  });

  // Remove passwordHash from response
  cashier.passwordHash = undefined;

  res.status(201).json({
    status: 'success',
    data: {
      cashier,
    },
  });
});

// Get All Cashiers
exports.getAllCashiers = catchAsync(async (req, res, next) => {
  // Build query for cashiers in owner's restaurant
  const query = {
    restaurantId: req.user.restaurantId,
    role: 'Cashier',
  };

  const features = new APIFeatures(User.find(query), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const cashiers = await features.query.select('-passwordHash');

  res.status(200).json({
    status: 'success',
    results: cashiers.length,
    data: {
      cashiers,
    },
  });
});

// Get Single Cashier
exports.getCashier = catchAsync(async (req, res, next) => {
  const cashier = await User.findOne({
    _id: req.params.id,
    restaurantId: req.user.restaurantId,
    role: 'Cashier',
  }).select('-passwordHash');

  if (!cashier) {
    return next(new AppError('No cashier found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      cashier,
    },
  });
});

// Update Cashier
exports.updateCashier = catchAsync(async (req, res, next) => {
  // Only allow updating name and phone
  const { name, phone } = req.body;

  if (!name && !phone) {
    return next(new AppError('Please provide name or phone to update', 400));
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (phone) updateData.phone = phone;

  const cashier = await User.findOneAndUpdate(
    {
      _id: req.params.id,
      restaurantId: req.user.restaurantId,
      role: 'Cashier',
    },
    updateData,
    {
      new: true,
      runValidators: true,
    }
  ).select('-passwordHash');

  if (!cashier) {
    return next(new AppError('No cashier found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      cashier,
    },
  });
});

// Activate Cashier
exports.activateCashier = catchAsync(async (req, res, next) => {
  const cashier = await User.findOneAndUpdate(
    {
      _id: req.params.id,
      restaurantId: req.user.restaurantId,
      role: 'Cashier',
    },
    { isActive: true },
    {
      new: true,
      runValidators: true,
    }
  ).select('-passwordHash');

  if (!cashier) {
    return next(new AppError('No cashier found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      cashier,
    },
  });
});

// Deactivate Cashier
exports.deactivateCashier = catchAsync(async (req, res, next) => {
  const cashier = await User.findOneAndUpdate(
    {
      _id: req.params.id,
      restaurantId: req.user.restaurantId,
      role: 'Cashier',
    },
    { isActive: false },
    {
      new: true,
      runValidators: true,
    }
  ).select('-passwordHash');

  if (!cashier) {
    return next(new AppError('No cashier found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      cashier,
    },
  });
});

// Reset Cashier Password
exports.resetCashierPassword = catchAsync(async (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return next(new AppError('Please provide a new password', 400));
  }

  if (password.length < 8) {
    return next(new AppError('Password must be at least 8 characters', 400));
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(password, 12);

  const cashier = await User.findOneAndUpdate(
    {
      _id: req.params.id,
      restaurantId: req.user.restaurantId,
      role: 'Cashier',
    },
    { passwordHash },
    {
      new: true,
      runValidators: true,
    }
  ).select('-passwordHash');

  if (!cashier) {
    return next(new AppError('No cashier found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Password reset successfully',
    data: {
      cashier,
    },
  });
});

// Delete Cashier (Soft Delete)
exports.deleteCashier = catchAsync(async (req, res, next) => {
  const cashier = await User.findOneAndUpdate(
    {
      _id: req.params.id,
      restaurantId: req.user.restaurantId,
      role: 'Cashier',
    },
    { isActive: false },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!cashier) {
    return next(new AppError('No cashier found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

