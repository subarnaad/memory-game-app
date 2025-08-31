import { pgTable, uuid, varchar, bigint, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

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

export const games = pgTable('games', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('userid', { length: 36 }).notNull(),
  state: text('state').notNull(),
  moves: integer('moves').default(0).notNull(),
  score: integer('score').default(0).notNull(),
  completed: boolean('completed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
