/**
 * ReZ Admin Service
 * Admin dashboard and management API
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://rez.money'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Types
interface AdminUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'super_admin' | 'admin' | 'support';
  permissions: string[];
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress: string;
  timestamp: Date;
}

// In-memory storage
const adminUsers: Map<string, AdminUser> = new Map();
const auditLogs: AuditLog[] = [];

// RABTUL: Use centralized auth service
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'https://rez-auth-service.onrender.com';
const INTERNAL_SERVICE_TOKEN = process.env.INTERNAL_SERVICE_TOKEN || '';
const JWT_EXPIRES_IN = '24h';

// Helper functions
const generateToken = async (user: AdminUser): Promise<string> => {
  // For admin users, we still generate JWT locally since admins are managed separately
  // But we verify against RABTUL for user tokens
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'dev-secret-change-in-production',
    { expiresIn: JWT_EXPIRES_IN }
  );
  return token;
};

const verifyToken = async (req: Request): Promise<{ userId: string; email: string; role: string } | null> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;

  try {
    const token = authHeader.substring(7);
    // RABTUL: Verify token via auth service
    const response = await fetch(`${AUTH_SERVICE_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Token': INTERNAL_SERVICE_TOKEN,
      },
      body: JSON.stringify({ token }),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.user) {
        return { userId: result.user.id, email: result.user.email || '', role: result.user.role || 'user' };
      }
    }
    // Fallback to local verification if RABTUL is unavailable
    return jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-in-production') as { userId: string; email: string; role: string };
  } catch {
    return null;
  }
};

const requireAuth = (req: Request, res: Response, next: express.NextFunction) => {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  (req as Request & { user: typeof user }).user = user;
  next();
};

const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: express.NextFunction) => {
    const user = (req as Request & { user: { role: string } }).user;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    next();
  };
};

const logAudit = (userId: string, action: string, resource: string, resourceId: string | undefined, details: Record<string, unknown> | undefined, ipAddress: string) => {
  auditLogs.push({
    id: uuidv4(),
    userId,
    action,
    resource,
    resourceId,
    details,
    ipAddress,
    timestamp: new Date()
  });
};

// Routes

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'admin-service',
    timestamp: new Date().toISOString(),
    version: '1.0'
  });
});

// Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  const user = Array.from(adminUsers.values()).find(u => u.email === email && u.isActive);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  user.lastLogin = new Date();
  adminUsers.set(user.id, user);

  logAudit(user.id, 'login', 'auth', undefined, undefined, req.ip || 'unknown');

  res.json({
    success: true,
    data: {
      token: generateToken(user),
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    }
  });
});

// Register (super_admin only in production)
app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { email, password, name, role = 'support' } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ success: false, error: 'Email, password, and name are required' });
  }

  const existingUser = Array.from(adminUsers.values()).find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({ success: false, error: 'User already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user: AdminUser = {
    id: uuidv4(),
    email,
    passwordHash,
    name,
    role: role as AdminUser['role'],
    permissions: [],
    createdAt: new Date(),
    isActive: true
  };

  adminUsers.set(user.id, user);

  res.status(201).json({
    success: true,
    data: { id: user.id, email: user.email, name: user.name, role: user.role }
  });
});

// Get current user
app.get('/api/auth/me', requireAuth, (req: Request, res: Response) => {
  const { userId } = (req as Request & { user: { userId: string } }).user;
  const user = adminUsers.get(userId);

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  res.json({
    success: true,
    data: { id: user.id, email: user.email, name: user.name, role: user.role }
  });
});

// List users (admin only)
app.get('/api/users', requireAuth, requireRole(['super_admin', 'admin']), (req: Request, res: Response) => {
  const users = Array.from(adminUsers.values()).map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    isActive: u.isActive,
    createdAt: u.createdAt,
    lastLogin: u.lastLogin
  }));

  res.json({ success: true, data: users });
});

// Get audit logs (admin only)
app.get('/api/audit-logs', requireAuth, requireRole(['super_admin', 'admin']), (req: Request, res: Response) => {
  const { limit = 100, offset = 0, userId } = req.query;

  let logs = [...auditLogs].reverse();
  if (userId) {
    logs = logs.filter(l => l.userId === userId);
  }

  const paginatedLogs = logs.slice(Number(offset), Number(offset) + Number(limit));

  res.json({
    success: true,
    data: {
      logs: paginatedLogs,
      total: logs.length,
      limit: Number(limit),
      offset: Number(offset)
    }
  });
});

// Deactivate user (super_admin only)
app.put('/api/users/:id/deactivate', requireAuth, requireRole(['super_admin']), (req: Request, res: Response) => {
  const user = adminUsers.get(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  user.isActive = false;
  adminUsers.set(user.id, user);

  logAudit((req as Request & { user: { userId: string } }).user.userId, 'deactivate_user', 'user', user.id, undefined, req.ip || 'unknown');

  res.json({ success: true, message: 'User deactivated' });
});

// System stats (admin only)
app.get('/api/stats', requireAuth, requireRole(['super_admin', 'admin']), (req: Request, res: Response) => {
  const activeUsers = Array.from(adminUsers.values()).filter(u => u.isActive).length;

  res.json({
    success: true,
    data: {
      totalUsers: adminUsers.size,
      activeUsers,
      totalAuditLogs: auditLogs.length,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }
  });
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: express.NextFunction) => {
  console.error('Error:', err);
  logAudit('system', 'error', 'error', undefined, { message: err.message }, req.ip || 'unknown');
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Database connection (optional)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rez_admin';

const startServer = () => {
  const PORT = process.env.PORT || 4003;

  if (process.env.MONGODB_URI) {
    mongoose.connect(MONGODB_URI)
      .then(() => console.log('Connected to MongoDB'))
      .catch((err) => console.warn('MongoDB connection failed:', err.message));
  }

  app.listen(PORT, () => {
    console.log(`Admin service running on port ${PORT}`);
  });
};

// Create default admin user for development
const createDefaultAdmin = async () => {
  if (adminUsers.size === 0) {
    const passwordHash = await bcrypt.hash('admin123', 12);
    const defaultAdmin: AdminUser = {
      id: uuidv4(),
      email: 'admin@rez.money',
      passwordHash,
      name: 'Default Admin',
      role: 'super_admin',
      permissions: ['*'],
      createdAt: new Date(),
      isActive: true
    };
    adminUsers.set(defaultAdmin.id, defaultAdmin);
    console.log('Default admin created: admin@rez.money / admin123');
  }
};

startServer().then(() => createDefaultAdmin());

export default app;
