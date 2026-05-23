// Built by vsrupeshkumar
// Real Solana Devnet job PDAs created 2026-05-23.
// Owner wallet: ge6xBg6ScAVWyN1TK6WKk2DcPD46oemCjMcu6vXMWfX
// Program:      66DXeSqBccWxWWw9S21vxe2Mvvqqkmw5KsK5jqA42quz
// Seed key pattern: sha256("kubryx:trustmesh:job:<name>-v1")
// Re-run trustmesh-program/seed-devnet.ts to recreate (idempotent).

export const TRUSTMESH_PROGRAM_ID = "66DXeSqBccWxWWw9S21vxe2Mvvqqkmw5KsK5jqA42quz"
export const TRUSTMESH_OWNER_WALLET = "ge6xBg6ScAVWyN1TK6WKk2DcPD46oemCjMcu6vXMWfX"
export const TRUSTMESH_DEVNET_URL = "https://api.devnet.solana.com"

export const DEVNET_JOB_PDAS = [
  {
    pda: "4wMGzQYHWVMLNjkGDPeTdveqLAzQXYfZNhQseWrfyQDq",
    description: "Rebalance SOL/USDC portfolio to 60/40 target allocation",
    template: "PORTFOLIO_REBALANCER",
    budgetSol: "0.05",
    ownerSolName: "alice.sol",
  },
  {
    pda: "DNagoDZ68hmFTMoHGZHRKKbucvsUcY4RViPs9Sdcp4iJ",
    description: "Cast governance vote on Marinade DAO proposal #42",
    template: "DAO_VOTER",
    budgetSol: "0.02",
    ownerSolName: "bob.sol",
  },
  {
    pda: "J9TmfXdbkEuS85p6A6KihSBUn2WEKsCabAPArjK63GbM",
    description: "Monitor and compound USDC yield on Kamino Finance",
    template: "DATA_FETCHER",
    budgetSol: "0.08",
    ownerSolName: "carol.sol",
  },
] as const
