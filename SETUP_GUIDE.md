# English App - Complete Setup Guide

## Project Structure

```
English_App/
├── backend/          # Express.js REST API
│   ├── controllers/  # Request handlers
│   ├── routes/       # API routes
│   ├── middleware/   # Authentication middleware
│   ├── services/     # Business logic
│   ├── config/       # Database config
│   ├── index.js      # Server entry point
│   ├── .env          # Environment variables
│   └── package.json
│
└── frontend/         # React.js Client
    ├── src/
    │   ├── context/  # Auth context
    │   ├── pages/    # Page components
    │   ├── components/ # Reusable components
    │   ├── App.js
    │   └── index.js
    ├── public/
    ├── package.json
    └── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MySQL Server (running)

## Installation Steps

### 1. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file (if not exists)
# Already configured with:
# - PORT=5000
# - DB_HOST=localhost
# - DB_USER=root
# - DB_PASSWORD=123456
# - DB_DATABASE=english_app
# - JWT_SECRET=supersecret123

# Start the server
node index.js
```

**Expected Output:**
```
✅ Server running on http://localhost:5000
✅ MySQL database connected successfully
```

### 2. Frontend Setup

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

**Expected Output:**
```
Compiled successfully!
You can now view english-app-frontend in the browser.
http://localhost:3000
```

## Database Setup

Create MySQL database and tables:

```sql
CREATE DATABASE english_app;

USE english_app;

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Usage

### 1. Register (Create Account)

- Open `http://localhost:3000`
- Click "Register here" or go to `/register`
- Enter email and password (min 8 characters)
- Click "Register" button
- You'll be redirected to login page

### 2. Login

- Go to `http://localhost:3000/login`
- Enter your email and password
- Click "Login" button
- JWT token is automatically saved to localStorage
- You'll be redirected to `/dashboard`

### 3. Access Protected Routes

- After login, you can access `/dashboard`
- Token is sent with each request in Authorization header
- If token expires or is invalid, you'll be redirected to login

### 4. Logout

- Click "Logout" button on dashboard
- Token is removed from localStorage
- You'll be redirected to login page

## API Endpoints

### Authentication Routes

- **POST** `/api/auth/register`
  - Body: `{ email, password }`
  - Returns: User data

- **POST** `/api/auth/login`
  - Body: `{ email, password }`
  - Returns: Access token

### Protected Routes

- **GET** `/api/protected/profile`
  - Headers: `Authorization: Bearer <token>`
  - Returns: Current user profile

- **GET** `/api/protected/verify`
  - Headers: `Authorization: Bearer <token>`
  - Returns: Token validity confirmation

## Troubleshooting

### Backend Issues

**Error: "Cannot find module 'mysql2'"**
```bash
cd backend
npm install
```

**Error: "MySQL connection error"**
- Ensure MySQL is running
- Check DB credentials in `.env`
- Verify database exists

**Error: "Port 5000 in use"**
```bash
# Find process using port 5000
netstat -ano | findstr :5000
# Kill process (Windows)
taskkill /PID <PID> /F
```

### Frontend Issues

**Error: "Cannot find module 'react-router-dom'"**
```bash
cd frontend
npm install
```

**Error: "CORS error in browser"**
- Ensure backend is running on port 5000
- Check CORS is enabled in index.js

**Error: "Token not found in localStorage"**
- Clear localStorage: `localStorage.clear()`
- Register and login again

## Environment Variables

### Backend (.env)

```
NODE_ENV=development
PORT=5000
JWT_SECRET=supersecret123
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_DATABASE=english_app
DB_CONNECTION_LIMIT=10
```

### Frontend

No `.env` file needed. API base URL is hardcoded in AuthContext.js:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

## Testing the API

### Using cURL or Postman

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

**Get Profile (with token):**
```bash
curl -X GET http://localhost:5000/api/protected/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Security Notes

⚠️ **Important for Production:**

1. **Change JWT_SECRET** to a strong random string
2. **Change DB_PASSWORD** to secure password
3. **Use environment variables** for sensitive data
4. **Enable HTTPS** in production
5. **Consider using httpOnly cookies** instead of localStorage
6. **Add rate limiting** to prevent brute force attacks
7. **Implement password hashing** (already using bcrypt)
8. **Add input validation** on backend (already implemented)

## Performance Optimization

### Frontend
- Use `React.memo()` for component memoization
- Implement lazy loading with `React.lazy()`
- Compress images
- Minify CSS and JS

### Backend
- Use connection pooling (already implemented)
- Cache frequently accessed data
- Add pagination for large datasets
- Use indexes on database columns

## Deployment

### Deploy Backend

```bash
# Build for production
npm run build

# Deploy to hosting (Heroku, AWS, etc.)
# Update API_BASE_URL in frontend
```

### Deploy Frontend

```bash
# Build
npm run build

# Deploy to hosting (Vercel, Netlify, GitHub Pages)
# Update API_BASE_URL to production backend URL
```

## Support & Documentation

- Backend: See `backend/README.md`
- Frontend: See `frontend/README.md`
- API Documentation: See `backend/ROUTES.md` (if available)

## License

MIT License - Feel free to use for learning purposes
