## 2024-05-24 - [CRITICAL] Fixed Insecure Firestore Rules
**Vulnerability:** The Firestore rules allowed unauthenticated writes to the `/products/{productId}` collection and public reads of all `/users/{userId}` profiles. It also allowed users to create and update any user profile without ownership verification.
**Learning:** Default Firestore rules or permissive rules used during initial development were left in place, leading to authorization bypass and unauthorized data access/modification.
**Prevention:** Always implement strict role-based access control (RBAC) and ownership checks (`isOwner`, `isAdmin`) in Firestore rules before deploying to production. Avoid `allow read: if true;` for sensitive user data and `allow write: if true;` for any collection.
