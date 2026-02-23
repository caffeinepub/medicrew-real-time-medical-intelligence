import List "mo:core/List";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import UserApproval "user-approval/approval";

import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Initialize access control and user approval state
  let accessControlState = AccessControl.initState();
  let approvalState = UserApproval.initState(accessControlState);

  // Include authorization and storage mixins
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Data types
  public type UserRole = {
    #patient;
    #doctor;
    #admin;
    #superAdmin;
  };

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
    systemRole : UserRole;
    previousRole : ?UserRole;
    roleExpiresAt : ?Int;
    status : Text;
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
    dayOfWeek : Nat;
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

  public type AuditLog = {
    performedBy : Principal;
    action : Text;
    targetUser : ?Principal;
    timestamp : Int;
    metadata : ?Text;
  };

  public type Device = {
    deviceId : Text;
    linkedPatientId : ?Principal;
    status : {
      #active;
      #inactive;
    };
    lastSync : Int;
  };

  public type RoleInfo = {
    role : UserRole;
    expiresAt : ?Int;
    isExpired : Bool;
  };

  public type AdminInfo = {
    user : Principal;
    name : Text;
    role : UserRole;
    expiresAt : ?Int;
  };

  public type AdminAccessRequest = {
    timestamp : Int;
    requestingUser : Principal;
    status : {
      #pending;
      #granted;
      #denied : Text;
    };
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

  module Device {
    public func compareById(a : Device, b : Device) : Order.Order {
      Text.compare(a.deviceId, b.deviceId);
    };
  };

  // Persistent State
  let patientRecords = Map.empty<Principal, PatientRecord>();
  let doctors = Map.empty<Principal, DoctorProfile>();
  let medicalFacilities = Map.empty<Nat, MedicalFacility>();
  let appointments = Map.empty<Nat, Appointment>();
  let doctorAvailabilities = Map.empty<Principal, DoctorAvailability>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let auditLogs = Map.empty<Int, AuditLog>();
  let devices = Map.empty<Text, Device>();
  var nextAppointmentId = 1;
  var nextLogId = 1;
  var superAdminSeeded = false;
  var inAdminMode : ?AdminAccessRequest = null;

  // SuperAdmin email for seeding
  let SUPERADMIN_EMAIL = "shanmukhamanikanta.inti@gmail.com";

  // Helper Functions
  func logAuditAction(performedBy : Principal, action : Text, targetUser : ?Principal, metadata : ?Text) {
    let log : AuditLog = {
      performedBy;
      action;
      targetUser;
      timestamp = Time.now();
      metadata;
    };
    auditLogs.add(nextLogId, log);
    nextLogId += 1;
  };

  func checkAndExpireRole(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (profile.roleExpiresAt) {
          case (?expiresAt) {
            let now = Time.now();
            if (now > expiresAt) {
              // Role expired, revert to previous role
              let revertedRole = switch (profile.previousRole) {
                case (?prevRole) { prevRole };
                case (null) { #patient };
              };
              let updatedProfile = {
                profile with
                systemRole = revertedRole;
                previousRole = null;
                roleExpiresAt = null;
              };
              userProfiles.add(caller, updatedProfile);
              logAuditAction(
                caller,
                "Role Expired - Auto Reverted",
                ?caller,
                ?"Admin access expired",
              );
              return false;
            };
            return true;
          };
          case (null) { return true };
        };
      };
      case (null) { return false };
    };
  };

  func verifyRole(caller : Principal, requiredRole : UserRole) : Bool {
    if (not checkAndExpireRole(caller)) {
      return false;
    };

    switch (userProfiles.get(caller)) {
      case (?profile) {
        if (profile.systemRole == #superAdmin) { return true };
        if (profile.systemRole == requiredRole) { return true };
        if (requiredRole == #admin and profile.systemRole == #superAdmin) { return true };
        false;
      };
      case (null) { false };
    };
  };

  func isSuperAdmin(caller : Principal) : Bool {
    if (not checkAndExpireRole(caller)) {
      return false;
    };
    switch (userProfiles.get(caller)) {
      case (?profile) { profile.systemRole == #superAdmin };
      case (null) { false };
    };
  };

  func isAdminOrSuperAdmin(caller : Principal) : Bool {
    if (not checkAndExpireRole(caller)) {
      return false;
    };

    switch (userProfiles.get(caller)) {
      case (?profile) {
        profile.systemRole == #admin or profile.systemRole == #superAdmin
      };
      case (null) { false };
    };
  };

  func ensureUserProfile(caller : Principal, name : Text) {
    switch (userProfiles.get(caller)) {
      case (null) {
        // First user registration - check for SuperAdmin seeding
        if (not superAdminSeeded and name == SUPERADMIN_EMAIL) {
          let profile : UserProfile = {
            name;
            role = "SuperAdmin";
            medicalRole = "Administrator";
            systemRole = #superAdmin;
            previousRole = null;
            roleExpiresAt = null;
            status = "active";
          };
          userProfiles.add(caller, profile);
          AccessControl.assignRole(accessControlState, caller, caller, #admin);
          superAdminSeeded := true;
          logAuditAction(caller, "SuperAdmin Seeded", ?caller, ?"Initial SuperAdmin created");
        } else {
          let profile : UserProfile = {
            name;
            role = "Patient";
            medicalRole = "Patient";
            systemRole = #patient;
            previousRole = null;
            roleExpiresAt = null;
            status = "active";
          };
          userProfiles.add(caller, profile);
        };
      };
      case (?_) { /* Profile already exists */ };
    };
  };

  //-------------------------------------------
  // Admin Mode Functions - FIXED AUTHORIZATION
  //-------------------------------------------

  public shared ({ caller }) func requestAdminAccess() : async () {
    // SECURITY FIX: Allow any authenticated user to request access
    // The backend will validate and deny if unauthorized
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can request admin access");
    };

    // Validate the user's actual role
    if (not isAdminOrSuperAdmin(caller)) {
      // User is not authorized - log the attempt and deny
      logAuditAction(
        caller,
        "Admin Access Denied - Insufficient Privileges",
        ?caller,
        ?"User attempted to access admin area without proper role",
      );
      Runtime.trap("Unauthorized: You must be an admin to access the Admin View.");
    };

    // Check for existing admin access request
    let existingRequest = switch (inAdminMode) {
      case (?request) {
        if (request.requestingUser == caller) {
          ?request;
        } else { null };
      };
      case (null) { null };
    };

    switch (existingRequest) {
      case (?_request) {
        Runtime.trap("BackendError: Admin access already requested. Please return home if unauthorized.");
      };
      case (null) {
        inAdminMode := ?{
          timestamp = Time.now();
          requestingUser = caller;
          status = #granted;
        };
        logAuditAction(
          caller,
          "Admin Mode Access Granted",
          ?caller,
          ?("Admin access granted at: " # debug_show (Time.now())),
        );
      };
    };
  };

  public shared ({ caller }) func returnToDashboard(dashboard : Text) : async Bool {
    // SECURITY FIX: Validate caller is authenticated
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can return to dashboard");
    };

    // SECURITY FIX: Only allow the user who requested admin mode to clear it
    switch (inAdminMode) {
      case (?request) {
        if (request.requestingUser != caller) {
          Runtime.trap("Unauthorized: Can only clear your own admin session");
        };
      };
      case (null) {
        // No active session, but allow the call to succeed
      };
    };

    // Clear admin mode request
    inAdminMode := null;
    
    logAuditAction(
      caller,
      "Returned to Dashboard",
      ?caller,
      ?("Dashboard: " # dashboard),
    );
    
    true;
  };

  public query ({ caller }) func isActiveAdminSession(requestingUser : Principal) : async Bool {
    // SECURITY FIX: Validate caller can check session status
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check admin session status");
    };

    // SECURITY FIX: Users can only check their own session
    if (caller != requestingUser and not isAdminOrSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Can only check your own admin session");
    };

    switch (inAdminMode) {
      case (null) { false };
      case (?status) {
        if (status.requestingUser != requestingUser) {
          return false;
        };
        switch (status.status) {
          case (#pending) { true };
          case (#granted) { true };
          case (#denied(_)) { false };
        };
      };
    };
  };

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

    // SECURITY: Prevent users from modifying their own systemRole, previousRole, roleExpiresAt
    switch (userProfiles.get(caller)) {
      case (?existingProfile) {
        let updatedProfile = {
          profile with
          systemRole = existingProfile.systemRole;
          previousRole = existingProfile.previousRole;
          roleExpiresAt = existingProfile.roleExpiresAt;
        };
        userProfiles.add(caller, updatedProfile);
      };
      case (null) {
        // First time profile creation
        ensureUserProfile(caller, profile.name);
      };
    };
  };

  // Role Management Functions
  public query ({ caller }) func getUserRole() : async RoleInfo {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check their role");
    };

    ignore checkAndExpireRole(caller);

    switch (userProfiles.get(caller)) {
      case (?profile) {
        let isExpired = switch (profile.roleExpiresAt) {
          case (?expiresAt) { Time.now() > expiresAt };
          case (null) { false };
        };
        {
          role = profile.systemRole;
          expiresAt = profile.roleExpiresAt;
          isExpired;
        };
      };
      case (null) {
        {
          role = #patient;
          expiresAt = null;
          isExpired = false;
        };
      };
    };
  };

  public query ({ caller }) func getAllAdmins() : async [AdminInfo] {
    if (not isSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only SuperAdmins can view all admins");
    };

    let allProfiles = userProfiles.entries().toArray();
    let adminProfiles = allProfiles.filter(
      func((_, profile)) {
        profile.systemRole == #admin or profile.systemRole == #superAdmin
      },
    );

    adminProfiles.map<(Principal, UserProfile), AdminInfo>(
      func((user, profile)) {
        {
          user;
          name = profile.name;
          role = profile.systemRole;
          expiresAt = profile.roleExpiresAt;
        };
      },
    );
  };

  public query ({ caller }) func checkAdminExpiration() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check expiration");
    };

    ignore checkAndExpireRole(caller);
    isAdminOrSuperAdmin(caller);
  };

  public shared ({ caller }) func addTemporaryAdmin(targetUserId : Principal, expirationTimestamp : Int) : async () {
    if (not isSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only SuperAdmins can grant temporary admin access");
    };

    switch (userProfiles.get(targetUserId)) {
      case (?profile) {
        if (profile.systemRole == #superAdmin) {
          Runtime.trap("BackendError: Cannot modify SuperAdmin role");
        };

        let updatedProfile = {
          profile with
          previousRole = ?profile.systemRole;
          systemRole = #admin;
          roleExpiresAt = ?expirationTimestamp;
        };
        userProfiles.add(targetUserId, updatedProfile);
        AccessControl.assignRole(accessControlState, caller, targetUserId, #admin);
        logAuditAction(
          caller,
          "Grant Temporary Admin",
          ?targetUserId,
          ?("Expiration: " # debug_show (expirationTimestamp)),
        );
      };
      case (null) {
        Runtime.trap("BackendError: User profile not found");
      };
    };
  };

  public shared ({ caller }) func extendAdminExpiry(targetUserId : Principal, newExpirationTimestamp : Int) : async () {
    if (not isSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only SuperAdmins can extend admin access");
    };

    switch (userProfiles.get(targetUserId)) {
      case (?profile) {
        if (profile.systemRole != #admin) {
          Runtime.trap("BackendError: User is not a temporary admin");
        };

        let updatedProfile = {
          profile with
          roleExpiresAt = ?newExpirationTimestamp;
        };
        userProfiles.add(targetUserId, updatedProfile);
        logAuditAction(
          caller,
          "Extend Admin Expiry",
          ?targetUserId,
          ?("New expiration: " # debug_show (newExpirationTimestamp)),
        );
      };
      case (null) {
        Runtime.trap("BackendError: User profile not found");
      };
    };
  };

  public shared ({ caller }) func revokeAdmin(targetUserId : Principal) : async () {
    if (not isSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only SuperAdmins can revoke admin access");
    };

    switch (userProfiles.get(targetUserId)) {
      case (?profile) {
        if (profile.systemRole == #superAdmin) {
          Runtime.trap("BackendError: Cannot revoke SuperAdmin role");
        };

        let revertedRole = switch (profile.previousRole) {
          case (?prevRole) { prevRole };
          case (null) { #patient };
        };

        let updatedProfile = {
          profile with
          systemRole = revertedRole;
          previousRole = null;
          roleExpiresAt = null;
        };
        userProfiles.add(targetUserId, updatedProfile);

        if (revertedRole != #admin) {
          AccessControl.assignRole(accessControlState, caller, targetUserId, #user);
        };

        logAuditAction(caller, "Revoke Admin", ?targetUserId, null);
      };
      case (null) {
        Runtime.trap("BackendError: User profile not found");
      };
    };
  };

  public shared ({ caller }) func promoteToAdmin(targetUserId : Principal) : async () {
    if (not isSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only SuperAdmins can promote to permanent admin");
    };

    switch (userProfiles.get(targetUserId)) {
      case (?profile) {
        if (profile.systemRole == #superAdmin) {
          Runtime.trap("BackendError: User is already SuperAdmin");
        };

        let updatedProfile = {
          profile with
          systemRole = #admin;
          previousRole = null;
          roleExpiresAt = null;
        };
        userProfiles.add(targetUserId, updatedProfile);
        AccessControl.assignRole(accessControlState, caller, targetUserId, #admin);
        logAuditAction(caller, "Promote to Permanent Admin", ?targetUserId, null);
      };
      case (null) {
        Runtime.trap("BackendError: User profile not found");
      };
    };
  };

  // Audit Log Functions
  public query ({ caller }) func getAuditLogs(offset : Nat, limit : Nat) : async [AuditLog] {
    if (not isSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only SuperAdmins can view audit logs");
    };

    let allLogs = auditLogs.values().toArray();
    let sortedLogs = allLogs.sort(
      func(a, b) { Int.compare(b.timestamp, a.timestamp) },
    );

    let endIndex = Nat.min(offset + limit, sortedLogs.size());
    if (offset >= sortedLogs.size()) {
      return [];
    };

    Array.tabulate<AuditLog>(
      endIndex - offset,
      func(i) { sortedLogs[offset + i] },
    );
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
    if (not isAdminOrSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can approve users");
    };

    UserApproval.setApproval(approvalState, user, status);
    logAuditAction(
      caller,
      "Set Approval Status",
      ?user,
      ?("Status: " # debug_show (status)),
    );
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not isAdminOrSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can list approvals");
    };

    UserApproval.listApprovals(approvalState);
  };

  // Medical Records
  public shared ({ caller }) func logVitals(vitals : VitalSigns) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can log vitals");
    };

    ensureUserProfile(caller, "User");

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

    ensureUserProfile(caller, "User");

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

    // Check if caller is admin/superadmin
    if (isAdminOrSuperAdmin(caller)) {
      return patientRecords.get(user);
    };

    // Check if caller is verified doctor
    let isVerifiedDoctor = switch (doctors.get(caller)) {
      case (?profile) { profile.verified and UserApproval.isApproved(approvalState, caller) };
      case (null) { false };
    };

    if (not isVerifiedDoctor) {
      Runtime.trap("Unauthorized: Only admins and verified doctors can access other patients' data");
    };

    patientRecords.get(user);
  };

  // Doctor Registration, Verification, and Management
  public shared ({ caller }) func registerDoctor(name : Text, specialty : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register as doctors");
    };

    ensureUserProfile(caller, name);

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

    // Update user profile to doctor role
    switch (userProfiles.get(caller)) {
      case (?profile) {
        let updatedProfile = {
          profile with
          systemRole = #doctor;
          role = "Doctor";
          medicalRole = specialty;
        };
        userProfiles.add(caller, updatedProfile);
      };
      case (null) {};
    };
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
    switch (doctors.get(doctor)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("BackendError: Doctor profile not found") };
    };
  };

  public shared ({ caller }) func verifyDoctor(doctor : Principal) : async () {
    if (not isAdminOrSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can verify doctors");
    };

    switch (doctors.get(doctor)) {
      case (?profile) {
        let updatedProfile = {
          profile with verified = true;
        };
        doctors.add(doctor, updatedProfile);
        UserApproval.setApproval(approvalState, doctor, #approved);
        logAuditAction(caller, "Approve Doctor", ?doctor, null);
      };
      case (null) { Runtime.trap("BackendError: Doctor profile not found") };
    };
  };

  // Medical Facility Management
  public shared ({ caller }) func addMedicalFacility(facility : MedicalFacility) : async () {
    if (not isAdminOrSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can add medical facilities");
    };

    medicalFacilities.add(facility.id, facility);
  };

  public query ({ caller }) func getMedicalFacilities() : async [MedicalFacility] {
    medicalFacilities.values().toArray();
  };

  public query ({ caller }) func getNearbyFacilities(_latitude : Float, _longitude : Float, radius : Float) : async [MedicalFacility] {
    let allFacilities = medicalFacilities.values().toArray();
    allFacilities.filter(func(facility) { facility.distance <= radius });
  };

  // Appointment Management
  public shared ({ caller }) func bookAppointment(request : BookingRequest) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can book appointments");
    };

    ensureUserProfile(caller, "User");

    if (caller != request.patient) {
      Runtime.trap("Unauthorized: Can only book appointments for yourself");
    };

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
    doctorAvailabilities.get(doctor);
  };

  // Device Management System
  public shared ({ caller }) func createDevice(deviceId : Text) : async () {
    if (not isAdminOrSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can create devices");
    };

    let device : Device = {
      deviceId;
      linkedPatientId = null;
      status = #inactive;
      lastSync = Time.now();
    };

    devices.add(deviceId, device);
    logAuditAction(caller, "Create Device", null, ?("DeviceId: " # deviceId));
  };

  public shared ({ caller }) func linkDeviceToPatient(deviceId : Text, patientId : Principal) : async () {
    if (not isAdminOrSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can link devices");
    };

    switch (devices.get(deviceId)) {
      case (?device) {
        let updatedDevice = {
          device with
          linkedPatientId = ?patientId;
          status = #active;
          lastSync = Time.now();
        };
        devices.add(deviceId, updatedDevice);
        logAuditAction(
          caller,
          "Link Device to Patient",
          ?patientId,
          ?("DeviceId: " # deviceId),
        );
      };
      case (null) { Runtime.trap("BackendError: Device not found") };
    };
  };

  public shared ({ caller }) func unlinkDevice(deviceId : Text) : async () {
    if (not isAdminOrSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can unlink devices");
    };

    switch (devices.get(deviceId)) {
      case (?device) {
        let targetPatient = device.linkedPatientId;
        let updatedDevice = {
          device with
          linkedPatientId = null;
          status = #inactive;
          lastSync = Time.now();
        };
        devices.add(deviceId, updatedDevice);
        logAuditAction(
          caller,
          "Unlink Device",
          targetPatient,
          ?("DeviceId: " # deviceId),
        );
      };
      case (null) { Runtime.trap("BackendError: Device not found") };
    };
  };

  public shared ({ caller }) func toggleDeviceStatus(deviceId : Text) : async () {
    if (not isAdminOrSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can manage device status");
    };

    switch (devices.get(deviceId)) {
      case (?device) {
        let newStatus = switch (device.status) {
          case (#active) { #inactive };
          case (#inactive) { #active };
        };
        let updatedDevice = {
          device with
          status = newStatus;
          lastSync = Time.now();
        };
        devices.add(deviceId, updatedDevice);
        logAuditAction(
          caller,
          "Toggle Device Status",
          device.linkedPatientId,
          ?("DeviceId: " # deviceId # ", Status: " # debug_show (newStatus)),
        );
      };
      case (null) { Runtime.trap("BackendError: Device not found") };
    };
  };

  public query ({ caller }) func getAllDevices() : async [Device] {
    if (not isAdminOrSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can view devices");
    };

    devices.values().toArray();
  };

  public query ({ caller }) func getDevicesByPatient(patientId : Principal) : async [Device] {
    if (not isAdminOrSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can view patient devices");
    };

    let allDevices = devices.values().toArray();
    allDevices.filter(func(device) {
      switch (device.linkedPatientId) {
        case (null) { false };
        case (?id) { id == patientId };
      };
    });
  };
};
