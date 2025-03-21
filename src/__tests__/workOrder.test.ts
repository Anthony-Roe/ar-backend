import request from 'supertest';
import app from '../app';
import sequelize from '../config/database.test';
import WorkOrder from '../models/WorkOrder';
import Machine from '../models/Machine';
import Plant from '../models/Plant';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Use the test database for testing
jest.mock('../config/database', () => require('../config/database.test'));

describe('Work Order API', () => {
  let authToken: string;
  let plantId: number;
  let machineId: number;
  let userId: number;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    const plant = await Plant.create({
      name: 'Test Plant',
      location: 'Test Location',
      contact_email: 'test@example.com',
      contact_phone: '123-456-7890',
    });
    plantId = plant.plant_id;

    const machine = await Machine.create({
      plant_id: plantId,
      name: 'Test Machine',
      model: 'Model X',
      manufacturer: 'Test Manufacturer',
      serial_number: 'SN12345',
      installation_date: new Date(),
    });
    machineId = machine.machine_id;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const user = await User.create({
      username: 'testadmin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      plant_id: plantId,
    });
    userId = user.user_id;

    authToken = jwt.sign(
      { id: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await WorkOrder.destroy({ where: {} });
  });

  it('should create a new work order', async () => {
    const workOrderData = {
      title: 'Test Work Order',
      description: 'This is a test work order',
      status: 'pending',
      priority: 'medium',
      machine_id: machineId,
      plant_id: plantId,
      assigned_to: userId,
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    const response = await request(app)
      .post('/api/work-orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send(workOrderData)
      .expect(201);

    expect(response.body).toHaveProperty('work_order_id');
    expect(response.body.title).toBe(workOrderData.title);
  });

  it('should fetch all work orders', async () => {
    await WorkOrder.create({
      title: 'Work Order 1',
      description: 'Description 1',
      status: 'pending',
      priority: 'low',
      machine_id: machineId,
      plant_id: plantId,
      assigned_to: userId,
    });

    const response = await request(app)
      .get('/api/work-orders')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(1);
  });
});
