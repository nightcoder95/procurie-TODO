# Procurie-TODO: A Full-Stack Todo Application

Procurie-TODO is a simple yet powerful full-stack application designed to help you manage your tasks efficiently. It features a Django REST Framework backend and a modern Next.js frontend, built with TypeScript and styled with Tailwind CSS.

## Features

### Backend (Django & DRF)
- Secure token-based authentication (Register, Login, Logout) using SimpleJWT.
- Full CRUD (Create, Read, Update, Delete) API endpoints for managing todos.
- Custom API actions to filter for pending or completed todos.
- User profile management (view and update).
- Robust filtering, searching, and ordering capabilities for todos.

### Frontend (Next.js & TypeScript)
- A clean, modern, and responsive user interface built with Next.js and Tailwind CSS.
- User registration and login forms with validation and loading states.
- Global state management for authentication using React Context (`useAuth`).
- Optimistic UI updates for a smoother user experience when toggling or deleting todos.
- Protected routes to ensure only authenticated users can access the main application.
- Beautiful animations and transitions powered by Framer Motion.

## Getting Started

Follow these instructions to get both the backend and frontend running on your local machine for development and testing purposes.

### Prerequisites

- **Backend**: Python 3.8+, pip
- **Frontend**: Node.js v18.0+, npm (or yarn/pnpm)

### 1. Backend Setup (Django)

First, set up and run the Django server.

**a. Navigate to the backend directory:**
```bash
cd backend
```

**b. Create a virtual environment and activate it:**
```bash
# For macOS/Linux
python3 -m venv venv
source venv/bin/activate

# For Windows
python -m venv venv
.\venv\Scripts\activate
```

**c. Install the required packages:**
```bash
pip install -r requirements.txt
```

**d. Run database migrations:**
This will create the necessary database tables, including the ones for users and todos.
```bash
python manage.py makemigrations
python manage.py migrate
```

**e. Start the backend server:**
The Django development server will start, typically on `http://127.0.0.1:8000`.
```bash
python manage.py runserver
```

The backend is now running!

### 2. Frontend Setup (Next.js)

Now, let's get the frontend application running in a separate terminal.

**a. Navigate to the frontend directory:**
```bash
cd frontend
```

**b. Install the required npm packages:**
```bash
npm install
```

**c. Set up environment variables:**
Create a new file named `.env.local` in the `frontend` directory. This file will tell your frontend where to find the backend API.

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

**Note**: In Next.js, environment variables must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser.

**d. Start the frontend development server:**
This command starts the Next.js development server, usually on `http://localhost:3000`.
```bash
npm run dev
```

You can now open http://localhost:3000 in your browser to use the application.