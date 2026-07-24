const express = require('express');
const auditLogController = require('../controller/auditLogController');
const authController = require('../controller/authController');

const router = express.Router();

// All routes require authentication and Owner role
router.use(authController.protect);
router.use(authController.restrictTo('Owner'));

router.get('/', auditLogController.getAllAuditLogs);
router.get('/:id', auditLogController.getAuditLog);

module.exports = router;
