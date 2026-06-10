module.exports = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (Array.isArray(requiredRole)) {
      if (!requiredRole.includes(req.user.role) && req.user.role !== 'Admin') {
        return res.status(403).json({ message: `Access denied. Requires one of ${requiredRole.join(', ')} roles.` });
      }
    } else {
      if (req.user.role !== requiredRole && req.user.role !== 'Admin') {
        return res.status(403).json({ message: `Access denied. Requires ${requiredRole} role.` });
      }
    }

    next();
  };
};
