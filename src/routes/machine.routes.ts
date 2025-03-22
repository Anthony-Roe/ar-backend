import express from 'express';
import Machine from '../models/Machine';
import Plant from '../models/Plant';
import { authorize } from '../middleware/roleAuth';
import Joi from 'joi';
import { ValidationError } from 'sequelize';

const router = express.Router();

// Validation schema for creating/updating a machine
const machineValidationSchema = Joi.object({
  plant_id: Joi.number().integer().allow(null), // Nullable per schema
  name: Joi.string().max(100).required(),
  model: Joi.string().max(100).required(),
  manufacturer: Joi.string().max(100).required(),
  serial_number: Joi.string().max(50).required(),
  installation_date: Joi.date().allow(null),
  last_maintenance_date: Joi.date().allow(null),
  next_maintenance_date: Joi.date().allow(null),
  status: Joi.string().valid('active', 'inactive', 'maintenance').default('active'),
});

/**
 * @swagger
 * tags:
 *   name: Machines
 *   description: API for managing machines
 */

/**
 * @swagger
 * /api/machines:
 *   get:
 *     summary: Get all machines
 *     tags: [Machines]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of machines
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   machine_id:
 *                     type: integer
 *                   plant_id:
 *                     type: integer
 *                     nullable: true
 *                   name:
 *                     type: string
 *                   model:
 *                     type: string
 *                   manufacturer:
 *                     type: string
 *                   serial_number:
 *                     type: string
 *                   installation_date:
 *                     type: string
 *                     format: date
 *                     nullable: true
 *                   last_maintenance_date:
 *                     type: string
 *                     format: date
 *                     nullable: true
 *                   next_maintenance_date:
 *                     type: string
 *                     format: date
 *                     nullable: true
 *                   status:
 *                     type: string
 *                     enum: [active, inactive, maintenance]
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *                   deleted_at:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 *       500:
 *         description: Internal server error
 */
router.get('/machines', authorize(['admin', 'manager', 'technician']), async (req: express.Request, res: express.Response): Promise<any> => {
  try {
    const machines = await Machine.findAll({
      include: [{ model: Plant, attributes: ['plant_id', 'name'] }],
    });
    return res.json(machines);
  } catch (error) {
    console.error('Error fetching machines:', error);
    if (error instanceof ValidationError) {
      return res.status(400).json({ message: 'Validation error', details: error.errors.map(e => e.message) });
    } else {
      return res.status(500).json({ message: 'Internal server error', details: (error as Error).message });
    }
  }
});

/**
 * @swagger
 * /api/machines:
 *   post:
 *     summary: Create a new machine
 *     tags: [Machines]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plant_id:
 *                 type: integer
 *                 nullable: true
 *               name:
 *                 type: string
 *               model:
 *                 type: string
 *               manufacturer:
 *                 type: string
 *               serial_number:
 *                 type: string
 *               installation_date:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *               last_maintenance_date:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *               next_maintenance_date:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *               status:
 *                 type: string
 *                 enum: [active, inactive, maintenance]
 *     responses:
 *       201:
 *         description: Machine created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/machines', authorize(['admin']), async (req: express.Request, res: express.Response): Promise<any> => {
  try {
    const { error, value } = machineValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: 'Validation error', details: error.details.map(d => d.message) });
    }

    // Check if plant_id exists (if provided)
    if (value.plant_id) {
      const plant = await Plant.findByPk(value.plant_id);
      if (!plant) {
        return res.status(404).json({ message: 'Plant not found' });
      }
    }

    // Check for duplicate serial_number
    const existingMachine = await Machine.findOne({ where: { serial_number: value.serial_number } });
    if (existingMachine) {
      return res.status(400).json({ message: 'Serial number already exists' });
    }

    const machine = await Machine.create(value);
    return res.status(201).json(machine);
  } catch (error) {
    console.error('Error creating machine:', error);
    if (error instanceof ValidationError) {
      return res.status(400).json({ message: 'Validation error', details: error.errors.map(e => e.message) });
    } else {
      return res.status(500).json({ message: 'Internal server error', details: (error as Error).message });
    }
  }
});

/**
 * @swagger
 * /api/machines/{id}:
 *   put:
 *     summary: Update a machine
 *     tags: [Machines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plant_id:
 *                 type: integer
 *                 nullable: true
 *               name:
 *                 type: string
 *               model:
 *                 type: string
 *               manufacturer:
 *                 type: string
 *               serial_number:
 *                 type: string
 *               installation_date:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *               last_maintenance_date:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *               next_maintenance_date:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *               status:
 *                 type: string
 *                 enum: [active, inactive, maintenance]
 *     responses:
 *       200:
 *         description: Machine updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Machine not found
 *       500:
 *         description: Internal server error
 */
