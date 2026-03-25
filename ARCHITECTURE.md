# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (Client Side)                     │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │            React Application (Frontend)                │ │
│  │                                                        │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │ │
│  │  │ Login Page   │  │Register Page │  │ Dashboard  │  │ │
│  │  └──────────────┘  └──────────────┘  └────────────┘  │ │
│  │         │                │                 │          │ │
│  │         └────────────────┴─────────────────┘          │ │
│  │                    │                                  │ │
│  │         ┌──────────▼──────────┐                       │ │
│  │         │  AuthContext        │                       │ │
│  │         │ (Login, Register,   │                       │ │
│  │         │  Logout, Token)     │                       │ │
│  │         └──────────┬──────────┘                       │ │
│  │                    │                                  │ │
│  │         ┌──────────▼──────────┐                       │ │
│  │         │  localStorage       │                       │ │
│  │         │ (JWT Token)         │                       │ │
│  │         └─────────────────────┘                       │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                   │
│                 ┌─────────▼──────────┐                        │
│                 │  HTTP Client       │                        │
│                 │  (Axios)           │                        │
│                 └─────────┬──────────┘                        │
└─────────────────────────┬─────────────────────────────────────┘
                          │
                          │ REST API Calls
                          │ (Port 3000)
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Server (Backend - Express.js)                   │
│                     (Port 5000)                              │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                  API Routes                            │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐   │ │
│  │  │ /auth/*      │  │ /user/*      │  │ /protected │   │ │
│  │  │ (register,   │  │ (CRUD ops)   │  │ (profile)  │   │ │
│  │  │  login)      │  │              │  │            │   │ │
│  │  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘   │ │
│  └─────────┼──────────────────┼─────────────────┼────────┘ │
│            │                  │                 │            │
│  ┌─────────▼──────────────────▼─────────────────▼────────┐ │
│  │            Middleware Layer                           │ │
│  │  ┌─────────────────────────────────────────────────┐  │ │
│  │  │ JWT Authentication Middleware                   │  │ │
│  │  │ (Verify token, attach user to request)         │  │ │
│  │  └─────────────────────────────────────────────────┘  │ │
│  └─────────────┬──────────────────────────────────────────┘ │
│                │                                              │
│  ┌─────────────▼──────────────────────────────────────────┐ │
│  │          Controllers (Request Handlers)                │ │
│  │  ┌─────────────────────────────────────────────────┐   │ │
│  │  │ authController.js                              │   │ │
│  │  │ - register()                                    │   │ │
│  │  │ - login()                                       │   │ │
│  │  │ - getProfile()                                  │   │ │
│  │  └─────────────────────────────────────────────────┘   │ │
│  └─────────────┬──────────────────────────────────────────┘ │
│                │                                              │
│  ┌─────────────▼──────────────────────────────────────────┐ │
│  │            Services (Business Logic)                   │ │
│  │  ┌─────────────────────────────────────────────────┐   │ │
│  │  │ authService.js                                  │   │ │
│  │  │ - validateEmail()                               │   │ │
│  │  │ - validatePassword()                            │   │ │
│  │  │ - hashPassword()                                │   │ │
│  │  │ - comparePassword()                             │   │ │
│  │  │ - generateToken()                               │   │ │
│  │  │ - registerUser()                                │   │ │
│  │  │ - loginUser()                                   │   │ │
│  │  └─────────────────────────────────────────────────┘   │ │
│  └─────────────┬──────────────────────────────────────────┘ │
│                │                                              │
│  ┌─────────────▼──────────────────────────────────────────┐ │
│  │           Database Config                             │ │
│  │  ┌─────────────────────────────────────────────────┐   │ │
│  │  │ db.js (MySQL Connection Pool)                   │   │ │
│  │  │ - Creates connection pool                       │   │ │
│  │  │ - Provides promise-based API                    │   │ │
│  │  └─────────────────────────────────────────────────┘   │ │
│  └─────────────┬──────────────────────────────────────────┘ │
└─────────────────┼────────────────────────────────────────────┘
                  │
                  │ SQL Queries
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                  MySQL Database                             │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Table: users                                           │ │
│  │ ┌──────┬──────────┬──────────────┬──┐                 │ │
│  │ │ id   │ email    │ password     │..│                 │ │
│  │ ├──────┼──────────┼──────────────┼──┤                 │ │
│  │ │ 1    │ user@... │ hashed_pass  │..│                 │ │
│  │ │ 2    │ user2@.. │ hashed_pass  │..│                 │ │
│  │ └──────┴──────────┴──────────────┴──┘                 │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Registration Flow
```
User enters email & password
        │
        ▼
Frontend validates input
        │
        ▼
Send POST /api/auth/register
        │
        ▼
authController.register()
        │
        ▼
authService.registerUser()
        │
        ├─► validateEmail()
        ├─► validatePassword()
        ├─► findUserByEmail() → Check if exists
        └─► hashPassword() → bcrypt
        │
        ▼
authService.createUser()
        │
        ▼
db.query() INSERT into users
        │
        ▼
Return user data
        │
        ▼
Frontend redirects to login
```

### Login Flow
```
User enters email & password
        │
        ▼
Frontend validates input
        │
        ▼
Send POST /api/auth/login
        │
        ▼
authController.login()
        │
        ▼
authService.loginUser()
        │
        ├─► validateEmail()
        ├─► validatePassword()
        ├─► findUserByEmail()
        ├─► comparePassword() → bcrypt verify
        └─► generateToken() → JWT sign
        │
        ▼
Return accessToken & user
        │
        ▼
Frontend stores token in localStorage
        │
        ▼
Frontend redirects to dashboard
```

### Protected Route Access
```
User navigates to /dashboard
        │
        ▼
PrivateRoute checks token in localStorage
        │
        ├─► No token → Redirect to /login
        │
        └─► Token found → verifyToken API call
                │
                ▼
                Send GET /api/protected/verify
                │
                ▼
                authMiddleware.verifyToken()
                │
                ├─► Extract Bearer token
                ├─► jwt.verify() with JWT_SECRET
                ├─► Decode user data
                └─► Attach to req.user
                │
                ▼
                Handler processes request
                │
                ▼
                Return user data
                │
                ▼
                Frontend displays dashboard
```

## Technology Stack

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Context API** - State management

### Backend
- **Express.js** - Web framework
- **MySQL2** - Database driver
- **JWT** - Token authentication
- **Bcrypt** - Password hashing
- **Dotenv** - Environment variables

### Database
- **MySQL** - Relational database

## Security Measures

1. **Password Security**
   - Bcrypt hashing (10 salt rounds)
   - Minimum 8 characters required
   - No plaintext storage

2. **Token Security**
   - JWT with 1-hour expiration
   - Signed with JWT_SECRET
   - Verification on each protected request

3. **Data Validation**
   - Email format validation (regex)
   - Password length validation
   - Type checking

4. **Error Handling**
   - Generic error messages (no info leakage)
   - HTTP status codes
   - Proper logging

5. **CORS**
   - Enabled for frontend domain
   - Configured in Express middleware

## Scalability Considerations

### Database
- Connection pooling (10 connections)
- Index on email column
- Future: Add caching layer (Redis)

### Backend
- Stateless design
- Horizontal scaling ready
- Load balancer compatible

### Frontend
- Code splitting
- Lazy loading
- Minification

## Future Enhancements

1. **Authentication**
   - Refresh tokens
   - Social login
   - Two-factor authentication
   - Password reset

2. **Features**
   - User profiles
   - Learning modules
   - Progress tracking
   - Quizzes/Exams

3. **Performance**
   - Caching (Redis)
   - Database optimization
   - CDN for static assets
   - GraphQL API

4. **Security**
   - Rate limiting
   - Input sanitization
   - HTTPS enforcement
   - Security headers

5. **Operations**
   - Monitoring & logging
   - Error tracking
   - Performance metrics
   - CI/CD pipeline
