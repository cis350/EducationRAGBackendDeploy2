const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const app = require('../Controller/server'); // Assuming your index.js is in the parent directory
const UserModel = require('../Model/Users');
const ChatModel = require('../Model/Chat');

test('adds 1 + 2 to equal 3', () => {
  expect(1 + 2).toBe(3);
});

describe('User Registration', () => {
  // Clear the database before running tests
  beforeAll(async () => {
    await UserModel.deleteMany({});
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/signup')
      .send({ email: 'test@example.com', password: 'testpassword' });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'User created successfully.');
    // Check if the user is actually saved in the database
    const user = await UserModel.findOne({ email: 'test@example.com' });
    expect(user).toBeDefined();
  });

  it('should return an error if the password is too short', async () => {
    const res = await request(app)
      .post('/signup')
      .send({ email: 'test2@example.com', password: 'short' });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Password must be at least 8 characters long.');
  });

  it('should return an error if the email is already registered', async () => {
    const res = await request(app)
      .post('/signup')
      .send({ email: 'test@example.com', password: 'testpassword' });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'An account with this email already exists.');
  });
});

describe('User Login', () => {
  // Clear the database before running tests
  beforeAll(async () => {
    await UserModel.deleteMany({});
    // Create a test user for login
    const hashedPassword = await bcrypt.hash('testpassword', 12);
    await UserModel.create({ email: 'test@example.com', password: hashedPassword });
  });

  it('should login with correct credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'test@example.com', password: 'testpassword' });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Success');
    expect(res.body).toHaveProperty('token');
  });

  it('should return an error with incorrect password', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' });
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'The password is incorrect.');
  });

  it('should retrieve user ID for a valid user', async () => {
    await request(app)
      .post('/signup')
      .send({ email: 'useriduser@example.com', password: 'password123' });

    const loginRes = await request(app)
      .post('/login')
      .send({ email: 'useriduser@example.com', password: 'password123' });
    const { token } = loginRes.body;
    const res = await request(app)
      .get('/get-user-id')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('userId');
  });

  it('should return an error with non-existent email', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'nonexistent@example.com', password: 'testpassword' });
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'No account exists with this email.');
  });

  it('should retrieve user settings for a valid user', async () => {
    await request(app)
      .post('/signup')
      .send({ email: 'settingsuser@example.com', password: 'password123' });

    const loginRes = await request(app)
      .post('/login')
      .send({ email: 'settingsuser@example.com', password: 'password123' });
    const { token } = loginRes.body;

    const res = await request(app)
      .get('/get-user-settings')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('settings');
  });

  it('should return 404 if user does not exist', async () => {
    await request(app)
      .post('/signup')
      .send({ email: 'tempuser@example.com', password: 'tempPassword123' });

    const loginRes = await request(app)
      .post('/login')
      .send({ email: 'tempuser@example.com', password: 'tempPassword123' });

    const { token } = loginRes.body;
    await UserModel.deleteOne({ email: 'tempuser@example.com' });
    const res = await request(app)
      .get('/get-user-settings')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'User not found.');
  });

  describe('Update User Settings', () => {
    let userToken;
    let userId;

    beforeAll(async () => {
      await request(app)
        .post('/signup')
        .send({ email: 'testuser@example.com', password: 'testpassword' });

      const loginRes = await request(app)
        .post('/login')
        .send({ email: 'testuser@example.com', password: 'testpassword' });
      userToken = loginRes.body.token;
      const user = await UserModel.findOne({ email: 'testuser@example.com' });
      userId = user._id;
    });

    it('should successfully update user settings', async () => {
      const newSettings = { theme: 'dark', language: 'en' };
      const res = await request(app)
        .post('/update-settings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ userId, settings: newSettings });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Settings updated successfully.');
    });

    afterAll(async () => {
      await UserModel.deleteMany({});
    });
  });
});

describe('POST /send-message', () => {
  const path = '/send-message';
  let token;  // To hold the auth token for the session

  // Setup user and login before tests
  beforeAll(async () => {
    await UserModel.deleteMany({});
    await ChatModel.deleteMany({});

    // Create a user
    const userRes = await request(app)
      .post('/signup')
      .send({ email: 'chatuser@example.com', password: 'password123' });
    
    // Log in to get token
    const loginRes = await request(app)
      .post('/login')
      .send({ email: 'chatuser@example.com', password: 'password123' });
    token = loginRes.body.token;

    // Create a chat entry
    await ChatModel.create({
      chatId: 'validChatId',
      chatName: 'Test Chat',
      userEmail: 'chatuser@example.com',
      messages: []
    });
  });

  test('Should successfully send a message', async () => {
    const messageData = { chatId: 'validChatId', message: 'Hello', isUserMessage: true };
    const response = await request(app)
      .post(path)
      .send(messageData)
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe('Message sent successfully.');
  });

  test('Should return 400 if message content is empty', async () => {
    const response = await request(app)
      .post(path)
      .send({ chatId: 'validChatId', message: '', isUserMessage: true })
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Message content cannot be empty.');
  });

  test('Should return 404 if chat not found', async () => {
    const response = await request(app)
      .post(path)
      .send({ chatId: 'nonExistentChatId', message: 'Hello', isUserMessage: true })
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe('Chat not found or access denied.');
  });

  // Clean up after tests
  afterAll(async () => {
    await UserModel.deleteMany({});
    await ChatModel.deleteMany({});
  });
});

