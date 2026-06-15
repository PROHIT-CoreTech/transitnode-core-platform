const jwt = require('jsonwebtoken');
const tenantContext = require('../utils/tenantContext');

const authGuard = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access Denied. Invalid or expired authentication token.' });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Access Denied. Invalid or expired authentication token.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Inject decoded payload straight into req.user
    req.user = decoded;
    
    // Parse Workspace ID from Headers
    const workspaceId = req.header('x-workspace-id');
    console.log('[AUTH GUARD] Received x-workspace-id header:', workspaceId);
    req.workspaceId = (!workspaceId || workspaceId === 'MAIN') ? null : workspaceId;
    console.log('[AUTH GUARD] Parsed req.workspaceId:', req.workspaceId);

    if (req.user.tenantId) {
      tenantContext.run(req.user.tenantId, () => {
        next();
      });
    } else {
      next();
    }
  } catch (error) {
    return res.status(401).json({ message: 'Access Denied. Invalid or expired authentication token.' });
  }
};

module.exports = authGuard;
