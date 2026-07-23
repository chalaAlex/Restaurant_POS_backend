const express = require('express');
const AuditLog = require('../model/auditLogModel');
const authController = require('../controller/authController');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

const router = express.Router();

router.use(authController.protect);
router.use(authController.restrictTo('Owner'));

router.get(
  '/',
  catchAsync(async (req, res, next) => {
    const features = new APIFeatures(AuditLog.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const auditLogs = await features.query
      .populate('restaurantId', 'name')
      .populate('userId', 'name phone')
      .populate('entityId');

    res.status(200).json({
      status: 'success',
      results: auditLogs.length,
      data: {
        auditLogs,
      },
    });
  })
);

module.exports = router;
