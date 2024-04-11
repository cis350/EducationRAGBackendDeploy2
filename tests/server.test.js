const request = require('supertest');

const app = require('../server'); // Assuming your index.js is in the parent directory

const UserModel = require('../models/Users');

const bcrypt = require('bcryptjs');

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
    
        const token = loginRes.body.token;
    
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
    
        const token = loginRes.body.token;

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

        const token = loginRes.body.token;
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
                .send({ userId: userId, settings: newSettings });
    
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'Settings updated successfully.');
        });

        

        afterAll(async () => {
            await UserModel.deleteMany({});
        });
    });

});