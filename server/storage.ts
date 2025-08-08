import {
  users,
  customers,
  dashboardSubmissions,
  calculations,
  type User,
  type Customer,
  type DashboardSubmission,
  type InsertUser,
  type InsertCustomer,
  type InsertDashboardSubmission,
  type InsertCalculation,
  type SelectCalculation,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Customer operations
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomerAccess(email: string, hasAccess: boolean, sessionId?: string, totalPaid?: number, selectedYears?: any): Promise<Customer>;
  
  // Dashboard submission operations
  getDashboardSubmissionsByCustomer(customerId: string): Promise<DashboardSubmission[]>;
  createDashboardSubmission(submission: InsertDashboardSubmission): Promise<DashboardSubmission>;
  updateDashboardSubmissionStatus(id: string, status: string, airtableRecordId?: string): Promise<DashboardSubmission>;
  
  // Calculation operations
  getCalculationsByEmail(email: string): Promise<SelectCalculation[]>;
  createCalculation(calculation: InsertCalculation): Promise<SelectCalculation>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  // Customer operations
  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.email, email));
    return customer;
  }

  async createCustomer(customerData: InsertCustomer): Promise<Customer> {
    const [customer] = await db.insert(customers).values(customerData).returning();
    return customer;
  }

  async updateCustomerAccess(
    email: string, 
    hasAccess: boolean, 
    sessionId?: string, 
    totalPaid?: number, 
    selectedYears?: any
  ): Promise<Customer> {
    const updateData: any = {
      hasAccess: hasAccess ? 1 : 0,
      updatedAt: new Date(),
    };
    if (sessionId) updateData.stripeSessionId = sessionId;
    if (totalPaid) updateData.totalPaid = totalPaid;
    if (selectedYears) updateData.selectedYears = selectedYears;

    const [customer] = await db
      .update(customers)
      .set(updateData)
      .where(eq(customers.email, email))
      .returning();
    return customer;
  }

  // Dashboard submission operations
  async getDashboardSubmissionsByCustomer(customerId: string): Promise<DashboardSubmission[]> {
    return await db.select().from(dashboardSubmissions).where(eq(dashboardSubmissions.customerId, customerId));
  }

  async createDashboardSubmission(submissionData: InsertDashboardSubmission): Promise<DashboardSubmission> {
    const [submission] = await db.insert(dashboardSubmissions).values(submissionData).returning();
    return submission;
  }

  async updateDashboardSubmissionStatus(id: string, status: string, airtableRecordId?: string): Promise<DashboardSubmission> {
    const updateData: any = {
      submissionStatus: status,
      updatedAt: new Date(),
    };
    if (airtableRecordId) updateData.airtableRecordId = airtableRecordId;

    const [submission] = await db
      .update(dashboardSubmissions)
      .set(updateData)
      .where(eq(dashboardSubmissions.id, id))
      .returning();
    return submission;
  }

  // Calculation operations
  async getCalculationsByEmail(email: string): Promise<SelectCalculation[]> {
    return await db.select().from(calculations).where(eq(calculations.email, email));
  }

  async createCalculation(calculationData: InsertCalculation): Promise<SelectCalculation> {
    const [calculation] = await db.insert(calculations).values(calculationData).returning();
    return calculation;
  }
}

export const storage = new DatabaseStorage();