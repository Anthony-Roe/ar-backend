/**
 * @swagger
 * tags:
 *   name: WorkOrders
 *   description: API for managing work orders
 */

import { Router, Request, Response } from 'express';
import { authorize } from '../middleware/roleAuth';
import WorkOrder from '../models/WorkOrder';
import Machine from '../models/Machine';
import Plant from '../models/Plant';
import User from '../models/User';
import Joi from 'joi';
import { faker } from '@faker-js/faker';

const router = Router();

// Validation schema for creating/updating a work order
const workOrderValidationSchema = Joi.object({
  title: Joi.string().max(100).required(),
  description: Joi.string().required(),
  status: Joi.string().valid('pending', 'in_progress', 'completed', 'cancelled').required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
  machine_id: Joi.number().required(),
  plant_id: Joi.number().required(),
  assigned_to: Joi.number().allow(null),
  due_date: Joi.date().allow(null),
  completed_date: Joi.date().allow(null),
});

/**
 * @swagger
 * /work-orders:
 *   get:
 *     summary: Get all work orders
 *     tags: [WorkOrders]
 *     description: Fetches a list of all work orders. Accessible to users with 'admin', 'manager', or 'technician' roles.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of work orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   work_order_id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   status:
 *                     type: string
 *                     enum: [pending, in_progress, completed, cancelled]
 *                   priority:
 *                     type: string
 *                     enum: [low, medium, high, critical]
 *                   machine_id:
 *                     type: integer
 *                   plant_id:
 *                     type: integer
 *                   assigned_to:
 *                     type: integer
 *                     nullable: true
 *                   due_date:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 *                   completed_date:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient role permissions
 *       500:
 *         description: Internal server error
 */
router.get('/work-orders', authorize(['admin', 'manager', 'technician']), async (req: Request, res: Response): Promise<any> => {
  try {
    const workOrders = await WorkOrder.findAll();
    res.json(workOrders);
  } catch (error) {
    console.error('Error fetching work orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /work-orders:
 *   post:
 *     summary: Create a new work order
 *     tags: [WorkOrders]
 *     description: Creates a new work order. Accessible to users with 'admin' or 'manager' roles.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 100
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed, cancelled]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               machine_id:
 *                 type: integer
 *               plant_id:
 *                 type: integer
 *               assigned_to:
 *                 type: integer
 *                 nullable: true
 *               due_date:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *             required:
 *               - title
 *               - description
 *               - status
 *               - priority
 *               - machine_id
 *               - plant_id
 *     responses:
 *       201:
 *         description: Work order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 work_order_id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 status:
 *                   type: string
 *                 priority:
 *                   type: string
 *                 machine_id:
 *                   type: integer
 *                 plant_id:
 *                   type: integer
 *                 assigned_to:
 *                   type: integer
 *                   nullable: true
 *                 due_date:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                 completed_date:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient role permissions
 *       500:
 *         description: Internal server error
 */
// Endpoint to create a new work order
router.post(
  '/work-orders',
  authorize(['admin', 'manager']),
  async (req: Request, res: Response): Promise<any> => {
    try {
      // Validate the request body
      const { error, value } = workOrderValidationSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      // Validate foreign keys
      const machine = await Machine.findByPk(value.machine_id);
      const plant = await Plant.findByPk(value.plant_id);
      const user = value.assigned_to ? await User.findByPk(value.assigned_to) : null;

      if (!machine) {
        return res.status(400).json({ message: `Machine with ID ${value.machine_id} does not exist.` });
      }
      if (!plant) {
        return res.status(400).json({ message: `Plant with ID ${value.plant_id} does not exist.` });
      }
      if (value.assigned_to && !user) {
        return res.status(400).json({ message: `User with ID ${value.assigned_to} does not exist.` });
      }

      // Create the work order
      const workOrder = await WorkOrder.create(value);
      return res.status(201).json(workOrder);
    } catch (error) {
      console.error('Error creating work order:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// Endpoint to generate random work orders
router.post('/work-orders/generate', authorize(['admin']), async (req: Request, res: Response): Promise<any> => {
  try {
    const workOrders = [];

    for (let i = 0; i < 20; i++) {
      const machineId = faker.number.int({ min: 1, max: 10 });
      const plantId = faker.number.int({ min: 1, max: 5 });
      const assignedTo = faker.datatype.boolean() ? faker.number.int({ min: 1, max: 10 }) : null;

      // Validate foreign keys
      const machine = await Machine.findByPk(machineId);
      const plant = await Plant.findByPk(plantId);
      const user = assignedTo ? await User.findByPk(assignedTo) : null;

      if (!machine || !plant || (assignedTo && !user)) {
        console.warn(`Skipping invalid work order: machine_id=${machineId}, plant_id=${plantId}, assigned_to=${assignedTo}`);
        continue;
      }

      const workOrder = await WorkOrder.create({
        title: faker.commerce.productName(),
        description: faker.lorem.sentence(),
        status: faker.helpers.arrayElement(['pending', 'in_progress', 'completed', 'cancelled']),
        priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'critical']),
        machine_id: machineId,
        plant_id: plantId,
        assigned_to: assignedTo,
        due_date: faker.date.future(),
        completed_date: faker.datatype.boolean() ? faker.date.past() : null,
      });

      workOrders.push(workOrder);
    }
    
    return res.status(201).json(workOrders);
  } catch (error) {
    console.error('Error generating work orders:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;