# Fieldnote

Fieldnote is a full-stack editorial blog: a React front end backed by an Express + MongoDB API. It has a featured
article, category filtering, search, article pages, a newsletter signup stored in MongoDB, and a simple admin page for
managing articles.

## Authentication

Login/registration use server-side sessions in an HttpOnly cookie plus a CSRF token. Only administrators can use `/admin`
or the write endpoints (`POST/PUT/DELETE /api/articles`); public registration always creates ordinary `user` accounts.

1. In `backend/.env` set `ADMIN_EMAIL`, `ADMIN_PASSWORD` (8+ chars, upper/lower case, number) and optionally `ADMIN_NAME`.
2. Run `npm run create-admin` in `backend`, then delete `ADMIN_PASSWORD` from `.env`.
3. Log in at `/login`. Run backend tests with `npm test` in `backend`.

Set `NODE_ENV=production` (HTTPS) when deploying; see `backend/.env.example`.

## Features

- Homepage with a featured hero article (from the database), recent stories grid, category filters, search and pagination
- Article detail page (`/articles/:id`, accepts a Mongo ID or a slug), About page and a 404 page
- Newsletter signup with validation, duplicate handling and storage in MongoDB
- `/admin` page to create, edit, delete (with confirmation) and feature articles
- Loading, error and empty states; graceful image fallbacks; responsive layout with a mobile menu
- Centralised error handling, input validation, unique slugs, one featured article at a time
- Idempotent seed script with 7 sample articles

## Tech stack

- **Frontend:** React 19, Vite, Tailwind CSS v4 (`@tailwindcss/vite`), React Router, Lucide icons
- **Backend:** Node.js, Express 5, MongoDB, Mongoose, dotenv, CORS

## Folder structure

```
blog app/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── controllers/              # article + newsletter logic
│   ├── middleware/               # error handler, ObjectId validation
│   ├── models/                   # Article, Subscriber
│   ├── routes/                   # API routes
│   ├── utils/helpers.js          # slugs, read time, validation helpers
│   ├── uploads/                  # reserved (image URLs are used instead of uploads)
│   ├── app.js                    # Express app
│   ├── server.js                 # entry point
│   ├── seed.js                   # sample data
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/           # Navbar, Footer, HeroArticle, ArticleCard, ...
    │   ├── hooks/                # useAsync, useDebounce
    │   ├── lib/                  # api.js (all API calls), format.js
    │   └── pages/                # Homepage, About, ArticlePage, Admin, NotFound
    └── .env.example
```

## Prerequisites

- Node.js 20 or newer and npm
- A MongoDB database: either a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster or a local MongoDB install

## Setup

### 1. MongoDB

- **Atlas:** create a free cluster, add a database user, allow your IP under *Network Access*, and copy the
  connection string (`mongodb+srv://...`).
- **Local:** install MongoDB Community Server and use `mongodb://127.0.0.1:27017/fieldnote`.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env      # on Windows PowerShell: Copy-Item .env.example .env
```

Edit `backend/.env`:

| Variable        | Description                                          | Default                  |
| --------------- | ---------------------------------------------------- | ------------------------ |
| `MONGO_URI`     | MongoDB connection string (required)                 | —                        |
| `DB_NAME`       | Database name used for all collections               | `fieldnote`              |
| `PORT`          | API port                                             | `5000`                   |
| `CLIENT_ORIGIN` | Allowed frontend origin(s), comma separated (CORS)   | `http://localhost:5173`  |

Never commit `.env`; it contains your database credentials.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env      # optional; only needed if the API is not at http://localhost:5000/api
```

| Variable       | Description                         | Default                     |
| -------------- | ----------------------------------- | --------------------------- |
| `VITE_API_URL` | Base URL of the API (ends in `/api`) | `http://localhost:5000/api` |

## Running

In two terminals:

```bash
# Terminal 1 — API on http://localhost:5000
cd backend
npm run dev          # or: npm start

# Terminal 2 — website on http://localhost:5173
cd frontend
npm run dev
```

Production build of the frontend: `cd frontend && npm run build` (output in `frontend/dist`).

## Seeding sample articles

```bash
cd backend
npm run seed
```

Adds 7 articles across Culture, Places, Ideas, Lifestyle and Stories. Articles are matched by slug, so running it
again does not create duplicates and never overwrites articles you have edited.

## Using the admin page

Open `http://localhost:5173/admin` (also linked as "Manage articles" in the footer).

- **New article:** fill in title, excerpt, content, category, author and an image URL, then *Publish article*.
  Separate paragraphs in the content with a blank line. Reading time is calculated automatically.
- **Edit:** click *Edit*, change fields, *Save changes*.
- **Feature:** click *Feature* on a row. Only one article is featured at a time; it becomes the homepage hero.
- **Delete:** click *Delete* and confirm in the dialog.

## API reference

Base URL: `http://localhost:5000/api`. Errors are JSON: `{ "message": "...", "details": [...] }`.

| Method | Endpoint                     | Description                                                                 |
| ------ | ---------------------------- | --------------------------------------------------------------------------- |
| GET    | `/health`                    | API and database status                                                     |
| GET    | `/articles`                  | List articles (newest first, without `content`). Query: `category`, `search`, `page`, `limit` (max 50) |
| GET    | `/articles/featured`         | Featured article (falls back to the newest article; 404 if none)           |
| GET    | `/articles/:id`              | One article by Mongo ID or slug (404 if missing)                            |
| POST   | `/articles`                  | Create. Body: `title, excerpt, content, category, author, image, featured?` |
| PUT    | `/articles/:id`              | Update any of the above fields (400 for invalid ID, 404 if missing)        |
| DELETE | `/articles/:id`              | Delete an article                                                           |
| POST   | `/newsletter/subscribe`      | Body: `{ "email": "..." }`. 201 on new, 200 if already subscribed, 400 if invalid |

Categories: `Culture`, `Places`, `Ideas`, `Lifestyle`, `Stories`. The image must be an `http(s)` URL.

Example:

```bash
curl "http://localhost:5000/api/articles?category=Places&search=lisbon"
```

## Known limitations

- No password reset or email verification
- Images are external URLs only (no file uploads)
- Article content is plain text with paragraph breaks (no Markdown or rich text)
- Subscribers are stored but no emails are actually sent
- No automated test suite; the app was verified manually and with a scripted browser run

## Troubleshooting

- **"Cannot reach the server" in the browser:** the backend is not running, or `VITE_API_URL` points to the wrong place.
- **CORS errors:** make sure `CLIENT_ORIGIN` in `backend/.env` matches the URL in your browser exactly, then restart the API.
- **Backend exits with "Could not connect to MongoDB":** check `MONGO_URI`; for Atlas, confirm your current IP is in
  *Network Access* and the username/password are correct (special characters in passwords must be URL-encoded).
- **Port already in use:** change `PORT` in `backend/.env` (and `VITE_API_URL` in the frontend to match).
- **Empty homepage:** run `npm run seed` in `backend`.

## Security limitations and future improvements

- Add password reset and email verification
- Add rate limiting (especially on the newsletter endpoint), request logging and security headers (`helmet`)
- Sanitise or render rich content safely if Markdown/HTML support is added
- Send confirmation emails (double opt-in) and add an unsubscribe flow
- Add automated tests (API integration tests, component tests) and CI
- Support real image uploads to object storage
