## 2025-02-15 - [CRITICAL] Missing Authentication on Admin Endpoints
**Vulnerability:** Critical administrative API endpoints (like order deletion and email management routes) were publicly accessible without any authentication checks in `server.ts`.
**Learning:** Even if client-side code checks for an admin user or doesn't expose the functionality to normal users, server-side APIs must always validate authentication independently.
**Prevention:** Ensure that all sensitive and administrative endpoints use the `requireApiSecret` middleware (or equivalent auth guards) in route definitions before processing requests.
