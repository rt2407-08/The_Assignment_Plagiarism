# VeriText — Smart Academic Review Platform

VeriText is a browser-based academic integrity and similarity-review platform designed to help instructors review student submissions faster.

It provides separate instructor and student portals, assignment creation, student submissions, similarity analysis, and detailed similarity reports.

> **Project type:** Frontend-only academic project / prototype  
> **Backend:** None — application data is stored in browser `localStorage`.

---

## ✨ Features

### Instructor Portal

- Instructor sign-up and login
- Protected instructor dashboard
- Create assignments with multiple questions
- Support for text and code questions
- Code-language selection for programming questions
- Assignment codes for student access
- Submission counts and dashboard statistics
- View similarity reports for assignments
- Delete assignments
- Identify high-similarity submission pairs
- Question-wise similarity breakdown

### Student Portal

- Student sign-up and login
- Student session management
- Enter an assignment code to access an assignment
- View assignment questions
- Submit text answers
- Submit code answers
- Automatic submission storage
- Student logout

### Similarity Reports

- Overall submission-pair similarity
- Highest similarity pair
- Configurable similarity threshold
- High / moderate / low similarity status
- Question-wise similarity results
- Text similarity breakdown
- Code similarity breakdown
- Token and structural analysis for programming submissions

---

## 🧠 Similarity Analysis

VeriText uses different comparison strategies depending on the question type.

### Text Questions

Text answers are:

1. Normalized
2. Converted into word n-grams
3. Compared using **Jaccard similarity**

The default implementation uses **3-word n-grams**.

Conceptually:

```text
Jaccard Similarity =
Intersection of shared n-grams
--------------------------------
Union of all n-grams
```

### Code Questions

Programming submissions use a tokenizer-based approach.

The analyzer can consider:

- Keywords
- Identifiers / variable names
- Operators
- Literals
- Comments
- Token sequences
- Token n-grams
- Code structure
- Formatting-normalized code

Supported languages currently include:

- Python
- Java
- C
- C++
- JavaScript

The code similarity calculation combines multiple signals instead of relying on simple text matching.

---

## 🏗️ Project Structure

```text
VeriText/
│
├── index.html                 # Landing page
├── login.html                 # Instructor login
├── signup.html                # Instructor registration
│
├── instructor.html            # Instructor dashboard
├── report.html                # Similarity report
│
├── student.html               # Student submission portal
├── student-login.html         # Student login
├── student-signup.html        # Student registration
│
├── css/
│   └── style.css              # Global UI and responsive styles
│
└── js/
    ├── auth.js                # Instructor authentication/session guard
    ├── instructor.js           # Dashboard and assignment management
    ├── login.js                # Instructor login logic
    ├── main.js                 # Main-page JavaScript entry point
    ├── report.js               # Similarity report rendering/filtering
    ├── signup.js               # Instructor registration
    ├── similarity.js            # Text/code similarity engine
    ├── student-auth.js          # Student authentication
    └── student.js               # Student assignment/submission logic
```

---

## 🚀 How to Run

VeriText is a static frontend application, so no Node.js, database, or backend server is required.

### Option 1 — VS Code Live Server

1. Open the `VeriText` folder in VS Code.
2. Install the **Live Server** extension if it is not already installed.
3. Open `index.html`.
4. Right-click the file.
5. Select **Open with Live Server**.

The application will open in your browser.

### Option 2 — Python HTTP Server

If Python is installed:

```bash
cd VeriText
python3 -m http.server 5500
```

Then open:

```text
http://localhost:5500
```

Using a local server is recommended instead of opening HTML files directly with `file://`.

---

## 🔐 Authentication & Data Storage

This project currently uses the browser's `localStorage` API instead of a backend database.

Examples of stored application data include:

```text
veritext_students
veritext_assignments
veritext_logged_in
veritext_current_user
veritext_student_logged_in
veritext_current_student
```

This makes the project easy to run locally, but it also means:

- Data is specific to the current browser/device.
- Clearing browser storage can remove project data.
- There is no multi-user server-side synchronization.
- Authentication is suitable for a prototype/demo, **not production security**.
- Passwords should not be stored in plain browser storage in a production application.

---

## 🔄 Application Flow

### Instructor

```text
Landing Page
     ↓
Instructor Signup / Login
     ↓
Instructor Dashboard
     ↓
Create Assignment
     ↓
Generate Assignment Code
     ↓
Receive Student Submissions
     ↓
Open Similarity Report
     ↓
Compare Submission Pairs
     ↓
Review Question-wise Similarity
```

