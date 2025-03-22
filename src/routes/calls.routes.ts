import express, { Request, Response } from 'express';
import Call from '../models/Call';
import Machine from '../models/Machine';
import WorkOrder from '../models/WorkOrder';
import User from '../models/User';
import { authorize } from '../middleware/roleAuth';
import Joi from 'joi';
import { ValidationError } from 'sequelize';

const router = express.Router();

// Validation schema for creating/updating a call
const callValidationSchema = Joi.object({
  machine_id: Joi.number().integer().allow(null),
  work_order_id: Joi.number().integer().allow(null),
  reporter_id: Joi.number().integer().allow(null),
  description: Joi.string().required(),
  status: Joi.string().valid('open', 'in-progress', 'closed').default('open'),
  reported_at: Joi.date().allow(null),
});

/**
 * @swagger
 * tags:
 *   name: Calls
 *   description: API for managing maintenance calls
 */

/**
 * @swagger
 * /api/calls:
 *   get:
 *     summary: Get all calls
 *     tags: [Calls]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of calls
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   call_id:
 *                     type: integer
 *                   machine_id:
 *                     type: integer
 *                     nullable: true
 *                   work_order_id:
 *                     type: integer
 *                     nullable: true
 *                   reporter_id:
 *                     type: integer
 *                     nullable: true
 *                   description:
 *                     type: string
 *                   status:
 *                     type: string
 *                     enum: [open, in-progress, closed]
 *                   reported_at:
 *                     type: string
 *                     format: date-time
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
 *                   workOrder:
 *                     type: object
 *                     properties:
 *                       work_order_id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                   reporter:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: integer
 *                       username:
 *                         type: string
 *       500:
 *         description: Internal server error
 */
router.get('/calls', authorize(['admin', 'manager', 'technician']), async (req: Request, res: Response): Promise<void> => {
  try {
    const calls = await Call.findAll({
      include: [
        { model: Machine, attributes: ['machine_id', 'name'] },
        { model: WorkOrder, attributes: ['work_order_id', 'title'] },
        { model: User, as: 'reporter', attributes: ['user_id', 'username'] },
      ],
    });
    res.json(calls);
  } catch (error) {
    console.error('Error fetching calls:', error);
    if (error instanceof ValidationError) {
      res.status(400).json({ message: 'Validation error', details: error.errors.map(e => e.message) });
    } else {
      res.status(500).json({ message: 'Internal server error', details: (error as Error).message });
    }
  }
});

/**
 * @swagger
 * /api/calls:
 *   post:
 *     summary: Create a new call
 *     tags: [Calls]
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
 *               work_order_id:
 *                 type: integer
 *                 nullable: true
 *               reporter_id:
 *                 type: integer
 *                 nullable: true
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [open, in-progress, closed]
 *               reported_at:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Call created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/calls', authorize(['admin', 'technician']), async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = callValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: 'Validation error', details: error.details.map(d => d.message) });
    }

    // Validate foreign keys if provided
    if (value.machine_id) {
      const machine = await Machine.findByPk(value.machine_id);
      if (!machine) return res.status(404).json({ message: 'Machine not found' });
    }
    if (value.work_order_id) {
      const workOrder = await WorkOrder.findByPk(value.work_order_id);
      if (!workOrder) return res.status(404).json({ message: 'Work order not found' });
    }
    if (value.reporter_id) {
      const user = await User.findByPk(value.reporter_id);
      if (!user) return res.status(404).json({ message: 'Reporter (user) not found' });
    }

    const call = await Call.create(value);
    res.status(201).json(call);
  } catch (error) {
    console.error('Error creating call:', error);
    if (error instanceof ValidationError) {
      res.status(400).json({ message: 'Validation error', details: error.errors.map(e => e.message) });
    } else {
      res.status(500).json({ message: 'Internal server error', details: (error as Error).message });
    }
  }
});

/**
 * @swagger
 * /api/calls/{id}:
 *   put:
 *     summary: Update a call
 *     tags: [Calls]
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
 *               work_order_id:
 *                 type: integer
 *                 nullable: true
 *               reporter_id:
 *                 type: integer
 *                 nullable: true
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [open, in-progress, closed]
 *               reported_at:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Call updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Call not found
 *       500:
 *         description: Internal server error
 */
router.put('/calls/:id', authorize(['admin', 'technician']), async (req: Request, res: Response): Promise<void> => {
  try {
    const callId = parseInt(req.params.id);
    if (isNaN(callId)) {
      return res.status(400).json({ message: 'Invalid call ID' });
    }

    const { error, value } = callValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: 'Validation error', details: error.details.map(d => d.message) });
    }

    const call = await Call.findByPk(callId);
    if (!call) {
      return res.status(404).json({ message: 'Call not found' });
    }

    // Validate foreign keys if provided
    if (value.machine_id) {
      const machine = await Machine.findByPk(value.machine_id);
      if (!machine) return res.status(404).json({ message: 'Machine not found' });
    }
    if (value.work_order_id) {
      const workOrder = await WorkOrder.findByPk(value.work_order_id);
      if (!workOrder) return res.status(404).json({ message: 'Work order not found' });
    }
    if (value.reporter_id) {
      const user = await User.findByPk(value.reporter_id);
      if (!user) return res.status(404).json({ message: 'Reporter (user) not found' });
    }

    await call.update(value);
    res.json(call);
  } catch (error) {
    console.error('Error updating call:', error);
    if (error instanceof ValidationError) {
      res.status(400).json({ message: 'Validation error', details: error.errors.map(e => e.message) });
    } else {
      res.status(500).json({ message: 'Internal server error', details: (error as Error).message });
    }
  }
});

/**
 * @swagger
 * /api/calls/{id}:
 *   delete:
 *     summary: Delete a call (soft delete)
 *     tags: [Calls]
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
 *         description: Call deleted successfully
 *       404:
 *         description: Call not found
 *       500:
 *         description: Internal server error
 */
router.delete('/calls/:id', authorize(['admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const callId = parseInt(req.params.id);
    if (isNaN(callId)) {
      return res.status(400).json({ message: 'Invalid call ID' });
    }

    const call = await Call.findByPk(callId);
    if (!call) {
      return res.status(404).json({ message: 'Call not found' });
    }

    await call.destroy(); // Soft delete
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting call:', error);
    if (error instanceof ValidationError) {
      res.status(400).json({ message: 'Validation error', details: error.errors.map(e => e.message) });
    } else {
      res.status(500).json({ message: 'Internal server error', details: (error as Error).message });
    }
  }
});

export default router;