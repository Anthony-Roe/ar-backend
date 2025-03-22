import sequelize from './database';

// Import all models
import '../models/User';
import '../models/Plant';
import '../models/Vendor';
import '../models/Inventory';
import '../models/Machine';
import '../models/WorkOrder';
import '../models/WorkOrderPart';
import '../models/WorkOrderLabor';
import '../models/MaintenanceSchedule'; // Uncommented

// Import associations to set up relationships between models
import '../models/associations';

const initDb = async () => {
  try {
    // Test the database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync all models with the database
    // Note: In production, use migrations instead of sync
    await sequelize.sync({ alter: true });
    console.log('All models were synchronized successfully.');

    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
};

export default initDb;