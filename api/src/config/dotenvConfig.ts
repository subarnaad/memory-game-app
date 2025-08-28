import dotenv from 'dotenv';

dotenv.config();

const config = {
  DEV_PORT: process.env.PORT || 4000,
  DEV_HOST: process.env.HOST || 'http://localhost',
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads/avatars/',
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'quickconnectsecretkey',
};

export default config;
