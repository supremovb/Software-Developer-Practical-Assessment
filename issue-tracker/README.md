# Issue Tracker — Smart Summary System

A full-stack web application for logging and managing software issues, with an AI-powered summary engine that automatically generates plain-language summaries and suggested next actions for each ticket.

Built as part of a Software Developer Practical Assessment.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Laravel 12 (PHP 8.2) |
| Database | MySQL 8+ |
| Queue | Laravel Queue (database driver) |
| Frontend | React 19 + React Router v7 |
| Styling | Tailwind CSS v4 |
| Build tool | Vite 8 |
| HTTP client | Axios |
| AI integration | OpenRouter API (free models available) with rules-based fallback |
| Testing | PHPUnit 11 (19 tests, 45 assertions) |

---

## Prerequisites

Before running the app, make sure you have:

- **PHP 8.2+** — `php -v`
- **Composer 2+** — `composer -V`
- **Node.js 20+ and npm** — `node -v && npm -v`
- **MySQL 8+** running locally (default port 3306)

---

## Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/supremovb/Software-Developer-Practical-Assessment.git
cd "Software-Developer-Practical-Assessment/issue-tracker"
```

### 2. Install PHP dependencies

```bash
composer install
```

### 3. Install JS dependencies

```bash
npm install
```

### 4. Configure environment

```bash
cp .env.example .env
php artisan key:generate
```

Open `.env` and set your MySQL credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=issue_tracker
DB_USERNAME=root
DB_PASSWORD=your_password_here
```

> **Optional:** Add your OpenRouter API key to enable AI-generated summaries.
> Free models are available — no credits required for `:free` tier models.
> Without a key, the built-in rules-based generator runs automatically.
> ```env
> OPENROUTER_API_KEY=sk-or-v1-...
> OPENROUTER_MODEL=nvidia/nemotron-3-super-120b-a12b:free
> ```
> Get a free key at https://openrouter.ai/keys

### 5. Create the database

In MySQL, run:

```sql
CREATE DATABASE issue_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 6. Run migrations and seed sample data

```bash
php artisan migrate --seed
```

This creates all tables and loads 5 sample issues across all priorities and categories, with comments.

---

## Running the App

You need **three processes** running at the same time. Open three terminal tabs inside `issue-tracker/`:

**Terminal 1 — PHP development server**
```bash
php artisan serve
```
API and backend available at `http://localhost:8000`

**Terminal 2 — Vite dev server (React frontend)**
```bash
npm run dev
```
Hot-reload frontend assets.

**Terminal 3 — Queue worker (async AI summary jobs)**
```bash
php artisan queue:work --tries=3
```
Processes `GenerateSummaryJob` after each issue is created or its description is updated.

Then open `http://localhost:8000` in your browser.

> **Tip:** If you have the `concurrently` package installed globally, or if you use Laravel Herd/Sail, you can start everything with one command. Otherwise the three-terminal approach above always works.

---

## Building for Production

```bash
npm run build
php artisan config:cache
php artisan route:cache
```

Then serve with a proper web server (Nginx/Apache) pointing `public/` as the document root.

---

## Running Tests

Tests use an **in-memory SQLite** database so they never touch your MySQL data.

```bash
php artisan test
```

Expected output:
```
  PASS  Tests\Feature\IssueTest        (10 tests)
  PASS  Tests\Feature\CommentTest      (4 tests)
  PASS  Tests\Feature\SummaryJobTest   (3 tests)
  PASS  Tests\Feature\ExampleTest      (1 test)
  PASS  Tests\Unit\ExampleTest         (1 test)

  Tests:    19 passed (45 assertions)
```

---

## API Reference

All endpoints are under `/api/v1`. JSON requests and responses throughout.

