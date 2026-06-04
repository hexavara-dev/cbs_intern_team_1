# Project Management - Complete Documentation

## Daftar Isi

1.  [Overview](#overview)
2.  [1. Data Types](#1-data-types)
3.  [2. File Structure](#2-file-structure)
4.  [3. Store Functions (useProjectStore)](#3-store-functions-useprojectstore)
5.  [4. Feature Flow](#4-feature-flow)
6.  [5. Backend Integration](#5-backend-integration)
7.  [6. Implementation Patterns](#6-implementation-patterns)
8.  [7. Checklist Integrasi](#7-checklist-integrasi)
9.  [8. TanStack Query (React Query) Integration Guide](#8-tanstack-query-react-query-integration-guide)

## Overview

Sistem Manajemen Proyek adalah inti dari aplikasi ini, yang memungkinkan pengguna untuk membuat, melihat, dan memperbarui informasi proyek, termasuk pemilihan kategori CBS yang akan digunakan untuk perencanaan WBS.

---

## 1. Data Types

```typescript
// src/types/project.ts
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
  start_date: string;
  end_date: string;
  status: ProjectStatus;
  progress: number; // 0-100
  cbs_categories: CBSCategory[]; // CBS categories assigned to this project
  termins: TerminInformation[]; // Termin information for this project
};

export type CBSCategory = {
  name: string;
  type: "Per Item" | "Borongan";
  selected: boolean;
};

export type TerminInformation = {
  value: string;
  description: string;
  nominal: number;
};
```

---

## 2. File Structure

```
src/
├── app/projects/
│   ├── ongoing/
│   │   ├── page.tsx          # Daftar proyek berjalan
│   │   └── new-project/     # Form pembuatan proyek baru
│   └── [projectId]/
│       ├── page.tsx          # Project Overview & Edit
│       └── wbs/              # WBS Planning module
├── components/shared/form/
│   ├── input.tsx             # Generic text/date/number input
│   └── input-select.tsx      # Dropdown select component
├── store/
│   └── useProjectStore.ts    # Zustand store untuk Proyek
└── constants/
    └── project.ts            # Status options & shared constants
```

---

## 3. Store Functions (useProjectStore)

```typescript
// src/store/useProjectStore.ts
type ProjectStore = {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  getProjectById: (id: string) => Project | undefined;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  updateProjectCBS: (projectId: string, cbsCategories: CBSCategory[]) => void;
  getProjectCBS: (projectId: string) => CBSCategory[];
};
```

### Store Functions Reference

| Function                     | Description                                                   |
| ---------------------------- | ------------------------------------------------------------- |
| `setProjects(data)`          | Menghapus cache lokal dan mengganti dengan data baru dari API |
| `getProjectById(id)`         | Mencari detail proyek berdasarkan ID                          |
| `addProject(project)`        | Menambahkan proyek baru ke daftar lokal                       |
| `updateProject(id, updates)` | Memperbarui detail proyek (inline edit)                       |
| `updateProjectCBS(id, cbs)`  | Memperbarui daftar CBS yang terpilih untuk proyek tersebut    |

---

## 4. Feature Flow

### A. Project Overview & Edit Mode

Halaman `ProjectDetailPage` memiliki dua mode utama:

1. **View Mode**: Menampilkan rangkuman informasi proyek dalam bentuk kartu, list termin (dengan nominal), dan progress.
2. **Edit Mode**: Mengaktifkan form yang memungkinkan perubahan informasi proyek. Termin dapat diedit secara inline (Nominal & Deskripsi) untuk kemudahan update.

### B. Create Project Flow

Proses pembuatan proyek baru telah ditingkatkan:

- **Auto-Increment Termin**: Value termin (1, 2, 3...) dibuat otomatis.
- **Budget Validation**: User wajib mengisi Budget sebelum menambahkan termin untuk menghitung "Remaining Budget".
- **Direct Redirect**: Setelah sukses membuat proyek, user langsung diarahkan ke halaman **Project Detail** baru tersebut (bukan ke list).

### C. CBS Selection

Pemilihan kategori biaya (CBS) sekarang dilakukan langsung di halaman detail proyek:

- Klik "Edit Selection" pada bagian CBS.
- Pilih kategori yang relevan dari daftar global yang tersedia.
- "Save Changes" akan memperbarui `cbs_categories` proyek tersebut dan mengembalikan ke mode preview.

---

---

## 5. Backend Integration

### A. GET: Fetch Projects

**Endpoint:** `GET /api/projects`  
**Response:** `Project[]`

```json
[
  {
    "id": "PRJ-001",
    "name": "Office Renovation",
    "budget": 1000000,
    "status": "ongoing",
    "termins": [{ "value": "1", "description": "DP 20%", "nominal": 200000 }],
    "cbs_categories": [
      { "name": "Material", "type": "Per Item", "selected": true }
    ]
  }
]
```

### B. POST: Create New Project

**Endpoint:** `POST /api/projects`  
**Request Body:** `Omit<Project, 'id' | 'progress'>`

```json
{
  "name": "Building B",
  "description": "New construction",
  "location": "Jakarta",
  "budget": 5000000,
  "start_date": "2024-01-01",
  "end_date": "2024-12-31",
  "status": "ongoing",
  "termins": []
}
```

### C. PATCH: Update Project Detail / CBS Selection

**Endpoint:** `PATCH /api/projects/:id`  
**Request Body:** `Partial<Project>`

> [!NOTE]
> Gunakan PATCH untuk memperbarui informasi dasar proyek (inline edit) atau ketika menyimpan perubahan pada seleksi CBS.

```json
{
  "budget": 6000000,
  "cbs_categories": [
    { "name": "Material", "type": "Per Item", "selected": true },
    { "name": "Sewa Alat", "type": "Per Item", "selected": true }
  ]
}
```

### D. DELETE: Remove Project

**Endpoint:** `DELETE /api/projects/:id`

---

## 6. Implementation Patterns

### Optimistic Updates vs Direct Sync

Dalam aplikasi ini, kita menggunakan dua pendekatan berbeda tergantung fiturnya:

1.  **Direct Sync (New Project)**:
    - User mengisi form → Klik Submit → Tunggu API Response → Simpan ke Store → Redirect.
    - Cocok untuk pembuatan data baru agar ID yang dihasilkan backend sinkron.

2.  **Optimistic Updates (Inline Edit / CBS Selection)**:
    - User klik Save → Update Store Lokal → Kirim API request di background.
    - Jika API gagal → Rollback store (opsional) atau tampilkan toast error.
    - Memberikan pengalaman yang sangat cepat (instant UI).

### Contoh Integrasi Store dengan API

```typescript
// src/store/useProjectStore.ts (Example Integration)
updateProject: async (id, updates) => {
  // 1. Update lokal (Optimistic)
  set((state) => ({
    projects: state.projects.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    ),
  }));

  // 2. Sync ke Backend
  try {
    await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    toast.success("Changes saved!");
  } catch (error) {
    toast.error("Failed to sync with server");
    // Re-fetch data untuk sinkronisasi ulang jika perlu
  }
};
```

---

## 7. Checklist Integrasi

- [ ] Pastikan input budget dikonversi menjadi `Number` sebelum dikirim ke API.
- [ ] Validasi format tanggal `YYYY-MM-DD` sesuai standar HTML5 date input.
- [ ] Pastikan `cbs_categories` yang dikirim adalah array lengkap dari kategori yang terpilih (`selected: true`).
- [ ] Handle state pemuatan (loading) dan error fetch di tingkat halaman utama.

---

## 8. TanStack Query (React Query) Integration Guide

### Step 1: Query untuk Project List & Detail

Gunakan `useQuery` untuk mengambil daftar proyek atau detail satu proyek.

```typescript
// src/hooks/useProjects.ts
import { useQuery } from "@tanstack/react-query";

// Fetch semua proyek
export const useProjectsQuery = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await fetch("/api/projects");
      return response.json();
    },
  });
};

// Fetch detail proyek
export const useProjectDetailQuery = (projectId: string) => {
  return useQuery({
    queryKey: ["projects", projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}`);
      return response.json();
    },
    enabled: !!projectId,
  });
};
```

### Step 2: Mutation untuk Update Project (Optimistic)

Pola ini sangat berguna untuk **Inline Edit** nama proyek, budget, atau **CBS Selection**.

```typescript
// src/hooks/useProjectMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useProjectMutations = (projectId: string) => {
  const queryClient = useQueryClient();

  const updateProjectMutation = useMutation({
    mutationFn: async (updates: Partial<Project>) => {
      return fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
    },
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: ["projects", projectId] });
      const previousProject = queryClient.getQueryData(["projects", projectId]);

      // Update cache lokal secara instan
      queryClient.setQueryData(["projects", projectId], (old: any) => ({
        ...old,
        ...updates,
      }));

      return { previousProject };
    },
    onError: (err, updates, context) => {
      queryClient.setQueryData(
        ["projects", projectId],
        context.previousProject
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] }); // Refresh list juga
    },
  });

  return { updateProjectMutation };
};
```

### Step 3: Penggunaan di Page Overview

```tsx
// src/app/projects/[projectId]/page.tsx
const { data: project, isLoading } = useProjectDetailQuery(projectId);
const { updateProjectMutation } = useProjectMutations(projectId);

const onSave = (formData) => {
  updateProjectMutation.mutate(formData);
};
```

### Keuntungan untuk Project Module:

1. **Instant Updates**: Saat user mengganti status proyek atau memilih CBS, UI langsung berubah tanpa refresh.
2. **Auto-Sync**: Jika admin mengganti nama proyek di tab lain, TanStack Query bisa melakukan _auto-refetch_ di background.
3. **Drafting**: Memudahkan implementasi mode "Edit" yang bisa di-_cancel_ tanpa pusing manual state cleanup.
