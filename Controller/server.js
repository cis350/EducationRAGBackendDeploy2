const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const UserModel = require('../Model/Users');
const { verifyToken, generateToken, blacklistJWT } = require('./Utils/auth');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb+srv://madhavpuri100:k8c6gNkdmon2hves@cluster0.hjtbryn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

/**
 * Root route that provides a welcome message.
 * @param {express.Request} _req - Express request object (not used here).
 * @param {express.Response} resp - Express response object.
 * @returns {void} Sends a JSON response with a welcome message.
 */
app.get('/', (_req, resp) => {
  resp.json({ message: 'hello CIS3500 friends!!!' });
});

/**
   * Route for user registration.
   * Checks password length, existence of the user, hashes the password and creates a user.
   * @param {express.Request} _req - Express request object containing email and password.
   * @param {express.Response} resp - Express response object.
   * @returns {void} Sends a JSON response indicating success or error.
   */
app.post('/signup', async (_req, resp) => {
  const { email, password } = _req.body;
  
  if (!email || email === '') {
    resp.status(401).json({ error: 'empty or missing email' });
    return;
  }
  if (!password || password === '') {
    resp.status(401).json({ error: 'empty or missing password' });
    return;
  }
  if (password.length < 8) {
    return resp.status(400).json({ message: 'Password must be at least 8 characters long.' });
  }
  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return resp.status(400).json({ message: 'An account with this email already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    await UserModel.create({ email, password: hashedPassword });
    return resp.status(201).json({ message: 'User created successfully.' });
  } catch (err) {
    return resp.status(500).json({ message: 'Error creating user.' });
  }
});

/**
   * Route for user login.
   * Verifies user credentials and returns a JWT token.
   * @param {express.Request} _req - Express request object containing email and password.
   * @param {express.Response} resp - Express response object.
   * @returns {void} Sends a JSON response with success message and token, or an error message.
   */
app.post('/login', async (_req, resp) => {
  const { email, password } = _req.body;
  
  if (!email || email === '') {
    resp.status(401).json({ error: 'empty or missing email' });
    return;
  }
  if (!password || password === '') {
    resp.status(401).json({ error: 'empty or missing password' });
    return;
  }
  
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return resp.status(404).json({ message: 'No account exists with this email.' });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return resp.status(401).json({ message: 'The password is incorrect.' });
    }
    //const token = generateToken(user.email);
    const token = generateToken(email);
    resp.status(201).json({ apptoken: token });
    return resp.json({ message: 'Success', token });
  } catch (err) {
    console.log('error login', err.message);
    return resp.status(401).json({ message: 'Server error.' });
  }
});

/**
 * Logout endpoint
 * use JWT for authentication
 * Ends the session
 */
app.post('/logout', async (_req, resp) => {
  // verify the session
  console.log('logout');
  try {
    const authResp = await verifyToken(_req);
    if (authResp === 1) { // expired session
      resp.status(403).json({ message: '1 - Session expired already' });
      return;
    }
    if (authResp === 2) {
      resp.status(401).json({ message: '2 - Invalid user or session' });
      return;
    }
    if (authResp === 3) { // invalid user or jwt
      resp.status(401).json({ message: '3 - Invalid user or session' });
      return;
    }

    if (authResp === 4) { // invalid user or jwt
      resp.status(401).json({ message: '4 - Invalid user or session' });
      return;
    }
    // session valid blacklist the JWT
    blacklistJWT(_req.headers.authorization);
    resp.status(200).json({ message: 'Session terminated' });
  } catch (err) {
    resp.status(400).json({ message: 'There was an error' });
  }
});

/**
   * Route to get the user ID by the token provided.
   * @param {express.Request} _req - Express request object, with user email
   *                                 added by verifyToken middleware.
   * @param {express.Response} resp - Express response object.
   * @returns {void} Sends a JSON response with the user's ID or an error message.
   */
app.get('/get-user-id', verifyToken, async (_req, resp) => {
  const { email } = _req;
  try {
    const user = await UserModel.findOne({ email }).select('id'); // Removed dangling underscore
    if (!user) {
      return resp.status(404).json({ message: 'User not found.' });
    }
    return resp.json({ userId: user.id });
  } catch (err) {
    return resp.status(500).json({ message: 'Error fetching user ID.' });
  }
});

/**
   * Route to update user settings.
   * @param {express.Request} _req - Express request object, containing
   *                                 userId and settings, user email added by verifyToken.
   * @param {express.Response} resp - Express response object.
   * @returns {void} Sends a JSON response indicating the status of the update operation.
   */
app.post('/update-settings', verifyToken, async (_req, resp) => {
  const { userId, settings } = _req.body;
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { settings } },
      { new: true },
    );
    if (!updatedUser) {
      return resp.status(404).json({ message: 'User not found.' });
    }
    return resp.json({ message: 'Settings updated successfully.', updatedSettings: updatedUser.settings });
  } catch (err) {
    return resp.status(500).json({ message: 'Error updating settings.' });
  }
});

/**
   * Route to fetch user settings based on the token provided.
   * @param {express.Request} _req - Express request object, with user
   *                                 email added by verifyToken middleware.
   * @param {express.Response} resp - Express response object.
   * @returns {void} Sends a JSON response containing the user's settings or an error message.
   */
app.get('/get-user-settings', verifyToken, async (_req, resp) => {
  const { email } = _req;
  try {
    const user = await UserModel.findOne({ email }, 'settings');
    if (!user) {
      return resp.status(404).json({ message: 'User not found.' });
    }
    return resp.json({ settings: user.settings });
  } catch (err) {
    return resp.status(500).json({ message: 'Error fetching user settings.' });
  }
});

/**
   * A protected route that requires a valid token to access.
   * @param {express.Request} _req - Express request object, handled by verifyToken middleware.
   * @param {express.Response} resp - Express response object.
   * @returns {void} Sends a JSON response with protected data.
   */
app.get('/protected-route', verifyToken, (_req, resp) => {
  resp.json({ message: 'This is protected data.' });
});

module.exports = app;
