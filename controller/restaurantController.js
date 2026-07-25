const Restaurant = require('../model/restaurantModel');
const User = require('../model/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const bcrypt = require('bcryptjs');

// Register restaurant (creates restaurant + owner)
exports.registerRestaurant = catchAsync(async (req, res, next) => {
  const { name, address, phone, ownerName, ownerPhone, ownerPassword } = req.body;

  // Validate required fields
  if (!name || !address || !phone || !ownerName || !ownerPhone || !ownerPassword) {
    return next(
      new AppError(
        'Please provide restaurant name, address, phone, owner name, owner phone, and owner password',
        400
      )
    );
  }

  // Check if owner phone already exists
  const existingUser = await User.findOne({ phone: ownerPhone });
  if (existingUser) {
    return next(new AppError('Phone number already registered', 400));
  }

  // Create restaurant
  const newRestaurant = await Restaurant.create({
    name,
    address,
    phone,
    isActive: true,
  });

  // Hash owner password
  const passwordHash = await bcrypt.hash(ownerPassword, 12);

  // Create owner user
  const owner = await User.create({
    restaurantId: newRestaurant._id,
    name: ownerName,
    phone: ownerPhone,
    passwordHash,
    role: 'Owner',
    isActive: true,
  });

  // Remove passwordHash from response
  owner.passwordHash = undefined;

  res.status(201).json({
    statusCode: 201,
    status: 'success',
    message: 'Restaurant and owner created successfully',
    data: {
      restaurant: newRestaurant,
      owner,
    },
  });
});

// Get all restaurants
exports.getAllRestaurants = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Restaurant.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const restaurants = await features.query;

  res.status(200).json({
    statusCode: 200,
    status: 'success',
    results: restaurants.length,
    data: {
      restaurants,
    },
  });
});

// Get single restaurant
exports.getRestaurant = catchAsync(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return next(new AppError('No restaurant found with that ID', 404));
  }

  res.status(200).json({
    statusCode: 200,
    status: 'success',
    data: {
      restaurant,
    },
  });
});

// Update restaurant (Owner can only update their own restaurant)
exports.updateRestaurant = catchAsync(async (req, res, next) => {
  // Check if restaurant exists
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return next(new AppError('No restaurant found with that ID', 404));
  }

  // Verify owner belongs to this restaurant
  if (req.user.restaurantId.toString() !== restaurant._id.toString()) {
    return next(
      new AppError('You can only update your own restaurant', 403)
    );
  }

  // Allowed fields to update
  const allowedFields = ['name', 'address', 'phone', 'isActive'];
  const updates = {};

  Object.keys(req.body).forEach((key) => {
    if (allowedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  const updatedRestaurant = await Restaurant.findByIdAndUpdate(
    req.params.id,
    updates,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    statusCode: 200,
    status: 'success',
    data: {
      restaurant: updatedRestaurant,
    },
  });
});

// Deactivate restaurant (soft delete - Owner only)
exports.deactivateRestaurant = catchAsync(async (req, res, next) => {
  // Check if restaurant exists
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return next(new AppError('No restaurant found with that ID', 404));
  }

  // Verify owner belongs to this restaurant
  if (req.user.restaurantId.toString() !== restaurant._id.toString()) {
    return next(
      new AppError('You can only deactivate your own restaurant', 403)
    );
  }

  const updatedRestaurant = await Restaurant.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  res.status(200).json({
    statusCode: 200,
    status: 'success',
    message: 'Restaurant deactivated successfully',
    data: {
      restaurant: updatedRestaurant,
    },
  });
});

// Activate restaurant (Owner only)
exports.activateRestaurant = catchAsync(async (req, res, next) => {
  // Check if restaurant exists
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return next(new AppError('No restaurant found with that ID', 404));
  }

  // Verify owner belongs to this restaurant
  if (req.user.restaurantId.toString() !== restaurant._id.toString()) {
    return next(
      new AppError('You can only activate your own restaurant', 403)
    );
  }

  const updatedRestaurant = await Restaurant.findByIdAndUpdate(
    req.params.id,
    { isActive: true },
    { new: true }
  );

  res.status(200).json({
    statusCode: 200,
    status: 'success',
    message: 'Restaurant activated successfully',
    data: {
      restaurant: updatedRestaurant,
    },
  });
});
