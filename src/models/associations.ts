import User from './User';
import Plant from './Plant';
import Vendor from './Vendor';
import Inventory from './Inventory';
import Machine from './Machine';
import WorkOrder from './WorkOrder';
import WorkOrderPart from './WorkOrderPart';
import WorkOrderLabor from './WorkOrderLabor';
import MaintenanceSchedule from './MaintenanceSchedule';
import Call from './Call';

// User associations
User.belongsTo(Plant, {
  foreignKey: 'plant_id',
  as: 'assignedPlant',
  onDelete: 'SET NULL',
});

Plant.hasMany(User, {
  foreignKey: 'plant_id',
  as: 'plantUsers',
  onDelete: 'SET NULL',
});

// Work Order associations
WorkOrder.belongsTo(Machine, {
  foreignKey: 'machine_id',
  as: 'relatedMachine',
  onDelete: 'SET NULL',
});

Machine.hasMany(WorkOrder, {
  foreignKey: 'machine_id',
  as: 'machineWorkOrders',
  onDelete: 'SET NULL',
});

WorkOrder.belongsTo(Plant, {
  foreignKey: 'plant_id',
  as: 'workOrderPlant',
  onDelete: 'SET NULL',
});

Plant.hasMany(WorkOrder, {
  foreignKey: 'plant_id',
  as: 'plantWorkOrders',
  onDelete: 'SET NULL',
});

WorkOrder.belongsTo(User, {
  foreignKey: 'assigned_to',
  as: 'assignedTechnician',
  onDelete: 'SET NULL',
});

User.hasMany(WorkOrder, {
  foreignKey: 'assigned_to',
  as: 'assignedWorkOrders',
  onDelete: 'SET NULL',
});

// Call associations
Call.belongsTo(Machine, {
  foreignKey: 'machine_id',
  as: 'reportedMachine',
  onDelete: 'SET NULL',
});

Machine.hasMany(Call, {
  foreignKey: 'machine_id',
  as: 'machineCalls',
  onDelete: 'SET NULL',
});

Call.belongsTo(WorkOrder, {
  foreignKey: 'work_order_id',
  as: 'relatedWorkOrder',
  onDelete: 'SET NULL',
});

WorkOrder.hasMany(Call, {
  foreignKey: 'work_order_id',
  as: 'workOrderCalls',
  onDelete: 'SET NULL',
});

Call.belongsTo(User, {
  foreignKey: 'reporter_id',
  as: 'callReporter',
  onDelete: 'SET NULL',
});

User.hasMany(Call, {
  foreignKey: 'reporter_id',
  as: 'reportedCalls',
  onDelete: 'SET NULL',
});

// Work Order Parts associations
WorkOrderPart.belongsTo(WorkOrder, {
  foreignKey: 'work_order_id',
  as: 'parentWorkOrder',
  onDelete: 'CASCADE',
});

WorkOrder.hasMany(WorkOrderPart, {
  foreignKey: 'work_order_id',
  as: 'workOrderParts',
  onDelete: 'CASCADE',
});

WorkOrderPart.belongsTo(Inventory, {
  foreignKey: 'inventory_id',
  as: 'partInventory',
  onDelete: 'CASCADE',
});

Inventory.hasMany(WorkOrderPart, {
  foreignKey: 'inventory_id',
  as: 'usedInWorkOrders',
  onDelete: 'CASCADE',
});

// Work Order Labor associations
WorkOrderLabor.belongsTo(WorkOrder, {
  foreignKey: 'work_order_id',
  as: 'laborWorkOrder',
  onDelete: 'CASCADE',
});

WorkOrder.hasMany(WorkOrderLabor, {
  foreignKey: 'work_order_id',
  as: 'workOrderLabor',
  onDelete: 'CASCADE',
});

WorkOrderLabor.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'laborTechnician',
  onDelete: 'CASCADE',
});

User.hasMany(WorkOrderLabor, {
  foreignKey: 'user_id',
  as: 'laborRecords',
  onDelete: 'CASCADE',
});

// Maintenance Schedule associations
MaintenanceSchedule.belongsTo(Machine, {
  foreignKey: 'machine_id',
  as: 'scheduledMachine',
  onDelete: 'CASCADE',
});

Machine.hasMany(MaintenanceSchedule, {
  foreignKey: 'machine_id',
  as: 'maintenanceSchedules',
  onDelete: 'CASCADE',
});

// Inventory associations
Inventory.belongsTo(Plant, {
  foreignKey: 'plant_id',
  as: 'inventoryPlant',
  onDelete: 'SET NULL',
});

Plant.hasMany(Inventory, {
  foreignKey: 'plant_id',
  as: 'plantInventory',
  onDelete: 'SET NULL',
});

Inventory.belongsTo(Vendor, {
  foreignKey: 'vendor_id',
  as: 'inventoryVendor',
  onDelete: 'SET NULL',
});

Vendor.hasMany(Inventory, {
  foreignKey: 'vendor_id',
  as: 'vendorInventory',
  onDelete: 'SET NULL',
});

// Machine associations
Machine.belongsTo(Plant, {
  foreignKey: 'plant_id',
  as: 'machinePlant',
  onDelete: 'SET NULL',
});

Plant.hasMany(Machine, {
  foreignKey: 'plant_id',
  as: 'plantMachines',
  onDelete: 'SET NULL',
});

export {
  User,
  Plant,
  Vendor,
  Inventory,
  Machine,
  WorkOrder,
  WorkOrderPart,
  WorkOrderLabor,
  MaintenanceSchedule,
  Call,
};