// Built by vsrupeshkumar
// Seed script: creates 3 deterministic job PDAs on Solana Devnet.
// Run: npx ts-node seed-devnet.ts
// Output: seed-output.json — paste PDA addresses into hub constants.

import * as anchor from "@coral-xyz/anchor";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Keypair, PublicKey, SystemProgram, Connection } from "@solana/web3.js";

const PROGRAM_ID = new PublicKey("66DXeSqBccWxWWw9S21vxe2Mvvqqkmw5KsK5jqA42quz");
const DEVNET_URL = "https://api.devnet.solana.com";

// Fixed seeds — sha256 of constant strings so PDAs are always the same.
const JOBS = [
  {
    seedKey: "kubryx:trustmesh:job:portfolio-rebalancer-v1",
    description: "Rebalance SOL/USDC portfolio to 60/40 target allocation",
    template: 0, // PORTFOLIO_REBALANCER
    budgetSol: 0.05,
    ownerSolName: "alice.sol",
  },
  {
    seedKey: "kubryx:trustmesh:job:dao-voter-v1",
    description: "Cast governance vote on Marinade DAO proposal #42",
    template: 1, // DAO_VOTER
    budgetSol: 0.02,
    ownerSolName: "bob.sol",
  },
  {
    seedKey: "kubryx:trustmesh:job:data-fetcher-v1",
    description: "Monitor and compound USDC yield on Kamino Finance",
    template: 2, // DATA_FETCHER
    budgetSol: 0.08,
    ownerSolName: "carol.sol",
  },
];

function sha256(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

function deriveJobPda(owner: PublicKey, jobId: Buffer) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("job"), owner.toBuffer(), jobId],
    PROGRAM_ID
  );
}

function loadWallet(): Keypair {
  const walletPath =
    process.env.ANCHOR_WALLET ??
    path.join(os.homedir(), ".config", "solana", "id.json");
  const raw = JSON.parse(fs.readFileSync(walletPath, "utf8")) as number[];
  return Keypair.fromSecretKey(Uint8Array.from(raw));
}

// Use the full IDL from the project so Anchor can resolve all account/type coders.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const SEED_IDL: anchor.Idl = require("../src/idl/trustmesh.json") as anchor.Idl;

async function main() {
  const wallet = loadWallet();
  const connection = new Connection(DEVNET_URL, "confirmed");
  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(wallet),
    { commitment: "confirmed" }
  );
  anchor.setProvider(provider);

  const program = new anchor.Program(SEED_IDL, provider);
  const owner = wallet.publicKey;

  console.log(`\nOwner wallet : ${owner.toBase58()}`);
  const bal = await connection.getBalance(owner);
  console.log(`Balance      : ${(bal / 1e9).toFixed(4)} SOL`);
  console.log(`Program      : ${PROGRAM_ID.toBase58()}\n`);

  const output: Record<string, unknown>[] = [];

  for (const job of JOBS) {
    const jobId = sha256(job.seedKey);
    const descriptionHash = sha256(job.description);
    const [jobPda, bump] = deriveJobPda(owner, jobId);
    const budgetLamports = new anchor.BN(Math.floor(job.budgetSol * 1e9));

    // Check if already initialized to avoid "already in use" errors.
    const existing = await connection.getAccountInfo(jobPda);
    if (existing) {
      console.log(`✓ ALREADY EXISTS  ${job.description}`);
      console.log(`  PDA: ${jobPda.toBase58()}\n`);
      output.push({ description: job.description, pda: jobPda.toBase58(), template: job.template, bump, alreadyExisted: true });
      continue;
    }

    console.log(`→ Creating: ${job.description}`);
    try {
      const txHash = await (program.methods as any)
        .initializeJob(
          Array.from(jobId),
          Array.from(descriptionHash),
          job.template,
          budgetLamports
        )
        .accounts({
          owner,
          job: jobPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log(`  ✓ TX   : ${txHash}`);
      console.log(`  ✓ PDA  : ${jobPda.toBase58()}\n`);
      output.push({ description: job.description, pda: jobPda.toBase58(), template: job.template, bump, txHash, alreadyExisted: false });
    } catch (err: any) {
      console.error(`  ✗ FAILED: ${err.message ?? err}\n`);
      output.push({ description: job.description, pda: jobPda.toBase58(), error: String(err.message ?? err) });
    }
  }

  const outPath = path.join(__dirname, "seed-output.json");
  fs.writeFileSync(outPath, JSON.stringify({ owner: owner.toBase58(), program: PROGRAM_ID.toBase58(), jobs: output }, null, 2));
  console.log(`\nOutput saved to: ${outPath}`);
  console.log("\n── Copy these PDAs into hub/lib/trustmesh-seeds.ts ──");
  output.forEach((j: any) => {
    if (j.pda) console.log(`  ${j.pda}  // ${j.description}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