### Issues

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/issues` | List issues (filterable, paginated) |
| `POST` | `/api/v1/issues` | Create a new issue |
| `GET` | `/api/v1/issues/{id}` | Get a single issue with comments |
| `PATCH` | `/api/v1/issues/{id}` | Update an issue |
| `POST` | `/api/v1/issues/{id}/comments` | Add a comment to an issue |

### Query parameters for `GET /api/v1/issues`

| Parameter | Values | Description |
|---|---|---|
| `status` | `open`, `in_progress`, `resolved` | Filter by status |
| `priority` | `low`, `medium`, `high` | Filter by priority |
| `category` | any string | Filter by category |
| `needs_attention` | `1` | Show only high-priority open issues |
| `sort` | `created_at`, `updated_at`, `priority`, `status` | Sort field (default: `created_at`) |
| `direction` | `asc`, `desc` | Sort direction (default: `desc`) |
| `per_page` | integer | Results per page (default: 15) |

### Example curl calls

**Create an issue:**
```bash
curl -X POST http://localhost:8000/api/v1/issues \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Login fails after deployment",
    "description": "Users cannot log in since the 2.4.1 release. 500 error on /auth/login.",
    "priority": "high",
    "category": "auth"
  }'
```

**List open, high-priority issues:**
```bash
curl "http://localhost:8000/api/v1/issues?status=open&priority=high"
```

**Get a single issue with its comments:**
```bash
curl http://localhost:8000/api/v1/issues/1
```

**Update status:**
```bash
curl -X PATCH http://localhost:8000/api/v1/issues/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress"}'
```

**Add a comment:**
```bash
curl -X POST http://localhost:8000/api/v1/issues/1/comments \
  -H "Content-Type: application/json" \
  -d '{"author_name": "Alice Chen", "body": "Confirmed on staging as well."}'
```

---

## Architecture & Key Decisions

### Summary generation (two-path strategy)

`SummaryGeneratorInterface` defines a single `generate(Issue): array` contract. Two implementations exist:

- **`LLMSummaryGenerator`** — calls the OpenRouter API (OpenAI-compatible) and asks for a JSON response containing `summary` and `suggested_next_action`. Automatically delegates to `RulesBasedSummaryGenerator` when the API key is absent, the request fails, or the response is not valid JSON. Free models (e.g. `nvidia/nemotron-3-super-120b-a12b:free`) work with no credits required.
- **`RulesBasedSummaryGenerator`** — fully deterministic. Matches ~20 keywords from the issue title and description to infer the best next action, and uses the issue category to build the summary sentence. Works with zero external dependencies.

This means the app is fully functional out of the box without an OpenAI key.

### Async job processing

`GenerateSummaryJob` is dispatched after every `store()` and after any `update()` that changes the `description` field. Status-only updates do not re-dispatch the job (no wasted processing). The job has:
- 3 retry attempts with exponential backoff (10s → 60s → 180s)
- A `failed()` handler that marks `summary_status = 'failed'` so the UI can show the failure state

### No N+1 queries

- List endpoint: `withCount('comments')` eager-counts in a single JOIN
- Detail endpoint: `loadMissing('comments')` loads the relation in one query
- A regression test (`single-issue view ≤2 queries`) guards this permanently

### `needs_attention` flag

Set to `true` when priority is `high` AND status is not `resolved`. Recomputed on every create and on priority/status changes via `recomputeNeedsAttention()`. Filterable via `?needs_attention=1` to surface urgent tickets at a glance.

### Soft deletes

Issues use Laravel's `SoftDeletes` trait. Deleted issues are hidden from all API responses but remain in the database and can be restored.

### React SPA served by Laravel

A single catch-all Blade route (`/{any?}`) returns the `welcome.blade.php` shell, which loads the Vite-compiled React bundle. All client-side navigation is handled by React Router. API calls from the browser go to `/api/v1/*` which Laravel handles before the catch-all route fires.

---

## AI Usage Note

GitHub Copilot (Claude Sonnet) was used to accelerate development of this assessment. All code was reviewed, understood, and verified through passing tests and manual testing before submission.

The AI summary feature uses [OpenRouter](https://openrouter.ai) which provides free access to open-source LLMs (Llama, Gemma, Mistral, etc.) with no credits required for `:free` tier models.
