# SchemeSaathi AI

A free-first scheme and scholarship discovery MVP with a React/Vite frontend, Spring Boot REST API, and MongoDB. Browsing does not require an account. Scheme records are starter examples; confirm eligibility, deadlines, and application details on the linked official portal.

## Run locally (no Docker)

Install Java 21, Maven, Node.js 20+, and MongoDB Community Server. Start the local MongoDB service.

1. In PowerShell, from `backend`, run `mvn spring-boot:run`. The app defaults to the `local` profile; no profile environment variable is needed.
2. In another terminal, from `frontend`, run `npm install` once, then `npm run dev`.
3. Open [http://localhost:5173](http://localhost:5173). Login and registration are at `/login` and `/register`.

The local profile creates a demo account on first startup: `demo@schemesaathi.local` / `SchemeSaathiDemo!`. Override with `DEMO_EMAIL` and `DEMO_PASSWORD` before starting the backend. The demo profile is for local testing only. Browsing the MongoDB catalog does not require an AI API key.

To enable Gemini-generated assistant answers, add `GEMINI_API_KEY=your-key` to `backend/local-secrets.properties` or set the variable in the backend terminal before starting Spring Boot. The key stays on the backend; do not put it in frontend code or commit it. Without a key, the assistant provides localized general guidance, not AI-generated answers. There is no single API key that supplies current data for every government scheme; the app currently reads its starter catalog from MongoDB.

For MongoDB Atlas, rotate any credential previously pasted into chat. Copy `backend/local-secrets.properties.example` to `backend/local-secrets.properties`, replace its placeholder URI with your rotated Atlas URI, and run `mvn spring-boot:run` from `backend`. The local secrets file is Git-ignored and loaded automatically. Include `/schemesaathi` in the URI path and URL-encode special characters in the password. Give the Atlas user `readWrite` access to `schemesaathi` and allow your current IP in Atlas Network Access. Alternatively, `.\run-local-atlas.ps1` prompts for credentials without saving them to a file.

If port 8080 is already in use, inspect its owner with `Get-NetTCPConnection -LocalPort 8080 -State Listen | Select-Object LocalAddress, LocalPort, OwningProcess`, then identify it with `Get-Process -Id <PID>`. Stop it only if you recognize it as a process you can close. Otherwise, set `$env:SERVER_PORT = "8081"` before starting the backend and `$env:VITE_API_URL = "http://localhost:8081"` before starting Vite.

## Optional Docker run

1. Install Docker Desktop with Compose.
2. Optionally create a `.env` file and set `GEMINI_API_KEY` to enable Gemini answers. Without a key, the assistant provides general, non-AI guidance.
3. Set a strong `ADMIN_PASSWORD` before exposing the service if you intend to use the protected admin endpoint.
4. From the project root, run `docker compose up --build`.
5. Open [http://localhost:8088](http://localhost:8088).

MongoDB stores scheme and category records in the `schemesaathi` database. No sample government-scheme records are inserted automatically. Only the non-policy category definitions are initialized once. Add approved scheme records through the backend or MongoDB Atlas.

Set `MONGODB_URI` locally as an environment variable or in `backend/local-secrets.properties`. The URI must include the database name, for example:

```properties
MONGODB_URI=mongodb+srv://<database-user>:<encoded-password>@<cluster-host>/schemesaathi
```

After startup, verify Atlas with:

- `GET http://localhost:8081/api/database/health` — verifies MongoDB ping and returns the database name.
- `GET http://localhost:8081/api/database/test` — local profile only; inserts, reads, and removes a temporary document.
- `POST http://localhost:8081/api/schemes` — saves an approved scheme document to the `schemes` collection.

## Development checks

- Run backend tests with `mvn test` from `backend`; create a frontend production build with `npm run build` from `frontend`.

The login flow uses MongoDB-backed accounts and BCrypt password hashes with an HTTP-only session cookie and CSRF protection. Registration accepts only a display name, email, and password. Do not use real identity or financial details in this testing build.

## API

- `GET /api/categories` — list extensible discovery categories.
- `GET /api/schemes?category=Students` — browse available records.
- `POST /api/schemes/match` — match a profile (`query`, `category`, `state`, `annualIncome`, `age`) against available records.
- `POST /api/assistant` — plain-language guidance; uses Gemini if `GEMINI_API_KEY` is configured.
- `POST /api/documents/parse` — extract possible age/income values from a PDF or text file (up to 5 MB); the file is processed in memory and not stored.
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout` — account registration and session authentication.
- `POST /api/admin/categories` — create a category using HTTP Basic authentication. Set `ADMIN_USERNAME` and a strong `ADMIN_PASSWORD` to enable the in-memory administrator account.
- `GET /actuator/health` — application health.

Eligibility matching is an informational filter, not an official determination. The sample dataset is deliberately small and must be maintained against current official sources before production use. Document parsing extracts text-based PDFs and does not perform OCR on scanned images.

## Privacy and production notes

Do not upload documents containing sensitive information unless you are comfortable with transient in-memory processing. Document contents are not stored or sent to Gemini. Avoid sharing Aadhaar numbers, bank details, passwords, and OTPs with the assistant. For production, configure HTTPS, secure and rotate administrator credentials, review CORS and rate limits, and verify scheme records and official URLs regularly.
