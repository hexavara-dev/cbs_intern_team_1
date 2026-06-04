# Cost In - API Contract

> **Version**: 1.0
> **Last Updated**: 2026-03-04
> **Base URL**: `/api`

> ⚠️ **Field Names Match Frontend Types** - Request/Response menggunakan nama field yang sama dengan `src/types/cost.ts` dan `src/types/termin.ts`

---

## Daftar Isi

1. [Overview](#1-overview)
2. [Cost In Endpoints](#2-cost-in-endpoints)
   - [GET /api/projects/:projectId/cost-in](#21-get-apiprojectsprojectidcost-in)
   - [GET /api/projects/:projectId/cost-in/summary](#22-get-apiprojectsprojectidcost-insummary)
   - [POST /api/projects/:projectId/cost-in](#23-post-apiprojectsprojectidcost-in)
   - [GET /api/projects/:projectId/cost-in/:recordId](#24-get-apiprojectsprojectidcost-inrecordid)
3. [Data Schemas](#3-data-schemas)
4. [Error Handling](#4-error-handling)
5. [Backend Implementation Notes](#5-backend-implementation-notes)

---

## 1. Overview

Fitur **Cost In** digunakan untuk mencatat dan memantau penerimaan dana proyek per termin/adendum. Halaman ini memerlukan data dari beberapa sumber:

| Data            | Sumber                                         | Digunakan Di                   |
| --------------- | ---------------------------------------------- | ------------------------------ |
| Summary Cost In | `GET /api/projects/:projectId/cost-in/summary` | Summary Table (total_received) |
| Riwayat Cost In | `GET /api/projects/:projectId/cost-in`         | History Table                  |
| Detail Cost In  | `GET /api/projects/:projectId/cost-in/:id`     | Detail Page                    |
| Create Cost In  | `POST /api/projects/:projectId/cost-in`        | Form Dialog                    |

### Database Tables yang Relevan

| Table     | Purpose                               |
| --------- | ------------------------------------- |
| `cost_in` | Riwayat penerimaan dana per transaksi |

---

## 2. Cost In Endpoints

### 2.1 GET /api/projects/:projectId/cost-in

Mengambil **daftar riwayat** penerimaan dana (Cost In) untuk halaman History Tab.

**Request**

```http
GET /api/projects/PRJ-001/cost-in
Authorization: Bearer <token>
```

**Query Parameters**

| Parameter   | Type   | Required | Description                  |
| ----------- | ------ | -------- | ---------------------------- |
| `termin_id` | string | No       | Filter by termin ID          |
| `date_from` | string | No       | ISO date (YYYY-MM-DD)        |
| `date_to`   | string | No       | ISO date (YYYY-MM-DD)        |
| `page`      | number | No       | Page number (default: 1)     |
| `limit`     | number | No       | Items per page (default: 20) |

**Response (200 OK)**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-costin-1",
      "termin": {
        "id": "uuid-termin-1",
        "sequence": "1",
        "category": "termin",
        "description": "Uang Muka (20%)",
        "nominal": 100000000
      },
      "transaction_date": "2026-03-01T10:00:00Z",
      "description": "Pembayaran Uang Muka Proyek",
      "amount": 100000000
    },
    {
      "id": "uuid-costin-2",
      "termin": {
        "id": "uuid-termin-2",
        "sequence": "2",
        "category": "termin",
        "description": "Progres 50%",
        "nominal": 150000000
      },
      "transaction_date": "2026-03-10T14:30:00Z",
      "description": "Pembayaran Termin 2 (Parsial)",
      "amount": 50000000
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "total_pages": 1
  }
}
```

---

### 2.2 GET /api/projects/:projectId/cost-in/summary

Mengambil **ringkasan penerimaan** per termin, digunakan untuk **Summary Tab** (termasuk kolom `total_received` dan kalkulasi sisa).

> Backend harus menghitung `total_received` dengan menjumlahkan semua `amount` dari tabel `cost_in` yang berelasi ke tiap termin.

**Request**

```http
GET /api/projects/PRJ-001/cost-in/summary
Authorization: Bearer <token>
```

**Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "total_cost_in": 200000000,
    "termins": [
      {
        "id": "uuid-termin-1",
        "sequence": "1",
        "category": "termin",
        "description": "Uang Muka (20%)",
        "nominal": 100000000,
        "total_received": 100000000
      },
      {
        "id": "uuid-termin-2",
        "sequence": "2",
        "category": "termin",
        "description": "Progres 50%",
        "nominal": 150000000,
        "total_received": 100000000
      },
      {
        "id": "uuid-termin-3",
        "sequence": "3",
        "category": "termin",
        "description": "Pelunasan (100%)",
        "nominal": 250000000,
        "total_received": 0
      }
    ]
  }
}
```

**Field Summary Response**

| Field                      | Type   | Description                                    |
| -------------------------- | ------ | ---------------------------------------------- |
| `total_cost_in`            | number | Jumlah total semua penerimaan dana proyek      |
| `termins`                  | array  | Daftar termin + kalkulasi penerimaan           |
| `termins[].total_received` | number | SUM dari semua cost_in.amount untuk termin ini |

> ⚠️ **Catatan Frontend**: `remaining = nominal - total_received`. Frontend menghitung selisih sendiri dari nilai ini. Status **Lunas** ditampilkan jika `remaining ≤ 0`.

---

### 2.3 POST /api/projects/:projectId/cost-in

Mencatat satu transaksi penerimaan dana baru.

**Request**

```http
POST /api/projects/PRJ-001/cost-in
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

> ⚠️ Request menggunakan `multipart/form-data` karena ada upload file `proof_file` (bukti transfer).

**Request Body (Form Fields)**

| Field              | Type        | Required | Description                                       |
| ------------------ | ----------- | -------- | ------------------------------------------------- |
| `termin_id`        | string UUID | Yes      | ID termin/adendum terkait                         |
| `transaction_date` | string      | Yes      | Tanggal transaksi (YYYY-MM-DD atau ISO 8601)      |
| `description`      | string      | Yes      | Keterangan transaksi (Ex: "Pembayaran Uang Muka") |
| `amount`           | number      | Yes      | Nominal yang diterima (Rp)                        |
| `proof_file`       | File        | No       | File bukti transfer (image/\*, .pdf)              |

**Contoh Request (multipart)**

```http
POST /api/projects/PRJ-001/cost-in
Content-Type: multipart/form-data; boundary=---boundary

-----boundary
Content-Disposition: form-data; name="termin_id"

uuid-termin-1
-----boundary
Content-Disposition: form-data; name="transaction_date"

2026-03-01
-----boundary
Content-Disposition: form-data; name="description"

Pembayaran Uang Muka Proyek
-----boundary
Content-Disposition: form-data; name="amount"

100000000
-----boundary
Content-Disposition: form-data; name="proof_file"; filename="bukti-tf.jpg"
Content-Type: image/jpeg

<binary image data>
-----boundary--
```

**Response (201 Created)**

```json
{
  "success": true,
  "data": {
    "id": "uuid-costin-new",
    "termin": {
      "id": "uuid-termin-1",
      "sequence": "1",
      "category": "termin",
      "description": "Uang Muka (20%)",
      "nominal": 100000000
    },
    "transaction_date": "2026-03-01T00:00:00Z",
    "description": "Pembayaran Uang Muka Proyek",
    "amount": 100000000,
    "proof_file": "https://storage.example.com/cost-in/bukti-tf-uuid.jpg",
    "created_by": {
      "id": "uuid-user-1",
      "full_name": "Admin Keuangan"
    },
    "created_at": "2026-03-01T10:00:00Z"
  },
  "message": "Cost In berhasil dicatat"
}
```

---

### 2.4 GET /api/projects/:projectId/cost-in/:recordId

Mengambil **detail satu transaksi** Cost In, digunakan pada halaman detail (`/cost-in/record/[recordId]`).

**Request**

```http
GET /api/projects/PRJ-001/cost-in/uuid-costin-1
Authorization: Bearer <token>
```

**Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "id": "uuid-costin-1",
    "termin": {
      "id": "uuid-termin-1",
      "sequence": "1",
      "category": "termin",
      "description": "Uang Muka (20%)",
      "nominal": 100000000
    },
    "transaction_date": "2026-03-01T10:00:00Z",
    "description": "Pembayaran Uang Muka Proyek",
    "amount": 100000000,
    "proof_file": "https://storage.example.com/cost-in/bukti-tf-uuid.jpg",
    "created_by": {
      "id": "uuid-user-1",
      "full_name": "Admin Keuangan"
    },
    "created_at": "2026-03-01T10:00:00Z"
  }
}
```

---

## 3. Data Schemas

### CostInRecord (Frontend Type)

```typescript
// src/types/cost.ts
export type CostInRecord = {
  id: string;
  termin: TerminInformation; // Nested object, bukan termin_id
  transaction_date: string; // ISO 8601
  description: string;
  amount: number;
};
```

### CostInRecordDetail (Frontend Type)

```typescript
// src/types/cost.ts - extends CostInRecord
export type CostInRecordDetail = CostInRecord & {
  proof_file?: string; // URL ke file bukti transfer
  created_by?: UserReference; // { id: string; full_name: string }
};
```

### TerminInformation (Frontend Type)

```typescript
// src/types/termin.ts
export type TerminInformation = {
  id?: string;
  sequence: string;
  description: string;
  nominal: number;
  category?: "termin" | "adendum";
};
```

### CostInTerminSummary (Frontend Type)

```typescript
// src/app/projects/[projectId]/cost-in/page.tsx
export type CostInTerminSummary = TerminInformation & {
  total_received: number; // Dihitung dari SUM cost_in.amount
};
```

### UserReference (Frontend Type)

```typescript
// src/types/user.ts
export interface UserReference {
  id: string;
  full_name: string;
}
```

---

## 4. Error Handling

### HTTP Error Responses (Standar)

```json
{
  "success": false,
  "error": {
    "code": "COSTIN_NOT_FOUND",
    "message": "Cost In record tidak ditemukan"
  }
}
```

### Error Codes

| Code                    | HTTP Status | Description                            |
| ----------------------- | ----------- | -------------------------------------- |
| `COSTIN_NOT_FOUND`      | 404         | Record Cost In tidak ditemukan         |
| `TERMIN_NOT_FOUND`      | 404         | Termin/adendum dengan ID tsb tidak ada |
| `PROJECT_NOT_FOUND`     | 404         | Proyek tidak ditemukan                 |
| `AMOUNT_EXCEEDS_TERMIN` | 422         | Jumlah melebihi nilai nominal termin   |
| `INVALID_DATE`          | 400         | Format tanggal tidak valid             |
| `FILE_TOO_LARGE`        | 413         | File bukti transfer terlalu besar      |
| `INVALID_FILE_TYPE`     | 400         | Tipe file tidak didukung               |

---

## 5. Backend Implementation Notes

### 5.1 Penghitungan `total_received` di Summary

Backend harus mengagregasi data saat query summary:

```sql
SELECT
  t.id,
  t.sequence,
  t.category,
  t.description,
  t.nominal,
  COALESCE(SUM(ci.amount), 0) AS total_received
FROM termins t
LEFT JOIN cost_in ci ON ci.termin_id = t.id
WHERE t.project_id = :projectId
GROUP BY t.id, t.sequence, t.category, t.description, t.nominal
ORDER BY t.category, t.sequence::int;
```

### 5.2 Perhitungan `total_cost_in` di Summary

```sql
SELECT COALESCE(SUM(amount), 0) AS total_cost_in
FROM cost_in
WHERE project_id = :projectId;
```

### 5.3 File Upload (proof_file)

- File disimpan ke object storage (S3/GCS/MinIO)
- Respons menyertakan URL publik/presigned
- Validasi: hanya `image/*` dan `.pdf`, maksimum **5MB**
- Nama file harus di-sanitize dan diganti dengan UUID agar unik

```javascript
// Contoh upload handler (Node.js + Multer)
async function uploadProofFile(file) {
  if (!file) return null;

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error("INVALID_FILE_TYPE");
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error("FILE_TOO_LARGE");
  }

  const filename = `cost-in/${uuid()}-${file.originalname}`;
  const url = await storage.upload(filename, file.buffer);

  return url;
}
```

### 5.4 Validasi `amount` (Opsional)

Backend bisa memvalidasi bahwa total yang sudah diterima tidak melebihi nominal termin:

```javascript
async function validateAmount(terminId, newAmount) {
  const termin = await db.termins.findById(terminId);
  const totalReceived = await db.costIn
    .sum("amount")
    .where({ termin_id: terminId });

  if (totalReceived + newAmount > termin.nominal) {
    throw new Error("AMOUNT_EXCEEDS_TERMIN");
  }
}
```

> ⚠️ Pertimbangkan apakah validasi over-payment ini perlu di-enforce atau hanya sebagai warning di frontend (karena adendum bisa ditambahkan belakangan).

### 5.5 Response File URL

Jika backend menyimpan path relatif, frontend perlu prefix dengan `NEXT_PUBLIC_API_URL`. Disarankan backend langsung mengembalikan **URL absolut** pada field `proof_file` agar lebih sederhana.

---

> **Document Version**: 1.0
> **Related Documentation**:
>
> - [Cost Control API Contract](./COST-CONTROL-API-CONTRACT.md)
> - [Termin Planning API Contract](./TERMIN-PLANNING-API-CONTRACT.md)
> - [Projects API Contract](./PROJECTS-API-CONTRACT.md)
