/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: API for generating various reports related to work orders, machines, inventory, and labor
 */

import express from 'express';
import { Op, fn, col, literal } from 'sequelize';
import WorkOrder from '../models/WorkOrder';
import Machine from '../models/Machine';
import WorkOrderPart from '../models/WorkOrderPart';
import WorkOrderLabor from '../models/WorkOrderLabor';
import Inventory from '../models/Inventory';
import passport from 'passport';

const router = express.Router();

// Middleware to check authentication
const authenticate = passport.authenticate('jwt', { session: false });

/**
 * @swagger
 * /reports/work-orders:
 *   get:
 *     summary: Get work order statistics
 *     tags: [Reports]
 *     description: Retrieves statistics on work orders including status counts, priority counts, and average completion time. Filterable by date range and plant.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering work orders (e.g., 2025-01-01)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering work orders (e.g., 2025-03-20)
 *       - in: query
 *         name: plant_id
 *         schema:
 *           type: integer
 *         description: Filter by plant ID
 *     responses:
 *       200:
 *         description: Work order statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status_counts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       status:
 *                         type: string
 *                         enum: [pending, in_progress, completed, cancelled]
 *                       count:
 *                         type: integer
 *                 priority_counts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       priority:
 *                         type: string
 *                         enum: [low, medium, high, critical]
 *                       count:
 *                         type: integer
 *                 avg_completion_time:
 *                   type: number
 *                   description: Average completion time in hours for completed work orders
 *                   example: 24.5
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/reports/work-orders', authenticate, async (req: express.Request, res: express.Response): Promise<any> => {
  try {
    const { start_date, end_date, plant_id } = req.query;
    
    const whereClause: any = {};
    
    if (start_date && end_date) {
      whereClause.created_at = {
        [Op.between]: [new Date(start_date as string), new Date(end_date as string)]
      };
    }
    
    if (plant_id) {
      whereClause.plant_id = parseInt(plant_id as string);
    }
    
    const statusCounts = await WorkOrder.findAll({
      attributes: [
        'status',
        [fn('COUNT', col('work_order_id')), 'count']
      ],
      where: whereClause,
      group: ['status']
    });
    
    const priorityCounts = await WorkOrder.findAll({
      attributes: [
        'priority',
        [fn('COUNT', col('work_order_id')), 'count']
      ],
      where: whereClause,
      group: ['priority']
    });
    
    const avgCompletionTime = await WorkOrder.findAll({
      attributes: [
        [literal('AVG(EXTRACT(EPOCH FROM (completed_date - created_at)) / 3600)'), 'avg_hours']
      ],
      where: {
        ...whereClause,
        status: 'completed',
        completed_date: { [Op.not]: null }
      }
    });
    
    res.json({
      status_counts: statusCounts,
      priority_counts: priorityCounts,
      avg_completion_time: (avgCompletionTime[0] as any)?.getDataValue('avg_hours') || 0
    });
  } catch (error) {
    console.error('Error generating work order report:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /reports/machine-downtime:
 *   get:
 *     summary: Get machine downtime report
 *     tags: [Reports]
 *     description: Retrieves downtime statistics for machines based on completed work orders. Filterable by date range and plant.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering work orders
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering work orders
 *       - in: query
 *         name: plant_id
 *         schema:
 *           type: integer
 *         description: Filter by plant ID
 *     responses:
 *       200:
 *         description: Machine downtime report
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   machine_id:
 *                     type: integer
 *                   total_downtime_hours:
 *                     type: number
 *                     description: Total downtime in hours
 *                   Machine:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       serial_number:
 *                         type: string
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/reports/machine-downtime', authenticate, async (req: express.Request, res: express.Response): Promise<any> => {
  try {
    const { start_date, end_date, plant_id } = req.query;
    
    const whereClause: any = {
      status: 'completed'
    };
    
    if (start_date && end_date) {
      whereClause.created_at = {
        [Op.between]: [new Date(start_date as string), new Date(end_date as string)]
      };
    }
    
    if (plant_id) {
      whereClause.plant_id = parseInt(plant_id as string);
    }
    
    const machineDowntime = await WorkOrder.findAll({
      attributes: [
        'machine_id',
        [literal('SUM(EXTRACT(EPOCH FROM (completed_date - created_at)) / 3600)'), 'total_downtime_hours']
      ],
      where: whereClause,
      include: [
        {
          model: Machine,
          attributes: ['name', 'serial_number']
        }
      ],
      group: ['machine_id', 'Machine.machine_id'],
      order: [[literal('total_downtime_hours'), 'DESC']]
    });
    
    res.json(machineDowntime);
  } catch (error) {
    console.error('Error generating machine downtime report:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /reports/inventory-usage:
 *   get:
 *     summary: Get inventory usage report
 *     tags: [Reports]
 *     description: Retrieves usage statistics for inventory items based on work orders. Filterable by date range and plant.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering work orders
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering work orders
 *       - in: query
 *         name: plant_id
 *         schema:
 *           type: integer
 *         description: Filter by plant ID
 *     responses:
 *       200:
 *         description: Inventory usage report
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   inventory_id:
 *                     type: integer
 *                   total_quantity_used:
 *                     type: number
 *                   Inventory:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       part_number:
 *                         type: string
 *                       unit_cost:
 *                         type: number
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/reports/inventory-usage', authenticate, async (req: express.Request, res: express.Response): Promise<any> => {
  try {
    const { start_date, end_date, plant_id } = req.query;
    
    let workOrderWhereClause: any = {};
    
    if (start_date && end_date) {
      workOrderWhereClause.created_at = {
        [Op.between]: [new Date(start_date as string), new Date(end_date as string)]
      };
    }
    
    if (plant_id) {
      workOrderWhereClause.plant_id = parseInt(plant_id as string);
    }
    
    const inventoryUsage = await WorkOrderPart.findAll({
      attributes: [
        'inventory_id',
        [fn('SUM', col('quantity_used')), 'total_quantity_used']
      ],
      include: [
        {
          model: Inventory,
          attributes: ['name', 'part_number', 'unit_cost']
        },
        {
          model: WorkOrder,
          attributes: ['work_order_id'],
          where: workOrderWhereClause
        }
      ],
      group: ['inventory_id', 'Inventory.inventory_id'],
      order: [[literal('total_quantity_used'), 'DESC']]
    });
    
    res.json(inventoryUsage);
  } catch (error) {
    console.error('Error generating inventory usage report:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /reports/labor-hours:
 *   get:
 *     summary: Get labor hours report
 *     tags: [Reports]
 *     description: Retrieves total labor hours by technician based on work orders. Filterable by date range and plant.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering work orders
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering work orders
 *       - in: query
 *         name: plant_id
 *         schema:
 *           type: integer
 *         description: Filter by plant ID
 *     responses:
 *       200:
 *         description: Labor hours report
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user_id:
 *                     type: integer
 *                   total_hours:
 *                     type: number
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/reports/labor-hours', authenticate, async (req: express.Request, res: express.Response): Promise<any> => {
  try {
    const { start_date, end_date, plant_id } = req.query;
    
    let workOrderWhereClause: any = {};
    
    if (start_date && end_date) {
      workOrderWhereClause.created_at = {
        [Op.between]: [new Date(start_date as string), new Date(end_date as string)]
      };
    }
    
    if (plant_id) {
      workOrderWhereClause.plant_id = parseInt(plant_id as string);
    }
    
    const laborHours = await WorkOrderLabor.findAll({
      attributes: [
        'user_id',
        [fn('SUM', col('hours_worked')), 'total_hours']
      ],
      include: [
        {
          model: WorkOrder,
          attributes: ['work_order_id'],
          where: workOrderWhereClause
        }
      ],
      group: ['user_id'],
      order: [[literal('total_hours'), 'DESC']]
    });
    
    res.json(laborHours);
  } catch (error) {
    console.error('Error generating labor hours report:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
