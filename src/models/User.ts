import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import Plant from './Plant';
import WorkOrder from './WorkOrder';
import WorkOrderLabor from './WorkOrderLabor';
import Call from './Call';

// Define the attributes for the User model
interface UserAttributes {
  user_id: number;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'technician' | 'manager';
  plant_id: number | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

// Define the attributes for creating a new User
interface UserCreationAttributes extends Optional<UserAttributes, 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'> {}

// Define the User model class
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public user_id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public role!: 'admin' | 'technician' | 'manager';
  public plant_id!: number | null;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date | null;

  // Associations
  public readonly plant?: Plant;
  public readonly workOrders?: WorkOrder[];
  public readonly workOrderLabor?: WorkOrderLabor[];
  public readonly calls?: Call[];
}

User.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'Username cannot be empty' },
      },
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: 'Invalid email format' },
      },
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Password cannot be empty' },
      },
    },
    role: {
      type: DataTypes.ENUM('admin', 'technician', 'manager'),
      allowNull: false,
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
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);


export default User;