// Test data matching the provided JSON response
export const testInterviewData = {
  "status": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "applicant_id": 347,
        "department_id": 1,
        "interviewer_id": 195,
        "interview_date": "2026-02-21",
        "interview_time": "16:00:00",
        "level": "First update",
        "type": "HR",
        "status": "passed",
        "rate": "4.50",
        "comment": "Good communication",
        "created_at": "2026-02-21T13:10:49.000000Z",
        "updated_at": "2026-02-21T13:16:46.000000Z",
        "applicant": {
          "id": 347,
          "first_name": "test",
          "middle_name": "new",
          "last_name": "pending",
          "phone": "01556531149",
          "applicant_code": null,
          "position_applied_for_id": 1,
          "status": "pending",
          "image": "public/assets/library/images/1770794827_Screenshot_2025-07-10_102046.png",
          "position_applied_for": {
            "id": 1,
            "title_en": "back end"
          }
        },
        "department": {
          "id": 1,
          "name_en": "Programs House"
        },
        "interviewer": {
          "id": 195,
          "applicant_id": 277,
          "applicant": {
            "id": 277,
            "first_name": "Hassan",
            "middle_name": null,
            "last_name": "Nabil"
          }
        }
      }
    ],
    "first_page_url": "https://www.programshouse.com/hr/api/hr/v1/interviews?page=1",
    "from": 1,
    "last_page": 1,
    "last_page_url": "https://www.programshouse.com/hr/api/hr/v1/interviews?page=1",
    "links": [
      {
        "url": null,
        "label": "&laquo; Previous",
        "page": null,
        "active": false
      },
      {
        "url": "https://www.programshouse.com/hr/api/hr/v1/interviews?page=1",
        "label": "1",
        "page": 1,
        "active": true
      },
      {
        "url": null,
        "label": "Next &raquo;",
        "page": null,
        "active": false
      }
    ],
    "next_page_url": null,
    "path": "https://www.programshouse.com/hr/api/hr/v1/interviews",
    "per_page": 20,
    "prev_page_url": null,
    "to": 1,
    "total": 1
  }
};
