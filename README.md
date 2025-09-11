# Lab Asset Management Service

Full‑stack application for managing lab assets and time‑bound reservations. Backend: FastAPI + SQLModel (JWT auth, role based). Frontend: React (Vite) + Tailwind. Supports normal users and administrators with distinct capabilities.

> Note: Admin dashboard UI (metrics view) intentionally not documented here yet per request.

---
## 1. Quick Start
### Backend (FastAPI)
Prerequisites: Python 3.10+, (optional) MySQL if you want a real DB; otherwise use SQLite for local dev.

```bash
# root
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Run API
uvicorn app.main:app --reload --port 8000
```
The API will be at: http://localhost:8000
Docs (OpenAPI): http://localhost:8000/docs

#### Database configuration
Default in code points to MySQL DSN:
```
mysql+pymysql://asset_user:your_password@localhost/asset_management
```
To use SQLite quickly, create `backend/app/.env` (or root `.env`) with:
```
SQLALCHEMY_DATABASE_URI=sqlite:///./dev.db
```
Tables auto‑create on startup (dev convenience). For production migrations — not yet set up here.

### Frontend (React + Vite)
```bash
# run it in diffrent terminal / server
cd frontend
npm install
npm run dev
```
App runs at: http://localhost:3000 (proxy not configured; frontend calls backend via absolute base URL in `src/api/axios.js`, default `http://localhost:8000/api/v1`).

To point frontend to a different backend:
Create `frontend/.env`:
```
VITE_API_URL=http://localhost:8000/api/v1
```

---
## 2. Authentication & Authorization
- JWT bearer tokens (HS256) issued via `/api/v1/auth/token`.
- All asset & reservation operations (except register/login) require a valid token.
- Admin‑only endpoints protected by role check.

### 2.1 First-Time Bootstrap (Initial Admin Creation) (Testing purpose only)
When the database is empty (no users):
1. Backend exposes `/api/v1/auth/bootstrap-status` returning `{ "empty": true }`.
2. Frontend detects this and shows a "Bootstrap Admin" button in the header (only visible when logged out and empty state confirmed).
3. Clicking it opens a modal to register the first user.
4. The first registered user is automatically given the `admin` role server-side. All later registrations default to `user`.
5. After creating the first admin, use the normal Login modal to authenticate.

Example cURL:
```bash
# Register (normal user)
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"alice","password":"Password123!","email":"alice@example.com"}'

# Login
token=$(curl -s -X POST http://localhost:8000/api/v1/auth/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'username=alice&password=Password123!' | jq -r .access_token)

# Authenticated request
curl -H "Authorization: Bearer $token" http://localhost:8000/api/v1/assets/
```

---
## 3. API Endpoints (Admin dashboard endpoint intentionally omitted)
Base prefix: `/api/v1`

### Auth
| Method | Path | Auth | Description | Payload | Response |
|--------|------|------|-------------|---------|----------|
| GET | `/auth/bootstrap-status` | None | Indicates if zero users exist (`empty`) | — | `200 {empty:boolean}` |
| POST | `/auth/register` | None | Create a normal user account | `{username,password,email?}` | `201 UserRead` |
| POST | `/auth/token` | Form | Obtain JWT token (scope = role) | `username,password` (form) | `200 {access_token,token_type}` |

### Users (Admin only)
| Method | Path | Description | Payload | Notes |
|--------|------|-------------|---------|-------|
| GET | `/users/` | List users | — | Requires admin |
| POST | `/users/` | Create user (optional role) | `{username,password,email?,full_name?,role?}` | Role defaults to `user` |
| PATCH | `/users/{username}` | Update user fields | Any of `{full_name,email,role,is_active}` | 404 if not found |

### Assets
| Method | Path | Auth | Description | Payload | Notes |
|--------|------|------|-------------|---------|-------|
| GET | `/assets/` | User | List all assets | — | — |
| POST | `/assets/` | Admin | Create asset | `{name,ip_address,description?}` | `ip_address` validated |
| GET | `/assets/{id}` | User | Get asset | — | 404 if missing |
| PUT | `/assets/{id}` | Admin | Replace asset | `{name,ip_address,description?}` | Full update |
| DELETE | `/assets/{id}` | Admin | Delete asset | — | 204 No Content |

### Reservations
| Method | Path | Auth | Description | Payload | Notes |
|--------|------|------|-------------|---------|-------|
| POST | `/reservations/` | User | Create reservation | `{asset_id,start_time,end_time,purpose?}` | Times ISO8601 (UTC). Must not overlap active reservation. `end_time > start_time` |
| GET | `/reservations/asset/{asset_id}` | User | List reservations (current week) | — | Masks other users: `user_name` becomes `***`. Week = Mon 00:00 → next Mon 00:00 UTC. |
| GET | `/reservations/asset/{asset_id}?all=true` | Admin | List all reservations (no week filter) | — | Still masks other users (current implementation). |
| DELETE | `/reservations/{reservation_id}` | User/Admin | Cancel reservation | — | Only owner or admin. Status set to `cancelled`. Returns 204. |

#### Reservation Masking Behavior
When listing reservations:
- If the reservation belongs to the requesting user: actual `user_name` returned.
- Otherwise: `user_name` replaced with `***` (even for admins at present).
- `purpose` is always visible.

#### Conflict Detection
A new reservation conflicts if any active reservation for the same asset overlaps (`start_time < existing.end_time` and `end_time > existing.start_time`). API returns `409` on conflict.

---
## 4. Data Models (Simplified)
### User
```
id, username (unique), email?, full_name?, hashed_password, role (user|admin), is_active, created_at
```
### Asset
```
id, name, ip_address, description?, created_at
```
### Reservation
```
id, asset_id, user_name, start_time, end_time, purpose?, status (active|cancelled|completed), created_at
```

---
## 5. Role Capabilities
### Normal User
- Register & login
- View asset list & details (after login)
- Create reservations (non‑overlapping time windows)
- View current week reservations per asset (others anonymized)
- Cancel own reservations

### Administrator
All user capabilities plus:
- Create users (optionally specifying role)
- Update existing users (role, email, name, active flag)
- List all users
- Create / update / delete assets
- View all reservations time range via `all=true` (still masked names currently)

---
## 6. Frontend Functionality (Overview)
- Auth context auto‑hydrates from stored token.
- Assets page is the landing view (inline asset creation form appears for admins only when toggled).
- Users management page (admins) to add users & toggle admin role.
- Reservation listing shows anonymized bookings; your own name is visible.
- Hidden admin login route: `/admin-login` (manual navigation only; header omits link).
- Bootstrap admin modal appears only when system has zero users (see 2.1) and disappears permanently after first admin creation.

---
## 7. Testing (Backend)
Install dev deps already included in `requirements.txt` then run:
```bash
pytest -q
```
