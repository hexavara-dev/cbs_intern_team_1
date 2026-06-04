# Cost Report - Technical Documentation

Dokumentasi ini menjelaskan arsitektur teknis, logika pemrosesan data, dan panduan integrasi backend untuk modul **Cost Report** (sebelumnya Cost Monitoring).

## Daftar Isi

1.  [Overview & Workflow](#1-overview--workflow)
2.  [Core Data Models](#2-core-data-models)
3.  [Component Architecture](#3-component-architecture)
4.  [Frontend Data Processing (Aggregation Logic)](#4-frontend-data-processing-aggregation-logic)
5.  [Backend Integration Guide (TanStack Query)](#5-backend-integration-guide-tanstack-query)

---

## 1. Overview & Workflow

Modul **Cost Report** berfungsi sebagai dashboard analitik untuk memonitor kesehatan keuangan proyek. Data yang ditampilkan berasal dari modul **Cost Control** (transaksi yang sudah di-approve).

**Alur Kerja Data:**

1.  **Source Data**: Mengambil data `CostOutRecord` yang berstatus `approved` dari module Cost Control.
2.  **Aggregation**: Sistem mengagregasi data tersebut secara real-time di client-side.
3.  **Visualization**:
    - **Budget Usage (Radial Chart)**: Persentase total actual vs budget.
    - **CBS Comparison (Bar Chart)**: Perbandingan per kategori pekerjaan.
    - **WBS Monitoring (Table)**: Detail realisasi biaya per item WBS.
    - **WBS Cost Detail (Page)**: Rincian transaksi approved per WBS Item.

---

## 2. Core Data Models

Tipe data utama yang diolah di report ini adalah `CostOutRecord` yang sudah disetujui.

```typescript
// src/types/cost.ts

export type CostOutRecord = {
  id: string; // UUID
  project_id: string;
  wbs_id: string;
  // cbs_category sudah moved to items
  date: string;
  vendor?: string;
  status: "pending" | "approved" | "rejected"; // Hanya 'approved' yang digunakan di report
  items: CostItem[];
  total_amount: number;
};
```

Untuk WBS Table, kita menggunakan referensi `WBSData` dari modul WBS Planning.

```typescript
// src/types/cbs-wbs.ts
export interface WBSData {
  wbs_id: string;
  description: string;
  totalCost: number; // Planned Cost
  // ... other fields
}
```

---

## 3. Component Architecture

Komponen-komponen UI utama di halaman Cost Report (`cost-report/page.tsx`) dan sub-halamannya:

| Komponen                 | Lokasi File                        | Fungsi & Tanggung Jawab                                                                                                                                            |
| :----------------------- | :--------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`CostVisuals`**        | `CostVisuals.tsx`                  | Berisi dua grafik utama: <br>1. `BudgetUsageChart`: Radial chart untuk % total budget.<br>2. `CBSBarChart`: Bar chart perbandingan Planned vs Actual per kategori. |
| **`CBSSummaryTable`**    | `CBSSummaryTable.tsx`              | Tabel ringkasan angka pasti Planned vs Actual per kategori CBS, dan status (Safe/Over).                                                                            |
| **`WBSMonitoringTable`** | `WBSMonitoringTable.tsx`           | Tabel detail WBS (flat list tanpa indentasi ID). Menampilkan **Planned Cost** (dari WBS) vs **Actual Cost** (Aggregated Cost Records). Memiliki link "Details".    |
| **`WBSCostDetailPage`**  | `cost-report/wbs/[wbsId]/page.tsx` | Halaman detail untuk satu ltem WBS. Menampilkan Ringkasan (Planned, Actual, Variance) dan daftar riwayat transaksi (Cost Out History) yang approved.               |

---

## 4. Frontend Data Processing (Aggregation Logic)

Logic agregasi tetap dilakukan di frontend untuk fleksibilitas filtering per kategori.

### A. Filter Approved Only

Sangat penting bahwa Report hanya menghitung data yang valid (approved).

```typescript
// Di dalam useMemo report page
const approvedRecords = costRecords.filter((r) => r.status === "approved");
// Gunakan approvedRecords untuk semua kalkulasi berikutnya
```

### B. Menghitung Actual per WBS Item

Di `WBSMonitoringTable` dan `WBSCostDetailPage`, Actual Cost dihitung dengan menjumlahkan `total_amount` dari semua `CostOutRecord` yang memiliki `wbs_id` yang sama dan `status === 'approved'`.

```typescript
// Contoh di WBSCostDetailPage
const totalActualCost = useMemo(() => {
  return approvedRecords.reduce((sum, r) => sum + r.total_amount, 0);
}, [approvedRecords]);
```

---

## 5. Backend Integration Guide (TanStack Query)

Untuk Cost Report, endpoint utama yang dibutuhkan adalah **GET Read Only**.

### API Endpoints

#### 1. Fetch Summary Data (All Project Costs)

Digunakan di halaman utama Cost Report untuk grafik dan tabel summary.

- **Endpoint:** `GET /api/projects/:projectId/costs`
- **Params:** `?status=approved`
- **Response:** `CostOutRecord[]`

#### 2. Fetch WBS Cost Details (Specific WBS)

Digunakan di halaman `WBSCostDetailPage` untuk menampilkan riwayat transaksi item tertentu.

- **Endpoint:** `GET /api/projects/:projectId/costs`
- **Params:** `?wbs_id=:wbsId&status=approved`
- **Response:** `CostOutRecord[]` (List transaksi yang approved untuk WBS ID tersebut)
- **Data Requirement**:
  - Backend harus mendukung filtering by `wbs_id`.
  - Response harus detail termasuk `items[]` agar bisa melihat rincian cost item dan cbs category-nya.

### Data Validation Rules

Pastikan backend memvalidasi hal berikut saat menyimpan Cost Record baru (agar report akurat):

1.  `wbs_id` harus valid dan ada di tabel WBS Project.
2.  `total_amount` harus sinkron dengan sum dari `items.total`.
