/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: API for managing inventory items
 */

import express from 'express';
import Inventory from '../models/Inventory';
import { authorize } from '../middleware/roleAuth';
import Joi from 'joi';

const router = express.Router();

// Validation schema for creating/updating inventory
const inventoryValidationSchema = Joi.object({
  name: Joi.string().max(100).required(),
  part_number: Joi.string().max(50).required(),
  quantity: Joi.number().min(0).required(),
  unit_cost: Joi.number().min(0).required(),
  plant_id: Joi.number().required(),
  vendor_id: Joi.number().required(),
});

/**
 * @swagger
 * /inventory:
 *   get:
 *     summary: Get all inventory items
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of inventory items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   inventory_id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   part_number:
 *                     type: string
 *                   quantity:
 *                     type: number
 *                   unit_cost:
 *                     type: number
 *                   plant_id:
 *                     type: integer
 *                   vendor_id:
 *                     type: integer
 *       500:
 *         description: Internal server error
 */
router.get('/inventory', authorize(['admin', 'manager', 'technician']), async (req: express.Request, res: express.Response): Promise<any> => {
  try {
    const inventory = await Inventory.findAll();
    res.json(inventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /inventory:
 *   post:
 *     summary: Create a new inventory item
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               part_number:
 *                 type: string
 *               quantity:
 *                 type: number
 *               unit_cost:
 *                 type: number
 *               plant_id:
 *                 type: integer
 *               vendor_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Inventory item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 inventory_id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 part_number:
 *                   type: string
 *                 quantity:
 *                   type: number
 *                 unit_cost:
 *                   type: number
 *                 plant_id:
 *                   type: integer
 *                 vendor_id:
 *                   type: integer
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/inventory', authorize(['admin']), async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { error, value } = inventoryValidationSchema.validate(req.body);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }

    const inventoryItem = await Inventory.create(value);
    res.status(201).json(inventoryItem);
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;