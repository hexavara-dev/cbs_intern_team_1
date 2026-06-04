# API Contract: WBS Cost Monitoring & Details

## 1. Get WBS Cost Monitoring List (Table View)

**Endpoint:** `GET /projects/:projectId/cost-report/wbs`
**Description:** Retrieves a flattened list of all WBS items within a project alongside their aggregated cost statistics (`planned_cost` and `actual_cost`). This is used to populate the main "WBS Cost Table" monitoring view.
**Authentication:** Required

### Response Format

```json
{
  "success": true,
  "message": "WBS Cost Monitoring data retrieved successfully",
  "data": [
    {
      "id": "uuid-string-1",        // Unique database ID of the WBS item
      "wbs_id": "1",                // Structural WBS code (e.g. "1", "1.1")
      "description": "Pekerjaan Persiapan",
      "is_leaf": false,             // Boolean indicating if this is the lowest level WBS
      "planned_cost": 150000000,    // Total RAP allocated for this WBS (including children if not leaf)
      "actual_cost": 50500000       // Total Realized Expenses for this WBS (including children if not leaf)
    },
    {
      "id": "uuid-string-2",
      "wbs_id": "1.1",
      "description": "Pembelian Material",
      "is_leaf": true,
      "planned_cost": 15000000,
      "actual_cost": 15500000
    }
    // ... all other WBS items in the project
  ]
}
```

---

## 2. Get WBS Cost Detail (Single Item View)

**Endpoint:** `GET /projects/:projectId/cost-report/wbs/:wbsId`
**Description:** Retrieves the detailed information of a specific WBS item, including its basic cost summary and the exhaustive list of all approved **Cost Out Records** associated with it. This is used in the WBS detail page (`/projects/[projectId]/cost-report/wbs/[wbsId]`).
**Authentication:** Required

### Response Format

```json
{
  "success": true,
  "message": "WBS item cost details retrieved successfully",
  "data": {
    "wbs_info": {
      "id": "uuid-string-2",
      "wbs_id": "1.1",
      "description": "Pembelian Material",
      "planned_cost": 15000000,
      "actual_cost": 15500000,
      "variance": -500000         // Calculation: planned_cost - actual_cost
    },
    "cost_records": [
      {
        "id": "record-uuid-1",
        "wbs_item": {
           "id": "uuid-string-2",
           "wbs_code": "1.1",
           "description": "Pembelian Material"
        },
        "activity_name": "Pembelian Semen & Pasir",
        "transaction_date": "2026-03-01",
        "vendor": {
          "id": "vendor-uuid-1",
          "name": "TB Sejahtera Abadi"
        },
        "status": "approved", // Only "approved" status should be returned here
        "total_amount": 15500000,
        "submitted_by": {
          "id": "user-uuid-1",
          "full_name": "Andi Surveyor"
        },
        "approved_by": {
          "id": "user-uuid-2",
          "full_name": "Budi Project Manager"
        },
        "approved_at": "2026-03-02",
        "approved_file": "url/to/document.pdf",
        "items": [
          {
            "id": "cost-item-uuid-1",
            "description": "Semen Tonasa 50kg",
            "quantity": 100,
            "unit": "Zak",
            "unit_cost": 75000,
            "total_price": 7500000,
            "cbs_category": {
              "id": "cbs-uuid-1",
              "name": "Material Bangunan",
              "cost_type": "Material"
            }
          },
          {
            "id": "cost-item-uuid-2",
            "description": "Pasir Beton",
            "quantity": 2,
            "unit": "Truk",
            "unit_cost": 4000000,
            "total_price": 8000000,
            "cbs_category": {
              "id": "cbs-uuid-2",
              "name": "Material Alam",
              "cost_type": "Material"
            }
          }
        ]
      }
      // ... more records associated to this specific wbsId
    ]
  }
}
```
