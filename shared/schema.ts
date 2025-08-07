import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
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

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCalculationSchema = createInsertSchema(calculations).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCalculation = z.infer<typeof insertCalculationSchema>;
export type SelectCalculation = typeof calculations.$inferSelect;
