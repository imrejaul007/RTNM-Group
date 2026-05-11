# RTNM-Group

**Company:** RTNM-Group  
**Purpose:** Controls + Admin Panels  
**GitHub:** https://github.com/imrejaul007/RTNM-Group

---

## Services (17)

### Admin Panels
| Service | Description |
|---------|-------------|
| REE-Admin | Admin control panel |
| REE-Dashboard | Admin dashboard |
| REE-Monitoring | System monitoring |
| REZ-Admin-REE-Dashboard | Combined admin dashboard |
| REZ-admin-dashboard | Admin dashboard UI |
| rez-admin-service | Admin API service |
| rez-admin-training-panel | Admin training |
| rez-loyalty-admin | Loyalty admin panel |

### Identity & Security
| Service | Description |
|---------|-------------|
| REZ-identity-service | Identity management |

### Finance Services
| Service | Description |
|---------|-------------|
| REZ-capital-service | Capital financing |
| REZ-bnpl-service | Buy Now Pay Later |
| rez-payment-links-service | Payment links |

### Operations
| Service | Description |
|---------|-------------|
| REZ-ops-dashboard | Operations dashboard |

### Documentation
| Service | Description |
|---------|-------------|
| SOT | Source of Truth documentation |
| shared-types | Shared TypeScript types |
| rez-api-docs | API documentation |

---

## Architecture

```
RTNM-Group (Controls)
├── Admin Panels → Admin interface
├── Identity → User authentication
├── Finance → Payments, BNPL, Capital
├── Ops → Operations monitoring
└── Docs → SOT, API docs, shared-types
```

---

## Dependencies

- RABTUL-Technologies (Auth, Payment, Gateway)
- REZ-Intelligence (AI services)

---

## Deployment

- Render: Admin services
- Vercel: Admin dashboards

---

## Last Updated

May 11, 2026
