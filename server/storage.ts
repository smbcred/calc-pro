import {
  users,
  customers,
  intakeSubmissions,
  calculations,
  type User,
  type Customer,
  type IntakeSubmission,
  type InsertUser,
  type InsertCustomer,
  type InsertIntakeSubmission,
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
  
  // Intake submission operations
  getIntakeSubmissionsByCustomer(customerId: string): Promise<IntakeSubmission[]>;
  createIntakeSubmission(submission: InsertIntakeSubmission): Promise<IntakeSubmission>;
  updateIntakeSubmissionStatus(id: string, status: string, airtableRecordId?: string): Promise<IntakeSubmission>;
  
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

  // Intake submission operations
  async getIntakeSubmissionsByCustomer(customerId: string): Promise<IntakeSubmission[]> {
    return await db.select().from(intakeSubmissions).where(eq(intakeSubmissions.customerId, customerId));
  }

  async createIntakeSubmission(submissionData: InsertIntakeSubmission): Promise<IntakeSubmission> {
    const [submission] = await db.insert(intakeSubmissions).values(submissionData).returning();
    return submission;
  }

  async updateIntakeSubmissionStatus(id: string, status: string, airtableRecordId?: string): Promise<IntakeSubmission> {
    const updateData: any = {
      submissionStatus: status,
      updatedAt: new Date(),
    };
    if (airtableRecordId) updateData.airtableRecordId = airtableRecordId;

    const [submission] = await db
      .update(intakeSubmissions)
      .set(updateData)
      .where(eq(intakeSubmissions.id, id))
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