"use client";

import { create } from "zustand";
import { Project, CBSCategory } from "@/types/project";

type ProjectStore = {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  getProjects: () => Project[];
  getProjectById: (id: string) => Project | undefined;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  updateProjectCBS: (projectId: string, cbsCategories: CBSCategory[]) => void;
  getProjectCBS: (projectId: string) => CBSCategory[];
};

// Dummy data for development
// const DUMMY_PROJECTS: Project[] = [
//   {
//     id: "PRJ-001",
//     name: "Office Renovation - Floor 3",
//     description: "Active And Recurring Projects",
//     location: "Jakarta Selatan",
//     budget: 1250000000,
//     start_date: "2024-01-15",
//     end_date: "2024-06-30",
//     status: "ongoing",
//     progress: 45,
//     cbs_categories: [],
//     termin: [
//       {
//         sequence: "1",
//         description: "Termin 1 (20%)",
//         nominal: 250000000,
//         category: "termin",
//       },
//       {
//         sequence: "2",
//         description: "Termin 2 (30%)",
//         nominal: 375000000,
//         category: "termin",
//       },
//       {
//         sequence: "3",
//         description: "Termin 3 (50%)",
//         nominal: 625000000,
//         category: "termin",
//       },
//     ],
//     adendum: [],
//   },
//   {
//     id: "PRJ-002",
//     name: "Warehouse Expansion",
//     description: "Adding 1000sqm storage capacity",
//     location: "Surabaya",
//     budget: 3500000000,
//     start_date: "2024-02-01",
//     end_date: "2024-11-15",
//     status: "ongoing",
//     progress: 20,
//     cbs_categories: [],
//     termin: [],
//     adendum: [],
//   },
//   {
//     id: "PRJ-003",
//     name: "Retail Store Fitout",
//     description: "Complete interior renovation",
//     location: "Bandung",
//     budget: 750000000,
//     start_date: "2024-03-01",
//     end_date: "2024-07-31",
//     status: "finish",
//     progress: 100,
//     cbs_categories: [
//       { name: "Material", type: "Per Item", selected: true },
//       { name: "Sewa Alat", type: "Per Item", selected: true },
//     ],
//     termin: [],
//     adendum: [],
//   },
//   {
//     id: "PRJ-004",
//     name: "Bridge Maintenance 2024",
//     description: "Routine maintenance for City Bridge",
//     location: "Malang",
//     budget: 500000000,
//     start_date: "2024-03-01",
//     end_date: "2024-05-01",
//     status: "maintenance",
//     progress: 10,
//     cbs_categories: [],
//     termin: [],
//     adendum: [],
//   },
//   {
//     id: "PRJ-005",
//     name: "Apartment Complex",
//     description: "Holding due to license issues",
//     location: "Jakarta Barat",
//     budget: 15000000000,
//     start_date: "2024-01-01",
//     end_date: "2024-12-31",
//     status: "hold",
//     progress: 5,
//     cbs_categories: [],
//     termin: [],
//     adendum: [],
//   },
// ];

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],

  setProjects: (projects) => set({ projects }),

  getProjects: () => get().projects,

  getProjectById: (id) => get().projects.find((p) => p.id === id),

  addProject: (project) =>
    set((state) => ({
      projects: [...state.projects, project],
    })),

  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),

  updateProjectCBS: (projectId, cbsCategories) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, cbs_categories: cbsCategories } : p
      ),
    })),

  getProjectCBS: (projectId) => {
    const project = get().projects.find((p) => p.id === projectId);
    return project?.cbs_categories ?? [];
  },
}));
