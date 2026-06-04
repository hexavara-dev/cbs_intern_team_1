# Cost Control - API Contract

> **Version**: 1.1  
> **Last Updated**: 2026-02-06  
> **Base URL**: `/api`

> ⚠️ **Field Names Match Frontend Types** - Request/Response menggunakan nama field yang sama dengan `src/types/cost.ts`

---

## Daftar Isi

1. [Overview](#1-overview)
2. [Cost Record Endpoints](#2-cost-record-endpoints)
   - [GET /api/projects/:projectId/costs](#21-get-apiprojectsprojectidcosts)
   - [GET /api/projects/:projectId/costs/:recordId](#22-get-apiprojectsprojectidcostsrecordid)
   - [POST /api/projects/:projectId/costs](#23-post-apiprojectsprojectidcosts)
   - [PATCH /api/costs/:recordId/approve](#24-patch-apicostsrecordidapprove)
   - [PATCH /api/costs/:recordId/reject](#25-patch-apicostsrecordidreject)
3. [Master Data Endpoints](#3-master-data-endpoints)
   - [GET /api/vendors](#31-get-apivendors)
   - [GET /api/items/suggestions](#32-get-apiitemssuggestions)
4. [Data Schemas](#4-data-schemas)
5. [Error Handling](#5-error-handling)
6. [Backend Implementation Notes](#6-backend-implementation-notes)
7. [Critical Backend Functions](#7-critical-backend-functions)

---

## 1. Overview

Cost Control mengelola pencatatan pengeluaran proyek dengan workflow approval:

### Approval Workflow

```
┌──────────┐     ┌──────────┐     ┌──────────────┐
│ PENDING  │ ──► │ APPROVED │     │   REJECTED   │
│          │     │(+nota)   │     │              │
└──────────┘     └──────────┘     └──────────────┘
     │                                    ▲
     └────────────────────────────────────┘
```

| Status     | Description          | Requirements          |
| ---------- | -------------------- | --------------------- |
| `pending`  | Menunggu persetujuan | Default saat submit   |
| `approved` | Disetujui            | **WAJIB** upload nota |
| `rejected` | Ditolak              | Opsional alasan       |

### Database Tables

| Table          | Purpose                      |
| -------------- | ---------------------------- |
| `cost_records` | Header transaksi pengeluaran |
| `cost_items`   | Detail item per transaksi    |
| `vendors`      | Master data vendor/supplier  |

---

## 2. Cost Record Endpoints

### 2.1 GET /api/projects/:projectId/costs

Mengambil daftar transaksi pengeluaran.

**Request**

```http
GET /api/projects/PRJ-001/costs
Authorization: Bearer <token>
```

**Query Parameters**

| Parameter   | Type   | Required | Description                       |
| ----------- | ------ | -------- | --------------------------------- |
| `status`    | string | No       | `pending`, `approved`, `rejected` |
| `wbs_id`    | string | No       | Filter by WBS item                |
| `vendor_id` | string | No       | Filter by vendor                  |
| `date_from` | string | No       | ISO date (YYYY-MM-DD)             |
| `date_to`   | string | No       | ISO date (YYYY-MM-DD)             |
| `page`      | number | No       | Page number (default: 1)          |
| `limit`     | number | No       | Items per page (default: 20)      |

**Response (200 OK)**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-cost-1",
      "project_id": "PRJ-001",
      "wbs_item": {
        "id": "uuid-wbs-1-1",
        "wbs_code": "1.1",
        "description": "Galian Tanah"
      },
      "vendor": {
        "id": "uuid-vendor-1",
        "name": "TB. Sejahtera"
      },
      "transaction_date": "2026-02-05",
      "status": "pending",
      "total_amount": 1500000,
      "items_count": 3,
      "submitted_by": {
        "id": "uuid-user-1",
        "full_name": "Ahmad"
      },
      "created_at": "2026-02-05T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "total_pages": 1
  }
}
```

---

### 2.2 GET /api/projects/:projectId/costs/:recordId

Mengambil detail satu transaksi.

**Request**

```http
GET /api/projects/PRJ-001/costs/uuid-cost-1
Authorization: Bearer <token>
```

**Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "id": "uuid-cost-1",
    "project_id": "PRJ-001",
    "wbs_item": {
      "id": "uuid-wbs-1-1",
      "wbs_code": "1.1",
      "description": "Galian Tanah"
    },
    "vendor": {
      "id": "uuid-vendor-1",
      "name": "TB. Sejahtera"
    },
    "transaction_date": "2026-02-05",
    "status": "pending",
    "nota_proof": null,
    "total_amount": 1500000,
    "items": [
      {
        "id": "uuid-item-1",
        "description": "Semen Gresik 40kg",
        "cbs_category": {
          "id": "uuid-cbs-1",
          "name": "Material",
          "cost_type": "Per Item"
        },
        "unit_cost": 55000,
        "quantity": 20,
        "total": 1100000
      },
      {
        "id": "uuid-item-2",
        "description": "Pasir Bangunan",
        "cbs_category": {
          "id": "uuid-cbs-1",
          "name": "Material",
          "cost_type": "Per Item"
        },
        "unit_cost": 200000,
        "quantity": 2,
        "total": 400000
      }
    ],
    "submitted_by": {
      "id": "uuid-user-1",
      "full_name": "Ahmad"
    },
    "approved_by": null,
    "approved_at": null,
    "rejection_reason": null,
    "notes": "Pembelian material untuk galian tanah",
    "created_at": "2026-02-05T10:00:00Z",
    "updated_at": "2026-02-05T10:00:00Z"
  }
}
```

---

### 2.3 POST /api/projects/:projectId/costs

Membuat request pengeluaran baru (status = pending).

**Request**

```http
POST /api/projects/PRJ-001/costs
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body** _(matches `CostOutRecord` type)_

```json
{
  "id": "uuid-cost-2",
  "project_id": "PRJ-001",
  "wbs_id": "1.1",
  "date": "2026-02-05",
  "vendor": "TB. Sejahtera",
  "items": [
    {
      "id": "uuid-item-1",
      "description": "Semen Gresik 40kg",
      "cbs_category": "Material",
      "cost": 55000,
      "quantity": 20,
      "total": 1100000
    },
    {
      "id": "uuid-item-2",
      "description": "Pasir Bangunan",
      "cbs_category": "Material",
      "cost": 200000,
      "quantity": 2,
      "total": 400000
    }
  ],
  "total_amount": 1500000
}
```

**Field Specifications (CostOutRecord)**

| Field          | Type   | Required | Description                |
| -------------- | ------ | -------- | -------------------------- |
| `id`           | string | Yes      | Frontend-generated UUID    |
| `project_id`   | string | Yes      | Project ID                 |
| `wbs_id`       | string | Yes      | WBS code ("1.1", not UUID) |
| `date`         | string | Yes      | ISO date "YYYY-MM-DD"      |
| `vendor`       | string | No       | Nama vendor                |
| `status`       | string | No       | Default: `pending`         |
| `nota_proof`   | string | No       | URL file nota              |
| `items`        | array  | Yes      | Min 1 item                 |
| `total_amount` | number | Yes      | Total semua items          |

**Item Structure (CostItem)**

| Field          | Type   | Required | Description             |
| -------------- | ------ | -------- | ----------------------- |
| `id`           | string | Yes      | Frontend-generated UUID |
| `description`  | string | Yes      | Nama barang/jasa        |
| `cbs_category` | string | No       | Nama CBS category       |
| `cost`         | number | Yes      | Harga satuan            |
| `quantity`     | number | Yes      | Jumlah                  |
| `total`        | number | Yes      | cost × quantity         |

**Response (201 Created)**

```json
{
  "success": true,
  "data": {
    "id": "uuid-cost-2",
    "status": "pending",
    "total_amount": 1500000,
    "items_count": 2,
    "vendor": {
      "id": "uuid-vendor-1",
      "name": "TB. Sejahtera",
      "is_new": false
    },
    "created_at": "2026-02-06T10:00:00Z"
  },
  "message": "Cost request submitted successfully"
}
```

---

### 2.4 PATCH /api/costs/:recordId/approve

Menyetujui request pengeluaran.

**Request**

```http
PATCH /api/costs/uuid-cost-1/approve
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body**

```json
{
  "nota_proof": "https://storage.bucket.com/nota/nota-uuid-cost-1.jpg"
}
```

> ⚠️ **WAJIB**: `nota_proof` harus diisi untuk approval.

**Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "id": "uuid-cost-1",
    "status": "approved",
    "nota_proof": "https://storage.bucket.com/nota/nota-uuid-cost-1.jpg",
    "approved_by": {
      "id": "uuid-user-pm",
      "full_name": "Project Manager"
    },
    "approved_at": "2026-02-06T14:00:00Z"
  },
  "message": "Cost request approved successfully"
}
```

---

### 2.5 PATCH /api/costs/:recordId/reject

Menolak request pengeluaran.

**Request**

```http
PATCH /api/costs/uuid-cost-1/reject
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body**

```json
{
  "reason": "Harga tidak sesuai dengan standar pasar"
}
```

**Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "id": "uuid-cost-1",
    "status": "rejected",
    "rejection_reason": "Harga tidak sesuai dengan standar pasar",
    "updated_at": "2026-02-06T14:00:00Z"
  },
  "message": "Cost request rejected"
}
```

---

## 3. Master Data Endpoints

### 3.1 GET /api/vendors

Mengambil daftar vendor untuk dropdown selection.

**Request**

```http
GET /api/vendors
Authorization: Bearer <token>
```

**Query Parameters**

| Parameter    | Type   | Description      |
| ------------ | ------ | ---------------- |
| `search`     | string | Filter by name   |
| `project_id` | string | Scope to project |

**Response (200 OK)**

```json
{
  "success": true,
  "data": [
    { "id": "uuid-vendor-1", "name": "TB. Sejahtera" },
    { "id": "uuid-vendor-2", "name": "CV. Bangun Jaya" },
    { "id": "uuid-vendor-3", "name": "Toko Material Abadi" }
  ]
}
```

---

### 3.2 GET /api/items/suggestions

Mengambil suggestions untuk deskripsi item (autocomplete).

**Request**

```http
GET /api/items/suggestions?search=semen
Authorization: Bearer <token>
```

**Response (200 OK)**

```json
{
  "success": true,
  "data": [
    { "value": "Semen Gresik 40kg", "label": "Semen Gresik 40kg" },
    { "value": "Semen Tiga Roda 50kg", "label": "Semen Tiga Roda 50kg" },
    { "value": "Semen Holcim 40kg", "label": "Semen Holcim 40kg" }
  ]
}
```

---

## 4. Data Schemas

### CostOutRecord (Frontend Type - Exact Match)

```typescript
// src/types/cost.ts - USE THIS EXACT STRUCTURE
export type CostOutRecord = {
  id: string;
  project_id: string;
  wbs_id: string; // WBS code "1.1", not UUID
  cbs_category?: string; // Optional, per-item now
  date: string; // ISO Date "YYYY-MM-DD"
  vendor?: string; // Nama vendor
  status?: "pending" | "approved" | "rejected";
  nota_proof?: string; // URL/Path to file
  items: CostItem[];
  total_amount: number;
};
```

### CostItem (Frontend Type - Exact Match)

```typescript
// src/types/cost.ts - USE THIS EXACT STRUCTURE
export type CostItem = {
  id: string;
  description: string;
  cbs_category?: string; // Nama CBS, not ID
  cost: number; // Harga satuan (NOT unit_cost!)
  quantity: number;
  total: number; // cost × quantity
};
```

### Database Field Mapping

| Frontend Field | Database Column              | Notes           |
| -------------- | ---------------------------- | --------------- |
| `wbs_id`       | `wbs_id`                     | String WBS code |
| `date`         | `transaction_date`           | Map on backend  |
| `cost`         | `unit_cost`                  | Map on backend  |
| `vendor`       | `vendor_id` → `vendors.name` | Join/lookup     |

### Vendor

```typescript
interface Vendor {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
```

---

## 5. Error Handling

### Error Codes

| Code               | HTTP Status | Description                    |
| ------------------ | ----------- | ------------------------------ |
| `COST_NOT_FOUND`   | 404         | Cost record tidak ditemukan    |
| `WBS_NOT_FOUND`    | 404         | WBS item tidak valid           |
| `NOTA_REQUIRED`    | 400         | Approval memerlukan nota_proof |
| `ALREADY_APPROVED` | 409         | Record sudah diapprove         |
| `ALREADY_REJECTED` | 409         | Record sudah direject          |
| `INVALID_STATUS`   | 400         | Status tidak valid             |
| `EMPTY_ITEMS`      | 400         | Minimal 1 item diperlukan      |

---

## 6. Backend Implementation Notes

### 6.1 Total Amount Calculation (Server-Side)

**JANGAN** trust client-side calculation. Hitung ulang di backend:

```javascript
async function createCostRecord(data) {
  // 1. Calculate total from items
  let totalAmount = 0;
  for (const item of data.items) {
    item.total = item.unit_cost * item.quantity;
    totalAmount += item.total;
  }

  // 2. Create record with calculated total
  const record = await db.costRecords.create({
    ...data,
    total_amount: totalAmount,
    status: "pending",
  });

  // 3. Create items
  for (const item of data.items) {
    await db.costItems.create({
      cost_record_id: record.id,
      ...item,
    });
  }

  return record;
}
```

### 6.2 Approval Constraint

**Approval WAJIB menyertakan nota_proof:**

```sql
-- Database constraint
CONSTRAINT chk_approval_consistency CHECK (
    (status = 'approved' AND nota_proof IS NOT NULL) OR
    (status != 'approved')
)
```

```javascript
// Backend validation
async function approveCostRecord(recordId, notaProof) {
  if (!notaProof) {
    throw new Error("NOTA_REQUIRED");
  }

  const record = await db.costRecords.findById(recordId);
  if (record.status !== "pending") {
    throw new Error("ALREADY_" + record.status.toUpperCase());
  }

  await db.costRecords.update(recordId, {
    status: "approved",
    nota_proof: notaProof,
    approved_by: currentUser.id,
    approved_at: new Date(),
  });
}
```

---

## 7. Critical Backend Functions

### 7.1 autoCreateVendor() - WAJIB DIIMPLEMENTASI

Saat user mengetik vendor name baru yang tidak ada di master, backend HARUS auto-create:

```javascript
/**
 * Check if vendor exists, create if not.
 * Frontend sends vendor name as string, not ID.
 */
async function getOrCreateVendor(vendorName) {
  if (!vendorName) return null;

  // 1. Try to find existing vendor
  let vendor = await db.vendors.findFirst({
    where: {
      name: { equals: vendorName, mode: "insensitive" },
      deleted_at: null,
    },
  });

  // 2. Create if not exists
  if (!vendor) {
    vendor = await db.vendors.create({
      name: vendorName,
    });
    vendor.is_new = true;
  }

  return vendor;
}
```

**Usage in POST /costs:**

```javascript
async function createCostRecord(data) {
  // Handle vendor (string -> UUID)
  let vendorId = null;
  if (data.vendor) {
    const vendor = await getOrCreateVendor(data.vendor);
    vendorId = vendor.id;
  }

  // Create record with vendor_id
  const record = await db.costRecords.create({
    ...data,
    vendor_id: vendorId,
  });

  return record;
}
```

### 7.2 autoCreateItemDescription() (Opsional)

Simpan deskripsi item untuk suggestions di masa depan:

```javascript
async function saveItemDescriptions(items) {
  for (const item of items) {
    // Check if description exists
    const exists = await db.itemSuggestions.findFirst({
      where: { value: item.description },
    });

    if (!exists) {
      await db.itemSuggestions.create({
        value: item.description,
        label: item.description,
        cbs_category_id: item.cbs_category_id,
      });
    }
  }
}
```

### 7.3 Handling cbs_category Format

Frontend mengirim `cbs_category` sebagai string format `"NamaKategori-Type"`:

```javascript
/**
 * Parse CBS category from "Material-Per Item" format
 */
async function parseCBSCategory(cbsCategoryString, projectId) {
  if (!cbsCategoryString) return null;

  const [name, type] = cbsCategoryString.split("-");

  // Find CBS category
  const cbs = await db.cbsCategories.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      cost_type: type,
    },
  });

  if (!cbs) {
    throw new Error(`CBS_NOT_FOUND: ${cbsCategoryString}`);
  }

  // Verify CBS is selected for this project
  const selection = await db.projectCbsSelections.findFirst({
    where: {
      project_id: projectId,
      cbs_category_id: cbs.id,
    },
  });

  if (!selection) {
    throw new Error(`CBS_NOT_SELECTED: ${cbsCategoryString}`);
  }

  return cbs.id;
}
```

---

> **Document Version**: 1.0  
> **Related Documentation**:
>
> - [Database Schema](../database/DATABASE-SCHEMA.md)
> - [Cost Report API Contract](./COST-REPORT-API-CONTRACT.md)
> - [Frontend Cost Control Documentation](../../frontend/COST-CONTROL-DOCUMENTATION.md)
