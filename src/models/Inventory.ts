import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface InventoryAttributes {
  inventory_id: number;
  plant_id: number | null;
  vendor_id: number | null;
  name: string;
  description: string;
  quantity: number;
  unit_price: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

interface InventoryCreationAttributes extends Optional<InventoryAttributes, 'inventory_id' | 'created_at' | 'updated_at' | 'deleted_at'> {}

class Inventory extends Model<InventoryAttributes, InventoryCreationAttributes> implements InventoryAttributes {
  public inventory_id!: number;
  public plant_id!: number | null;
  public vendor_id!: number | null;
  public name!: string;
  public description!: string;
  public quantity!: number;
  public unit_price!: number;
  public created_at!: Date;
  public updated_at!: Date;
  public deleted_at!: Date | null;
}

Inventory.init(
  {
    inventory_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    plant_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'plants',
        key: 'plant_id',
      },
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'vendors',
        key: 'vendor_id',
      },
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0,
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
    tableName: 'inventory',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true, // Enable soft deletes
  }
);

export default Inventory;