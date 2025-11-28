const jwt = require('jsonwebtoken');
const { User, Role, Permission } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId, {
      include: [{
        model: Role,
        include: [Permission]
      }]
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid token or user not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

const authorize = (permission) => {
  return (req, res, next) => {
    const userPermissions = req.user.Roles.flatMap(role => 
      role.Permissions.map(p => p.name)
    );
    console.log("userPermissions",userPermissions,permission)

    if (!userPermissions.includes(permission)) {
      return res.status(403).json({ 
        error: 'Access denied. Insufficient permissions.' 
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize };