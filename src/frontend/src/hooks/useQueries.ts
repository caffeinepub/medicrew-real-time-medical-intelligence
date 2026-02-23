import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { 
  VitalSigns, 
  Symptom, 
  PatientRecord, 
  DoctorProfile,
  MedicalFacility,
  UserApprovalInfo,
  ApprovalStatus,
  UserRole
} from '../backend';
import { Principal } from '@dfinity/principal';

// User Role Queries
export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['userRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Approval Queries
export function useIsCallerApproved() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isApproved'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerApproved();
    },
    enabled: !!actor && !actorFetching,
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

  return useQuery<UserApprovalInfo[]>({
    queryKey: ['approvals'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listApprovals();
    },
    enabled: !!actor && !actorFetching,
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

// Patient Records Queries
export function useGetPatientRecords() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PatientRecord | null>({
    queryKey: ['patientRecords'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPatientRecords();
    },
    enabled: !!actor && !actorFetching,
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

// Get all verified doctors for appointment booking
export function useGetVerifiedDoctors() {
  const { actor, isFetching: actorFetching } = useActor();
  const { data: approvals } = useListApprovals();

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
  });
}
