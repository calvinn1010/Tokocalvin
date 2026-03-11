module.exports = function checkRole(...allowedRoles) {
  return function(req, res, next) {
    console.log(`[checkRole] Checking role - User:`, req.user, 'Allowed:', allowedRoles);
    
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      console.log(`[checkRole] BLOCKED - User role: ${req.user?.role}, Allowed: ${allowedRoles}`);
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak'
      });
    }
    
    console.log(`[checkRole] ALLOWED - User role: ${req.user.role}`);
    next();
  };
};
