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
