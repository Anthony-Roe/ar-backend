import request from 'supertest';
import app from '../app';
import sequelize from '../config/database.test';
import User from '../models/User';
import bcrypt from 'bcrypt';

// Use the test database for testing
jest.mock('../config/database', () => require('../config/database.test'));

describe('Authentication API', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clear the users table before each test
    await User.destroy({ where: {} });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'technician',
        plant_id: null
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('user_id');
      expect(response.body.username).toBe(userData.username);
      expect(response.body.email).toBe(userData.email);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 400 if user already exists', async () => {
      // Create a user first
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      await User.create({
        username: 'existinguser',
        email: 'existing@example.com',
        password: hashedPassword,
        role: 'technician'
      });

      // Try to register with the same username
      const userData = {
        username: 'existinguser',
        email: 'new@example.com',
        password: 'password123',
        role: 'technician',
        plant_id: null
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      await User.create({
        username: 'loginuser',
        email: 'login@example.com',
        password: hashedPassword,
        role: 'technician'
      });
    });

    it('should login successfully with correct credentials', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    it('should return 401 with incorrect password', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'wrongpassword'
      };

      await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);
    });
  });
});
