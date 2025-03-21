/**
 * @swagger
 * tags:
 *   name: Vendors
 *   description: API for managing vendors
 */

import express from 'express';
import Vendor from '../models/Vendor';
import { authorize } from '../middleware/roleAuth';
import Joi from 'joi';

const router = express.Router();

// Validation schema for creating/updating a vendor
const vendorValidationSchema = Joi.object({
  name: Joi.string().max(100).required(),
  contact_email: Joi.string().email().required(),
  contact_phone: Joi.string().max(15).required(),
});

/**
 * @swagger
 * /vendors:
 *   get:
 *     summary: Get all vendors
 *     tags: [Vendors]
 *     description: Fetches a list of all vendors. Accessible to users with 'admin' or 'manager' roles.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of vendors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   vendor_id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   contact_email:
 *                     type: string
 *                   contact_phone:
 *                     type: string
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
router.get('/vendors', authorize(['admin', 'manager']), async (req: express.Request, res: express.Response): Promise<any> => {
  try {
    const vendors = await Vendor.findAll();
    res.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /vendors:
 *   post:
 *     summary: Create a new vendor
 *     tags: [Vendors]
 *     description: Creates a new vendor. Accessible only to users with 'admin' role.
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
 *                 maxLength: 100
 *               contact_email:
 *                 type: string
 *                 format: email
 *               contact_phone:
 *                 type: string
 *                 maxLength: 15
 *             required:
 *               - name
 *               - contact_email
 *               - contact_phone
 *     responses:
 *       201:
 *         description: Vendor created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 vendor_id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 contact_email:
 *                   type: string
 *                 contact_phone:
 *                   type: string
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
router.post('/vendors', authorize(['admin']), async (req: express.Request, res: express.Response): Promise<any> => {
  try {
    const { error, value } = vendorValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const vendor = await Vendor.create(value);
    res.status(201).json(vendor);
  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;