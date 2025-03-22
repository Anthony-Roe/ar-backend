import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import WorkOrder from './WorkOrder';
import User from './User';

// Define the attributes for the WorkOrderLabor model
interface WorkOrderLaborAttributes {
  work_order_labor_id: number;
  work_order_id: number;
  user_id: number;
  hours_worked: number;
  labor_date: Date;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

// Define the attributes for creating a new WorkOrderLabor
interface WorkOrderLaborCreationAttributes extends Optional<WorkOrderLaborAttributes, 'work_order_labor_id' | 'created_at' | 'updated_at' | 'deleted_at'> {}

// Define the WorkOrderLabor model class
class WorkOrderLabor extends Model<WorkOrderLaborAttributes, WorkOrderLaborCreationAttributes> implements WorkOrderLaborAttributes {
  public work_order_labor_id!: number;
  public work_order_id!: number;
  public user_id!: number;
  public hours_worked!: number;
  public labor_date!: Date;
  public notes!: string | null;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date | null;

  // Associations
  public readonly workOrder?: WorkOrder;
  public readonly user?: User;
}

WorkOrderLabor.init(
  {
    work_order_labor_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    work_order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'work_orders',
        key: 'work_order_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    hours_worked: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      validate: {
        min: { args: [0], msg: 'Hours worked cannot be negative' },
      },
    },
    labor_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
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
    modelName: 'WorkOrderLabor',
    tableName: 'work_order_labor',
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);


export default WorkOrderLabor;