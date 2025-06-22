import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  registerPatientSchema, addDoctorSchema, loginSchema, 
  insertAppointmentSchema, insertSpecializationSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { userId, password } = loginSchema.parse(req.body);
      const user = await storage.authenticateUser(userId, password);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // In a real app, you'd set up proper session management here
      res.json({ user });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid request" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const patientData = registerPatientSchema.parse(req.body);
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(patientData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Create user
      const user = await storage.createUser({
        ...patientData,
        role: 'patient',
        status: 'active'
      });

      // Create patient record
      const patient = await storage.createPatient({
        id: user.id,
        userId: user.id,
        dateOfBirth: patientData.dateOfBirth,
        gender: patientData.gender,
        emergencyContact: null,
        bloodType: null,
      });

      res.json({ user, patient });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Doctor routes
  app.get("/api/doctors", async (req, res) => {
    try {
      const doctors = await storage.getDoctors();
      res.json(doctors);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/doctors", async (req, res) => {
    try {
      const doctorData = addDoctorSchema.parse(req.body);
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(doctorData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Create user
      const user = await storage.createUser({
        firstName: doctorData.firstName,
        lastName: doctorData.lastName,
        email: doctorData.email,
        password: doctorData.password,
        phone: doctorData.phone,
        address: doctorData.address,
        role: 'doctor',
        status: 'active'
      });

      // Create doctor record
      const doctor = await storage.createDoctor({
        id: user.id,
        userId: user.id,
        specialization: doctorData.specialization,
        licenseNumber: doctorData.licenseNumber,
        experience: doctorData.experience,
      });

      res.json({ user, doctor });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create doctor" });
    }
  });

  // Patient routes
  app.get("/api/patients", async (req, res) => {
    try {
      const patients = await storage.getPatients();
      res.json(patients);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Appointment routes
  app.get("/api/appointments", async (req, res) => {
    try {
      const { patientId, doctorId } = req.query;
      
      let appointments;
      if (patientId) {
        appointments = await storage.getAppointmentsByPatient(patientId as string);
      } else if (doctorId) {
        appointments = await storage.getAppointmentsByDoctor(doctorId as string);
      } else {
        appointments = await storage.getAppointments();
      }
      
      res.json(appointments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      res.json(appointment);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create appointment" });
    }
  });

  app.patch("/api/appointments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const appointment = await storage.updateAppointment(id, updates);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.json(appointment);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update appointment" });
    }
  });

  // Specialization routes
  app.get("/api/specializations", async (req, res) => {
    try {
      const specializations = await storage.getSpecializations();
      res.json(specializations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/specializations", async (req, res) => {
    try {
      const specializationData = insertSpecializationSchema.parse(req.body);
      const specialization = await storage.createSpecialization(specializationData);
      res.json(specialization);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create specialization" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const patients = await storage.getPatients();
      const doctors = await storage.getDoctors();
      const appointments = await storage.getAppointments();
      
      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = appointments.filter(apt => apt.date === today);
      
      const stats = {
        totalPatients: patients.length,
        activeDoctors: doctors.filter(d => d.user.status === 'active').length,
        todayAppointments: todayAppointments.length,
        totalAppointments: appointments.length,
      };
      
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
