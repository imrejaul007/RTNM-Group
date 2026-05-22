# RidZa Platform - Source of Truth

## Overview

**RidZa** = AI-Powered Digital Financial Marketplace
- Like PolicyBazaar + Paisabazaar + Insurance vertical
- Powered by REZ ecosystem (RABTUL services, Signals, Fraud)
- Commission-based revenue

---

## Services (13 Total)

| Service | Port | Purpose | RABTUL |
|---------|------|---------|---------|
| ridza-core | 4500 | Lead engine, matching | Auth, Wallet |
| ridza-ai-search | 4505 | NL search | Signals |
| ridza-partner-api | 4501 | Partner API | Payment |
| ridza-agent-portal | 4502 | Agent CRM | Auth, Notify |
| ridza-provider-api | 4506 | Provider portal | Auth |
| ridza-corpperks-hub | 4503 | CorpPerks | Wallet, Notify |
| ridza-compliance | 4507 | Consent, audit, PII vault | Auth |
| ridza-events | 4508 | Event bus | - |
| ridza-workflow | 4509 | State machine | - |
| ridza-fraud | 4510 | Fraud detection | Fraud Agent |
| ridza-merchant-finance | 4511 | Merchant capital | Signals |
| ridza-finance-intelligence | 4512 | Credit scoring | Signals, Loyalty |
| ridza-insurance | 4520 | Insurance | Auth, Payment, Notify |

---

## RABTUL Services Used

| RABTUL Service | Port | Usage |
|----------------|------|-------|
| Auth Service | 4002 | JWT/OTP verification |
| Payment Service | 4001 | Premium collection |
| Wallet Service | 4004 | Coin rewards, balance |
| Notify Service | 4011 | SMS/WhatsApp/Email |
| Signal Aggregator | 4142 | User behavior signals |
| Fraud Agent | 3007 | Risk scoring |

---

## Insurance Products (15+)

### Types
Health, Life, Term, Car, Bike, Travel, Home, Gadget, Pet, Critical Illness, Accident, Child Education

### Insurers
LIC India, SBI Life, HDFC Life, ICICI Lombard, Bajaj Allianz, TATA AIG, Star Health, Niva Bupa, Acko

---

## Environment Variables

```bash
AUTH_SERVICE_URL=http://localhost:4002
PAYMENT_SERVICE_URL=http://localhost:4001
WALLET_SERVICE_URL=http://localhost:4004
NOTIFICATION_SERVICE_URL=http://localhost:4011
REZ_SIGNAL_AGGREGATOR_URL=http://localhost:4142
INTERNAL_SERVICE_TOKEN=your-token
```

---

## Quick Start

```bash
git clone git@github.com:imrejaul007/RidZa.git
cd RidZa
cp .env.example .env
make docker-up
```

## Docs
- Architecture: ARCHITECTURE.md
- Deployment: docs/DEPLOYMENT.md
- API: ridza-core/src/config/swagger.ts

Last Updated: May 22, 2026
