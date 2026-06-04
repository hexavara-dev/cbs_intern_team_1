# Cost Report - API Contract

> **Version**: 1.1  
> **Last Updated**: 2026-02-06  
> **Base URL**: `/api`

> ⚠️ **Field Names Match Frontend Types** - Response menggunakan field names yang sama dengan frontend types untuk easy mapping

---

## Daftar Isi

1. [Overview](#1-overview)
2. [Report Endpoints](#2-report-endpoints)
   - [GET /api/projects/:projectId/costs (Approved Only)](#21-get-apiprojectsprojectidcosts-approved-filter)
   - [GET /api/projects/:projectId/costs/summary](#22-get-apiprojectsprojectidcostssummary)
   - [GET /api/projects/:projectId/wbs/:wbsId/costs](#23-get-apiprojectsprojectidwbswbsidcosts)
3. [Data Schemas](#3-data-schemas)
4. [Aggregation Logic](#4-aggregation-logic)
5. [Backend Implementation Notes](#5-backend-implementation-notes)

---

## 1. Overview

Cost Report menyediakan endpoint read-only untuk dashboard analitik biaya proyek. Data bersumber dari Cost Control (transaksi `approved` saja).

### Report Components

| Component       | Data Source                      | Visualization |
| --------------- | -------------------------------- | ------------- |
| Budget Usage    | Approved costs vs Project budget | Radial chart  |
| CBS Comparison  | Aggregated per CBS category      | Bar chart     |
| WBS Monitoring  | Per WBS item costs               | Table         |
| WBS Cost Detail | Transaction history per WBS      | Detail page   |

### Key Principle

> **Semua report hanya menghitung transaksi dengan `status = 'approved'`**

---

## 2. Report Endpoints

### 2.1 GET /api/projects/:projectId/costs (Approved Filter)

Mengambil transaksi yang sudah approved untuk report.

**Request**

```http
GET /api/projects/PRJ-001/costs?status=approved
Authorization: Bearer <token>
```

**Query Parameters**

| Parameter         | Type   | Required | Description             |
| ----------------- | ------ | -------- | ----------------------- |
| `status`          | string | **Yes**  | `approved` untuk report |
| `wbs_id`          | string | No       | Filter by WBS item      |
| `cbs_category_id` | string | No       | Filter by CBS category  |
| `date_from`       | string | No       | Start date filter       |
| `date_to`         | string | No       | End date filter         |

**Response (200 OK)**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-cost-1",
      "wbs_item": {
        "id": "uuid-wbs-1-1",
        "wbs_code": "1.1",
        "description": "Galian Tanah"
      },
      "transaction_date": "2026-02-05",
      "status": "approved",
      "total_amount": 1500000,
      "items": [
        {
          "id": "uuid-item-1",
          "description": "Semen Gresik",
          "cbs_category": {
            "id": "uuid-cbs-1",
            "name": "Material"
          },
          "total": 1100000
        },
        {
          "id": "uuid-item-2",
          "description": "Pasir",
          "cbs_category": {
            "id": "uuid-cbs-1",
            "name": "Material"
          },
          "total": 400000
        }
      ],
      "approved_at": "2026-02-06T10:00:00Z"
    }
  ],
  "summary": {
    "total_records": 15,
    "total_amount": 45000000
  }
}
```

---

### 2.2 GET /api/projects/:projectId/costs/summary

Mengambil ringkasan biaya per CBS category (untuk chart).

**Request**

```http
GET /api/projects/PRJ-001/costs/summary
Authorization: Bearer <token>
```

**Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "project_id": "PRJ-001",
    "budget": 1500000000,
    "total_actual_cost": 485000000,
    "budget_usage_percentage": 32.33,
    "by_cbs_category": [
      {
        "cbs_category_id": "uuid-cbs-1",
        "cbs_name": "Material",
        "cost_type": "Per Item",
        "planned_cost": 250000000,
        "actual_cost": 180000000,
        "variance": 70000000,
        "variance_percentage": 28.0,
        "status": "safe"
      },
      {
        "cbs_category_id": "uuid-cbs-2",
        "cbs_name": "Tenaga Kerja",
        "cost_type": "Borongan",
        "planned_cost": 150000000,
        "actual_cost": 165000000,
        "variance": -15000000,
        "variance_percentage": -10.0,
        "status": "over"
      }
    ],
    "by_wbs_summary": [
      {
        "wbs_id": "uuid-wbs-1",
        "wbs_code": "1",
        "description": "PEKERJAAN TANAH",
        "planned_cost": 100000000,
        "actual_cost": 85000000,
        "remaining_budget": 15000000,
        "status": "safe"
      }
    ],
    "generated_at": "2026-02-06T12:00:00Z"
  }
}
```

**Variance Status Logic**

| Status    | Condition                        |
| --------- | -------------------------------- |
| `safe`    | actual_cost ≤ planned_cost       |
| `warning` | actual_cost > planned_cost × 0.9 |
| `over`    | actual_cost > planned_cost       |

---

### 2.3 GET /api/projects/:projectId/wbs/:wbsId/costs

Mengambil riwayat transaksi untuk satu WBS item (detail page).

**Request**

```http
GET /api/projects/PRJ-001/wbs/uuid-wbs-1-1/costs
Authorization: Bearer <token>
```

**Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "wbs_item": {
      "id": "uuid-wbs-1-1",
      "wbs_code": "1.1",
      "description": "Galian Tanah",
      "planned_cost": 15000000,
      "actual_cost": 12500000,
      "remaining_budget": 2500000,
      "variance_percentage": 16.67,
      "status": "safe"
    },
    "transactions": [
      {
        "id": "uuid-cost-1",
        "transaction_date": "2026-02-01",
        "vendor": "TB. Sejahtera",
        "total_amount": 5000000,
        "items_summary": "Semen (20), Pasir (3)",
        "approved_at": "2026-02-02T10:00:00Z"
      },
      {
        "id": "uuid-cost-2",
        "transaction_date": "2026-02-05",
        "vendor": "CV. Maju Jaya",
        "total_amount": 7500000,
        "items_summary": "Besi 10mm (100), Kawat (50)",
        "approved_at": "2026-02-06T10:00:00Z"
      }
    ],
    "by_cbs_breakdown": [
      {
        "cbs_name": "Material",
        "actual_cost": 10000000
      },
      {
        "cbs_name": "Sewa Alat",
        "actual_cost": 2500000
      }
    ]
  }
}
```

---

## 3. Data Schemas

### CostSummary

```typescript
interface CostSummary {
  project_id: string;
  budget: number;
  total_actual_cost: number;
  budget_usage_percentage: number;
  by_cbs_category: CBSSummary[];
  by_wbs_summary: WBSSummary[];
  generated_at: string;
}

interface CBSSummary {
  cbs_category_id: string;
  cbs_name: string;
  cost_type: "Per Item" | "Borongan";
  planned_cost: number; // From wbs_cbs_costs
  actual_cost: number; // From approved cost_items
  variance: number; // planned - actual
  variance_percentage: number;
  status: "safe" | "warning" | "over";
}

interface WBSSummary {
  wbs_id: string;
  wbs_code: string;
  description: string;
  planned_cost: number; // From wbs_items.total_cost
  actual_cost: number; // SUM of approved costs
  remaining_budget: number;
  status: "safe" | "warning" | "over";
}
```

---

## 4. Aggregation Logic

### 4.1 Planned Cost (dari WBS)

```sql
-- Planned per WBS item
SELECT total_cost as planned_cost
FROM wbs_items
WHERE id = :wbsId;

-- Planned per CBS category (across all WBS)
SELECT
  c.id as cbs_category_id,
  c.name as cbs_name,
  SUM(
    CASE
      WHEN c.cost_type = 'Per Item' THEN wc.unit_cost * w.volume
      ELSE wc.unit_cost
    END
  ) as planned_cost
FROM wbs_cbs_costs wc
JOIN cbs_categories c ON c.id = wc.cbs_category_id
JOIN wbs_items w ON w.id = wc.wbs_item_id
WHERE w.project_id = :projectId AND w.deleted_at IS NULL
GROUP BY c.id, c.name;
```

### 4.2 Actual Cost (dari Cost Records approved)

```sql
-- Actual per WBS item
SELECT SUM(total_amount) as actual_cost
FROM cost_records
WHERE project_id = :projectId
  AND wbs_item_id = :wbsId
  AND status = 'approved';

-- Actual per CBS category
SELECT
  ci.cbs_category_id,
  SUM(ci.total) as actual_cost
FROM cost_items ci
JOIN cost_records cr ON cr.id = ci.cost_record_id
WHERE cr.project_id = :projectId AND cr.status = 'approved'
GROUP BY ci.cbs_category_id;
```

### 4.3 Variance Calculation

```javascript
// Calculate for each item
function calculateVariance(plannedCost, actualCost) {
  const variance = plannedCost - actualCost;
  const variancePercentage =
    plannedCost > 0 ? (variance / plannedCost) * 100 : 0;

  let status = "safe";
  if (actualCost > plannedCost) {
    status = "over";
  } else if (actualCost > plannedCost * 0.9) {
    status = "warning";
  }

  return { variance, variancePercentage, status };
}
```

---

## 5. Backend Implementation Notes

### 5.1 Performance Optimization

Untuk proyek besar dengan banyak transaksi, pertimbangkan:

**Option A: Materialized View**

```sql
CREATE MATERIALIZED VIEW cost_summary_mv AS
SELECT
  cr.project_id,
  cr.wbs_item_id,
  ci.cbs_category_id,
  SUM(ci.total) as actual_cost,
  COUNT(DISTINCT cr.id) as transaction_count
FROM cost_records cr
JOIN cost_items ci ON ci.cost_record_id = cr.id
WHERE cr.status = 'approved'
GROUP BY cr.project_id, cr.wbs_item_id, ci.cbs_category_id;

-- Refresh periodically or on demand
REFRESH MATERIALIZED VIEW cost_summary_mv;
```

**Option B: Caching Layer**

```javascript
// Cache summary dengan TTL 5 menit
async function getCostSummary(projectId) {
  const cacheKey = `cost_summary:${projectId}`;

  let summary = await cache.get(cacheKey);
  if (!summary) {
    summary = await calculateCostSummary(projectId);
    await cache.set(cacheKey, summary, { ttl: 300 });
  }

  return summary;
}

// Invalidate cache saat ada approval baru
async function onCostApproved(recordId) {
  const record = await db.costRecords.findById(recordId);
  await cache.delete(`cost_summary:${record.project_id}`);
}
```

### 5.2 Filter by Date Range

```sql
-- Filter approved costs by date
SELECT *
FROM cost_records
WHERE project_id = :projectId
  AND status = 'approved'
  AND transaction_date >= :dateFrom
  AND transaction_date <= :dateTo;
```

### 5.3 CBS Category Filtering untuk Report

Tabel WBS Monitoring perlu filter by CBS:

```sql
-- Get actual cost per WBS filtered by CBS
SELECT
  w.id as wbs_id,
  w.wbs_code,
  w.description,
  w.total_cost as planned_cost,
  COALESCE(SUM(ci.total), 0) as actual_cost
FROM wbs_items w
LEFT JOIN cost_records cr
  ON cr.wbs_item_id = w.id AND cr.status = 'approved'
LEFT JOIN cost_items ci
  ON ci.cost_record_id = cr.id
  AND (:cbsCategoryId IS NULL OR ci.cbs_category_id = :cbsCategoryId)
WHERE w.project_id = :projectId AND w.deleted_at IS NULL
GROUP BY w.id, w.wbs_code, w.description, w.total_cost
ORDER BY w.wbs_code;
```

---

> **Document Version**: 1.0  
> **Related Documentation**:
>
> - [Database Schema](../database/DATABASE-SCHEMA.md)
> - [Cost Control API Contract](./COST-CONTROL-API-CONTRACT.md)
> - [WBS API Contract](./WBS-API-CONTRACT.md)
