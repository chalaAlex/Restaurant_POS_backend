const Restaurant = require('../model/restaurantModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

// Get all restaurants
exports.getAllRestaurants = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Restaurant.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  
  const restaurants = await features.query;

  res.status(200).json({
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
    status: 'success',
    data: {
      restaurant,
    },
  });
});

// Create restaurant
exports.createRestaurant = catchAsync(async (req, res, next) => {
  const newRestaurant = await Restaurant.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      restaurant: newRestaurant,
    },
  });
});

// Update restaurant
exports.updateRestaurant = catchAsync(async (req, res, next) => {
  const restaurant = await Restaurant.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!restaurant) {
    return next(new AppError('No restaurant found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      restaurant,
    },
  });
});

// Delete restaurant
exports.deleteRestaurant = catchAsync(async (req, res, next) => {
  const restaurant = await Restaurant.findByIdAndDelete(req.params.id);

  if (!restaurant) {
    return next(new AppError('No restaurant found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
