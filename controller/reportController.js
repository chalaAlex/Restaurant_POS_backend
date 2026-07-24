const Order = require('../model/orderModel');
const FoodItem = require('../model/foodItemModel');
const User = require('../model/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Dashboard Summary
exports.getDashboard = catchAsync(async (req, res, next) => {
  const restaurantId = req.user.restaurantId;

  // Get today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Today's sales and order count (only Placed orders)
  const todaySales = await Order.aggregate([
    {
      $match: {
        restaurantId,
        status: 'Placed',
        createdAt: { $gte: today, $lt: tomorrow },
      },
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$totalAmount' },
        orderCount: { $sum: 1 },
      },
    },
  ]);

  // Total food items
  const totalFoodItems = await FoodItem.countDocuments({ restaurantId });

  // Total cashiers
  const totalCashiers = await User.countDocuments({
    restaurantId,
    role: 'Cashier',
  });

  // Total returned orders
  const totalReturned = await Order.countDocuments({
    restaurantId,
    status: 'Returned',
  });

  // Total voided orders
  const totalVoided = await Order.countDocuments({
    restaurantId,
    status: 'Voided',
  });

  const dashboard = {
    todaySales: todaySales[0]?.totalSales || 0,
    todayOrderCount: todaySales[0]?.orderCount || 0,
    totalFoodItems,
    totalCashiers,
    totalReturned,
    totalVoided,
  };

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    data: {
      dashboard,
    },
  });
});

// Daily Sales Report
exports.getDailySales = catchAsync(async (req, res, next) => {
  const restaurantId = req.user.restaurantId;

  // Get date from query or use today
  const dateParam = req.query.date;
  let targetDate = new Date();

  if (dateParam) {
    targetDate = new Date(dateParam);
    if (isNaN(targetDate.getTime())) {
      return next(new AppError('Invalid date format', 400));
    }
  }

  targetDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const dailySales = await Order.aggregate([
    {
      $match: {
        restaurantId,
        status: 'Placed',
        createdAt: { $gte: targetDate, $lt: nextDay },
      },
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$totalAmount' },
        orderCount: { $sum: 1 },
        averageOrderValue: { $avg: '$totalAmount' },
      },
    },
  ]);

  const report = dailySales[0] || {
    totalSales: 0,
    orderCount: 0,
    averageOrderValue: 0,
  };

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    data: {
      date: targetDate.toISOString().split('T')[0],
      totalSales: report.totalSales,
      orderCount: report.orderCount,
      averageOrderValue: Math.round(report.averageOrderValue * 100) / 100,
    },
  });
});

// Monthly Sales Report
exports.getMonthlySales = catchAsync(async (req, res, next) => {
  const restaurantId = req.user.restaurantId;

  // Get month and year from query or use current
  const month = parseInt(req.query.month) || new Date().getMonth() + 1;
  const year = parseInt(req.query.year) || new Date().getFullYear();

  if (month < 1 || month > 12) {
    return next(new AppError('Invalid month. Must be between 1 and 12', 400));
  }

  if (year < 2000 || year > 2100) {
    return next(new AppError('Invalid year', 400));
  }

  // Create date range
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const monthlySales = await Order.aggregate([
    {
      $match: {
        restaurantId,
        status: 'Placed',
        createdAt: { $gte: startDate, $lt: endDate },
      },
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$totalAmount' },
        orderCount: { $sum: 1 },
      },
    },
  ]);

  const report = monthlySales[0] || {
    totalSales: 0,
    orderCount: 0,
  };

  // Calculate average daily sales
  const daysInMonth = new Date(year, month, 0).getDate();
  const averageDailySales = report.totalSales / daysInMonth;

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    data: {
      month,
      year,
      totalSales: report.totalSales,
      orderCount: report.orderCount,
      averageDailySales: Math.round(averageDailySales * 100) / 100,
    },
  });
});

