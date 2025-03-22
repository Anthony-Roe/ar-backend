/**
 * @swagger
 * tags:
 *   name: WorkOrderParts
 *   description: API for managing parts associated with work orders
 */

import express from 'express';
import WorkOrderPart from '../models/WorkOrderPart';
import Inventory from '../models/Inventory';
import WorkOrder from '../models/WorkOrder';
import passport from 'passport';

const router = express.Router();

// Middleware to check authentication
const authenticate = passport.authenticate('jwt', { session: false });

/**
 * @swagger
 * /work-orders/{workOrderId}/parts:
 *   get:
 *     summary: Get all parts for a work order
 *     tags: [WorkOrderParts]
 *     description: Retrieves all parts associated with a specific work order, including inventory details.
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
 *         description: List of work order parts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   work_order_part_id:
 *                     type: integer
 *                   work_order_id:
 *                     type: integer
 *                   inventory_id:
 *                     type: integer
 *                   quantity_used:
 *                     type: number
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *                   Inventory:
 *                     type: object
 *                     properties:
 *                       inventory_id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       part_number:
 *                         type: string
 *                       quantity:
 *                         type: integer
 *                       unit_cost:
 *                         type: number
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/work-orders/:workOrderId/parts', authenticate, async (req: express.Request, res: express.Response): Promise<any> => {
  try {
    const workOrderId = parseInt(req.params.workOrderId);
    
    const parts = await WorkOrderPart.findAll({
      where: { work_order_id: workOrderId },
      include: [Inventory]
    });
    
    res.json(parts);
  } catch (error) {
    console.error('Error fetching work order parts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /work-orders/{workOrderId}/parts:
 *   post:
 *     summary: Add a part to a work order
 *     tags: [WorkOrderParts]
 *     description: Adds a new part to a specific work order and adjusts inventory quantity.
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
 *               inventory_id:
 *                 type: integer
 *               quantity_used:
 *                 type: number
 *             required:
 *               - inventory_id
 *               - quantity_used
 *     responses:
 *       201:
 *         description: Part added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 work_order_part_id:
 *                   type: integer
 *                 work_order_id:
 *                   type: integer
 *                 inventory_id:
 *                   type: integer
 *                 quantity_used:
 *                   type: number
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Not enough inventory available
 *       404:
 *         description: Work order or inventory item not found
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.post('/work-orders/:workOrderId/parts', authenticate, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const workOrderId = parseInt(req.params.workOrderId);
    const { inventory_id, quantity_used } = req.body;
    
    const workOrder = await WorkOrder.findByPk(workOrderId);
    if (!workOrder) {
      res.status(404).json({ message: 'Work order not found' });
      return;
    }
    
    const inventoryItem = await Inventory.findByPk(inventory_id);
    if (!inventoryItem) {
      res.status(404).json({ message: 'Inventory item not found' });
      return;
    }
    
    if (inventoryItem.quantity < quantity_used) {
      res.status(400).json({ message: 'Not enough inventory available' });
      return;
    }
    
    const workOrderPart = await WorkOrderPart.create({
      work_order_id: workOrderId,
      inventory_id,
      quantity_used
    });
    
    await inventoryItem.update({
      quantity: inventoryItem.quantity - quantity_used
    });
    
    res.status(201).json(workOrderPart);
  } catch (error) {
    console.error('Error adding part to work order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /work-order-parts/{id}:
 *   put:
 *     summary: Update a work order part
 *     tags: [WorkOrderParts]
 *     description: Updates the quantity of a part used in a work order and adjusts inventory accordingly.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the work order part
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity_used:
 *                 type: number
 *             required:
 *               - quantity_used
 *     responses:
 *       200:
 *         description: Part updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 work_order_part_id:
 *                   type: integer
 *                 work_order_id:
 *                   type: integer
 *                 inventory_id:
 *                   type: integer
 *                 quantity_used:
 *                   type: number
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Not enough inventory available
 *       404:
 *         description: Work order part or inventory item not found
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.put('/work-order-parts/:id', authenticate, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const partId = parseInt(req.params.id);
    const { quantity_used } = req.body;
    
    const workOrderPart = await WorkOrderPart.findByPk(partId, {
      include: [Inventory]
    });
    
    if (!workOrderPart) {
      res.status(404).json({ message: 'Work order part not found' });
      return;
    }
    
    const inventoryItem = await Inventory.findByPk(workOrderPart.inventory_id);
    if (!inventoryItem) {
      res.status(404).json({ message: 'Inventory item not found' });
      return;
    }
    
    const quantityDifference = quantity_used - workOrderPart.quantity_used;
    
    if (quantityDifference > 0 && inventoryItem.quantity < quantityDifference) {
      res.status(400).json({ message: 'Not enough inventory available' });
      return;
    }
    
    await inventoryItem.update({
      quantity: inventoryItem.quantity - quantityDifference
    });
    
    await workOrderPart.update({ quantity_used });
    
    res.json(workOrderPart);
  } catch (error) {
    console.error('Error updating work order part:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /work-order-parts/{id}:
 *   delete:
 *     summary: Delete a work order part
 *     tags: [WorkOrderParts]
 *     description: Deletes a work order part and returns the quantity to inventory.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the work order part
 *     responses:
 *       204:
 *         description: Part deleted successfully
 *       404:
 *         description: Work order part or inventory item not found
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.delete('/work-order-parts/:id', authenticate, async (req: express.Request, res: express.Response): Promise<any> => {
  try {
    const partId = parseInt(req.params.id);
    
    const workOrderPart = await WorkOrderPart.findByPk(partId);
    
    if (!workOrderPart) {
      return res.status(404).json({ message: 'Work order part not found' });
    }
    
    const inventoryItem = await Inventory.findByPk(workOrderPart.inventory_id);
    
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    await inventoryItem.update({
      quantity: inventoryItem.quantity + workOrderPart.quantity_used
    });
    
    await workOrderPart.destroy();
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting work order part:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
