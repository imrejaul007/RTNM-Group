# REZ QR ECOSYSTEM - COMPLETE DOCUMENTATION

**Date:** May 11, 2026  
**Status:** COMPLETE

---

## 6 QR SYSTEMS

| QR Type | Company | Repo | Service |
|---------|---------|------|---------|
| **Verify QR** | RTNM-Group | RTNM-Group | verify-service |
| **ReZ Now QR** | REZ-Consumer | REZ-Consumer | rez-now |
| **Menu QR** | REZ-Consumer | REZ-Consumer | rez-web-menu |
| **Creator QR** | REZ-Media | REZ-Media | adsqr |
| **Room QR** | StayOwn | StayOwn | verify-service |
| **Shelf QR** | REZ-Media | REZ-Media | adsqr (shelf module) |

---

## QR SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│ REZ QR ECOSYSTEM │
├─────────────────────────────────────────────────────────────┤
│ │
│ VERIFY QR ────────── RTNM-Group ─── Product verification │
│ │
│ SCAN QR ────────── REZ-Consumer ─── Shopping experience │
│ ├── ReZ Now QR ──────────── Instant commerce │
│ └── Menu QR ────────────── Restaurant menu │
│ │
│ ENGAGE QR ────────── REZ-Media ───── Marketing │
│ ├── AdQR ──────────────── Ad campaigns │
│ └── Shelf QR ──────────── Product discovery │
│ │
│ ROOM QR ─────────── StayOwn ────── Hospitality │
│ └── Hotel room QR ──────── Smart room access │
│ │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. VERIFY QR (RTNM-Group)

**Purpose:** Product/service verification and authenticity

**Use Cases:**
- Product authenticity check
- Service verification
- Document verification
- License validation

**Tech Stack:** Node.js, QR scanner

**Endpoints:**
```
/verify/:qr_code
/verify/batch
/report-fake/:product_id
```

**Database:** MongoDB (verifications collection)

---

## 2. ReZ Now QR (REZ-Consumer)

**Purpose:** Instant commerce - scan QR → buy instantly

**Use Cases:**
- Scan product QR → Add to cart
- Social commerce
- Quick purchase
- Affiliate links
- Campaign tracking

**Tech Stack:** Next.js, Vercel

**Flow:**
```
QR Scan → Product Lookup → Add to Cart → Payment → Confirmation
```

**URL:** https://rez-now.vercel.app

---

## 3. Menu QR (REZ-Consumer)

**Purpose:** Digital restaurant/hotel menu

**Use Cases:**
- Restaurant menu browsing
- Hotel room service
- Salon service list
- Cafe menu

**Tech Stack:** Next.js, Vercel

**Flow:**
```
QR Scan → Menu Display → Order → Payment
```

**URL:** https://rez-now.vercel.app/menu

---

## 4. AdQR / Creator QR (REZ-Media)

**Purpose:** Marketing campaigns and product discovery

**Use Cases:**
- Ad campaign tracking
- Attribution tracking
- Creator links
- Affiliate marketing
- Product discovery

**Tech Stack:** Node.js, Render

**Features:**
- Campaign attribution
- Creator tracking
- Conversion analytics
- A/B testing

**URL:** https://adsqr.vercel.app

---

## 5. Shelf QR (REZ-Media)

**Purpose:** In-store product discovery

**Use Cases:**
- Shelf product scanning
- Price comparison
- Reviews/ratings
- Add to cart

**Tech Stack:** Node.js, Render

**Flow:**
```
Shelf QR Scan → Product Details → Reviews → Add to Cart
```

---

## 6. Room QR (StayOwn-Hospitality)

**Purpose:** Smart hotel room access

**Use Cases:**
- Room key replacement
- Digital check-in
- Service requests
- Checkout

**Tech Stack:** Node.js, Render

**Flow:**
```
QR Scan → Room Unlock → Service Request
```

---

## QR CODE FORMATS

### URL Structure
```
https://rez.app/verify/{code}          # Verify QR
https://rez.app/scan/{product_id}       # ReZ Now QR
https://rez.app/menu/{location_id}      # Menu QR
https://rez.app/campaign/{campaign_id}    # AdQR
https://rez.app/room/{room_id}           # Room QR
```

### QR Content Types
| Type | Content | Example |
|------|----------|---------|
| Product | Product ID | `rez:product:SKU123` |
| Menu | Location ID | `rez:menu:loc456` |
| Campaign | Campaign ID | `rez:campaign:camp789` |
| Room | Room ID | `rez:room:room101` |
| Verify | Code | `rez:verify:ABC123` |

---

## DATA FLOW

```
QR CODE SCAN
     │
     ▼
QR READER APP/WEB
     │
     ▼
QR SERVICE (identify type)
     │
     ├─→ Verify Service ─→ Verification Result
     │
     ├─→ ReZ Now ─→ Product Lookup ─→ Cart ─→ Checkout
     │
     ├─→ Menu QR ─→ Menu API ─→ Display Menu
     │
     ├─→ AdQR ─→ Campaign Attribution ─→ Analytics
     │
     └─→ Room QR ─→ Hotel API ─→ Room Control
```

---

## ANALYTICS TRACKED

| Metric | QR Type |
|--------|---------|
| Scans | All QR types |
| Conversions | AdQR, ReZ Now |
| Revenue | ReZ Now, Menu QR |
| Attribution | AdQR |
| Engagement | All QR types |
| Location data | Menu QR, Room QR |

---

## CAMPAIGN EXAMPLES

### AdQR Campaign
```
QR Code → Campaign Landing → Product → Purchase → Attribution Report
```

### ReZ Now Campaign
```
QR on Product → Instant Purchase → Confirmation → Social Share
```

### Menu Campaign
```
QR at Restaurant → Menu → Order → Review
```

---

## TECHNICAL SPECS

### QR Generation
```typescript
interface QRPayload {
  type: 'product' | 'menu' | 'campaign' | 'room' | 'verify';
  id: string;
  metadata?: Record<string, any>;
}
```

### QR Scanner Integration
```typescript
interface ScanEvent {
  qr_type: string;
  qr_id: string;
  user_id?: string;
  location?: GeoLocation;
  device_info: DeviceInfo;
  timestamp: string;
}
```

---

## LAST UPDATED

May 11, 2026

## SEE ALSO

- [REZ-Consumer/README.md](../REZ-Consumer/README.md)
- [REZ-Media/README.md](../REZ-Media/README.md)
- [StayOwn-Hospitality/README.md](../StayOwn-Hospitality/README.md)
- [RTNM-Group/README.md](../RTNM-Group/README.md)

## QR SERVICES - FINAL MAPPING (Updated)

| QR Type | Company | Service | Purpose |
|---------|---------|---------|---------|
| Verify Product QR | REZ-Consumer | verify-qr-service | Product warranty |
| Room QR | StayOwn | verify-service | Hotel room access |
| ReZ Now QR | REZ-Consumer | rez-now | Instant commerce |
| Menu QR | REZ-Consumer | rez-web-menu | Restaurant menu |
| AdQR | REZ-Media | adsqr | Ad campaigns |
| Shelf QR | REZ-Media | rez-shelf-qr | Product scanning |
| Creator QR | REZ-Media | creators | Influencer links |

### Note
- RTNM-Group handles internal admin only (warranty rules, merchant verification API)
- REZ-Consumer handles client-facing (warranty activation, claims, dashboard)
