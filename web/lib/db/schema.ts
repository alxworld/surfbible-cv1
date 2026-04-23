import {
  pgTable, uuid, varchar, text, integer, boolean,
  timestamp, date, time, jsonb, index, unique,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

const tstz = (name: string) => timestamp(name, { withTimezone: true });

export const churches = pgTable("churches", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 200 }).notNull(),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }).notNull().default("India"),
  createdAt: tstz("created_at").notNull().default(sql`NOW()`),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  clerkUserId: varchar("clerk_user_id", { length: 100 }).unique().notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  displayName: varchar("display_name", { length: 100 }),
  churchId: uuid("church_id").references(() => churches.id, { onDelete: "set null" }),
  timezone: varchar("timezone", { length: 60 }).notNull().default("Asia/Kolkata"),
  reminderTime: time("reminder_time"),
  createdAt: tstz("created_at").notNull().default(sql`NOW()`),
});

export const plans = pgTable("plans", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(),
  totalDays: integer("total_days").notNull(),
  isPublic: boolean("is_public").notNull().default(true),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  churchId: uuid("church_id").references(() => churches.id, { onDelete: "set null" }),
  createdAt: tstz("created_at").notNull().default(sql`NOW()`),
  updatedAt: tstz("updated_at").notNull().default(sql`NOW()`),
});

export const planDays = pgTable("plan_days", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  planId: uuid("plan_id").notNull().references(() => plans.id, { onDelete: "cascade" }),
  dayNumber: integer("day_number").notNull(),
  title: varchar("title", { length: 200 }),
  passages: jsonb("passages").notNull(),
}, (t) => [
  unique().on(t.planId, t.dayNumber),
  index("idx_plan_days_plan_id").on(t.planId),
]);

export const userPlans = pgTable("user_plans", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  planId: uuid("plan_id").notNull().references(() => plans.id, { onDelete: "cascade" }),
  startedAt: tstz("started_at").notNull().default(sql`NOW()`),
  targetCompletionDate: date("target_completion_date"),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  currentDay: integer("current_day").notNull().default(1),
  streakCount: integer("streak_count").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  freezeUsedThisMonth: boolean("freeze_used_this_month").notNull().default(false),
  pausedAt: tstz("paused_at"),
  lastReadAt: tstz("last_read_at"),
  completedAt: tstz("completed_at"),
}, (t) => [
  unique().on(t.userId, t.planId),
  index("idx_user_plans_user_id").on(t.userId),
  index("idx_user_plans_status").on(t.status),
]);

export const userDayProgress = pgTable("user_day_progress", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userPlanId: uuid("user_plan_id").notNull().references(() => userPlans.id, { onDelete: "cascade" }),
  dayNumber: integer("day_number").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("completed"),
  notes: text("notes"),
  reflection: text("reflection"),
  completedAt: tstz("completed_at").notNull().default(sql`NOW()`),
}, (t) => [
  unique().on(t.userPlanId, t.dayNumber),
  index("idx_udp_user_plan_id").on(t.userPlanId),
]);

export const readingGroups = pgTable("reading_groups", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 200 }).notNull(),
  planId: uuid("plan_id").notNull().references(() => plans.id, { onDelete: "cascade" }),
  churchId: uuid("church_id").references(() => churches.id, { onDelete: "set null" }),
  createdBy: uuid("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  inviteCode: varchar("invite_code", { length: 12 }).unique().notNull(),
  createdAt: tstz("created_at").notNull().default(sql`NOW()`),
});

export const readingGroupMembers = pgTable("reading_group_members", {
  groupId: uuid("group_id").notNull().references(() => readingGroups.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).notNull().default("member"),
  joinedAt: tstz("joined_at").notNull().default(sql`NOW()`),
}, (t) => [
  unique().on(t.groupId, t.userId),
]);

export const streakFreezes = pgTable("streak_freezes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userPlanId: uuid("user_plan_id").notNull().references(() => userPlans.id, { onDelete: "cascade" }),
  freezeDate: date("freeze_date").notNull(),
  createdAt: tstz("created_at").notNull().default(sql`NOW()`),
}, (t) => [
  unique().on(t.userPlanId, t.freezeDate),
]);

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(),
  channel: varchar("channel", { length: 20 }).notNull(),
  payload: jsonb("payload"),
  scheduledAt: tstz("scheduled_at").notNull(),
  sentAt: tstz("sent_at"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
}, (t) => [
  index("idx_notifications_scheduled").on(t.scheduledAt),
]);
