# English App - Frontend

React application for managing user authentication and learning English.

## Features

- ✅ User Registration
- ✅ User Login with JWT Authentication
- ✅ Protected Routes
- ✅ JWT Token Storage in localStorage
- ✅ Automatic Redirect after Login
- ✅ Token Verification on App Load
- ✅ Responsive Design

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── PrivateRoute.js      # Protected route component
│   ├── context/
│   │   └── AuthContext.js       # Authentication context
│   ├── pages/
│   │   ├── LoginPage.js         # Login page
│   │   ├── RegisterPage.js      # Register page
│   │   └── DashboardPage.js     # Protected dashboard
│   ├── App.js                   # Main app component with routing
│   ├── App.css                  # App styles
│   └── index.js                 # Entry point
├── package.json
└── README.md
```

## Installation & Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start the Development Server

```bash
npm start
```

The app will run on `http://localhost:3000`

### 3. Ensure Backend is Running

Make sure the backend server is running on `http://localhost:5000`:

```bash
cd backend
node index.js
```

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## Authentication Flow

1. **Register**: User creates account with email and password
2. **Login**: User logs in and receives JWT token
3. **Token Storage**: JWT token is saved to localStorage
4. **Protected Routes**: PrivateRoute component checks authentication
5. **Token Verification**: On app load, token is verified with backend
6. **Logout**: Token is removed from localStorage

## API Endpoints Used

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/protected/verify` - Verify token validity

## Key Technologies

- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **useContext** - State management

## LocalStorage

The app uses localStorage to persist JWT tokens:

```javascript
localStorage.getItem('accessToken')  // Get token
localStorage.setItem('accessToken', token)  // Set token
localStorage.removeItem('accessToken')  // Remove token
```

## Error Handling

- Form validation on client-side
- API error messages displayed to user
- Token expiration handling
- Network error handling

## Security

- JWT tokens stored in localStorage (consider httpOnly cookies for extra security)
- Protected routes require valid token
- CORS configured with backend
- Password validation (min 8 characters)

## Future Enhancements

- [ ] Password reset functionality
- [ ] Email verification
- [ ] User profile management
- [ ] Refresh token support
- [ ] Two-factor authentication
- [ ] Social login (Google, GitHub)

## Support

For issues or questions, please check the backend documentation at `../backend/README.md`
