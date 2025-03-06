# Repository Pattern Folder Structure for Backend

This structure follows clean architecture principles and separates concerns effectively. Here's how you can organize it:

```
project-root/
├── src/
│   ├── controllers/          # Handle HTTP requests and responses
│   │   ├── user.controller.js
│   │   ├── auth.controller.js
│   │   └── product.controller.js
│   │
│   ├── repositories/         # Data access layer
│   │   ├── user.repository.js
│   │   ├── product.repository.js
│   │   └── base.repository.js
│   │
│   ├── services/             # Business logic layer
│   │   ├── user.service.js
│   │   ├── auth.service.js
│   │   └── product.service.js
│   │
│   ├── validators/           # Request validation
│   │   ├── user.validator.js
│   │   ├── auth.validator.js
│   │   └── product.validator.js
│   │
│   ├── routes/               # API route definitions
│   │   ├── user.routes.js
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   └── index.js          # Route aggregator
│   │
│   ├── middlewares/          # Express middlewares
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── logger.middleware.js
│   │
│   ├── models/               # Data models/schemas
│   │   ├── user.model.js
│   │   └── product.model.js
│   │
│   ├── config/               # Configuration files
│   │   ├── database.js
│   │   └── app.js
│   │
│   ├── utils/                # Utility functions
│   │   ├── helpers.js
│   │   └── error-handler.js
│   │
│   └── app.js                # Application entry point
│
├── .env                      # Environment variables
├── package.json
└── README.md
```

## Key Components Explained

### 1. Controllers
- Handle HTTP requests and responses
- Parse request data
- Call appropriate service methods
- Return formatted responses
- Should be thin and focused on HTTP concerns

```javascript
// user.controller.js
const UserService = require('../services/user.service');

class UserController {
  async getUsers(req, res, next) {
    try {
      const users = await UserService.getUsers();
      return res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }
  
  // Other controller methods
}

module.exports = new UserController();
```

### 2. Repositories
- Data access layer that abstracts database operations
- Implements CRUD operations for specific entities
- Keeps database logic isolated from business logic
- Makes testing and switching databases easier

```javascript
// user.repository.js
const { Pool } = require('pg');
const pool = require('../config/database');

class UserRepository {
  async findAll() {
    const { rows } = await pool.query('SELECT * FROM users');
    return rows;
  }
  
  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0];
  }
  
  // Other repository methods
}

module.exports = new UserRepository();
```

### 3. Services
- Contains business logic
- Orchestrates data access via repositories
- Implements domain rules and validations
- Independent of HTTP/database concerns

```javascript
// user.service.js
const UserRepository = require('../repositories/user.repository');

class UserService {
  async getUsers() {
    return UserRepository.findAll();
  }
  
  async getUserById(id) {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
  
  // Other service methods
}

module.exports = new UserService();
```

### 4. Validators
- Validate request inputs
- Define validation rules for each endpoint
- Help prevent bad data from entering your application

```javascript
// user.validator.js
const { body, param, validationResult } = require('express-validator');

const validateCreateUser = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  validateCreateUser
};
```

### 5. Routes
- Define API endpoints
- Connect routes to validators and controllers
- Group related endpoints

```javascript
// user.routes.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const { validateCreateUser } = require('../validators/user.validator');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, UserController.getUsers);
router.get('/:id', authMiddleware, UserController.getUserById);
router.post('/', validateCreateUser, UserController.createUser);
// Other routes

module.exports = router;
```

## Data Flow

In this architecture, data typically flows as follows:

1. Request arrives at a route
2. Passes through relevant middleware
3. Gets validated by validators
4. Controller receives the request
5. Controller calls appropriate service methods
6. Service implements business logic
7. Service uses repositories to access data
8. Repository performs database operations
9. Data flows back through the layers
10. Controller sends response to client

## Benefits of This Structure

1. **Separation of Concerns**: Each component has a clear responsibility
2. **Testability**: Easy to mock dependencies for unit testing
3. **Maintainability**: Code is organized and predictable
4. **Scalability**: Easy to add new features without disrupting existing code
5. **Flexibility**: Can swap out implementations (e.g., change database) with minimal impact