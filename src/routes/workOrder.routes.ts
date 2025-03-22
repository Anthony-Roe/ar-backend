import express, { Request, Response } from 'express';
import WorkOrder from '../models/WorkOrder';
import Machine from '../models/Machine';
import Plant from '../models/Plant';
import User from '../models/User';
import WorkOrderPart from '../models/WorkOrderPart';
import WorkOrderLabor from '../models/WorkOrderLabor';
import Inventory from '../models/Inventory';
import { authorize } from '../middleware/roleAuth';
import Joi from 'joi';
import { ValidationError } from 'sequelize';

const router = express.Router();

// Validation schema for creating/updating a work order
const workOrderValidationSchema = Joi.object({
  machine_id: Joi.number().integer().allow(null),
  plant_id: Joi.number().integer().allow(null),
  assigned_to: Joi.number().integer().allow(null),
  title: Joi.string().max(100).required(),
  description: Joi.string().required(),
  status: Joi.string().valid('pending', 'in-progress', 'completed').required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
  due_date: Joi.date().required(),
});

/**
 * @swagger
 * tags:
 *   name: WorkOrders
 *   description: API for managing work orders
 */

/**
 * @swagger
 * /api/work-orders:
 *   get:
 *     summary: Get all work orders
 *     tags: [WorkOrders]
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
 *                   machine_id:
 *                     type: integer
 *                     nullable: true
 *                   plant_id:
 *                     type: integer
 *                     nullable: true
 *                   assigned_to:
 *                     type: integer
 *                     nullable: true
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   status:
 *                     type: string
 *                   priority:
 *                     type: string
 *                   due_date:
 *                     type: string
 *                     format: date
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
 *                   machine:
 *                     type: object
 *                     properties:
 *                       machine_id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                   plant:
 *                     type: object
 *                     properties:
 *                       plant_id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                   assignedUser:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: integer
 *                       username:
 *                         type: string
 *                   workOrderParts:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         work_order_part_id:
 *                           type: integer
 *                         inventory_id:
 *                           type: integer
 *                         quantity_used:
 *                           type: integer
 *                         inventory:
 *                           type: object
 *                           properties:
 *                             inventory_id:
 *                               type: integer
 *                             name:
 *                               type: string
 *                   workOrderLabor:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         work_order_labor_id:
 *                           type: integer
 *                         user_id:
 *                           type: integer
 *                         hours_worked:
 *                           type: number
 *                         user:
 *                           type: object
 *                           properties:
 *                             user_id:
 *                               type: integer
 *                             username:
 *                               type: string
 *       500:
 *         description: Internal server error
 */
router.get('/work-orders', authorize(['admin', 'manager', 'technician']), async (req: Request, res: Response): Promise<void> => {
  try {
    const workOrders = await WorkOrder.findAll({
      include: [
        { model: Machine, as: 'machine', attributes: ['machine_id', 'name'] },
        { model: Plant, as: 'plant', attributes: ['plant_id', 'name'] },
        { model: User, as: 'assignedUser', attributes: ['user_id', 'username'] },
        {
          model: WorkOrderPart,
          as: 'workOrderParts',
          include: [{ model: Inventory, attributes: ['inventory_id', 'name'] }],
        },
        {
          model: WorkOrderLabor,
          as: 'workOrderLabor',
          include: [{ model: User, attributes: ['user_id', 'username'] }],
        },
      ],
    });
    res.json(workOrders);
  } catch (error) {
    console.error('Error fetching work orders:', error);
    if (error instanceof ValidationError) {
      res.status(400).json({ message: 'Validation error', details: error.errors.map(e => e.message) });
    } else {
      res.status(500).json({ message: 'Internal server error', details: (error as Error).message });
    }
  }
});

