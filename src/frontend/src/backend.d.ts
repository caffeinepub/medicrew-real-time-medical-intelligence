import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface DailyAvailability {
    startTime: Time;
    endTime: Time;
    dayOfWeek: bigint;
}
export type Time = bigint;
export interface DoctorProfile {
    verified: boolean;
    name: string;
    user: Principal;
    specialty: string;
}
export interface BookingRequest {
    startTime: Time;
    patient: Principal;
    doctor: Principal;
    endTime: Time;
    description: string;
}
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export interface PatientRecord {
    symptoms: Array<Symptom>;
    vitals: Array<VitalSigns>;
}
export interface DoctorAvailability {
    doctor: Principal;
    createdAt: Time;
    weeklyAvailability: WeeklyAvailability;
    updatedAt: Time;
}
export interface WeeklyAvailability {
    tuesday?: DailyAvailability;
    wednesday?: DailyAvailability;
    saturday?: DailyAvailability;
    thursday?: DailyAvailability;
    sunday?: DailyAvailability;
    friday?: DailyAvailability;
    monday?: DailyAvailability;
}
export interface MedicalFacility {
    id: bigint;
    name: string;
    facilityType: string;
    distance: number;
    address: string;
    phone: string;
    coordinates: [number, number];
}
export interface VitalSigns {
    temperature: number;
    bloodPressure: string;
    oxygenSaturation: bigint;
    heartRate: bigint;
    timestamp: Time;
}
export interface Appointment {
    id: bigint;
    startTime: Time;
    status: AppointmentStatus;
    patient: Principal;
    doctor: Principal;
    endTime: Time;
    description: string;
}
export interface Symptom {
    description: string;
    timestamp: Time;
    severity: bigint;
}
export interface UserProfile {
    name: string;
    role: string;
    medicalRole: string;
}
export enum AppointmentStatus {
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed",
    confirmed = "confirmed"
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMedicalFacility(facility: MedicalFacility): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bookAppointment(request: BookingRequest): Promise<bigint>;
    getAppointments(): Promise<Array<Appointment>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDoctorAvailability(doctor: Principal): Promise<DoctorAvailability | null>;
    getDoctorProfile(doctor: Principal): Promise<DoctorProfile>;
    getMedicalFacilities(): Promise<Array<MedicalFacility>>;
    getNearbyFacilities(_latitude: number, _longitude: number, radius: number): Promise<Array<MedicalFacility>>;
    getPatientRecords(): Promise<PatientRecord | null>;
    getPatientRecordsByUser(user: Principal): Promise<PatientRecord | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    logSymptom(symptom: Symptom): Promise<void>;
    logVitals(vitals: VitalSigns): Promise<void>;
    registerDoctor(name: string, specialty: string): Promise<void>;
    requestApproval(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    setDoctorAvailability(weeklyAvailability: WeeklyAvailability): Promise<void>;
    updateAppointmentStatus(appointmentId: bigint, newStatus: AppointmentStatus): Promise<void>;
    verifyDoctor(doctor: Principal): Promise<void>;
}
