import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Authentication users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Customer tracking for paid users
export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  hasAccess: integer("has_access").default(0), // 1 if paid, 0 if not
  stripeSessionId: text("stripe_session_id"), // Track payment session
  totalPaid: integer("total_paid").default(0),
  selectedYears: jsonb("selected_years"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Dashboard submissions tracking
export const dashboardSubmissions = pgTable("dashboard_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id).notNull(),
  formData: jsonb("form_data").notNull(),
  submissionStatus: text("submission_status").default("submitted"), // submitted, reviewed, completed
  airtableRecordId: text("airtable_record_id"), // Track Airtable record
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const calculations = pgTable("calculations", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  email: text("email").notNull(),
  companyName: text("company_name").notNull(),
  selectedYears: jsonb("selected_years").notNull(), // Array of tax years
  yearlyData: jsonb("yearly_data").notNull(), // Object with data for each year
  multiYearDiscount: integer("multi_year_discount").default(0), // Discount percentage
  totalBenefit: integer("total_benefit").notNull(), // Combined benefit across all years
  results: jsonb("results").notNull(), // Detailed breakdown per year
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schema exports for users
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Schema exports for customers
export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Schema exports for dashboard submissions
export const insertDashboardSubmissionSchema = createInsertSchema(dashboardSubmissions).omit({
  id: true,
  submittedAt: true,
  updatedAt: true,
});

// Schema exports for calculations
export const insertCalculationSchema = createInsertSchema(calculations).omit({
  id: true,
  createdAt: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertDashboardSubmission = z.infer<typeof insertDashboardSubmissionSchema>;
export type DashboardSubmission = typeof dashboardSubmissions.$inferSelect;
export type InsertCalculation = z.infer<typeof insertCalculationSchema>;
export type SelectCalculation = typeof calculations.$inferSelect;
