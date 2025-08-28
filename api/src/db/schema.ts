// import { bigint, varchar, uuid, pgTable, text, timestamp, serial, integer } from 'drizzle-orm/pg-core';

// export const userTable = pgTable('user', {
//   id: uuid('id').primaryKey().defaultRandom(),
//   name: varchar('name').notNull(),
//   email: varchar('email', { length: 255 }).notNull().unique(),
//   password: varchar('password').notNull(),
//   resetToken: text('resetToken'),
//   resetTokenExpiry: timestamp('resetTokenExpiry'),
//   nameUpdateAt: timestamp('nameUpdateAt'),
//   phoneNumber: bigint({ mode: 'number' }).notNull().unique(),
//   gender: varchar('gender'),
//   avatar: varchar('avatar'),
//   failedLoginAttempts: integer('failed_login_attempts').default(0),
//   lockoutExpiry: timestamp('lockout_expiry'),
// });

import { pgTable, uuid, varchar, bigint, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const userTable = pgTable('user', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name').notNull(),
  email: varchar('email', { length: 255 }).unique(),
  phoneNumber: bigint({ mode: 'number' }).unique(),
  password: varchar('password').notNull(),
  gender: varchar('gender'),
  avatar: varchar('avatar'),
  resetToken: text('resetToken'),
  resetTokenExpiry: timestamp('resetTokenExpiry'),
});

export const loginAttemptsTable = pgTable('login_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userid').notNull(),
  attempts: integer('attempts').default(0).notNull(),
  lastAttempt: timestamp('last_attempt'),
  lockUntil: timestamp('lock_until'),
});

export const refreshTokenTable = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userid').notNull(),
  token: text('token').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const blackListToken = pgTable('blacklist_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  token: text('token').notNull(),
  expiry: timestamp('expiry').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
