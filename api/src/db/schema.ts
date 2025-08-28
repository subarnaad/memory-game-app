import { bigint, varchar, uuid, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const userTable = pgTable('user', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name').notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password').notNull(),
  resetToken: text('resetToken'),
  resetTokenExpiry: timestamp('resetTokenExpiry'),
  nameUpdateAt: timestamp('nameUpdateAt'),
  phoneNumber: bigint({ mode: 'number' }).notNull().unique(),
  gender: varchar('gender'),
  avatar: varchar('avatar'),
});
export const blackListToken = pgTable('black-listed-token', {
  token: varchar('token').notNull().primaryKey(),
  expiry: timestamp('expiry').notNull(),
});
