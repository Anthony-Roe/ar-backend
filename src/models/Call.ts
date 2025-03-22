import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import Machine from './Machine';
import WorkOrder from './WorkOrder';
import User from './User';

// Define the attributes for the Call model
interface CallAttributes {
  call_id: number;
  shift: 1 | 2 | 3;
  line: string;
  machine_id: number | null;
  issue: string;
  resolution: string | null;
  reported_at: Date;
  completed_at: Date | null;
  work_order_id: number | null;
  reporter_id: number | null;
  status: 'reported' | 'assigned' | 'in_progress' | 'completed';
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

// Define the attributes for creating a new Call
interface CallCreationAttributes extends Optional<CallAttributes, 'call_id' | 'reported_at' | 'completed_at' | 'created_at' | 'updated_at' | 'deleted_at'> {}

// Define the Call model class
class Call extends Model<CallAttributes, CallCreationAttributes> implements CallAttributes {
  public call_id!: number;
  public shift!: 1 | 2 | 3;
  public line!: string;
  public machine_id!: number | null;
  public issue!: string;
  public resolution!: string | null;
  public reported_at!: Date;
  public completed_at!: Date | null;
  public work_order_id!: number | null;
  public reporter_id!: number | null;
  public status!: 'reported' | 'assigned' | 'in_progress' | 'completed';

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date | null;

  // Associations
  public readonly machine?: Machine;
  public readonly workOrder?: WorkOrder;
  public readonly reporter?: User;
}

Call.init(
  {
    call_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    shift: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isIn: [[1, 2, 3]], // Matches CHECK (shift IN (1, 2, 3))
      },
    },
    line: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Line cannot be empty' },
      },
    },
    machine_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'machines',
        key: 'machine_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    issue: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Issue cannot be empty' },
      },
    },
    resolution: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reported_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    work_order_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'work_orders',
        key: 'work_order_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    reporter_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'user_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    status: {
      type: DataTypes.ENUM('reported', 'assigned', 'in_progress', 'completed'),
      allowNull: false,
      defaultValue: 'reported',
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
    modelName: 'Call',
    tableName: 'calls',
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

export default Call;