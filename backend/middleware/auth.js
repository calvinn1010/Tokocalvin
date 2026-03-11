const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log(`[auth] Authorization header:`, authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log(`[auth] BLOCKED - No valid Bearer token`);
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    console.log(`[auth] SUCCESS - User:`, req.user);
    next();
  } catch (err) {
    console.log(`[auth] BLOCKED - Invalid token:`, err.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

module.exports = { auth };
