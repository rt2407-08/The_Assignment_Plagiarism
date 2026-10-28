# VeriText 🔍
### Analyze submissions. Detect similarities. Ensure academic integrity.

VeriText is a full-stack academic integrity and source code / text similarity review web application designed to help instructors review student submissions and detect plagiarism across assignments. Instead of relying on brittle manual checks or basic keyword matching, VeriText processes text answers and uploaded code files through a server-side **N-gram tokenizer and Jaccard similarity coefficient engine**.

The platform includes instructor and student authentication, a protected assignment dashboard, code generation, submission processing supporting direct input and file attachments (`.java`, `.py`, `.cpp`, `.txt`), cross-submission pairwise matrix computation, persistent similarity reports, and an interactive review dashboard with a real-time similarity threshold slider. Application data is persisted in MongoDB Atlas and managed through a modular Express REST API.

* **Live Web Application:** [rt2407-08.github.io/The_Assignment_Plagiarism](https://rt2407-08.github.io/The_Assignment_Plagiarism/)
* **Backend service:** [veritext-backend-oe56.onrender.com](https://veritext-backend-oe56.onrender.com/)
* **API Endpoints base:** [veritext-backend-oe56.onrender.com/api](https://veritext-backend-oe56.onrender.com/api)
* **GitHub repository:** [rt2407-08/The_Assignment_Plagiarism](https://github.com/rt2407-08/The_Assignment_Plagiarism)

---

## Table of contents
* [Project overview](#-project-overview)
* [Features](#-features)
* [How VeriText works](#-how-veritext-works)
* [Technology stack](#-technology-stack)
* [Architecture](#-architecture)
* [Project structure](#-project-structure)
* [Run the project locally](#-run-the-project-locally)
* [Environment variables](#-environment-variables)
* [API reference](#-api-reference)
* [Similarity engine](#-similarity-engine)
* [Database collections](#-database-collections)
* [Testing with Postman](#-testing-with-postman)
* [Deployment](#-deployment)
* [Troubleshooting](#-troubleshooting)
* [Security and data notes](#-security-and-data-notes)
* [Project summary](#-project-summary)

---

## 🌟 Project overview

Evaluating academic submissions manually becomes impractical as class sizes scale. VeriText solves this challenge through an automated, server-driven workflow:

1. **Assignment creation:** The instructor creates an assignment with custom text and code questions, word/character constraints, target programming languages, and a baseline similarity threshold.
2. **Student submissions:** Students authenticate using their university roll numbers and submit typed answers or upload program source code files.
3. **Server-side pipeline:** Submissions are parsed in-memory using Multer buffer extraction and stored securely in MongoDB Atlas.
4. **Algorithmic analysis:** The backend tokenizes all submissions into character and word $n$-grams, computes pairwise Jaccard similarity coefficients, and flags high-risk pairs.
5. **Interactive reporting:** Instructors review detailed comparisons on a dedicated report page equipped with a live threshold slider, 4 summary stat cards, and side-by-side monospace answer comparisons.

The frontend is built with HTML5, CSS3, modern JavaScript, and React (Vite). The backend uses Node.js, Express, and Mongoose, with MongoDB Atlas providing persistent cloud data storage.

---

## ✨ Features

### Account and session management
* **Role-based authentication:** Separate registration and login portals for instructors and students.
* **Roll number & email support:** Students can log in using either their official roll number or university email address.
* **Password security:** Passwords are encrypted with `bcryptjs` using 10 salt rounds prior to database persistence.
* **Stateless JWT tokens:** Cryptographically signed JSON Web Tokens (`HS256`) carrying user identity and role scopes (`instructor`, `student`).
* **Route protection:** Middleware guards ensure student endpoints and instructor administrative controls are strictly compartmentalized.

### Assignment management
* **Multi-question assignments:** Supports mixed assignments containing both descriptive text questions and programming tasks.
* **Programming language support:** Question-level language selection for Python, Java, C, C++, and JavaScript.
* **Automatic code generation:** Generates unique, human-readable assignment codes (e.g., `VT-6D8RZ6`) for student access.
* **Submission constraints:** Configurable minimum/maximum word counts and assignment-level baseline similarity thresholds.
* **Dashboard metrics:** Tracks active assignments, submission counts, and overall course integrity statistics.

### Student submission portal
* **Assignment code lookup:** Students fetch real-time assignment details and questions directly from the cloud backend.
* **Multi-question response:** Input fields dynamically render according to question types (text area or syntax-highlighted code editor).
* **Multer file attachment pipeline:** Accepts source code file uploads (`.java`, `.py`, `.cpp`, `.txt`) with in-memory buffer extraction.
* **Submission receipt:** Immediate confirmation with unique submission IDs and server timestamps.

### Similarity reports & analytics
* **Overall submission-pair similarity:** Computes pairwise similarity scores across all student submissions for an assignment.
* **Highest similarity alert card:** Instantly highlights the pair with the highest match percentage.
* **Interactive similarity threshold slider:** Real-time slider (0% to 100%) dynamically re-filters displayed pairs without page reloads.
* **Status indicators:** Automatic classification into `HIGH` (flagged), `REVIEW` (moderate), and `LOW` (safe) risk bands.
* **Question-by-question breakdown:** Detailed question-level similarity percentages comparing specific answers.
* **Side-by-side comparison toggle:** Monospace preformatted code diff blocks allowing instructors to inspect matching tokens side by side.

---

## 🔄 How VeriText works

A typical user workflow:

1. **Instructor registers or logs in:** The backend verifies credentials, signs a role-aware JWT token, and returns the instructor profile.
2. **Create an assignment:** The instructor specifies title, questions (text or code), target programming language, and similarity threshold. The server assigns an assignment code (e.g. `VT-6D8RZ6`).
3. **Students join and submit:** Students log in with their roll number, enter the assignment code, and submit their solutions (typed or uploaded files).
4. **Backend ingestion:** Express and Multer process incoming requests, extract file buffers, and persist submission records into MongoDB Atlas.
5. **Generate similarity report:** When the instructor accesses the report page, the backend retrieves all assignment submissions, runs the N-gram tokenization and Jaccard scoring engine, and builds a cross-submission pair matrix.
6. **Review & adjust:** The instructor reviews flagged submissions, adjusts the similarity threshold slider to filter pairs, and expands side-by-side answer comparisons.

---

## 🧰 Technology stack

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, JavaScript (ES6+), React, Vite | Multi-page portals, dashboards, threshold slider, dynamic report views |
| **API Server** | Node.js, Express.js | HTTP server, RESTful API routing, request validation |
| **Architecture** | MVC Pattern | Strict separation of Models, Views, Controllers, Routes, and Middleware |
| **Database** | MongoDB Atlas, Mongoose ODM | Cloud storage for users, assignments, submissions, and reports |
| **Similarity Engine** | Custom Server-Side N-Gram Tokenizer | Character and word n-gram generation and Jaccard similarity computation |
| **File Uploads** | Multer | Memory-storage buffer parsing for code/text attachments (`.java`, `.py`, etc.) |
| **Authentication** | JSON Web Tokens (JWT), Bcrypt.js | Stateless role-based authorization and salted password hashing |
| **API Testing** | Postman / Thunder Client | Automated endpoint verification, response validation, and test suites |
| **Hosting** | Render.com | Cloud web service hosting with automatic branch deployments |

---

## 🏗️ Architecture

VeriText follows a strict **Model-View-Controller (MVC)** architectural pattern to ensure clean separation of concerns, scalability, and code maintainability:

```text
 ┌────────────────┐
 │    Frontend    │ <────── HTTP Requests / JSON Responses ──────> Express Server
 │ (React / Views)│
 └───────┬────────┘
         │
         ▼
 ┌────────────────┐
 │     Routes     │ ──────> URL Dispatching (/api/assignments, /api/submissions, etc.)
 └───────┬────────┘
         │
         ▼
 ┌────────────────┐
 │   Middleware   │ ──────> JWT Authentication Guard & Multer Memory Storage Pipeline
 └───────┬────────┘
         │
         ▼
 ┌────────────────┐         ┌─────────────────────────┐
 │  Controllers   │ <─────> │   Algorithmic Engines   │ (ngramSimilarity.js)
 └───────┬────────┘         └─────────────────────────┘
         │
         ▼
 ┌────────────────┐
 │     Models     │ <─────> MongoDB Atlas (Mongoose ODM)
 └────────────────┘
```

### MVC Responsibilities:
* **Model:** Defines Mongoose database schemas, validation rules, and indexes (`Assignment`, `Submission`, `Student`, `Instructor`, `SimilarityReport`).
* **View:** The user interface presentation layer located in `frontend/`, providing interactive dashboards, real-time threshold filtering, and comparison tables.
* **Controller:** Contains core business logic, input sanitization, database queries, and response formatting (`backend/controllers/`).
* **Route:** Maps HTTP methods and URL paths to specific controller handlers (`backend/routes/`).
* **Middleware:** Performs cross-cutting tasks such as role-based JWT validation (`authMiddleware.js`) and in-memory file uploads (`uploadMiddleware.js`).
* **Utils / Engines:** Standalone algorithmic logic (`ngramSimilarity.js`) handles tokenization, normalization, and Jaccard mathematics independently of HTTP controllers.

---

## 🗂️ Project structure

```text
The_Assignment_Plagiarism/
├── backend/                                # Node.js / Express MVC Server
│   ├── config/                             # Server & database configuration
│   ├── controllers/                        # Business logic & request orchestration
│   │   ├── assignmentController.js         # Assignment CRUD & code generation
│   │   ├── instructorController.js         # Instructor signup & JWT login
│   │   ├── studentController.js            # Student signup & roll-number login
│   │   ├── submissionController.js         # Text & Multer file submissions
│   │   └── similarityReportController.js   # Pairwise n-gram report calculation
│   ├── middleware/                         # Request interceptors
│   │   ├── authMiddleware.js               # JWT role validation (instructor/student)
│   │   └── uploadMiddleware.js             # Multer in-memory storage for file uploads
│   ├── models/                             # Mongoose database schemas
│   │   ├── Assignment.js                   # Questions, constraints, thresholds
│   │   ├── Instructor.js                   # Instructor profiles with bcrypt passwords
│   │   ├── Student.js                      # Student profiles (roll number / email)
│   │   ├── Submission.js                   # Student answers, file buffers, timestamps
│   │   └── SimilarityReport.js             # Pairwise similarity matrix & flags
│   ├── routes/                             # Modular REST API endpoints
│   │   ├── assignmentRoutes.js             # Routes for /api/assignments
│   │   ├── instructorRoutes.js             # Routes for /api/instructors
│   │   ├── studentRoutes.js                # Routes for /api/students
│   │   ├── submissionRoutes.js             # Routes for /api/submissions
│   │   └── similarityReportRoutes.js       # Routes for /api/similarity-reports
│   ├── utils/                              # Mathematical & algorithmic engines
│   │   └── ngramSimilarity.js              # Server-side N-gram & Jaccard algorithm
│   ├── .env.example                        # Safe template for environment variables
│   ├── package.json                        # Backend dependencies & scripts
│   └── server.js                           # Express application entry point (0.0.0.0)
│
├── frontend/                               # React & Modern Web Frontend
│   ├── css/                                # Global styles & responsive layouts
│   ├── dist/                               # Production Vite bundle
│   ├── js/                                 # API communication & UI rendering
│   │   ├── instructor.js                   # Instructor dashboard & assignment forms
│   │   ├── report.js                       # Similarity report UI, slider & comparison toggle
│   │   ├── student.js                      # Student assignment viewer & submission form
│   │   └── student-auth.js                 # Student login & session handling
│   ├── public/                             # Static SVGs, icons, and assets
│   ├── src/                                # React application source (Vite)
│   │   ├── services/api.js                 # Cloud API integration layer
│   │   ├── App.jsx                         # React dashboard root component
│   │   └── main.jsx                        # React DOM mounting
│   ├── index.html                          # Landing page
│   ├── instructor.html                     # Instructor management dashboard
│   ├── report.html                         # Detailed plagiarism report & comparison page
│   ├── student.html                        # Student submission portal
│   ├── login.html / signup.html            # Instructor authentication pages
│   ├── student-login.html / signup.html    # Student authentication pages
│   ├── package.json                        # Frontend dependencies (React, Vite)
│   └── vite.config.js                      # Multi-page build configuration
│
├── .gitignore                              # Protects secrets (.env) & build artifacts
├── package.json                            # Root workspace scripts (runner)
└── README.md                               # Project documentation
```

---

## 🚀 Run the project locally

### Prerequisites
* **Node.js** (v18.x or later installed)
* **npm** (v9.x or later installed)
* **MongoDB Atlas** database connection string (or local MongoDB on port 27017)
* **Git** installed on your system

### 1. Clone the repository
```bash
git clone https://github.com/rt2407-08/The_Assignment_Plagiarism.git
cd The_Assignment_Plagiarism
```

### 2. Install backend dependencies
```bash
cd backend
npm install
```

### 3. Create the environment file
Create a file named `.env` inside the `backend/` directory:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.g6nere2.mongodb.net/VeriText?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_2026
```
*(Replace placeholders with your real MongoDB Atlas credentials. Never commit `.env` to GitHub).*

### 4. Start the backend server
For development with automatic reload:
```bash
npm run dev
```
Or run standard production start:
```bash
npm start
```
The backend binds to `0.0.0.0` and listens on port `5000` by default:
* Local server: `http://localhost:5000`
* Local API base: `http://localhost:5000/api`

### 5. Start the frontend
Open a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser. All API requests from the frontend communicate with the backend.

### 6. Confirm local connectivity
Verify that the server and database are functioning by sending a GET request:
```bash
curl http://localhost:5000/api
```
Response:
```json
{
  "success": true,
  "message": "VeriText backend API is live and operational!",
  "database": "connected"
}
```

---

## 🔐 Environment variables

| Variable | Required | Purpose |
| :--- | :---: | :--- |
| `MONGODB_URI` | **Yes** | MongoDB Atlas cloud connection string |
| `JWT_SECRET` | **Yes** | Secret cryptographic key used to sign and verify JSON Web Tokens |
| `PORT` | Local default | Server port; defaults to `5000` when not provided |

### Production Environment Notes
Configure `MONGODB_URI`, `JWT_SECRET`, and `PORT` in the Render Web Service Environment settings. Render dynamically provides `PORT` (or defaults to `5000`). Never paste secrets into public commits, screenshots, or README examples.

---

## 🔌 API reference

All API responses are formatted in JSON. Authentication endpoints issue signed JWT tokens. Protected instructor and student endpoints require the standard `Authorization: Bearer <token>` header.

* **Production API Base:** `https://veritext-backend-oe56.onrender.com/api`
* **Local API Base:** `http://localhost:5000/api`

### Health & Discovery
| Method | Endpoint | Description | Access |
| :---: | :--- | :--- | :---: |
| `GET` | `/` | Root health check & database state | Public |
| `GET` | `/api` | Operational endpoints directory & database connection | Public |
| `GET` | `/api/health` | Service uptime and MongoDB connectivity | Public |

### Authentication
| Method | Endpoint | Description | Access |
| :---: | :--- | :--- | :---: |
| `POST` | `/api/instructors/signup` | Register new instructor account | Public |
| `POST` | `/api/instructors/login` | Authenticate instructor & return JWT token | Public |
| `POST` | `/api/students/signup` | Register student (requires unique student ID & email) | Public |
| `POST` | `/api/students/login` | Authenticate student via roll number or email | Public |

Example Instructor Login Request:
```json
POST /api/instructors/login
Content-Type: application/json

{
  "email": "proftest@university.edu",
  "password": "Password123!"
}
```

Example Instructor Login Response:
```json
{
  "success": true,
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "instructor": {
    "id": "6ade311284d7da25b8f5832c",
    "name": "Prof Test",
    "email": "proftest@university.edu",
    "role": "instructor"
  }
}
```

### Assignments
| Method | Endpoint | Description | Access |
| :---: | :--- | :--- | :---: |
| `GET` | `/api/assignments` | List assignments (supports `?instructorId=` query) | Public |
| `POST` | `/api/assignments` | Create assignment with questions and threshold | Instructor |
| `GET` | `/api/assignments/:id` | Fetch assignment by MongoDB Object ID | Public |
| `GET` | `/api/assignments/code/:code` | Fetch assignment by alphanumeric code (e.g. `VT-6D8RZ6`) | Public |
| `DELETE` | `/api/assignments/:id` | Delete assignment record | Instructor |

### Submissions
| Method | Endpoint | Description | Access |
| :---: | :--- | :--- | :---: |
| `GET` | `/api/submissions` | Retrieve submissions (supports `?assignmentId=`) | Public |
| `POST` | `/api/submissions` | Submit answers (JSON body or multipart file upload) | Student |
| `GET` | `/api/submissions/:id` | Retrieve single submission details | Public |

Example JSON Submission Request:
```json
POST /api/submissions
Content-Type: application/json

{
  "assignmentId": "6ade15f0c083d01645fb3d17",
  "studentName": "Rohan Verma",
  "studentId": "2410993161",
  "content": "Question 1 (Java):\nQuestion: write a code\nAnswer:\npublic class Solution { ... }"
}
```

### Similarity Reports
| Method | Endpoint | Description | Access |
| :---: | :--- | :--- | :---: |
| `GET` | `/api/assignments/:id/similarity-report` | Compute/retrieve server-side N-gram similarity report | Instructor |
| `GET` | `/api/similarity-reports` | List all persisted similarity reports | Instructor |

Example Similarity Report Response:
```json
{
  "success": true,
  "report": {
    "assignmentCode": "VT-6D8RZ6",
    "assignmentTitle": "Mid sem",
    "totalSubmissions": 5,
    "totalComparisons": 10,
    "flaggedCount": 6,
    "averageSimilarity": 60,
    "highestSimilarity": 100,
    "flaggedPairs": [
      {
        "studentA": "Rohan Verma",
        "studentIdA": "2410993161",
        "studentB": "Aarti Thakur",
        "studentIdB": "2410993160",
        "similarity": 100,
        "status": "HIGH",
        "questionDetails": [
          {
            "questionIndex": 1,
            "similarity": 100
          }
        ]
      }
    ]
  }
}
```

---

## 🧠 Similarity engine

The plagiarism detection engine runs server-side in `backend/utils/ngramSimilarity.js`. It executes a four-stage analysis:

### 1. Preprocessing & Normalization
* **Text Answers:** Normalizes letter cases, strips leading/trailing punctuation, and condenses multiple whitespace characters into single spaces.
* **Code Submissions:** Strips single-line (`//`, `#`) and multi-line (`/* ... */`) comments, normalizes bracket formatting, and ignores variable indentation differences.

### 2. N-Gram Generation
The normalized string is sliced into overlapping sequences of $N$ tokens:
* Word $n$-grams (default: $N = 3$) for descriptive English answers.
* Character $n$-grams (default: $N = 4$ or $5$) for programming source code to capture structural syntactic flow.

### 3. Jaccard Similarity Calculation
For two submission token sets $A$ and $B$, the engine computes the Jaccard similarity index:

$$J(A, B) = \frac{|A \cap B|}{|A \cup B|} = \frac{|A \cap B|}{|A| + |B| - |A \cap B|}$$

* **Score:** Range $0\%$ to $100\%$.
* **Intersection ($|A \cap B|$):** Count of common identical $n$-grams.
* **Union ($|A \cup B|$):** Total count of unique $n$-grams across both submissions.

### 4. Pairwise Comparison Matrix
For $M$ submissions, the engine evaluates all $\frac{M(M-1)}{2}$ unique unordered pairs across all assignment questions. If a pair's aggregated score is greater than or equal to the assignment's threshold ($\tau$), the pair is marked `HIGH` and added to `flaggedPairs`.

---

## 💾 Database collections

| Collection | Purpose | Key Attributes |
| :--- | :--- | :--- |
| `instructors` | Faculty accounts & authentication | `name`, `email`, `password` (bcrypt), `department`, `role: "instructor"` |
| `students` | Student accounts & enrollment | `name`, `studentId` (roll number), `email`, `password` (bcrypt), `role: "student"` |
| `assignments` | Assignment definitions & constraints | `title`, `assignmentCode`, `questions` (array), `similarityThreshold`, `instructorId` |
| `submissions` | Student submissions & attachments | `assignmentId`, `studentName`, `studentId`, `content`, `fileName`, `submittedAt` |
| `similarityreports` | Persisted cross-submission analysis | `assignmentId`, `assignmentCode`, `totalSubmissions`, `flaggedCount`, `pairs` |

---

## 🧪 Testing with Postman

A pre-built Postman collection is configured to test the full API lifecycle:

1. **Health Check:** `GET /` and `GET /api` — verify database connection returns `"database": "connected"`.
2. **Instructor Auth:** `POST /api/instructors/login` — authenticate and copy the returned JWT token.
3. **Create Assignment:** `POST /api/assignments` — add `Authorization: Bearer <token>` and create an assignment. Note the returned `assignmentCode` (e.g. `VT-6D8RZ6`).
4. **Student Auth:** `POST /api/students/login` — log in with roll number `2410993999`.
5. **Submit Answers:** `POST /api/submissions` — submit JSON answers or upload a `.java` file using multipart form-data.
6. **Generate Report:** `GET /api/assignments/:id/similarity-report` — view computed similarity scores, average percentages, and flagged pairs.

### Postman Notes:
* Set collection variable `baseUrl` to `https://veritext-backend-oe56.onrender.com/api` for cloud testing, or `http://localhost:5000/api` for local testing.
* When testing file uploads in Postman, select **Body** → **form-data**, set the key to `file`, and choose **File** type to attach your `.java` or `.py` source file.

---

## ☁️ Deployment

### Current Live Services
| Component | Hosting Provider | URL | Status |
| :--- | :--- | :--- | :---: |
| **Backend API** | Render.com | [https://veritext-backend-oe56.onrender.com](https://veritext-backend-oe56.onrender.com) | ✅ Live |
| **Database** | MongoDB Atlas | Cloud Cluster (`0.0.0.0/0` Whitelist) | ✅ Connected |
| **Source Code** | GitHub | [rt2407-08/The_Assignment_Plagiarism](https://github.com/rt2407-08/The_Assignment_Plagiarism) | ✅ Active |

### Deploying on Render.com
1. Connect your GitHub repository to Render as a **Web Service**.
2. Configure build and start parameters:
   * **Root Directory:** `backend`
   * **Build Command:** `npm install`
   * **Start Command:** `npm start` (or `node src/server.js`)
3. Add environment variables in the Render dashboard:
   * `PORT`: `5000`
   * `MONGODB_URI`: `mongodb+srv://<user>:<password>@cluster0.g6nere2.mongodb.net/VeriText?retryWrites=true&w=majority`
   * `JWT_SECRET`: `your_super_secret_jwt_key_2026`
4. In MongoDB Atlas **Network Access**, ensure `0.0.0.0/0` (Allow Access from Anywhere) is active so Render's dynamic cloud IP addresses can connect.

---

## 🛠️ Troubleshooting

| Symptom | Cause | Solution |
| :--- | :--- | :--- |
| **502 Bad Gateway** | Render free tier service is spinning up after inactivity | Wait 30–50 seconds for container spin-up and refresh. Free-tier containers enter sleep mode after 15 minutes of idle time. |
| **401 Unauthorized** | Missing or expired JWT token | Log in via `/api/instructors/login` or `/api/students/login` and include `Authorization: Bearer <token>` in the header. |
| **Cannot GET /api** | Outdated server route | Ensure `app.get(["/", "/api"], ...)` is deployed in `server.js`. |
| **MongoDB connection error** | Atlas IP whitelist or invalid URI | Verify that `0.0.0.0/0` is whitelisted in MongoDB Atlas Network Access and confirm database credentials in `MONGODB_URI`. |
| **CORS Network Error** | Missing origin headers | `server.js` includes `app.use(cors())` to permit cross-origin requests from frontend origins. |
| **Local Port 5000 in use** | An existing Node process is running | Run `lsof -i :5000` and `kill -9 <PID>` to free up the port, or change `PORT` in `.env`. |

---

## 🔒 Security and data notes

* **Keep `.env` out of Git:** Production secrets (`MONGODB_URI`, `JWT_SECRET`) must never be committed to public repositories. Verified `.gitignore` rules protect `.env` files.
* **Password Hashing:** Passwords are never stored in plaintext. `bcryptjs` is applied server-side with 10 salt rounds before database persistence.
* **Stateless Authorization:** Secure JWT signatures prevent client-side credential spoofing. Token expiration ensures stale sessions expire automatically.
* **Memory File Buffering:** Multer processes uploaded source code in memory buffers rather than saving unverified executable files to server disks.

---

## 📌 Project summary

VeriText delivers full-stack academic integrity verification, automated submission ingestion, multi-language code similarity detection, and interactive reporting in one cohesive platform. Its MVC architecture cleanly decouples client views from backend routing and algorithmic computation, creating an extensible foundation for academic integrity management.

---

## 🔗 Live Application Links

* **Live Web Application:** [https://rt2407-08.github.io/The_Assignment_Plagiarism/](https://rt2407-08.github.io/The_Assignment_Plagiarism/)
* **Live Backend Service:** [https://veritext-backend-oe56.onrender.com](https://veritext-backend-oe56.onrender.com/)
* **API Endpoints Directory:** [https://veritext-backend-oe56.onrender.com/api](https://veritext-backend-oe56.onrender.com/api)
* **Sample Live Similarity Report:** [https://veritext-backend-oe56.onrender.com/api/assignments/VT-6D8RZ6/similarity-report](https://veritext-backend-oe56.onrender.com/api/assignments/VT-6D8RZ6/similarity-report)
* **GitHub Repository:** [https://github.com/rt2407-08/The_Assignment_Plagiarism](https://github.com/rt2407-08/The_Assignment_Plagiarism)

---

## 👥 Contributors

* **Aarti Thakur** ([@rt2407-08](https://github.com/rt2407-08))
* **Ishita Dahiya** ([@ishitadahiya53-sys](https://github.com/ishitadahiya53-sys))
* **Krrish Makkar** ([@Krrish-1845](https://github.com/Krrish-1845))

---

## 📄 License & Academic Integrity
This project is developed for educational and continuous academic evaluation purposes. Built with ❤️ by Aarti Thakur, Ishita Dahiya, and Krrish Makkar.