### Student

```text
Landing Page
     ↓
Student Signup / Login
     ↓
Student Portal
     ↓
Enter Assignment Code
     ↓
Load Assignment
     ↓
Answer Questions
     ↓
Submit Assignment
```

---

## 📊 Similarity Report

The report page presents:

- Number of submissions
- Number of comparisons
- Number of flagged pairs
- Highest similarity percentage
- Student A / Student B
- Similarity percentage
- Similarity status
- Question-wise comparison
- Analysis methodology

The threshold selector allows instructors to filter the displayed similarity results.

---

## 🎨 UI / Design

VeriText uses a clean academic dashboard style with:

- Teal / navy visual identity
- Inter typography
- Responsive layouts
- Card-based dashboards
- Landing-page hero section
- Instructor and student portals
- Similarity report cards
- Progress indicators
- Status labels

The interface is designed to prioritize readability while keeping the platform visually modern.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| HTML5 | Page structure |
| CSS3 | Styling, layout, responsiveness |
| Vanilla JavaScript | Application logic |
| Browser `localStorage` | Local data persistence |
| Google Fonts / Inter | Typography |

No external frontend framework is required.

---

## ⚠️ Current Limitations

This is a frontend prototype, so it has some important limitations.

### No Backend

There is currently no:

- REST API
- Server
- Database
- Cloud storage
- Server-side authentication

### Local Browser Storage

Assignments, accounts, and submissions are stored locally.

Therefore, two different browsers will not automatically share the same data.

### Prototype Authentication

The authentication system demonstrates the application flow but is not suitable for a production deployment.

For a real system, authentication should use:

- Server-side sessions or secure tokens
- Password hashing
- HTTPS
- Database-backed users
- Access-control middleware

### Similarity Is an Indicator, Not Proof

A high similarity score should be treated as a signal for instructor review rather than automatic proof of plagiarism.

Context, citations, common terminology, assignment requirements, and legitimate collaboration can all affect similarity.

---

## 🔮 Recommended Future Improvements

For a production-ready version, the next major improvements would be:

1. **Backend API**
   - Node.js / Express, Django, FastAPI, etc.

2. **Database**
   - PostgreSQL / MySQL / MongoDB

3. **Secure authentication**
   - Password hashing
   - Session management
   - Role-based access control

4. **Persistent file storage**
   - Store uploaded documents and code submissions securely.

5. **Improved similarity engine**
   - Semantic similarity using embeddings
   - Better code-structure analysis
   - Cross-language analysis
   - Citation-aware matching

6. **Instructor tools**
   - Assignment editing
   - Exportable reports
   - Submission history
   - Search and filtering
   - Manual review notes

7. **Student experience**
   - Draft saving
   - Submission history
   - Deadline support
   - Assignment status tracking

8. **Deployment**
   - Production backend
   - HTTPS
   - Database
   - Secure environment configuration

---

## 👥 Project Roles

A possible team structure for this project:

- **Frontend Development** — UI, pages, responsive design
- **Similarity Engine** — text and code comparison algorithms
- **Authentication & Data** — user flows and local persistence
- **Instructor Dashboard** — assignment management and reports
- **Testing & UI/UX** — usability, responsiveness, and visual consistency

---

## 🧪 Testing Checklist

Before demonstrating the project, verify:

- [ ] Instructor can create an account
- [ ] Instructor can log in
- [ ] Instructor dashboard loads correctly
- [ ] Assignment creation works
- [ ] Assignment code is generated
- [ ] Student can create an account
- [ ] Student can log in
- [ ] Student can access an assignment using its code
- [ ] Student can submit answers
- [ ] Submission count updates
- [ ] Similarity report opens
- [ ] Similarity percentage is displayed
- [ ] Question-wise similarity is displayed
- [ ] Threshold filtering works
- [ ] Logout works for both roles
- [ ] Report layout remains readable at different screen sizes

---

## 📄 License

This project is intended as an academic / educational project.

If you plan to publish or deploy it commercially, add an appropriate software license and review the licensing requirements of any third-party assets or services used by the project.

---

## 👤 About VeriText

**VeriText** is designed around a simple idea:

> **Make every submission count.**

Instead of replacing instructor judgment, the platform helps instructors identify meaningful similarity patterns so they can spend less time searching and more time reviewing.
