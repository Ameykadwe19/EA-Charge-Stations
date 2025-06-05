# ⚡ EA-Charge-Stations

**EA-Charge-Stations** is a full-stack web application that allows users to manage Electric Vehicle (EV) charging stations. The app provides a clean UI for station listing, live map view, and full CRUD operations.
Built using modern web technologies for both frontend and backend, it helps manage charging stations efficiently and intuitively.

---

## 🚀 Features

- 🔐 **User Authentication** (Register/Login)
- 🗺️ **Map View with Leaflet.js**
- 📋 **Station List with Filters**
- ➕ **Add / Edit / Delete Charging Stations**
- ✅ **Responsive Design (Mobile & Desktop)**
- 💬 **Error, Loading, and Empty States**
- 🎛️ **Modal-based Form Interface**
- 📦 **API-integrated with Sequelize & PostgreSQL**

---

## 🛠 Tech Stack

### 🖥️ Frontend
- **Vue.js 3**
- **Vue Router**
- **Tailwind CSS (custom CSS also used)**
- **Leaflet.js** for map rendering

### ⚙️ Backend
- **Node.js + Express.js**
- **Sequelize ORM**
- **PostgreSQL** as the database
- **JWT-based authentication**
- **RESTful API with validation & error handling**

---

## 📂 Project Structure

```
EA-Charge-Stations/
├── backend/              # Node + Express + PostgreSQL + Sequelize
├── frontend/             # Vue 3 App (Dashboard, Login, Map View)
├── migrations/           # Sequelize migration files
├── models/               # Sequelize models
├── routes/               # Express API routes
└── README.md
```

---

## 📦 Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/Ameykadwe19/EA-Charge-Stations.git
cd EA-Charge-Stations
```

### 2. Backend Setup

```bash
cd backend
npm install
npx sequelize db:migrate
npm start
```

Make sure PostgreSQL is running and credentials match your `.env` config.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to view the app.

---

## 🧪 CRUD Operations

- **Create**: Add a new charging station via modal form
- **Read**: View list and map with filterable stations
- **Update**: Edit station info from the list
- **Delete**: Remove any station from the database

---

## 🧠 About the Project

This application was built to support real-time EV infrastructure planning and management. With a combination of map interface and admin panel,
it's ideal for managing city-level or organization-level charging deployments. Scalable, secure, and responsive — it’s ready for production-level enhancements.

---

## 🖋 Author

**Amey Kadwe**  
📧 [ameykadwe19@example.com](mailto:ameykadwe19@gmail.com)  
🔗 [GitHub Profile](https://github.com/Ameykadwe19)

---

### Made with 💡 and ⚡ by @Ameykadwe19
