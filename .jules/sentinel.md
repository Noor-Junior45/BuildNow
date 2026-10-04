## 2024-05-18 - [Missing Authentication on Sensitive Endpoints]
**Vulnerability:** Several administrative and destructive endpoints (like clearing caches, deleting orders, and interacting with inbound emails) were not authenticated, allowing any unauthorized user to access them.
**Learning:** The `requireApiSecret` middleware was defined in `server.ts` but missing from many critical endpoints, exposing internal logic to potential abuse or data loss.
**Prevention:** Always verify that every new administrative endpoint includes the `requireApiSecret` middleware (or equivalent authentication check) when it is created. Maintain a checklist for administrative operations.
