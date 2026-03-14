# VDA Trading Platform – API Documentation

## Overview

- **Base URL:** `http://localhost:5000/api`
- **Auth:** JWT Bearer token (obtain via `POST /api/auth/login`)
- **Content-Type:** `application/json`

All authenticated requests must include the following header:

```
Authorization: Bearer <token>
```

---

## Authentication

### POST /api/auth/register

Register a new user account.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "StrongPass1!",
  "name": "John Doe"
}
```

**Response `201`:**
```json
{
  "token": "<jwt>",
  "user": { "id": "...", "email": "user@example.com", "name": "John Doe", "role": "TRADER" }
}
```

---

### POST /api/auth/login

Authenticate and obtain a JWT token.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "StrongPass1!"
}
```

**Response `200`:**
```json
{
  "token": "<jwt>",
  "user": { "id": "...", "email": "user@example.com", "name": "John Doe", "role": "TRADER" }
}
```

---

### GET /api/auth/me

Get the currently authenticated user's profile.

**Auth required:** Yes

**Response `200`:**
```json
{
  "id": "...",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "TRADER"
}
```

---

### POST /api/auth/2fa/setup

Set up two-factor authentication (TOTP).

**Auth required:** Yes

**Response `200`:**
```json
{
  "secret": "BASE32SECRET",
  "qrCode": "data:image/png;base64,..."
}
```

---

### POST /api/auth/2fa/verify

Verify a TOTP token and enable 2FA.

**Auth required:** Yes

**Request body:**
```json
{
  "token": "123456"
}
```

**Response `200`:**
```json
{ "message": "2FA enabled successfully" }
```

---

### POST /api/auth/2fa/disable

Disable two-factor authentication.

**Auth required:** Yes

**Request body:**
```json
{
  "token": "123456"
}
```

**Response `200`:**
```json
{ "message": "2FA disabled successfully" }
```

---

## Trading Endpoints

### GET /api/orders

List all open and pending orders for the authenticated user.

**Auth required:** Yes

**Response `200`:**
```json
[
  {
    "ticket": "1001",
    "symbol": "EURUSD",
    "type": "buy",
    "volume": 0.1,
    "openPrice": 1.085,
    "sl": 1.080,
    "tp": 1.090,
    "profit": 12.50,
    "status": "open"
  }
]
```

---

### POST /api/orders

Place a new market or pending order.

**Auth required:** Yes

**Request body:**
```json
{
  "symbol": "EURUSD",
  "type": "buy",
  "volume": 0.1,
  "price": 1.085,
  "sl": 1.080,
  "tp": 1.090
}
```

| Field    | Required | Description                              |
|----------|----------|------------------------------------------|
| `symbol` | Yes      | Trading symbol (e.g. `EURUSD`)           |
| `type`   | Yes      | `buy`, `sell`, `buy_limit`, `sell_limit` |
| `volume` | Yes      | Lot size                                 |
| `price`  | No       | Entry price (required for pending orders)|
| `sl`     | No       | Stop Loss price                          |
| `tp`     | No       | Take Profit price                        |

**Response `201`:**
```json
{ "ticket": "1002", "status": "open", ... }
```

---

### DELETE /api/orders/:ticket

Cancel a pending order.

**Auth required:** Yes

**Response `200`:**
```json
{ "message": "Order cancelled" }
```

---

### POST /api/orders/:ticket/close

Close an open position.

**Auth required:** Yes

**Response `200`:**
```json
{ "message": "Order closed", "profit": -5.20 }
```

---

### GET /api/account

Get account summary for the authenticated user.

**Auth required:** Yes

**Response `200`:**
```json
{
  "balance": 10000.00,
  "equity": 10012.50,
  "margin": 100.00,
  "freeMargin": 9912.50,
  "marginLevel": 10012.50
}
```

---

### GET /api/symbols

List all available trading symbols.

**Auth required:** Yes

**Response `200`:**
```json
[
  { "name": "EURUSD", "digits": 5, "spread": 1, "bid": 1.08500, "ask": 1.08501 }
]
```

---

### GET /api/symbols/:name

Get details for a specific trading symbol.

**Auth required:** Yes

**Response `200`:**
```json
{
  "name": "EURUSD",
  "digits": 5,
  "contractSize": 100000,
  "marginRequired": 1000,
  "bid": 1.08500,
  "ask": 1.08501
}
```

---

## Admin Endpoints

> All admin endpoints require `ADMIN`, `BROKER_ADMIN`, or `SUPER_ADMIN` role unless stated otherwise.

