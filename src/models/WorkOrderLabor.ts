import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface WorkOrderLaborAttributes {
  work_order_labor_id: number;
  work_order_id: number;
  user_id: number;
  hours_worked: number;
  labor_date: Date;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

interface WorkOrderLaborCreationAttributes extends Optional<WorkOrderLaborAttributes, 'work_order_labor_id' | 'notes' | 'created_at' | 'updated_at'> {}

class WorkOrderLabor extends Model<WorkOrderLaborAttributes, WorkOrderLaborCreationAttributes> implements WorkOrderLaborAttributes {
  public work_order_labor_id!: number;
  public work_order_id!: number;
  public user_id!: number;
  public hours_worked!: number;
  public labor_date!: Date;
  public notes!: string | null;
  public created_at!: Date;
  public updated_at!: Date;
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
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    hours_worked: {
      type: DataTypes.FLOAT,
      allowNull: false,
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
  },
  {
    sequelize,
    tableName: 'work_order_labor',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// Define associations after all models are initialized
// These will be set up in a separate associations file

export default WorkOrderLabor;