# Termin Planning - API Contract

> **Version**: 2.0  
> **Last Updated**: 2026-03-01  
> **Base URL**: `/api`

> ⚠️ **Keputusan Arsitektur**: FE menggunakan **Opsi 2** — satu endpoint GET yang mengembalikan data WBS beserta alokasi termin sekaligus (bukan gabung 2 endpoint).

---

## Daftar Isi

1. [Overview](#1-overview)
2. [Endpoints](#2-endpoints)
   - [GET WBS + Termin Allocations (JOIN)](#21-get-apiprojectsprojectidwbs-termin-planning)
   - [POST Save Allocations (Auto-Save)](#22-post-apiprojectsprojectidtermin-allocations)
3. [Data Types (Frontend)](#3-data-types-frontend)
4. [Error Handling](#4-error-handling)
5. [Backend Implementation Notes](#5-backend-implementation-notes)

---

## 1. Overview

Fitur Termin Planning mengalokasikan volume pekerjaan WBS (`leaf node`) ke dalam termin/adendum pembayaran proyek.

### Core Concept

```
WBS Leaf Item (Volume: 200 m)
   │
   ├── Termin 1: 50 m  (Allocated → simpan di DB)
   ├── Termin 2: 100 m (Allocated → simpan di DB)
   └── Remaining: 50 m (DERIVED, JANGAN simpan di DB → Total - Sum(Allocated))
```

### Alur Data

```
useGetAllTerminAllocations() → GET /projects/:id/wbs-termin-planning
                             ↓ Baris tabel (WBS tree) + isi nilai alokasi tiap kolom termin

useSaveTerminAllocations()   → POST /projects/:id/termin-allocations/bulk
                             ↓ Auto-Save: Simpan satu sel saat input blur (atau banyak sekaligus)
```

### Key Rules

> ⚠️ **JANGAN SIMPAN `remaining_volume` DI DATABASE**  
> `Remaining = wbs_item.volume - SUM(allocations.volume for that wbs_item)`

---

## 2. Endpoints

### 2.1 GET /api/projects/:projectId/wbs-termin-planning

> 🆕 **Endpoint baru yang perlu dibuat di backend.**

Mengambil seluruh data WBS (parent & child/leaf) beserta alokasi termin yang sudah ada. Menggantikan pendekatan lama yang menggabungkan 2 endpoint secara manual di FE.

**Request**

```http
GET /api/projects/PRJ-001/wbs-termin-planning
Authorization: Bearer <token>
```

**Response (200 OK)**

```json
{
  "success": true,
  "data": [
    {
      "wbs_id": "1",
      "description": "Pekerjaan Sipil",
      "volume": null,
      "unit": null,
      "is_leaf": false,
      "parent_id": null,
      "allocations": []
    },
    {
      "wbs_id": "1.1",
      "description": "Sub Pekerjaan",
      "volume": null,
      "unit": null,
      "is_leaf": false,
      "parent_id": "1",
      "allocations": []
    },
    {
      "wbs_id": "1.1.1",
      "description": "Galian Tanah",
      "volume": 200,
      "unit": "m3",
      "is_leaf": true,
      "parent_id": "1.1",
      "allocations": [
        {
          "termin_sequence": "1",
          "termin_category": "termin",
          "volume": 50
        },
        {
          "termin_sequence": "2",
          "termin_category": "termin",
          "volume": 100
        }
      ]
    },
    {
      "wbs_id": "1.1.2",
      "description": "Urugan Tanah",
      "volume": 150,
      "unit": "m3",
      "is_leaf": true,
      "parent_id": "1.1",
      "allocations": []
    }
  ]
}
```

**Field Specifications (Item Level)**

| Field         | Type               | Description                                                     |
| ------------- | ------------------ | --------------------------------------------------------------- |
| `wbs_id`      | string             | Kode WBS (e.g. "1", "1.1", "1.1.1")                             |
| `description` | string             | Nama pekerjaan                                                  |
| `volume`      | number \| null     | Total volume (null untuk parent/non-leaf)                       |
| `unit`        | string \| null     | Satuan volume (null untuk parent/non-leaf)                      |
| `is_leaf`     | boolean            | `true` jika item adalah leaf node (bisa dialokasikan ke termin) |
| `parent_id`   | string \| null     | `wbs_id` parent. `null` jika root                               |
| `allocations` | `AllocationItem[]` | Array alokasi yang sudah ada (kosong `[]` jika belum ada)       |

**Field Specifications (allocations[n])**

| Field             | Type                      | Description                                                 |
| ----------------- | ------------------------- | ----------------------------------------------------------- |
| `termin_sequence` | string                    | Sequence termin (cocokkan dgn `TerminInformation.sequence`) |
| `termin_category` | `"termin"` \| `"adendum"` | Category (cocokkan dgn `TerminInformation.category`)        |
| `volume`          | number                    | Volume yang sudah dialokasikan                              |

> ℹ️ Kombinasi `termin_sequence + termin_category` digunakan FE untuk mencocokkan data alokasi ke kolom yang tepat di tabel.

---

### 2.2 POST /api/projects/:projectId/termin-allocations

> 🆕 **Endpoint baru yang perlu dibuat di backend.**

Menyimpan perubahan alokasi. FE memanggil endpoint ini secara **auto-save (onBlur)** setiap kali user selesai mengedit satu sel. Endpoint ini menerima **1 record** modifikasi.

**Request**

```http
POST /api/projects/PRJ-001/termin-allocations
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body**

```json
{
  "wbs_id": "1.1.1",
  "termin_sequence": "1",
  "termin_category": "termin",
  "volume": 50
}
```

**Field Specifications**

| Field             | Type   | Required | Constraints                                            |
| ----------------- | ------ | -------- | ------------------------------------------------------ |
| `wbs_id`          | string | Yes      | Harus berupa leaf node                                 |
| `termin_sequence` | string | Yes      | Harus ada di daftar termin proyek                      |
| `termin_category` | string | Yes      | `"termin"` atau `"adendum"`                            |
| `volume`          | number | Yes      | `>= 0`. Jika `0`, backend boleh delete record yang ada |

> ℹ️ Backend harus melakukan **upsert** — buat baru jika belum ada, update jika sudah ada, hapus jika `volume = 0`.

**Response (200 OK)**

```json
{
  "success": true,
  "message": "Alokasi termin berhasil disimpan"
}
```

**Response (400 Bad Request — Volume Exceeded)**

```json
{
  "success": false,
  "message": "VOLUME_EXCEEDED",
  "errors": [
    {
      "wbs_id": "1.1.1",
      "message": "Total alokasi (180) melebihi volume WBS (200 m3)"
    }
  ]
}
```

---

## 3. Data Types (Frontend)

TypeScript types yang digunakan FE (`src/types/termin.ts`):

```typescript
// Definisi termin/adendum dari project
export type TerminInformation = {
  sequence: string; // Nomor urut ("1", "2", ...)
  description: string; // Deskripsi milestone
  nominal: number; // Target nilai nominal (Rupiah)
  category?: "termin" | "adendum";
};

// Payload auto-save (dikirim per cell saat onBlur)
export type TerminAllocationPayload = {
  wbs_id: string; // Kode WBS leaf
  termin_sequence: string; // Merujuk ke TerminInformation.sequence
  termin_category: "termin" | "adendum";
  volume: number; // Volume yang dialokasikan (baru)
};
```

Data WBS (termasuk data allocations) menggunakan type `WBSData` dari `src/types/cbs-wbs.ts`.

---

## 4. Error Handling

| Code                | HTTP Status | Description                                           |
| ------------------- | ----------- | ----------------------------------------------------- |
| `VOLUME_EXCEEDED`   | 400         | Total alokasi melebihi volume WBS untuk item tertentu |
| `WBS_NOT_FOUND`     | 404         | `wbs_id` tidak ditemukan di proyek                    |
| `TERMIN_NOT_FOUND`  | 404         | `termin_sequence` tidak ada di proyek                 |
| `WBS_NOT_LEAF`      | 400         | Item WBS adalah parent, tidak bisa dialokasikan       |
| `PROJECT_NOT_FOUND` | 404         | Project tidak ditemukan                               |

---

## 5. Backend Implementation Notes

### 5.1 Database Schema

```sql
-- Tabel alokasi termin (hanya untuk leaf WBS nodes)
CREATE TABLE termin_allocations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  termin_id     UUID NOT NULL REFERENCES termins(id) ON DELETE CASCADE,
  wbs_item_id   UUID NOT NULL REFERENCES wbs_items(id) ON DELETE CASCADE,
  volume        DECIMAL(12,4) NOT NULL CHECK (volume >= 0),
  created_at    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT uq_termin_wbs UNIQUE (termin_id, wbs_item_id)
);

CREATE INDEX idx_ta_project ON termin_allocations(project_id);
CREATE INDEX idx_ta_termin  ON termin_allocations(termin_id);
```

### 5.2 Query untuk GET /wbs-termin-planning

Backend perlu mengambil semua WBS item (parent & leaf) lalu per leaf-node LEFT JOIN dengan tabel alokasi:

```sql
SELECT
  w.wbs_code      AS wbs_id,
  w.description,
  w.volume,
  w.unit,
  w.is_leaf,
  p.wbs_code      AS parent_id, -- parent wbs_code atau NULL
  t.sequence      AS termin_sequence,
  t.category      AS termin_category,
  ta.volume       AS allocated_volume
FROM wbs_items w
LEFT JOIN wbs_items p  ON w.parent_id = p.id
LEFT JOIN termin_allocations ta ON ta.wbs_item_id = w.id
LEFT JOIN termins t ON t.id = ta.termin_id
WHERE w.project_id = :projectId
  AND w.deleted_at IS NULL
ORDER BY w.wbs_code;
```

Backend kemudian me-reshape hasil query ini menjadi nested structure (tiap `wbs_id` punya field `allocations: []`).

### 5.3 Bulk Save (Upsert Logic)

```javascript
async function bulkSaveAllocations(projectId, allocations) {
  for (const item of allocations) {
    const termin = await db.termins.findOne({
      project_id: projectId,
      sequence: item.termin_sequence,
    });
    const wbs = await db.wbsItems.findOne({
      project_id: projectId,
      wbs_code: item.wbs_id,
    });

    if (!wbs.is_leaf) throw new Error("WBS_NOT_LEAF");

    if (item.volume === 0) {
      // Hapus record jika volume 0
      await db.terminAllocations.delete({
        termin_id: termin.id,
        wbs_item_id: wbs.id,
      });
    } else {
      // Validasi tidak melebihi total volume WBS
      await validateTotalAllocation(wbs.id, item.volume, termin.id);

      // Upsert
      await db.terminAllocations.upsert({
        where: { termin_id: termin.id, wbs_item_id: wbs.id },
        create: {
          project_id: projectId,
          termin_id: termin.id,
          wbs_item_id: wbs.id,
          volume: item.volume,
        },
        update: { volume: item.volume },
      });
    }
  }
}
```

---

> **Document Version**: 2.0  
> **Related Documentation**:
>
> - [WBS API Contract](./WBS-API-CONTRACT.md)
> - [Projects API Contract](./PROJECTS-API-CONTRACT.md)
> - [Database Schema](../database/DATABASE-SCHEMA.md)
> - [Frontend Integration Guide](../../frontend/function/TERMIN-PLANNING-DOCUMENTATION.md)
