import List "mo:core/List";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import UserApproval "user-approval/approval";
import MixinAuthorization "authorization/MixinAuthorization";



actor {
  // Initialize access control and user approval state
  let accessControlState = AccessControl.initState();
  let approvalState = UserApproval.initState(accessControlState);
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public type UserRole = AccessControl.UserRole;
  public type ApprovalStatus = UserApproval.ApprovalStatus;
  public type AppointmentStatus = {
    #pending;
    #confirmed;
    #completed;
    #cancelled;
  };

  public type VitalSigns = {
    bloodPressure : Text;
    heartRate : Nat;
    temperature : Float;
    oxygenSaturation : Nat;
    timestamp : Time.Time;
  };

  public type Symptom = {
    description : Text;
    severity : Nat;
    timestamp : Time.Time;
  };

  public type PatientRecord = {
    vitals : [VitalSigns];
    symptoms : [Symptom];
  };

  public type MedicalFacility = {
    id : Nat;
    name : Text;
    address : Text;
    phone : Text;
    distance : Float;
    facilityType : Text;
    coordinates : (Float, Float);
  };

  public type DoctorProfile = {
    user : Principal;
    name : Text;
    verified : Bool;
    specialty : Text;
  };

  public type UserProfile = {
    name : Text;
    role : Text;
    medicalRole : Text;
  };

  public type Appointment = {
    id : Nat;
    patient : Principal;
    doctor : Principal;
    startTime : Time.Time;
    endTime : Time.Time;
    status : AppointmentStatus;
    description : Text;
  };

  public type BookingRequest = {
    patient : Principal;
    doctor : Principal;
    startTime : Time.Time;
    endTime : Time.Time;
    description : Text;
  };

  public type DailyAvailability = {
    dayOfWeek : Nat; // 0 = Sunday, 1 = Monday, ...
    startTime : Time.Time;
    endTime : Time.Time;
  };

  public type WeeklyAvailability = {
    monday : ?DailyAvailability;
    tuesday : ?DailyAvailability;
    wednesday : ?DailyAvailability;
    thursday : ?DailyAvailability;
    friday : ?DailyAvailability;
    saturday : ?DailyAvailability;
    sunday : ?DailyAvailability;
  };

  public type DoctorAvailability = {
    doctor : Principal;
    weeklyAvailability : WeeklyAvailability;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  module VitalSigns {
    public func compare(a : VitalSigns, b : VitalSigns) : Order.Order {
      Int.compare(a.timestamp, b.timestamp);
    };
  };

  module Symptom {
    public func compare(a : Symptom, b : Symptom) : Order.Order {
      Int.compare(a.timestamp, b.timestamp);
    };
  };

  // Persistent State
  let patientRecords = Map.empty<Principal, PatientRecord>();
  let doctors = Map.empty<Principal, DoctorProfile>();
  let medicalFacilities = Map.empty<Nat, MedicalFacility>();
  let appointments = Map.empty<Nat, Appointment>();
  var nextAppointmentId = 1;
  let doctorAvailabilities = Map.empty<Principal, DoctorAvailability>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Management (Required by instructions)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Approval System
  public query ({ caller }) func isCallerApproved() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can request approval");
    };
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : ApprovalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(approvalState);
  };

  // Medical Records
  public shared ({ caller }) func logVitals(vitals : VitalSigns) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can log vitals");
    };

    let newVitals = {
      vitals with timestamp = Time.now();
    };
    switch (patientRecords.get(caller)) {
      case (null) {
        let record : PatientRecord = {
          vitals = [newVitals];
          symptoms = [];
        };
        patientRecords.add(caller, record);
      };
      case (?record) {
        let vitalsList = List.fromArray<VitalSigns>(record.vitals);
        vitalsList.add(newVitals);
        let updatedRecord : PatientRecord = {
          record with vitals = vitalsList.toArray();
        };
        patientRecords.add(caller, updatedRecord);
      };
    };
  };

  public shared ({ caller }) func logSymptom(symptom : Symptom) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can log symptoms");
    };

    let newSymptom = {
      symptom with timestamp = Time.now();
    };
    switch (patientRecords.get(caller)) {
      case (null) {
        let record : PatientRecord = {
          vitals = [];
          symptoms = [newSymptom];
        };
        patientRecords.add(caller, record);
      };
      case (?record) {
        let symptomsList = List.fromArray<Symptom>(record.symptoms);
        symptomsList.add(newSymptom);
        let updatedRecord : PatientRecord = {
          record with symptoms = symptomsList.toArray();
        };
        patientRecords.add(caller, updatedRecord);
      };
    };
  };

  public query ({ caller }) func getPatientRecords() : async ?PatientRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their records");
    };
    switch (patientRecords.get(caller)) {
      case (null) { null };
      case (?record) {
        let sortedVitals = record.vitals.sort();
        let sortedSymptoms = record.symptoms.sort();
        ?{
          record with
          vitals = sortedVitals;
          symptoms = sortedSymptoms;
        };
      };
    };
  };

  public query ({ caller }) func getPatientRecordsByUser(user : Principal) : async ?PatientRecord {
    // Allow patients to view their own records
    if (caller == user) {
      if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
        Runtime.trap("Unauthorized: Only authenticated users can view their records");
      };
      return patientRecords.get(user);
    };

    // Allow admins and verified doctors to view patient records
    let isVerifiedDoctor = switch (doctors.get(caller)) {
      case (?profile) { profile.verified and UserApproval.isApproved(approvalState, caller) };
      case (null) { false };
    };
    
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin) or isVerifiedDoctor)) {
      Runtime.trap("Unauthorized: Only admins and verified doctors can access other patients' data");
    };
    patientRecords.get(user);
  };

  // Doctor Registration, Verification, and Management
  public shared ({ caller }) func registerDoctor(name : Text, specialty : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register as doctors");
    };

    if (not (isValidDoctorSpecialty(specialty))) {
      Runtime.trap("Invalid specialty: Doctor specializations must be approved");
    };

    let doctorProfile : DoctorProfile = {
      user = caller;
      name;
      verified = false;
      specialty;
    };

    doctors.add(caller, doctorProfile);
    UserApproval.requestApproval(approvalState, caller);
  };

  func isValidDoctorSpecialty(specialty : Text) : Bool {
    let approvedSpecialties = [
      "Cardiology",
      "Dermatology",
      "Pediatrics",
      "General Medicine",
      "Orthopedics",
      "Neurology",
      "ENT",
      "Internal Medicine",
      "Emergency Medicine",
      "General Surgery",
    ];
    approvedSpecialties.any(func(s) { Text.equal(s.trim(#char ' '), specialty.trim(#char ' ')) });
  };

  public query ({ caller }) func getDoctorProfile(doctor : Principal) : async DoctorProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view doctor profiles");
    };
    
    switch (doctors.get(doctor)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("BackendError: Doctor profile not found") };
    };
  };

  public shared ({ caller }) func verifyDoctor(doctor : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (doctors.get(doctor)) {
      case (?profile) {
        let updatedProfile = {
          profile with verified = true;
        };
        doctors.add(doctor, updatedProfile);
        UserApproval.setApproval(approvalState, doctor, #approved);
      };
      case (null) { Runtime.trap("BackendError: Doctor profile not found") };
    };
  };

  // Medical Facility Management
  public shared ({ caller }) func addMedicalFacility(facility : MedicalFacility) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    medicalFacilities.add(facility.id, facility);
  };

  public query ({ caller }) func getMedicalFacilities() : async [MedicalFacility] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view medical facilities");
    };
    medicalFacilities.values().toArray();
  };

  public query ({ caller }) func getNearbyFacilities(_latitude : Float, _longitude : Float, radius : Float) : async [MedicalFacility] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can search for nearby facilities");
    };
    let allFacilities = medicalFacilities.values().toArray();
    allFacilities.filter(func(facility) { facility.distance <= radius });
  };

  // Appointment Management
  public shared ({ caller }) func bookAppointment(request : BookingRequest) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can book appointments");
    };

    // Verify caller is the patient
    if (caller != request.patient) {
      Runtime.trap("Unauthorized: Can only book appointments for yourself");
    };

    // Verify doctor exists and is verified
    switch (doctors.get(request.doctor)) {
      case (?profile) {
        if (not profile.verified) {
          Runtime.trap("BackendError: Cannot book with unverified doctor");
        };
      };
      case (null) { Runtime.trap("BackendError: Doctor not found") };
    };

    let appointmentId = nextAppointmentId;
    nextAppointmentId += 1;

    let appointment : Appointment = {
      id = appointmentId;
      patient = request.patient;
      doctor = request.doctor;
      startTime = request.startTime;
      endTime = request.endTime;
      status = #pending;
      description = request.description;
    };

    appointments.add(appointmentId, appointment);
    appointmentId;
  };

  public query ({ caller }) func getAppointments() : async [Appointment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view appointments");
    };

    // Return appointments where caller is patient or doctor
    let allAppointments = appointments.values().toArray();
    allAppointments.filter(func(apt) {
      apt.patient == caller or apt.doctor == caller
    });
  };

  public shared ({ caller }) func updateAppointmentStatus(appointmentId : Nat, newStatus : AppointmentStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update appointments");
    };

    switch (appointments.get(appointmentId)) {
      case (?appointment) {
        // Only patient or doctor can update the appointment
        if (caller != appointment.patient and caller != appointment.doctor) {
          Runtime.trap("Unauthorized: Can only update your own appointments");
        };

        let updatedAppointment = {
          appointment with status = newStatus;
        };
        appointments.add(appointmentId, updatedAppointment);
      };
      case (null) { Runtime.trap("BackendError: Appointment not found") };
    };
  };

  // Doctor Availability Management
  public shared ({ caller }) func setDoctorAvailability(weeklyAvailability : WeeklyAvailability) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can set availability");
    };

    // Verify caller is a verified doctor
    switch (doctors.get(caller)) {
      case (?profile) {
        if (not profile.verified) {
          Runtime.trap("Unauthorized: Only verified doctors can set availability");
        };
      };
      case (null) { Runtime.trap("Unauthorized: Only doctors can set availability") };
    };

    let now = Time.now();
    let availability : DoctorAvailability = switch (doctorAvailabilities.get(caller)) {
      case (?existing) {
        {
          doctor = caller;
          weeklyAvailability;
          createdAt = existing.createdAt;
          updatedAt = now;
        };
      };
      case (null) {
        {
          doctor = caller;
          weeklyAvailability;
          createdAt = now;
          updatedAt = now;
        };
      };
    };

    doctorAvailabilities.add(caller, availability);
  };

  public query ({ caller }) func getDoctorAvailability(doctor : Principal) : async ?DoctorAvailability {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view doctor availability");
    };
    doctorAvailabilities.get(doctor);
  };
};
