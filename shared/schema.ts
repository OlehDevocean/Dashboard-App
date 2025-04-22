import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
});

// Integration table schema
export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'jira', 'google_analytics', 'atlassian', 'pingdom', etc.
  name: text("name").notNull(),
  config: jsonb("config").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertIntegrationSchema = createInsertSchema(integrations).pick({
  userId: true,
  type: true,
  name: true,
  config: true,
  isActive: true,
});

// Dashboard table schema
export const dashboards = pgTable("dashboards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDashboardSchema = createInsertSchema(dashboards).pick({
  userId: true,
  name: true,
  isDefault: true,
});

// Widget table schema
export const widgets = pgTable("widgets", {
  id: serial("id").primaryKey(),
  dashboardId: integer("dashboard_id").notNull().references(() => dashboards.id),
  integrationId: integer("integration_id").references(() => integrations.id),
  type: text("type").notNull(), // 'jira', 'google_analytics', 'atlassian', 'pingdom', 'metrics', etc.
  title: text("title").notNull(),
  config: jsonb("config").notNull(), // Widget-specific configuration
  layout: jsonb("layout").notNull(), // Position and size information
  refreshInterval: integer("refresh_interval").notNull().default(300), // Refresh interval in seconds
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWidgetSchema = createInsertSchema(widgets).pick({
  dashboardId: true,
  integrationId: true,
  type: true,
  title: true,
  config: true,
  layout: true,
  refreshInterval: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;
export type Integration = typeof integrations.$inferSelect;

export type InsertDashboard = z.infer<typeof insertDashboardSchema>;
export type Dashboard = typeof dashboards.$inferSelect;

export type InsertWidget = z.infer<typeof insertWidgetSchema>;
export type Widget = typeof widgets.$inferSelect;
