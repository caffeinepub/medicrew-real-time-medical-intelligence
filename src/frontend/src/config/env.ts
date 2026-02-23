/**
 * Environment configuration and validation module.
 * Validates required environment variables at startup and provides fallback mock mode.
 */

interface EnvConfig {
  canisterId: string | undefined;
  network: string;
  isMockMode: boolean;
}

function validateEnvironment(): EnvConfig {
  const canisterId = import.meta.env.VITE_CANISTER_ID_BACKEND;
  const network = import.meta.env.VITE_DFX_NETWORK || 'local';
  
  // Check if running in mock mode (missing canister ID in development)
  const isMockMode = !canisterId && network === 'local';

  if (isMockMode) {
    console.warn(
      '⚠️ MediCrew is running in MOCK MODE\n' +
      'Missing VITE_CANISTER_ID_BACKEND environment variable.\n' +
      'Some features will use simulated data for development.'
    );
  }

  return {
    canisterId,
    network,
    isMockMode,
  };
}

export const envConfig = validateEnvironment();

export const isMockMode = envConfig.isMockMode;
