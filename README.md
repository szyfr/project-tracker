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
projects by id and the same admin account by email, so re-running never
duplicates them.

### Seeded admin account

`php artisan db:seed` is optional — the tracker works with an empty database —
but it creates a ready-to-use login alongside the sample projects:

| Email | Password |
| --- | --- |
| `admin@example.com` | `password` |

Set `ADMIN_PASSWORD` in `.env` before seeding to use a different password. The
app has no roles or permissions, so "admin" here just means the account you sign
in with — but signing in is required, for the API as much as for the page. Seed
only the account with `php artisan db:seed --class=AdminUserSeeder`.

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

The entrypoint does not seed. To load the twelve sample projects and the
`admin@example.com` account:

```bash
docker run --rm -p 8000:80 --name project-tracker project-tracker
docker exec project-tracker php artisan db:seed --force
```

`--force` is required because the container runs with `APP_ENV=production`, and
`db:seed` otherwise stops to ask for confirmation — which it cannot do over
`docker exec`.

Pass `-e ADMIN_PASSWORD=...` to `docker run` to seed a password other than the
default `password`.

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
| Routes | `routes/web.php` (`Route::resource('projects')`, inside the `auth` middleware group) |
| Controller | `app/Http/Controllers/ProjectController.php` |
| Validation | `app/Http/Requests/{Store,Update}ProjectRequest.php`, rules shared in `app/Concerns/ProjectValidationRules.php` |
| Model and enums | `app/Models/Project.php`, `app/Enums/Project{Status,Priority}.php` |
| API responses | `app/Http/Resources/ProjectResource.php` |
| Seed data | `database/seeders/ProjectSeeder.php`, `database/seeders/AdminUserSeeder.php` |
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

The endpoints sit behind the `auth` middleware, so every request needs a valid
session cookie — the same one the browser gets after signing in. They are
exempt from CSRF verification (`bootstrap/app.php`), so once a client holds that
cookie it does not also need to send `X-XSRF-TOKEN`. Without a session, a
request that sends `Accept: application/json` gets a `401`; one that does not
gets a `302` to `/login`.

See [Testing the API in Postman](#testing-the-api-in-postman) for a walkthrough
of getting that cookie.

### Testing the API in Postman

Postman keeps a per-domain cookie jar and reuses it across requests, so the only
extra work is the login request itself — and login *is* CSRF protected, so it
needs a token that the project endpoints do not.

Seed the database first (`php artisan db:seed`) so the `admin@example.com`
account exists.

#### Step 1 — Prime the session

Send `GET http://localhost:8000/login`.

The response sets two cookies for `localhost`: `laravel-session` (the session
itself) and `XSRF-TOKEN` (the CSRF token). Postman stores both automatically.

#### Step 2 — Read the CSRF token

Open the **Cookies** link under the Send button, find `XSRF-TOKEN` for
`localhost`, and copy its value. The value is URL-encoded — decode it before
using it, which in practice means turning any trailing `%3D` back into `=`.

Skip this step if you use the [pre-request script](#automating-the-token) below.

#### Step 3 — Log in

Send `POST http://localhost:8000/login` with these headers:

| Header | Value |
| --- | --- |
| `Accept` | `application/json` |
| `Content-Type` | `application/json` |
| `X-XSRF-TOKEN` | the decoded token from step 2 |

and this raw JSON body:

```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

A successful login returns `200` with `{"two_factor": false}` and refreshes the
session cookie in the jar. Without `Accept: application/json` you get a `302` to
`/projects` instead, which works just as well but is harder to read.

#### Step 4 — Call the endpoints

Nothing further is needed: Postman attaches the session cookie on its own, and
the project routes are CSRF-exempt, so no `X-XSRF-TOKEN` header goes on them.

Send `GET http://localhost:8000/projects` with `Accept: application/json` and
you get the paginated list. `POST`, `PUT`, and `DELETE` also need
`Content-Type: application/json` for their bodies. Query parameters such as
`?search=acme&status=In%20Progress&per_page=5` go on the request as usual.

#### Automating the token

To avoid copying the token by hand, add this to the collection's **Pre-request
Script** tab so every request in the collection carries a fresh header:

```js
const jar = pm.cookies.jar();

jar.get(pm.request.url.getHost(), 'XSRF-TOKEN', (error, token) => {
    if (token) {
        pm.request.headers.upsert({
            key: 'X-XSRF-TOKEN',
            value: decodeURIComponent(token),
        });
    }
});
```

Scripts can only read cookies for allowlisted domains, so add `localhost` under
**Cookies → Domains Allowlist** first, otherwise `jar.get` returns nothing and
login fails with a `419`.

#### Troubleshooting

| Symptom | Cause |
| --- | --- |
| `401 Unauthenticated.` | No session cookie, or it expired. Log in again |
| A `302` to `/login` instead of JSON | The `Accept: application/json` header is missing |
| `419` on `POST /login` | Missing, stale, or still URL-encoded `X-XSRF-TOKEN`. Re-send `GET /login` and recopy |
| `422` on `POST /login` | Wrong credentials, or the database was never seeded |
| Cookie jar is empty | Postman's cookie jar is per-domain — `127.0.0.1` and `localhost` are different jars. Pick one and stay on it |

#### Logging out

Send `POST http://localhost:8000/logout` with the `X-XSRF-TOKEN` header — it is
CSRF protected like login. Clearing the cookie jar has the same practical
effect.

#### The same thing in curl

curl has no cookie jar unless you ask for one, so pass `-c` to save cookies and
`-b` to send them:

```bash
curl -c cookies.txt http://localhost:8000/login > /dev/null
curl -b cookies.txt -c cookies.txt -X POST http://localhost:8000/login \
  -H "Accept: application/json" -H "Content-Type: application/json" \
  -H "X-XSRF-TOKEN: $(grep XSRF-TOKEN cookies.txt | cut -f7 | sed 's/%3D/=/g')" \
  -d '{"email": "admin@example.com", "password": "password"}'
```

Every later call then just needs `-b cookies.txt`.

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

Log in first (see [Testing the API in Postman](#the-same-thing-in-curl) for the
two curl calls that produce `cookies.txt`), then:

```bash
curl -b cookies.txt -X POST http://localhost:8000/projects \
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
| `401` | Unauthenticated — no valid session cookie. Requests that do not send `Accept: application/json` get a `302` to `/login` instead |
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

- **The project endpoints require a session, not a token.** The routes sit
  behind the `auth` middleware and authenticate with the starter kit's session
  cookie; there is no token guard and no Sanctum. They stay exempt from CSRF
  verification (`bootstrap/app.php`) so a non-browser client needs only the
  cookie — a deliberate trade of CSRF protection on those routes for a simpler
  API. Adding Sanctum tokens would be the move if third-party clients ever need
  access.
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