### GET /api/admin/accounts

List all trading accounts.

**Response `200`:** Array of account objects.

---

### GET /api/admin/orders

List all orders across all accounts.

**Response `200`:** Array of order objects.

---

### POST /api/admin/orders/:ticket/close

Force close an order on behalf of a trader.

**Response `200`:**
```json
{ "message": "Order force-closed" }
```

---

### POST /api/admin/accounts/:accountId/adjust

Manually adjust an account balance (credit/debit).

**Request body:**
```json
{
  "amount": 500.00,
  "comment": "Bonus credit"
}
```

**Response `200`:**
```json
{ "message": "Balance adjusted", "newBalance": 10500.00 }
```

---

### GET /api/admin/users

List all users. **Requires `SUPER_ADMIN` role.**

**Response `200`:** Array of user objects.

---

### POST /api/admin/users

Create a new user. **Requires `SUPER_ADMIN` role.**

**Request body:**
```json
{
  "email": "newuser@example.com",
  "password": "Pass1234!",
  "name": "New User",
  "role": "TRADER"
}
```

**Response `201`:** Created user object.

---

### PATCH /api/admin/users/:userId/status

Enable or disable a user account. **Requires `SUPER_ADMIN` role.**

**Request body:**
```json
{ "active": false }
```

**Response `200`:**
```json
{ "message": "User status updated" }
```

---

### GET /api/admin/audit

Retrieve the platform audit log.

**Response `200`:** Array of audit log entries (capped at 1000 in-memory).

---

### GET /api/admin/risk

Get current risk metrics for the platform.

**Response `200`:**
```json
{
  "totalExposure": 150000,
  "openPositions": 42,
  "totalFloatingPnL": -320.50
}
```

---

### GET /api/admin/metrics

Get overall platform metrics.

**Response `200`:**
```json
{
  "totalUsers": 120,
  "activeTraders": 35,
  "totalVolume": 4200.5,
  "totalDeposits": 250000
}
```

---

## CRM Endpoints

> Accessible by `CRM_AGENT`, `ADMIN`, `BROKER_ADMIN`, and `SUPER_ADMIN`.

### GET /api/crm/clients

List all CRM clients.

**Response `200`:** Array of client objects.

---

### GET /api/crm/clients/:id

Get a single client by ID.

**Response `200`:** Client object.

---

### POST /api/crm/clients

Create a new CRM client.

