# Backend route required: summary-monthly-sheet

The **Employee Attendance** page ("Daily Attendance Details") calls an API that your Laravel backend does not define yet, which causes:

```text
The route api/hr/v1/summary-monthly-sheet could not be found.
```

To fix this and load **real data** (no static fallback), the backend must register this route.

## Route contract

| Item        | Value |
|------------|--------|
| **Method** | `GET` |
| **Path**   | `summary-monthly-sheet` (relative to your API prefix, e.g. `api/hr/v1/`) |
| **Query**  | `employee_id` (required), `month` (required, format `YYYY-MM`) |

**Example request:**  
`GET /api/hr/v1/summary-monthly-sheet?employee_id=199&month=2026-02`

## Expected response body (JSON)

```json
{
  "total_days": 31,
  "summary": {
    "present": 22,
    "absent": 7,
    "leave_approved": 3,
    "leave_pending": 0,
    "permission_approved": 0,
    "permission_pending": 0,
    "weekend": 4,
    "official_holiday": 0,
    "missing_punch": 0,
    "future": 0,
    "rejected_requests": 0,
    "request_conflict_with_punch": 1
  },
  "rows": [
    {
      "date": "2026-02-01",
      "day_name": "Sunday",
      "check_in": null,
      "check_out": null,
      "source": "computed",
      "status": "absent",
      "sub_status": null,
      "type": null,
      "reason": "absent (no data)"
    }
  ]
}
```

- **total_days**: number of days in the month.
- **summary**: counts per status (keys as above; frontend can tolerate missing keys).
- **rows**: one object per day. Each row should include at least: `date`, `day_name`, `check_in`, `check_out`, `status`, `source`; optional: `sub_status`, `type`, `reason`.

## Laravel example

In your API routes file (e.g. `routes/api.php` or the file that defines `api/hr/v1`):

```php
Route::get('summary-monthly-sheet', [SummaryMonthlySheetController::class, 'show']);
```

Controller should read `employee_id` and `month` from the request and return the JSON structure above.

Once this route exists and returns that shape, the frontend will use it automatically with no further frontend changes.
