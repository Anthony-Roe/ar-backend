import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface InventoryAttributes {
  inventory_id: number;
  name: string;
  part_number: string;
  quantity: number;
  unit_cost: number;
  plant_id: number;
  vendor_id: number;
  created_at: Date;
  updated_at: Date;
}

interface InventoryCreationAttributes extends Optional<InventoryAttributes, 'inventory_id' | 'created_at' | 'updated_at'> {}

class Inventory extends Model<InventoryAttributes, InventoryCreationAttributes> implements InventoryAttributes {
  public inventory_id!: number;
  public name!: string;
  public part_number!: string;
  public quantity!: number;
  public unit_cost!: number;
  public plant_id!: number;
  public vendor_id!: number;
  public created_at!: Date;
  public updated_at!: Date;
}

Inventory.init(
  {
    inventory_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    part_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    unit_cost: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        min: 0,
      },
    },
    plant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'plants', // Table name
        key: 'plant_id',
      },
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'vendors', // Table name
        key: 'vendor_id',
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
  },
  {
    sequelize,
    tableName: 'inventory',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Inventory;