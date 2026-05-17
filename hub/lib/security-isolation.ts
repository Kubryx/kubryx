import { logTelemetryError } from './telemetry'

export interface EnvValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

// 1. Safe Client/Server Isolation Boundary Checks
export function isClientSide(): boolean {
  return typeof window !== 'undefined'
}

// 2. Strict Client-Side Secret Leak Checks
export function validateEnvironment(): EnvValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (isClientSide()) {
    // Audit all accessible window / process keys to ensure NO raw private keys or seed words are leaked in env
    const keysToCheck = Object.keys(process.env)
    for (const key of keysToCheck) {
      const val = process.env[key]
      if (val && (
        key.toUpperCase().includes('PRIVATE') || 
        key.toUpperCase().includes('SECRET') || 
        key.toUpperCase().includes('KEY_PAIR') ||
        key.toUpperCase().includes('MNEMONIC') ||
        key.toUpperCase().includes('SEED')
      )) {
        // Raw private key strings or BIP-39 patterns
        if (val.length > 30 || val.split(' ').length >= 12) {
          errors.push(`SECURITY ALARM: Secret key parameter "${key}" is exposed on the client boundary!`)
        }
      }
    }
  }

  // 3. Centralized validation warning logs
  if (errors.length > 0) {
    logTelemetryError(
      'WALLET_ERROR',
      'Environment Audit Fail',
      `Crucial secret leaks detected: ${errors.join(', ')}`
    )
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

// 4. Runtime permission guard for secure multi-sig executions
export function checkExecutionPermission(role: string, targetChain: string): boolean {
  // Enforce zero-trust permission policies
  const allowedRoles = ['Admin', 'Treasury Manager', 'Risk Analyst', 'Operations']
  if (!allowedRoles.includes(role)) {
    logTelemetryError(
      'WALLET_ERROR',
      'Unauthorized Execution Blocked',
      `User with role "${role}" tried to submit dynamic transaction payload on chain: ${targetChain}`
    )
    return false
  }
  return true
}
