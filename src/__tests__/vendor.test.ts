import request from 'supertest';
import app from '../app';
import sequelize from '../config/database.test';
import Vendor from '../models/Vendor';

describe('Vendor API', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await Vendor.destroy({ where: {} });
  });

  it('should create a new vendor', async () => {
    const vendorData = {
      name: 'Test Vendor',
      contact_email: 'vendor@example.com',
      contact_phone: '123-456-7890',
    };

    const response = await request(app)
      .post('/api/vendors')
      .send(vendorData)
      .expect(201);

    expect(response.body).toHaveProperty('vendor_id');
    expect(response.body.name).toBe(vendorData.name);
  });

  it('should fetch all vendors', async () => {
    await Vendor.create({
      name: 'Vendor 1',
      contact_email: 'vendor1@example.com',
      contact_phone: '123-456-7890',
    });

    const response = await request(app)
      .get('/api/vendors')
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(1);
  });
});
