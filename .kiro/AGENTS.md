# AGENTS.md

# Restaurant POS Backend

## Project Overview

This project is the backend API for a Restaurant Point of Sale (POS) system.

The backend is built with:

- Node.js
- Express.js
- MongoDB
- Mongoose

The codebase follows the same architecture and coding style used in Jonas Schmedtmann's **Natours** project (after Section 14).

The project is written in **JavaScript (.js)**.

**Do not generate TypeScript code.**

The AI agent should always follow the existing project structure and conventions instead of introducing a new architecture.

---

# Existing Project Structure

The project follows this structure.

```
project/

controllers/
middlewares/
models/
routes/
utils/

app.js
server.js
```

The AI should continue using this structure.

Do NOT introduce folders such as

- services
- usecases
- domain
- infrastructure
- application

unless explicitly requested.

---

# Architecture Style

Follow the existing Jonas Node.js Bootcamp architecture.

Business logic belongs inside controllers.

Database logic belongs in Mongoose models.

Routing belongs inside routes.

Global error handling should continue using the existing AppError and catchAsync utilities.

Use existing middleware patterns whenever possible.

Maintain consistency with the existing codebase.

---

# Technologies

- Node.js
- Express
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt
- express-validator (if validation exists)
- dotenv

Prefer existing project dependencies before introducing new libraries.

---

# Coding Standards

Always write JavaScript.

Never generate TypeScript.

Use CommonJS syntax.

Example

```js
const mongoose = require('mongoose');
```

Export modules using

```js
module.exports = ...
```

Follow existing naming conventions.

Example

```
foodController.js

foodRoutes.js

foodModel.js
```

instead of

```
FoodController.js

FoodService.js
```

---

# REST API Guidelines

Use RESTful endpoints.

Example

```
GET

POST

PATCH

DELETE
```

Examples

```
GET /api/v1/foods

POST /api/v1/foods

PATCH /api/v1/foods/:id

DELETE /api/v1/foods/:id
```

Use appropriate HTTP status codes.

---

# Authentication

Authentication uses JWT.

Passwords are stored using bcrypt hashes.

Users log in using

- phone
- password

Never store plaintext passwords.

Protect private routes using authentication middleware.

---

# Authorization

There are only two roles.

```
Owner

Cashier
```

Owner permissions

- Manage restaurant
- Manage food items
- Manage cashiers
- View reports
- View audit logs
- Void orders
- Return orders

Cashier permissions

- Login
- Logout
- View menu
- Create orders
- View own orders

Always protect routes using role-based middleware.

---

# Database Models

## Restaurant

```js
Restaurant {

    name

    address

    phone

    isActive

    createdAt

    updatedAt

}
```

---

## User

```js
User {

    restaurantId

    name

    phone

    passwordHash

    role

    isActive

    createdAt

    updatedAt

}
```

Role values

```
Owner

Cashier
```

---

## FoodItem

```js
FoodItem {

    restaurantId

    name

    imageUrl

    category

    price

    description

    isAvailable

    createdAt

    updatedAt

}
```

Category values

```
Food

Tea

Coffee

Milk

Other
```

Unavailable food cannot be ordered.

---

## Order

```js
Order {

    restaurantId

    orderNumber

    cashierId

    status

    items

    totalAmount

    paymentMethod

    createdAt

    updatedAt

}
```

Status values

```
Placed

Voided

Returned
```

Payment methods

```
Cash

MobileBanking

Telebirr
```

---

## OrderItem

OrderItem is an embedded document inside Order.

```js
OrderItem {

    foodItemId

    name

    category

    unitPrice

    quantity

    subtotal

}
```

OrderItem stores historical snapshots.

Never populate OrderItem from FoodItem when retrieving old orders.

Historical values must remain unchanged.

---

## AuditLog

```js
AuditLog {

    restaurantId

    userId

    action

    entityId

    oldValue

    newValue

    timestamp

}
```

Action values

```
Void

Return
```

Audit logs are created automatically.

---

# Relationships

Restaurant

Users

Orders

OrderItems

Restaurant

FoodItems

Restaurant

AuditLogs

---

# Business Rules

## Restaurant

Restaurant may be active or inactive.

Inactive restaurants should not allow new logins.

---

## Users

Owner creates Cashiers.

Cashiers cannot create users.

Inactive users cannot log in.

Phone numbers should be unique within a restaurant.

Passwords must always be hashed.

---

## Food Items

Owner manages food items.

Cashiers have read-only access.

Unavailable food items cannot be added to orders.

Price updates affect only future orders.

Historical orders remain unchanged.

---

## Orders

Only Cashiers create orders.

Owner can view all orders.

Cashier should normally view only their own orders unless specified otherwise.

Order must contain at least one OrderItem.

Order total must be calculated on the server.

Never trust totals coming from frontend.

OrderItem subtotal

```
unitPrice × quantity
```

Order total

```
sum(all OrderItem subtotals)
```

Generate order numbers automatically.

Example

```
ORD-20260723-001
```

OrderItem stores

- name
- category
- unitPrice

These values are snapshots and must never change.

---

# Audit Rules

Create an AuditLog whenever

Order status changes to

```
Voided
```

or

```
Returned
```

AuditLog should record

- restaurantId
- userId
- action
- entityId
- oldValue
- newValue
- timestamp

---

# API Development Rules

Whenever implementing a new resource, generate

Model

Controller

Routes

Validation (if project uses it)

Authentication

Authorization

Error handling

Keep the implementation consistent with the existing project.

---

# Error Handling

Continue using the existing project's

- AppError
- catchAsync
- global error handler

Do not replace them with try/catch in every controller.

---

# Mongoose Guidelines

Use Mongoose Schemas.

Use schema validation.

Use enums for fixed values.

Use timestamps where appropriate.

Reference related collections using ObjectId.

Example

```js
restaurantId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Restaurant',
    required: true
}
```

OrderItem should remain embedded inside Order instead of becoming a separate collection.

---

# AI Agent Rules

When modifying the project:

- Follow the existing code style before introducing new patterns.
- Reuse utilities already available in the project.
- Do not duplicate logic.
- Do not introduce unnecessary abstractions.
- Prefer simple, readable JavaScript.
- Keep controllers concise but consistent with the Jonas architecture.
- Keep naming consistent across models, controllers, and routes.
- Calculate business values (such as totals) on the backend.
- Preserve historical order information by using OrderItem snapshots.
- When in doubt, prefer consistency with the existing codebase over introducing a new design pattern.
