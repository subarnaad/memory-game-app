import dotenv from 'dotenv';

dotenv.config();

const config = {
  DEV_PORT: process.env.PORT || 4000,
  DEV_HOST: process.env.HOST || 'http://localhost',
};

export default config;
