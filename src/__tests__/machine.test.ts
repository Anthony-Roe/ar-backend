import request from 'supertest';
import app from '../app';
import sequelize from '../config/database.test';
import Machine from '../models/Machine';
import Plant from '../models/Plant';

describe('Machine API', () => {
  let plantId: number;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    const plant = await Plant.create({
      name: 'Test Plant',
      location: 'Test Location',
      contact_email: 'test@example.com',
      contact_phone: '123-456-7890',
    });
    plantId = plant.plant_id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await Machine.destroy({ where: {} });
  });

  it('should create a new machine', async () => {
    const machineData = {
      plant_id: plantId,
      name: 'Test Machine',
      model: 'Model X',
      manufacturer: 'Test Manufacturer',
      serial_number: 'SN12345',
      installation_date: new Date(),
    };

    const response = await request(app)
      .post('/api/machines')
      .send(machineData)
      .expect(201);

    expect(response.body).toHaveProperty('machine_id');
    expect(response.body.name).toBe(machineData.name);
  });

  it('should fetch all machines', async () => {
    await Machine.create({
      plant_id: plantId,
      name: 'Machine 1',
      model: 'Model X',
      manufacturer: 'Manufacturer 1',
      serial_number: 'SN12345',
      installation_date: new Date(),
    });

    const response = await request(app)
      .get('/api/machines')
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(1);
  });
});
