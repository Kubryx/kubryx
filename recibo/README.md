# Recibo — ETH Mexico 2026

Recibo is a production-ready USDC invoice payment app for LATAM freelancers. 

## Onchain Proofs (Arbitrum Sepolia)
To verify our live demo, here are the three required onchain transaction hashes:

1. **Client approves USDC spend on Arbitrum Sepolia:** 
   [INSERT_HASH_1_HERE]
2. **Client pays invoice (USDC transfer):** 
   [INSERT_HASH_2_HERE]
3. **Freelancer sends USDC to Bitso deposit address:** 
   [INSERT_HASH_3_HERE]

## Tech Stack
- **Network**: Arbitrum Sepolia
- **Smart Contract**: Solidity (No admin, zero fee, pure proxy)
- **Frontend**: Next.js 14, TailwindCSS, Wagmi, viem, RainbowKit
- **AI Parser**: Anthropic Claude 3.5 Sonnet
- **Fiat Off-ramp**: Bitso API
