# 🚀 Satvic Reddy C — Personal Portfolio Website

A modern, full-stack personal portfolio website built with **React + Vite** (frontend) and **Express + MongoDB** (backend). It features a dynamic admin dashboard to manage all portfolio content, a fully functional contact form with real email delivery, and a visually rich interactive UI.

---

## 📋 Table of Contents

- [Live Preview](#live-preview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Frontend Components](#frontend-components)
- [Admin Panel](#admin-panel)
- [File Uploads](#file-uploads)
- [Deployment](#deployment)
- [Scripts Reference](#scripts-reference)
- [Troubleshooting](#troubleshooting)

---

## 🌐 Live Preview

> The frontend is deployable via **Vercel** and the backend via any Node.js-compatible host (e.g., Railway, Render, or a VPS).

---

## ✨ Features

### Public Portfolio
- 🎨 **Animated Hero Section** — Dynamic introduction with animated text and call-to-action buttons
- 👤 **About Me** — Personal bio and background information pulled from the database
- 🛠️ **Skills** — Categorized skill cards fetched from the backend
- 📁 **Projects** — Project cards with live links, GitHub links, tech stack tags, and thumbnails
- 📄 **Resume Sections** — All-in-one resume view: Certifications, Achievements, Experiences, Trainings, and Social Posts
- 📬 **Contact Form** — Sends real emails to the owner via Gmail SMTP (Nodemailer)
- ✨ **Particle Background** — Interactive animated particle canvas
- 🖱️ **Custom Cursor** — Smooth, stylized cursor that tracks mouse movement
- 📱 **Fully Responsive** — Mobile-first design for all screen sizes

### Admin Panel (`/admin`)
- 🔐 **JWT Authentication** — Secure admin login with token-based sessions (10h expiry)
- 📊 **Admin Dashboard** — Full CRUD for all portfolio sections:
  - Hero Content
  - About Me
  - Skills
  - Projects
  - Certifications (with image support)
  - Achievements
  - Experiences
  - Trainings
  - Social Posts (with likes & comments)
- 🖼️ **Image Upload** — Upload images for projects, certifications, hero, etc. (JPG, PNG, WebP, GIF — max 5MB)

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| [React 19](https://react.dev/) | UI framework |
| [Vite 8](https://vite.dev/) | Build tool & dev server |
| [React Router DOM v7](https://reactrouter.com/) | Client-side routing |
| [Framer Motion](https://www.framer.com/motion/) | Animations & transitions |
| [Axios](https://axios-http.com/) | HTTP client for API calls |
| [Lucide React](https://lucide.dev/) | Icon library |
| [React Parallax Tilt](https://www.npmjs.com/package/react-parallax-tilt) | Tilt card effect |
| [Firebase](https://firebase.google.com/) | (Integrated, available for auth/storage extension) |
| Vanilla CSS | Styling (no Tailwind) |

### Backend
| Technology | Purpose |
|---|---|
| [Node.js](https://nodejs.org/) | Runtime |
| [Express 5](https://expressjs.com/) | Web framework |
| [MongoDB](https://www.mongodb.com/) | Database |
| [Mongoose 9](https://mongoosejs.com/) | MongoDB ODM |
| [JSON Web Token](https://jwt.io/) | Admin authentication |
| [Multer](https://github.com/expressjs/multer) | File/image uploads |
| [Nodemailer](https://nodemailer.com/) | Email sending (Gmail SMTP) |
| [dotenv](https://github.com/motdotla/dotenv) | Environment variable management |
| [CORS](https://github.com/expressjs/cors) | Cross-Origin Resource Sharing |

---

## 📁 Project Structure

```
portfolyo/
├── backend/                        # Express API server
│   ├── middleware/
│   │   └── auth.js                 # JWT authentication middleware
│   ├── models/                     # Mongoose data models
│   │   ├── About.js
│   │   ├── Achievement.js
│   │   ├── Certification.js
│   │   ├── Experience.js
│   │   ├── Hero.js
│   │   ├── Profile.js
│   │   ├── Project.js
│   │   ├── Skill.js
│   │   ├── SocialPost.js
│   │   └── Training.js
│   ├── routes/
│   │   ├── admin.js                # Protected CRUD routes (JWT required)
│   │   ├── auth.js                 # Admin login → JWT token
│   │   ├── public.js               # Public GET routes + contact form
│   │   └── upload.js               # Image upload (JWT protected)
│   ├── uploads/                    # Stored uploaded images (served statically)
│   ├── .env                        # Environment secrets (not committed)
│   ├── .gitignore
│   ├── server.js                   # Express app entry point
│   ├── seed-projects.js            # Script to seed sample project data
│   └── package.json
│
├── frontend/                       # React + Vite app
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── assets/                 # Static assets (images, icons)
│   │   ├── components/
│   │   │   ├── Admin/
│   │   │   │   ├── AdminDashboard.jsx   # Full CRUD admin panel
│   │   │   │   ├── AdminDashboard.css
│   │   │   │   ├── AdminLogin.jsx       # Admin login page
│   │   │   │   └── AdminLogin.css
│   │   │   ├── AboutMe.jsx / .css
│   │   │   ├── Contact.jsx / .css       # Contact form with email
│   │   │   ├── CustomCursor.jsx / .css  # Custom animated cursor
│   │   │   ├── Hero.jsx / .css          # Landing / hero section
│   │   │   ├── Navbar.jsx / .css        # Responsive navigation
│   │   │   ├── ParticleBackground.jsx   # Canvas particle animation
│   │   │   ├── Projects.jsx / .css      # Project cards grid
│   │   │   ├── ResumeSections.jsx / .css # Resume: certs, skills, exp, etc.
│   │   │   └── Skills.jsx / .css
│   │   ├── App.jsx                 # Root component with routes
│   │   ├── App.css
│   │   ├── api.js                  # Axios base URL config
│   │   ├── index.css               # Global styles
│   │   └── main.jsx                # React DOM entry point
│   ├── index.html
│   ├── vite.config.js
│   ├── vercel.json                 # Vercel deployment config
│   └── package.json
│
└── package.json                    # Root package.json
```

---

## ✅ Prerequisites

Make sure you have the following installed:

- **Node.js** v18 or higher — [Download](https://nodejs.org/)
- **npm** v9 or higher (comes with Node.js)
- **MongoDB** — Either:
  - [MongoDB Atlas](https://www.mongodb.com/atlas) (cloud, recommended for production)
  - [MongoDB Community](https://www.mongodb.com/try/download/community) (local)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/portfolyo.git
cd portfolyo
```

### 2. Set Up the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` folder (see [Environment Variables](#environment-variables) section below).

Start the backend server:

```bash
node server.js
```

The backend will run on **http://localhost:5000** by default.

### 3. Set Up the Frontend

Open a **new terminal** and run:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on **http://localhost:5173** by default.

### 4. (Optional) Seed Sample Data

To populate your database with sample projects:

```bash
cd backend
node seed-projects.js
```

---

## 🔐 Environment Variables

Create a `.env` file inside the `backend/` directory with the following keys:

```env
# ─── MongoDB ──────────────────────────────────────────────
# Use MongoDB Atlas connection string OR local MongoDB URI
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/portfolio

# ─── Server ───────────────────────────────────────────────
PORT=5000

# ─── Admin Credentials ────────────────────────────────────
# These are the credentials used to log in at /admin
ADMIN_EMAIL=your-admin-email@example.com
ADMIN_PASSWORD=your-secure-password

# ─── JWT ──────────────────────────────────────────────────
# Any long, random secret string
JWT_SECRET=your_very_long_random_jwt_secret_key_here

# ─── Email (Nodemailer via Gmail SMTP) ────────────────────
# Gmail address to send from (enable 2FA and use App Password)
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password
```

> **⚠️ Important:** Never commit your `.env` file to Git. It is already listed in `.gitignore`.

### How to get a Gmail App Password

1. Go to your Google Account → **Security**
2. Enable **2-Step Verification**
3. Go to **App Passwords** → select "Mail" and your device
4. Copy the generated 16-character password into `EMAIL_PASS`

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Admin login → returns JWT token | None |

**Login body:**
```json
{
  "email": "admin@example.com",
  "password": "yourpassword"
}
```
**Response:**
```json
{
  "token": "eyJhbGciOi...",
  "msg": "Login successful"
}
```

---

### Public Routes (No Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/projects` | Get all projects |
| GET | `/api/public/skills` | Get all skills |
| GET | `/api/public/achievements` | Get all achievements |
| GET | `/api/public/certifications` | Get all certifications |
| GET | `/api/public/experiences` | Get all experiences |
| GET | `/api/public/trainings` | Get all trainings |
| GET | `/api/public/socialposts` | Get all social posts |
| GET | `/api/public/heros` | Get hero content |
| GET | `/api/public/abouts` | Get about content |
| POST | `/api/public/contact` | Submit contact form (sends email) |
| POST | `/api/public/socialposts/:id/like` | Like a social post |
| POST | `/api/public/socialposts/:id/comment` | Comment on a social post |

**Contact form body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello, I'd like to connect!"
}
```

---

### Admin Routes (JWT Required)

All admin routes require the header:
```
Authorization: Bearer <your_jwt_token>
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/:model` | Get all of a given model |
| POST | `/api/admin/:model` | Create a new record |
| PUT | `/api/admin/:model/:id` | Update a record by ID |
| DELETE | `/api/admin/:model/:id` | Delete a record by ID |

Valid `:model` values: `projects`, `skills`, `achievements`, `certifications`, `experiences`, `trainings`, `socialposts`, `heros`, `abouts`

---

### File Upload (JWT Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload an image file |

**Request:** `multipart/form-data` with field name `image`  
**Accepted types:** JPG, PNG, WebP, GIF  
**Max size:** 5MB  
**Response:**
```json
{
  "imageUrl": "/uploads/1718000000000-123456789.png"
}
```

Uploaded files are served statically at: `http://localhost:5000/uploads/<filename>`

---

## 🗃️ Data Models

### Project
```js
{
  title: String,
  description: String,
  techStack: [String],
  liveLink: String,
  githubLink: String,
  image: String,          // URL to uploaded image
  createdAt: Date
}
```

### Skill
```js
{
  name: String,
  category: String,       // e.g., "Frontend", "Backend", "Tools"
  level: Number,          // 0–100 proficiency
  createdAt: Date
}
```

### Achievement
```js
{
  title: String,
  description: String,
  date: String,
  createdAt: Date
}
```

### Certification
```js
{
  title: String,
  issuer: String,
  date: String,
  image: String,          // Certificate image URL
  link: String,
  createdAt: Date
}
```

### Experience
```js
{
  role: String,
  company: String,
  duration: String,
  description: String,
  createdAt: Date
}
```

### Training
```js
{
  title: String,
  provider: String,
  duration: String,
  description: String,
  createdAt: Date
}
```

### SocialPost
```js
{
  platform: String,       // e.g., "LinkedIn", "Twitter"
  content: String,
  link: String,
  image: String,
  likes: Number,
  comments: [{ text: String, createdAt: Date }],
  createdAt: Date
}
```

### Hero
```js
{
  name: String,
  tagline: String,
  subtitle: String,
  profileImage: String,
  resumeLink: String,
  createdAt: Date
}
```

### About
```js
{
  bio: String,
  location: String,
  email: String,
  linkedin: String,
  github: String,
  profileImage: String,
  createdAt: Date
}
```

---

## 🧩 Frontend Components

| Component | Description |
|-----------|-------------|
| `Navbar` | Responsive top navigation with smooth scroll links |
| `Hero` | Animated landing section with name, tagline, and CTA |
| `AboutMe` | Bio section pulled from backend |
| `Skills` | Skills cards/grid categorized by technology type |
| `Projects` | Grid of project cards with filters and images |
| `ResumeSections` | Tabbed or scrollable view of certifications, achievements, experiences, trainings, and social posts |
| `Contact` | Form with client-side validation; submits to backend for real email delivery |
| `ParticleBackground` | Canvas-based animated particle effect (background) |
| `CustomCursor` | Custom-styled mouse cursor with smooth tracking |

---

## 🔐 Admin Panel

### Access
Navigate to: `http://localhost:5173/admin`

Login with the credentials defined in your `.env`:
- **Email:** `ADMIN_EMAIL`
- **Password:** `ADMIN_PASSWORD`

A JWT token is issued on successful login (expires in **10 hours**) and stored in `localStorage`.

### Dashboard (`/admin/dashboard`)
The dashboard allows full **Create, Read, Update, Delete** for all portfolio sections:

- **Hero** — Edit name, tagline, profile image
- **About** — Edit bio, social links
- **Skills** — Add/edit/delete skill cards
- **Projects** — Full project management with image upload
- **Certifications** — Add with certificate image support
- **Achievements** — Track milestones and awards
- **Experience** — Work history
- **Trainings** — Courses and training programs
- **Social Posts** — Manage LinkedIn/social content with like/comment stats

---

## 🖼️ File Uploads

Images (profile photos, project thumbnails, certificates) are handled by the `/api/upload` endpoint:

1. **Admin uploads an image** via the dashboard (multipart form)
2. **Multer** processes and saves the file to `backend/uploads/`
3. **A unique filename** is generated using timestamp + random number
4. The **URL** is returned and stored in the corresponding model's `image` field
5. Images are **served statically** at `/uploads/<filename>`

**Constraints:**
- Allowed types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- Max file size: **5MB**

---

## 🌍 Deployment

### Frontend — Vercel

The `frontend/vercel.json` is already configured for client-side routing:

1. Push the `frontend/` folder to GitHub
2. Import the project on [vercel.com](https://vercel.com)
3. Set the **Root Directory** to `frontend`
4. Deploy — Vercel auto-detects Vite

> **Note:** Update `frontend/src/api.js` to point to your production backend URL.

### Backend — Railway / Render / VPS

1. Push the `backend/` folder to GitHub
2. Create a new service on [Railway](https://railway.app) or [Render](https://render.com)
3. Set the **Start Command** to: `node server.js`
4. Add all environment variables from `.env` to the platform's environment settings
5. Use a **MongoDB Atlas** connection string for `MONGO_URI`

---

## 📜 Scripts Reference

### Backend (`cd backend`)

| Command | Description |
|---------|-------------|
| `node server.js` | Start the Express server |
| `node seed-projects.js` | Seed the database with sample project data |
| `node testUpdate.js` | Run update test script |

### Frontend (`cd frontend`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server (hot reload) |
| `npm run build` | Build the production bundle to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint checks |

---

## 🐛 Troubleshooting

### MongoDB won't connect
- Check that `MONGO_URI` in `.env` is correct
- For Atlas: whitelist your IP address in the Atlas Network Access settings
- For local: ensure MongoDB service is running (`mongod`)

### Emails not sending
- Verify `EMAIL_USER` and `EMAIL_PASS` are set correctly
- Ensure you are using a **Gmail App Password** (not your normal Gmail password)
- Make sure 2-Step Verification is enabled on the Google account

### CORS errors in browser
- The backend uses `cors()` middleware which allows all origins by default
- For production, update the CORS config in `server.js` to allow only your frontend domain:
  ```js
  app.use(cors({ origin: 'https://your-portfolio.vercel.app' }));
  ```

### Frontend can't reach backend
- Make sure the backend is running on port `5000`
- Check `frontend/src/api.js` — confirm the base URL points to the correct backend address
- In production, update it to your deployed backend URL

### JWT token expired / not working
- Tokens expire after **10 hours** — log out and log back in to the admin panel
- Verify `JWT_SECRET` is set in `.env`

### Image upload fails
- Confirm the `backend/uploads/` directory exists (create it manually if missing)
- Check file type (must be JPG, PNG, WebP, or GIF)
- File must be under **5MB**

---

## 👤 Author

**Satvic Reddy C**  
📧 satvicreddyc@gmail.com

---

## 📄 License

This project is personal and not licensed for redistribution. Feel free to fork and adapt for your own portfolio with attribution.
