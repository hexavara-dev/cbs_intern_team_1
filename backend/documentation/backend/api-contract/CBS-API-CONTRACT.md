# CBS (Cost Breakdown Structure) - API Contract

> **Version**: 1.1  
> **Last Updated**: 2026-02-06  
> **Base URL**: `/api`

> ⚠️ **Field Names Match Frontend Types** - Request/Response menggunakan nama field yang sama dengan `src/types/cbs-wbs.ts`

---

## Daftar Isi

1. [Overview](#1-overview)
2. [Master CBS Endpoints](#2-master-cbs-endpoints)
   - [GET /api/cbs](#21-get-apicbs---list-all-cbs-categories)
   - [POST /api/cbs](#22-post-apicbs---create-cbs-category)
   - [PUT /api/cbs/:id](#23-put-apicbsid---update-cbs-category)
   - [DELETE /api/cbs/:id](#24-delete-apicbsid---delete-cbs-category)
3. [Project CBS Selection Endpoints](#3-project-cbs-selection-endpoints)
   - [GET /api/projects/:projectId/cbs-selections](#31-get-apiprojectsprojectidcbs-selections)
   - [PUT /api/projects/:projectId/cbs-selections](#32-put-apiprojectsprojectidcbs-selections)
4. [Data Schemas](#4-data-schemas)
5. [Error Handling](#5-error-handling)
6. [Backend Implementation Notes](#6-backend-implementation-notes)

---

## 1. Overview

CBS (Cost Breakdown Structure) adalah sistem pengelolaan kategori biaya yang terdiri dari:

- **Master CBS**: Daftar global kategori biaya yang tersedia untuk semua proyek
- **Project CBS Selection**: Pemilihan kategori CBS spesifik untuk setiap proyek

### Cost Type Rules

| Type         | Formula              | Contoh                                      |
| ------------ | -------------------- | ------------------------------------------- |
| **Per Item** | `unit_cost × volume` | Material: Rp 50.000 × 100 = Rp 5.000.000    |
| **Borongan** | `unit_cost` (fixed)  | Jasa: Rp 1.000.000 (tidak dikalikan volume) |

> **Note**: Frontend type menggunakan `type` sebagai field name, bukan `cost_type`

### Database Tables

| Table                    | Purpose                                 |
| ------------------------ | --------------------------------------- |
| `cbs_categories`         | Master list kategori CBS                |
| `project_cbs_selections` | Junction table: Project ↔ CBS Category |

---

## 2. Master CBS Endpoints

### 2.1 GET /api/cbs - List All CBS Categories

Mengambil semua kategori CBS yang tersedia (master data).

**Request**

```http
GET /api/cbs
Authorization: Bearer <token>
```

**Query Parameters**

| Parameter   | Type   | Required | Description                                |
| ----------- | ------ | -------- | ------------------------------------------ |
| `search`    | string | No       | Filter by name (partial match)             |
| `cost_type` | string | No       | Filter by type: `Per Item` atau `Borongan` |

**Response (200 OK)**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Material",
      "cost_type": "Per Item",
      "created_at": "2026-01-15T10:30:00Z",
      "updated_at": "2026-01-15T10:30:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "Sewa Alat",
      "cost_type": "Per Item",
      "created_at": "2026-01-15T10:30:00Z",
      "updated_at": "2026-01-15T10:30:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "name": "Sewa Tenaga Kerja",
      "cost_type": "Borongan",
      "created_at": "2026-01-15T10:30:00Z",
      "updated_at": "2026-01-15T10:30:00Z"
    }
  ]
}
```

---

### 2.2 POST /api/cbs - Create CBS Category

Membuat kategori CBS baru di master data.

**Request**

```http
POST /api/cbs
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body**

```json
{
  "name": "Overhead",
  "cost_type": "Borongan"
}
```

**Field Specifications**

| Field       | Type   | Required | Constraints                         |
| ----------- | ------ | -------- | ----------------------------------- |
| `name`      | string | Yes      | Max 100 chars, unique per cost_type |
| `cost_type` | enum   | Yes      | `Per Item` \| `Borongan`            |

**Response (201 Created)**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "name": "Overhead",
    "cost_type": "Borongan",
    "created_at": "2026-02-06T10:30:00Z",
    "updated_at": "2026-02-06T10:30:00Z"
  },
  "message": "CBS category created successfully"
}
```

**Error Response (409 Conflict)**

```json
{
  "success": false,
  "error": {
    "code": "CBS_DUPLICATE",
    "message": "CBS category with this name and cost type already exists"
  }
}
```

---

### 2.3 PUT /api/cbs/:id - Update CBS Category

Mengubah data kategori CBS.

**Request**

```http
PUT /api/cbs/550e8400-e29b-41d4-a716-446655440001
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body**

```json
{
  "name": "Material Konstruksi",
  "cost_type": "Per Item"
}
```

**Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Material Konstruksi",
    "cost_type": "Per Item",
    "created_at": "2026-01-15T10:30:00Z",
    "updated_at": "2026-02-06T11:00:00Z"
  },
  "message": "CBS category updated successfully"
}
```

---

### 2.4 DELETE /api/cbs/:id - Delete CBS Category

Menghapus kategori CBS (soft delete).

**Request**

```http
DELETE /api/cbs/550e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <token>
```

**Response (200 OK)**

```json
{
  "success": true,
  "message": "CBS category deleted successfully"
}
```

**Error Response (409 Conflict)**

```json
{
  "success": false,
  "error": {
    "code": "CBS_IN_USE",
    "message": "Cannot delete CBS category that is being used by projects"
  }
}
```

---

## 3. Project CBS Selection Endpoints

### 3.1 GET /api/projects/:projectId/cbs-selections

Mengambil daftar CBS yang dipilih untuk proyek tertentu.

**Request**

```http
GET /api/projects/PRJ-001/cbs-selections
Authorization: Bearer <token>
```

**Response (200 OK)**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Material",
      "cost_type": "Per Item",
      "selected_at": "2026-01-20T08:00:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "name": "Sewa Tenaga Kerja",
      "cost_type": "Borongan",
      "selected_at": "2026-01-20T08:00:00Z"
    }
  ]
}
```

---

### 3.2 PUT /api/projects/:projectId/cbs-selections

Memperbarui seluruh seleksi CBS untuk proyek (bulk replace).

> **Note**: Endpoint ini menggantikan SEMUA seleksi CBS yang ada dengan array baru.

**Request**

```http
PUT /api/projects/PRJ-001/cbs-selections
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body**

```json
{
  "cbs_category_ids": [
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440002",
    "550e8400-e29b-41d4-a716-446655440003"
  ]
}
```

**Response (200 OK)**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Material",
      "cost_type": "Per Item",
      "selected_at": "2026-02-06T12:00:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "Sewa Alat",
      "cost_type": "Per Item",
      "selected_at": "2026-02-06T12:00:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "name": "Sewa Tenaga Kerja",
      "cost_type": "Borongan",
      "selected_at": "2026-02-06T12:00:00Z"
    }
  ],
  "message": "CBS selections updated successfully"
}
```

---

## 4. Data Schemas

### CBSCategory (Master)

```typescript
interface CBSCategory {
  id: string; // UUID
  name: string; // Nama kategori (max 100 chars)
  cost_type: "Per Item" | "Borongan";
  created_by?: string; // UUID user yang membuat
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
  deleted_at?: string; // Soft delete timestamp
}
```

### ProjectCBSSelection (Junction)

```typescript
interface ProjectCBSSelection {
  id: string; // UUID
  project_id: string; // FK ke projects
  cbs_category_id: string; // FK ke cbs_categories
  selected_at: string; // Timestamp seleksi
  selected_by?: string; // UUID user yang memilih
}
```

### Frontend Type Mapping (EXACT MATCH)

```typescript
// src/types/cbs-wbs.ts - USE THIS EXACT STRUCTURE
export type CBSData = {
  name: string; // Nama kategori
  type: string; // "Per Item" | "Borongan" (NOT cost_type!)
  selected: boolean; // Derived from project_cbs_selections
};
```

### Field Mapping (Frontend → Database)

| Frontend Field | Database Column | Notes                        |
| -------------- | --------------- | ---------------------------- |
| `name`         | `name`          | Same                         |
| `type`         | `cost_type`     | Map on backend               |
| `selected`     | Derived         | Check project_cbs_selections |

---

## 5. Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {} // Optional additional info
  }
}
```

### Error Codes

| Code                | HTTP Status | Description                                |
| ------------------- | ----------- | ------------------------------------------ |
| `CBS_NOT_FOUND`     | 404         | CBS category with given ID not found       |
| `CBS_DUPLICATE`     | 409         | CBS with same name+type already exists     |
| `CBS_IN_USE`        | 409         | Cannot delete CBS that is used by projects |
| `INVALID_COST_TYPE` | 400         | Invalid cost_type value                    |
| `PROJECT_NOT_FOUND` | 404         | Project with given ID not found            |
| `VALIDATION_ERROR`  | 400         | Request body validation failed             |

---

## 6. Backend Implementation Notes

### 6.1 Database Constraints

```sql
-- Unique constraint: same name cannot have same cost_type
CONSTRAINT uq_cbs_name_type UNIQUE (name, cost_type)

-- Soft delete: always filter WHERE deleted_at IS NULL
CREATE INDEX idx_cbs_categories_name ON cbs_categories(name) WHERE deleted_at IS NULL;
```

### 6.2 Soft Delete Implementation

Saat DELETE dipanggil:

1. **JANGAN** hapus record dari database
2. Set `deleted_at = CURRENT_TIMESTAMP`
3. Semua query GET harus filter `WHERE deleted_at IS NULL`

```sql
-- Soft delete
UPDATE cbs_categories SET deleted_at = CURRENT_TIMESTAMP WHERE id = :id;

-- Query active only
SELECT * FROM cbs_categories WHERE deleted_at IS NULL;
```

### 6.3 CBS Selection Bulk Replace Flow

Saat `PUT /api/projects/:projectId/cbs-selections` dipanggil:

```sql
-- 1. Delete existing selections
DELETE FROM project_cbs_selections WHERE project_id = :projectId;

-- 2. Insert new selections
INSERT INTO project_cbs_selections (project_id, cbs_category_id, selected_at, selected_by)
VALUES
  (:projectId, :cbsId1, CURRENT_TIMESTAMP, :userId),
  (:projectId, :cbsId2, CURRENT_TIMESTAMP, :userId),
  ...
```

### 6.4 Validation Before Delete

Sebelum menghapus CBS dari master:

1. Cek apakah ada `project_cbs_selections` yang menggunakan CBS ini
2. Cek apakah ada `wbs_cbs_costs` yang menggunakan CBS ini
3. Jika ada, return error `CBS_IN_USE`

```sql
-- Check usage before delete
SELECT COUNT(*) FROM project_cbs_selections WHERE cbs_category_id = :id;
SELECT COUNT(*) FROM wbs_cbs_costs WHERE cbs_category_id = :id;
```

### 6.5 Impact on WBS When CBS Selection Changes

Saat CBS selection proyek berubah:

- **Menambah CBS**: Kolom baru akan tersedia di WBS table
- **Menghapus CBS**:
  - Backend HARUS menghapus data biaya terkait dari `wbs_cbs_costs`
  - Atau return error jika CBS masih digunakan di WBS item

```sql
-- Optional: Cascade delete WBS costs when CBS is removed from project
DELETE FROM wbs_cbs_costs
WHERE cbs_category_id = :removedCbsId
AND wbs_item_id IN (SELECT id FROM wbs_items WHERE project_id = :projectId);
```

---

> **Document Version**: 1.0  
> **Related Documentation**:
>
> - [Database Schema](../database/DATABASE-SCHEMA.md)
> - [WBS API Contract](./WBS-API-CONTRACT.md)
> - [Projects API Contract](./PROJECTS-API-CONTRACT.md)
