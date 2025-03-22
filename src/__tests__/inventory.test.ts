import request from 'supertest';
import app from '../app';
import sequelize from '../config/database.test';
import Inventory from '../models/Inventory';
import Plant from '../models/Plant';
import Vendor from '../models/Vendor';

describe('Inventory API', () => {
  let plantId: number;
  let vendorId: number;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    const plant = await Plant.create({
      name: 'Test Plant',
      location: 'Test Location',
      contact_email: 'test@example.com',
      contact_phone: '123-456-7890',
    });
    plantId = plant.plant_id;

    const vendor = await Vendor.create({
      name: 'Test Vendor',
      contact_email: 'vendor@example.com',
      contact_phone: '123-456-7890',
    });
    vendorId = vendor.vendor_id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await Inventory.destroy({ where: {} });
  });

  it('should create a new inventory item', async () => {
    const inventoryData = {
      name: 'Test Inventory',
      part_number: 'PN12345',
      quantity: 10,
      unit_cost: 100.0,
      plant_id: plantId,
      vendor_id: vendorId,
    };

    const response = await request(app)
      .post('/api/inventory')
      .send(inventoryData)
      .expect(201);

    expect(response.body).toHaveProperty('inventory_id');
    expect(response.body.name).toBe(inventoryData.name);
  });

  it('should fetch all inventory items', async () => {
    await Inventory.create({
      name: 'Inventory 1',
      part_number: 'PN12345',
      quantity: 10,
      unit_cost: 100.0,
      plant_id: plantId,
      vendor_id: vendorId,
    });

    const response = await request(app)
      .get('/api/inventory')
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(1);
  });
});
