import User from './User';
import Plant from './Plant';
import Vendor from './Vendor';
import Inventory from './Inventory';
import Machine from './Machine';
import WorkOrder from './WorkOrder';
import WorkOrderPart from './WorkOrderPart';
import WorkOrderLabor from './WorkOrderLabor';
import MaintenanceSchedule from './MaintenanceSchedule';

// User associations
User.belongsTo(Plant, { foreignKey: 'plant_id', onDelete: 'CASCADE' });
Plant.hasMany(User, { foreignKey: 'plant_id', onDelete: 'CASCADE' });

// Inventory associations
Inventory.belongsTo(Plant, { foreignKey: 'plant_id', onDelete: 'CASCADE' });
Plant.hasMany(Inventory, { foreignKey: 'plant_id', onDelete: 'CASCADE' });

Inventory.belongsTo(Vendor, { foreignKey: 'vendor_id', onDelete: 'SET NULL' });
Vendor.hasMany(Inventory, { foreignKey: 'vendor_id', onDelete: 'SET NULL' });

// Machine associations
Machine.belongsTo(Plant, { foreignKey: 'plant_id', onDelete: 'CASCADE' });
Plant.hasMany(Machine, { foreignKey: 'plant_id', onDelete: 'CASCADE' });

// Work Order associations
WorkOrder.belongsTo(Machine, { foreignKey: 'machine_id', onDelete: 'CASCADE' });
Machine.hasMany(WorkOrder, { foreignKey: 'machine_id', onDelete: 'CASCADE' });

WorkOrder.belongsTo(Plant, { foreignKey: 'plant_id', onDelete: 'CASCADE' });
Plant.hasMany(WorkOrder, { foreignKey: 'plant_id', onDelete: 'CASCADE' });

WorkOrder.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignedUser', onDelete: 'SET NULL' });
User.hasMany(WorkOrder, { foreignKey: 'assigned_to', as: 'workOrdersAssigned', onDelete: 'SET NULL' });

// Work Order Parts associations
WorkOrderPart.belongsTo(WorkOrder, { foreignKey: 'work_order_id', onDelete: 'CASCADE' });
WorkOrder.hasMany(WorkOrderPart, { foreignKey: 'work_order_id', onDelete: 'CASCADE' });

WorkOrderPart.belongsTo(Inventory, { foreignKey: 'inventory_id', onDelete: 'CASCADE' });
Inventory.hasMany(WorkOrderPart, { foreignKey: 'inventory_id', onDelete: 'CASCADE' });

// Work Order Labor associations
WorkOrderLabor.belongsTo(WorkOrder, { foreignKey: 'work_order_id', onDelete: 'CASCADE' });
WorkOrder.hasMany(WorkOrderLabor, { foreignKey: 'work_order_id', onDelete: 'CASCADE' });

WorkOrderLabor.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
User.hasMany(WorkOrderLabor, { foreignKey: 'user_id', onDelete: 'CASCADE' });

// Maintenance Schedule associations
MaintenanceSchedule.belongsTo(Machine, { foreignKey: 'machine_id', onDelete: 'CASCADE' });
Machine.hasMany(MaintenanceSchedule, { foreignKey: 'machine_id', onDelete: 'CASCADE' });

// Through associations for easier querying
WorkOrder.belongsToMany(Inventory, {
  through: WorkOrderPart,
  foreignKey: 'work_order_id',
  otherKey: 'inventory_id',
  as: 'workOrderInventories', // Changed alias to avoid conflicts
  onDelete: 'CASCADE',
});

Inventory.belongsToMany(WorkOrder, {
  through: WorkOrderPart,
  foreignKey: 'inventory_id',
  otherKey: 'work_order_id',
  as: 'inventoryWorkOrders', // Changed alias to avoid conflicts
  onDelete: 'CASCADE',
});

WorkOrder.belongsToMany(User, {
  through: WorkOrderLabor,
  foreignKey: 'work_order_id',
  otherKey: 'user_id',
  as: 'workOrderLaborers', // Changed alias to avoid conflicts
  onDelete: 'CASCADE',
});

User.belongsToMany(WorkOrder, {
  through: WorkOrderLabor,
  foreignKey: 'user_id',
  otherKey: 'work_order_id',
  as: 'userWorkOrders', // Changed alias to avoid conflicts
  onDelete: 'CASCADE',
});