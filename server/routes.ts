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

  // Reports endpoint
  app.get("/api/reports", async (req, res) => {
    try {
      const appointments = await storage.getAppointments();
      const patients = await storage.getPatients();
      const doctors = await storage.getDoctors();

      // Calculate appointment statistics
      const appointmentsByStatus = appointments.reduce((acc: Record<string, number>, apt) => {
        acc[apt.status] = (acc[apt.status] || 0) + 1;
        return acc;
      }, {});

      const appointmentsByDoctor = appointments.reduce((acc: Record<string, number>, apt) => {
        const doctorName = `Dr. ${apt.doctor.firstName} ${apt.doctor.lastName}`;
        acc[doctorName] = (acc[doctorName] || 0) + 1;
        return acc;
      }, {});

      // Calculate patient demographics
      const patientsByGender = patients.reduce((acc: Record<string, number>, patient) => {
        acc[patient.gender] = (acc[patient.gender] || 0) + 1;
        return acc;
      }, {});

      // Calculate age groups
      const patientsByAge = patients.reduce((acc: Record<string, number>, patient) => {
        const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
        let ageGroup = '60+';
        if (age <= 18) ageGroup = '0-18';
        else if (age <= 35) ageGroup = '19-35';
        else if (age <= 60) ageGroup = '36-60';
        
        acc[ageGroup] = (acc[ageGroup] || 0) + 1;
        return acc;
      }, {});

      // Calculate doctor utilization
      const doctorUtilization = doctors.map(doctor => {
        const doctorAppointments = appointments.filter(apt => apt.doctorId === doctor.id);
        const completedAppointments = doctorAppointments.filter(apt => apt.status === 'completed');
        const utilizationRate = doctorAppointments.length > 0 
          ? Math.round((completedAppointments.length / doctorAppointments.length) * 100)
          : 0;

        return {
          doctorId: doctor.id,
          doctorName: `Dr. ${doctor.user.firstName} ${doctor.user.lastName}`,
          totalAppointments: doctorAppointments.length,
          completedAppointments: completedAppointments.length,
          utilizationRate
        };
      });

      const reportData = {
        totalAppointments: appointments.length,
        appointmentsByStatus,
        appointmentsByDoctor,
        appointmentsByMonth: {}, // Could be calculated based on date ranges
        patientDemographics: {
          totalPatients: patients.length,
          byGender: patientsByGender,
          byAgeGroup: patientsByAge,
        },
        doctorUtilization
      };

      res.json(reportData);
    } catch (error) {
      console.error('Error generating reports:', error);
      res.status(500).json({ error: 'Failed to generate reports' });
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
