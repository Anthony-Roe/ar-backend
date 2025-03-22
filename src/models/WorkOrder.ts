import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import Machine from './Machine';
import Plant from './Plant';
import User from './User';
import WorkOrderLabor from './WorkOrderLabor';
import WorkOrderPart from './WorkOrderPart';
import Call from './Call';

// Define the attributes for the WorkOrder model
interface WorkOrderAttributes {
  work_order_id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  machine_id: number | null;
  plant_id: number | null;
  assigned_to: number | null;
  due_date: Date | null;
  completed_date: Date | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

// Define the attributes for creating a new WorkOrder
interface WorkOrderCreationAttributes extends Optional<WorkOrderAttributes, 'work_order_id' | 'completed_date' | 'created_at' | 'updated_at' | 'deleted_at'> {}

// Define the WorkOrder model class
class WorkOrder extends Model<WorkOrderAttributes, WorkOrderCreationAttributes> implements WorkOrderAttributes {
  public work_order_id!: number;
  public title!: string;
  public description!: string;
  public status!: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  public priority!: 'low' | 'medium' | 'high' | 'critical';
  public machine_id!: number | null;
  public plant_id!: number | null;
  public assigned_to!: number | null;
  public due_date!: Date | null;
  public completed_date!: Date | null;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date | null;

  // Associations
  public readonly machine?: Machine;
  public readonly plant?: Plant;
  public readonly assignedUser?: User;
  public readonly workOrderLabor?: WorkOrderLabor[];
  public readonly workOrderParts?: WorkOrderPart[];
  public readonly calls?: Call[];
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
      validate: {
        notEmpty: { msg: 'Work order title cannot be empty' },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Description cannot be empty' },
      },
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
      allowNull: true,
      references: {
        model: 'machines',
        key: 'machine_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    plant_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'plants',
        key: 'plant_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    assigned_to: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'user_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
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
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'WorkOrder',
    tableName: 'work_orders',
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

export default WorkOrder;