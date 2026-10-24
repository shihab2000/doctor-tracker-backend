const jwt = require('jsonwebtoken');
const User = require('../models/User');
async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) return res.status(401).json({ message: 'Authentication required' });
    const token = header.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('name email role');
    if (!user) return res.status(401).json({ message: 'Invalid session' });
    req.user = user;
    next();
  } catch (err) { return res.status(401).json({ message: 'Invalid or expired token' }); }
}
module.exports = { protect };
