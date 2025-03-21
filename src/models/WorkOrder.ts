import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import Machine from './Machine';
import Plant from './Plant';
import User from './User';
import WorkOrderPart from './WorkOrderPart';
import WorkOrderLabor from './WorkOrderLabor';
import Inventory from './Inventory';

interface WorkOrderAttributes {
  work_order_id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  machine_id: number;
  plant_id: number;
  assigned_to: number | null;
  due_date: Date | null;
  completed_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

interface WorkOrderCreationAttributes extends Optional<WorkOrderAttributes, 'work_order_id' | 'assigned_to' | 'due_date' | 'completed_date' | 'created_at' | 'updated_at'> {}

class WorkOrder extends Model<WorkOrderAttributes, WorkOrderCreationAttributes> implements WorkOrderAttributes {
  public work_order_id!: number;
  public title!: string;
  public description!: string;
  public status!: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  public priority!: 'low' | 'medium' | 'high' | 'critical';
  public machine_id!: number;
  public plant_id!: number;
  public assigned_to!: number | null;
  public due_date!: Date | null;
  public completed_date!: Date | null;
  public created_at!: Date;
  public updated_at!: Date;
}

WorkOrder.init(
  {
    work_order_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull: false,
      defaultValue: 'medium',
    },
    machine_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    plant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    assigned_to: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completed_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'work_orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// Define associations
WorkOrder.belongsTo(Machine, { foreignKey: 'machine_id' });
WorkOrder.belongsTo(Plant, { foreignKey: 'plant_id' });
WorkOrder.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });
WorkOrder.hasMany(WorkOrderPart, { foreignKey: 'work_order_id' });
WorkOrder.hasMany(WorkOrderLabor, { foreignKey: 'work_order_id' });

// Through associations for easier querying
WorkOrder.belongsToMany(Inventory, { 
  through: WorkOrderPart,
  foreignKey: 'work_order_id',
  otherKey: 'inventory_id'
});

WorkOrder.belongsToMany(User, {
  through: WorkOrderLabor,
  foreignKey: 'work_order_id',
  otherKey: 'user_id',
  as: 'laborers'
});

export default WorkOrder;