describe('GET /fetch-messages/:chatId', () => {
  const path = '/fetch-messages';
  let token, chatId;

  // Setup user, login, and chat before tests
  beforeAll(async () => {
    await UserModel.deleteMany({});
    await ChatModel.deleteMany({});

    // Create a user
    const userRes = await request(app)
      .post('/signup')
      .send({ email: 'chatuser@example.com', password: 'password123' });

    // Log in to get token
    const loginRes = await request(app)
      .post('/login')
      .send({ email: 'chatuser@example.com', password: 'password123' });
    token = loginRes.body.token;

    // Create a chat entry
    const chatRes = await ChatModel.create({
      chatId: 'validChatId',
      chatName: 'Test Chat',
      userEmail: 'chatuser@example.com',
      messages: [
        { message: "Hello", isUserMessage: true, createdAt: new Date() },
        { message: "Hi there!", isUserMessage: false, createdAt: new Date() }
      ]
    });
    chatId = chatRes.chatId;
  });

  test('Should fetch messages successfully', async () => {
    const response = await request(app)
      .get(`${path}/${chatId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Messages fetched successfully.');
    expect(response.body.messages).toHaveLength(2);
  });

  test('Should return 404 if chat not found', async () => {
    const response = await request(app)
      .get(`${path}/nonExistentChatId`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('message', 'Chat not found or access denied.');
  });

  // Clean up after tests
  afterAll(async () => {
    await UserModel.deleteMany({});
    await ChatModel.deleteMany({});
  });
});

describe('Chat Operations', () => {
  let token;  // To hold the auth token for the session

  // Setup user and login before tests
  beforeAll(async () => {
    await UserModel.deleteMany({});
    await ChatModel.deleteMany({});

    // Create a user and log in
    await request(app)
      .post('/signup')
      .send({ email: 'chatuser@example.com', password: 'password123' });

    const loginRes = await request(app)
      .post('/login')
      .send({ email: 'chatuser@example.com', password: 'password123' });
    token = loginRes.body.token;
  });

  // Test creating a new chat
  describe('POST /api/chats', () => {
    test('Should successfully create a new chat', async () => {
      const chatData = { chatName: 'New Chat Room' };
      const response = await request(app)
        .post('/api/chats')
        .send(chatData)
        .set('Authorization', `Bearer ${token}`);
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('chatName', 'New Chat Room');
      expect(response.body).toHaveProperty('userEmail', 'chatuser@example.com');
      expect(response.body).toHaveProperty('chatId');
    });

    test('Should handle errors during chat creation', async () => {
      // Simulate an error by breaking something, e.g., sending invalid data
      const chatData = { chatName: '' }; // Assuming empty name should fail
      const response = await request(app)
        .post('/api/chats')
        .send(chatData)
        .set('Authorization', `Bearer ${token}`);
      expect(response.statusCode).toBe(500);
    });
  });

  test('Should fetch all chats for a user', async () => {
    const response = await request(app)
        .get('/api/chats')
        .set('Authorization', `Bearer ${token}`);
    console.log(response.body);  
    expect(response.statusCode).toBe(200);
});

  // Clean up after tests
  afterAll(async () => {
    await UserModel.deleteMany({});
    await ChatModel.deleteMany({});
  });
});

describe('DELETE /api/chats/:chatId', () => {
  let token, chatId;

  // Setup user and chat before tests
  beforeAll(async () => {
    await UserModel.deleteMany({});
    await ChatModel.deleteMany({});

    // Create a user and log in
    const userRes = await request(app)
      .post('/signup')
      .send({ email: 'chatuser@example.com', password: 'password123' });

    const loginRes = await request(app)
      .post('/login')
      .send({ email: 'chatuser@example.com', password: 'password123' });
    token = loginRes.body.token;

    // Create a chat entry
    const chat = await ChatModel.create({
      chatId: new mongoose.Types.ObjectId().toString(),
      chatName: 'Test Chat',
      userEmail: 'chatuser@example.com',
      messages: []
    });
    chatId = chat.chatId;
  });

  test('Should successfully delete a chat', async () => {
    const response = await request(app)
      .delete(`/api/chats/${chatId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Chat deleted successfully.');
  });

  test('Should return 404 if chat not found', async () => {
    const response = await request(app)
      .delete(`/api/chats/nonExistentChatId`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('message', 'Chat not found or access denied.');
  });

  test('Should handle server errors', async () => {
    // Mock an error scenario, such as when database fails
    jest.spyOn(ChatModel, 'findOneAndDelete').mockRejectedValue(new Error('Database failure'));
    const response = await request(app)
      .delete(`/api/chats/${chatId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(500);
    expect(response.body).toHaveProperty('message', 'Error deleting chat.');
    // Restore original function after mock
    ChatModel.findOneAndDelete.mockRestore();
  });

  // Clean up after tests
  afterAll(async () => {
    await UserModel.deleteMany({});
    await ChatModel.deleteMany({});
  });
});
