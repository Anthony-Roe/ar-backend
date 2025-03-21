import express from 'express';
import MaintenanceSchedule from '../models/MaintenanceSchedule';
import Machine from '../models/Machine';
import passport from 'passport';

const router = express.Router();

// Middleware to check authentication
const authenticate = passport.authenticate('jwt', { session: false });

// Get all maintenance schedules
router.get('/maintenance-schedules', authenticate, async (req: express.Request, res: express.Response): Promise<any> => {
  try {
    const schedules = await MaintenanceSchedule.findAll({
      include: [Machine]
    });
    
    res.json(schedules);
  } catch (error) {
    console.error('Error fetching maintenance schedules:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get maintenance schedules for a specific machine
router.get('/machines/:machineId/maintenance-schedules', authenticate, async (req: express.Request, res: express.Response): Promise<any> => {
  try {
    const machineId = parseInt(req.params.machineId);
    
    const schedules = await MaintenanceSchedule.findAll({
      where: { machine_id: machineId },
      include: [Machine]
    });
    
    res.json(schedules);
  } catch (error) {
    console.error('Error fetching machine maintenance schedules:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new maintenance schedule
router.post('/maintenance-schedules', authenticate, async (req: express.Request, res: express.Response): Promise<any> => {
  try {
    const { machine_id, name, description, frequency_days, next_due } = req.body;
    
    // Check if machine exists
    const machine = await Machine.findByPk(machine_id);
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }
    
    const schedule = await MaintenanceSchedule.create({
      machine_id,
      name,
      description,
      frequency_days,
      next_due: new Date(next_due)
    });
    
    res.status(201).json(schedule);
  } catch (error) {
    console.error('Error creating maintenance schedule:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update a maintenance schedule
router.put('/maintenance-schedules/:id', authenticate, async (req: express.Request, res: express.Response): Promise<any> => {
  try {
    const scheduleId = parseInt(req.params.id);
    const { name, description, frequency_days, next_due } = req.body;
    
    const schedule = await MaintenanceSchedule.findByPk(scheduleId);
    
    if (!schedule) {
      return res.status(404).json({ message: 'Maintenance schedule not found' });
    }
    
    await schedule.update({
      name,
      description,
      frequency_days,
      next_due: new Date(next_due)
    });
    
    res.json(schedule);
  } catch (error) {
    console.error('Error updating maintenance schedule:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a maintenance schedule
router.delete('/maintenance-schedules/:id', authenticate, async (req: express.Request, res: express.Response): Promise<any> => {
  try {
    const scheduleId = parseInt(req.params.id);
    
    const schedule = await MaintenanceSchedule.findByPk(scheduleId);
    
    if (!schedule) {
      return res.status(404).json({ message: 'Maintenance schedule not found' });
    }
    
    await schedule.destroy();
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting maintenance schedule:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark a maintenance schedule as completed
router.post('/maintenance-schedules/:id/complete', authenticate, async (req: express.Request, res: express.Response): Promise<any> => {
  try {
    const scheduleId = parseInt(req.params.id);
    const { completion_date = new Date() } = req.body;
    
    const schedule = await MaintenanceSchedule.findByPk(scheduleId, {
      include: [Machine]
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
      next_due: nextDueDate
    });
    
    // Update the machine's last and next maintenance dates
    const machine = await Machine.findByPk(schedule.machine_id);
    if (!machine) {
      return res.status(404).json({ message: 'Associated machine not found' });
    }

    await machine.update({
      last_maintenance_date: completionDate,
      next_maintenance_date: nextDueDate
    });
    
    res.json(schedule);
  } catch (error) {
    console.error('Error completing maintenance schedule:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
