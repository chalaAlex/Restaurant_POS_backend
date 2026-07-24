const FoodItem = require('../model/foodItemModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

// Get all food items
exports.getAllFoodItems = catchAsync(async (req, res, next) => {
  // Build query scoped to authenticated user's restaurant
  const query = {
    restaurantId: req.user.restaurantId,
  };

  const features = new APIFeatures(FoodItem.find(query), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const foodItems = await features.query;

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    results: foodItems.length,
    data: {
      foodItems,
    },
  });
});

// Get single food item
exports.getFoodItem = catchAsync(async (req, res, next) => {
  const foodItem = await FoodItem.findOne({
    _id: req.params.id,
    restaurantId: req.user.restaurantId,
  });

  if (!foodItem) {
    return next(new AppError('No food item found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    data: {
      foodItem,
    },
  });
});

// Create food item
exports.createFoodItem = catchAsync(async (req, res, next) => {
  const { name, category, price, imageUrl, description } = req.body;

  // Validate required fields
  if (!name || !category || !price) {
    return next(
      new AppError('Please provide name, category and price', 400)
    );
  }

  // Validate price
  if (price <= 0) {
    return next(new AppError('Price must be greater than zero', 400));
  }

  // Get restaurantId from authenticated user
  const restaurantId = req.user.restaurantId;

  // Create food item
  const newFoodItem = await FoodItem.create({
    restaurantId,
    name,
    category,
    price,
    imageUrl,
    description,
    isAvailable: true,
  });

  res.status(201).json({
    status: 'success',
    statusCode: 201,
    data: {
      foodItem: newFoodItem,
    },
  });
});

// Update food item
exports.updateFoodItem = catchAsync(async (req, res, next) => {
  // Only allow updating specific fields
  const { name, imageUrl, category, price, description, isAvailable } =
    req.body;

  // Do not allow updating restaurantId or timestamps
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
  if (category !== undefined) updateData.category = category;
  if (price !== undefined) {
    if (price <= 0) {
      return next(new AppError('Price must be greater than zero', 400));
    }
    updateData.price = price;
  }
  if (description !== undefined) updateData.description = description;
  if (isAvailable !== undefined) updateData.isAvailable = isAvailable;

  const foodItem = await FoodItem.findOneAndUpdate(
    {
      _id: req.params.id,
      restaurantId: req.user.restaurantId,
    },
    updateData,
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
    statusCode: 200,
    data: {
      foodItem,
    },
  });
});

// Change availability
exports.changeAvailability = catchAsync(async (req, res, next) => {
  const { isAvailable } = req.body;

  if (isAvailable === undefined) {
    return next(new AppError('Please provide isAvailable value', 400));
  }

  const foodItem = await FoodItem.findOneAndUpdate(
    {
      _id: req.params.id,
      restaurantId: req.user.restaurantId,
    },
    { isAvailable },
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
    statusCode: 200,
    data: {
      foodItem,
    },
  });
});

// Delete food item (soft delete - set isAvailable to false)
exports.deleteFoodItem = catchAsync(async (req, res, next) => {
  const foodItem = await FoodItem.findOneAndUpdate(
    {
      _id: req.params.id,
      restaurantId: req.user.restaurantId,
    },
    { isAvailable: false },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!foodItem) {
    return next(new AppError('No food item found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    statusCode: 204,
    data: null,
  });
});
