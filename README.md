# 🏦 Backend Ledger API

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=for-the-badge&logo=bun&logoColor=white)

An advanced, production-ready backend service for a core banking and transaction processing system. Built with Node.js, Express (v5), and MongoDB, this project tackles real-world fintech challenges including race conditions, data integrity, and network failures.

## 🏗 Core Architecture & Design Patterns

This system is built around strict financial engineering principles to ensure zero data loss and absolute consistency.

### 1. The Ledger Model (Single Source of Truth)
Balances are **never** stored as static, mutable fields. Instead, the system utilizes an append-only **Ledger Model**. 
- Every financial movement is recorded as an immutable ledger entry.
- Account balances are calculated dynamically (or materialized via views/aggregations) by summing up the ledger entries.
- This provides a complete audit trail and serves as the absolute single source of truth for the system.

### 2. Idempotent Transaction Processing
Network failures happen. To prevent a user from being charged twice during a retry, the API implements strict **Idempotency**.
- Clients provide an `Idempotency-Key` header with transaction requests.
- The system caches and tracks this key. If a duplicate request arrives with the same key, the system intercepts it and returns the cached successful response without executing the financial logic twice.

### 3. ACID-Compliant Operations
Utilizes MongoDB distributed transactions (Sessions) to ensure that multi-document updates (e.g., debiting one account and crediting another) either commit entirely or rollback completely on failure.

## ✨ Technical Features

- **Stateless Authentication:** Secure user sessions using JWT (`jsonwebtoken`) and HTTP-only cookies (`cookie-parser`).
- **Cryptographic Security:** Password hashing and salting via `bcryptjs`.
- **Asynchronous Communications:** Email notifications and alerts dispatched via `nodemailer`.
- **Fast Execution & DX:** Powered by [Bun](https://bun.sh/) for ultra-fast startup, execution, and native watch mode.
- **Centralized Error Handling:** Global middleware for catching and formatting API errors cleanly.

## 🗄️ Database Schema Overview

- **Users:** Authentication credentials and profile data.
- **Accounts:** Financial containers linked to users (can support multiple accounts per user).
- **Ledgers (Transactions):** The immutable log of all credits and debits referencing the Account IDs and Idempotency Keys.

## 🚀 API Integration (Examples)

*Note: All protected routes require a valid JWT via cookies or Bearer token.*

| Method | Endpoint | Description | Headers Required |
|--------|----------|-------------|------------------|
| `POST` | `/api/v1/auth/register` | Register a new user | |
| `POST` | `/api/v1/auth/login` | Authenticate user & issue JWT | |
| `GET`  | `/api/v1/accounts/balance` | Calculate balance from ledger | `Authorization` |
| `POST` | `/api/v1/transactions/transfer`| Execute a transfer | `Authorization`, `Idempotency-Key` |

## 🛠 Setup & Installation

### Prerequisites
- [Bun](https://bun.sh/) (or Node.js v18+)
- MongoDB (Replica set required for ACID transactions)

### 1. Clone & Install
```bash
git clone https://github.com/AyushK1218/Backend-Ledger.git
cd Backend-Ledger
bun install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ledger_db

# Security
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=1d

# SMTP / Email
EMAIL_USER=your_smtp_user
EMAIL_PASS=your_smtp_password
```

### 3. Start the Server
**Development (Watch Mode):**
```bash
bun run dev
```
**Production:**
```bash
bun start
```

## 📂 Code Structure

```text
Backend-Ledger/
├── src/
│   ├── config/         # Database and third-party service connections
│   ├── controllers/    # Route handlers and HTTP response logic
│   ├── middlewares/    # Auth guards, idempotency checks, error handlers
│   ├── models/         # Mongoose schemas (User, Ledger, Account)
│   ├── routes/         # Express API route definitions
│   └── services/       # Core business logic and database transactions
├── package.json        
├── server.js           # Express app bootstrap
└── bun.lock            
```

## 📄 License
[ISC License](LICENSE) - Created by [@AyushK1218](https://github.com/AyushK1218)
