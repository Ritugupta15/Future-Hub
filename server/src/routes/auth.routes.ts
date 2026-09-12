import { Router, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res: Response): Promise<void> => {
  try {
    const { email, password, name, year, department, education, experience_level } = req.body;
    const result = await AuthService.register({ email, password, name, year, department, education, experience_level });
    
    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      user: result.user,
      token: result.token
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Registration failed.'
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      user: result.user,
      token: result.token
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message || 'Login failed.'
    });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res: Response): void => {
  // Stateless JWT logout is handled on client by discarding token
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Unauthorized.' });
    return;
  }

  const user = AuthService.getUserById(req.user.id);
  if (!user) {
    res.status(404).json({ success: false, error: 'User not found.' });
    return;
  }

  res.status(200).json({
    success: true,
    user
  });
});

export default router;
