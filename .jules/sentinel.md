## YYYY-MM-DD - [CRITICAL] Multiple IDOR and Unauthorized Access Vulnerabilities

**Vulnerability:** Found multiple highly permissive Firestore rules (`allow read, write: if true;`) in sensitive collections like products, users, user_addresses, and user_upi. This would allow an unauthenticated user to overwrite the entire product catalog, read private user profiles, and manipulate or hijack user addresses and UPI information.
**Learning:** Development default rules (like test mode rules) were left intact. When building rules, one must enforce fine-grained access control (owner vs admin vs public read) based on invariants.
**Prevention:** Follow the principle of least privilege in Firestore. Always structure rules to explicitly verify identity via `isSignedIn()` and ownership via `request.auth.uid == resource.data.userId` for any sensitive data.
