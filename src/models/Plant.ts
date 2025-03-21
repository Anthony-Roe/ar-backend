import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface PlantAttributes {
  plant_id: number;
  name: string;
  location: string;
  contact_email: string;
  contact_phone: string;
  created_at: Date;
  updated_at: Date;
}

interface PlantCreationAttributes extends Optional<PlantAttributes, 'plant_id' | 'created_at' | 'updated_at'> {}

class Plant extends Model<PlantAttributes, PlantCreationAttributes> implements PlantAttributes {
  public plant_id!: number;
  public name!: string;
  public location!: string;
  public contact_email!: string;
  public contact_phone!: string;
  public created_at!: Date;
  public updated_at!: Date;
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
    },
    location: {
      type: DataTypes.STRING(255),
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
    tableName: 'plants',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Plant;