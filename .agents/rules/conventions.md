---
activation: always_on
description: Project conventions for Fleet & Rental System — git commits, frontend structure, API response format, and environment setup hygiene.
---

# Conventions — Fleet & Rental System

These are secondary to `.agents/rules/business-logic.md` (business logic always wins if there's a conflict), but should be followed consistently across the codebase.

## 1. Git Commit Convention

Use Conventional Commits format: `type(scope): description`

- `feat(booking): add overlap validation service`
- `fix(unit): correct discount threshold check`
- `chore(docs): update build plan`
- `refactor(booking): extract date overlap logic to service`

Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`

Keep commits scoped per logical change. Do not bundle backend and frontend changes for unrelated features into a single commit. Do not generate one large "final implementation" commit — commit incrementally as each phase in `docs/BUILD_PLAN.md` completes.

## 2. Frontend Conventions

- Functional components only, no class components
- Co-locate API call logic in a separate `services/` or `api/` folder — never inline `fetch`/`axios` calls directly inside component bodies
- Form validation error messages shown to the user must be in Indonesian and human-readable — never surface raw backend exception strings or stack traces to the UI
- The discount/total price shown in the booking form before submit is a preview only; always treat the backend-calculated value as authoritative after submit (see business-logic.md section 4)

## 3. API Response Format

All API responses (success and error) must follow a consistent structure. Use Laravel API Resources for success responses, and a consistent error shape for failures:

```json
// success
{ "success": true, "data": { ... }, "message": "Optional context" }

// error
{ "success": false, "message": "Unit tidak tersedia pada rentang tanggal tersebut", "errors": { ... } }
```

Do not let individual endpoints improvise their own response shape. If a new endpoint is added, match this structure.

## 4. CORS

Laravel must accept requests from the React dev server origin. In `config/cors.php`, ensure `allowed_origins` includes the Vite dev server URL (default `http://localhost:5173`). Do not set `allowed_origins` to `*` if credentials/cookies are involved — but for this project (no auth), a scoped localhost origin is sufficient. Do not skip this and leave the reviewer to debug a CORS failure on first run.

## 5. Environment & Git Hygiene

- `.gitignore` must exclude: `vendor/`, `node_modules/`, `.env` (both backend and frontend), `storage/*.key`, build artifacts
- Provide `.env.example` in both `backend/` and `frontend/`:
  - Backend: DB credentials matching the `docker-compose.yml` MySQL service (host, port, database name, user, password) so the setup is copy-paste-run
  - Frontend: `VITE_API_URL` pointing to the local Laravel API
- Never commit a real `.env` file. If one is accidentally committed, remove it from git history, not just delete it going forward.
