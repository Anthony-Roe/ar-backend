import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import WorkOrder from './WorkOrder';
import MaintenanceSchedule from './MaintenanceSchedule';
import Plant from './Plant';

// Define the attributes for the Machine model based on the schema
interface MachineAttributes {
  machine_id: number;
  plant_id: number | null;
  name: string;
  model: string;
  manufacturer: string;
  serial_number: string;
  installation_date: Date | null;
  last_maintenance_date: Date | null;
  next_maintenance_date: Date | null;
  status: 'active' | 'inactive' | 'maintenance';
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

// Define the attributes for creating a new Machine (some fields are optional as they will be auto-generated or nullable)
interface MachineCreationAttributes extends Optional<MachineAttributes, 'machine_id' | 'created_at' | 'updated_at' | 'deleted_at' | 'installation_date' | 'last_maintenance_date' | 'next_maintenance_date'> {}

// Define the Machine model class
class Machine extends Model<MachineAttributes, MachineCreationAttributes> implements MachineAttributes {
  public machine_id!: number;
  public plant_id!: number | null;
  public name!: string;
  public model!: string;
  public manufacturer!: string;
  public serial_number!: string;
  public installation_date!: Date | null;
  public last_maintenance_date!: Date | null;
  public next_maintenance_date!: Date | null;
  public status!: 'active' | 'inactive' | 'maintenance';

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date | null;

  // Associations
  public readonly workOrders?: WorkOrder[];
  public readonly maintenanceSchedules?: MaintenanceSchedule[];
  public readonly plant?: Plant;
}

Machine.init(
  {
    machine_id: {
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
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Machine name cannot be empty' },
      },
    },
    model: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Machine model cannot be empty' },
      },
    },
    manufacturer: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Machine manufacturer cannot be empty' },
      },
    },
    serial_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'Serial number cannot be empty' },
      },
    },
    installation_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    last_maintenance_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    next_maintenance_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'maintenance'),
      allowNull: false,
      defaultValue: 'active',
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
    modelName: 'Machine',
    tableName: 'machines',
    timestamps: true,
    paranoid: true, // Enables soft deletes (deleted_at)
    underscored: true, // Converts camelCase to snake_case for column names
  }
);


export default Machine;