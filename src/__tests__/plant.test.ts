import request from 'supertest';
import app from '../app';
import sequelize from '../config/database.test';
import Plant from '../models/Plant';

describe('Plant API', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await Plant.destroy({ where: {} });
  });

  it('should create a new plant', async () => {
    const plantData = {
      name: 'Test Plant',
      location: 'Test Location',
      contact_email: 'test@example.com',
      contact_phone: '123-456-7890',
    };

    const response = await request(app)
      .post('/api/plants')
      .send(plantData)
      .expect(201);

    expect(response.body).toHaveProperty('plant_id');
    expect(response.body.name).toBe(plantData.name);
  });

  it('should fetch all plants', async () => {
    await Plant.create({
      name: 'Plant 1',
      location: 'Location 1',
      contact_email: 'plant1@example.com',
      contact_phone: '123-456-7890',
    });

    const response = await request(app)
      .get('/api/plants')
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(1);
  });
});