const Order = require('../model/orderModel');
const FoodItem = require('../model/foodItemModel');
const AuditLog = require('../model/auditLogModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

// Generate order number
const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-3);
  return `ORD-${year}${month}${day}-${timestamp}`;
};

// Get all orders
exports.getAllOrders = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Order.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  
  const orders = await features.query
    .populate('restaurantId', 'name')
    .populate('cashierId', 'name phone');

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders,
    },
  });
});

// Get single order
exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('restaurantId', 'name')
    .populate('cashierId', 'name phone');

  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      order,
    },
  });
});

// Create order
exports.createOrder = catchAsync(async (req, res, next) => {
  const { restaurantId, items, paymentMethod } = req.body;
  const cashierId = req.user.id; // Assuming auth middleware sets req.user

  // Validate and create order items with snapshots
  const orderItems = [];
  let totalAmount = 0;

  for (const item of items) {
    const foodItem = await FoodItem.findById(item.foodItemId);
    
    if (!foodItem) {
      return next(new AppError(`Food item ${item.foodItemId} not found`, 404));
    }

    if (!foodItem.isAvailable) {
      return next(new AppError(`${foodItem.name} is not available`, 400));
    }

    const subtotal = foodItem.price * item.quantity;
    totalAmount += subtotal;

    orderItems.push({
      foodItemId: foodItem._id,
      name: foodItem.name,
      category: foodItem.category,
      unitPrice: foodItem.price,
      quantity: item.quantity,
      subtotal,
    });
  }

  const orderNumber = generateOrderNumber();

  const newOrder = await Order.create({
    restaurantId,
    orderNumber,
    cashierId,
    items: orderItems,
    totalAmount,
    paymentMethod,
    status: 'Placed',
  });

  res.status(201).json({
    status: 'success',
    data: {
      order: newOrder,
    },
  });
});

// Void order
exports.voidOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }

  if (order.status !== 'Placed') {
    return next(new AppError('Only placed orders can be voided', 400));
  }

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
    data: {
      order,
    },
  });
});

// Return order
exports.returnOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }

  if (order.status !== 'Placed') {
    return next(new AppError('Only placed orders can be returned', 400));
  }

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
    data: {
      order,
    },
  });
});
