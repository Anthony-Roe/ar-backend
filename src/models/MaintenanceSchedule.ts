import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import Machine from './Machine'; // Ensure this import is correct and the Machine model exists

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
}

interface MaintenanceScheduleCreationAttributes extends Optional<MaintenanceScheduleAttributes, 'schedule_id' | 'last_completed' | 'created_at' | 'updated_at'> {}

class MaintenanceSchedule extends Model<MaintenanceScheduleAttributes, MaintenanceScheduleCreationAttributes> implements MaintenanceScheduleAttributes {
  public schedule_id!: number;
  public machine_id!: number;
  public name!: string;
  public description!: string;
  public frequency_days!: number;
  public last_completed!: Date | null;
  public next_due!: Date;
  public created_at!: Date;
  public updated_at!: Date;
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
        model: 'machines', // Ensure the table name matches the Machine model
        key: 'machine_id',
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
    frequency_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
  },
  {
    sequelize,
    tableName: 'maintenance_schedules',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// Define associations
MaintenanceSchedule.belongsTo(Machine, { foreignKey: 'machine_id' });
Machine.hasMany(MaintenanceSchedule, { foreignKey: 'machine_id' });

export default MaintenanceSchedule;
