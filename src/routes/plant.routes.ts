/**
 * @swagger
 * tags:
 *   name: Plants
 *   description: API for managing manufacturing plants
 */

import express from 'express';
import Plant from '../models/Plant';
import { authorize } from '../middleware/roleAuth';
import Joi from 'joi';

const router = express.Router();

// Validation schema for creating a new plant
const plantValidationSchema = Joi.object({
  name: Joi.string().max(100).required(),
  location: Joi.string().max(255).required(),
  contact_email: Joi.string().email().required(),
  contact_phone: Joi.string().max(15).required(),
});

/**
 * @swagger
 * /plants:
 *   get:
 *     summary: Get all plants
 *     tags: [Plants]
 *     description: Fetches a list of all plants in the system. Accessible to users with 'admin' or 'manager' roles.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of plants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   plant_id:
 *                     type: integer
 *                     description: Unique identifier for the plant
 *                     example: 1
 *                   name:
 *                     type: string
 *                     description: Name of the plant
 *                     example: "Plant A"
 *                   location:
 *                     type: string
 *                     description: Physical location of the plant
 *                     example: "123 Industrial Rd"
 *                   contact_email:
 *                     type: string
 *                     description: Contact email for the plant
 *                     example: "plantA@example.com"
 *                   contact_phone:
 *                     type: string
 *                     description: Contact phone number for the plant
 *                     example: "555-1234"
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     description: Timestamp when the plant was created
 *                     example: "2025-03-20T10:00:00Z"
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *                     description: Timestamp when the plant was last updated
 *                     example: "2025-03-20T10:00:00Z"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient role permissions
 *       500:
 *         description: Internal server error
 */
router.get('/plants', authorize(['admin', 'manager']), async (req: express.Request, res: express.Response): Promise<any> => {
  try {
    const plants = await Plant.findAll();
    res.json(plants);
  } catch (error) {
    console.error('Error fetching plants:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /plants:
 *   post:
 *     summary: Create a new plant
 *     tags: [Plants]
 *     description: Creates a new plant in the system. Accessible only to users with 'admin' role.
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
 *                 description: Name of the plant
 *                 example: "Plant A"
 *                 maxLength: 100
 *               location:
 *                 type: string
 *                 description: Physical location of the plant
 *                 example: "123 Industrial Rd"
 *                 maxLength: 255
 *               contact_email:
 *                 type: string
 *                 description: Contact email for the plant
 *                 example: "plantA@example.com"
 *                 format: email
 *               contact_phone:
 *                 type: string
 *                 description: Contact phone number for the plant
 *                 example: "555-1234"
 *                 maxLength: 15
 *             required:
 *               - name
 *               - location
 *               - contact_email
 *               - contact_phone
 *     responses:
 *       201:
 *         description: Plant created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 plant_id:
 *                   type: integer
 *                   description: Unique identifier for the plant
 *                   example: 1
 *                 name:
 *                   type: string
 *                   description: Name of the plant
 *                   example: "Plant A"
 *                 location:
 *                   type: string
 *                   description: Physical location of the plant
 *                   example: "123 Industrial Rd"
 *                 contact_email:
 *                   type: string
 *                   description: Contact email for the plant
 *                   example: "plantA@example.com"
 *                 contact_phone:
 *                   type: string
 *                   description: Contact phone number for the plant
 *                   example: "555-1234"
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                   description: Timestamp when the plant was created
 *                   example: "2025-03-20T10:00:00Z"
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *                   description: Timestamp when the plant was last updated
 *                   example: "2025-03-20T10:00:00Z"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient role permissions
 *       500:
 *         description: Internal server error
 */
router.post('/plants', authorize(['admin']), async (req: express.Request, res: express.Response): Promise<any> => {
  try {
    // Validate the request body
    const { error, value } = plantValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Create the plant
    const plant = await Plant.create(value);
    res.status(201).json(plant);
  } catch (error) {
    console.error('Error creating plant:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /plants/{id}:
 *   delete:
 *     summary: Delete a plant
 *     tags: [Plants]
 *     description: Deletes a plant by its ID. Accessible only to users with the 'admin' role.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the plant to delete
 *     responses:
 *       204:
 *         description: Plant deleted successfully
 *       404:
 *         description: Plant not found
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient role permissions
 *       500:
 *         description: Internal server error
 */
router.delete('/plants/:id', authorize(['admin']), async (req: express.Request, res: express.Response): Promise<any> => {
  try {
    const plantId = parseInt(req.params.id);

    // Find the plant by ID
    const plant = await Plant.findByPk(plantId);

    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }

    // Delete the plant
    await plant.destroy();

    res.status(204).send(); // No content
  } catch (error) {
    console.error('Error deleting plant:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
