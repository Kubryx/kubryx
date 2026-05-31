const required = [
  'ANTHROPIC_API_KEY',
  'BITSO_API_KEY', 
  'BITSO_API_SECRET',
  'NEXT_PUBLIC_CONTRACT_ADDRESS',
  'NEXT_PUBLIC_USDC_ADDRESS',
  'NEXT_PUBLIC_CHAIN_ID'
] as const;

export function validateEnv() {
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing env vars: ${missing.join(', ')}`);
  }
}

export const env = {
  anthropicKey: process.env.ANTHROPIC_API_KEY!,
  bitsoKey: process.env.BITSO_API_KEY!,
  bitsoSecret: process.env.BITSO_API_SECRET!,
  contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
  usdcAddress: process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`,
  chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID),
};