// Sales By Cashier
exports.getSalesByCashier = catchAsync(async (req, res, next) => {
  const restaurantId = req.user.restaurantId;

  const cashierSales = await Order.aggregate([
    {
      $match: {
        restaurantId,
        status: 'Placed',
      },
    },
    {
      $group: {
        _id: '$cashierId',
        orderCount: { $sum: 1 },
        totalSales: { $sum: '$totalAmount' },
        averageOrderValue: { $avg: '$totalAmount' },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'cashier',
      },
    },
    {
      $unwind: '$cashier',
    },
    {
      $project: {
        name: '$cashier.name',
        phone: '$cashier.phone',
        orderCount: 1,
        totalSales: 1,
        averageOrderValue: { $round: ['$averageOrderValue', 2] },
      },
    },
    {
      $sort: { totalSales: -1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    results: cashierSales.length,
    data: {
      cashiers: cashierSales,
    },
  });
});

// Top Selling Food Items
exports.getTopFoods = catchAsync(async (req, res, next) => {
  const restaurantId = req.user.restaurantId;
  const limit = parseInt(req.query.limit) || 10;

  const topFoods = await Order.aggregate([
    {
      $match: {
        restaurantId,
        status: 'Placed',
      },
    },
    {
      $unwind: '$items',
    },
    {
      $group: {
        _id: '$items.name',
        quantitySold: { $sum: '$items.quantity' },
        revenue: { $sum: '$items.subtotal' },
      },
    },
    {
      $sort: { quantitySold: -1 },
    },
    {
      $limit: limit,
    },
    {
      $project: {
        _id: 0,
        name: '$_id',
        quantitySold: 1,
        revenue: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    results: topFoods.length,
    data: {
      foods: topFoods,
    },
  });
});

// Least Selling Food Items
exports.getLeastFoods = catchAsync(async (req, res, next) => {
  const restaurantId = req.user.restaurantId;
  const limit = parseInt(req.query.limit) || 10;

  const leastFoods = await Order.aggregate([
    {
      $match: {
        restaurantId,
        status: 'Placed',
      },
    },
    {
      $unwind: '$items',
    },
    {
      $group: {
        _id: '$items.name',
        quantitySold: { $sum: '$items.quantity' },
        revenue: { $sum: '$items.subtotal' },
      },
    },
    {
      $sort: { quantitySold: 1 },
    },
    {
      $limit: limit,
    },
    {
      $project: {
        _id: 0,
        name: '$_id',
        quantitySold: 1,
        revenue: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    results: leastFoods.length,
    data: {
      foods: leastFoods,
    },
  });
});

// Order Statistics
exports.getOrderStatistics = catchAsync(async (req, res, next) => {
  const restaurantId = req.user.restaurantId;

  const statistics = await Order.aggregate([
    {
      $match: {
        restaurantId,
      },
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  // Transform to object
  const stats = {
    totalOrders: 0,
    placedOrders: 0,
    returnedOrders: 0,
    voidedOrders: 0,
  };

  statistics.forEach((stat) => {
    stats.totalOrders += stat.count;
    if (stat._id === 'Placed') stats.placedOrders = stat.count;
    if (stat._id === 'Returned') stats.returnedOrders = stat.count;
    if (stat._id === 'Voided') stats.voidedOrders = stat.count;
  });

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    data: {
      statistics: stats,
    },
  });
});

// Payment Method Report
exports.getPaymentMethodReport = catchAsync(async (req, res, next) => {
  const restaurantId = req.user.restaurantId;

  const paymentStats = await Order.aggregate([
    {
      $match: {
        restaurantId,
        status: 'Placed',
      },
    },
    {
      $group: {
        _id: '$paymentMethod',
        orderCount: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
      },
    },
    {
      $project: {
        _id: 0,
        paymentMethod: '$_id',
        orderCount: 1,
        totalRevenue: 1,
      },
    },
    {
      $sort: { totalRevenue: -1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    results: paymentStats.length,
    data: {
      payments: paymentStats,
    },
  });
});
