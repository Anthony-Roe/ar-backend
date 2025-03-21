/**
 * @swagger
 * tags:
 *   name: Machines
 *   description: API for managing machines
 */

import express from 'express';
import Machine from '../models/Machine';
import { authorize } from '../middleware/roleAuth';
import Joi from 'joi';

const router = express.Router();

// Validation schema for creating/updating a machine
const machineValidationSchema = Joi.object({
  plant_id: Joi.number().required(),
  name: Joi.string().max(100).required(),
  serial_number: Joi.string().max(50).required(),
  last_maintenance_date: Joi.date().allow(null),
  next_maintenance_date: Joi.date().allow(null),
});

/**
 * @swagger
 * /machines:
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
 *                   name:
 *                     type: string
 *                   serial_number:
 *                     type: string
 *                   last_maintenance_date:
 *                     type: string
 *                     format: date
 *                   next_maintenance_date:
 *                     type: string
 *                     format: date
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Internal server error
 */
router.get('/machines', authorize(['admin', 'manager', 'technician']), async (req: express.Request, res: express.Response): Promise<any> => {
  try {
    const machines = await Machine.findAll();
    res.json(machines);
  } catch (error) {
    console.error('Error fetching machines:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /machines:
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
 *               name:
 *                 type: string
 *               serial_number:
 *                 type: string
 *               last_maintenance_date:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *               next_maintenance_date:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Machine created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 machine_id:
 *                   type: integer
 *                 plant_id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 serial_number:
 *                   type: string
 *                 last_maintenance_date:
 *                   type: string
 *                   format: date
 *                 next_maintenance_date:
 *                   type: string
 *                   format: date
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/machines', authorize(['admin']), async (req: express.Request, res: express.Response): Promise<any> => {
  try {
    const { error, value } = machineValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const machine = await Machine.create(value);
    res.status(201).json(machine);
  } catch (error) {
    console.error('Error creating machine:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Fetch machines for a specific plant
router.get('/plants/:plantId/machines', async (req: express.Request, res: express.Response): Promise<any> => {
  try {
    const { plantId } = req.params;
    const machines = await Machine.findAll({ where: { plant_id: plantId } });

    if (!machines.length) {
      return res.status(404).json({ message: 'No machines found for this plant' });
    }

    return res.json(machines);
  } catch (error) {
    console.error('Error fetching machines:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;