---
paths:
  - app/Http/Controllers/ProjectController.php
---

# Controllers

## GET /projects content-negotiates between the Inertia page and JSON
`ProjectController@index` returns the `projects/index` Inertia page for browser requests and a paginated JSON payload when the request expects JSON. All other project endpoints (show/store/update/destroy) are JSON-only and are called from the React page through `resources/js/lib/projects-api.ts`, not through Inertia visits — so validation errors arrive as 422 responses, not as session-flashed Inertia errors.

## GET /projects returns a filtered, paginated envelope
JSON requests to `index` now return `{"data": [...], "meta": {current_page, last_page, per_page, total, from, to}}`, not a bare array. Filtering (search, status, priority) and paging happen in SQL via `IndexProjectRequest` plus the `matchingName`/`withStatus`/`withPriority` scopes on Project — the React page no longer filters client-side, so keep new list filters server-side too. The meta block is built by hand rather than through `ProjectResource::collection($paginator)` because ProjectResource sets `$wrap = null`.
