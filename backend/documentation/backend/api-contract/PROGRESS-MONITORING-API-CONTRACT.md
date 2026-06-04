# Progress Monitoring - API Contract

> **Version**: 2.1  
> **Last Updated**: 2026-03-03  
> **Base URL**: `/api`

> ⚠️ **Field Names Match Frontend Types** - Request/Response menggunakan field names sesuai `src/types/progress.ts`

---

## Daftar Isi

1. [Overview](#1-overview)
2. [Progress Table Endpoint](#2-progress-table-endpoint)
   - [GET /api/projects/:projectId/progress/table](#21-get-apiprojectsprojectidprogresstable)
3. [Progress Summary Endpoint](#3-progress-summary-endpoint)
   - [GET /api/projects/:projectId/progress/summary](#31-get-apiprojectsprojectidprogresssummary)
4. [Progress History Endpoints](#4-progress-history-endpoints)
   - [GET /api/projects/:projectId/progress/history](#41-get-apiprojectsprojectidprogresshistory)
   - [GET /api/projects/:projectId/progress/history/:recordId](#42-get-apiprojectsprojectidprogresshistoryrecordid)
5. [Progress Record Mutations](#5-progress-record-mutations)
   - [POST /api/projects/:projectId/progress](#51-post-apiprojectsprojectidprogress)
6. [Data Schemas (TypeScript)](#6-data-schemas-typescript)
7. [Error Handling](#7-error-handling)
8. [Backend Implementation Notes](#8-backend-implementation-notes)

---

## 1. Overview

Progress Monitoring memiliki **3 tampilan utama di FE**:

| Tab              | Data Source                 | Tujuan                                         |
| ---------------- | --------------------------- | ---------------------------------------------- |
| **Progress Table** | `WBSProgressMonitoringItem[]` | Grid WBS × Termin dengan volume rencana vs realisasi |
| **Summary / Chart** | Aggregated values         | KPI cards + Chart termin progress               |
| **Progress History** | `ProgressHistoryRecord[]` | Log/riwayat setiap submission update progress  |

### Model: Append-Only Log (Latest Record Wins)

Setiap submission dari modal **Update Progress** selalu memanggil `POST`. Tidak ada `PATCH`.

```
Submit 1: WBS 1.2, Termin 1, volume: 0.5  → history record #1
Submit 2: WBS 1.2, Termin 1, volume: 1.0  → history record #2

Progress Table → tampilkan record terbaru (1.0)
History Tab    → tampilkan semua records (#1 dan #2)
```

**Keuntungan:**
- FE tidak perlu cek apakah data sudah ada → selalu `POST`
- History menyimpan audit trail lengkap setiap perubahan
- Backend resolve konflik dengan query `ORDER BY progress_date DESC LIMIT 1`

---

## 2. Progress Table Endpoint

### 2.1 GET /api/projects/:projectId/progress/table

Mengambil data progress per WBS item beserta alokasi per termin (planned vs actual).  
Data ini digunakan oleh `ProgressMonitoringTable` component.

**Request**

```http
GET /api/projects/PRJ-001/progress/table
Authorization: Bearer <token>
```

**Response (200 OK)**

```json
{
  "success": true,
  "data": [
    {
      "id": "wbs-node-1",
      "wbs_id": "1",
      "description": "Pekerjaan Persiapan",
      "planned_volume": 100,
      "unit": "-",
      "is_leaf": false,
      "parent_id": null,
      "progress": []
    },
    {
      "id": "wbs-node-1-1",
      "wbs_id": "1.1",
      "description": "Pembersihan Lahan",
      "planned_volume": 500,
      "unit": "m2",
      "is_leaf": true,
      "parent_id": "wbs-node-1",
      "progress": [
        {
          "id": "prog-1",
          "termin_category": "termin",
          "termin_sequence": "1",
          "planned_volume": 250,
          "actual_volume": 250
        },
        {
          "id": "prog-2",
          "termin_category": "termin",
          "termin_sequence": "2",
          "planned_volume": 250,
          "actual_volume": 100
        }
      ]
    },
    {
      "id": "wbs-node-1-2",
      "wbs_id": "1.2",
      "description": "Pembuatan Direksi Keet",
      "planned_volume": 1,
      "unit": "Ls",
      "is_leaf": true,
      "parent_id": "wbs-node-1",
      "progress": [
        {
          "id": "prog-3",
          "termin_category": "termin",
          "termin_sequence": "1",
          "planned_volume": 1,
          "actual_volume": 0.5
        }
      ]
    },
    {
      "id": "wbs-node-2",
      "wbs_id": "2",
      "description": "Pekerjaan Tanah",
      "planned_volume": 100,
      "unit": "-",
      "is_leaf": false,
      "parent_id": null,
      "progress": []
    },
    {
      "id": "wbs-node-2-1",
      "wbs_id": "2.1",
      "description": "Galian Tanah Mesin",
      "planned_volume": 1000,
      "unit": "m3",
      "is_leaf": true,
      "parent_id": "wbs-node-2",
      "progress": [
        {
          "id": "prog-4",
          "termin_category": "termin",
          "termin_sequence": "2",
          "planned_volume": 500,
          "actual_volume": 400
        },
        {
          "id": "prog-5",
          "termin_category": "adendum",
          "termin_sequence": "1",
          "planned_volume": 500,
          "actual_volume": 450
        }
      ]
    }
  ]
}
```

**Catatan:**
- `is_leaf: false` artinya WBS node (folder/group), tidak punya `progress` entries
- `is_leaf: true` artinya WBS item aktual yang bisa dicatat progressnya
- `termin_category` bisa `"termin"` atau `"adendum"`
- Node urutan diurutkan sesuai hirarki: parent dulu, baru child-child-nya

---

## 3. Progress Summary Endpoint

### 3.1 GET /api/projects/:projectId/progress/summary

Mengambil data agregat untuk ditampilkan di tab **Summary**, meliputi KPI cards dan data chart per termin.

**Request**

```http
GET /api/projects/PRJ-001/progress/summary
Authorization: Bearer <token>
```

**Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "total_planned": 12,
    "total_executed": 8,
    "overall_percentage": 66.67,
    "by_termin": [
      {
        "termin_label": "Termin 1",
        "termin_sequence": "1",
        "termin_category": "termin",
        "planned_volume": 5,
        "actual_volume": 5,
        "progress_percentage": 100.0
      },
      {
        "termin_label": "Termin 2",
        "termin_sequence": "2",
        "termin_category": "termin",
        "planned_volume": 4,
        "actual_volume": 2,
        "progress_percentage": 50.0
      },
      {
        "termin_label": "Adendum 1",
        "termin_sequence": "1",
        "termin_category": "adendum",
        "planned_volume": 3,
        "actual_volume": 1,
        "progress_percentage": 33.33
      }
    ]
  }
}
```

**Field Descriptions:**

| Field | Type | Description |
|---|---|---|
| `total_planned` | `number` | Jumlah total WBS leaf items dengan alokasi termin |
| `total_executed` | `number` | Jumlah WBS leaf items yang actual_volume >= planned_volume |
| `overall_percentage` | `number` | `(total_executed / total_planned) * 100` |
| `by_termin` | array | Data per termin untuk ditampilkan di chart |
| `termin_label` | `string` | Label display seperti "Termin 1", "Adendum 1" |

---

## 4. Progress History Endpoints

### 4.1 GET /api/projects/:projectId/progress/history

Mengambil semua riwayat submission update progress. Dipakai oleh `ProgressHistoryTable`.

**Request**

```http
GET /api/projects/PRJ-001/progress/history
Authorization: Bearer <token>
```

**Query Parameters**

| Parameter      | Type   | Description                         |
| -------------- | ------ | ----------------------------------- |
| `wbs_id`       | string | Filter by WBS item                  |
| `termin_seq`   | string | Filter by termin sequence           |
| `page`         | number | Pagination (default: 1)             |
| `limit`        | number | Records per page (default: 20)      |

**Response (200 OK)**

```json
{
  "success": true,
  "data": [
    {
      "id": "hist-uuid-1",
      "project_id": "PRJ-001",
      "progress_date": "2026-03-01T10:30:00Z",
      "wbs_item": {
        "wbs_code": "1.2",
        "description": "Pembuatan Direksi Keet"
      },
      "termin": {
        "category": "termin",
        "sequence": "1"
      },
      "description": "Pembuatan direksi awal di sisi utara",
      "actual_volume": 0.5,
      "unit": "Ls",
      "photo_url": "uploads/progress/PRJ-001/hist-uuid-1.jpg",
      "created_by": {
        "id": "user-uuid-1",
        "full_name": "Ahmad Teknisi"
      }
    },
    {
      "id": "hist-uuid-2",
      "project_id": "PRJ-001",
      "progress_date": "2026-03-02T08:00:00Z",
      "wbs_item": {
        "wbs_code": "2.1",
        "description": "Galian Tanah Mesin"
      },
      "termin": {
        "category": "termin",
        "sequence": "2"
      },
      "description": "Galian sisi timur selesai",
      "actual_volume": 400,
      "unit": "m3",
      "photo_url": null,
      "created_by": {
        "id": "user-uuid-1",
        "full_name": "Ahmad Teknisi"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 2
  }
}
```

---

### 4.2 GET /api/projects/:projectId/progress/history/:recordId

Mengambil detail satu riwayat progress record. Dipakai oleh halaman detail (`/progress-monitoring/record/[recordId]`).

**Request**

```http
GET /api/projects/PRJ-001/progress/history/hist-uuid-1
Authorization: Bearer <token>
```

**Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "id": "hist-uuid-1",
    "project_id": "PRJ-001",
    "progress_date": "2026-03-01T10:30:00Z",
    "wbs_item": {
      "wbs_code": "1.2",
      "description": "Pembuatan Direksi Keet"
    },
    "termin": {
      "category": "termin",
      "sequence": "1"
    },
    "description": "Pembuatan direksi awal di sisi utara untuk koordinasi lapangan.",
    "actual_volume": 0.5,
    "unit": "Ls",
    "photo_url": "uploads/progress/PRJ-001/hist-uuid-1.jpg",
    "created_by": {
      "id": "user-uuid-1",
      "full_name": "Ahmad Teknisi"
    }
  }
}
```

> **Photo URL:** Jika `photo_url` bukan URL absolut (tidak dimulai dengan `http`), FE akan prefix dengan `NEXT_PUBLIC_API_URL`. Contoh: `http://localhost:8080/uploads/progress/PRJ-001/hist-uuid-1.jpg`

---

## 5. Progress Record Mutations

### 5.1 POST /api/projects/:projectId/progress

Mencatat progress baru dari modal **Update Progress**. Request menggunakan `multipart/form-data` karena ada upload foto.

**Request**

```http
POST /api/projects/PRJ-001/progress
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Form Data Fields**

| Field           | Type   | Required | Description                                      |
| --------------- | ------ | -------- | ------------------------------------------------ |
| `wbs_id`        | string | ✅       | ID WBS item yang diupdate                        |
| `termin_value`  | string | ✅       | Nilai termin, format: `"termin-1"` atau `"adendum-1"` |
| `actual_volume` | number | ✅       | Volume realisasi                                 |
| `description`   | string | ❌       | Catatan/deskripsi pekerjaan                      |
| `photo`         | file   | ❌       | Foto bukti pekerjaan (jpg/png, max 10MB)         |

**Response (201 Created)**

```json
{
  "success": true,
  "data": {
    "id": "hist-uuid-new",
    "project_id": "PRJ-001",
    "progress_date": "2026-03-03T16:00:00Z",
    "wbs_item": {
      "wbs_code": "1.2",
      "description": "Pembuatan Direksi Keet"
    },
    "termin": {
      "category": "termin",
      "sequence": "1"
    },
    "description": "Pembuatan direksi selesai",
    "actual_volume": 1,
    "unit": "Ls",
    "photo_url": "uploads/progress/PRJ-001/hist-uuid-new.jpg",
    "created_by": {
      "id": "user-uuid-1",
      "full_name": "Ahmad Teknisi"
    }
  },
  "message": "Progress recorded successfully"
}
```

> **Catatan perilaku:** Endpoint ini selalu membuat record baru, terlepas dari apakah progress untuk WBS+Termin tersebut sudah pernah disubmit sebelumnya (append-only). Progress Table akan menampilkan nilai dari record **terbaru**, sementara History Tab menampilkan semua record sebagai audit trail.

---

## 6. Data Schemas (TypeScript)

Sesuai `src/types/progress.ts`:

```typescript
// Untuk tab Progress Table
type WBSProgressMonitoringAllocation = {
  id: string;
  termin_sequence: string;          // "1", "2", "AD-1"
  termin_category: "termin" | "adendum";
  planned_volume: number;
  actual_volume: number;
};

type WBSProgressMonitoringItem = {
  id: string;
  wbs_id: string;                   // WBS code: "1.1", "2.1"
  description: string;
  planned_volume: number;
  unit: string;
  is_leaf: boolean;
  parent_id: string | null;
  progress: WBSProgressMonitoringAllocation[];
};

// Untuk tab Progress History (list & detail)
type ProgressHistoryRecord = {
  id: string;
  project_id?: string;
  progress_date: string;            // ISO datetime string
  wbs_item: {
    wbs_code: string;
    description: string;
  };
  termin: {
    category: "termin" | "adendum";
    sequence: string;               // "1", "2", "AD-1"
  };
  description: string;
  actual_volume: number;
  unit: string;
  photo_url?: string;               // URL relatif atau absolut
  created_by?: {
    id: string;
    full_name: string;
  };
};
```

---

## 7. Error Handling

| Code                     | HTTP Status | Description                                          |
| ------------------------ | ----------- | ---------------------------------------------------- |
| `PROGRESS_NOT_FOUND`     | 404         | Record progress tidak ditemukan                      |
| `NO_ALLOCATION_EXISTS`   | 400         | Tidak ada alokasi untuk termin+WBS yang diminta      |
| `WBS_NOT_LEAF`           | 400         | WBS item bukan leaf node, tidak bisa dicatat         |
| `FILE_TOO_LARGE`         | 400         | File foto melebihi batas ukuran (10MB)               |
| `UNSUPPORTED_FILE_TYPE`  | 400         | Tipe file tidak didukung (hanya jpg/png)             |

**Error Response Format:**

```json
{
  "success": false,
  "error": {
    "code": "NO_ALLOCATION_EXISTS",
    "message": "Tidak ada alokasi untuk WBS 1.2 pada Termin 3"
  }
}
```

---

## 8. Backend Implementation Notes

### 8.1 Database Tables

```sql
-- Tabel utama progress records (history logs)
CREATE TABLE progress_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  wbs_item_id UUID NOT NULL REFERENCES wbs_items(id),
  termin_id UUID NOT NULL REFERENCES termins(id),
  actual_volume DECIMAL(12,4) NOT NULL CHECK (actual_volume >= 0),
  description TEXT,
  photo_url TEXT,
  progress_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

> **Catatan:** Tidak ada constraint `UNIQUE(termin_id, wbs_item_id)` karena history memperbolehkan multiple submissions untuk WBS + termin yang sama.

### 8.2 Table Endpoint Logic

Endpoint `/progress/table` menggabungkan data dari 3 sumber:

```
WBS Items (hirarki)           ← wbs_items table
  + Termin Allocations         ← termin_allocations table (planned_volume)
  + Latest Progress Records    ← progress_records (actual_volume terbaru per WBS+Termin)
  = WBSProgressMonitoringItem[]
```

**Cara mengambil `actual_volume` terbaru per WBS+Termin (Latest Record Wins):**

```sql
-- Ambil actual_volume dari submission terbaru per kombinasi WBS+Termin
SELECT DISTINCT ON (pr.wbs_item_id, pr.termin_id)
  pr.wbs_item_id,
  pr.termin_id,
  pr.actual_volume,
  pr.progress_date
FROM progress_records pr
WHERE pr.project_id = :projectId
ORDER BY pr.wbs_item_id, pr.termin_id, pr.progress_date DESC;
```

> Dengan pola ini, setiap `POST` progress baru untuk WBS+Termin yang sama akan otomatis "mengoverride" nilai yang tampil di Progress Table, karena query selalu mengambil record terbaru.

### 8.3 Summary Endpoint Logic

```sql
-- total_planned: WBS leaves dengan alokasi
SELECT COUNT(DISTINCT ta.wbs_item_id) as total_planned
FROM termin_allocations ta
WHERE ta.project_id = :projectId;

-- total_executed: WBS leaves yang actual_volume terbaru >= planned_volume
-- Join latest progress per WBS+Termin dengan allocation, filter yang sudah 100%
```

### 8.4 Photo Upload

- Simpan ke file storage (S3 / local `/uploads/progress/[projectId]/`)
- Kembalikan path relatif, FE akan resolve dengan `NEXT_PUBLIC_API_URL`
- Jika URL dimulai dengan `http`, FE gunakan langsung

---

> **Document Version**: 2.1  
> **Related Documentation**:
>
> - [Database Schema](../database/DATABASE-SCHEMA.md)
> - [Termin Planning API Contract](./TERMIN-PLANNING-API-CONTRACT.md)
> - [Projects API Contract](./PROJECTS-API-CONTRACT.md)
> - [WBS API Contract](./WBS-API-CONTRACT.md)

