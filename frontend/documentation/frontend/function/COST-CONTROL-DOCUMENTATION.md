# Cost Control - Technical Documentation

Dokumentasi ini menjelaskan modul **Cost Control**, yang menangani pencatatan pengeluaran, alur persetujuan (approval), dan pengelolaan histori transaksi.

## Daftar Isi

1.  [Overview & Workflow](#1-overview--workflow)
2.  [Core Data Models](#2-core-data-models)
3.  [Component Architecture](#3-component-architecture)
4.  [Backend Integration Guide](#4-backend-integration-guide)

---

## 1. Overview & Workflow

Modul **Cost Control** mengubah pencatatan biaya menjadi sistem berbasis permintaan (request-based).

**Alur Kerja:**

1.  **Request (Record Cost Out)**:
    - Site Manager / Admin mengisi form pengajuan biaya (`RequestCostPage`).
    - Memilih Vendor, WBS Item, dan mendetailkan item belanja (Deskripsi, Kategori CBS, Harga).
    - Data disimpan dengan status `pending`.
2.  **Monitoring (Dashboard)**:
    - User melihat ada notifikasi "Pending Requests" di Dashboard Cost Control.
    - Tersedia Tab/Toggle View untuk melihat "Approved History" atau "Pending Requests".
3.  **Approval / Rejection**:
    - Project Manager mereview item di "Pending Requests".
    - **Approve**: WAJIB mengupload/menyertakan bukti nota (file/link). Status berubah menjadi `approved`.
    - **Reject**: Status berubah menjadi `rejected`.

---

## 2. Core Data Models

Struktur data utama untuk Cost Control.

```typescript
// src/types/cost.ts (Updated)

export type CostOutRecord = {
  id: string;
  project_id: string;
  wbs_id: string; // Ref ke WBS
  date: string;
  vendor?: string; // Nama Vendor / Supplier
  status: "pending" | "approved" | "rejected";
  nota_proof?: string; // Path/URL ke file bukti (diisi saat Approved)

  // Detail Items
  items: CostItem[];
  total_amount: number;
};

export type CostItem = {
  id: string;
  description: string;
  cbs_category?: string; // Kategori CBS per Item (Move from Parent)
  cost: number;
  quantity: number;
  total: number;
};
```

---

## 3. Component Architecture

| Komponen               | Lokasi File             | Fungsi & Tanggung Jawab                                                                                                               |
| :--------------------- | :---------------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| **`CostControlPage`**  | `cost-control/page.tsx` | **Main Dashboard**. Mengatur navigasi antara View "History" dan "Pending". Merender list Pending dengan tombol Approve/Reject.        |
| **`RequestCostPage`**  | `record-cost/page.tsx`  | **Form Input**. Menggunakan `react-hook-form` & `useFieldArray`. Fitur: Vendor Select, Custom Combobox Description, Multi-item input. |
| **`CostHistoryList`**  | `CostHistoryList.tsx`   | **View Component**. Menampilkan list history transaksi yang sudah Approved. Menampilkan deskripsi WBS dari Store.                     |
| **`ItemInputSection`** | `ItemInputSection.tsx`  | Sub-komponen (Form terpisah) untuk input detail item secara berulang. Menggunakan `onAdd` untuk mengirim data ke Parent Form.         |
| **`InputCombobox`**    | `input-combobox.tsx`    | Input spesial yang memungkinkan user memilih opsi yang sudah ada atau mengetik value baru (Createable Select).                        |

### Note: `onAdd` vs `onSubmit` Flow

Penting untuk memahami perbedaan alur data di halaman `RequestCostPage` (Frontend):

1.  **`onAdd` (Local State - Client Side)**:
    - Dipicu oleh tombol "Add" di `ItemInputSection`.
    - **Fungsi**: Memvalidasi input item (cost, qty, dll) dan menambahkannya ke array list item sementara (`fields` di `useFieldArray`) di halaman tersebut.
    - **Belum** dikirim ke backend. Ini hanya "Add to Cart" istilahnya.
    - _Tidak ada endpoint API yang dipanggil disini._

2.  **`onSubmit` (Server Submission)**:
    - Dipicu oleh tombol "Submit Request" di bagian bawah halaman utama.
    - **Fungsi**: Mengambil seluruh data form (Vendor, Tanggal, dan Array Items yang sudah di-add tadi), lalu mengirimnya ke Backend via API (A. Create Request).
    - Ini adalah titik integrasi dengan Backend.

---

## 4. Backend Integration Guide

Berikut adalah spesifikasi endpoint API yang dibutuhkan untuk mensupport fitur ini.

### A. Create Request (POST)

Mengajukan biaya baru.

- **Endpoint:** `POST /api/projects/:projectId/costs`
- **Body:**
  ```json
  {
    "wbs_id": "1.1.1",
    "date": "2024-02-05",
    "vendor": "CV. Bangun Jaya",
    "items": [
      {
        "description": "Semen Gresik 40kg",
        "cbs_category": "Material-Per Item",
        "cost": 55000,
        "quantity": 10
      }
    ]
  }
  ```
- **Logic Backend:**
  - Generate ID.
  - Set `status` default = `pending`.
  - Hitung `total_amount` server-side.

### B. Get Requests (GET)

Mengambil list transaksi (bisa difilter status).

- **Endpoint:** `GET /api/projects/:projectId/costs`
- **Params:** `?status=pending` (untuk tab Pending) atau `?status=approved` (untuk tab History).

### C. Approve Request (PATCH/PUT)

Menyetujui request dan menyimpan bukti nota.

- **Endpoint:** `PATCH /api/costs/:recordId/approve`
- **Body:** (Multipart Form Data jika upload file, atau JSON juka URL)
  ```json
  {
    "nota_proof": "https://storage.bucket/nota-123.jpg"
  }
  ```
- **Logic Backend:**
  - Update `status` = `approved`.
  - Simpan URL/Path nota.

### D. Reject Request (PATCH/PUT)

Menolak request.

- **Endpoint:** `PATCH /api/costs/:recordId/reject`
- **Body:** `{}` (Bisa tambahkan `reason` jika perlu di masa depan)
  - Update `status` = `rejected`.

### E. Master Data (Vendors & Descriptions)

> [!NOTE]
> Saat ini, data **Vendor** dan **Deskripsi Item** di Frontend masih menggunakan **Dummy Data** (`src/data/dummy-cost.ts`). Untuk integrasi production, Backend perlu menyediakan endpoint untuk mengambil daftar ini.

#### 1. Get Vendors

Endpoint untuk mengisi dropdown Vendor.

- **Endpoint:** `GET /api/vendors` (atau scope per project `GET /api/projects/:id/vendors`)
- **Response:**
  ```typescript
  type VendorOption = {
    label: string; // Tampil di UI (e.g. "TB. Sejahtera")
    value: string; // Disimpan di DB (ID atau Nama)
  }[];
  ```

#### 2. Get Item Descriptions (Suggestions)

Endpoint untuk autocomplete deskripsi item saat user mengetik. `InputCombobox` di frontend mendukung input bebas (free-text), namun suggestion bisa diambil dari history item sebelumnya atau table master material.

- **Endpoint:** `GET /api/items/suggestions`
- **Response:**
  ```typescript
  type ItemSuggestion = {
    label: string; // e.g. "Semen Tiga Roda 40kg"
    value: string;
  }[];
  ```

#### 3. Dynamic Creation (Logic di Backend)

Karena Frontend mengizinkan "Type New Vendor" atau "Type New Description", Backend harus menangani value yang tidak ada di master data saat Create Request (POST).

- **Logic saat menerima POST `/costs`**:
  1.  Cek apakah `vendor` ada di Master Vendor?
      - **No**: Insert `vendor` baru ke Master Vendor.
  2.  Loop setiap item:
      - Cek apakah `description` ada di Master Material/Item?
      - **No**: (Opsional) Insert ke Master Item atau sekadar simpan sebagai text free-form.

#### 4. Handling Custom Input vs Selection

Frontend mengirimkan data `vendor` dan `description` sebagai **String** biasa di payload JSON, baik itu hasil seleksi dari dropdown maupun ketikan manual user (Create New).

- **Scenario A (User Selects Existing):**
  - User memilih "TB. Sejahtera".
  - Payload: `"vendor": "TB. Sejahtera"`
  - Backend: Cek DB, vendor exist -> Link ke existing ID (jika relational) atau simpan stringnya.

- **Scenario B (User Types New):**
  - User mengetik "Toko Besi Baru" dan klik "Create".
  - Payload: `"vendor": "Toko Besi Baru"`
  - Backend:
    1.  Cek DB -> "Toko Besi Baru" tidak ditemukan.
    2.  **Auto-Create**: Insert "Toko Besi Baru" ke tabel Master Vendor.
    3.  Gunakan ID dari vendor baru tersebut untuk record cost ini.

**Kesimpulan**: Frontend tidak membedakan flag `is_new` atau `id`. Backend yang bertanggung jawab melakukan _Reconciliation_ (Check or Create) berdasarkan string name yang dikirim.
