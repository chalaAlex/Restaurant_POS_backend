const express = require('express');
const morgan = require('morgan');
const errorController = require('./controller/errorController');
const app = express();

// Routers
const userRouter = require('./routes/userRoutes');
const restaurantRouter = require('./routes/restaurantRoutes');
const foodItemRouter = require('./routes/foodItemRoutes');
const orderRouter = require('./routes/orderRoutes');
const auditLogRouter = require('./routes/auditLogRoutes');
const cashierRouter = require('./routes/cashierRoutes');
const reportRouter = require('./routes/reportRoutes');

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 1) MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  next();
});

app.set('query parser', 'extended'); // For complex parsing tasks.

// Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/restaurants', restaurantRouter);
app.use('/api/v1/food-items', foodItemRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/audit-logs', auditLogRouter);
app.use('/api/v1/users/cashiers', cashierRouter);
app.use('/api/v1/reports', reportRouter);

// Global error handler — must be last
app.use(errorController);

module.exports = app;
