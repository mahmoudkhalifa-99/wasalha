# Security Specification - Sada Admin

## Data Invariants
1. Orders must have a valid `customerId` matching the creator.
2. Only drivers can create offers.
3. Chat messages must belong to an existing order where the sender is either the customer or the driver.
4. Users cannot change their own roles or status once set (only Admin/Operator can).
5. Orders in terminal states (`DELIVERED`, `CANCELLED`, `DELIVERED_RATED`) cannot be modified except for rating updates.

## Dirty Dozen Payloads (Targeting Rejection)
1. **The Role Escalation**: `PATCH /users/{myId} { "role": "ADMIN" }` -> DENIED.
2. **The Status Spoof**: `PATCH /users/{myId} { "status": "APPROVED" }` -> DENIED.
3. **The Ghost Order**: `POST /orders { "customerId": "NOT_ME" }` -> DENIED.
4. **The Price Poison**: `POST /orders { "price": "1,000,000" }` (as string) -> DENIED.
5. **The Orphan Offer**: `POST /offers { "orderId": "NON_EXISTENT_ID" }` -> DENIED.
6. **The Shadow Message**: `POST /messages { "orderId": "order123", "senderId": "attacker" }` -> DENIED.
7. **The Negative Payout**: `POST /transactions { "amount": -1000 }` -> DENIED.
8. **The ID Injection**: `GET /orders/very-long-junk-string-id-exceeding-limit` -> DENIED.
9. **The Identity Thief**: `POST /offers { "driverId": "other_driver" }` -> DENIED.
10. **The Static Bypass**: `PATCH /orders/{orderId} { "status": "DELIVERED" }` (by customer) -> DENIED.
11. **The Timestamp Faker**: `POST /orders { "createdAt": 1000 }` (past timestamp) -> DENIED.
12. **The Field Injection**: `POST /users/{userId} { "extraField": "junk", "name": "..." }` -> DENIED (strict keys).
