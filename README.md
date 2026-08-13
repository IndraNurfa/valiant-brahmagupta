# Phone Role & OTP Lookup Tool

An internal lightweight web tool for ops/support staff to look up a phone number's role and retrieve the latest OTP code — all in a single click.

---

## Setup

### 1. Prerequisites
- Node.js ≥ 18
- Access to database network

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
```

Edit `.env` with your environment configuration:

```
DB_HOST=<host>
DB_PORT=3306
DB_USER=<user>
DB_PASSWORD=<password>
DB_NAME=<database>
OTP_API_BASE=<otp_api_url>
PORT=3000
```

### 4. Start the app
```bash
npm start
```

Then open **http://localhost:3000** in your browser (or the configured port).

---

## Usage

1. Enter a phone number in any supported format (e.g. `0812345678`, `+62812345678`).
2. Click **Check**.
3. The result shows:
   - **User Role** — Associated role label (if found).
   - **OTP Code** — Latest OTP code with a **Copy** button.
   - If OTP not found: "Not Found".
   - If OTP call failed: "Failed to get OTP — try again".

---

## Architecture

- `server.js` — Express app entry point
- `public/index.html` — Single-page frontend
- `.env` — Environment configuration (not committed)

---

## Notes

- Read-only DB access.
- No audit logging or history stored.
