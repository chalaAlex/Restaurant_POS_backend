const Order = require('../model/orderModel');
const FoodItem = require('../model/foodItemModel');
const AuditLog = require('../model/auditLogModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const generateOrderNumber = require('../utils/generateOrderNumber');

// Get all orders
exports.getAllOrders = catchAsync(async (req, res, next) => {
  // Build query based on user role
  let query = {};

  if (req.user.role === 'Cashier') {
    // Cashiers can only see their own orders
    query = {
      cashierId: req.user.id,
      restaurantId: req.user.restaurantId,
    };
  } else if (req.user.role === 'Owner') {
    // Owners can see all restaurant orders
    query = {
      restaurantId: req.user.restaurantId,
    };
  }

  const features = new APIFeatures(Order.find(query), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const orders = await features.query
    .populate('cashierId', 'name phone');

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    results: orders.length,
    data: {
      orders,
    },
  });
});

// Get single order
exports.getOrder = catchAsync(async (req, res, next) => {
  // Build query based on user role
  let query = { _id: req.params.id };

  if (req.user.role === 'Cashier') {
    // Cashiers can only see their own orders
    query.cashierId = req.user.id;
    query.restaurantId = req.user.restaurantId;
  } else if (req.user.role === 'Owner') {
    // Owners can see all restaurant orders
    query.restaurantId = req.user.restaurantId;
  }

  const order = await Order.findOne(query)
    .populate('cashierId', 'name phone');

  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    data: {
      order,
    },
  });
});

// Create order
exports.createOrder = catchAsync(async (req, res, next) => {
  const { items, paymentMethod } = req.body;

  // Validate required fields
  if (!items || !Array.isArray(items) || items.length === 0) {
    return next(new AppError('Order must contain at least one item', 400));
  }

  if (!paymentMethod) {
    return next(new AppError('Payment method is required', 400));
  }

  // Validate payment method
  const validPaymentMethods = ['Cash', 'MobileBanking', 'Telebirr'];
  if (!validPaymentMethods.includes(paymentMethod)) {
    return next(new AppError('Invalid payment method', 400));
  }

  // Get restaurantId and cashierId from authenticated user
  const restaurantId = req.user.restaurantId;
  const cashierId = req.user.id;

  // Validate and create order items with snapshots
  const orderItems = [];
  let totalAmount = 0;

  for (const item of items) {
    // Validate quantity
    if (!item.quantity || item.quantity <= 0) {
      return next(new AppError('Quantity must be greater than zero', 400));
    }

    // Fetch food item
    const foodItem = await FoodItem.findOne({
      _id: item.foodItemId,
      restaurantId,
    });

    if (!foodItem) {
      return next(new AppError(`Food item ${item.foodItemId} not found`, 404));
    }

    // Check if food item is available
    if (!foodItem.isAvailable) {
      return next(new AppError(`${foodItem.name} is not available`, 400));
    }

    // Calculate subtotal
    const subtotal = foodItem.price * item.quantity;
    totalAmount += subtotal;

    // Create order item snapshot
    orderItems.push({
      foodItemId: foodItem._id,
      name: foodItem.name,
      category: foodItem.category,
      unitPrice: foodItem.price,
      quantity: item.quantity,
      subtotal,
    });
  }

  // Generate order number
  const orderNumber = generateOrderNumber();

  // Create order
  const newOrder = await Order.create({
    restaurantId,
    orderNumber,
    cashierId,
    items: orderItems,
    totalAmount,
    paymentMethod,
    status: 'Placed',
  });

  // Populate cashier info
  await newOrder.populate('cashierId', 'name phone');

  res.status(201).json({
    status: 'success',
    statusCode: 201,
    data: {
      order: newOrder,
    },
  });
});

// Void order
exports.voidOrder = catchAsync(async (req, res, next) => {
  // Find order in owner's restaurant
  const order = await Order.findOne({
    _id: req.params.id,
    restaurantId: req.user.restaurantId,
  });

  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }

  // Check if order can be voided
  if (order.status !== 'Placed') {
    return next(new AppError('Only placed orders can be voided', 400));
  }

  // Update status
  const oldValue = { status: order.status };
  order.status = 'Voided';
  await order.save();

  // Create audit log
  await AuditLog.create({
    restaurantId: order.restaurantId,
    userId: req.user.id,
    action: 'Void',
    entityId: order._id,
    oldValue,
    newValue: { status: 'Voided' },
  });

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    data: {
      order,
    },
  });
});

// Return order
exports.returnOrder = catchAsync(async (req, res, next) => {
  // Find order in owner's restaurant
  const order = await Order.findOne({
    _id: req.params.id,
    restaurantId: req.user.restaurantId,
  });

  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }

  // Check if order can be returned
  if (order.status !== 'Placed') {
    return next(new AppError('Only placed orders can be returned', 400));
  }

  // Update status
  const oldValue = { status: order.status };
  order.status = 'Returned';
  await order.save();

  // Create audit log
  await AuditLog.create({
    restaurantId: order.restaurantId,
    userId: req.user.id,
    action: 'Return',
    entityId: order._id,
    oldValue,
    newValue: { status: 'Returned' },
  });

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    data: {
      order,
    },
  });
});