router.put('/machines/:id', authorize(['admin']), async (req: express.Request, res: express.Response): Promise<any> => {
  try {
    const machineId = parseInt(req.params.id);
    if (isNaN(machineId)) {
      return res.status(400).json({ message: 'Invalid machine ID' });
    }

    const { error, value } = machineValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: 'Validation error', details: error.details.map(d => d.message) });
    }

    const machine = await Machine.findByPk(machineId);
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    // Check if plant_id exists (if provided)
    if (value.plant_id) {
      const plant = await Plant.findByPk(value.plant_id);
      if (!plant) {
        return res.status(404).json({ message: 'Plant not found' });
      }
    }

    // Check for duplicate serial_number (excluding current machine)
    const existingMachine = await Machine.findOne({
      where: { serial_number: value.serial_number },
      attributes: ['machine_id'],
    });
    if (existingMachine && existingMachine.machine_id !== machineId) {
      return res.status(400).json({ message: 'Serial number already exists' });
    }

    await machine.update(value);
    return res.json(machine);
  } catch (error) {
    console.error('Error updating machine:', error);
    if (error instanceof ValidationError) {
      return res.status(400).json({ message: 'Validation error', details: error.errors.map(e => e.message) });
    } else {
      return res.status(500).json({ message: 'Internal server error', details: (error as Error).message });
    }
  }
});

/**
 * @swagger
 * /api/machines/{id}:
 *   delete:
 *     summary: Delete a machine (soft delete)
 *     tags: [Machines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Machine deleted successfully
 *       404:
 *         description: Machine not found
 *       500:
 *         description: Internal server error
 */
router.delete('/machines/:id', authorize(['admin']), async (req: express.Request, res: express.Response): Promise<any> => {
  try {
    const machineId = parseInt(req.params.id);
    if (isNaN(machineId)) {
      return res.status(400).json({ message: 'Invalid machine ID' });
    }

    const machine = await Machine.findByPk(machineId);
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    await machine.destroy(); // Soft delete
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting machine:', error);
    if (error instanceof ValidationError) {
      return res.status(400).json({ message: 'Validation error', details: error.errors.map(e => e.message) });
    } else {
      return res.status(500).json({ message: 'Internal server error', details: (error as Error).message });
    }
  }
});

/**
 * @swagger
 * /api/plants/{plantId}/machines:
 *   get:
 *     summary: Get machines for a specific plant
 *     tags: [Machines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: plantId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of machines for the plant
 *       404:
 *         description: No machines found for this plant
 *       500:
 *         description: Internal server error
 */
router.get('/plants/:plantId/machines', authorize(['admin', 'manager', 'technician']), async (req: express.Request, res: express.Response): Promise<any> => {
  try {
    const plantId = parseInt(req.params.plantId);
    if (isNaN(plantId)) {
      return res.status(400).json({ message: 'Invalid plant ID' });
    }

    const machines = await Machine.findAll({
      where: { plant_id: plantId },
      include: [{ model: Plant, attributes: ['plant_id', 'name'] }],
    });

    if (!machines.length) {
      return res.status(404).json({ message: 'No machines found for this plant' });
    }

    return res.json(machines);
  } catch (error) {
    console.error('Error fetching machines for plant:', error);
    if (error instanceof ValidationError) {
      return res.status(400).json({ message: 'Validation error', details: error.errors.map(e => e.message) });
    } else {
      return res.status(500).json({ message: 'Internal server error', details: (error as Error).message });
    }
  }
});

export default router;