const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const UserModel = require('../Model/Users');
const { verifyToken, generateToken } = require('./Utils/auth');
const ChatModel = require('../Model/Chat');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const OpenAI = require('openai');

// Create a new OpenAI client instance using your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateChatResponse(messages, userId) {
  try {
    // Retrieve user settings from the database based on userId
    const user = await UserModel.findById(userId);
    if (!user) {
      console.error('User not found');
      return null; // Handle user not found error
    }

    // Extract expertise level from user settings
    const expertiseLevel = user.settings.expertiseLevel;

    // System prompt based on the expertise level
    let systemPrompt = `Explain as if talking to a ${expertiseLevel} level user:`;
    const prompts = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Insert the system instruction as the first message
    prompts.unshift({
      role: "system",
      content: systemPrompt
    });

    // Call the OpenAI API with the modified prompt list
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: prompts
    });

    // Prepend the response with the expertise level for clarity
    return `[${expertiseLevel} level answer] ${chatCompletion.choices[0].message.content}`;
  } catch (error) {
    console.error('Failed to create chat completion:', error);
    return null;  // Handle error appropriately
  }
}

// aka React app
app.use(express.static(path.join(__dirname, './client/dist')));

mongoose.connect('mongodb+srv://madhavpuri100:k8c6gNkdmon2hves@cluster0.hjtbryn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

/**
 * Root route that provides a welcome message.
 * @param {express.Request} _req - Express request object (not used here).
 * @param {express.Response} resp - Express response object.
 * @returns {void} Sends a JSON response with a welcome message.
 */
app.get('/', (_req, resp) => {
  // resp.json({ message: 'hello CIS3500 friends!!!' });
  resp.sendFile(path.join(__dirname, './client/dist/index.html'));
});

/**
   * Route for user registration.`
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

/**
 * POST route to send a message to a chat and receive a bot response.
 * Verifies user token, checks for non-empty message, updates the chat with user's message,
 * generates a bot response, appends it to chat, and returns the updated chat.
 * @param {express.Request} req - Express request object, containing chatId, 
 * message content, and message origin (user/bot).
 * @param {express.Response} res - Express response object.
 * @returns {void} Sends a JSON response with the updated chat messages or an error message.
 */
app.post('/send-message', verifyToken, async (req, res) => {
  const { chatId, message, isUserMessage } = req.body;
  const userEmail = req.email; // or req.userId based on your token decoding

  try {
    const user = await UserModel.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    let chat = await ChatModel.findOne({ chatId, 'userEmail': userEmail });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found or access denied.' });
    }

    const messagesForAI = chat.messages.map(msg => ({
      role: msg.isUserMessage ? 'user' : 'assistant',
      content: msg.message
    }));
    messagesForAI.push({ role: 'user', content: message });

    const aiResponse = await generateChatResponse(messagesForAI, user._id);
    if (!aiResponse) {
      return res.status(500).json({ message: 'AI failed to generate a response.' });
    }

    const botMessage = {
      message: aiResponse,
      isUserMessage: false,
      createdAt: new Date(),
    };

    chat = await ChatModel.findOneAndUpdate(
      { chatId, userEmail },
      { $push: { messages: [{ message, isUserMessage, createdAt: new Date() }, botMessage] },
        $set: { lastActivity: new Date() } },
      { new: true }
    );

    res.status(201).json({ message: 'Message sent successfully.', chat: chat.messages });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ message: 'Error sending message.' });
  }
});


/**
 * GET route to fetch all messages for a specific chat.
 * Validates user access to the chat and returns all messages from the specified chat.
 * @param {express.Request} req - Express request object, containing chatId as a URL parameter.
 * @param {express.Response} res - Express response object.
 * @returns {void} Sends a JSON response containing all messages from the chat or an error message.
 */
app.get('/fetch-messages/:chatId', verifyToken, async (req, res) => {
  const { chatId } = req.params;
  const userEmail = req.email;

  try {
    const chat = await ChatModel.findOne({ chatId, userEmail }).populate('userEmail');
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found or access denied.' });
    }

    res.json({ message: 'Messages fetched successfully.', messages: chat.messages });
  } catch (err) {
    // console.error(err);
    res.status(500).json({ message: 'Error fetching messages.' });
  }
});

/**
 * POST route to create a new chat.
 * Verifies user token, creates a new chat associated with the user, and returns the new chat data.
 * @param {express.Request} req - Express request object, containing the name of the chat.
 * @param {express.Response} res - Express response object.
 * @returns {void} Sends a JSON response with details of the newly created chat or an error message.
 */
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
    // console.error(err);
    res.status(500).json({ message: 'Error creating new chat.', error: err.message });
  }
});

/**
 * GET route to fetch all chats associated with a user.
 * Verifies user token and returns all chats linked to the authenticated user.
 * @param {express.Request} req - Express request object handled by verifyToken middleware.
 * @param {express.Response} res - Express response object.
 * @returns {void} Sends a JSON response containing all user's chats or an error message.
 */
app.get('/api/chats', verifyToken, async (req, res) => {
  const userEmail = req.email;

  try {
    const chats = await ChatModel.find({ userEmail }).select('chatId chatName createdAt');
    res.json({ chats });
  } catch (err) {
    // console.error(err);
    res.status(500).json({ message: 'Error fetching chats.' });
  }
});

/**
 * DELETE route to remove a specific chat.
 * Verifies user token and deletes the specified chat if the user is authorized to access it.
 * @param {express.Request} req - Express request object, containing chatId as a URL parameter.
 * @param {express.Response} res - Express response object.
 * @returns {void} Sends a JSON response indicating the deletion status or an error message.
 */
app.delete('/api/chats/:chatId', verifyToken, async (req, res) => {
  const { chatId } = req.params;
  const userEmail = req.email;

  try {
    const chat = await ChatModel.findOneAndDelete({ chatId, userEmail });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found or access denied.' });
    }
    res.json({ message: 'Chat deleted successfully.' });
  } catch (err) {
    // console.error(err);
    res.status(500).json({ message: 'Error deleting chat.' });
  }
});

app.get('*', (req, resp) => {
  resp.sendFile(path.join(__dirname, './client/dist/index.html'));
});

module.exports = app;
