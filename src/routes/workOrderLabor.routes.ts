/**
 * @swagger
 * tags:
 *   name: WorkOrderLabor
 *   description: API for managing labor entries associated with work orders
 */

import express from 'express';
import WorkOrderLabor from '../models/WorkOrderLabor';
import WorkOrder from '../models/WorkOrder';
import User from '../models/User';
import passport from 'passport';

const router = express.Router();

// Middleware to check authentication
const authenticate = passport.authenticate('jwt', { session: false });

/**
 * @swagger
 * /work-orders/{workOrderId}/labor:
 *   get:
 *     summary: Get all labor entries for a work order
 *     tags: [WorkOrderLabor]
 *     description: Retrieves all labor entries associated with a specific work order, including user details.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workOrderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the work order
 *     responses:
 *       200:
 *         description: List of labor entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   work_order_labor_id:
 *                     type: integer
 *                   work_order_id:
 *                     type: integer
 *                   user_id:
 *                     type: integer
 *                   hours_worked:
 *                     type: number
 *                   labor_date:
 *                     type: string
 *                     format: date-time
 *                   notes:
 *                     type: string
 *                     nullable: true
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *                   User:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: integer
 *                       username:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/work-orders/:workOrderId/labor', authenticate, async (req: express.Request, res: express.Response): Promise<any> => {
  try {
    const workOrderId = parseInt(req.params.workOrderId);
    
    const laborEntries = await WorkOrderLabor.findAll({
      where: { work_order_id: workOrderId },
      include: [
        {
          model: User,
          attributes: ['user_id', 'username', 'email', 'role']
        }
      ]
    });
    
    res.json(laborEntries);
  } catch (error) {
    console.error('Error fetching work order labor:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /work-orders/{workOrderId}/labor:
 *   post:
 *     summary: Add a labor entry to a work order
 *     tags: [WorkOrderLabor]
 *     description: Adds a new labor entry to a specific work order.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workOrderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the work order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               hours_worked:
 *                 type: number
 *               labor_date:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *                 nullable: true
 *             required:
 *               - user_id
 *               - hours_worked
 *               - labor_date
 *     responses:
 *       201:
 *         description: Labor entry created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 work_order_labor_id:
 *                   type: integer
 *                 work_order_id:
 *                   type: integer
 *                 user_id:
 *                   type: integer
 *                 hours_worked:
 *                   type: number
 *                 labor_date:
 *                   type: string
 *                   format: date-time
 *                 notes:
 *                   type: string
 *                   nullable: true
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Work order or user not found
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.post('/work-orders/:workOrderId/labor', authenticate, async (req: express.Request, res: express.Response): Promise<any> => {
  try {
    const workOrderId = parseInt(req.params.workOrderId);
    const { user_id, hours_worked, labor_date, notes } = req.body;
    
    const workOrder = await WorkOrder.findByPk(workOrderId);
    if (!workOrder) {
      return res.status(404).json({ message: 'Work order not found' });
    }
    
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const laborEntry = await WorkOrderLabor.create({
      work_order_id: workOrderId,
      user_id,
      hours_worked,
      labor_date: new Date(labor_date),
      notes
    });
    
    res.status(201).json(laborEntry);
  } catch (error) {
    console.error('Error adding labor to work order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /work-order-labor/{id}:
 *   put:
 *     summary: Update a labor entry
 *     tags: [WorkOrderLabor]
 *     description: Updates an existing labor entry.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the labor entry
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hours_worked:
 *                 type: number
 *               labor_date:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *                 nullable: true
 *             required:
 *               - hours_worked
 *               - labor_date
 *     responses:
 *       200:
 *         description: Labor entry updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 work_order_labor_id:
 *                   type: integer
 *                 work_order_id:
 *                   type: integer
 *                 user_id:
 *                   type: integer
 *                 hours_worked:
 *                   type: number
 *                 labor_date:
 *                   type: string
 *                   format: date-time
 *                 notes:
 *                   type: string
 *                   nullable: true
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Labor entry not found
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.put('/work-order-labor/:id', authenticate, async (req: express.Request, res: express.Response): Promise<any> => {
  try {
    const laborId = parseInt(req.params.id);
    const { hours_worked, labor_date, notes } = req.body;
    
    const laborEntry = await WorkOrderLabor.findByPk(laborId);
    
    if (!laborEntry) {
      return res.status(404).json({ message: 'Labor entry not found' });
    }
    
    await laborEntry.update({
      hours_worked,
      labor_date: new Date(labor_date),
      notes
    });
    
    res.json(laborEntry);
  } catch (error) {
    console.error('Error updating labor entry:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /work-order-labor/{id}:
 *   delete:
 *     summary: Delete a labor entry
 *     tags: [WorkOrderLabor]
 *     description: Deletes an existing labor entry.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the labor entry
 *     responses:
 *       204:
 *         description: Labor entry deleted successfully
 *       404:
 *         description: Labor entry not found
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.delete('/work-order-labor/:id', authenticate, async (req: express.Request, res: express.Response): Promise<any> => {
  try {
    const laborId = parseInt(req.params.id);
    
    const laborEntry = await WorkOrderLabor.findByPk(laborId);
    
    if (!laborEntry) {
      return res.status(404).json({ message: 'Labor entry not found' });
    }
    
    await laborEntry.destroy();
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting labor entry:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
