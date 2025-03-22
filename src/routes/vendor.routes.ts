import express, { Request, Response } from 'express';
import Vendor from '../models/Vendor';
import { authorize } from '../middleware/roleAuth';
import Joi from 'joi';
import { ValidationError } from 'sequelize';

const router = express.Router();

// Define a response type for vendors
interface VendorResponse {
  vendor_id: number;
  name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

// Validation schema for creating/updating a vendor
const vendorValidationSchema = Joi.object({
  name: Joi.string().max(100).required(),
  contact_email: Joi.string().email().max(100).required(),
  contact_phone: Joi.string().max(20).required(),
  address: Joi.string().max(255).required(),
});

// GET /vendors
router.get('/vendors', authorize(['admin', 'manager', 'technician']), 
  async (req: Request, res: Response<VendorResponse[] | { message: string, details?: string[] }>): Promise<void> => {
    try {
      const vendors = await Vendor.findAll();
      res.json(vendors as VendorResponse[]);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      if (error instanceof ValidationError) {
        res.status(400).json({ 
          message: 'Validation error', 
          details: error.errors.map(e => e.message) 
        });
      } else {
        res.status(500).json({ 
          message: 'Internal server error', 
          details: error instanceof Error ? [error.message] : undefined 
        });
      }
    }
});

// POST /vendors
router.post('/vendors', authorize(['admin']), 
  async (req: Request, res: Response<VendorResponse | { message: string, details?: string[] }>): Promise<void> => {
    try {
      const { error, value } = vendorValidationSchema.validate(req.body);
      if (error) {
        res.status(400).json({ 
          message: 'Validation error', 
          details: error.details.map(d => d.message) 
        });
        return;
      }

      const vendor = await Vendor.create(value);
      res.status(201).json(vendor as VendorResponse);
    } catch (error) {
      console.error('Error creating vendor:', error);
      if (error instanceof ValidationError) {
        res.status(400).json({ 
          message: 'Validation error', 
          details: error.errors.map(e => e.message) 
        });
      } else {
        res.status(500).json({ 
          message: 'Internal server error', 
          details: error instanceof Error ? [error.message] : undefined 
        });
      }
    }
});

// PUT /vendors/:id
router.put('/vendors/:id', authorize(['admin']), 
  async (req: Request, res: Response<VendorResponse | { message: string, details?: string[] }>): Promise<void> => {
    try {
      const vendorId = parseInt(req.params.id);
      if (isNaN(vendorId)) {
        res.status(400).json({ message: 'Invalid vendor ID' });
        return;
      }

      const { error, value } = vendorValidationSchema.validate(req.body);
      if (error) {
        res.status(400).json({ 
          message: 'Validation error', 
          details: error.details.map(d => d.message) 
        });
        return;
      }

      const vendor = await Vendor.findByPk(vendorId);
      if (!vendor) {
        res.status(404).json({ message: 'Vendor not found' });
        return;
      }

      await vendor.update(value);
      res.json(vendor as VendorResponse);
    } catch (error) {
      console.error('Error updating vendor:', error);
      if (error instanceof ValidationError) {
        res.status(400).json({ 
          message: 'Validation error', 
          details: error.errors.map(e => e.message) 
        });
      } else {
        res.status(500).json({ 
          message: 'Internal server error', 
          details: error instanceof Error ? [error.message] : undefined 
        });
      }
    }
});

// DELETE /vendors/:id
router.delete('/vendors/:id', authorize(['admin']), 
  async (req: Request, res: Response<void | { message: string, details?: string[] }>): Promise<void> => {
    try {
      const vendorId = parseInt(req.params.id);
      if (isNaN(vendorId)) {
        res.status(400).json({ message: 'Invalid vendor ID' });
        return;
      }

      const vendor = await Vendor.findByPk(vendorId);
      if (!vendor) {
        res.status(404).json({ message: 'Vendor not found' });
        return;
      }

      await vendor.destroy(); // Soft delete
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting vendor:', error);
      if (error instanceof ValidationError) {
        res.status(400).json({ 
          message: 'Validation error', 
          details: error.errors.map(e => e.message) 
        });
      } else {
        res.status(500).json({ 
          message: 'Internal server error', 
          details: error instanceof Error ? [error.message] : undefined 
        });
      }
    }
});

export default router;