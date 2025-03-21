import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface VendorAttributes {
  vendor_id: number;
  name: string;
  contact_email: string;
  contact_phone: string;
  created_at: Date;
  updated_at: Date;
}

interface VendorCreationAttributes extends Optional<VendorAttributes, 'vendor_id' | 'created_at' | 'updated_at'> {}

class Vendor extends Model<VendorAttributes, VendorCreationAttributes> implements VendorAttributes {
  public vendor_id!: number;
  public name!: string;
  public contact_email!: string;
  public contact_phone!: string;
  public created_at!: Date;
  public updated_at!: Date;
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
    },
    contact_email: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    contact_phone: {
      type: DataTypes.STRING(15),
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
    tableName: 'vendors',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Vendor;