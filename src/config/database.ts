import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'ar_db',
  process.env.DB_USER || 'ar_master',
  process.env.DB_PASSWORD || 'pass',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: false, // Disable logging; set to console.log for debugging
  }
);

export default sequelize;
