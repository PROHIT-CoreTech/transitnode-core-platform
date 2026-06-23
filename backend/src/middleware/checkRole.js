module.exports = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Normalize OPERATION to OPERATION_EXECUTIVE for backward compatibility with active JWTs
    const userRole = req.user.role === 'OPERATION' ? 'OPERATION_EXECUTIVE' : req.user.role;

    if (Array.isArray(requiredRole)) {
      if (!requiredRole.includes(userRole) && userRole !== 'Admin') {
        return res.status(403).json({ message: `Access denied. Requires one of ${requiredRole.join(', ')} roles.` });
      }
    } else {
      if (userRole !== requiredRole && userRole !== 'Admin') {
        return res.status(403).json({ message: `Access denied. Requires ${requiredRole} role.` });
      }
    }

    next();
  };
};
