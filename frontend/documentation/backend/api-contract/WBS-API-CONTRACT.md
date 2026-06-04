# WBS (Work Breakdown Structure) - API Contract

> **Version**: 1.1  
> **Last Updated**: 2026-02-06  
> **Base URL**: `/api`

---

## Daftar Isi

1. [Overview](#1-overview)
2. [Endpoints](#2-endpoints)
   - [GET /api/projects/:projectId/wbs](#21-get-apiprojectsprojectidwbs)
   - [POST /api/projects/:projectId/wbs](#22-post-apiprojectsprojectidwbs)
   - [PATCH /api/projects/:projectId/wbs/:wbsId](#23-patch-apiprojectsprojectidwbswbsid)
   - [DELETE /api/projects/:projectId/wbs/:wbsId](#24-delete-apiprojectsprojectidwbswbsid)
3. [Data Schemas](#3-data-schemas)
4. [Error Handling](#4-error-handling)
5. [Backend Implementation Notes](#5-backend-implementation-notes)
6. [Critical Backend Functions](#6-critical-backend-functions)

---

## 1. Overview

WBS (Work Breakdown Structure) mengelola struktur pekerjaan proyek dengan hierarki tree. Fitur utama:

- **Hierarchical Structure**: Item tersusun dalam tree dengan parent-child relationship
- **CBS Cost Mapping**: Setiap leaf item memiliki biaya per kategori CBS
- **Auto-calculation**: Parent cost = SUM of children costs

### Field Naming Convention

> ⚠️ **PENTING**: API menggunakan **nama field yang SAMA** dengan frontend TypeScript untuk menghindari mapping tambahan.

| Frontend Field  | API Field       | Description                    |
| --------------- | --------------- | ------------------------------ |
| `wbs_id`        | `wbs_id`        | Hierarchical code ("1", "1.1") |
| `wbs_parent_id` | `wbs_parent_id` | Parent's wbs_id ("" for root)  |
| `cbs_category`  | `cbs_category`  | `Record<string, number>`       |
| `totalCost`     | `totalCost`     | Total biaya (calculated)       |
| `is_leaf`       | `is_leaf`       | Can input costs                |

### WBS ID Generation

> `wbs_id` di-generate oleh **FRONTEND** menggunakan `generateNextWbsId.ts`, bukan backend.

Backend hanya:

1. ✅ Validasi format: `/^[0-9]+(\.[0-9]+)*$/`
2. ✅ Enforce UNIQUE constraint per project
3. ✅ Jalankan `reindexWBS()` setelah DELETE

### Database Tables

| Table           | Purpose                             |
| --------------- | ----------------------------------- |
| `wbs_items`     | Struktur hierarki WBS               |
| `wbs_cbs_costs` | Biaya per CBS category di leaf item |

---

## 2. Endpoints

### 2.1 GET /api/projects/:projectId/wbs

Mengambil semua WBS items untuk proyek tertentu.

**Request**

```http
GET /api/projects/PRJ-001/wbs
Authorization: Bearer <token>
```

**Query Parameters**

| Parameter | Type    | Required | Description            |
| --------- | ------- | -------- | ---------------------- |
| `is_leaf` | boolean | No       | Filter leaf items only |

**Response (200 OK) - Flat Format**

```json
{
  "success": true,
  "data": [
    {
      "wbs_id": "1",
      "wbs_parent_id": "",
      "description": "PEKERJAAN TANAH",
      "volume": 0,
      "unit": "",
      "is_leaf": false,
      "totalCost": 15000000,
      "cbs_category": {}
    },
    {
      "wbs_id": "1.1",
      "wbs_parent_id": "1",
      "description": "Galian Tanah",
      "volume": 100,
      "unit": "m3",
      "is_leaf": true,
      "totalCost": 15000000,
      "cbs_category": {
        "Material": 50000,
        "Tenaga Kerja": 100000
      }
    }
  ]
}
```

---

### 2.2 POST /api/projects/:projectId/wbs

Membuat WBS item baru. **`wbs_id` dikirim dari frontend.**

**Request**

```http
POST /api/projects/PRJ-001/wbs
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body**

```json
{
  "wbs_id": "1.2",
  "wbs_parent_id": "1",
  "description": "Urugan Tanah",
  "volume": 50,
  "unit": "m3",
  "is_leaf": true,
  "cbs_category": {
    "Material": 45000,
    "Tenaga Kerja": 80000
  }
}
```

**Field Specifications**

| Field           | Type    | Required | Description                          |
| --------------- | ------- | -------- | ------------------------------------ |
| `wbs_id`        | string  | **Yes**  | Frontend-generated code (e.g. "1.2") |
| `wbs_parent_id` | string  | Yes      | Parent's wbs_id ("" for root)        |
| `description`   | string  | Yes      | Nama pekerjaan (max 500 chars)       |
| `volume`        | number  | No       | Volume pekerjaan (default 0)         |
| `unit`          | string  | No       | Satuan (m, m2, m3, dll)              |
| `is_leaf`       | boolean | Yes      | true = bisa input cost               |
| `cbs_category`  | object  | No       | `{ [cbsName]: unitCost }`            |

**Response (201 Created)**

```json
{
  "success": true,
  "data": {
    "wbs_id": "1.2",
    "wbs_parent_id": "1",
    "description": "Urugan Tanah",
    "volume": 50,
    "unit": "m3",
    "is_leaf": true,
    "totalCost": 6250000,
    "cbs_category": {
      "Material": 45000,
      "Tenaga Kerja": 80000
    }
  },
  "message": "WBS item created successfully"
}
```

---

### 2.3 PATCH /api/projects/:projectId/wbs/:wbsId

Mengubah data WBS item.

**Request**

```http
PATCH /api/projects/PRJ-001/wbs/1.1
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body (Partial Update)**

```json
{
  "description": "Galian Tanah Biasa",
  "volume": 120,
  "cbs_category": {
    "Material": 55000
  }
}
```

**Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "wbs_id": "1.1",
    "description": "Galian Tanah Biasa",
    "volume": 120,
    "totalCost": 18600000,
    "updated_at": "2026-02-06T12:00:00Z"
  },
  "message": "WBS item updated successfully"
}
```

---

### 2.4 DELETE /api/projects/:projectId/wbs/:wbsId

Menghapus WBS item beserta semua children-nya.

**Request**

```http
DELETE /api/projects/PRJ-001/wbs/1.1
Authorization: Bearer <token>
```

**Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "deleted_count": 3,
    "reindexed": true,
    "updated_items": [
      { "old_wbs_id": "1.2", "new_wbs_id": "1.1" },
      { "old_wbs_id": "1.3", "new_wbs_id": "1.2" }
    ]
  },
  "message": "WBS item and 2 children deleted successfully"
}
```

> ⚠️ **PENTING**: Setelah DELETE, backend HARUS menjalankan `reindexWBS()` untuk memastikan WBS codes tetap sequential.

---

## 3. Data Schemas

### API Schema (Matches Frontend)

```typescript
// Exact match dengan src/types/cbs-wbs.ts
interface WBSData {
  wbs_id: string; // Hierarchical code ("1", "1.1", "1.1.1")
  wbs_parent_id: string; // Parent's wbs_id ("" for root)
  description: string; // Nama pekerjaan
  volume: number; // Volume pekerjaan
  unit: string; // Satuan (m, m2, m3)
  cbs_category: WBSCostMap; // { [cbsName]: unitCost }
  totalCost: number; // Total biaya (calculated)
  is_leaf: boolean; // Can input costs
  children?: WBSData[]; // For tree format only
}

type WBSCostMap = Record<string, number>;
// Example: { "Material": 50000, "Tenaga Kerja": 100000 }
```

### Database Schema (Internal)

```sql
CREATE TABLE wbs_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  wbs_id VARCHAR(50) NOT NULL,           -- "1", "1.1", "1.1.1"
  wbs_parent_id VARCHAR(50) NOT NULL DEFAULT '',
  description VARCHAR(500) NOT NULL,
  volume DECIMAL(12,4) DEFAULT 0,
  unit VARCHAR(20),
  is_leaf BOOLEAN NOT NULL DEFAULT true,
  total_cost DECIMAL(18,2) DEFAULT 0,    -- Maps to totalCost
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,

  CONSTRAINT uq_project_wbs_id UNIQUE (project_id, wbs_id)
);

CREATE TABLE wbs_cbs_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wbs_item_id UUID NOT NULL REFERENCES wbs_items(id) ON DELETE CASCADE,
  cbs_name VARCHAR(100) NOT NULL,        -- Matches cbs_category key
  unit_cost DECIMAL(18,2) NOT NULL,

  CONSTRAINT uq_wbs_cbs UNIQUE (wbs_item_id, cbs_name)
);
```

### Field Mapping (DB → API)

| Database Column      | API Field             |
| -------------------- | --------------------- |
| `wbs_id`             | `wbs_id`              |
| `wbs_parent_id`      | `wbs_parent_id`       |
| `total_cost`         | `totalCost`           |
| `wbs_cbs_costs` rows | `cbs_category` object |

---

## 4. Error Handling

### Error Codes

| Code                    | HTTP Status | Description                                    |
| ----------------------- | ----------- | ---------------------------------------------- |
| `WBS_NOT_FOUND`         | 404         | WBS item tidak ditemukan                       |
| `DUPLICATE_WBS_ID`      | 409         | wbs_id sudah ada di project ini                |
| `INVALID_WBS_ID_FORMAT` | 400         | Format wbs_id tidak valid                      |
| `INVALID_PARENT`        | 400         | wbs_parent_id tidak ditemukan                  |
| `PARENT_IS_LEAF`        | 400         | Cannot add child to leaf (update parent first) |
| `WBS_HAS_COST_RECORDS`  | 409         | Cannot delete WBS with cost records            |
| `WBS_HAS_ALLOCATIONS`   | 409         | Cannot delete WBS with termin allocations      |
| `CBS_NOT_SELECTED`      | 400         | CBS category belum dipilih untuk proyek        |

---

## 5. Backend Implementation Notes

### 5.1 WBS ID Validation (Frontend-Generated)

Backend TIDAK generate wbs_id, tapi HARUS validasi:

```javascript
function validateWbsId(wbsId) {
  // 1. Check format
  const formatRegex = /^[0-9]+(\.[0-9]+)*$/;
  if (!formatRegex.test(wbsId)) {
    throw new Error("INVALID_WBS_ID_FORMAT");
  }

  // 2. UNIQUE constraint will catch duplicates at DB level
  // Return error: DUPLICATE_WBS_ID
}
```

### 5.2 Convert cbs_category Object to/from DB

**Request → DB (flatten object to rows):**

```javascript
async function saveCBSCosts(wbsItemId, cbsCategory) {
  // Delete existing
  await db.wbsCbsCosts.deleteMany({ wbs_item_id: wbsItemId });

  // Insert new rows
  for (const [cbsName, unitCost] of Object.entries(cbsCategory)) {
    await db.wbsCbsCosts.create({
      wbs_item_id: wbsItemId,
      cbs_name: cbsName,
      unit_cost: unitCost,
    });
  }
}
```

**DB → Response (aggregate rows to object):**

```javascript
function buildCBSCategoryObject(wbsCbsCosts) {
  const result = {};
  for (const row of wbsCbsCosts) {
    result[row.cbs_name] = row.unit_cost;
  }
  return result;
}
// Output: { "Material": 50000, "Tenaga Kerja": 100000 }
```

### 5.3 Total Cost Calculation

**Untuk Leaf Items:**

```javascript
function calculateTotalCost(wbsItem, cbsCategories) {
  let totalCost = 0;

  for (const [cbsName, unitCost] of Object.entries(wbsItem.cbs_category)) {
    const cbsInfo = cbsCategories.find((c) => c.name === cbsName);

    if (cbsInfo.cost_type === "Per Item") {
      totalCost += unitCost * wbsItem.volume;
    } else {
      // Borongan - fixed cost, not multiplied
      totalCost += unitCost;
    }
  }

  return totalCost;
}
```

**Untuk Parent Items:**

```sql
-- total_cost = SUM of children total_cost (recursive)
WITH RECURSIVE children AS (
  SELECT id, total_cost FROM wbs_items
  WHERE wbs_parent_id = :parentWbsId AND project_id = :projectId
  UNION ALL
  SELECT w.id, w.total_cost
  FROM wbs_items w JOIN children c ON w.wbs_parent_id = c.wbs_id
)
SELECT SUM(total_cost) FROM children;
```

### 5.4 Update Parent `is_leaf` on Child Create

> ⚠️ **PENTING**: Ketika item yang sebelumnya `is_leaf=true` mendapat child baru, fungsi ini **WAJIB menghapus data CBS cost dari parent tersebut** (`cbs_category` dikosongkan). Hal ini karena dalam sistem ini, **hanya leaf nodes (child paling rendah) yang boleh memiliki cost**. Parent nodes hanya menyimpan aggregated cost dari children-nya.

```javascript
async function createWBSItem(projectId, data) {
  // 1. Validate wbs_id format
  validateWbsId(data.wbs_id);

  // 2. Create the new item
  const newItem = await db.wbsItems.create({
    project_id: projectId,
    ...data,
  });

  // 3. If has parent, ensure parent is not a leaf
  if (data.wbs_parent_id) {
    await db.wbsItems.updateMany(
      { project_id: projectId, wbs_id: data.wbs_parent_id },
      { is_leaf: false }
    );
    // Clear parent's CBS costs
    await db.wbsCbsCosts.deleteMany({
      wbs_item_id: { in: parentItemIds },
    });
  }

  // 4. Save CBS costs
  if (data.cbs_category) {
    await saveCBSCosts(newItem.id, data.cbs_category);
  }

  // 5. Recalculate parent costs
  await recalculateParentCosts(projectId, data.wbs_parent_id);

  return newItem;
}
```

### 5.5 Cascade Delete with Reindex

```javascript
async function deleteWBSItem(projectId, wbsId) {
  // 1. Check dependencies
  const hasRecords = await checkDependencies(projectId, wbsId);
  if (hasRecords) throw new Error("WBS_HAS_COST_RECORDS");

  // 2. Get item and all descendants (by wbs_id prefix)
  const itemsToDelete = await db.wbsItems.findMany({
    where: {
      project_id: projectId,
      OR: [{ wbs_id: wbsId }, { wbs_id: { startsWith: wbsId + "." } }],
    },
  });

  // 3. Soft delete all
  await db.wbsItems.updateMany(
    { id: { in: itemsToDelete.map((i) => i.id) } },
    { deleted_at: new Date() }
  );

  // 4. REINDEX remaining items
  await reindexWBS(projectId);

  // 5. Recalculate parent costs
  const item = itemsToDelete[0];
  await recalculateParentCosts(projectId, item.wbs_parent_id);

  return { deleted_count: itemsToDelete.length };
}
```

---

## 6. Critical Backend Functions

### 6.1 reindexWBS() - WAJIB DIIMPLEMENTASI

Fungsi ini **HARUS** dijalankan setelah DELETE untuk menjaga sequential numbering.

```javascript
/**
 * Re-indexes all WBS items to ensure sequential numbering.
 * Updates wbs_id based on sorted order per parent.
 */
async function reindexWBS(projectId) {
  // 1. Get all active items
  const items = await db.wbsItems.findMany({
    where: { project_id: projectId, deleted_at: null },
    orderBy: { wbs_id: "asc" },
  });

  // 2. Group by parent
  const byParent = {};
  items.forEach((item) => {
    const parent = item.wbs_parent_id || "";
    if (!byParent[parent]) byParent[parent] = [];
    byParent[parent].push(item);
  });

  // 3. Recursive reassign
  const updates = [];

  function processChildren(parentWbsId, children) {
    children.forEach((child, idx) => {
      const newWbsId = parentWbsId ? `${parentWbsId}.${idx + 1}` : `${idx + 1}`;

      if (child.wbs_id !== newWbsId) {
        updates.push({
          id: child.id,
          old_wbs_id: child.wbs_id,
          new_wbs_id: newWbsId,
        });
      }

      // Process this item's children
      const grandchildren = byParent[child.wbs_id] || [];
      processChildren(newWbsId, grandchildren);
    });
  }

  // 4. Start with roots
  const roots = byParent[""] || [];
  processChildren("", roots);

  // 5. Apply updates
  for (const u of updates) {
    await db.wbsItems.update(u.id, {
      wbs_id: u.new_wbs_id,
      wbs_parent_id: getParentFromId(u.new_wbs_id),
    });
  }

  return updates;
}

function getParentFromId(wbsId) {
  const parts = wbsId.split(".");
  if (parts.length <= 1) return "";
  return parts.slice(0, -1).join(".");
}
```

**Frontend Reference:** Lihat `src/utils/reindexWBS.ts` untuk logika serupa.

---

### 6.2 recalculateParentCosts()

```javascript
async function recalculateParentCosts(projectId, parentWbsId) {
  if (!parentWbsId) return;

  // 1. Get parent
  const parent = await db.wbsItems.findFirst({
    where: { project_id: projectId, wbs_id: parentWbsId },
  });
  if (!parent) return;

  // 2. Sum children costs
  const children = await db.wbsItems.findMany({
    where: {
      project_id: projectId,
      wbs_parent_id: parentWbsId,
      deleted_at: null,
    },
  });

  const totalCost = children.reduce((sum, c) => sum + c.total_cost, 0);

  // 3. Update parent
  await db.wbsItems.update(parent.id, { total_cost: totalCost });

  // 4. Recurse up
  await recalculateParentCosts(projectId, parent.wbs_parent_id);
}
```

---

> **Document Version**: 1.1  
> **Changelog**: Updated to use frontend field names (wbs_id, wbs_parent_id, cbs_category, totalCost)  
> **Related Documentation**:
>
> - [Database Schema](../database/DATABASE-SCHEMA.md)
> - [CBS API Contract](./CBS-API-CONTRACT.md)
> - [Frontend WBS Documentation](../../frontend/WBS-DOCUMENTATION.md)
