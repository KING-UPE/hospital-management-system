import { 
  users, doctors, patients, appointments, specializations,
  type User, type InsertUser, type Doctor, type InsertDoctor, 
  type Patient, type InsertPatient, type Appointment, type InsertAppointment,
  type Specialization, type InsertSpecialization, type UserWithRole,
  type AppointmentWithDetails, type DoctorWithUser, type PatientWithUser
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  
  // Doctors
  getDoctor(id: string): Promise<Doctor | undefined>;
  getDoctors(): Promise<DoctorWithUser[]>;
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;
  updateDoctor(id: string, updates: Partial<InsertDoctor>): Promise<Doctor | undefined>;
  
  // Patients
  getPatient(id: string): Promise<Patient | undefined>;
  getPatients(): Promise<PatientWithUser[]>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: string, updates: Partial<InsertPatient>): Promise<Patient | undefined>;
  
  // Appointments
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointments(): Promise<AppointmentWithDetails[]>;
  getAppointmentsByPatient(patientId: string): Promise<AppointmentWithDetails[]>;
  getAppointmentsByDoctor(doctorId: string): Promise<AppointmentWithDetails[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, updates: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  
  // Specializations
  getSpecializations(): Promise<Specialization[]>;
  createSpecialization(specialization: InsertSpecialization): Promise<Specialization>;
  
  // Authentication
  authenticateUser(userId: string, password: string): Promise<UserWithRole | undefined>;
  
  // ID Generation
  generateUserId(role: string): Promise<string>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private doctors: Map<string, Doctor>;
  private patients: Map<string, Patient>;
  private appointments: Map<number, Appointment>;
  private specializations: Map<number, Specialization>;
  private currentAppointmentId: number;
  private currentSpecializationId: number;
  private idCounters: Map<string, number>;

  constructor() {
    this.users = new Map();
    this.doctors = new Map();
    this.patients = new Map();
    this.appointments = new Map();
    this.specializations = new Map();
    this.currentAppointmentId = 1;
    this.currentSpecializationId = 1;
    this.idCounters = new Map([
      ['admin', 1],
      ['doctor', 1],
      ['receptionist', 1],
      ['patient', 1]
    ]);

    // Initialize with default admin user and specializations
    this.initializeDefaults();
  }

  private async initializeDefaults() {
    // Create default admin user
    const adminId = await this.generateUserId('admin');
    const admin: User = {
      id: adminId,
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@hospital.com',
      password: 'admin123', // In real app, this would be hashed
      phone: '+1-555-0100',
      address: '123 Hospital St, Medical City, MC 12345',
      role: 'admin',
      status: 'active',
      createdAt: new Date(),
    };
    this.users.set(adminId, admin);

    // Create sample doctor user
    const doctorId = await this.generateUserId('doctor');
    const doctor: User = {
      id: doctorId,
      firstName: 'Dr. John',
      lastName: 'Smith',
      email: 'doctor@hospital.com',
      password: 'doctor123',
      phone: '+1-555-0101',
      address: '456 Medical Ave, Health City, HC 12346',
      role: 'doctor',
      status: 'active',
      createdAt: new Date(),
    };
    this.users.set(doctorId, doctor);

    // Create doctor profile
    await this.createDoctor({
      userId: doctorId,
      specialization: 'cardiology',
      licenseNumber: 'MD123456',
      experience: 10,
    });

    // Create sample receptionist user
    const receptionistId = await this.generateUserId('receptionist');
    const receptionist: User = {
      id: receptionistId,
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'receptionist@hospital.com',
      password: 'receptionist123',
      phone: '+1-555-0102',
      address: '789 Front Desk Blvd, Reception City, RC 12347',
      role: 'receptionist',
      status: 'active',
      createdAt: new Date(),
    };
    this.users.set(receptionistId, receptionist);

    // Create sample patient user
    const patientId = await this.generateUserId('patient');
    const patient: User = {
      id: patientId,
      firstName: 'Michael',
      lastName: 'Brown',
      email: 'patient@hospital.com',
      password: 'patient123',
      phone: '+1-555-0103',
      address: '321 Patient Lane, Care City, CC 12348',
      role: 'patient',
      status: 'active',
      createdAt: new Date(),
    };
    this.users.set(patientId, patient);

    // Create patient profile
    await this.createPatient({
      userId: patientId,
      dateOfBirth: '1985-06-15',
      gender: 'male',
      emergencyContact: '+1-555-0199',
      bloodType: 'O+',
    });

    // Create default specializations
    const defaultSpecializations = [
      { name: 'Cardiology', description: 'Heart and cardiovascular system' },
      { name: 'Neurology', description: 'Brain and nervous system' },
      { name: 'Orthopedics', description: 'Bones, joints, and muscles' },
      { name: 'Pediatrics', description: 'Children and adolescents' },
      { name: 'Dermatology', description: 'Skin, hair, and nails' },
      { name: 'Psychiatry', description: 'Mental health and disorders' },
    ];

    for (const spec of defaultSpecializations) {
      await this.createSpecialization(spec);
    }
  }

  async generateUserId(role: string): Promise<string> {
    const prefixes = {
      admin: 'ADM',
      doctor: 'DOC',
      receptionist: 'REC',
      patient: 'PAT'
    };

    const prefix = prefixes[role as keyof typeof prefixes];
    if (!prefix) throw new Error('Invalid role');

    const counter = this.idCounters.get(role) || 1;
    const id = `${prefix}${counter.toString().padStart(4, '0')}`;
    this.idCounters.set(role, counter + 1);
    return id;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = await this.generateUserId(insertUser.role);
    const user: User = {
      ...insertUser,
      id,
      status: insertUser.status || 'active',
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getDoctor(id: string): Promise<Doctor | undefined> {
    return this.doctors.get(id);
  }

  async getDoctors(): Promise<DoctorWithUser[]> {
    const doctors: DoctorWithUser[] = [];
    for (const doctor of Array.from(this.doctors.values())) {
      const user = await this.getUser(doctor.userId);
      if (user) {
        doctors.push({ ...doctor, user });
      }
    }
    return doctors;
  }

  async createDoctor(insertDoctor: InsertDoctor): Promise<Doctor> {
    const id = insertDoctor.userId;
    const doctor: Doctor = {
      ...insertDoctor,
      id,
      experience: insertDoctor.experience || 0,
    };
    this.doctors.set(id, doctor);
    return doctor;
  }

  async updateDoctor(id: string, updates: Partial<InsertDoctor>): Promise<Doctor | undefined> {
    const doctor = this.doctors.get(id);
    if (!doctor) return undefined;

    const updatedDoctor = { ...doctor, ...updates };
    this.doctors.set(id, updatedDoctor);
    return updatedDoctor;
  }

  async getPatient(id: string): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async getPatients(): Promise<PatientWithUser[]> {
    const patients: PatientWithUser[] = [];
    for (const patient of Array.from(this.patients.values())) {
      const user = await this.getUser(patient.userId);
      if (user) {
        patients.push({ ...patient, user });
      }
    }
    return patients;
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const id = insertPatient.userId;
    const patient: Patient = {
      ...insertPatient,
      id,
      emergencyContact: insertPatient.emergencyContact || null,
      bloodType: insertPatient.bloodType || null,
    };
    this.patients.set(id, patient);
    return patient;
  }

  async updatePatient(id: string, updates: Partial<InsertPatient>): Promise<Patient | undefined> {
    const patient = this.patients.get(id);
    if (!patient) return undefined;

    const updatedPatient = { ...patient, ...updates };
    this.patients.set(id, updatedPatient);
    return updatedPatient;
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async getAppointments(): Promise<AppointmentWithDetails[]> {
    const appointments: AppointmentWithDetails[] = [];
    for (const appointment of Array.from(this.appointments.values())) {
      const patient = await this.getUser(appointment.patientId);
      const doctor = await this.getDoctor(appointment.doctorId);
      const doctorUser = doctor ? await this.getUser(doctor.userId) : undefined;

      if (patient && doctor && doctorUser) {
        appointments.push({
          ...appointment,
          patient,
          doctor: { ...doctorUser, doctorInfo: doctor }
        });
      }
    }
    return appointments;
  }

  async getAppointmentsByPatient(patientId: string): Promise<AppointmentWithDetails[]> {
    const allAppointments = await this.getAppointments();
    return allAppointments.filter(apt => apt.patientId === patientId);
  }

  async getAppointmentsByDoctor(doctorId: string): Promise<AppointmentWithDetails[]> {
    const allAppointments = await this.getAppointments();
    return allAppointments.filter(apt => apt.doctorId === doctorId);
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.currentAppointmentId++;
    const appointment: Appointment = {
      ...insertAppointment,
      id,
      status: insertAppointment.status || 'scheduled',
      type: insertAppointment.type || 'consultation',
      duration: insertAppointment.duration || 30,
      notes: insertAppointment.notes || null,
      createdAt: new Date(),
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointment(id: number, updates: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;

    const updatedAppointment = { ...appointment, ...updates };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  async getSpecializations(): Promise<Specialization[]> {
    return Array.from(this.specializations.values());
  }

  async createSpecialization(insertSpecialization: InsertSpecialization): Promise<Specialization> {
    const id = this.currentSpecializationId++;
    const specialization: Specialization = {
      ...insertSpecialization,
      id,
      description: insertSpecialization.description || null,
    };
    this.specializations.set(id, specialization);
    return specialization;
  }

  async authenticateUser(userId: string, password: string): Promise<UserWithRole | undefined> {
    const user = this.users.get(userId);
    if (!user || user.password !== password) return undefined;

    const userWithRole: UserWithRole = { ...user };

    if (user.role === 'doctor') {
      userWithRole.doctorInfo = await this.getDoctor(userId);
    } else if (user.role === 'patient') {
      userWithRole.patientInfo = await this.getPatient(userId);
    }

    return userWithRole;
  }
}

export const storage = new MemStorage();
