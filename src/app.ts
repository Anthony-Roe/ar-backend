import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import passport from './config/passport';

// Import routes
import plantRoutes from './routes/plant.routes';
import vendorRoutes from './routes/vendor.routes';
import inventoryRoutes from './routes/inventory.routes';
import machineRoutes from './routes/machine.routes';
import workOrderRoutes from './routes/workOrder.routes';
import workOrderPartsRoutes from './routes/workOrderParts.routes';
import workOrderLaborRoutes from './routes/workOrderLabor.routes';
import callsRouter from './routes/calls.routes';
import authRoutes from './routes/auth.routes';
import reportRoutes from './routes/reports.routes';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import cors from 'cors';

// Import maintenance queue
//import './jobs/maintenanceQueue';

// Load environment variables
dotenv.config();

console.log('JWT_SECRET:', process.env.JWT_SECRET);

// Initialize express app
const app = express();

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000', // Replace with the frontend's origin
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));

// Add Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
console.log('Swagger docs available at http://localhost:5000/api-docs');

// Initialize passport
app.use(passport.initialize());

// Routes
app.use('/api', plantRoutes);
app.use('/api', vendorRoutes);
app.use('/api', inventoryRoutes);
app.use('/api', machineRoutes);
app.use('/api', callsRouter);
app.use('/api', workOrderRoutes);
app.use('/api', workOrderPartsRoutes);
app.use('/api', workOrderLaborRoutes);
//app.use('/api', maintenanceScheduleRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', reportRoutes);

// Custom error interface
interface ApiError extends Error {
  statusCode?: number;
}

// Error handler middleware
app.use((err: ApiError, req: express.Request, res: express.Response) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler - place this before error handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});
export default app;
