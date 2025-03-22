import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import Machine from './Machine';

// Define the attributes for the MaintenanceSchedule model
interface MaintenanceScheduleAttributes {
  schedule_id: number;
  machine_id: number;
  name: string;
  description: string;
  frequency_days: number;
  last_completed: Date | null;
  next_due: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

// Define the attributes for creating a new MaintenanceSchedule
interface MaintenanceScheduleCreationAttributes extends Optional<MaintenanceScheduleAttributes, 'schedule_id' | 'last_completed' | 'created_at' | 'updated_at' | 'deleted_at'> {}

// Define the MaintenanceSchedule model class
class MaintenanceSchedule extends Model<MaintenanceScheduleAttributes, MaintenanceScheduleCreationAttributes> implements MaintenanceScheduleAttributes {
  public schedule_id!: number;
  public machine_id!: number;
  public name!: string;
  public description!: string;
  public frequency_days!: number;
  public last_completed!: Date | null;
  public next_due!: Date;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date | null;

  // Associations
  public readonly machine?: Machine;
}

MaintenanceSchedule.init(
  {
    schedule_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    machine_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'machines',
        key: 'machine_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Maintenance schedule name cannot be empty' },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Description cannot be empty' },
      },
    },
    frequency_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: { args: [1], msg: 'Frequency days must be greater than 0' },
      },
    },
    last_completed: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    next_due: {
      type: DataTypes.DATE,
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
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'MaintenanceSchedule',
    tableName: 'maintenance_schedules',
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);


export default MaintenanceSchedule;