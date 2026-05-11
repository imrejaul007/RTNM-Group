# ReZ Admin Service

Admin dashboard and management API for ReZ platform.

## Features

- JWT-based authentication
- Role-based access control (super_admin, admin, support)
- User management
- Audit logging
- System statistics

## Quick Start

```bash
# Install dependencies
npm install

# Run in development
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 4003 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/rez_admin |
| JWT_SECRET | JWT signing secret | dev-secret-change-in-production |
| ALLOWED_ORIGINS | CORS allowed origins | https://rez.money |

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current user

### Users (admin only)

- `GET /api/users` - List all users
- `PUT /api/users/:id/deactivate` - Deactivate user

### Audit Logs (admin only)

- `GET /api/audit-logs` - Get audit logs

### System

- `GET /api/stats` - Get system statistics
- `GET /health` - Service health check

## Default Admin

For development, a default admin user is created:

- Email: `admin@rez.money`
- Password: `admin123`

**Change this password in production!**

## Development

```bash
# Type check
npm run typecheck

# Run tests
npm test
```
