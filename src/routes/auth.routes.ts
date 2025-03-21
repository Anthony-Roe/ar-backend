import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Op } from 'sequelize';
import User from '../models/User';
import { validateUser } from '../validators/userValidator';

const router = express.Router();

router.post('/register', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { error } = validateUser(req.body);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email: req.body.email }, { username: req.body.username }],
      },
    });

    if (existingUser) {
      res.status(400).json({ message: 'User with this email or username already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      role: req.body.role,
      plant_id: req.body.plant_id,
    });

    const userResponse: Partial<typeof user> = { ...user.get() };
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/login', (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  passport.authenticate('local', { session: false }, (err: Error | null, user: any, info: any) => {
    if (err) {
      console.error('Error during login:', err);
      return next(err);
    }

    if (!user) {
      res.status(401).json({ message: info?.message || 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { id: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ user: { id: user.user_id, email: user.email, role: user.role } });
  })(req, res, next);
});

router.get('/me', (req: express.Request, res: express.Response): void => {
  const token = req.cookies.jwt;

  if (!token) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    res.status(200).json(decoded);
  } catch (err) {
    console.error('Error verifying token:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
});

router.post('/logout', (req: express.Request, res: express.Response): void => {
  try {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Error during logout:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;