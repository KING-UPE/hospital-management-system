import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: text("id").primaryKey(), // ADM0001, DOC0001, etc.
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  role: text("role").notNull(), // admin, doctor, receptionist, patient
  status: text("status").notNull().default("active"), // active, inactive
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const doctors = pgTable("doctors", {
  id: text("id").primaryKey(), // DOC0001, DOC0002, etc.
  userId: text("user_id").notNull().references(() => users.id),
  specialization: text("specialization").notNull(),
  licenseNumber: text("license_number").notNull(),
  experience: integer("experience").default(0),
});

export const patients = pgTable("patients", {
  id: text("id").primaryKey(), // PAT0001, PAT0002, etc.
  userId: text("user_id").notNull().references(() => users.id),
  dateOfBirth: text("date_of_birth").notNull(),
  gender: text("gender").notNull(), // male, female, other
  emergencyContact: text("emergency_contact"),
  bloodType: text("blood_type"),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: text("patient_id").notNull().references(() => patients.id),
  doctorId: text("doctor_id").notNull().references(() => doctors.id),
  date: text("date").notNull(),
  time: text("time").notNull(),
  duration: integer("duration").default(30), // minutes
  reason: text("reason").notNull(),
  status: text("status").notNull().default("scheduled"), // scheduled, confirmed, in-progress, completed, cancelled
  type: text("type").notNull().default("consultation"), // consultation, follow-up, emergency, routine
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const specializations = pgTable("specializations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertDoctorSchema = createInsertSchema(doctors).omit({
  id: true,
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
});

export const insertSpecializationSchema = createInsertSchema(specializations).omit({
  id: true,
});

// Registration schemas
export const registerPatientSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  dateOfBirth: z.string(),
  gender: z.enum(["male", "female", "other"]),
});

export const addDoctorSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  specialization: z.string().min(2, "Specialization is required"),
  licenseNumber: z.string().min(5, "License number is required"),
  experience: z.number().min(0).default(0),
});

export const loginSchema = z.object({
  userId: z.string().min(6, "User ID is required"),
  password: z.string().min(1, "Password is required"),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Doctor = typeof doctors.$inferSelect;
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Specialization = typeof specializations.$inferSelect;
export type InsertSpecialization = z.infer<typeof insertSpecializationSchema>;

export type RegisterPatient = z.infer<typeof registerPatientSchema>;
export type AddDoctor = z.infer<typeof addDoctorSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;

// Extended types for API responses
export type UserWithRole = User & {
  doctorInfo?: Doctor;
  patientInfo?: Patient;
};

export type AppointmentWithDetails = Appointment & {
  patient: User;
  doctor: User & { doctorInfo: Doctor };
};

export type DoctorWithUser = Doctor & {
  user: User;
};

export type PatientWithUser = Patient & {
  user: User;
};

// Database relations
export const usersRelations = relations(users, ({ one }) => ({
  doctorInfo: one(doctors, {
    fields: [users.id],
    references: [doctors.userId],
  }),
  patientInfo: one(patients, {
    fields: [users.id],
    references: [patients.userId],
  }),
}));

export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  user: one(users, {
    fields: [doctors.userId],
    references: [users.id],
  }),
  appointments: many(appointments),
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  user: one(users, {
    fields: [patients.userId],
    references: [users.id],
  }),
  appointments: many(appointments),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id],
  }),
  doctor: one(doctors, {
    fields: [appointments.doctorId],
    references: [doctors.id],
  }),
}));
