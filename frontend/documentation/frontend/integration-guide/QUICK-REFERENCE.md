# Quick Reference: Store → API Mapping

> Panduan cepat untuk mapping fungsi store saat ini ke API endpoints.

---

## Projects

| Store Function            | API Endpoint        | Method |
| ------------------------- | ------------------- | ------ |
| `getProjects()`           | `/api/projects`     | GET    |
| `getProjectById(id)`      | `/api/projects/:id` | GET    |
| `addProject(data)`        | `/api/projects`     | POST   |
| `updateProject(id, data)` | `/api/projects/:id` | PATCH  |
| -                         | `/api/projects/:id` | DELETE |

---

## CBS (Cost Breakdown Structure)

### Master CBS

| Store Function             | API Endpoint   | Method |
| -------------------------- | -------------- | ------ |
| `setCBSData()` (init)      | `/api/cbs`     | GET    |
| `addCategory(data)`        | `/api/cbs`     | POST   |
| `updateCategory(id, data)` | `/api/cbs/:id` | PUT    |
| `deleteCategory(id)`       | `/api/cbs/:id` | DELETE |

### Project CBS Selection

| Store Function                            | API Endpoint                              | Method |
| ----------------------------------------- | ----------------------------------------- | ------ |
| `getProjectCBS(projectId)`                | `/api/projects/:projectId/cbs-selections` | GET    |
| `updateProjectCBS(projectId, categories)` | `/api/projects/:projectId/cbs-selections` | PUT    |

> ⚠️ **Catatan**: Field mapping: frontend `type` ↔ backend `cost_type`

---

## WBS (Work Breakdown Structure)

| Store Function                     | API Endpoint                          | Method |
| ---------------------------------- | ------------------------------------- | ------ |
| `setWBSData()` (init)              | `/api/projects/:projectId/wbs`        | GET    |
| `addItem(data)`                    | `/api/projects/:projectId/wbs`        | POST   |
| `updateItem(wbsId, data)`          | `/api/projects/:projectId/wbs/:wbsId` | PATCH  |
| `updateCBSCost(wbsId, key, value)` | `/api/projects/:projectId/wbs/:wbsId` | PATCH  |
| `deleteItem(wbsId)`                | `/api/projects/:projectId/wbs/:wbsId` | DELETE |

> ⚠️ **Backend Handles**:
>
> - `recalculateAllCosts()` → Backend otomatis hitung
> - `reindexWBS()` → Backend jalankan setelah DELETE
> - Parent `is_leaf` update → Backend jalankan saat CREATE

---

## Termins

| Store Function | API Endpoint                                 | Method |
| -------------- | -------------------------------------------- | ------ |
| Get termins    | `/api/projects/:projectId/termins`           | GET    |
| Add termin     | `/api/projects/:projectId/termins`           | POST   |
| Update termin  | `/api/projects/:projectId/termins/:terminId` | PATCH  |
| Delete termin  | `/api/projects/:projectId/termins/:terminId` | DELETE |

### Termin Allocations

| Action           | API Endpoint                                             | Method |
| ---------------- | -------------------------------------------------------- | ------ |
| Get allocations  | `/api/projects/:projectId/termins/:terminId/allocations` | GET    |
| Save allocations | `/api/projects/:projectId/termins/:terminId/allocations` | PUT    |

---

## Cost Control

| Action        | API Endpoint                                       | Method |
| ------------- | -------------------------------------------------- | ------ |
| Get records   | `/api/projects/:projectId/cost-records`            | GET    |
| Create record | `/api/projects/:projectId/cost-records`            | POST   |
| Get detail    | `/api/projects/:projectId/cost-records/:id`        | GET    |
| Update record | `/api/projects/:projectId/cost-records/:id`        | PATCH  |
| Delete record | `/api/projects/:projectId/cost-records/:id`        | DELETE |
| Update status | `/api/projects/:projectId/cost-records/:id/status` | PATCH  |

---

## Progress Monitoring

| Action          | API Endpoint                                          | Method |
| --------------- | ----------------------------------------------------- | ------ |
| Get progress    | `/api/projects/:projectId/termins/:terminId/progress` | GET    |
| Update progress | `/api/projects/:projectId/termins/:terminId/progress` | PUT    |

---

## Cost Report

| Action        | API Endpoint                                     | Method |
| ------------- | ------------------------------------------------ | ------ |
| Get summary   | `/api/projects/:projectId/cost-report/summary`   | GET    |
| Get by WBS    | `/api/projects/:projectId/cost-report/by-wbs`    | GET    |
| Get by CBS    | `/api/projects/:projectId/cost-report/by-cbs`    | GET    |
| Get by termin | `/api/projects/:projectId/cost-report/by-termin` | GET    |

---

## Response Format

```typescript
// Success
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}

// Error
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```
