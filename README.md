# Presight User Directory

A small full-stack user directory application: a searchable, filterable,
infinite-scroll list of users backed by a SQLite database, with an
interactive sidebar for discovering and applying hobby/nationality filters
based on the current result set.

## Stack

- **Client**: React 19 + TypeScript, built with Vite, styled with Tailwind CSS, routed with `react-router-dom` (for URL search-param state, not multi-page navigation). Search text, selected filters, and sort field/direction are synced to the URL query string.
- **Server**: Node.js + Express (TypeScript, run via `tsx`), exposing a small REST API.
- **Database**: SQLite via `better-sqlite3`, seeded with `@faker-js/faker`.

## Data model

- `users` — `id, avatar, first_name, last_name, age, nationality`
- `hobbies` — a fixed vocabulary of ~40 hobby names
- `user_hobbies` — join table, 0–10 hobbies per user

A fixed vocabulary is used for hobbies and nationalities (rather than fully
random free text) so that "top 20" aggregates and multi-select filtering are
meaningful.

## API

| Endpoint | Description |
| --- | --- |
| `GET /api/users?page=&pageSize=&sortBy=&sortDir=&firstName=&lastName=&hobbies=&nationalities=` | Paginated user list. `sortBy` ∈ `id, first_name, last_name, age, nationality` (default `first_name`), `sortDir` ∈ `asc, desc` (default `asc`). Every sort is tie-broken by `id` in the same direction, so pages never duplicate or skip a user, even when many rows share a sort value. `pageSize` defaults to 20, capped at 100. |
| `GET /api/stats?firstName=&lastName=&hobbies=&nationalities=` | `{ topHobbies, topNationalities }`, each a list of up to 20 `{ value, count }` entries, ordered by count desc then value asc, computed over the subset of users matching the **same** filters as `/api/users` — not the global directory. |
| `GET /api/filter-options` | `{ nationalities, hobbies }` — every distinct nationality and hobby in the database (unfiltered), each sorted alphabetically. Powers the nationality/hobby multi-select dropdowns. |
| `GET /health` | Liveness check. |

**Filter params** (shared by `/api/users` and `/api/stats`):

- `firstName` — case-insensitive substring match against `first_name`.
- `lastName` — case-insensitive substring match against `last_name`.
- `nationalities` — comma-separated list; matches users from **any** of the listed nationalities (OR).
- `hobbies` — comma-separated list; matches users who have **all** of the listed hobbies (AND).
- All filters combine with AND: a user must match `firstName` (if given), match `lastName` (if given), belong to one of the selected nationalities (if any), and have every selected hobby (if any).

Example:

```
GET /api/users?firstName=an&hobbies=Reading,Cooking&nationalities=American,British&sortBy=age&sortDir=desc&page=1&pageSize=20
```

```json
{
  "data": [ { "id": 1997, "avatar": "...", "first_name": "Allen", "last_name": "Olson-Upton", "age": 85, "nationality": "American", "hobbies": ["Cooking", "Reading", "..."] } ],
  "pagination": { "page": 1, "pageSize": 20, "totalItems": 7, "totalPages": 1, "hasNextPage": false, "hasPrevPage": false }
}
```

```
GET /api/stats?hobbies=Reading,Cooking
```

```json
{
  "topHobbies": [ { "value": "Cooking", "count": 44 }, { "value": "Reading", "count": 44 }, "..." ],
  "topNationalities": [ { "value": "Indonesian", "count": 4 }, "..." ]
}
```

## Client

- Two debounced (300ms) search inputs filtering `first_name` and `last_name` independently.
- Nationality and hobby multi-select dropdowns (options loaded from `/api/filter-options`) let you build a filter directly, in addition to clicking rows in the sidebar.
- Responsive, bidirectionally-infinite-scrolling grid of user cards (avatar, name, nationality, age, up to 2 hobbies + `+n` overflow badge), fetched 80 users (`PAGE_SIZE`) per page. A column-count hook adapts the grid to the container width; sentinel elements above and below the grid, observed via `IntersectionObserver`, trigger loading the next or previous page as the user scrolls. Only a sliding window of up to 3 loaded pages is kept mounted — pages that scroll out of that window are dropped from the DOM (and the corresponding sentinel refetches them if the user scrolls back).
- Sidebar with top 20 hobbies / top 20 nationalities **for the current filter state**, rendered as clickable bar-chart rows — click to add a filter, click again to remove it.
- An "active filters" chip row above the sidebar lists every currently-selected hobby/nationality with its own remove (×) button, plus a "Clear all" action — this stays available even if a selected value later falls out of the current top-20 list (e.g. after combining it with other filters), so every applied filter always has a visible way to remove it.
- Sort field/direction controls.
- Search text, selected hobbies, selected nationalities, and sort field/direction are all reflected in the URL query string (`?firstName=&lastName=&hobbies=&nationalities=&sortBy=&sortDir=`) — reloading or sharing the URL restores the same view. (Scroll position/page is intentionally not part of the URL; infinite scroll always starts from the first page of the current filter/sort.)
- Distinct loading, empty, and error (with retry) states for both the user list and the sidebar stats, which refetch together whenever search or filters change.

## Running locally (without Docker)

Requires Node.js 20+.

**1. Server**

```bash
cd server
npm install
npm run seed   # creates/recreates server/data/presight.db with ~2000 users
npm run start  # http://localhost:4000
```

`SEED_COUNT` can be set to change how many users are generated (default `2000`), e.g. `SEED_COUNT=5000 npm run seed`.

**2. Client**

In a second terminal:

```bash
cd client
npm install
npm run dev    # http://localhost:5173
```

The Vite dev server proxies `/api` to `http://localhost:4000`, so no extra configuration is needed. Open http://localhost:5173.

## Running with Docker Compose

From the repo root:

```bash
docker compose up --build
```

- Client: http://localhost:3000 (nginx serving the production build, proxying `/api` to the server container)
- Server: http://localhost:4000

The server container seeds the SQLite database automatically on first run if
`server/data/presight.db` doesn't already exist (persisted in the `server-data`
named volume, so subsequent restarts reuse the same data). To force a
re-seed, remove the volume:

```bash
docker compose down -v
docker compose up --build
```

## Project structure

```
server/
  src/
    db/           # schema, connection, seed script
    services/      # query/filter/sorting/pagination/stats logic
    routes/         # Express routes
  Dockerfile
client/
  src/
    api/            # fetch client + types
    hooks/          # URL state, infinite-scroll/stats/filter-options data fetching, responsive columns
    components/      # UserCard, UserList, MultiSelectDropdown, Sidebar, SearchInput, SortControls, status views
  Dockerfile
  nginx.conf
docker-compose.yml
```
