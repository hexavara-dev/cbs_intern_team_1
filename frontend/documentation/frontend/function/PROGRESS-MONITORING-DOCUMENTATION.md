# Progress Monitoring - Technical Documentation

Dokumentasi ini mencakup aspek **Project Health Monitoring**, yaitu pemantauan status proyek, timeline, budget level tinggi, dan progres fisik secara keseluruhan. Dokumentasi ini melengkapi [Cost Monitoring Docs](./COST-MONITORING-DOCUMENTATION.md) yang lebih fokus pada pencatatan transaksi detail.

## Daftar Isi

1.  [Overview & Scope](#1-overview--scope)
2.  [Page Architecture](#2-page-architecture)
3.  [Core Data Models (Project Entity)](#3-core-data-models-project-entity)
4.  [Component Architecture](#4-component-architecture)
5.  [Backend Integration & State Strategy](#5-backend-integration--state-strategy)

---

## 1. Overview & Scope

Modul ini bertanggung jawab untuk memberikan "Helicopter View" terhadap portofolio proyek.

- **Portfolio Level**: Melihat ringkasan seluruh proyek (Ongoing, Completed, Total Budget).
- **Project Level**: Melihat kesehatan satu proyek spesifik (Lokasi, Budget, Durasi, % Progress).

---

## 2. Page Architecture

Berikut adalah halaman-halaman yang masuk dalam lingkup Progress Monitoring:

| Halaman               | Route               | Deskripsi & Fitur Utama                                                                                                     |
| :-------------------- | :------------------ | :-------------------------------------------------------------------------------------------------------------------------- |
| **Portfolio Summary** | `/projects/ongoing` | Menampilkan **ProjectSummary** (Total Stats) dan **ProjectTable**.                                                          |
| **Project Overview**  | `/projects/[id]`    | Dashboard utama per proyek. Menampilkan **Summary Cards** (Budget, Location, Timeline) dan akses ke modul lain (CBS, Cost). |

---

## 3. Core Data Models (Project Entity)

Data utama yang dikelola adalah Entitas `Project`.

```typescript
// src/types/project.ts

export interface Project {
  id: string; // Unique ID (e.g., "PRJ-001")
  name: string; // Nama Proyek
  description: string; // Deskripsi singkat
  location: string; // Lokasi (e.g., "Jakarta Selatan")

  // --- Financial & Timeline Metrics ---
  budget: number; // Total Contract Value (RAB)
  start_date: string; // "YYYY-MM-DD"
  end_date: string; // "YYYY-MM-DD"

  // --- Status & Progress ---
  status: ProjectStatus; // "ongoing" | "finish" | "maintenance" | "hold" | "canceled"
  progress: number; // 0 - 100 (Physical Completion %)

  // --- Relations ---
  cbs_categories: CBSCategory[]; // Konfigurasi CBS untuk proyek ini
  termins: Termin[]; // Jadwal termin pembayaran
  // wbs_data?: WBSData[];       // (Optional/Lazy Loaded) Structure WBS
}

export type ProjectStatus =
  | "ongoing"
  | "finish"
  | "maintenance"
  | "hold"
  | "canceled";
```

---

## 4. Component Architecture

Komponen UI yang digunakan untuk visualisasi data monitoring.

### A. `SummaryCard` (Unified Component)

Komponen kartu standar untuk menampilkan metrik kunci dengan desain "Premium" (Icon Besar + Bold Value).

- **Lokasi**: `src/components/ui/summary-card.tsx`
- **Props**:
  - `label`: Judul kecil (e.g., "Total Budget").
  - `value`: Nilai utama (e.g., "Rp 1.5M").
  - `icon`: Lucide Icon.
  - `children`: (Optional) Konten custom seperti Progress Bar.

**Contoh Penggunaan:**

```tsx
<SummaryCard
  label="Budget"
  value={formatCurrency(project.budget)}
  icon={Wallet}
  iconBgColor="bg-green-50"
  iconColor="text-green-600"
/>
```

### B. `ProjectSummary`

Komponen statistik level portofolio. Menampilkan 4 kartu ringkasan (Total Projects, Total Budget, Ongoing Count, Completed Count).

- **Lokasi**: `src/components/projects/ProjectSummary.tsx`
- **Integrasi**: Menggunakan `SummaryCard` di dalamnya.

### C. `ProjectTable`

Tabel daftar proyek dengan fitur sorting dan filtering basis status.

- **Lokasi**: `src/components/projects/ProjectTable.tsx`

---

## 5. Backend Integration & State Strategy

Panduan transisi dari Client-Side State (`useProjectStore`) ke Server-State (`TanStack Query`).

### Mapping Fungsi Existing ke Rencana API

Tabel ini menunjukkan pemetaan fungsi yang ada di `useProjectStore.ts` ke Hook React Query yang direkomendasikan.

| Aksi                 | Fungsi Existing (Zustand) | Rencana Endpoint API        | TanStack Query Hook               |
| :------------------- | :------------------------ | :-------------------------- | :-------------------------------- |
| **Get All Projects** | `getProjects()`           | `GET /api/projects`         | `useProjectsQuery(filters)`       |
| **Get Detail**       | `getProjectById(id)`      | `GET /api/projects/:id`     | `useProjectDetailQuery(id)`       |
| **Create Project**   | `addProject(data)`        | `POST /api/projects`        | `useCreateProjectMutation()`      |
| **Update Info**      | `updateProject(id, data)` | `PATCH /api/projects/:id`   | `useUpdateProjectMutation(id)`    |
| **Update CBS**       | `updateProjectCBS(...)`   | `PUT /api/projects/:id/cbs` | `useUpdateProjectCBSMutation(id)` |

### Contoh Implementasi Hook (Future State)

#### 1. Fetching Project List

```typescript
// src/hooks/useProjectsQuery.ts
export const useProjectsQuery = (statusFilter?: string) => {
  return useQuery({
    queryKey: ["projects", statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams(
        statusFilter ? { status: statusFilter } : {}
      );
      const res = await fetch(`/api/projects?${params}`);
      return res.json() as Promise<Project[]>;
    },
  });
};
```

#### 2. Updating Project Status/Progress

```typescript
// src/hooks/useUpdateProject.ts
export const useUpdateProjectMutation = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Project>) => {
      await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      // Invalidate both list and detail to refresh UI
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", id] });
    },
  });
};
```
