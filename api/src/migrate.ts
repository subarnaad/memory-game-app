import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const dab = process.env.DATABASE_URL;
console.log('db url', dab);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
  // ssl: {
  //   rejectUnauthorized: false,
  // },
});
pool
  .connect()
  .then(() => console.log('Connected to the database!'))
  .catch((err) => console.error('Connection failed:', err));
const db = drizzle(pool);
export { db };
