const FoodItem = require('../model/foodItemModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

// Get all food items
exports.getAllFoodItems = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(FoodItem.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  
  const foodItems = await features.query;

  res.status(200).json({
    status: 'success',
    results: foodItems.length,
    data: {
      foodItems,
    },
  });
});

// Get single food item
exports.getFoodItem = catchAsync(async (req, res, next) => {
  const foodItem = await FoodItem.findById(req.params.id);

  if (!foodItem) {
    return next(new AppError('No food item found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      foodItem,
    },
  });
});

// Create food item
exports.createFoodItem = catchAsync(async (req, res, next) => {
  const newFoodItem = await FoodItem.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      foodItem: newFoodItem,
    },
  });
});

// Update food item
exports.updateFoodItem = catchAsync(async (req, res, next) => {
  const foodItem = await FoodItem.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!foodItem) {
    return next(new AppError('No food item found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      foodItem,
    },
  });
});

// Delete food item
exports.deleteFoodItem = catchAsync(async (req, res, next) => {
  const foodItem = await FoodItem.findByIdAndDelete(req.params.id);

  if (!foodItem) {
    return next(new AppError('No food item found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});