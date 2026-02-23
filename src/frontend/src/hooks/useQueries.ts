import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useVisibilityPolling } from './useVisibilityPolling';
import type { 
  VitalSigns, 
  Symptom, 
  PatientRecord, 
  DoctorProfile,
  MedicalFacility,
  UserApprovalInfo,
  ApprovalStatus,
  UserRole,
  Appointment,
  BookingRequest,
  DoctorAvailability,
  WeeklyAvailability,
  UserProfile,
  RoleInfo,
  AdminInfo,
  Device,
  AuditLog,
  Variant_active_inactive
} from '../backend';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// RBAC Role Management Queries
export function useGetUserRole() {
  const { actor, isFetching: actorFetching } = useActor();
  const pollingInterval = useVisibilityPolling(30000); // Poll every 30 seconds

  return useQuery<RoleInfo>({
    queryKey: ['userRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getUserRole();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: pollingInterval,
    staleTime: 25000, // 25 seconds
    gcTime: 60000, // 60 seconds
  });
}

export function useGetAllAdmins() {
  const { actor, isFetching: actorFetching } = useActor();
  const { data: roleInfo } = useGetUserRole();
  const pollingInterval = useVisibilityPolling(15000); // Poll every 15 seconds

  return useQuery<AdminInfo[]>({
    queryKey: ['allAdmins'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllAdmins();
    },
    enabled: !!actor && !actorFetching && roleInfo?.role === 'superAdmin',
    refetchInterval: pollingInterval,
    staleTime: 10000, // 10 seconds
  });
}

export function usePromoteToAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetUserId: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.promoteToAdmin(targetUserId);
    },
    onSuccess: () => {
      toast.success('User promoted to Admin', { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ['allAdmins'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to promote user', { duration: 5000 });
    },
  });
}

export function useGrantTemporaryAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ targetUserId, expirationTimestamp }: { targetUserId: Principal; expirationTimestamp: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addTemporaryAdmin(targetUserId, expirationTimestamp);
    },
    onSuccess: (_, { expirationTimestamp }) => {
      const days = Math.ceil(Number(expirationTimestamp - BigInt(Date.now() * 1000000)) / (24 * 60 * 60 * 1000000000));
      toast.success(`Temporary admin access granted (expires in ${days} days)`, { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ['allAdmins'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to grant temporary admin access', { duration: 5000 });
    },
  });
}

export function useExtendAdminExpiry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ targetUserId, newExpirationTimestamp }: { targetUserId: Principal; newExpirationTimestamp: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.extendAdminExpiry(targetUserId, newExpirationTimestamp);
    },
    onSuccess: (_, { newExpirationTimestamp }) => {
      const date = new Date(Number(newExpirationTimestamp) / 1000000);
      toast.success(`Admin expiry extended to ${date.toLocaleDateString()}`, { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ['allAdmins'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to extend admin expiry', { duration: 5000 });
    },
  });
}

export function useRevokeAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetUserId: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.revokeAdmin(targetUserId);
    },
    onSuccess: () => {
      toast.success('Admin access revoked', { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ['allAdmins'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to revoke admin access', { duration: 5000 });
    },
  });
}

// Device Management Queries
export function useGetAllDevices() {
  const { actor, isFetching: actorFetching } = useActor();
  const { data: roleInfo } = useGetUserRole();
  const pollingInterval = useVisibilityPolling(10000); // Poll every 10 seconds

  return useQuery<Device[]>({
    queryKey: ['allDevices'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllDevices();
    },
    enabled: !!actor && !actorFetching && (roleInfo?.role === 'admin' || roleInfo?.role === 'superAdmin'),
    refetchInterval: pollingInterval,
    staleTime: 8000, // 8 seconds
  });
}

export function useLinkDevice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ deviceId, patientId }: { deviceId: string; patientId: Principal }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.linkDeviceToPatient(deviceId, patientId);
    },
    onSuccess: (_, { patientId }) => {
      toast.success(`Device reassigned to ${patientId.toText().slice(0, 10)}...`, { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ['allDevices'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reassign device', { duration: 5000 });
    },
  });
}

export function useUnlinkDevice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deviceId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unlinkDevice(deviceId);
    },
    onSuccess: () => {
      toast.success('Device unlinked successfully', { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ['allDevices'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to unlink device', { duration: 5000 });
    },
  });
}

export function useToggleDeviceStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deviceId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleDeviceStatus(deviceId);
    },
    onSuccess: () => {
      toast.success('Device status updated', { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ['allDevices'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update device status', { duration: 5000 });
    },
  });
}

// Audit Logs Query
export function useGetAuditLogs() {
  const { actor, isFetching: actorFetching } = useActor();
  const { data: roleInfo } = useGetUserRole();

  return useQuery<AuditLog[]>({
    queryKey: ['auditLogs'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAuditLogs(BigInt(0), BigInt(1000));
    },
    enabled: !!actor && !actorFetching && roleInfo?.role === 'superAdmin',
    staleTime: Infinity, // No automatic refetch
  });
}

// Legacy queries (keep for backward compatibility)
export function useGetCallerUserRole() {
  const { data: roleInfo } = useGetUserRole();
  return useQuery<string>({
    queryKey: ['legacyUserRole', roleInfo],
    queryFn: () => {
      if (!roleInfo) return 'guest';
      return roleInfo.role;
    },
    enabled: !!roleInfo,
  });
}

