import express, { Request, Response } from 'express';
import Inventory from '../models/Inventory';
import Plant from '../models/Plant';
import Vendor from '../models/Vendor';
import { authorize } from '../middleware/roleAuth';
import Joi from 'joi';
import { ValidationError } from 'sequelize';

// Define interfaces for type safety
interface InventoryItem {
  inventory_id: number;
  plant_id: number | null;
  vendor_id: number | null;
  name: string;
  description: string;
  quantity: number;
  unit_price: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
  plant?: {
    plant_id: number;
    name: string;
  };
  vendor?: {
    vendor_id: number;
    name: string;
  };
}

interface ErrorResponse {
  message: string;
  details?: string[];
}

const router = express.Router();

// Validation schema
const inventoryValidationSchema = Joi.object({
  plant_id: Joi.number().integer().allow(null),
  vendor_id: Joi.number().integer().allow(null),
  name: Joi.string().max(100).required(),
  description: Joi.string().required(),
  quantity: Joi.number().integer().min(0).required(),
  unit_price: Joi.number().min(0).required(),
});

// GET /inventory
router.get('/inventory', 
  authorize(['admin', 'manager', 'technician']), 
  async (req: Request, res: Response<InventoryItem[] | ErrorResponse>): Promise<void> => {
    try {
      const inventory = await Inventory.findAll({
        include: [
          { model: Plant, as: 'inventoryPlant', attributes: ['plant_id', 'name'] },
          { model: Vendor, as: 'inventoryVendor', attributes: ['vendor_id', 'name'] },
        ],
      });
      res.json(inventory as InventoryItem[]);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      if (error instanceof ValidationError) {
        res.status(400).json({ 
          message: 'Validation error', 
          details: error.errors.map(e => e.message) 
        });
      } else {
        res.status(500).json({ 
          message: 'Internal server error', 
          details: [error instanceof Error ? error.message : 'Unknown error'] 
        });
      }
    }
});

// POST /inventory
router.post('/inventory', 
  authorize(['admin', 'manager']), 
  async (req: Request, res: Response<InventoryItem | ErrorResponse>): Promise<void> => {
    try {
      const { error, value } = inventoryValidationSchema.validate(req.body);
      if (error) {
        res.status(400).json({ 
          message: 'Validation error', 
          details: error.details.map(d => d.message) 
        });
        return;
      }

      // Validate foreign keys
      if (value.plant_id) {
        const plant = await Plant.findByPk(value.plant_id);
        if (!plant) {
          res.status(404).json({ message: 'Plant not found' });
          return;
        }
      }
      
      if (value.vendor_id) {
        const vendor = await Vendor.findByPk(value.vendor_id);
        if (!vendor) {
          res.status(404).json({ message: 'Vendor not found' });
          return;
        }
      }

      const inventory = await Inventory.create(value);
      res.status(201).json(inventory as InventoryItem);
    } catch (error) {
      console.error('Error creating inventory item:', error);
      if (error instanceof ValidationError) {
        res.status(400).json({ 
          message: 'Validation error', 
          details: error.errors.map(e => e.message) 
        });
      } else {
        res.status(500).json({ 
          message: 'Internal server error', 
          details: [error instanceof Error ? error.message : 'Unknown error'] 
        });
      }
    }
});

// PUT /inventory/:id
router.put('/inventory/:id', 
  authorize(['admin', 'manager']), 
  async (req: Request, res: Response<InventoryItem | ErrorResponse>): Promise<void> => {
    try {
      const inventoryId = parseInt(req.params.id);
      if (isNaN(inventoryId)) {
        res.status(400).json({ message: 'Invalid inventory ID' });
        return;
      }

      const { error, value } = inventoryValidationSchema.validate(req.body);
      if (error) {
        res.status(400).json({ 
          message: 'Validation error', 
          details: error.details.map(d => d.message) 
        });
        return;
      }

      const inventory = await Inventory.findByPk(inventoryId);
      if (!inventory) {
        res.status(404).json({ message: 'Inventory item not found' });
        return;
      }

      // Validate foreign keys
      if (value.plant_id) {
        const plant = await Plant.findByPk(value.plant_id);
        if (!plant) {
          res.status(404).json({ message: 'Plant not found' });
          return;
        }
      }
      
      if (value.vendor_id) {
        const vendor = await Vendor.findByPk(value.vendor_id);
        if (!vendor) {
          res.status(404).json({ message: 'Vendor not found' });
          return;
        }
      }

      await inventory.update(value);
      res.json(inventory as InventoryItem);
    } catch (error) {
      console.error('Error updating inventory item:', error);
      if (error instanceof ValidationError) {
        res.status(400).json({ 
          message: 'Validation error', 
          details: error.errors.map(e => e.message) 
        });
      } else {
        res.status(500).json({ 
          message: 'Internal server error', 
          details: [error instanceof Error ? error.message : 'Unknown error'] 
        });
      }
    }
});

// DELETE /inventory/:id
router.delete('/inventory/:id', 
  authorize(['admin']), 
  async (req: Request, res: Response<void | ErrorResponse>): Promise<void> => {
    try {
      const inventoryId = parseInt(req.params.id);
      if (isNaN(inventoryId)) {
        res.status(400).json({ message: 'Invalid inventory ID' });
        return;
      }

      const inventory = await Inventory.findByPk(inventoryId);
      if (!inventory) {
        res.status(404).json({ message: 'Inventory item not found' });
        return;
      }

      await inventory.destroy(); // Soft delete
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      if (error instanceof ValidationError) {
        res.status(400).json({ 
          message: 'Validation error', 
          details: error.errors.map(e => e.message) 
        });
      } else {
        res.status(500).json({ 
          message: 'Internal server error', 
          details: [error instanceof Error ? error.message : 'Unknown error'] 
        });
      }
    }
});

export default router;