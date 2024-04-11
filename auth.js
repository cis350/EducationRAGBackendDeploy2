const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN_VALUE
  
  if (!token) return res.status(401).json({ message: "A token is required for authentication" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Assuming the email is in the decoded token
    req.email = decoded.email;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid Token." });
  }
}

module.exports = verifyToken;