import hre from "hardhat";

async function main() {
  const USDC_ADDRESS = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d"; // Arbitrum Sepolia USDC
  
  console.log("Deploying Recibo contract...");
  const recibo = await hre.viem.deployContract("Recibo", [USDC_ADDRESS]);

  console.log(`Recibo deployed to: ${recibo.address}`);
  console.log(`Update NEXT_PUBLIC_CONTRACT_ADDRESS in .env.local with this address.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
