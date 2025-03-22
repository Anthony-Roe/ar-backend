import express from 'express';
import MaintenanceSchedule from '../models/MaintenanceSchedule';
import Machine from '../models/Machine';
import passport from 'passport';
import { ValidationError } from 'sequelize';

const router = express.Router();

// Middleware to check authentication
const authenticate = passport.authenticate('jwt', { session: false });

// Removed unused MaintenanceScheduleAttributes interface

// Validate request body
const validateScheduleInput = (body: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const { machine_id, name, description, frequency_days, next_due } = body;

  if (!machine_id || isNaN(parseInt(machine_id))) errors.push('Machine ID must be a valid number');
  if (!name || typeof name !== 'string' || name.length < 3) errors.push('Name must be a string with at least 3 characters');
  if (!description || typeof description !== 'string') errors.push('Description must be a non-empty string');
  if (!frequency_days || isNaN(parseInt(frequency_days)) || parseInt(frequency_days) <= 0) errors.push('Frequency days must be a positive number');
  if (!next_due || isNaN(Date.parse(next_due))) errors.push('Next due date must be a valid date');

  return { isValid: errors.length === 0, errors };
};

// Get all maintenance schedules
router.get('/maintenance-schedules', authenticate, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const schedules = await MaintenanceSchedule.findAll({
      include: [{ model: Machine, attributes: ['machine_id', 'name'] }],
    });
    res.json(schedules);
  } catch (error) {
    console.error('Error fetching maintenance schedules:', error);
    if (error instanceof ValidationError) {
      res.status(400).json({ message: 'Validation error', details: error.errors.map(e => e.message) });
    } else {
      res.status(500).json({ message: 'Internal server error', details: (error as Error).message });
    }
  }
});

// Get maintenance schedules for a specific machine
router.get('/machines/:machineId/maintenance-schedules', authenticate, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const machineId = parseInt(req.params.machineId);
    if (isNaN(machineId)) {
      return res.status(400).json({ message: 'Invalid machine ID' });
    }

    const schedules = await MaintenanceSchedule.findAll({
      where: { machine_id: machineId },
      include: [{ model: Machine, attributes: ['machine_id', 'name'] }],
    });

    res.json(schedules);
  } catch (error) {
    console.error('Error fetching machine maintenance schedules:', error);
    if (error instanceof ValidationError) {
      res.status(400).json({ message: 'Validation error', details: error.errors.map(e => e.message) });
    } else {
      res.status(500).json({ message: 'Internal server error', details: (error as Error).message });
    }
  }
});

// Create a new maintenance schedule
router.post('/maintenance-schedules', authenticate, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { machine_id, name, description, frequency_days, next_due } = req.body;

    // Validate input
    const validation = validateScheduleInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ message: 'Validation error', details: validation.errors });
    }

    // Check if machine exists
    const machine = await Machine.findByPk(machine_id);
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    const schedule = await MaintenanceSchedule.create({
      machine_id: parseInt(machine_id),
      name,
      description,
      frequency_days: parseInt(frequency_days),
      next_due: new Date(next_due),
    });

    res.status(201).json(schedule);
  } catch (error) {
    console.error('Error creating maintenance schedule:', error);
    if (error instanceof ValidationError) {
      res.status(400).json({ message: 'Validation error', details: error.errors.map(e => e.message) });
    } else {
      res.status(500).json({ message: 'Internal server error', details: (error as Error).message });
    }
  }
});

// Update a maintenance schedule
router.put('/maintenance-schedules/:id', authenticate, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const scheduleId = parseInt(req.params.id);
    if (isNaN(scheduleId)) {
      return res.status(400).json({ message: 'Invalid schedule ID' });
    }

    const { name, description, frequency_days, next_due, last_completed } = req.body;

    // Validate input (partial update, so only validate provided fields)
    const validation = validateScheduleInput({ name, description, frequency_days, next_due });
    if (!validation.isValid) {
      return res.status(400).json({ message: 'Validation error', details: validation.errors });
    }

    const schedule = await MaintenanceSchedule.findByPk(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: 'Maintenance schedule not found' });
    }

    await schedule.update({
      name,
      description,
      frequency_days: parseInt(frequency_days),
      next_due: new Date(next_due),
      last_completed: last_completed ? new Date(last_completed) : schedule.last_completed,
    });

    res.json(schedule);
  } catch (error) {
    console.error('Error updating maintenance schedule:', error);
    if (error instanceof ValidationError) {
      res.status(400).json({ message: 'Validation error', details: error.errors.map(e => e.message) });
    } else {
      res.status(500).json({ message: 'Internal server error', details: (error as Error).message });
    }
  }
});

// Delete a maintenance schedule
router.delete('/maintenance-schedules/:id', authenticate, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const scheduleId = parseInt(req.params.id);
    if (isNaN(scheduleId)) {
      return res.status(400).json({ message: 'Invalid schedule ID' });
    }

    const schedule = await MaintenanceSchedule.findByPk(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: 'Maintenance schedule not found' });
    }

    await schedule.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting maintenance schedule:', error);
    if (error instanceof ValidationError) {
      res.status(400).json({ message: 'Validation error', details: error.errors.map(e => e.message) });
    } else {
      res.status(500).json({ message: 'Internal server error', details: (error as Error).message });
    }
  }
});

// Mark a maintenance schedule as completed
router.post('/maintenance-schedules/:id/complete', authenticate, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const scheduleId = parseInt(req.params.id);
    if (isNaN(scheduleId)) {
      return res.status(400).json({ message: 'Invalid schedule ID' });
    }

    const { completion_date = new Date() } = req.body;
    if (isNaN(Date.parse(completion_date))) {
      return res.status(400).json({ message: 'Invalid completion date' });
    }

    const schedule = await MaintenanceSchedule.findByPk(scheduleId, {
      include: [{ model: Machine }],
    });
    if (!schedule) {
      return res.status(404).json({ message: 'Maintenance schedule not found' });
    }

    // Calculate next due date based on frequency
    const completionDate = new Date(completion_date);
    const nextDueDate = new Date(completionDate);
    nextDueDate.setDate(nextDueDate.getDate() + schedule.frequency_days);

    // Update the schedule
    await schedule.update({
      last_completed: completionDate,
      next_due: nextDueDate,
    });

    // Update the machine's last and next maintenance dates
    const machine = await Machine.findByPk(schedule.machine_id);
    if (!machine) {
      return res.status(404).json({ message: 'Associated machine not found' });
    }

    await machine.update({
      last_maintenance_date: completionDate,
      next_maintenance_date: nextDueDate,
    });

    res.json(schedule);
  } catch (error) {
    console.error('Error completing maintenance schedule:', error);
    if (error instanceof ValidationError) {
      res.status(400).json({ message: 'Validation error', details: error.errors.map(e => e.message) });
    } else {
      res.status(500).json({ message: 'Internal server error', details: (error as Error).message });
    }
  }
});

export default router;