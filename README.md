# Client Project Tracker

A small project tracker for a digital agency: list client projects, track status and
priority, and manage them through a REST API.

Built on the Laravel React starter kit — Laravel 13, Inertia v3, React 19,
Tailwind v4 with shadcn/ui, SQLite, and Pest.

## Setup

```bash
composer setup   # install deps, create .env, generate key, migrate, build assets
php artisan db:seed
composer dev     # serve the app, queue, logs, and Vite together
```

The app is then available at http://localhost:8000; the tracker lives at `/projects`.

`composer setup` creates `.env` from `.env.example` and uses the SQLite database at
`database/database.sqlite`. Seeding is idempotent — it inserts the same twelve
projects by id, so re-running never duplicates them.

### Checks

```bash
composer test         # Pint, PHPStan (level 7), and Pest
npm run lint:check    # ESLint
npm run types:check   # tsc --noEmit
```

## Architecture

| Concern | Location |
| --- | --- |
| Routes | `routes/web.php` (`Route::resource('projects')`) |
| Controller | `app/Http/Controllers/ProjectController.php` |
| Validation | `app/Http/Requests/{Store,Update}ProjectRequest.php`, rules shared in `app/Concerns/ProjectValidationRules.php` |
| Model and enums | `app/Models/Project.php`, `app/Enums/Project{Status,Priority}.php` |
| API responses | `app/Http/Resources/ProjectResource.php` |
| Seed data | `database/seeders/ProjectSeeder.php` |
| Page and components | `resources/js/pages/projects/index.tsx`, `resources/js/components/projects/` |
| API client | `resources/js/lib/projects-api.ts` |

`GET /projects` content-negotiates: browsers get the Inertia page, requests that
send `Accept: application/json` get the project list. Every other endpoint is
JSON only. The React page talks to those endpoints through
`resources/js/lib/projects-api.ts` rather than through Inertia visits, so
validation failures arrive as `422` responses.

## API

All endpoints accept and return `snake_case` JSON — send
`Accept: application/json` to get JSON back from `GET /projects`.

The endpoints are public and exempt from CSRF verification
(`bootstrap/app.php`), so they work from curl, Postman, or any HTTP client
without a session. If these routes ever move behind authentication, drop that
exemption and send the `X-XSRF-TOKEN` header instead.

### Project object

| Field | Type | Notes |
| --- | --- | --- |
| `id` | integer | Auto-generated |
| `client_name` | string | Required, max 255 |
| `project_name` | string | Required, max 255 |
| `description` | string \| null | Optional, max 2000 |
| `status` | string | Required: `Planning`, `In Progress`, `On Hold`, `Completed` |
| `priority` | string | Required: `Low`, `Medium`, `High` |
| `start_date` | string \| null | Optional, `YYYY-MM-DD`, between `1900-01-01` and `2100-12-31` |
| `due_date` | string \| null | Optional, `YYYY-MM-DD`, same bounds, not earlier than `start_date` |

### `GET /projects`

Returns every project, ordered by id.

```json
[
  {
    "id": 1,
    "client_name": "Acme Corporation",
    "project_name": "Corporate Website Redesign",
    "description": "Redesign and modernize the company's corporate website.",
    "status": "In Progress",
    "priority": "High",
    "start_date": "2026-06-01",
    "due_date": "2026-07-15"
  }
]
```

### `GET /projects/{id}`

Returns one project, or `404` if it does not exist.

### `POST /projects`

Creates a project and returns it with `201 Created`.

```bash
curl -X POST http://localhost:8000/projects \
  -H "Accept: application/json" -H "Content-Type: application/json" \
  -d '{
    "client_name": "Acme Corporation",
    "project_name": "Corporate Website Redesign",
    "description": "Redesign and modernize the company'\''s corporate website.",
    "status": "Planning",
    "priority": "High",
    "start_date": "2026-08-12",
    "due_date": "2026-09-30"
  }'
```

### `PUT /projects/{id}`

Replaces a project with the submitted values and returns it with `200 OK`, or
`404` if it does not exist. The same validation rules as `POST` apply, so all
required fields must be sent.

### `DELETE /projects/{id}`

Deletes a project and returns `204 No Content`, or `404` if it does not exist.

### Errors

| Status | Meaning |
| --- | --- |
| `404` | Project not found — `{"message": "Resource not found."}` |
| `422` | Validation failed |
| `500` | Unexpected server error |

Validation failures list every failing field:

```json
{
  "message": "The client name field is required. (and 2 more errors)",
  "errors": {
    "client_name": ["The client name field is required."],
    "priority": ["Priority must be Low, Medium, or High."],
    "due_date": ["Due date cannot be earlier than the start date."]
  }
}
```
