# PocketJob

PocketJob is a MERN Stack job portal application that connects job seekers and employers. It provides secure user authentication, profile management, and job-related features through a responsive web interface.

## Features

- User Registration and Login
- JWT Authentication
- Role-based access (User/Admin)
- User Profile Management
- Job Listings
- Responsive Design
- Secure Password Hashing using bcrypt
- MongoDB Database Integration

## Tech Stack

### Frontend
- React
- Vite
- Bootstrap
- Axios
- React Router

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs

## Project Structure

```
PocketJob/
├── frontend/
├── backend/
└── README.md
```

## Installation

### Clone the repository

```bash
git clone https://github.com/ajithrajesh/Pocketjob-project.git
```

### Install dependencies

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

#### Backend

```bash
cd backend
npm install
npm start
```

## Environment Variables

Create a `.env` file in the backend folder and add:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

## Future Improvements

- Job application feature
- Resume upload
- Email notifications
- Advanced job search and filters
- Company dashboard

## Author

**Ajith R**

- GitHub: https://github.com/ajithrajesh