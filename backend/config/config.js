const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const config = {
  // Server Configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database Configuration
  MONGO_URI: process.env.MONGO_URI,
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_jwt_secret_for_development',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '1h',
  
  // Email Configuration
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  
  // Frontend Configuration
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // CORS Configuration
  ALLOWED_ORIGINS: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://canovav1.vercel.app',
    'https://canovav1.vercel.app/',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  
  // OTP Configuration
  OTP_EXPIRE_MINUTES: 5,
  
  // Email Templates
  EMAIL_TEMPLATES: {
    PASSWORD_RESET: {
      SUBJECT: 'Password Reset Request - Canva Form',
      getBody: (otp, resetLink) => `Hello,

You requested to reset your password for your Canva Form account.

Your OTP is: ${otp}
This OTP will expire in 5 minutes.

Click the link below to reset your password:
${resetLink}

If you did not request this password reset, please ignore this email.

Best regards,
Canva Form Team`
    }
  }
};

// Validation
const validateConfig = () => {
  const required = ['MONGO_URI', 'JWT_SECRET'];
  const missing = required.filter(key => !config[key] || config[key] === 'fallback_jwt_secret_for_development');
  
  if (missing.length > 0 && config.NODE_ENV === 'production') {
    console.error('❌ Missing required environment variables:', missing);
    process.exit(1);
  }
  
  if (!config.EMAIL_USER || !config.EMAIL_PASS) {
    console.warn('⚠️ Email configuration missing. Password reset emails will not work.');
  }
};

validateConfig();

module.exports = config;
