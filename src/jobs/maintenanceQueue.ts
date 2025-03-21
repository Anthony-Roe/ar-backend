import Queue from 'bull';
import Machine from '../models/Machine';
import WorkOrder from '../models/WorkOrder';
import { Op } from 'sequelize';

// Create a Bull queue
const maintenanceQueue = new Queue('maintenance-scheduling', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379')
  }
});

// Process jobs to check for upcoming maintenance
maintenanceQueue.process(async () => {
  try {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    // Find machines that need maintenance in the next week
    const machines = await Machine.findAll({
      where: {
        next_maintenance_date: {
          [Op.between]: [today, nextWeek]
        }
      }
    });

    // Create work orders for machines that need maintenance
    for (const machine of machines) {
      // Check if there's already an open work order for this machine
      const existingWorkOrder = await WorkOrder.findOne({
        where: {
          machine_id: machine.machine_id,
          status: {
            [Op.in]: ['pending', 'in_progress']
          }
        }
      });

      if (!existingWorkOrder) {
        await WorkOrder.create({
          title: `Scheduled Maintenance for ${machine.name}`,
          description: `Regular scheduled maintenance for machine ${machine.name} (Serial: ${machine.serial_number})`,
          status: 'pending',
          machine_id: machine.machine_id,
          plant_id: machine.plant_id,
          priority: 'medium',
          due_date: machine.next_maintenance_date
        });
        
        console.log(`Created maintenance work order for machine ${machine.name}`);
      }
    }

    return { processed: machines.length };
  } catch (error) {
    console.error('Error processing maintenance queue:', error);
    throw error;
  }
});

// Schedule the job to run daily
maintenanceQueue.add(
  {},
  {
    repeat: {
      cron: '0 0 * * *' // Run at midnight every day
    }
  }
);

export default maintenanceQueue;
