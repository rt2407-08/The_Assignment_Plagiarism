# VeriText — Academic Integrity & Plagiarism Detection Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-MVC%20Architecture-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB%20Atlas-Cloud%20Database-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Render](https://img.shields.io/badge/Render-Deployed%20&%20Live-46E3B7?logo=render&logoColor=white)](https://veritext-backend-oe56.onrender.com)
[![JWT](https://img.shields.io/badge/JWT-Role--Based%20Auth-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=black)](https://vitejs.dev/)

VeriText is a full-stack academic integrity and source code / text similarity review platform built with **Node.js, Express, MongoDB Atlas, and React**. It enables educators to create multi-question text and code assignments, accepts student submissions via direct input or file uploads (`.java`, `.py`, `.cpp`, `.txt`), and computes cross-submission similarity using a server-side **N-gram tokenizer and Jaccard similarity coefficient engine**.

---

## 🌐 Live Cloud Deployment

* **Live Cloud Service URL:** [https://veritext-backend-oe56.onrender.com](https://veritext-backend-oe56.onrender.com)
* **API Endpoints Directory:** [https://veritext-backend-oe56.onrender.com/api](https://veritext-backend-oe56.onrender.com/api)
* **Cloud Database:** MongoDB Atlas Cluster (Operational)

---

## 🔬 Core Theory & Algorithms

### 1. Plagiarism Detection Theory
Plagiarism detection in educational environments must address both natural language text (essays, short answers) and programming source code. Traditional exact string matching (such as Levenshtein distance or substring search) fails when students reorder sentences, rename variables, alter indentation, or modify comments. VeriText solves this by using **N-gram Tokenization** combined with **Set-Based Similarity Metrics**.

#### A. N-Gram Tokenization
An **$n$-gram** is a contiguous sequence of $n$ items from a given sample of text or code:
- **Character $n$-grams (Sub-word Level):** Captures prefixes, suffixes, and typographical permutations. Used for source code where keywords and structural tokens dominate.
- **Word $n$-grams (Word Level):** Captures local word ordering and phrase structure in descriptive text answers (e.g., trigrams with $n = 3$).

```text
Original String:   "public class Solution"
Word 2-grams:     {"public class", "class Solution"}
Char 3-grams:     {"pub", "ubl", "bli", "lic", "ic ", "c c", " cl", "cla", ...}
```

#### B. Preprocessing & Normalization
Before tokenization, all submissions undergo a normalization pipeline:
1. **Case Folding:** Converts characters to lowercase to eliminate case sensitivity.
2. **Comment Stripping:** Strips line comments (`//`, `#`) and block comments (`/* ... */`).
3. **Whitespace Canonicalization:** Compresses tabs, multiple spaces, and newlines into single spaces.
4. **Punctuation Normalization:** Removes non-alphanumeric noise while preserving programming syntax operators.

#### C. Jaccard Similarity Coefficient
To compute similarity between Student $A$ ($S_A$) and Student $B$ ($S_B$), their normalized contents are converted into sets of unique $n$-grams, denoted as $G_A$ and $G_B$.

The **Jaccard Similarity Index** $J(G_A, G_B)$ is defined as the size of the intersection divided by the size of the union of the sample sets:

$$J(G_A, G_B) = \frac{|G_A \cap G_B|}{|G_A \cup G_B|} = \frac{|G_A \cap G_B|}{|G_A| + |G_B| - |G_A \cap G_B|}$$

* **Score Range:** $0.0 \le J(G_A, G_B) \le 1.0$ (multiplied by $100$ for percentage: $0\%$ to $100\%$).
* **Intersection ($|G_A \cap G_B|$):** The count of distinct $n$-grams that appear in both submissions.
* **Union ($|G_A \cup G_B|$):** The total count of all unique $n$-grams across both submissions.

#### D. Pairwise Cross-Submission Matrix
For an assignment with $M$ student submissions, the system computes $\frac{M(M - 1)}{2}$ unique pairwise comparisons across all questions:

$$\text{Total Comparisons} = \binom{M}{2} = \frac{M(M - 1)}{2}$$

Each pair is evaluated per question and aggregated into an overall score. If the computed similarity meets or exceeds the instructor's configured threshold ($\tau$), the pair is flagged for review.

---

### 2. Software Architecture Theory (MVC Pattern)
The backend is structured according to the **Model-View-Controller (MVC)** architectural pattern:

```text
 ┌───────────────┐
 │   Frontend    │ <────── HTTP Requests / JSON Responses ──────> Express Server
 │(React / Views)│
 └───────┬───────┘
         │
         ▼
 ┌───────────────┐
 │    Routes     │ ──────> Dispatches request endpoints (/api/...)
 └───────┬───────┘
         │
         ▼
 ┌───────────────┐
 │  Middleware   │ ──────> Auth Verification (JWT) / Upload Handling (Multer)
 └───────┬───────┘
         │
         ▼
 ┌───────────────┐         ┌────────────────────────┐
 │  Controllers  │ <─────> │  Algorithms & Utils    │ (N-gram Engine)
 └───────┬───────┘         └────────────────────────┘
         │
         ▼
 ┌───────────────┐
 │    Models     │ <─────> MongoDB Atlas (Mongoose ODM)
 └───────────────┘
```

* **Models (`backend/models/`):** Encapsulate the data structure, schema constraints, validation rules, and direct interaction with MongoDB Atlas.
* **Views (`frontend/`):** Present the UI to the user (React dashboards, report tables, threshold sliders). Views never access the database directly; all data is fetched via REST APIs.
* **Controllers (`backend/controllers/`):** Contain the business logic, request handling, input sanitization, error dispatching, and response formatting.
* **Routes (`backend/routes/`):** Route incoming HTTP requests to their respective controller methods based on path and method.
* **Middleware (`backend/middleware/`):** Intercepts requests for cross-cutting concerns (JWT authentication token verification, Multer multipart form-data parsing).

---

### 3. Security & Authentication Theory
* **Stateless JWT Authentication:** Users authenticate once with credentials and receive a digitally signed JSON Web Token (JWT) using HMAC-SHA256 (`HS256`). Subsequent requests authenticate using the standard HTTP `Authorization: Bearer <token>` header without server session state.
* **Role-Based Access Control (RBAC):** Tokens carry a signed `role` payload (`instructor` or `student`). Middleware validates role claims before granting access to instructor-only capabilities (assignment creation, similarity report viewing).
* **Bcrypt Password Hashing:** User passwords are never stored in plaintext. They are hashed using `bcryptjs` with auto-generated salts (10 rounds) to protect against rainbow table and collision attacks.

---

## 🏗️ Monorepo Project Structure

```text
The_Assignment_Plagiarism/
│
├── backend/                                # Node.js / Express MVC Server
│   ├── config/                             # Database & server configuration
│   ├── controllers/                        # Business logic & request handlers
│   │   ├── assignmentController.js         # Assignment CRUD & code generation
│   │   ├── instructorController.js         # Instructor signup & JWT login
│   │   ├── studentController.js            # Student signup & roll-number login
│   │   ├── submissionController.js         # Text & Multer file submissions
│   │   └── similarityReportController.js   # Pairwise n-gram report calculation
│   ├── middleware/                         # Express middleware stack
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

## 🔄 End-to-End Application Workflow

```text
[Instructor Sign-Up / Login]
       │
       ▼
[Create Assignment] ────> Generates Unique Assignment Code (e.g. VT-6D8RZ6)
                                 │
                                 ▼
                     [Student Joins via Code]
                                 │
                                 ▼
                   [Submit Solution / File Upload]
                                 │
                                 ▼
                   [Multer Parses Code Buffer]
                                 │
                                 ▼
                   [Stored in MongoDB Atlas]
                                 │
                                 ▼
             [Instructor Opens Similarity Report]
                                 │
                                 ▼
           [Server-Side N-Gram & Jaccard Execution]
                                 │
                                 ▼
          [Interactive Report with Threshold Slider]
```

### Step 1: Assignment Creation
1. Instructor authenticates via `/api/instructors/login` and receives a JWT token.
2. Instructor creates an assignment specifying title, description, questions (text or code), target programming language, and a baseline similarity threshold $\tau$ (default: $30\%$).
3. The server generates a unique alphanumeric assignment code (e.g., `VT-6D8RZ6`) and saves the record in MongoDB.

### Step 2: Student Submission
1. Student authenticates via `/api/students/login` with their university roll number and password.
2. Student enters the assignment code to load questions dynamically from the backend.
3. Student enters typed answers or uploads source code files (`.java`, `.py`, `.cpp`, `.txt`).
4. `uploadMiddleware.js` parses the file buffer in memory and attaches it to the database record.

### Step 3: Similarity Report Computation
1. Instructor visits the report page for the assignment.
2. The server gathers all submissions associated with the assignment ID.
3. For each pair $(S_i, S_j)$, the N-gram similarity engine tokenizes the submissions, computes the Jaccard coefficient for each question, and generates an aggregate similarity percentage.
4. If the aggregate similarity exceeds the threshold, the pair is flagged with a `HIGH` status badge.
5. The report returns total submissions, total comparisons, average similarity, highest similarity pair, and question-level breakdowns.

### Step 4: Interactive Review & Filtering
1. The frontend renders 4 summary stat cards and a highest match callout.
2. The instructor can use the **Similarity Threshold Slider** (0% to 100%) to re-filter displayed pairs on the fly without reloading the page.
3. Clicking **"Compare Answers"** expands a side-by-side monospace preformatted comparison box to inspect identical text or code blocks.

---

## 📡 REST API Reference

| Endpoint | Method | Auth | Description |
| :--- | :---: | :---: | :--- |
| `/` or `/api` | `GET` | Public | Live cloud health check and endpoints directory |
| `/api/instructors/signup` | `POST` | Public | Register new instructor account |
| `/api/instructors/login` | `POST` | Public | Authenticate instructor and return JWT token |
| `/api/students/signup` | `POST` | Public | Register student (requires unique student ID and email) |
| `/api/students/login` | `POST` | Public | Authenticate student via roll number or email |
| `/api/assignments` | `GET` | Public | List all assignments with question counts |
| `/api/assignments` | `POST` | Instructor | Create new assignment with questions and threshold |
| `/api/assignments/code/:code` | `GET` | Public | Fetch assignment details by unique code (e.g. `VT-6D8RZ6`) |
| `/api/submissions` | `POST` | Student | Submit assignment answers (supports JSON or multipart file upload) |
| `/api/assignments/:id/similarity-report` | `GET` | Instructor | Compute and retrieve live server-side N-gram similarity report |

---

## 💻 Step-by-Step Setup & How to Run

### 1. Prerequisites
- **Node.js** (v18.x or later)
- **npm** (v9.x or later)
- **MongoDB Atlas** account (or a running local MongoDB instance)

### 2. Clone the Repository
```bash
git clone https://github.com/rt2407-08/The_Assignment_Plagiarism.git
cd The_Assignment_Plagiarism
```

### 3. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```
Open `.env` and fill in your configuration:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```
Start the backend server:
```bash
npm start
# Server runs on http://localhost:5000
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
# Vite dev server runs on http://localhost:5173
```

### 5. Running from Root
From the root of the project, you can start both components using workspace scripts:
```bash
npm run server    # Runs the Node.js backend
npm run client    # Runs the Vite frontend development server
```

---

## 🌿 Git Branching & Feature Workflow

The project strictly follows a feature-branch team workflow:

* **`feature/mvc-architecture`** (Ishita Dahiya): Frontend restructuring, database models, and authentication controllers.
* **`feature/similarity-algorithm`** (Krrish Makkar): N-gram tokenizer, Multer middleware, and pairwise comparison matrix.
* **`feature/cloud-deployment-frontend`** (Aarti Thakur): Express production server, Render cloud deployment, live API wiring, and interactive threshold slider.
* **`main`**: Production-ready branch containing merged feature branches with explicit merge commits.

---

## 👥 Contributors

* **Aarti Thakur** ([@rt2407-08](https://github.com/rt2407-08))
* **Ishita Dahiya** ([@ishitadahiya53-sys](https://github.com/ishitadahiya53-sys))
* **Krrish Makkar** ([@Krrish-1845](https://github.com/Krrish-1845))

---

## 📄 License & Academic Integrity
This project is developed for educational and academic evaluation purposes. Built with ❤️ by Aarti Thakur, Ishita Dahiya, and Krrish Makkar.
