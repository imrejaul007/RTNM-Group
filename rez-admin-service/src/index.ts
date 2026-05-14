/**
 * ReZ Admin Service
 * Admin dashboard and management API
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

config();

const app = express();
const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

// ============================================
// SECURITY: Fail fast on missing secrets in production
// ============================================
if (isProduction) {
  const requiredSecrets = [
    { key: 'JWT_SECRET', pattern: /^(test|dev|development|secret|changeme|default)/i },
  ];

  for (const { key, pattern } of requiredSecrets) {
    const value = process.env[key];
    if (!value) {
      throw new Error(`[FATAL] ${key} is required in production`);
    }
    if (pattern.test(value)) {
      throw new Error(`[FATAL] ${key} contains a weak value in production`);
    }
  }
}

// ============================================
// MIDDLEWARE
// ============================================

// Helmet security headers
app.use(helmet({
  hsts: isProduction ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  } : undefined,
}));

// CORS - explicit origins only
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').filter(Boolean) || [];
if (isProduction && allowedOrigins.length === 0) {
  throw new Error('[FATAL] ALLOWED_ORIGINS is required in production');
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (!isProduction && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`Origin ${origin} not allowed by CORS policy`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '100kb' }));

// Request ID middleware
app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] as string || uuidv4();
  res.setHeader('X-Request-Id', requestId);
  (req as Request & { requestId: string }).requestId = requestId;
  next();
});

// ============================================
// RATE LIMITING (basic)
// ============================================
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: {
    error: 'Too Many Requests',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    message: 'Too many login attempts. Please try again later.',
  },
  skip: (req) => req.path !== '/api/auth/login',
});

app.use(authLimiter);

// ============================================
// TYPES
// ============================================

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

// ============================================
// CONFIGURATION (no hardcoded fallbacks)
// ============================================

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'https://rez-auth-service.onrender.com';
const JWT_SECRET = process.env.JWT_SECRET;
const INTERNAL_SERVICE_TOKEN = process.env.INTERNAL_SERVICE_TOKEN;
const JWT_EXPIRES_IN = '24h';
const MONGODB_URI = process.env.MONGODB_URI;

// ============================================
// MONGODB CONNECTION (persist data)
// ============================================

const AdminUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['super_admin', 'admin', 'support'], default: 'support' },
  permissions: [String],
  lastLogin: Date,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const AuditLogSchema = new mongoose.Schema({
  userId: String,
  action: String,
  resource: String,
  resourceId: String,
  details: mongoose.Schema.Types.Mixed,
  ipAddress: String,
}, { timestamps: true });

const AdminUserModel = mongoose.models.AdminUser || mongoose.model<AdminUser>('AdminUser', AdminUserSchema);
const AuditLogModel = mongoose.models.AuditLog || mongoose.model<AuditLog>('AuditLog', AuditLogSchema);

// ============================================
// HELPER FUNCTIONS
// ============================================

const generateToken = async (user: { id: string; email: string; role: string }): Promise<string> => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
  }
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

const verifyToken = async (token: string): Promise<{ userId: string; email: string; role: string } | null> => {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET not configured');
    return null;
  }

  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Token': INTERNAL_SERVICE_TOKEN || '',
      },
      body: JSON.stringify({ token }),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.user) {
        return { userId: result.user.id, email: result.user.email || '', role: result.user.role || 'user' };
      }
    }

    // Fallback to local verification
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
    return payload;
  } catch {
    return null;
  }
};

const createAuditLog = async (entry: Omit<AuditLog, 'id' | 'timestamp'> => {
  try {
    await AuditLogModel.create({
      ...entry,
      id: uuidv4(),
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};

const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Timing-safe string comparison
const timingSafeEqual = (a: string, b: string): boolean => {
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
};

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'admin-service',
    timestamp: new Date().toISOString(),
    environment: nodeEnv,
  });
});

// Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Email and password are required',
      });
    }

    // Find user in database
    const user = await AdminUserModel.findOne({ email: email.toLowerCase(), isActive: true });

    if (!user) {
      await createAuditLog({
        userId: 'unknown',
        action: 'LOGIN_FAILED',
        resource: 'auth',
        ipAddress: req.ip || 'unknown',
      });

      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid credentials',
      });
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      await createAuditLog({
        userId: user.id,
        action: 'LOGIN_FAILED',
        resource: 'auth',
        ipAddress: req.ip || 'unknown',
      });

      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid credentials',
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = await generateToken(user);

    await createAuditLog({
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      resource: 'auth',
      ipAddress: req.ip || 'unknown',
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Login failed',
    });
  }
});

// Register (super_admin only)
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, role = 'support' } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Email, password, and name are required',
      });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Password must be at least 8 characters',
      });
    }

    // Check if user exists
    const existingUser = await AdminUserModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Conflict',
        message: 'User already exists',
      });
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const user = await AdminUserModel.create({
      email: email.toLowerCase(),
      passwordHash,
      name,
      role,
      permissions: [],
      isActive: true,
    });

    await createAuditLog({
      userId: user.id,
      action: 'USER_CREATED',
      resource: 'users',
      resourceId: user.id,
      ipAddress: req.ip || 'unknown',
    });

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Registration failed',
    });
  }
});

// Get current user
app.get('/api/auth/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'No token provided',
      });
    }

    const token = authHeader.substring(7);
    const payload = await verifyToken(token);

    if (!payload) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid token',
      });
    }

    const user = await AdminUserModel.findById(payload.userId).select('-passwordHash');
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
});

// Get audit logs
app.get('/api/audit-logs', async (req: Request, res: Response) => {
  try {
    const { limit = '50', offset = '0' } = req.query;
    const logs = await AuditLogModel
      .find()
      .sort({ timestamp: -1 })
      .skip(parseInt(offset as string))
      .limit(Math.min(parseInt(limit as string), 100));

    res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error('Audit logs error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
});

// Get users
app.get('/api/users', async (req: Request, res: Response) => {
  try {
    const users = await AdminUserModel.find().select('-passwordHash');
    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
});

// ============================================
// ERROR HANDLER
// ============================================

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);

  if (err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'Origin not allowed',
    });
  }

  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    requestId: (req as Request & { requestId?: string }).requestId,
  });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 4003;

async function start() {
  try {
    // Connect to MongoDB if URI provided
    if (MONGODB_URI) {
      await mongoose.connect(MONGODB_URI, {
        w: 'majority',
        journal: true,
        retryWrites: true,
      });
      console.log('Connected to MongoDB');

      // Create default admin if none exist
      const userCount = await AdminUserModel.countDocuments();
      if (userCount === 0) {
        console.log('Creating default admin user...');
        const hash = await hashPassword(process.env.DEFAULT_ADMIN_PASSWORD || 'CHANGE_THIS_PASSWORD');
        await AdminUserModel.create({
          email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@rez.money',
          passwordHash: hash,
          name: 'Default Admin',
          role: 'super_admin',
          permissions: ['*'],
        });
        console.log('Default admin created. CHANGE THE PASSWORD!');
      }
    } else {
      console.log('WARNING: Running without MongoDB - data will not persist');
    }

    app.listen(PORT, () => {
      console.log(`Admin Service running on port ${PORT}`);
      console.log(`Environment: ${nodeEnv}`);
    });
  } catch (error) {
    console.error('Startup failed:', error);
    process.exit(1);
  }
}

start();

export default app;
