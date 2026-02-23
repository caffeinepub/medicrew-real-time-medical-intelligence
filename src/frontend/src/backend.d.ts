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
export interface AuditLog {
    action: string;
    metadata?: string;
    performedBy: Principal;
    timestamp: bigint;
    targetUser?: Principal;
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
export interface AdminInfo {
    expiresAt?: bigint;
    name: string;
    role: UserRole;
    user: Principal;
}
export interface Device {
    status: Variant_active_inactive;
    deviceId: string;
    lastSync: bigint;
    linkedPatientId?: Principal;
}
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export interface PatientRecord {
    symptoms: Array<Symptom>;
    vitals: Array<VitalSigns>;
}
export interface RoleInfo {
    expiresAt?: bigint;
    isExpired: boolean;
    role: UserRole;
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
export interface DoctorAvailability {
    doctor: Principal;
    createdAt: Time;
    weeklyAvailability: WeeklyAvailability;
    updatedAt: Time;
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
    status: string;
    name: string;
    role: string;
    roleExpiresAt?: bigint;
    medicalRole: string;
    previousRole?: UserRole;
    systemRole: UserRole;
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
    patient = "patient",
    admin = "admin",
    doctor = "doctor",
    superAdmin = "superAdmin"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_active_inactive {
    active = "active",
    inactive = "inactive"
}
export interface backendInterface {
    addMedicalFacility(facility: MedicalFacility): Promise<void>;
    addTemporaryAdmin(targetUserId: Principal, expirationTimestamp: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    bookAppointment(request: BookingRequest): Promise<bigint>;
    checkAdminExpiration(): Promise<boolean>;
    createDevice(deviceId: string): Promise<void>;
    extendAdminExpiry(targetUserId: Principal, newExpirationTimestamp: bigint): Promise<void>;
    getAllAdmins(): Promise<Array<AdminInfo>>;
    getAllDevices(): Promise<Array<Device>>;
    getAppointments(): Promise<Array<Appointment>>;
    getAuditLogs(offset: bigint, limit: bigint): Promise<Array<AuditLog>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getDevicesByPatient(patientId: Principal): Promise<Array<Device>>;
    getDoctorAvailability(doctor: Principal): Promise<DoctorAvailability | null>;
    getDoctorProfile(doctor: Principal): Promise<DoctorProfile>;
    getMedicalFacilities(): Promise<Array<MedicalFacility>>;
    getNearbyFacilities(_latitude: number, _longitude: number, radius: number): Promise<Array<MedicalFacility>>;
    getPatientRecords(): Promise<PatientRecord | null>;
    getPatientRecordsByUser(user: Principal): Promise<PatientRecord | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserRole(): Promise<RoleInfo>;
    isActiveAdminSession(requestingUser: Principal): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    linkDeviceToPatient(deviceId: string, patientId: Principal): Promise<void>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    logSymptom(symptom: Symptom): Promise<void>;
    logVitals(vitals: VitalSigns): Promise<void>;
    promoteToAdmin(targetUserId: Principal): Promise<void>;
    registerDoctor(name: string, specialty: string): Promise<void>;
    requestAdminAccess(): Promise<void>;
    requestApproval(): Promise<void>;
    returnToDashboard(dashboard: string): Promise<boolean>;
    revokeAdmin(targetUserId: Principal): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    setDoctorAvailability(weeklyAvailability: WeeklyAvailability): Promise<void>;
    toggleDeviceStatus(deviceId: string): Promise<void>;
    unlinkDevice(deviceId: string): Promise<void>;
    updateAppointmentStatus(appointmentId: bigint, newStatus: AppointmentStatus): Promise<void>;
    verifyDoctor(doctor: Principal): Promise<void>;
}