**Request body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "country": "US"
}
```

**Response `201`:** Created client object.

---

### PATCH /api/crm/clients/:id

Update an existing client.

**Request body:** Partial client fields to update.

**Response `200`:** Updated client object.

---

### DELETE /api/crm/clients/:id

Delete a client. **Requires `ADMIN` or higher.**

**Response `200`:**
```json
{ "message": "Client deleted" }
```

---

### GET /api/crm/leads

List all CRM leads.

**Response `200`:** Array of lead objects.

---

### POST /api/crm/leads

Create a new lead.

**Request body:**
```json
{
  "name": "Prospect User",
  "email": "prospect@example.com",
  "source": "website",
  "status": "new"
}
```

**Response `201`:** Created lead object.

---

### PATCH /api/crm/leads/:id

Update a lead's details or status.

**Request body:** Partial lead fields to update.

**Response `200`:** Updated lead object.

---

### GET /api/crm/notes

List notes, optionally filtered by client or lead.

**Query params:**
- `clientId` – filter by client
- `leadId` – filter by lead

**Response `200`:** Array of note objects.

---

### POST /api/crm/notes

Create a new note.

**Request body:**
```json
{
  "content": "Discussed account upgrade options.",
  "clientId": "abc123"
}
```

**Response `201`:** Created note object.

---

### GET /api/crm/activities

List activities, optionally filtered by client or lead.

**Query params:**
- `clientId` – filter by client
- `leadId` – filter by lead

**Response `200`:** Array of activity objects.

---

### POST /api/crm/activities

Create a new activity.

**Request body:**
```json
{
  "type": "call",
  "description": "Follow-up call",
  "clientId": "abc123",
  "scheduledAt": "2025-01-15T10:00:00Z"
}
```

**Response `201`:** Created activity object.

---

### GET /api/crm/tickets

List all support tickets.

**Response `200`:** Array of ticket objects.

---

### POST /api/crm/tickets

Create a new support ticket.

**Request body:**
```json
{
  "subject": "Withdrawal not processed",
  "description": "My withdrawal from 3 days ago is still pending.",
  "priority": "high",
  "clientId": "abc123"
}
```

**Response `201`:** Created ticket object.

---

### PATCH /api/crm/tickets/:id

Update a support ticket (status, assignment, resolution).

**Request body:** Partial ticket fields.

**Response `200`:** Updated ticket object.

---

## Finance Endpoints

> Deposit/withdrawal creation accessible by `TRADER`. Approve/reject requires `FINANCE` or `ADMIN`.

### GET /api/finance/deposits

List deposit requests for the authenticated user (or all, for admin roles).

**Response `200`:** Array of deposit objects.

---

### POST /api/finance/deposits

Create a new deposit request.

**Request body:**
```json
{
  "amount": 1000.00,
  "currency": "USD",
  "gatewayId": "gateway-001"
}
```

**Response `201`:** Created deposit object.

---

### PATCH /api/finance/deposits/:id/approve

Approve a pending deposit. **Requires `FINANCE` or `ADMIN`.**

**Response `200`:**
```json
{ "message": "Deposit approved" }
```

---

### PATCH /api/finance/deposits/:id/reject

Reject a pending deposit. **Requires `FINANCE` or `ADMIN`.**

**Request body:**
```json
{ "reason": "Unverified payment proof" }
```

**Response `200`:**
```json
{ "message": "Deposit rejected" }
```

---

### GET /api/finance/withdrawals

List withdrawal requests.

**Response `200`:** Array of withdrawal objects.

---

### POST /api/finance/withdrawals

Create a new withdrawal request.

**Request body:**
```json
{
  "amount": 500.00,
  "currency": "USD",
  "bankAccount": "IBAN123456"
}
```

**Response `201`:** Created withdrawal object.

---

### PATCH /api/finance/withdrawals/:id/approve

Approve a pending withdrawal. **Requires `FINANCE` or `ADMIN`.**

**Response `200`:**
```json
{ "message": "Withdrawal approved" }
```

---

### PATCH /api/finance/withdrawals/:id/reject

Reject a pending withdrawal. **Requires `FINANCE` or `ADMIN`.**

**Request body:**
```json
{ "reason": "Insufficient account balance" }
```

**Response `200`:**
```json
{ "message": "Withdrawal rejected" }
```

---

### GET /api/finance/gateways

List all payment gateways. **Requires `ADMIN` or higher.**

**Response `200`:** Array of gateway objects.

---

### POST /api/finance/gateways

Create a new payment gateway. **Requires `ADMIN` or higher.**

**Request body:**
```json
{
  "name": "Stripe",
  "type": "card",
  "apiKey": "sk_live_...",
  "currencies": ["USD", "EUR"]
}
```

**Response `201`:** Created gateway object.

---

### PATCH /api/finance/gateways/:id

Update gateway configuration. **Requires `ADMIN` or higher.**

**Request body:** Partial gateway fields.

**Response `200`:** Updated gateway object.

---

### PATCH /api/finance/gateways/:id/toggle

Enable or disable a payment gateway. **Requires `ADMIN` or higher.**

**Response `200`:**
```json
{ "message": "Gateway status updated", "active": false }
```

---

## Document / KYC Endpoints

> Document upload accessible by `TRADER`. Review requires `ADMIN` or higher.

### GET /api/documents

List documents for the authenticated user (admins see all).

**Response `200`:** Array of document objects.

---

### POST /api/documents

Upload a document (simulated – no actual file storage in demo mode).

**Request body:**
```json
{
  "type": "passport",
  "fileName": "passport.jpg",
  "fileData": "base64encodedstring..."
}
```

**Response `201`:** Created document object.

---

### PATCH /api/documents/:id/review

Review and approve or reject a document. **Requires `ADMIN` or higher.**

**Request body:**
```json
{
  "status": "approved",
  "notes": "Document verified successfully."
}
```

**Response `200`:** Updated document object.

---

### GET /api/documents/kyc/:userId

Get the KYC verification status for a specific user.

**Auth required:** Yes (admin, or own account)

**Response `200`:**
```json
{
  "userId": "...",
  "status": "pending",
  "documents": [...]
}
```

---

### POST /api/documents/kyc

Create or update a KYC review record. **Requires `ADMIN` or higher.**

**Request body:**
```json
{
  "userId": "...",
  "status": "approved",
  "reviewedBy": "admin@vda.trade"
}
```

**Response `201`:** KYC review object.

---

## Chat Endpoints

### GET /api/chat/conversations

List all conversations for the authenticated user.

**Response `200`:** Array of conversation objects.

---

### POST /api/chat/conversations

Create a new conversation.

**Request body:**
```json
{
  "subject": "Withdrawal help",
  "participantIds": ["user-id-1"]
}
```

**Response `201`:** Created conversation object.

---

### GET /api/chat/conversations/:id

Get a conversation along with its messages.

**Response `200`:**
```json
{
  "id": "...",
  "subject": "Withdrawal help",
  "messages": [...]
}
```

---

### POST /api/chat/conversations/:id/messages

Send a message to a conversation.

**Request body:**
```json
{
  "content": "Hello, I need help with my withdrawal."
}
```

**Response `201`:** Created message object.

---

### PATCH /api/chat/conversations/:id/read

Mark all messages in a conversation as read.

**Response `200`:**
```json
{ "message": "Marked as read" }
```

---

## Settings Endpoints

### GET /api/settings

List all platform settings.

**Response `200`:** Array of setting objects.

---

### GET /api/settings/:key

Get a single setting by key.

**Response `200`:**
```json
{ "key": "maintenance_mode", "value": "false" }
```

---

### PATCH /api/settings/:key

Update a setting value. **Requires `ADMIN` or higher.**

**Request body:**
```json
{ "value": "true" }
```

**Response `200`:** Updated setting object.

---

### POST /api/settings/bulk

Bulk update multiple settings. **Requires `ADMIN` or higher.**

**Request body:**
```json
[
  { "key": "maintenance_mode", "value": "false" },
  { "key": "max_leverage", "value": "500" }
]
```

**Response `200`:**
```json
{ "message": "Settings updated" }
```

---

## Broker Endpoints

> All broker management endpoints require `SUPER_ADMIN` role unless stated otherwise.

### GET /api/brokers

List all brokers. **Requires `SUPER_ADMIN`.**

**Response `200`:** Array of broker objects.

---

### GET /api/brokers/:id

Get details of a specific broker.

**Auth required:** Yes (own broker scope, or `SUPER_ADMIN`)

**Response `200`:** Broker object.

---

### POST /api/brokers

Create a new broker. **Requires `SUPER_ADMIN`.**

**Request body:**
```json
{
  "name": "Alpha Broker",
  "domain": "alpha.vda.trade",
  "adminEmail": "admin@alpha.vda.trade"
}
```

**Response `201`:** Created broker object.

---

### PATCH /api/brokers/:id

Update broker details. **Requires `SUPER_ADMIN`.**

**Request body:** Partial broker fields.

**Response `200`:** Updated broker object.

---

### PATCH /api/brokers/:id/status

Toggle a broker's active status. **Requires `SUPER_ADMIN`.**

**Response `200`:**
```json
{ "message": "Broker status updated", "active": false }
```

---

### GET /api/brokers/:id/admins

List admins assigned to a broker.

**Auth required:** Yes (broker scope or `SUPER_ADMIN`)

**Response `200`:** Array of admin user objects.

---

### POST /api/brokers/:id/admins

Assign an admin to a broker. **Requires `SUPER_ADMIN`.**

**Request body:**
```json
{ "userId": "user-id-123" }
```

**Response `201`:**
```json
{ "message": "Admin assigned to broker" }
```

---

## Wallet Endpoints

### GET /api/wallet/transactions

List all wallet transactions for the authenticated user.

**Response `200`:** Array of transaction objects.

---

### POST /api/wallet/deposit

Initiate a wallet deposit.

**Request body:**
```json
{
  "amount": 500.00,
  "currency": "USD"
}
```

**Response `201`:** Created transaction object.

---

### POST /api/wallet/withdraw

Submit a wallet withdrawal request.

**Request body:**
```json
{
  "amount": 200.00,
  "currency": "USD",
  "destination": "bank_account_123"
}
```

**Response `201`:** Created withdrawal transaction object.

---

## Error Responses

All errors follow a standard JSON format:

```json
{ "error": "Descriptive error message" }
```

| Status Code | Meaning                          |
|-------------|----------------------------------|
| `200`       | OK                               |
| `201`       | Created                          |
| `400`       | Bad Request (validation error)   |
| `401`       | Unauthorized (missing/invalid JWT) |
| `403`       | Forbidden (insufficient role)    |
| `404`       | Not Found                        |
| `429`       | Too Many Requests (rate limited) |
| `500`       | Internal Server Error            |

---

## Demo Credentials

| Role          | Email               | Password     |
|---------------|---------------------|--------------|
| `SUPER_ADMIN` | super@vda.trade     | Super1234!   |
| `ADMIN`       | admin@vda.trade     | Admin1234!   |
| `TRADER`      | demo@vda.trade      | Demo1234!    |
