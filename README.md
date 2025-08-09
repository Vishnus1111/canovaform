<<<<<<< HEAD
# canovaform
# 📝 canovaform

A full-stack dynamic form builder application with secure authentication, built using **React**, **Node.js**, **Express**, and **MongoDB**.

---

## 🚀 Features

- ✅ User Signup & Login (with JWT Authentication)
- 🔐 Forgot Password with OTP verification via email
- 🧩 Multi-page Form Builder Interface
- ✏️ Support for various question types:
  - Short Answer, Long Answer
  - MCQ, Checkbox, Dropdown
  - Date Picker, File Upload
  - Rating, Linear Scale
- ➕ Add and remove pages dynamically
- 👁️ Preview forms before submission
- ☁️ Backend API built with Express.js and MongoDB

---

## 🛠️ Tech Stack

### Frontend:
- React
- CSS Modules
- React Router
- React Toastify

### Backend:
- Node.js
- Express.js
- MongoDB (with Mongoose)
- SMTP (for sending OTP)


---

## 🧪 Setup & Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/Vishnus1111/canovaform.git


cd backend
npm install

npx nodemon server.js


cd ../client
npm install

npm start

PORT=5000
MONGO_URI=mongodb://localhost:27017/canovaform
=======
# Canva Form Backend API

## Overview
This is the backend API for the Canva Form application, providing authentication, form management, and email services.

## Live Deployment
- **Backend URL**: https://canovaform.onrender.com/
- **Frontend URL**: https://canovav1.vercel.app/

## Features
- User authentication (register, login, password reset)
- Form creation and management
- Response collection and analytics
- Email notifications for password reset
- CORS configuration for frontend integration

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/verify-otp` - Verify OTP for password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/test` - Test auth routes

### Forms
- `POST /api/forms/save` - Create new form
- `PUT /api/forms/update/:formId` - Update existing form
- `GET /api/forms/:link` - Get form by unique link
- `POST /api/forms/:formId/submit` - Submit form response
- `GET /api/forms/analytics/overview/:userId` - Get analytics overview
- `GET /api/forms/analytics/options/:userId` - Get option-wise analytics
- `GET /api/forms/projects/:userId` - Get all user projects

### Health Check
- `GET /api/health` - Server health check
- `GET /api/test-cors` - Test CORS configuration

## Environment Variables
Create a `.env` file in the backend directory with the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
FRONTEND_URL=https://canovav1.vercel.app
```

## Frontend Integration
The backend is configured to work with the frontend deployed at `https://canovav1.vercel.app/`. The CORS policy is set up to allow requests from:
- https://canovav1.vercel.app
- http://localhost:3000 (for development)
- http://localhost:3001 (for development)

## Password Reset Flow
1. User requests password reset via `/api/auth/forgot-password`
2. Backend generates OTP and sends email with reset link
3. Reset link points to: `https://canovav1.vercel.app/reset-password?email=...&otp=...`
4. User verifies OTP via `/api/auth/verify-otp`
5. User resets password via `/api/auth/reset-password`

## Deployment Notes
- The backend is deployed on Render.com
- MongoDB should be hosted on MongoDB Atlas for production
- Email service uses Gmail SMTP with app-specific password
- All environment variables must be set in the deployment platform

## Local Development
1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env` file with local configuration
4. Start development server: `npm run dev`

## Production Deployment
1. Set up MongoDB Atlas cluster
2. Configure environment variables on Render.com
3. Deploy using: `npm start`

## Error Handling
- All routes include proper error handling and logging
- CORS errors are logged for debugging
- Database connection errors are handled gracefully
- Email failures don't block the password reset flow
>>>>>>> edce38501117b7753ce1b3a4d6bedbd768f37d4b
