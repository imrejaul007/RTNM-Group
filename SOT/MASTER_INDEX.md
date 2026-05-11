# SOT - MASTER INDEX - MAY 11, 2026

**Version:** 5.0  
**Status:** COMPLETE PLATFORM BUILD

---

## 9 COMPANY REPOS

| # | Company | Purpose | GitHub |
|---|---------|---------|--------|
| 1 | **RTNM-Group** | Controls + Financial | imrejaul007/RTNM-Group |
| 2 | **RABTUL-Technologies** | Infrastructure | imrejaul007/RABTUL-Technologies |
| 3 | **REZ-Intelligence** | AI/ML Platform | imrejaul007/REZ-Intelligence |
| 4 | **REZ-Media** | Engagement | imrejaul007/REZ-Media |
| 5 | **REZ-Merchant** | Industry OS | imrejaul007/REZ-Merchant |
| 6 | **REZ-Consumer** | Consumer Apps | imrejaul007/REZ-Consumer |
| 7 | **StayOwn-Hospitality** | Hotels | imrejaul007/StayOwn-Hospitality |
| 8 | **CorpPerks** | Enterprise | imrejaul007/CorpPerks |
| 9 | **RTNM-Digital** | Trust + Operations | imrejaul007/RTNM-Digital |

---

## PLATFORM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────┐
│ REZ COMMERCE OS │
├─────────────────────────────────────────────────────────────────────┤
│ IDENTITY CLOUD │ Auth │ Access Control │ Identity │
│ PAYMENTS CLOUD │ Wallet │ Ledger │ Settlements │
│ DATA CLOUD │ Feature Store │ ML │ AI │
│ ENGAGEMENT CLOUD │ Loyalty │ Offers │ Gamification │
│ INTELLIGENCE CLOUD │ Intent │ Attribution │ Rec │
│ INDUSTRY OS │ Restaurant │ Hotel │ Salon │ Fitness │
│ TRUST CLOUD │ Fraud │ Risk │ Compliance │
│ OPERATIONS │ Workflow │ Incidents │ Secrets │
└─────────────────────────────────────────────────────────────────────┘
```

---

## RTNM-Group (Controls + Financial)

| Service | Purpose |
|---------|---------|
| REZ-access-control-service | RBAC/ABAC |
| REZ-compliance-platform | GDPR, DPDP, Audit |
| REZ-financial-ledger-platform | Revenue, Payouts, Settlements |

---

## RABTUL-Technologies (Infrastructure)

| Service | Purpose |
|---------|---------|
| REZ-workflow-engine | Business process orchestration |
| REZ-observability-platform | Logs, Metrics, Alerts |
| REZ-secrets-manager | API keys, Encryption |
| REZ-developer-platform | SDKs, Webhooks, Sandbox |
| api-gateway | API routing |
| rez-auth-service | JWT, OAuth, MFA |
| rez-payment-service | Razorpay, Stripe |
| rez-wallet-service | Digital wallet |
| rez-order-service | Order management |
| rez-catalog-service | Product catalog |
| rez-search-service | Search |
| rez-analytics-service | Analytics |
| REZ-circuit-breaker | Resilience |
| REZ-retry-service | BullMQ retry |
| REZ-dlq-service | Dead letter queue |

---

## REZ-Intelligence (AI/ML Platform)

| Service | Purpose |
|---------|---------|
| **DATA PLATFORM** | |
| REZ-feature-store | Centralized ML features |
| REZ-data-platform | Lake, Warehouse, ETL |
| REZ-stream-processing | Kafka streaming |
| REZ-cdp-service | Customer Data Platform |
| REZ-data-governance | Lineage, Catalog |
| REZ-dataquality-service | Data validation |
| REZ-etl-service | ETL pipelines |
| REZ-metrics-store | Time-series metrics |
| REZ-bi-platform | Business Intelligence |
| **AI SERVICES** | |
| REZ-real-time-decision-engine | Unified decision brain |
| REZ-experimentation-platform | A/B testing |
| rez-ml-engine | ML training |
| rez-ml-feature-store | Feature management |
| REZ-intent-graph | User intent |
| REZ-attribution-system | Attribution |
| REZ-recommendation-engine | Recommendations |
| REZ-personalization-engine | Personalization |
| REZ-targeting-engine | Ad targeting |
| rez-consumer-copilot | Shopping AI |
| REZ-support-copilot | Support AI |

---

## REZ-Media (Engagement)

| Service | Purpose |
|---------|---------|
| REZ-engagement-platform | Loyalty + Offers + Gamification |
| REZ-discovery-platform | Search, Ranking, Recommendations |
| REZ-communications-platform | Email, SMS, WhatsApp, Push |
| adBazaar | Ad marketplace |
| adsqr | QR code ads |
| dooh | Digital screens |
| REZ-gamification-service | Points, Badges |

---

## RTNM-Digital (Trust + Operations)

| Service | Purpose |
|---------|---------|
| REZ-trust-platform | Fraud, Risk, AML |
| REZ-ops-center | Escalations, Refunds, Disputes |
| REZ-incident-management | On-call, Runbooks |

### REZ-trust-platform Modules
- fraud-engine
- risk-scorer
- AML monitor
- abuse-detector
- merchant-risk-engine
- account-trust-score

### REZ-ops-center Modules
- incident-manager
- escalation-manager
- fraud-review-queue
- refund-queue
- dispute-manager
- internal-tickets

---

## INDUSTRY VERTICALS

### REZ-Merchant (Restaurant, Hotel, Salon, Fitness)
- Merchant Dashboard
- POS systems
- KDS
- Inventory management
- CRM
- Loyalty modules

### StayOwn-Hospitality (Hotels)
- Hotel OTA
- Habixo (vacation rentals)
- Channel Manager

---

## DEPLOYMENT

| Platform | Services | Apps |
|----------|----------|------|
| Render | 198+ | Backend services |
| Vercel | 28+ | Web apps |
| MongoDB Atlas | Primary DB | - |
| Redis Cloud | Cache, Queues | - |

---

## SECURITY

| Component | Status |
|-----------|--------|
| JWT Auth | Implemented |
| Admin Lockout | Implemented |
| Rate Limiting | Implemented |
| Helmet.js | Implemented |
| CORS | Configured |
| Secrets Manager | Built |

---

## LAST UPDATED

May 11, 2026

## NEXT STEPS

1. Deploy to Render
2. Deploy to Vercel
3. Rotate API keys
4. Test webhooks
5. Verify MongoDB backups
6. Verify Redis Sentinel