/**
 * @swagger
 * /api/work-orders:
 *   post:
 *     summary: Create a new work order
 *     tags: [WorkOrders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               machine_id:
 *                 type: integer
 *                 nullable: true
 *               plant_id:
 *                 type: integer
 *                 nullable: true
 *               assigned_to:
 *                 type: integer
 *                 nullable: true
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *               priority:
 *                 type: string
 *               due_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Work order created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/work-orders', authorize(['admin', 'manager']), async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = workOrderValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: 'Validation error', details: error.details.map(d => d.message) });
    }

    // Validate foreign keys if provided
    if (value.machine_id) {
      const machine = await Machine.findByPk(value.machine_id);
      if (!machine) return res.status(404).json({ message: 'Machine not found' });
    }
    if (value.plant_id) {
      const plant = await Plant.findByPk(value.plant_id);
      if (!plant) return res.status(404).json({ message: 'Plant not found' });
    }
    if (value.assigned_to) {
      const user = await User.findByPk(value.assigned_to);
      if (!user) return res.status(404).json({ message: 'User not found' });
    }

    const workOrder = await WorkOrder.create(value);
    res.status(201).json(workOrder);
  } catch (error) {
    console.error('Error creating work order:', error);
    if (error instanceof ValidationError) {
      res.status(400).json({ message: 'Validation error', details: error.errors.map(e => e.message) });
    } else {
      res.status(500).json({ message: 'Internal server error', details: (error as Error).message });
    }
  }
});

/**
 * @swagger
 * /api/work-orders/{id}:
 *   put:
 *     summary: Update a work order
 *     tags: [WorkOrders]
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
 *               machine_id:
 *                 type: integer
 *                 nullable: true
 *               plant_id:
 *                 type: integer
 *                 nullable: true
 *               assigned_to:
 *                 type: integer
 *                 nullable: true
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *               priority:
 *                 type: string
 *               due_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Work order updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Work order not found
 *       500:
 *         description: Internal server error
 */
router.put('/work-orders/:id', authorize(['admin', 'manager']), async (req: Request, res: Response): Promise<void> => {
  try {
    const workOrderId = parseInt(req.params.id);
    if (isNaN(workOrderId)) {
      return res.status(400).json({ message: 'Invalid work order ID' });
    }

    const { error, value } = workOrderValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: 'Validation error', details: error.details.map(d => d.message) });
    }

    const workOrder = await WorkOrder.findByPk(workOrderId);
    if (!workOrder) {
      return res.status(404).json({ message: 'Work order not found' });
    }

    // Validate foreign keys if provided
    if (value.machine_id) {
      const machine = await Machine.findByPk(value.machine_id);
      if (!machine) return res.status(404).json({ message: 'Machine not found' });
    }
    if (value.plant_id) {
      const plant = await Plant.findByPk(value.plant_id);
      if (!plant) return res.status(404).json({ message: 'Plant not found' });
    }
    if (value.assigned_to) {
      const user = await User.findByPk(value.assigned_to);
      if (!user) return res.status(404).json({ message: 'User not found' });
    }

    await workOrder.update(value);
    res.json(workOrder);
  } catch (error) {
    console.error('Error updating work order:', error);
    if (error instanceof ValidationError) {
      res.status(400).json({ message: 'Validation error', details: error.errors.map(e => e.message) });
    } else {
      res.status(500).json({ message: 'Internal server error', details: (error as Error).message });
    }
  }
});

/**
 * @swagger
 * /api/work-orders/{id}:
 *   delete:
 *     summary: Delete a work order (soft delete)
 *     tags: [WorkOrders]
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
 *         description: Work order deleted successfully
 *       404:
 *         description: Work order not found
 *       500:
 *         description: Internal server error
 */
router.delete('/work-orders/:id', authorize(['admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const workOrderId = parseInt(req.params.id);
    if (isNaN(workOrderId)) {
      return res.status(400).json({ message: 'Invalid work order ID' });
    }

    const workOrder = await WorkOrder.findByPk(workOrderId);
    if (!workOrder) {
      return res.status(404).json({ message: 'Work order not found' });
    }

    await workOrder.destroy(); // Soft delete
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting work order:', error);
    if (error instanceof ValidationError) {
      res.status(400).json({ message: 'Validation error', details: error.errors.map(e => e.message) });
    } else {
      res.status(500).json({ message: 'Internal server error', details: (error as Error).message });
    }
  }
});

export default router;