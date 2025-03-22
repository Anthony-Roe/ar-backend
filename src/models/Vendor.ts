import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import Inventory from './Inventory';

// Define the attributes for the Vendor model
interface VendorAttributes {
  vendor_id: number;
  name: string;
  contact_email: string;
  contact_phone: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

// Define the attributes for creating a new Vendor
interface VendorCreationAttributes extends Optional<VendorAttributes, 'vendor_id' | 'created_at' | 'updated_at' | 'deleted_at'> {}

// Define the Vendor model class
class Vendor extends Model<VendorAttributes, VendorCreationAttributes> implements VendorAttributes {
  public vendor_id!: number;
  public name!: string;
  public contact_email!: string;
  public contact_phone!: string;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date | null;

  // Associations
  public readonly inventory?: Inventory[];
}

Vendor.init(
  {
    vendor_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Vendor name cannot be empty' },
      },
    },
    contact_email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        isEmail: { msg: 'Invalid email format' },
      },
    },
    contact_phone: {
      type: DataTypes.STRING(15),
      allowNull: false,
      validate: {
        is: { args: [/^\+?[0-9]{7,15}$/], msg: 'Invalid phone number format' },
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
    modelName: 'Vendor',
    tableName: 'vendors',
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);


export default Vendor;