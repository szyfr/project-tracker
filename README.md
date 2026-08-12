# Client Project Tracker

A small project tracker for a digital agency: list client projects, track status and
priority, and manage them through a REST API.

Built on the Laravel React starter kit — Laravel 13, Inertia v3, React 19,
Tailwind v4 with shadcn/ui, SQLite, and Pest.

## Features Implemented

- **Full CRUD over a REST API** — list, read, create, update, and delete client
  projects at `/projects`, with `snake_case` JSON in and out.
- **Project list page** — a React table at `/projects` showing client, project,
  status, priority, and dates, with status badges and priority text.
- **Create and edit in a dialog** — one form dialog serves both, posting to the
  API and surfacing per-field `422` errors inline.
- **Delete with confirmation** — a confirm dialog guards deletion, and the table
  steps back a page when the last row on a page is removed.
- **Server-side search and filtering** — search matches `client_name` or
  `project_name`; status and priority filter by exact enum value. All filtering
  happens in SQL, not in the browser.
- **Server-side pagination** — 10 per page by default, `per_page` up to 100,
  with page metadata returned alongside the data.
- **Validated input** — shared rules across store and update, enum-backed status
  and priority, ISO dates bounded to 1900–2100, and `due_date` never earlier
  than `start_date`.
- **Loading, empty, and error states** — skeletons while fetching, distinct
  empty states for "no projects yet" versus "no matches", and a retry button
  when a request fails.
- **Test coverage** — Pest feature tests for the API (`ProjectApiTest`) and the
  page (`ProjectPageTest`), plus Pint, PHPStan level 7, ESLint, and `tsc`.

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

To run the app without installing PHP or Node locally, see
[Running with Docker](#running-with-docker) instead.

### Checks

```bash
composer test         # Pint, PHPStan (level 7), and Pest
npm run lint:check    # ESLint
npm run types:check   # tsc --noEmit
```

## Running with Docker

The `Dockerfile` builds a single self-contained image — PHP 8.4 on FrankenPHP,
serving the built assets and the SQLite database from inside the container. No
database service is needed.

```bash
docker build -t project-tracker .
docker run --rm -p 8000:80 project-tracker
```

The app is then available at http://localhost:8000.

`.env` is baked into the image from `.env.example` at build time. On every start
the entrypoint generates `APP_KEY` if it is not set, creates the SQLite file,
runs `php artisan migrate --force`, and caches config, routes, and views. The
container sets `APP_ENV=production` and `APP_DEBUG=false` as real environment
variables, which win over the values in `.env` — Laravel loads dotenv immutably.

The entrypoint does not seed. To load the twelve sample projects:

```bash
docker run --rm -p 8000:80 --name project-tracker project-tracker
docker exec project-tracker php artisan db:seed
```

### Persisting data

The SQLite file lives at `/app/database/database.sqlite` inside the container,
so it is lost when the container is removed. Mount a volume to keep it:

```bash
docker volume create project-tracker-db
docker run --rm -p 8000:80 -v project-tracker-db:/app/database project-tracker
```

Pass `-e DB_CONNECTION=pgsql` and the usual `DB_*` variables to point at an
external database instead; the entrypoint then skips the SQLite file entirely.

### How the build is staged

| Stage | Does |
| --- | --- |
| `vendor` | `composer install --no-dev` plus an optimized autoloader |
| `assets` | `npm ci && npm run build`, on Node with a PHP CLI — the Wayfinder Vite plugin shells out to `php artisan`, and `resources/js/{actions,routes}` are generated, not committed |
| `runtime` | FrankenPHP, running as `www-data` on port 80 |

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

Returns a page of projects ordered by id, wrapped in `data` with pagination
`meta`.

| Query parameter | Notes |
| --- | --- |
| `search` | Optional, max 255. Matches `client_name` or `project_name` |
| `status` | Optional. One of the status values |
| `priority` | Optional. One of the priority values |
| `page` | Optional, min 1. Defaults to `1` |
| `per_page` | Optional, 1–100. Defaults to `10` |

An unknown `status` or `priority` is a `422`, not an empty result.

```json
{
  "data": [
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
  ],
  "meta": {
    "current_page": 1,
    "last_page": 2,
    "per_page": 10,
    "total": 12,
    "from": 1,
    "to": 10
  }
}
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

## Assumptions Made

- **The project endpoints are public.** The brief did not call for auth, so the
  routes sit outside the auth middleware and are exempt from CSRF verification
  so they work from curl or Postman. The starter kit's login and registration
  remain available, and authenticated users land on `/projects`; putting the
  tracker behind `auth` means adding the middleware and dropping that CSRF
  exemption.
- **Projects have no owner.** There is no `user_id` on `projects` — every user
  sees the same list. Adding multi-tenancy later means a foreign key, a scope,
  and a policy.
- **Status and priority are fixed sets**, modelled as PHP enums rather than a
  lookup table. Changing the options is a code change plus a data migration.
- **`PUT` replaces rather than patches.** The resource route exposes `PUT`
  only, so all required fields must be sent on every update. There is no
  `PATCH` for partial updates.
- **Dates are date-only and timezone-free.** `start_date` and `due_date` are
  stored as `YYYY-MM-DD` with no time component, bounded to 1900–2100 to catch
  typos. Both are optional, and a `due_date` may be set without a `start_date`.
- **Search is a case-insensitive `LIKE` scan.** That is fine at this data size;
  a full-text index would be the next step if the table grows.
- **Deletes are permanent.** No soft deletes, so the confirm dialog is the only
  safety net.
- **SQLite is the database.** It keeps setup to one command; nothing in the
  schema or queries is SQLite-specific, so another driver works by changing
  `.env`.
- **The list page fetches through the JSON API** rather than through Inertia
  props, so validation errors arrive as `422` responses and the same endpoints
  serve both the UI and external clients.
