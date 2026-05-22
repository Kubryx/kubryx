// Built by vsrupeshkumar
// Contract addresses + minimal human-readable ABIs for the Credit Passport
// suite, deployed on QIE Mainnet (Chain ID 1990).

export const CONTRACTS = {
  CreditPassportNFT: '0xAe6A9CaF9739C661e593979386580d3d14abB502',
  NeuroCredStaking:  '0x08DA91C81cebD27d181cA732615379f185FbFb51',
  LendingVault:      '0x36Fda9F9F17ea5c07C0CDE540B220fC0697bBcE3',
  NCRDToken:         '0x7427734468598674645Aa71Ef651218A9Db2be11',
} as const

// Only the functions Kubryx actually calls are included.

export const CREDIT_PASSPORT_ABI = [
  // getScore returns ScoreView { uint16 score; uint8 riskBand; uint64 lastUpdated }
  'function getScore(address user) view returns (uint16 score, uint8 riskBand, uint64 lastUpdated)',
  'function passportIdOf(address user) view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
] as const

export const NEUROCRED_STAKING_ABI = [
  'function stakedAmount(address user) view returns (uint256)',
  'function integrationTier(address staker) view returns (uint8)',
  'function stake(uint256 amount)',
  'function unstake(uint256 amount)',
] as const

// ⚠ NCRD TOKEN NOT DEPLOYED — the NeuroCredStaking contract points at an
// address with no contract code. All NCRD token calls (and stake/unstake,
// which call transferFrom) are mock-only until a real NCRD address exists.
export const NCRD_TOKEN_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
] as const
