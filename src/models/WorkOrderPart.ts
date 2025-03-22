import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import WorkOrder from './WorkOrder';
import Inventory from './Inventory';

// Define the attributes for the WorkOrderPart model
interface WorkOrderPartAttributes {
  work_order_part_id: number;
  work_order_id: number;
  inventory_id: number;
  quantity_used: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

// Define the attributes for creating a new WorkOrderPart
interface WorkOrderPartCreationAttributes extends Optional<WorkOrderPartAttributes, 'work_order_part_id' | 'created_at' | 'updated_at' | 'deleted_at'> {}

// Define the WorkOrderPart model class
class WorkOrderPart extends Model<WorkOrderPartAttributes, WorkOrderPartCreationAttributes> implements WorkOrderPartAttributes {
  public work_order_part_id!: number;
  public work_order_id!: number;
  public inventory_id!: number;
  public quantity_used!: number;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date | null;

  // Associations
  public readonly workOrder?: WorkOrder;
  public readonly inventory?: Inventory;
}

WorkOrderPart.init(
  {
    work_order_part_id: {
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
    inventory_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'inventory',
        key: 'inventory_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    quantity_used: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      validate: {
        min: { args: [0.0001], msg: 'Quantity used must be greater than 0' },
      },
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
    modelName: 'WorkOrderPart',
    tableName: 'work_order_parts',
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

export default WorkOrderPart;