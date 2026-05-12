# SOT - MASTER INDEX - MAY 12, 2026

**Version:** 7.0  
**Status:** COMPLETE + NEW FEATURES

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
│ │
│ IDENTITY CLOUD │
│ Auth │ Access Control │ Identity │ Trust │
│ │
│ PAYMENTS CLOUD │
│ Wallet │ Ledger │ Settlements │ BNPL │ Capital │
│ │
│ DATA CLOUD │
│ Feature Store │ ML Pipeline │ Data Platform │ CDP │
│ │
│ INTELLIGENCE CLOUD │
│ Intent Graph │ Attribution │ Recommendation │ Personalization │
│ │
│ CONSUMER INTELLIGENCE │
│ REZ-Scan │ REZ-Expense │ REZ-Assistant │ REZ-Save │
│ │
│ ENGAGEMENT CLOUD │
│ Loyalty │ Offers │ Gamification │ Referrals │
│ │
│ AD CLOUD │
│ AdBazaar │ DOOH │ Creator Network │
│ │
│ QR ECOSYSTEM │
│ Verify QR │ AdQR │ Shelf QR │ Creator QR │ Menu QR │ Room QR │
│ │
│ INDUSTRY OS │
│ Restaurant │ Hotel │ Salon │ Fitness │
│ │
│ TRUST CLOUD │
│ Fraud │ Risk │ AML │ Compliance │ REZ-Trust │
│ │
│ OPERATIONS │
│ Workflow │ Incidents │ Secrets │ Developer Platform │
│ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## REZ-Consumer (Consumer Apps)

### NEW Intelligence Services

| Service | Purpose | Integrations |
|---------|---------|--------------|
| **REZ-scan** | Universal QR Scanner | Intent-Graph, verify-qr |
| **REZ-expense** | Receipt Scanner | Analytics, Merchant |
| **REZ-assistant** | Consumer AI Chat | REZ-Mind, Intent-Graph |
| **REZ-save** | Wishlist | Intelligence, Agent |
| **REZ-inbox** | Email Import | Analytics |
| **REZ-nearby** | Classifieds | Intelligence |
| **REZ-bills** | Smart Receipt Scanner | Wallet, verify-qr |

### Existing Apps

| Service | Purpose |
|---------|---------|
| verify-qr-service | Product warranty |
| rez-now | Instant commerce |
| rez-web-menu | Restaurant menu |
| Rendez | Consumer app |
| do-app | AI assistant |
| rez-karma-app | Karma giving |

### Mobile Apps

| App | Purpose |
|-----|---------|
| REZ-scan-ui | QR scanning |
| REZ-expense-ui | Receipt capture |
| REZ-assistant-ui | AI chat |
| REZ-save-ui | Wishlists |

---

## RTNM-Group (Controls + Financial)

### NEW Trust Services

| Service | Purpose | Integrations |
|---------|---------|--------------|
| **REZ-trust-service** | Trust/Reputation | BNPL, Fraud, verify-qr |
| **REZ-trust-admin** | Trust Dashboard | All services |

### Existing Services

| Service | Purpose |
|---------|---------|
| REZ-access-control-service | RBAC/ABAC |
| REZ-compliance-platform | GDPR, DPDP |
| REZ-financial-ledger-platform | Revenue, Settlements |
| REZ-identity-service | Identity |
| REZ-central-permissions | Central RBAC/ABAC |
| REZ-bnpl-service | Buy Now Pay Later |
| REZ-capital-service | Capital financing |

---

## REZ-Intelligence (AI/ML Platform)

### Core AI

| Service | Purpose |
|---------|---------|
| REZ-MIND | Core AI brain |
| REZ-action-engine | Action execution |
| REZ-agent-orchestrator | Multi-agent coordination |

### Intelligence

| Service | Purpose |
|---------|---------|
| REZ-intent-graph | User intent tracking |
| REZ-consumer-graph | Unified consumer identity |
| REZ-merchant-360 | Unified merchant identity |
| REZ-personalization-engine | Personalization |
| REZ-recommendation-engine | Recommendations |

