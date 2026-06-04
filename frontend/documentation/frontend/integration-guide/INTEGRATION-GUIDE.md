# Frontend Backend Integration Guide

> **Version**: 1.0  
> **Last Updated**: 2026-02-07  
> **Target**: Integrasi frontend dengan API backend

---

## Daftar Isi

1. [Overview](#1-overview)
2. [Arsitektur Integrasi](#2-arsitektur-integrasi)
3. [Setup API Layer](#3-setup-api-layer)
4. [Integrasi Per Module](#4-integrasi-per-module)
   - [Projects](#41-projects)
   - [CBS (Cost Breakdown Structure)](#42-cbs)
   - [WBS (Work Breakdown Structure)](#43-wbs)
   - [Termin Planning](#44-termin-planning)
   - [Cost Control](#45-cost-control)
   - [Progress Monitoring](#46-progress-monitoring)
   - [S-Curve (Historical Progress)](#47-s-curve-historical-progress) ⭐ **NEW**
   - [Cost Report](#48-cost-report)
5. [Migration Checklist](#5-migration-checklist)

---

## 1. Overview

### Kondisi Saat Ini

Frontend saat ini menggunakan **Zustand stores** dengan **dummy data** untuk development. Setiap store meng-handle state management secara lokal tanpa koneksi ke backend.

| Store File             | Status     | Integrasi Diperlukan |
| ---------------------- | ---------- | -------------------- |
| `useProjectStore.ts`   | Dummy data | Ya                   |
| `useCBSStore.ts`       | Dummy data | Ya                   |
| `useWBSStore.ts`       | Dummy data | Ya                   |
| `useTerminStore.ts`    | Dummy data | Ya                   |
| `useCostStore.ts`      | Dummy data | Ya                   |
| `useProgressTermin.ts` | Dummy data | Ya                   |

### API Infrastructure yang Sudah Ada

```
src/lib/
├── api.ts      ← Axios instance dengan interceptors (siap pakai)
├── url.ts      ← Base URL configuration
└── cookies.ts  ← Token management
```

---

## 2. Arsitektur Integrasi

### Struktur Folder yang Direkomendasikan

```
src/
├── lib/
│   └── api.ts              ← Axios instance (sudah ada)
├── services/               ← [BARU] API service functions
│   ├── projectService.ts
│   ├── cbsService.ts
│   ├── wbsService.ts
│   ├── terminService.ts
│   ├── costControlService.ts
│   ├── progressService.ts
│   └── costReportService.ts
├── hooks/                  ← [BARU] TanStack Query hooks
│   ├── useProjects.ts
│   ├── useCBS.ts
│   ├── useWBS.ts
│   └── ...
└── store/                  ← Zustand (untuk UI state saja)
    ├── useProjectStore.ts
    └── ...
```

### Pola Integrasi

```typescript
// Flow: Component → Hook (TanStack Query) → Service → API → Backend

// 1. Service Layer (src/services/projectService.ts)
export const projectService = {
  getAll: () => api.get("/projects"),
  getById: (id: string) => api.get(`/projects/${id}`),
  create: (data: CreateProjectDTO) => api.post("/projects", data),
  // ...
};

// 2. Query Hook (src/hooks/useProjects.ts)
export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: projectService.getAll,
  });
}

// 3. Component
function ProjectList() {
  const { data, isLoading, error } = useProjects();
  // ...
}
```

---

## 3. Setup API Layer

### 3.1 Install Dependencies

```bash
npm install @tanstack/react-query
```

### 3.2 Setup Query Provider

**File**: `src/app/providers.tsx`

```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 menit
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### 3.3 Response Type Wrapper

**File**: `src/types/api.ts` (update existing)

```typescript
// Standard API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
```

---

## 4. Integrasi Per Module

---

### 4.1 Projects

#### API Contract Reference

📄 [PROJECTS-API-CONTRACT.md](../backend/api-contract/PROJECTS-API-CONTRACT.md)

#### Service Layer

**File**: `src/services/projectService.ts`

```typescript
import api from "@/lib/api";
import { Project } from "@/types/project";
import { ApiResponse, PaginatedResponse } from "@/types/api";

export interface CreateProjectDTO {
  name: string;
  description?: string;
  location?: string;
  budget: number;
  start_date: string;
  end_date: string;
  status?: string;
  termins?: Array<{ description: string; nominal: number }>;
}

export const projectService = {
  getAll: async (params?: {
    status?: string;
    search?: string;
    page?: number;
  }) => {
    const response = await api.get<PaginatedResponse<Project>>("/projects", {
      params,
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Project>>(`/projects/${id}`);
    return response.data;
  },

  create: async (data: CreateProjectDTO) => {
    const response = await api.post<ApiResponse<Project>>("/projects", data);
    return response.data;
  },

  update: async (id: string, data: Partial<Project>) => {
    const response = await api.patch<ApiResponse<Project>>(
      `/projects/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/projects/${id}`);
    return response.data;
  },
};
```

#### Query Hooks

**File**: `src/hooks/useProjects.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService, CreateProjectDTO } from "@/services/projectService";
import { toast } from "sonner";

export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

export function useProjects(filters?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: projectKeys.list(filters || {}),
    queryFn: () => projectService.getAll(filters),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectService.getById(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectDTO) => projectService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      toast.success("Project berhasil dibuat!");
    },
    onError: (error: Error) => {
      toast.error(`Gagal membuat project: ${error.message}`);
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) =>
      projectService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      toast.success("Project berhasil diupdate!");
    },
  });
}
```

#### Perubahan di Store

**File**: `src/store/useProjectStore.ts`

```typescript
// SEBELUM: Store menyimpan projects data
// SESUDAH: Store hanya menyimpan UI state

import { create } from "zustand";

type ProjectUIStore = {
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  filterStatus: string | null;
  setFilterStatus: (status: string | null) => void;
};

export const useProjectUIStore = create<ProjectUIStore>((set) => ({
  selectedProjectId: null,
  setSelectedProjectId: (id) => set({ selectedProjectId: id }),
  filterStatus: null,
  setFilterStatus: (status) => set({ filterStatus: status }),
}));

// HAPUS: DUMMY_PROJECTS
// HAPUS: Fungsi CRUD (pindah ke hooks)
```

#### Component Update Example

```tsx
// SEBELUM
function ProjectList() {
  const { projects } = useProjectStore();
  return projects.map((p) => <ProjectCard key={p.id} project={p} />);
}

// SESUDAH
function ProjectList() {
  const { data, isLoading, error } = useProjects();

  if (isLoading) return <Loading />;
  if (error) return <ErrorState error={error} />;

  return data?.data.map((p) => <ProjectCard key={p.id} project={p} />);
}
```

---

### 4.2 CBS

#### API Contract Reference

📄 [CBS-API-CONTRACT.md](../backend/api-contract/CBS-API-CONTRACT.md)

#### Service Layer

**File**: `src/services/cbsService.ts`

```typescript
import api from "@/lib/api";
import { CBSData } from "@/types/cbs-wbs";
import { ApiResponse } from "@/types/api";

interface CBSCategoryAPI {
  id: string;
  name: string;
  cost_type: "Per Item" | "Borongan";
  created_at: string;
  updated_at: string;
}

// Transform API response to frontend type
function transformCBSResponse(
  apiData: CBSCategoryAPI
): CBSData & { id: string } {
  return {
    id: apiData.id,
    name: apiData.name,
    type: apiData.cost_type, // Mapping: cost_type → type
    selected: false, // Will be set based on project selections
  };
}

export const cbsService = {
  // Master CBS
  getAll: async () => {
    const response = await api.get<ApiResponse<CBSCategoryAPI[]>>("/cbs");
    return {
      ...response.data,
      data: response.data.data.map(transformCBSResponse),
    };
  },

  create: async (data: { name: string; cost_type: string }) => {
    const response = await api.post<ApiResponse<CBSCategoryAPI>>("/cbs", data);
    return response.data;
  },

  update: async (id: string, data: { name: string; cost_type: string }) => {
    const response = await api.put<ApiResponse<CBSCategoryAPI>>(
      `/cbs/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/cbs/${id}`);
    return response.data;
  },

  // Project CBS Selection
  getProjectSelections: async (projectId: string) => {
    const response = await api.get<ApiResponse<CBSCategoryAPI[]>>(
      `/projects/${projectId}/cbs-selections`
    );
    return {
      ...response.data,
      data: response.data.data.map((item) => ({
        ...transformCBSResponse(item),
        selected: true,
      })),
    };
  },

  updateProjectSelections: async (
    projectId: string,
    cbsCategoryIds: string[]
  ) => {
    const response = await api.put<ApiResponse<CBSCategoryAPI[]>>(
      `/projects/${projectId}/cbs-selections`,
      { cbs_category_ids: cbsCategoryIds }
    );
    return response.data;
  },
};
```

#### Integration Points

| Current Function     | Location         | Replace With                                           |
| -------------------- | ---------------- | ------------------------------------------------------ |
| `setCBSData()`       | `useCBSStore.ts` | `useQuery` dari TanStack Query                         |
| `addCategory()`      | `useCBSStore.ts` | `useMutation` + `cbsService.create()`                  |
| `deleteCategory()`   | `useCBSStore.ts` | `useMutation` + `cbsService.delete()`                  |
| `confirmSelection()` | `useCBSStore.ts` | `useMutation` + `cbsService.updateProjectSelections()` |

---

### 4.3 WBS

#### API Contract Reference

📄 [WBS-API-CONTRACT.md](../backend/api-contract/WBS-API-CONTRACT.md)

#### Service Layer

**File**: `src/services/wbsService.ts`

```typescript
import api from "@/lib/api";
import { WBSData } from "@/types/cbs-wbs";
import { ApiResponse } from "@/types/api";

export const wbsService = {
  getAll: async (projectId: string) => {
    const response = await api.get<ApiResponse<WBSData[]>>(
      `/projects/${projectId}/wbs`
    );
    return response.data;
  },

  create: async (projectId: string, data: Omit<WBSData, "totalCost">) => {
    const response = await api.post<ApiResponse<WBSData>>(
      `/projects/${projectId}/wbs`,
      data
    );
    return response.data;
  },

  update: async (projectId: string, wbsId: string, data: Partial<WBSData>) => {
    const response = await api.patch<ApiResponse<WBSData>>(
      `/projects/${projectId}/wbs/${wbsId}`,
      data
    );
    return response.data;
  },

  delete: async (projectId: string, wbsId: string) => {
    const response = await api.delete<ApiResponse<{ deleted_count: number }>>(
      `/projects/${projectId}/wbs/${wbsId}`
    );
    return response.data;
  },
};
```

#### Kritical Backend Logic

> ⚠️ **PENTING**: Backend WAJIB menjalankan logic berikut saat CREATE:

```javascript
// Ketika item baru ditambahkan dengan parent:
if (data.wbs_parent_id) {
  // 1. Update parent menjadi non-leaf
  await db.wbsItems.update(parentId, { is_leaf: false });

  // 2. HAPUS CBS costs dari parent (karena hanya leaf yang boleh punya cost)
  await db.wbsCbsCosts.deleteMany({ wbs_item_id: parentId });
}
```

#### Integration Points

| Current Function        | Location         | Replace With                          |
| ----------------------- | ---------------- | ------------------------------------- |
| `setWBSData()`          | `useWBSStore.ts` | `useQuery`                            |
| `addItem()`             | `useWBSStore.ts` | `useMutation` + `wbsService.create()` |
| `updateItem()`          | `useWBSStore.ts` | `useMutation` + `wbsService.update()` |
| `deleteItem()`          | `useWBSStore.ts` | `useMutation` + `wbsService.delete()` |
| `recalculateAllCosts()` | `useWBSStore.ts` | **HAPUS** - Backend yang menghitung   |

#### Fungsi yang Dipindahkan ke Backend

| Frontend Function       | Backend Equivalent                         |
| ----------------------- | ------------------------------------------ |
| `calculateWBSCost()`    | `calculateTotalCost()` di backend          |
| `calculateParentCost()` | `recalculateParentCosts()` di backend      |
| `reindexWBS()`          | `reindexWBS()` di backend (setelah DELETE) |
| `generateNextWbsId()`   | Tetap di frontend, backend hanya validasi  |

---

### 4.4 Termin Planning

#### API Contract Reference

📄 [TERMIN-PLANNING-API-CONTRACT.md](../backend/api-contract/TERMIN-PLANNING-API-CONTRACT.md)

#### Service Layer

**File**: `src/services/terminService.ts`

```typescript
import api from "@/lib/api";
import { TerminInformation } from "@/types/termin";
import { ApiResponse } from "@/types/api";

export const terminService = {
  getByProject: async (projectId: string) => {
    const response = await api.get<ApiResponse<TerminInformation[]>>(
      `/projects/${projectId}/termins`
    );
    return response.data;
  },

  create: async (
    projectId: string,
    data: { description: string; nominal: number }
  ) => {
    const response = await api.post<ApiResponse<TerminInformation>>(
      `/projects/${projectId}/termins`,
      data
    );
    return response.data;
  },

  // Allocations
  getAllocations: async (projectId: string, terminId: string) => {
    const response = await api.get<ApiResponse<TerminAllocation[]>>(
      `/projects/${projectId}/termins/${terminId}/allocations`
    );
    return response.data;
  },

  updateAllocations: async (
    projectId: string,
    terminId: string,
    allocations: Array<{ wbs_item_id: string; allocated_volume: number }>
  ) => {
    const response = await api.put<ApiResponse<TerminAllocation[]>>(
      `/projects/${projectId}/termins/${terminId}/allocations`,
      { allocations }
    );
    return response.data;
  },
};
```

---

### 4.5 Cost Control

#### API Contract Reference

📄 [COST-CONTROL-API-CONTRACT.md](../backend/api-contract/COST-CONTROL-API-CONTRACT.md)

#### Service Layer

**File**: `src/services/costControlService.ts`

```typescript
import api from "@/lib/api";
import { CostItem } from "@/types/cost";
import { ApiResponse, PaginatedResponse } from "@/types/api";

export const costControlService = {
  getRecords: async (
    projectId: string,
    params?: {
      wbs_id?: string;
      cbs_category?: string;
      status?: string;
      page?: number;
      limit?: number;
    }
  ) => {
    const response = await api.get<PaginatedResponse<CostItem>>(
      `/projects/${projectId}/cost-records`,
      { params }
    );
    return response.data;
  },

  create: async (projectId: string, data: CreateCostRecordDTO) => {
    const response = await api.post<ApiResponse<CostItem>>(
      `/projects/${projectId}/cost-records`,
      data
    );
    return response.data;
  },

  updateStatus: async (
    projectId: string,
    recordId: string,
    status: "approved" | "rejected",
    notes?: string
  ) => {
    const response = await api.patch<ApiResponse<CostItem>>(
      `/projects/${projectId}/cost-records/${recordId}/status`,
      { status, notes }
    );
    return response.data;
  },
};
```

#### Integration Point - RecordCostPage

**File**: `src/app/projects/[projectId]/cost-control/record/page.tsx`

```typescript
// SEBELUM: Menggunakan local state dan store
const handleSubmit = () => {
  useCostStore.addItem(newItem);
  toast.success("Record added!");
};

// SESUDAH: Menggunakan mutation
const createMutation = useCostRecordMutation();

const handleSubmit = () => {
  createMutation.mutate(
    { projectId, data: formData },
    {
      onSuccess: () => {
        toast.success("Record berhasil ditambahkan!");
        router.push(`/projects/${projectId}/cost-control`);
      },
    }
  );
};
```

---

### 4.6 Progress Monitoring

#### API Contract Reference

📄 [PROGRESS-MONITORING-API-CONTRACT.md](../backend/api-contract/PROGRESS-MONITORING-API-CONTRACT.md)

#### Service Layer

**File**: `src/services/progressService.ts`

```typescript
import api from "@/lib/api";
import { ProgressRecord } from "@/types/progress";
import { ApiResponse } from "@/types/api";

export const progressService = {
  getByTermin: async (projectId: string, terminId: string) => {
    const response = await api.get<ApiResponse<ProgressRecord[]>>(
      `/projects/${projectId}/termins/${terminId}/progress`
    );
    return response.data;
  },

  updateProgress: async (
    projectId: string,
    terminId: string,
    records: Array<{ wbs_item_id: string; actual_volume: number }>
  ) => {
    const response = await api.put<ApiResponse<ProgressRecord[]>>(
      `/projects/${projectId}/termins/${terminId}/progress`,
      { records }
    );
    return response.data;
  },
};
```

---

### 4.7 S-Curve (Historical Progress)

#### API Contract Reference

📄 [PROGRESS-MONITORING-API-CONTRACT.md — Section 6](../backend/api-contract/PROGRESS-MONITORING-API-CONTRACT.md#6-s-curve--historical-progress-endpoint)

#### Mengapa Perlu Endpoint Baru?

Saat ini, `ProgressChart` menerima `totalVolume` dan `currentActualVolume` (angka tunggal). Frontend menarik **garis lurus diagonal** dari nol ke nilai aktual hari ini.

Garis lurus ini **tidak akurat**: tidak tampak di mana proyek terlambat, di mana dikebut, atau di mana pekerjaan berhenti. Dengan endpoint `GET /progress/s-curve`, backend mengembalikan **rekaman volume kumulatif per minggu/bulan** sehingga garis hijau (_Actual_) bisa berliku-liku sesuai dinamika nyata di lapangan.

#### Step 1: Tambah Type Baru ke `src/types/progress.ts`

```typescript
// Tambahkan ke akhir file src/types/progress.ts

export type ProgressTimeSeriesPoint = {
  period_start: string; // ISO date: "2026-03-09"
  period_label: string; // Label sumbu X: "09 Mar 2026"
  actual_volume_in_period: number;
  actual_volume_accumulated: number;
};

export type ProgressSCurveData = {
  project_id: string;
  total_planned_volume: number;
  interval: "week" | "month";
  data_points: ProgressTimeSeriesPoint[];
};
```

#### Step 2: Tambah Method ke `progressMonitoringService.ts`

**File**: `src/services/progressMonitoringService.ts`

```typescript
// Tambahkan import type baru
import { ProgressSCurveData, /* ...existing */ } from "@/types/progress";

// Tambahkan method di dalam object progressMonitoringService
getProgressSCurve: async (
  projectId: string,
  interval: "week" | "month" = "week"
) => {
  const response = await api.get<ApiResponse<ProgressSCurveData>>(
    `/projects/${projectId}/progress/s-curve`,
    { params: { interval } }
  );
  return response.data.data;
},
```

#### Step 3: Tambah Hook ke `useProgressMonitoring.ts`

**File**: `src/hooks/useProgressMonitoring.ts`

```typescript
export const useGetProgressSCurve = (
  projectId: string,
  interval: "week" | "month"
) => {
  return useQuery({
    queryKey: ["progress", projectId, "s-curve", interval],
    queryFn: async () =>
      progressMonitoringService.getProgressSCurve(projectId, interval),
  });
};
```

#### Step 4: Tambah Fungsi `generateChartDataFromTimeSeries` ke `src/utils/chartData.ts`

Fungsi ini menggantikan logika estimasi linear untuk garis _Actual_. Garis _Planned_ tetap memakai rumus Sigmoid seperti sebelumnya.

```typescript
import { ProgressTimeSeriesPoint } from "@/types/progress";

export const generateChartDataFromTimeSeries = (
  startDateStr: string,
  endDateStr: string,
  totalPlannedVolume: number,
  historicalPoints: ProgressTimeSeriesPoint[],
  interval: "week" | "month"
): ChartDataPoint[] => {
  const startDate = startOfDay(new Date(startDateStr));
  const endDate = startOfDay(new Date(endDateStr));

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return [];

  const buckets = generateTimeBuckets(startDate, endDate, interval);
  const sCurveProfile = generateSCurveProfile(buckets.length);

  // Map period_start (ISO string) → actual_volume_accumulated
  const actualMap = new Map<string, number>();
  historicalPoints.forEach((point) => {
    actualMap.set(point.period_start, point.actual_volume_accumulated);
  });

  return buckets.map((date, index) => {
    const dateStr = format(
      date,
      interval === "week" ? "dd MMM yyyy" : "MMM yyyy"
    );
    const isoKey = format(date, "yyyy-MM-dd"); // cocokkan dengan period_start backend

    const plannedPct = sCurveProfile[index];
    const plannedAccumulated = (plannedPct / 100) * totalPlannedVolume;

    // null untuk periode di masa depan (Recharts akan memutus garis)
    const actualAccumulated = actualMap.has(isoKey)
      ? (actualMap.get(isoKey) ?? null)
      : null;

    return {
      date: dateStr,
      planned: 0,
      actual: 0,
      plannedAccumulated,
      actualAccumulated,
    };
  });
};
```

#### Step 5: Update `ProgressChart.tsx`

**File**: `src/components/progress-monitoring/ProgressChart.tsx`

```tsx
// Tambah props baru
type ProgressChartProps = {
  project: Project;
  totalVolume: number;
  currentActualVolume: number;
  sCurveData?: ProgressSCurveData | null; // ← props baru (opsional)
};

// Update useMemo di dalam komponen
const data = useMemo(() => {
  if (!project.start_date || !project.end_date) return [];

  // Gunakan data historis dari backend jika tersedia
  if (sCurveData && sCurveData.data_points.length > 0) {
    return generateChartDataFromTimeSeries(
      project.start_date,
      project.end_date,
      sCurveData.total_planned_volume,
      sCurveData.data_points,
      interval
    );
  }

  // Fallback ke estimasi linear (cara lama)
  return generateChartData(
    project.start_date,
    project.end_date,
    totalVolume,
    currentActualVolume,
    interval
  );
}, [project, totalVolume, currentActualVolume, sCurveData, interval]);
```

#### Step 6: Update Halaman Progress Monitoring

**File**: `src/app/projects/[projectId]/progress-monitoring/page.tsx`

```tsx
// Tambahkan state interval dan hook s-curve
const [chartInterval, setChartInterval] = useState<"week" | "month">("week");
const { data: sCurveAPI } = useGetProgressSCurve(projectId, chartInterval);

// Pass ke ProgressChart
<ProgressChart
  project={project}
  totalVolume={totalPlanned}
  currentActualVolume={totalExecuted}
  sCurveData={sCurveAPI ?? null}
/>;
```

> **Catatan:** `interval` state sebaiknya di-lift ke halaman ini agar `useGetProgressSCurve` dan `ProgressChart` berbagi state yang sama. Atau bisa juga tetap dikelola di dalam `ProgressChart` dan diexpose via `onIntervalChange` callback.

#### Diagram Aliran Data S-Curve

```
DB (progress_records)
   ↓ GROUP BY period, SUM volume, running total
GET /progress/s-curve?interval=week
   ↓ { data_points: [{period_start, actual_volume_accumulated}, ...] }
useGetProgressSCurve() hook (TanStack Query)
   ↓ ProgressSCurveData
ProgressChart → generateChartDataFromTimeSeries()
   ↓ ChartDataPoint[] dengan actualAccumulated dari data nyata
Recharts <Area dataKey="actualAccumulated"> → Garis hijau berliku-liku ✅
```

---

### 4.8 Cost Report

#### API Contract Reference

📄 [COST-REPORT-API-CONTRACT.md](../backend/api-contract/COST-REPORT-API-CONTRACT.md)

#### Service Layer

**File**: `src/services/costReportService.ts`

```typescript
import api from "@/lib/api";
import { ApiResponse } from "@/types/api";

interface CostReportSummary {
  total_budget: number;
  total_planned: number;
  total_actual: number;
  remaining_budget: number;
  budget_usage_percentage: number;
}

export const costReportService = {
  getSummary: async (projectId: string) => {
    const response = await api.get<ApiResponse<CostReportSummary>>(
      `/projects/${projectId}/cost-report/summary`
    );
    return response.data;
  },

  getByWBS: async (projectId: string) => {
    const response = await api.get<ApiResponse<WBSCostReport[]>>(
      `/projects/${projectId}/cost-report/by-wbs`
    );
    return response.data;
  },

  getByCBS: async (projectId: string) => {
    const response = await api.get<ApiResponse<CBSCostReport[]>>(
      `/projects/${projectId}/cost-report/by-cbs`
    );
    return response.data;
  },
};
```

---

## 5. Migration Checklist

### Phase 1: Setup Infrastructure

- [ ] Install `@tanstack/react-query`
- [ ] Create `src/app/providers.tsx` dengan QueryClientProvider
- [ ] Update `src/types/api.ts` dengan response wrappers
- [ ] Create `src/services/` folder structure

### Phase 2: Core Modules

- [ ] **Projects**
  - [ ] Create `projectService.ts`
  - [ ] Create `useProjects.ts` hooks
  - [ ] Update `useProjectStore.ts` → UI state only
  - [ ] Update project list page
  - [ ] Update project detail page
  - [ ] Update create project form

- [ ] **CBS**
  - [ ] Create `cbsService.ts`
  - [ ] Create `useCBS.ts` hooks
  - [ ] Update `useCBSStore.ts` → UI state only
  - [ ] Update CBS selection page

- [ ] **WBS**
  - [ ] Create `wbsService.ts`
  - [ ] Create `useWBS.ts` hooks
  - [ ] Update `useWBSStore.ts` → UI state only
  - [ ] Update WBS table component
  - [ ] Remove client-side cost calculation (backend handles this)

### Phase 3: Transactional Modules

- [ ] **Termin Planning**
  - [ ] Create `terminService.ts`
  - [ ] Create `useTermins.ts` hooks
  - [ ] Update termin planning page

- [ ] **Cost Control**
  - [ ] Create `costControlService.ts`
  - [ ] Create `useCostRecords.ts` hooks
  - [ ] Update cost control pages
  - [ ] Update record cost form

- [ ] **Progress Monitoring**
  - [ ] Create `progressService.ts`
  - [ ] Create `useProgress.ts` hooks
  - [ ] Update progress monitoring page

### Phase 4: Reporting

- [ ] **Cost Report**
  - [ ] Create `costReportService.ts`
  - [ ] Create `useCostReport.ts` hooks
  - [ ] Update cost report pages

### Phase 5: Cleanup

- [ ] Remove all dummy data from stores
- [ ] Remove unused store functions
- [ ] Update error handling
- [ ] Add loading states
- [ ] Add error boundaries

---

> **Document Version**: 1.0  
> **Related Documentation**:
>
> - [CBS API Contract](../backend/api-contract/CBS-API-CONTRACT.md)
> - [WBS API Contract](../backend/api-contract/WBS-API-CONTRACT.md)
> - [Projects API Contract](../backend/api-contract/PROJECTS-API-CONTRACT.md)
> - [Cost Control API Contract](../backend/api-contract/COST-CONTROL-API-CONTRACT.md)
