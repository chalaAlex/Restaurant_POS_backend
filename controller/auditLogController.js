const AuditLog = require('../model/auditLogModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

// Get all audit logs
exports.getAllAuditLogs = catchAsync(async (req, res, next) => {
  // Build query scoped to authenticated user's restaurant
  const query = {
    restaurantId: req.user.restaurantId,
  };

  // Default sort: newest first
  if (!req.query.sort) {
    req.query.sort = '-timestamp';
  }

  const features = new APIFeatures(AuditLog.find(query), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const auditLogs = await features.query
    .populate('userId', 'name phone role')
    .populate('entityId', 'orderNumber status');

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    results: auditLogs.length,
    data: {
      auditLogs,
    },
  });
});

// Get single audit log
exports.getAuditLog = catchAsync(async (req, res, next) => {
  const auditLog = await AuditLog.findOne({
    _id: req.params.id,
    restaurantId: req.user.restaurantId,
  })
    .populate('userId', 'name phone role')
    .populate('entityId', 'orderNumber status');

  if (!auditLog) {
    return next(new AppError('No audit log found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    data: {
      auditLog,
    },
  });
});
