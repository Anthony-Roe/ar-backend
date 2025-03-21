import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface WorkOrderPartAttributes {
  work_order_part_id: number;
  work_order_id: number;
  inventory_id: number;
  quantity_used: number;
  created_at: Date;
  updated_at: Date;
}

interface WorkOrderPartCreationAttributes extends Optional<WorkOrderPartAttributes, 'work_order_part_id' | 'created_at' | 'updated_at'> {}

class WorkOrderPart extends Model<WorkOrderPartAttributes, WorkOrderPartCreationAttributes> implements WorkOrderPartAttributes {
  public work_order_part_id!: number;
  public work_order_id!: number;
  public inventory_id!: number;
  public quantity_used!: number;
  public created_at!: Date;
  public updated_at!: Date;
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
    },
    inventory_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity_used: {
      type: DataTypes.FLOAT,
      allowNull: false,
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
    tableName: 'work_order_parts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// Define associations after all models are initialized
// These will be set up in a separate associations file

export default WorkOrderPart;