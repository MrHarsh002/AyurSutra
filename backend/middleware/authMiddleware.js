const jwt = require('jsonwebtoken');
const User = require('../models/userModels');

// 🔐 Protect routes
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized, no token' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user; // 👈 attach user
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// 🔑 Role-based access
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Not authorized to access this route',
      });
    }
    next();
  };
};

module.exports = { protect, authorize };


// //
// const jwt = require('jsonwebtoken');
// const User = require('../models/userModels');

// // 🔐 Protect routes (Token Check)
// const protect = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return res.status(401).json({ message: '❌ Token missing, please login again' });
//     }

//     const token = authHeader.split(' ')[1];

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const user = await User.findById(decoded.id).select('-password');

//     if (!user) {
//       return res.status(401).json({ message: '❌ User not found' });
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     console.error('Auth error:', error.message);
//     return res.status(401).json({ message: '❌ Token invalid or expired' });
//   }
// };

// // 🔑 Role-based Access (Admin Only)
// const authorize = (...roles) => {
//   return (req, res, next) => {
//     if (!req.user || !roles.includes(req.user.role)) {
//       return res.status(403).json({
//         message: '⛔ इस रूट पर पहुँचने की अनुमति नहीं है (Forbidden)',
//       });
//     }
//     next();
//   };
// };

// module.exports = { protect, authorize };
