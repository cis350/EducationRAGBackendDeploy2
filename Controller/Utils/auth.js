const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware to verify JWT token in the request authorization header.
 * If the token is valid, it adds the decoded email to the request object
 * and calls the next middleware. Otherwise, it sends an appropriate HTTP response.
 *
 * @param {Object} req - The request object from Express, containing the HTTP request data.
 * @param {Object} res - The response object from Express, used to send back the desired
 *                       HTTP response.
 * @param {Function} next - Callback function to continue to the next middleware.
 * @returns {Object} - Returns a JSON response object if the token is missing or invalid.
 */
/*function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN_VALUE

  if (!token) {
    return res.status(401).json({ message: 'A token is required for authentication' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.email = decoded.email;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid Token.' });
  }
  return null;
}*/

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN_VALUE

  if (!token) {
    //return res.status(401).json({ message: 'A token is required for authentication' });
    return 3; // invalid token
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('payload', decoded);
    req.email = decoded.email;
    if (!req.email) {
      // user is undefined
      return 2;
    }
    next();
    return 0; // token verified -- success

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      console.log('error', err.message);
      return 1;
    }
    // invalid token
    console.log('error', err.message);
    return 3;
  }
}

/**
 * Generates a JWT token for a given email with a specified expiration time.
 * The token includes the user's email as part of the payload.
 *
 * @param {string} email - User's email to be encoded in the JWT.
 * @returns {string} - Returns the signed JWT.
 */
function generateToken(email) {
  return jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '5m' });
}

module.exports = {
  verifyToken,
  generateToken,
};
