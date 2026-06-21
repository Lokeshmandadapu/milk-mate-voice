# 🥛 Milk Mate Voice

A modern voice-enabled dairy management and milk sales tracking system built with React, TypeScript, Express, and MySQL. Milk Mate Voice helps dairy farmers, milk collection centers, and administrators efficiently manage milk collection, payments, farmer records, analytics, and reporting through a user-friendly interface.

---

## 🚀 Features

### 👨‍🌾 Farmer Management

* Add, update, and manage farmer records
* Store contact and profile information
* Track milk collection history

### 🥛 Milk Collection Management

* Record daily milk collections
* Maintain collection history
* Track quantity and collection details

### 💰 Payment Management

* Manage farmer payments
* Generate payment records
* Track pending and completed payments

### 📊 Analytics Dashboard

* View collection statistics
* Monitor business performance
* Analyze milk production trends

### 📈 Reports

* Generate collection reports
* Generate payment reports
* Export and review historical data

### 🔔 Notifications

* Important updates and alerts
* System notifications for users

### 🔐 Secure Authentication

* JWT-based authentication
* Protected API routes
* Role-based access control

### 🤖 AI Integration

* AI-powered features and assistance
* Enhanced user interaction capabilities

### 🎙️ Voice-Enabled Experience

* Designed to support voice-based workflows
* Simplifies data entry and management processes

---

## 🛠️ Tech Stack

### Frontend

* React 18
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui
* React Router
* React Query
* Supabase Client

### Backend

* Node.js
* Express.js
* TypeScript
* MySQL
* JWT Authentication
* REST API Architecture

---

## 📁 Project Structure

```text
milk-mate-voice/
│
├── src/                      # React Frontend
├── public/                   # Static Assets
├── backend/
│   ├── routes/               # API Routes
│   ├── middleware/           # Authentication Middleware
│   ├── scripts/
│   │   └── init-db.js        # Database Initialization
│   ├── schema.sql            # Database Schema
│   └── server.ts             # Express Server
│
├── package.json
├── vite.config.ts
└── README.md
```

## ⚙️ Installation

### Prerequisites

* Node.js (LTS Version)
* npm
* MySQL Server

### Clone Repository

```bash
git clone https://github.com/Lokeshmandadapu/milk-mate-voice.git
cd milk-mate-voice
```

### Install Dependencies

```bash
npm install
```

### Install Backend Dependencies

```bash
npm --prefix backend install
```

---

## 🗄️ Database Setup

Create a `.env` file inside the `backend` folder and configure:

```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=milk_mate
JWT_SECRET=your_secret_key
```

Initialize the database:

```bash
npm --prefix backend run db:init
```

---

## ▶️ Running the Project

### Run Frontend and Backend Together

```bash
npm run dev:all
```

### Run Frontend Only

```bash
npm run dev
```

### Run Backend Only

```bash
npm --prefix backend run dev
```

---

## 🔗 API Endpoints

Base URL:

```text
/api
```

Available Routes:

```text
/api/auth
/api/dashboard
/api/farmers
/api/milk-collection
/api/payments
/api/analytics
/api/reports
/api/notifications
/api/admin
/api/ai
```

---

## 🧪 Build & Lint

### Lint Project

```bash
npm run lint
```

### Build Frontend

```bash
npm run build
```

---

## 🌟 Future Enhancements

* Multi-language voice support
* Mobile application
* SMS notifications
* Cloud deployment
* Real-time analytics
* Advanced AI recommendations
* Farmer mobile dashboard

---

## 👨‍💻 Author

**Lokesh Mandadapu**

B.Tech Student | Full Stack Developer | Software Engineering Enthusiast

GitHub:
https://github.com/Lokeshmandadapu

---

## 📜 License

This project is licensed under the MIT License.

---

## ⭐ Support

If you found this project useful, please consider giving it a star on GitHub.
