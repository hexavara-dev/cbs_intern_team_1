# Projects - API Contract

> **Version**: 1.1  
> **Last Updated**: 2026-02-06  
> **Base URL**: `/api`

> ⚠️ **Field Names Match Frontend Types** - Request/Response menggunakan nama field yang sama dengan `src/types/project.ts` dan `src/types/termin.ts`

---

## Daftar Isi

1. [Overview](#1-overview)
2. [Project Endpoints](#2-project-endpoints)
   - [GET /api/projects](#21-get-apiprojects)
   - [GET /api/projects/:id](#22-get-apiprojectsid)
   - [POST /api/projects](#23-post-apiprojects)
   - [PATCH /api/projects/:id](#24-patch-apiprojectsid)
   - [DELETE /api/projects/:id](#25-delete-apiprojectsid)
3. [Termin Endpoints](#3-termin-endpoints)
   - [GET /api/projects/:projectId/termins](#31-get-apiprojectsprojectidtermins)
   - [POST /api/projects/:projectId/termins](#32-post-apiprojectsprojectidtermins)
   - [PATCH /api/projects/:projectId/termins/:terminId](#33-patch-apiprojectsprojectidterminsterminid)
   - [DELETE /api/projects/:projectId/termins/:terminId](#34-delete-apiprojectsprojectidterminsterminid)
4. [Project Members Endpoints](#4-project-members-endpoints)
5. [Data Schemas](#5-data-schemas)
6. [Error Handling](#6-error-handling)
7. [Backend Implementation Notes](#7-backend-implementation-notes)

---

## 1. Overview

Projects adalah entitas utama dalam sistem Hexavara CBS, mengelola:

- **Project Lifecycle**: Status dari ongoing → finish → closed
- **Termins**: Jadwal pembayaran per proyek
- **CBS Selection**: Kategori biaya yang digunakan (via CBS endpoints)
- **Project Members**: Tim proyek termasuk Mandor

### Project Status Lifecycle

```
ongoing → finish → closed
         ↓
    maintenance
         ↓
      canceled
         ↓
       hold
```

### Database Tables

| Table                    | Purpose                                |
| ------------------------ | -------------------------------------- |
| `projects`               | Data utama proyek                      |
| `termins`                | Jadwal termin pembayaran               |
| `project_members`        | Tim proyek (junction: Project ↔ User) |
| `project_cbs_selections` | CBS yang dipilih (lihat CBS API)       |

---

## 2. Project Endpoints

### 2.1 GET /api/projects

Mengambil daftar semua proyek.

**Request**

```http
GET /api/projects
Authorization: Bearer <token>
```

**Query Parameters**

| Parameter | Type   | Required | Description                                                                        |
| --------- | ------ | -------- | ---------------------------------------------------------------------------------- |
| `status`  | string | No       | Filter by status: `ongoing`, `finish`, `closed`, `maintenance`, `canceled`, `hold` |
| `search`  | string | No       | Search by name (partial match)                                                     |
| `page`    | number | No       | Page number (default: 1)                                                           |
| `limit`   | number | No       | Items per page (default: 20, max: 100)                                             |

**Response (200 OK)**

```json
{
  "success": true,
  "data": [
    {
      "id": "PRJ-001",
      "name": "Pembangunan Gedung A",
      "description": "Konstruksi gedung perkantoran 5 lantai",
      "location": "Jakarta Selatan",
      "budget": 1500000000,
      "start_date": "2026-01-15",
      "end_date": "2026-12-31",
      "status": "ongoing",
      "progress": 35.5,
      "created_by": "uuid-user-1",
      "created_at": "2026-01-10T08:00:00Z",
      "updated_at": "2026-02-01T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "total_pages": 3
  }
}
```

---

### 2.2 GET /api/projects/:id

Mengambil detail satu proyek lengkap dengan termins dan CBS selections.

**Request**

```http
GET /api/projects/PRJ-001
Authorization: Bearer <token>
```

**Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "id": "PRJ-001",
    "name": "Pembangunan Gedung A",
    "description": "Konstruksi gedung perkantoran 5 lantai",
    "location": "Jakarta Selatan",
    "budget": 1500000000,
    "start_date": "2026-01-15",
    "end_date": "2026-12-31",
    "status": "ongoing",
    "progress": 35.5,
    "created_by": {
      "id": "uuid-user-1",
      "full_name": "John Doe"
    },
    "termins": [
      {
        "value": "1",
        "description": "DP 20%",
        "nominal": 300000000
      },
      {
        "value": "2",
        "description": "Progress 30%",
        "nominal": 450000000
      }
    ],
    "cbs_categories": [
      {
        "name": "Material",
        "type": "Per Item",
        "selected": true
      },
      {
        "name": "Tenaga Kerja",
        "type": "Borongan",
        "selected": true
      }
    ],
    "members": [
      {
        "user_id": "uuid-user-2",
        "full_name": "Ahmad Mandor",
        "role": "mandor"
      }
    ],
    "created_at": "2026-01-10T08:00:00Z",
    "updated_at": "2026-02-01T10:30:00Z"
  }
}
```

---

### 2.3 POST /api/projects

Membuat proyek baru.

**Request**

```http
POST /api/projects
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body** _(matches `Project` type)_

```json
{
  "id": "PRJ-002",
  "name": "Pembangunan Gedung B",
  "description": "Konstruksi gedung komersial",
  "location": "Bandung",
  "budget": 2000000000,
  "start_date": "2026-03-01",
  "end_date": "2027-02-28",
  "status": "ongoing",
  "progress": 0,
  "cbs_categories": [],
  "termins": [
    {
      "value": "1",
      "description": "DP 20%",
      "nominal": 400000000
    },
    {
      "value": "2",
      "description": "Progress 40%",
      "nominal": 800000000
    }
  ]
}
```

**Field Specifications**

| Field         | Type   | Required | Constraints             |
| ------------- | ------ | -------- | ----------------------- |
| `name`        | string | Yes      | Max 255 chars           |
| `description` | string | No       | Text                    |
| `location`    | string | No       | Max 255 chars           |
| `budget`      | number | Yes      | >= 0                    |
| `start_date`  | string | Yes      | ISO date (YYYY-MM-DD)   |
| `end_date`    | string | Yes      | ISO date, >= start_date |
| `status`      | enum   | No       | Default: `ongoing`      |
| `termins`     | array  | No       | Array of termin objects |

**Response (201 Created)**

```json
{
  "success": true,
  "data": {
    "id": "PRJ-002",
    "name": "Pembangunan Gedung B",
    "budget": 2000000000,
    "status": "ongoing",
    "progress": 0,
    "termins": [
      {
        "id": "uuid-termin-3",
        "sequence": 1,
        "description": "DP 20%",
        "nominal": 400000000
      },
      {
        "id": "uuid-termin-4",
        "sequence": 2,
        "description": "Progress 40%",
        "nominal": 800000000
      }
    ],
    "created_at": "2026-02-06T12:00:00Z"
  },
  "message": "Project created successfully"
}
```

---

### 2.4 PATCH /api/projects/:id

Mengubah data proyek.

**Request**

```http
PATCH /api/projects/PRJ-001
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body (Partial Update)**

```json
{
  "budget": 1750000000,
  "status": "finish",
  "progress": 100
}
```

**Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "id": "PRJ-001",
    "budget": 1750000000,
    "status": "finish",
    "progress": 100,
    "updated_at": "2026-02-06T14:00:00Z"
  },
  "message": "Project updated successfully"
}
```

---

### 2.5 DELETE /api/projects/:id

Menghapus proyek (soft delete).

**Request**

```http
DELETE /api/projects/PRJ-001
Authorization: Bearer <token>
```

**Response (200 OK)**

```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

## 3. Termin Endpoints

### 3.1 GET /api/projects/:projectId/termins

Mengambil semua termin untuk proyek.

**Request**

```http
GET /api/projects/PRJ-001/termins
Authorization: Bearer <token>
```

**Response (200 OK)**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-termin-1",
      "sequence": 1,
      "description": "DP 20%",
      "nominal": 300000000,
      "created_at": "2026-01-10T08:00:00Z"
    },
    {
      "id": "uuid-termin-2",
      "sequence": 2,
      "description": "Progress 30%",
      "nominal": 450000000,
      "created_at": "2026-01-10T08:00:00Z"
    }
  ]
}
```

---

### 3.2 POST /api/projects/:projectId/termins

Menambah termin baru.

**Request**

```http
POST /api/projects/PRJ-001/termins
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body**

```json
{
  "description": "Progress 60%",
  "nominal": 450000000
}
```

> **Note**: `sequence` di-generate otomatis oleh backend (next available).

**Response (201 Created)**

```json
{
  "success": true,
  "data": {
    "id": "uuid-termin-3",
    "sequence": 3,
    "description": "Progress 60%",
    "nominal": 450000000,
    "created_at": "2026-02-06T12:00:00Z"
  },
  "message": "Termin added successfully"
}
```

---

### 3.3 PATCH /api/projects/:projectId/termins/:terminId

Mengubah data termin.

**Request**

```http
PATCH /api/projects/PRJ-001/termins/uuid-termin-1
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body**

```json
{
  "description": "DP 25%",
  "nominal": 375000000
}
```

**Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "id": "uuid-termin-1",
    "sequence": 1,
    "description": "DP 25%",
    "nominal": 375000000,
    "updated_at": "2026-02-06T14:00:00Z"
  },
  "message": "Termin updated successfully"
}
```

---

### 3.4 DELETE /api/projects/:projectId/termins/:terminId

Menghapus termin.

**Request**

```http
DELETE /api/projects/PRJ-001/termins/uuid-termin-3
Authorization: Bearer <token>
```

**Response (200 OK)**

```json
{
  "success": true,
  "message": "Termin deleted successfully",
  "data": {
    "resequenced": true
  }
}
```

> **Note**: Setelah DELETE, backend harus resequence termin yang tersisa.

---

## 4. Project Members Endpoints

### 4.1 GET /api/projects/:projectId/members

```http
GET /api/projects/PRJ-001/members
```

**Response**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-member-1",
      "user_id": "uuid-user-2",
      "full_name": "Ahmad Mandor",
      "email": "ahmad@example.com",
      "role": "mandor",
      "assigned_at": "2026-01-15T08:00:00Z"
    }
  ]
}
```

### 4.2 POST /api/projects/:projectId/members

```http
POST /api/projects/PRJ-001/members
Content-Type: application/json
```

**Request Body**

```json
{
  "user_id": "uuid-user-3",
  "role": "mandor"
}
```

### 4.3 DELETE /api/projects/:projectId/members/:memberId

```http
DELETE /api/projects/PRJ-001/members/uuid-member-1
```

---

## 5. Data Schemas

### Project (Frontend Type - Exact Match)

```typescript
// src/types/project.ts - USE THIS EXACT STRUCTURE
import { TerminInformation } from "./termin";

export type ProjectStatus =
  | "ongoing"
  | "finish"
  | "closed"
  | "maintenance"
  | "canceled"
  | "hold";

export type Project = {
  id: string;
  name: string;
  description: string;
  location: string;
  budget: number;
  start_date: string; // ISO date "YYYY-MM-DD"
  end_date: string; // ISO date "YYYY-MM-DD"
  status: ProjectStatus;
  progress: number; // 0-100
  cbs_categories: CBSCategory[]; // Selected CBS for this project
  termins: TerminInformation[]; // Termin list
};

export type CBSCategory = {
  name: string;
  type: "Per Item" | "Borongan"; // NOT "cost_type"!
  selected: boolean;
};
```

### TerminInformation (Frontend Type - Exact Match)

```typescript
// src/types/termin.ts - USE THIS EXACT STRUCTURE
export type TerminInformation = {
  value: string; // "1", "2", "3" (NOT sequence!)
  description: string;
  nominal: number;
};
```

### Field Mapping (Frontend → Database)

| Frontend Field              | Database Column            | Notes                       |
| --------------------------- | -------------------------- | --------------------------- |
| `termins[].value`           | `termins.sequence`         | String to int               |
| `cbs_categories[].type`     | `cbs_categories.cost_type` | Same values                 |
| `cbs_categories[].selected` | Derived                    | From project_cbs_selections |

---

## 6. Error Handling

### Error Codes

| Code                     | HTTP Status | Description                           |
| ------------------------ | ----------- | ------------------------------------- |
| `PROJECT_NOT_FOUND`      | 404         | Project tidak ditemukan               |
| `TERMIN_NOT_FOUND`       | 404         | Termin tidak ditemukan                |
| `INVALID_DATE_RANGE`     | 400         | end_date < start_date                 |
| `BUDGET_EXCEEDED`        | 400         | Total termin nominal > budget         |
| `MEMBER_ALREADY_EXISTS`  | 409         | User already member of project        |
| `TERMIN_HAS_ALLOCATIONS` | 409         | Cannot delete termin with allocations |

---

## 7. Backend Implementation Notes

### 7.1 Project ID Generation

ID proyek dapat menggunakan format custom (e.g., `PRJ-001`) atau UUID:

```sql
-- Option 1: Sequential with prefix
CREATE SEQUENCE project_seq;
SELECT 'PRJ-' || LPAD(nextval('project_seq')::text, 3, '0') as project_id;

-- Option 2: UUID
SELECT gen_random_uuid() as project_id;
```

### 7.2 Budget Validation

Validasi bahwa total nominal termin tidak melebihi budget:

```javascript
async function validateTerminBudget(projectId, newNominal) {
  const project = await db.projects.findById(projectId);
  const termins = await db.termins.findMany({ project_id: projectId });

  const totalNominal =
    termins.reduce((sum, t) => sum + t.nominal, 0) + newNominal;

  if (totalNominal > project.budget) {
    throw new Error("BUDGET_EXCEEDED");
  }
}
```

### 7.3 Termin Sequence Management

Saat menambah termin baru, auto-increment sequence:

```sql
INSERT INTO termins (project_id, sequence, description, nominal)
SELECT
  :projectId,
  COALESCE(MAX(sequence), 0) + 1,
  :description,
  :nominal
FROM termins WHERE project_id = :projectId;
```

Saat menghapus termin, resequence yang tersisa:

```javascript
async function resequenceTermins(projectId) {
  const termins = await db.termins.findMany({
    where: { project_id: projectId },
    orderBy: { sequence: "asc" },
  });

  for (let i = 0; i < termins.length; i++) {
    await db.termins.update(termins[i].id, { sequence: i + 1 });
  }
}
```

### 7.4 Progress Calculation (Derived)

Progress proyek dapat dihitung dari progress_records:

```sql
SELECT
  ROUND(
    SUM(pr.actual_volume) * 100.0 / NULLIF(SUM(ta.allocated_volume), 0),
    2
  ) as calculated_progress
FROM termin_allocations ta
LEFT JOIN progress_records pr
  ON pr.termin_id = ta.termin_id AND pr.wbs_item_id = ta.wbs_item_id
WHERE ta.project_id = :projectId;
```

### 7.5 Soft Delete Projects

Soft delete harus cascade ke related data:

```javascript
async function softDeleteProject(projectId) {
  const now = new Date();

  // 1. Soft delete project
  await db.projects.update(projectId, { deleted_at: now });

  // 2. Soft delete WBS items
  await db.wbsItems.updateMany({ project_id: projectId }, { deleted_at: now });

  // 3. Soft delete project members
  await db.projectMembers.updateMany(
    { project_id: projectId },
    { deleted_at: now }
  );

  // Note: termins, allocations, cost_records usually use hard delete via CASCADE
}
```

---

> **Document Version**: 1.0  
> **Related Documentation**:
>
> - [Database Schema](../database/DATABASE-SCHEMA.md)
> - [CBS API Contract](./CBS-API-CONTRACT.md)
> - [WBS API Contract](./WBS-API-CONTRACT.md)
> - [Termin Planning API Contract](./TERMIN-PLANNING-API-CONTRACT.md)
