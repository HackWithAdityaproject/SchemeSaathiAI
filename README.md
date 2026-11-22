# SchemeSaathi AI

AI-powered government scheme and scholarship discovery platform that helps citizens identify potential benefits, understand eligibility requirements, and navigate official application portals.

A free-first MVP built with React, Vite, Spring Boot, and MongoDB. Browsing does not require an account.

> **Important:** Scheme records are starter examples. Always verify eligibility, deadlines, benefits, and application details through the linked official government portals.

## Tech Stack

- **Frontend:** React, Vite
- **Backend:** Java 21, Spring Boot
- **Database:** MongoDB
- **AI Integration:** Google Gemini API (optional)
- **Authentication:** Spring Security, BCrypt, HTTP-only session cookies

## Features

- Browse government schemes and scholarships.
- Discover schemes based on user profiles.
- Match potential eligibility using available scheme records.
- Get natural-language guidance through the AI assistant.
- Extract possible age and income information from uploaded documents.
- Register and log in to save user accounts.
- Browse without requiring an account.

## Project Structure

```text
SchemeSaathiAI/
├── frontend/
├── backend/
├── docker-compose.yml
└── README.md
```

## Run Locally

### Prerequisites

- Java 21
- Maven
- Node.js 20+
- MongoDB Community Server or MongoDB Atlas

### Backend Setup

Open a terminal inside the `backend` folder:

```bash
mvn spring-boot:run
```

### Frontend Setup

Open another terminal inside the `frontend` folder:

```bash
npm install
npm run dev
```

Open the application:

http://localhost:5173

### Demo Login

The local profile creates a demo account on first startup:

- Email: `demo@schemesaathi.local`
- Password: `SchemeSaathiDemo!`

This account is intended for local testing only.

## MongoDB Atlas Configuration

1. Create a MongoDB Atlas cluster.
2. Create a database user with appropriate permissions.
3. Configure Network Access to allow your backend to connect.
4. Copy your Atlas connection URI.
5. Configure the URI in `backend/local-secrets.properties` or as an environment variable.

Example:

```properties
MONGODB_URI=mongodb+srv://<database-user>:<encoded-password>@<cluster-host>/schemesaathi
```

The application uses the `schemesaathi` database.

Never commit database credentials, API keys, or `.env` files to GitHub.

## Gemini API Configuration

To enable Gemini-generated assistant answers, configure:

```properties
GEMINI_API_KEY=your-api-key
```

Keep this key on the backend. Without it, the assistant provides localized general guidance rather than AI-generated answers.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/categories` | List discovery categories |
| GET | `/api/schemes` | Browse available schemes |
| POST | `/api/schemes/match` | Match a user profile |
| POST | `/api/assistant` | Get assistant guidance |
| POST | `/api/documents/parse` | Extract information from documents |
| POST | `/api/auth/register` | Register an account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current account |
| POST | `/api/auth/logout` | Logout |
| GET | `/actuator/health` | Application health |

## Testing

Backend tests:

```bash
mvn test
```

Frontend production build:

```bash
npm run build
```

## Important Notes

- Scheme records are starter examples and must be verified against official government sources.
- Eligibility matching is informational, not an official government determination.
- Application submission takes place through official government portals.
- Document parsing supports text-based PDFs and does not perform OCR on scanned images.
- Avoid sharing Aadhaar numbers, bank details, passwords, or OTPs.

## Future Improvements

- Expanded verified government scheme database.
- Multilingual AI assistance.
- Voice-based scheme discovery.
- Improved document extraction and OCR.
- More advanced eligibility matching.
- Additional state and central government scheme coverage.

## Disclaimer

SchemeSaathi AI is an independent discovery and information platform. It is not an official government website and does not represent any government department. Always verify scheme information through official portals before applying.
