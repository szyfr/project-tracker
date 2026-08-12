---
paths:
  - app/Http/Controllers/ProjectController.php
---

# Controllers

## GET /projects content-negotiates between the Inertia page and JSON
`ProjectController@index` returns the `projects/index` Inertia page for browser requests and a JSON array of projects when the request expects JSON. All other project endpoints (show/store/update/destroy) are JSON-only and are called from the React page through `resources/js/lib/projects-api.ts`, not through Inertia visits — so validation errors arrive as 422 responses, not as session-flashed Inertia errors.
