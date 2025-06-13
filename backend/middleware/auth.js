const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware: Protect Routes (Authenticate)
exports.protect = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 2. If no token, block access
    if (!token) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // 4. Find user in DB
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    // 5. Attach user data to req.user (only id and role)
    req.user = {
      id: user.id,
      role: user.role
    };

    next(); // ✅ Move to next middleware/controller
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Not authorized to access this route' });
  }
};

// Middleware: Role-Based Authorization
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'User role not authorized to access this route'
      });
    }
    next(); // ✅ Move to controller if authorized
  };
};
