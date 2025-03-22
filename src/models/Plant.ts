import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import Machine from './Machine';
import User from './User';
import Inventory from './Inventory';
import WorkOrder from './WorkOrder';

// Define the attributes for the Plant model
interface PlantAttributes {
  plant_id: number;
  name: string;
  location: string;
  contact_email: string;
  contact_phone: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

// Define the attributes for creating a new Plant
interface PlantCreationAttributes extends Optional<PlantAttributes, 'plant_id' | 'created_at' | 'updated_at' | 'deleted_at'> {}

// Define the Plant model class
class Plant extends Model<PlantAttributes, PlantCreationAttributes> implements PlantAttributes {
  public plant_id!: number;
  public name!: string;
  public location!: string;
  public contact_email!: string;
  public contact_phone!: string;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date | null;

  // Associations
  public readonly machines?: Machine[];
  public readonly users?: User[];
  public readonly inventory?: Inventory[];
  public readonly workOrders?: WorkOrder[];
}

Plant.init(
  {
    plant_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Plant name cannot be empty' },
      },
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Location cannot be empty' },
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
    modelName: 'Plant',
    tableName: 'plants',
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);


export default Plant;