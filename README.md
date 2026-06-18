# 💼 Modern Full-Stack Job Portal with AI Integration & Real-Time Tracking

A comprehensive, production-ready career platform featuring secure Role-Based Access Control (RBAC), persistent state synchronization, real-time reactive event streaming, and intelligent document parsing.

Engineered with a robust **Spring Boot 3 REST API** architecture and a dynamic, responsive **React + Tailwind CSS** frontend.

---

# 🚀 Key Features

## 🔐 Secure Authentication Architecture

- Stateless JWT Authentication & Authorization
- Custom Spring Security Filters
- Protected REST API Endpoints
- Role-Based Access Control (RBAC)

## 👥 Role-Based Workspaces

### 🔒 System Administrators

- User Management Dashboard
- Platform Monitoring & Analytics
- Access Control Management
- System Configuration Tools

### 💼 Recruiters / Hiring Managers

- Job Posting & Management
- Applicant Review Dashboard
- Resume Screening System
- Company Profile Management

### ⭐ Job Seekers / Candidates

- Job Search & Discovery
- Smart Filtering & Sorting
- Resume Upload & Management
- Application Tracking
- Job Bookmarking

## 🔖 Persistent Bookmarking System

- Save jobs for later review
- Persistent storage across browser sessions
- Real-time synchronization with backend APIs
- Axios interceptor-based token handling

## 🤖 AI-Powered Resume Assistant

- Resume Parsing
- Skill Extraction
- Resume Analysis
- Intelligent Candidate Insights

## ⚡ Real-Time Reactive Operations

- Live Application Status Updates
- Instant Notifications
- Event-Driven Architecture
- Reactive Data Synchronization

---

# 🎨 Application Screenshots

## 🏠 Landing Page

![Landing Page](screenshots/landing-page.png)

---

## 🔐 Login Page

![Login Page](screenshots/login-page.png)

---

## 📝 Registration Page

![Registration Page](screenshots/register-page.png)

---

## 👤 Candidate Dashboard

![Candidate Dashboard](screenshots/candidate-dashboard.png)

---

## 💼 Recruiter Dashboard

![Recruiter Dashboard](screenshots/recruiter-dashboard.png)

---

## 🔒 Admin Dashboard

![Admin Dashboard](screenshots/admin-dashboard.png)

---

## 📑 Resume Analysis (AI)

![Resume Analysis](screenshots/resume-analysis.png)

---

# 🛠️ Technology Stack

## Backend

| Technology | Purpose |
|------------|----------|
| Spring Boot 3.x | REST API Development |
| Spring Security | Authentication & Authorization |
| JWT | Stateless Authentication |
| Spring Data JPA | Database Access Layer |
| Hibernate | ORM Framework |
| Lombok | Boilerplate Reduction |
| Jackson | JSON Serialization |
| Maven | Dependency Management |

## Frontend

| Technology | Purpose |
|------------|----------|
| React | UI Development |
| Vite | Frontend Build Tool |
| Tailwind CSS | Responsive Styling |
| React Router DOM | Client-Side Routing |
| Axios | API Communication |
| JavaScript (ES6+) | Frontend Logic |

## Database

- MySQL
- Relational Data Model
- JPA Entity Relationships

---

# 📐 Database Entity Relationship

```text
[ User ]
    │
    ├────────► [ BookmarkedJob ]
    │                 ▲
    │                 │
    │                 │
    ▼                 │
[ JobApplication ] ───┘
          │
          ▼
      [ JobPosting ]
```

## Relationships

- One User can bookmark multiple jobs.
- One User can apply to multiple jobs.
- One Job can receive multiple applications.
- One Job can be bookmarked by multiple users.

---

# 📂 Project Structure

```text
job-portal-hub/
│
├── backend/
│   ├── src/
│   ├── pom.xml
│   └── application.properties
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── screenshots/
│   ├── landing-page.png
│   ├── login-page.png
│   ├── register-page.png
│   ├── candidate-dashboard.png
│   ├── recruiter-dashboard.png
│   ├── admin-dashboard.png
│   └── resume-analysis.png
│
└── README.md
```

---

# 📦 Local Installation & Setup

## Backend Setup

### 1. Clone Repository

```bash
git clone https://github.com/M-Poojitha04/job-portal-hub.git
cd backend
```

### 2. Configure Database

Update:

`src/main/resources/application.properties`

with your database credentials.

### 3. Build Project

```bash
mvn clean package -DskipTests
```

### 4. Run Application

```bash
mvn spring-boot:run
```

Or run:

`BackendApplication.java`

from your IDE.

Backend runs on:

```text
http://localhost:8080
```

---

## Frontend Setup

### 1. Navigate to Frontend

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

# 🔑 Core Functionalities

- User Authentication & Authorization
- JWT Token-Based Security
- Job Posting & Management
- Job Search & Filtering
- Resume Upload & Parsing
- AI Resume Analysis
- Application Tracking
- Bookmark Management
- Recruiter Dashboard
- Admin Dashboard
- Profile Management
- Real-Time Status Updates

---

# 🌟 Future Enhancements

- AI Candidate Matching Engine
- Chat Between Recruiters & Candidates
- Advanced Analytics Dashboard
- Resume Score Prediction
- Multi-Language Support
- Mobile Application
- Interview Scheduling
- Email Notifications

---

# 👨‍💻 Author

**Poojitha Machrla**

Developed as a modern full-stack recruitment platform using **Spring Boot, React, Tailwind CSS, JWT Security, JPA, and AI-powered resume analysis**.