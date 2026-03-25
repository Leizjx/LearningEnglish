# How to Run English App - Hướng Dẫn Chạy

## 🔧 Backend Setup & Run

### 1. Navigate to backend folder
```bash
cd backend
```

### 2. Install dependencies (nếu chưa install)
```bash
npm install
```

### 3. Create .env file in backend folder
Create file `backend/.env` with:
```
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=english_app
DB_CONNECTION_LIMIT=10
JWT_SECRET=supersecret123
ADMIN_EMAIL=admin123@gmail.com
ADMIN_PASSWORD=123123
```

### 4. Setup Database
```bash
# Login to MySQL
mysql -h localhost -u root -p

# Create database
CREATE DATABASE english_app;
USE english_app;

# Import tables and sample data
source quiz_sample_data.sql;
```

### 5. Run Backend
```bash
node index.js
```

✅ Expected output:
```
✅ Server running on http://localhost:5000
📝 Environment: development
✅ MySQL database connected successfully
```

---

## 🎨 Frontend Setup & Run

### 1. Open new terminal and navigate to frontend folder
```bash
cd frontend
```

### 2. Install dependencies (nếu chưa install)
```bash
npm install
```

### 3. Create .env file in frontend folder
Create file `frontend/.env` with:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Run Frontend
```bash
npm start
```

✅ Expected output:
```
Local:   http://localhost:3000
On Your Network: http://192.168.x.x:3000
```

Browser sẽ tự động mở và đi đến http://localhost:3000

---

## 📋 Complete Setup Steps (First Time)

### Terminal 1 - Backend
```bash
cd backend
npm install
# Edit .env file with your DB credentials
node index.js
```

### Terminal 2 - Frontend
```bash
cd frontend
npm install
# Edit .env file
npm start
```

### Browser
- Login page mở tự động tại http://localhost:3000
- Đăng ký account mới hoặc login
- Access Dashboard → Flashcards / Quizzes

---

## ❌ Troubleshooting

### Backend Port Already in Use
```bash
# Change PORT in .env to 5001
PORT=5001
```

### Database Connection Failed
```bash
# Check MySQL is running
# Verify DB credentials in .env match your MySQL setup
# Try creating database manually:
mysql -h localhost -u root -p
CREATE DATABASE english_app;
```

### Frontend "npm: command not found"
```bash
# Install Node.js from https://nodejs.org/
# Then try again
npm start
```

### Module not found errors
```bash
# Delete node_modules and reinstall
rm -r node_modules
npm install
```

---

## ✅ Verification Checklist

- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:3000
- [ ] MySQL database connected
- [ ] Can register new account
- [ ] Can login
- [ ] Can access Flashcards page
- [ ] Can access Quizzes page

---

## 🎯 Quick Start (After First Setup)

```bash
# Terminal 1
cd backend && node index.js

# Terminal 2 (new)
cd frontend && npm start
```

That's it! 🚀
