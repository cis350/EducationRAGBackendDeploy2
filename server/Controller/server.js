const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const UserModel = require('../Model/Users');
const { verifyToken, generateToken } = require('./Utils/auth');
const ChatModel = require('../Model/Chat');

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
    resp.status(400).json({ message: 'Password must be at least 8 characters long.' });
    return;
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
  
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return resp.status(404).json({ message: 'No account exists with this email.' });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return resp.status(401).json({ message: 'The password is incorrect.' });
    }
    const token = generateToken(user.email);
    return resp.json({ message: 'Success', token });
  } catch (err) {
    return resp.status(500).json({ message: 'Server error.' });
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

// Message POST

app.post('/send-message', verifyToken, async (req, res) => {
  const { chatId, message, isUserMessage } = req.body;
  const userEmail = req.email;

  if (!message) {
    return res.status(400).json({ message: 'Message content cannot be empty.' });
  }

  try {
    // Update chat with the user's message
    const chat = await ChatModel.findOneAndUpdate(
      { chatId: chatId, userEmail: userEmail },
      {
        $push: { messages: { message, isUserMessage, createdAt: new Date() } },
        $set: { lastActivity: new Date() },
      },
      { new: true },
    );

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found or access denied.' });
    }

    // Generate a response from the bot
    const botMessage = {
      message: "Hello, I'm the CIS 350 TA. How can I assist you today?",
      isUserMessage: false,
      createdAt: new Date(),
    };

    // Append bot's message to the chat
    await ChatModel.findOneAndUpdate(
      { chatId: chatId, userEmail: userEmail },
      {
        $push: { messages: botMessage },
        $set: { lastActivity: new Date() },
      },
      { new: true },
    );

    // Send back the updated chat including the bot's response
    res.status(201).json({ message: 'Message sent successfully.', chat: chat.messages.concat(botMessage) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error sending message.' });
  }
});

// Fetch messages for a chat
app.get('/fetch-messages/:chatId', verifyToken, async (req, res) => {
  const { chatId } = req.params;
  const userEmail = req.email;

  try {
    const chat = await ChatModel.findOne({ chatId: chatId, userEmail: userEmail }).populate('userEmail');
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found or access denied.' });
    }

    res.json({ message: 'Messages fetched successfully.', messages: chat.messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching messages.' });
  }
});

// Create a new chat
app.post('/api/chats', verifyToken, async (req, res) => {
  const { chatName } = req.body;
  const userEmail = req.email;

  try {
    const newChat = new ChatModel({
      chatId: new mongoose.Types.ObjectId().toString(),
      chatName,
      userEmail,
      messages: [],
    });
    await newChat.save();
    res.status(201).json(newChat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating new chat.', error: err.message });
  }
});

// Fetch all chats
app.get('/api/chats', verifyToken, async (req, res) => {
  const userEmail = req.email;

  try {
    const chats = await ChatModel.find({ userEmail }).select('chatId chatName createdAt');
    res.json({ chats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching chats.' });
  }
});

// Endpoint to delete a chat
app.delete('/api/chats/:chatId', verifyToken, async (req, res) => {
  const { chatId } = req.params;
  const userEmail = req.email;

  try {
    const chat = await ChatModel.findOneAndDelete({ chatId: chatId, userEmail: userEmail });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found or access denied.' });
    }
    res.json({ message: 'Chat deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting chat.' });
  }
});

module.exports = app;
