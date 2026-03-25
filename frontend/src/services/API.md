# Frontend API Service Documentation

## Overview

This document explains how to use the Axios instance for making API requests to the backend.

## Setup

### 1. Configure Environment

Create a `.env` file in the `frontend` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Or use the default (localhost:5000):

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

### 2. Automatic JWT Token Handling

The axios instance automatically:
- Attaches JWT token from localStorage to every request
- Uses `Authorization: Bearer <token>` header format
- Handles token expiration (401 errors)
- Manages error responses

## Usage

### Basic Example

```javascript
import axiosInstance from '../services/axiosInstance';

// GET request
const response = await axiosInstance.get('/protected/profile');

// POST request
const response = await axiosInstance.post('/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});

// PUT request
const response = await axiosInstance.put('/user/profile', {
  name: 'John Doe'
});

// DELETE request
const response = await axiosInstance.delete('/user/account');
```

### In React Components

```javascript
import { useEffect, useState } from 'react';
import axiosInstance from '../services/axiosInstance';

function MyComponent() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('/protected/profile');
        setData(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  return <div>{/* Render data */}</div>;
}
```

## Request Interceptor

The request interceptor automatically adds the JWT token:

```javascript
// This happens automatically for every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Example:**
```javascript
// You write:
await axiosInstance.post('/protected/endpoint', data);

// It becomes:
// POST /api/protected/endpoint
// Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## Response Interceptor

The response interceptor handles common scenarios:

```javascript
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired - clear auth
      localStorage.removeItem('accessToken');
    }
    return Promise.reject(error);
  }
);
```

## Error Handling

### Common Errors

**401 Unauthorized**
```javascript
try {
  const response = await axiosInstance.get('/protected/profile');
} catch (error) {
  if (error.response?.status === 401) {
    // Token expired or invalid
    // Redirects to login automatically
  }
}
```

**400 Bad Request**
```javascript
try {
  await axiosInstance.post('/auth/register', {
    email: 'invalid-email',
    password: 'short'
  });
} catch (error) {
  console.log(error.response?.data?.message);
  // "Password must be at least 8 characters long"
}
```

**500 Server Error**
```javascript
try {
  await axiosInstance.get('/some-endpoint');
} catch (error) {
  if (error.response?.status === 500) {
    console.log('Server error - please try again later');
  }
}
```

## API Endpoints

### Authentication

```javascript
// Register
POST /auth/register
Body: { email, password }
Response: { success, message, data: { id, email } }

// Login
POST /auth/login
Body: { email, password }
Response: { success, message, data: { accessToken, user } }
```

### Protected Endpoints (Requires Token)

```javascript
// Get Profile
GET /protected/profile
Headers: Authorization: Bearer <token>
Response: { success, message, data: { user } }

// Verify Token
GET /protected/verify
Headers: Authorization: Bearer <token>
Response: { success, message, data: { user, tokenValid } }
```

## Advanced Usage

### Custom Headers

```javascript
// Add custom header for specific request
await axiosInstance.post('/endpoint', data, {
  headers: {
    'X-Custom-Header': 'value'
  }
});
```

### Request Timeout

```javascript
// Default timeout is 10 seconds
// Override for specific request
await axiosInstance.get('/endpoint', {
  timeout: 5000 // 5 seconds
});
```

### Cancel Requests

```javascript
const controller = new AbortController();

const promise = axiosInstance.get('/endpoint', {
  signal: controller.signal
});

// Cancel request if needed
controller.abort();
```

## Environment Variables

### Development

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Production

```env
REACT_APP_API_URL=https://api.englishapp.com
```

## Best Practices

1. **Always handle errors**
   ```javascript
   try {
     await axiosInstance.post('/endpoint', data);
   } catch (error) {
     console.error(error);
   }
   ```

2. **Use in custom hooks**
   ```javascript
   export function useFetch(url) {
     const [data, setData] = useState(null);
     useEffect(() => {
       axiosInstance.get(url).then(res => setData(res.data));
     }, [url]);
     return data;
   }
   ```

3. **Check token before sensitive operations**
   ```javascript
   const token = localStorage.getItem('accessToken');
   if (!token) {
     // Redirect to login
   }
   ```

4. **Log errors for debugging**
   ```javascript
   catch (error) {
     console.error('API Error:', error.response?.data);
   }
   ```

## Troubleshooting

### CORS Errors

**Problem:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:** 
- Ensure backend has CORS enabled
- Check API_URL is correct
- Backend must be running

### 401 Token Errors

**Problem:** `{"message": "Invalid token"}`

**Solution:**
- Token may be expired - login again
- Check localStorage: `localStorage.getItem('accessToken')`
- Clear and re-login: `localStorage.removeItem('accessToken')`

### Network Errors

**Problem:** `Network Error` or `Cannot read properties of undefined`

**Solution:**
- Verify backend is running on port 5000
- Check `REACT_APP_API_URL` in `.env`
- Check browser network tab for failed requests

## Migration Guide

If you were previously using direct axios calls, migrate to axiosInstance:

**Before:**
```javascript
import axios from 'axios';

const response = await axios.post('http://localhost:5000/api/auth/login', data);
```

**After:**
```javascript
import axiosInstance from '../services/axiosInstance';

const response = await axiosInstance.post('/auth/login', data);
// Token is automatically added!
```

## Support

For issues, check:
- Backend logs: `backend console output`
- Frontend console: `F12 → Console tab`
- Network requests: `F12 → Network tab`
