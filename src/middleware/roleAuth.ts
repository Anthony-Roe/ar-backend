import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
  user?: {
    user_id: number;
    email: string;
    role: string;
  };
}

export const authorize = (roles: string[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;

    // Extract the JWT token from cookies
    const token = req.cookies?.jwt;

    if (!token) {
      res.status(401).json({ message: 'Unauthorized: No token provided' });
      return;
    }

    try {
      // Verify and decode the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
        user_id: number;
        email: string;
        role: string;
      };

      // Attach the decoded user to the request object
      authReq.user = decoded;

      // Check if the user's role is included in the allowed roles
      if (!roles.includes(decoded.role)) {
        res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }

      // Proceed to the next middleware or route handler
      next();
    } catch (err) {
      console.error('Error verifying token:', err);
      res.status(401).json({ message: 'Unauthorized: Invalid token' });
      return;
    }
  };
};
