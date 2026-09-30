## 2025-02-28 - Insecure Firestore Rules (Product catalog integrity)
**Vulnerability:** Products can be written by any user because `match /products/{productId}` has `allow write: if true;`
**Learning:** Even though `security_spec.md` states "Products can only be created or modified by authorized administrators", the actual Firestore rules (`firestore.rules`) allow anyone to modify them.
**Prevention:** Always restrict write access to `isAdmin()` for critical collections like products.