export function useIsCallerAdmin() {
  const { data: roleInfo } = useGetUserRole();
  return useQuery<boolean>({
    queryKey: ['isAdmin', roleInfo],
    queryFn: () => {
      if (!roleInfo) return false;
      return roleInfo.role === 'admin' || roleInfo.role === 'superAdmin';
    },
    enabled: !!roleInfo,
  });
}

// Approval Queries with medium-priority polling (10-15 seconds)
export function useIsCallerApproved() {
  const { actor, isFetching: actorFetching } = useActor();
  const pollingInterval = useVisibilityPolling(12000); // 12 seconds

  return useQuery<boolean>({
    queryKey: ['isApproved'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerApproved();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: pollingInterval,
  });
}

export function useRequestApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestApproval();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isApproved'] });
    },
  });
}

export function useListApprovals() {
  const { actor, isFetching: actorFetching } = useActor();
  const pollingInterval = useVisibilityPolling(12000); // 12 seconds

  return useQuery<UserApprovalInfo[]>({
    queryKey: ['approvals'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listApprovals();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: pollingInterval,
  });
}

export function useSetApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, status }: { user: Principal; status: ApprovalStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setApproval(user, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
  });
}

// Patient Records Queries with high-priority polling (3-5 seconds)
export function useGetPatientRecords() {
  const { actor, isFetching: actorFetching } = useActor();
  const pollingInterval = useVisibilityPolling(4000); // 4 seconds for critical vitals

  return useQuery<PatientRecord | null>({
    queryKey: ['patientRecords'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPatientRecords();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: pollingInterval,
  });
}

export function useGetPatientRecordsByUser() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPatientRecordsByUser(user);
    },
  });
}

export function useLogVitals() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vitals: Omit<VitalSigns, 'timestamp'>) => {
      if (!actor) throw new Error('Actor not available');
      return actor.logVitals({ ...vitals, timestamp: BigInt(0) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientRecords'] });
    },
  });
}

export function useLogSymptom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (symptom: Omit<Symptom, 'timestamp'>) => {
      if (!actor) throw new Error('Actor not available');
      return actor.logSymptom({ ...symptom, timestamp: BigInt(0) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientRecords'] });
    },
  });
}

// Doctor Queries
export function useRegisterDoctor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, specialty }: { name: string; specialty: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerDoctor(name, specialty);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isApproved'] });
    },
  });
}

export function useGetDoctorProfile() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (doctor: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDoctorProfile(doctor);
    },
  });
}

export function useVerifyDoctor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (doctor: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.verifyDoctor(doctor);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
  });
}

// Medical Facilities Queries
export function useGetMedicalFacilities() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<MedicalFacility[]>({
    queryKey: ['medicalFacilities'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMedicalFacilities();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetNearbyFacilities() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ latitude, longitude, radius }: { latitude: number; longitude: number; radius: number }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.getNearbyFacilities(latitude, longitude, radius);
    },
  });
}

export function useAddMedicalFacility() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (facility: MedicalFacility) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addMedicalFacility(facility);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicalFacilities'] });
    },
  });
}

// Appointment Queries with medium-priority polling (10-15 seconds)
export function useGetAppointments() {
  const { actor, isFetching: actorFetching } = useActor();
  const pollingInterval = useVisibilityPolling(12000); // 12 seconds

  return useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAppointments();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: pollingInterval,
  });
}

export function useBookAppointment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: BookingRequest) => {
      if (!actor) throw new Error('Actor not available');
      return actor.bookAppointment(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useUpdateAppointmentStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ appointmentId, status }: { appointmentId: bigint; status: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateAppointmentStatus(appointmentId, status as any);
    },
    onSuccess: () => {
      toast.success('Appointment status updated', { duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update appointment', { duration: 5000 });
    },
  });
}

// Doctor Availability Queries with medium-priority polling
export function useGetDoctorAvailability() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (doctor: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDoctorAvailability(doctor);
    },
  });
}

export function useSetDoctorAvailability() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (weeklyAvailability: WeeklyAvailability) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setDoctorAvailability(weeklyAvailability);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctorAvailability'] });
    },
  });
}

// Get all verified doctors for appointment booking with medium-priority polling
export function useGetVerifiedDoctors() {
  const { actor, isFetching: actorFetching } = useActor();
  const { data: approvals } = useListApprovals();
  const pollingInterval = useVisibilityPolling(12000); // 12 seconds

  return useQuery<DoctorProfile[]>({
    queryKey: ['verifiedDoctors', approvals],
    queryFn: async () => {
      if (!actor || !approvals) return [];
      
      const verifiedDoctors: DoctorProfile[] = [];
      
      for (const approval of approvals) {
        if (approval.status === 'approved') {
          try {
            const profile = await actor.getDoctorProfile(approval.principal);
            if (profile.verified) {
              verifiedDoctors.push(profile);
            }
          } catch (error) {
            // User is not a doctor, skip
            continue;
          }
        }
      }
      
      return verifiedDoctors;
    },
    enabled: !!actor && !actorFetching && !!approvals,
    refetchInterval: pollingInterval,
  });
}
