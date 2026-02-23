/**
 * Feature flags configuration for incremental deployment.
 * Allows enabling/disabling features for safe mode deployment strategy.
 */

export type FeatureName =
  | 'VITALS_TRACKING'
  | 'APPOINTMENTS'
  | 'HELP_DESK'
  | 'HOSPITAL_LOCATOR'
  | 'DOCTOR_DASHBOARD'
  | 'ADMIN_PANEL'
  | 'DEVICE_MONITORING';

interface FeatureFlags {
  VITALS_TRACKING: boolean;
  APPOINTMENTS: boolean;
  HELP_DESK: boolean;
  HOSPITAL_LOCATOR: boolean;
  DOCTOR_DASHBOARD: boolean;
  ADMIN_PANEL: boolean;
  DEVICE_MONITORING: boolean;
}

// Default: All features enabled for full deployment
// For safe mode, set features to false incrementally
const defaultFeatures: FeatureFlags = {
  VITALS_TRACKING: true,
  APPOINTMENTS: true,
  HELP_DESK: true,
  HOSPITAL_LOCATOR: true,
  DOCTOR_DASHBOARD: true,
  ADMIN_PANEL: true,
  DEVICE_MONITORING: true,
};

// Allow environment variable overrides for feature flags
function getFeatureFlags(): FeatureFlags {
  const features = { ...defaultFeatures };

  // Check for environment variable overrides
  Object.keys(features).forEach((key) => {
    const envKey = `VITE_FEATURE_${key}`;
    const envValue = import.meta.env[envKey];
    if (envValue !== undefined) {
      features[key as FeatureName] = envValue === 'true';
    }
  });

  return features;
}

const featureFlags = getFeatureFlags();

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: FeatureName): boolean {
  return featureFlags[feature];
}

/**
 * Get all feature flags
 */
export function getAllFeatures(): FeatureFlags {
  return { ...featureFlags };
}