### Data

| Service | Purpose |
|---------|---------|
| REZ-data-platform | Data lake |
| REZ-stream-processing | Kafka streaming |
| REZ-cdp-service | Customer Data Platform |
| REZ-feature-store | ML features |

### Analytics

| Service | Purpose |
|---------|---------|
| REZ-analytics-orchestrator | Cross-platform analytics |
| REZ-attribution-system | Attribution tracking |
| REZ-ab-testing-service | A/B testing |
| **REZ-attribution-platform** | Offline attribution |

---

## REZ-Media (Engagement)

### NEW Growth Services

| Service | Purpose | Integrations |
|---------|---------|--------------|
| **REZ-attribution-platform** | Offline attribution | scan, payments |
| **REZ-referral-graph** | AI referral network | wallet, intelligence |
| **REZ-attribution-dashboard** | Attribution dashboard | - |
| **REZ-referral-dashboard** | Referral dashboard | - |

### Existing Services

| Service | Purpose |
|---------|---------|
| REZ-ads-service | Ads API |
| REZ-ad-ai | AI optimization |
| AdBazaar | Ad marketplace |
| adsqr | QR ads |

---

## QR ECOSYSTEM

| QR Type | Company | Service | Purpose |
|---------|---------|---------|---------|
| Verify Product | REZ-Consumer | verify-qr-service | Product warranty |
| AdQR | REZ-Media | adsqr | Ad campaigns |
| Shelf QR | REZ-Media | rez-shelf-qr | Product scanning |
| Creator QR | REZ-Media | creators | Influencer links |
| Menu QR | REZ-Consumer | rez-web-menu | Restaurant menu |
| Room QR | StayOwn | verify-service | Hotel access |

---

## DATA MOAT LAYERS

### What We Now Track

| Layer | Data | Service |
|-------|------|---------|
| **Online Intent** | Searches, views, clicks | REZ-assistant |
| **Offline Behavior** | Store visits, QR scans | REZ-scan |
| **External Spend** | Receipts, invoices | REZ-expense |
| **Future Intent** | Wishlists, saves | REZ-save |
| **Travel Plans** | Email imports | REZ-inbox |
| **Trust Scores** | User/Merchant reputation | REZ-trust-service |
| **Ownership** | Product warranty | verify-qr-service |

---

## SERVICE COUNTS

| Company | Services | Apps |
|---------|----------|------|
| RTNM-Group | 20+ | 1 |
| RABTUL-Technologies | 24+ | - |
| REZ-Intelligence | 51+ | - |
| REZ-Media | 25+ | 3 |
| REZ-Merchant | 10+ | 2 |
| REZ-Consumer | 15+ | 6 |
| StayOwn-Hospitality | 7+ | 1 |
| CorpPerks | 6+ | 1 |
| RTNM-Digital | 2+ | - |

**TOTAL: 160+ Services**

---

## INTEGRATION MATRIX

```
REZ-Consumer Services ───→ REZ-Intelligence
├── REZ-scan ───→ Intent Graph
├── REZ-expense ───→ Analytics
├── REZ-assistant ───→ REZ-Mind
├── REZ-save ───→ Intelligence
└── verify-qr ───→ Merchant

RTNM-Group ───→ REZ-Trust
├── REZ-bnpl ───→ Trust scores
├── REZ-capital ───→ Credit scoring
└── verify-qr ───→ Ownership
```

---

## ENVIRONMENT VARIABLES TEMPLATE

```env
# REZ-Consumer
INTENT_API=https://rez-intent-graph.onrender.com
VERIFY_API=https://rez-verify-qr.onrender.com
AGENT_API=https://REZ-agent.onrender.com
ANALYTICS_API=https://rez-analytics.onrender.com
MIND_API=https://REZ-mind.onrender.com

# RTNM-Group
TRUST_API=https://rez-trust.onrender.com
```

---

## LAST UPDATED

May 12, 2026
