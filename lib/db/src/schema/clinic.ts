import {
  boolean,
  date,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const doctorsTable = pgTable("doctors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  specialty: text("specialty").notNull(),
  initials: text("initials").notNull(),
  color: text("color").notNull(),
  active: boolean("active").notNull().default(true),
});

export const slotsTable = pgTable("appointment_slots", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id")
    .notNull()
    .references(() => doctorsTable.id),
  date: date("date", { mode: "string" }).notNull(),
  time: text("time").notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(30),
  status: text("status").notNull().default("available"),
});

export const appointmentsTable = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientName: text("patient_name").notNull(),
  patientPhone: text("patient_phone").notNull(),
  doctorId: integer("doctor_id")
    .notNull()
    .references(() => doctorsTable.id),
  slotId: integer("slot_id").references(() => slotsTable.id),
  date: date("date", { mode: "string" }).notNull(),
  time: text("time").notNull(),
  reason: text("reason"),
  status: text("status").notNull().default("booked"),
  source: text("source").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const enquiriesTable = pgTable("patient_enquiries", {
  id: serial("id").primaryKey(),
  patientName: text("patient_name").notNull(),
  phone: text("phone").notNull(),
  summary: text("summary").notNull(),
  status: text("status").notNull().default("new"),
  source: text("source").notNull(),
  appointmentId: integer("appointment_id").references(
    () => appointmentsTable.id,
  ),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type TranscriptMessage = {
  role: "patient" | "assistant";
  text: string;
};

export const voiceCallsTable = pgTable("voice_calls", {
  id: serial("id").primaryKey(),
  patientName: text("patient_name").notNull(),
  patientPhone: text("patient_phone").notNull(),
  status: text("status").notNull().default("active"),
  transcript: jsonb("transcript")
    .$type<TranscriptMessage[]>()
    .notNull()
    .default([]),
  appointmentId: integer("appointment_id").references(
    () => appointmentsTable.id,
  ),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertDoctorSchema = createInsertSchema(doctorsTable).omit({
  id: true,
});
export const insertSlotSchema = createInsertSchema(slotsTable).omit({
  id: true,
});
export const insertAppointmentSchema = createInsertSchema(
  appointmentsTable,
).omit({ id: true, createdAt: true });
export const insertEnquirySchema = createInsertSchema(enquiriesTable).omit({
  id: true,
  createdAt: true,
});
export const insertVoiceCallSchema = createInsertSchema(voiceCallsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type InsertSlot = z.infer<typeof insertSlotSchema>;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type InsertEnquiry = z.infer<typeof insertEnquirySchema>;
export type InsertVoiceCall = z.infer<typeof insertVoiceCallSchema>;
