# Termin Planning - Frontend Documentation

> **Version**: 3.0
> **Last Updated**: 2026-03-02

---

## Daftar Isi

1. [Overview](#1-overview)
2. [Struktur Komponen](#2-struktur-komponen)
3. [Data Types](#3-data-types)
4. [Hooks & Services](#4-hooks--services)
5. [Transformasi Data](#5-transformasi-data)
6. [Cara Kerja TerminAllocationTable](#6-cara-kerja-terminallocationtable)
7. [Alur Edit & Auto-Save](#7-alur-edit--auto-save)

---

## 1. Overview

Fitur Termin Planning menampilkan seluruh WBS item (parent & leaf) dalam bentuk tabel hierarki. User dapat mengalokasikan volume pekerjaan per WBS leaf item ke setiap termin/adendum secara langsung di tabel (inline edit, auto-save per sel).

### Fitur Utama

- **Tabel hierarki WBS** — expandable parent/child dengan indent
- **Kolom dinamis per termin** — kolom dibuat otomatis berdasarkan daftar termin proyek
- **Label dinamis** — header kolom otomatis: `Termin N` atau `Adendum N` berdasarkan `category`
- **View/Edit mode** — tombol toggle; mode edit mengaktifkan input inline di sel leaf
- **Auto-save per sel** — setiap kali input di-blur (atau Enter), langsung `POST` ke backend
- **Validasi sisa volume** — tooltip `Sisa: X` muncul saat focus, cegah over-allocate
- **Summary Cards** — menampilkan ringkasan persentase volume teralokasi vs belum teralokasi
- **Termin Totals** — baris footer: total persentase volume teralokasi per kolom termin
- **Search** — filter WBS item berdasarkan ID atau deskripsi

---

## 2. Struktur Komponen

```
src/
├── app/projects/[projectId]/termin-planning/
│   └── page.tsx                         ← Page utama (data fetching, state isEditMode)
│
├── components/termin-planning/
│   └── TerminAllocationTable.tsx        ← Komponen tabel utama
│
├── hooks/
│   └── useTermin.ts                     ← React Query hooks
│
├── services/
│   └── terminService.ts                 ← Axios calls ke backend
│
└── types/
    └── termin.ts                        ← TypeScript types
```

### Utilities yang Digunakan

| Utility        | Sumber                               | Fungsi                                 |
| -------------- | ------------------------------------ | -------------------------------------- |
| `buildWBSTree` | `utils/`                             | Convert flat WBS array → tree          |
| `formatNumber` | `utils/`                             | Format angka dengan separator ribuan   |
| `SummaryCard`  | `components/cost-monitoring-report/` | Komponen ringkasan data di bagian atas |

> ⚠️ `transformWBSFromBackend` dan `useCBSProjectSelections` sudah **tidak digunakan** di halaman ini sejak v3.0.

---

## 3. Data Types

```typescript
// src/types/termin.ts

// Termin/adendum dari GET /projects/:id/termins
export type TerminInformation = {
  id: string; // UUID — dipakai sebagai termin_id saat save alokasi
  sequence: string; // Nomor urut ("1", "2", ...)
  description: string;
  nominal: number;
  category?: "termin" | "adendum";
};

// Embedded allocation per WBS item (dari GET /wbs-termin-planning)
export type WBSTerminAllocation = {
  termin_sequence: string;
  termin_category: "termin" | "adendum";
  volume: number;
};

// Shape response GET /projects/:id/wbs-termin-planning (flat array)
export type WBSTerminPlanningItem = {
  wbs_id: string; // UUID
  description: string;
  volume: number;
  unit: string;
  is_leaf: boolean;
  parent_id: string | null;
  allocations: WBSTerminAllocation[];
};

// Payload POST /projects/:id/termin-allocations (per-sel, auto-save)
export type TerminAllocationPayload = {
  wbs_id: string; // UUID WBS leaf
  termin_id: string; // UUID termin (dari TerminInformation.id)
  volume: number;
};
```

> ℹ️ **Catatan `sequence`:** sequence tidak unik secara global — Termin 1 (`termin`, seq `"1"`) dan Adendum 1 (`adendum`, seq `"1"`) bisa ada bersamaan. Pembedanya adalah `category`. Lookup alokasi **wajib** cocokkan keduanya.

---

## 4. Hooks & Services

### useTermin.ts

| Hook                             | Tujuan                                 | Query Key                                            |
| -------------------------------- | -------------------------------------- | ---------------------------------------------------- |
| `useGetProjectTermin(id)`        | Ambil daftar termin/adendum proyek     | `["projects", id, "termins"]`                        |
| `useGetAllTerminAllocations(id)` | Ambil WBS tree + alokasi gabungan      | `["projects", id, "termin-allocations"]`             |
| `useSaveTerminAllocations(id)`   | Mutation: simpan 1 alokasi (auto-save) | Invalidates `["projects", id, "termin-allocations"]` |

### terminService.ts

| Fungsi                               | Method | Endpoint                            |
| ------------------------------------ | ------ | ----------------------------------- |
| `getProjectTermin(projectId)`        | GET    | `/projects/:id/termins`             |
| `getAllTerminAllocations(projectId)` | GET    | `/projects/:id/wbs-termin-planning` |
| `saveTerminAllocations(id, payload)` | POST   | `/projects/:id/termin-allocations`  |

> `getAllTerminAllocations` melakukan normalisasi typo backend `parend_id` → `parent_id` secara otomatis di service layer.

---

## 5. Transformasi Data

Data mengalir dari 2 endpoint terpisah lalu diproses di `page.tsx` dan di dalam `TerminAllocationTable`:

```
GET /termins           → TerminInformation[]       → projectTermins prop
GET /wbs-termin-planning → WBSTerminPlanningItem[] → wbsTerminData prop
                                   ↓ (di dalam TerminAllocationTable)
                          mapToWBSData()   → WBSData[] (flatWbsData)
                          buildWBSTree()   → WBSData[] (treeWbsData, untuk render)
                          flattenAllocations() → FlatAllocation[] (untuk cell lookup)
```

### 5.1 `mapToWBSData()` — WBSTerminPlanningItem[] → WBSData[]

Mengkonversi response API ke format `WBSData` yang kompatibel dengan `buildWBSTree`. Karena `buildWBSTree` mewajibkan referensi parent berdasarkan string `wbs_id` (cth: "1.1"), sedangkan `parent_id` dari backend berbentuk **UUID**, maka dilakukan _mapping_ dari UUID ke WBS ID string:

```typescript
function mapToWBSData(items: WBSTerminPlanningItem[]): WBSData[] {
  // 1. Buat lookup map untuk relasi UUID -> wbs_id string
  const idMap = new Map<string, string>();
  for (const item of items) {
    if (item.id) idMap.set(item.id, item.wbs_id);
  }

  return items.map((item) => {
    // 2. Resolve UUID parent ke string wbs_id
    const stringWbsParentId = item.parent_id
      ? (idMap.get(item.parent_id) ?? "")
      : "";

    return {
      wbs_id: item.wbs_id,
      wbs_parent_id: stringWbsParentId,
      description: item.description,
      volume: Number(item.volume) || 0, // parse string → number
      unit: item.unit ?? "",
      is_leaf: item.is_leaf,
      totalCost: 0,
      cbs_category: {},
      node_id: item.id, // simpan UUID asli utk keperluan bulk save
    };
  });
}
```

### 5.2 `flattenAllocations()` — Ekstrak alokasi dari nested → flat array

```typescript
// Interface internal (tidak diexport)
interface FlatAllocation {
  wbs_id: string;
  termin_sequence: string;
  termin_category: string;
  volume: number; // selalu number (bukan string)
}

function flattenAllocations(items: WBSTerminPlanningItem[]): FlatAllocation[] {
  // Setiap item.allocations[] di-unpack jadi satu entry per pasangan (wbs × termin)
  // volume di-parse ke Number untuk menghindari string concatenation di reduce
}
```

**Contoh hasil:**

```
GET response:
  wbs_id: "uuid-A", allocations: [{termin_sequence:"1", termin_category:"termin", volume:"50.0000"}]
  wbs_id: "uuid-A", allocations: [{termin_sequence:"1", termin_category:"adendum", volume:"20.0000"}]

FlatAllocation[] hasil:
  { wbs_id:"uuid-A", termin_sequence:"1", termin_category:"termin",  volume: 50 }
  { wbs_id:"uuid-A", termin_sequence:"1", termin_category:"adendum", volume: 20 }
```

---

## 6. Cara Kerja TerminAllocationTable

### 6.1 Props

```typescript
interface TerminAllocationTableProps {
  projectTermins: TerminInformation[]; // daftar kolom termin/adendum
  wbsTerminData: WBSTerminPlanningItem[]; // data WBS + alokasi dari API
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onCellEdited: (wbsId: string, terminId: string, volume: number) => void;
}
```

### 6.2 State & Memo Internal

| Nama            | Sumber                              | Dipakai untuk                     |
| --------------- | ----------------------------------- | --------------------------------- |
| `flatWbsData`   | `mapToWBSData(wbsTerminData)`       | Expand/collapse all, footer guard |
| `treeWbsData`   | `buildWBSTree(flatWbsData)`         | Render baris tabel                |
| `allocations`   | `flattenAllocations(wbsTerminData)` | Lookup nilai per sel, totals      |
| `expandedNodes` | `useState<Set<string>>`             | Track node yang ter-expand        |
| `filteredTree`  | `useMemo` dari search               | Filtered tree untuk render        |
| `terminTotals`  | `useMemo` dari allocations          | Footer row total per kolom        |

### 6.3 Lookup Nilai Sel (AllocationCell)

Setiap sel dirender oleh `AllocationCell`. Untuk mendapat nilai di sel tertentu:

```typescript
// Key: (wbs_id × termin_sequence × termin_category)
// Wajib cocokkan TIGA field — sequence saja tidak cukup karena Termin 1 dan Adendum 1
// keduanya punya sequence "1"
const terminCategory = termin.category ?? "termin";
const cellValue =
  allocations.find(
    (a) =>
      a.wbs_id === item.wbs_id &&
      a.termin_sequence === termin.sequence &&
      a.termin_category === terminCategory
  )?.volume ?? 0;
```

### 6.4 Validasi Sisa Volume (maxAllowed)

Setiap sel menghitung berapa maksimal volume yang boleh diisi:

```typescript
// maxAllowed = volume WBS - (total yg sudah dialokasikan ke termin LAIN)
// "Lain" = semua alokasi kecuali sel ini sendiri (cocokkan wbs_id tapi exclude (seq,cat) saat ini)
const otherAllocated = allocations
  .filter(
    (a) =>
      a.wbs_id === item.wbs_id &&
      !(
        a.termin_sequence === termin.sequence &&
        a.termin_category === terminCategory
      )
  )
  .reduce((acc, a) => acc + Number(a.volume), 0);

const maxAllowed = item.volume - otherAllocated;
```

### 6.5 Termin Totals (Footer)

```typescript
const terminTotals = projectTermins.map((termin) => {
  const terminCategory = termin.category ?? "termin";
  const total = allocations
    .filter(
      (a) =>
        a.termin_sequence === termin.sequence &&
        a.termin_category === terminCategory // ← wajib, agar Termin 1 ≠ Adendum 1
    )
    .reduce((sum, a) => sum + Number(a.volume), 0);
  return { sequence: termin.sequence, total };
});
```

---

## 7. Alur Edit & Auto-Save

### 7.1 View Mode

- Input tidak aktif; nilai tampil sebagai teks (`formatNumber` atau `-`)
- Status dot pada kolom WBS ID:
  - 🟢 **Hijau (Completed)**: `totalAllocated >= wbs.volume`
  - 🟡 **Kuning (Partial)**: `0 < totalAllocated < wbs.volume`
  - 🔵 **Biru (Empty)**: belum ada alokasi

### 7.2 Edit Mode

1. User klik **Edit Mode** → semua sel leaf jadi `<input type="number">`
2. Saat focus, tooltip `Sisa: X` muncul di kanan input (klik untuk auto-fill maxAllowed)
3. Validasi: jika nilai > `maxAllowed` → toast error, input di-reset ke nilai sebelumnya

### 7.3 Auto-Save (onBlur / Enter)

```
User selesai edit → onBlur / Enter dipicu
         ↓
handleBlur() di AllocationCell
         ↓
onCellEdited(item.wbs_id, termin.id, parsedVal)
  — wbs_id  : UUID WBS leaf
  — termin.id: UUID termin (dari TerminInformation.id)
  — parsedVal: nilai baru (number)
         ↓
handleSave() di page.tsx → saveAllocations({ wbs_id, termin_id, volume })
         ↓
POST /projects/:id/termin-allocations
         ↓
onSuccess → invalidateQueries → GET /wbs-termin-planning refetch
         ↓
wbsTerminData baru → flattenAllocations() → allocations baru → sel update
```

> ℹ️ Tidak ada "Save All" button atau draft state. Setiap sel menyimpan dirinya sendiri saat blur.

---

> **Related Documentation**:
>
> - [API Contract](../../backend/api-contract/TERMIN-PLANNING-API-CONTRACT.md)
> - [WBS Documentation](./WBS-DOCUMENTATION.md)
