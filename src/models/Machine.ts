import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface MachineAttributes {
  machine_id: number;
  plant_id: number;
  name: string;
  model: string;
  manufacturer: string;
  serial_number: string;
  installation_date: Date | null;
  last_maintenance_date: Date | null;
  next_maintenance_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

interface MachineCreationAttributes extends Optional<MachineAttributes, 'machine_id' | 'last_maintenance_date' | 'next_maintenance_date' | 'created_at' | 'updated_at'> {}

class Machine extends Model<MachineAttributes, MachineCreationAttributes> implements MachineAttributes {
  public machine_id!: number;
  public plant_id!: number;
  public name!: string;
  public model!: string;
  public manufacturer!: string;
  public serial_number!: string;
  public installation_date!: Date | null;
  public last_maintenance_date!: Date | null;
  public next_maintenance_date!: Date | null;
  public created_at!: Date;
  public updated_at!: Date;
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
      allowNull: false,
      references: {
        model: 'plants', // Ensure the table name matches the Plant model
        key: 'plant_id',
      },
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    manufacturer: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    model: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
    serial_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    last_maintenance_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    installation_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    next_maintenance_date: {
      type: DataTypes.DATE,
      allowNull: true,
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
    tableName: 'machines',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Machine;