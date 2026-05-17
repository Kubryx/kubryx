import { 
  Connection, 
  PublicKey, 
  clusterApiUrl, 
  Keypair, 
  Transaction,
  sendAndConfirmTransaction 
} from '@solana/web3.js';
import {
  getAccount,
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountIdempotentInstruction,
  getMint
} from '@solana/spl-token';

const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl('devnet');
const connection = new Connection(RPC_URL, 'confirmed');
const PUSD_MINT_ADDRESS = process.env.NEXT_PUBLIC_PUSD_MINT || "11111111111111111111111111111111";
const PUSD_MINT = new PublicKey(PUSD_MINT_ADDRESS);

export const solanaService = {
  /**
   * Get the live on-chain balance of PUSD for a given wallet
   */
  async getPUSDBalance(walletAddress: string) {
    try {
      const publicKey = new PublicKey(walletAddress);
      const ata = await getAssociatedTokenAddress(PUSD_MINT, publicKey);
      const account = await getAccount(connection, ata);
      const mintInfo = await getMint(connection, PUSD_MINT);
      
      return Number(account.amount) / Math.pow(10, mintInfo.decimals);
    } catch (error) {
      console.error('Error fetching PUSD balance:', error);
      return 0;
    }
  },

  /**
   * Get the full portfolio of SOL and SPL tokens for a wallet
   */
  async getPortfolio(walletAddress: string) {
    try {
      const publicKey = new PublicKey(walletAddress);
      
      // 1. Get SOL Balance
      const solBalance = await connection.getBalance(publicKey);
      
      // 2. Get SPL Token Accounts
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
      });

      const tokens = tokenAccounts.value.map(account => {
        const info = account.account.data.parsed.info;
        return {
          mint: info.mint,
          amount: info.tokenAmount.uiAmount,
          decimals: info.tokenAmount.decimals
        };
      }).filter(t => t.amount > 0);

      return {
        sol: solBalance / 1_000_000_000,
        tokens: tokens
      };
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      return { sol: 0, tokens: [] };
    }
  },

  /**
   * Wait for a transaction to reach a certain commitment level
   */
  async waitForConfirmation(signature: string, commitment: 'confirmed' | 'finalized' = 'confirmed') {
    const latestBlockhash = await connection.getLatestBlockhash();
    return await connection.confirmTransaction({
      signature,
      ...latestBlockhash
    }, commitment);
  },

  /**
   * Execute an on-chain payment from the Treasury to a recipient
   */
  async executePayment(recipientAddress: string, amount: number) {
    try {
      console.log(`--- Initiating On-chain Payment: ${amount} PUSD ---`);
      
      const authoritySecret = JSON.parse(process.env.PUSD_AUTHORITY_KEY!);
      const authority = Keypair.fromSecretKey(Uint8Array.from(authoritySecret));
      const recipient = new PublicKey(recipientAddress);
      
      const fromAta = await getAssociatedTokenAddress(PUSD_MINT, authority.publicKey);
      const toAta = await getAssociatedTokenAddress(PUSD_MINT, recipient);
      
      const mintInfo = await getMint(connection, PUSD_MINT);
      const amountInBaseUnits = BigInt(Math.floor(amount * Math.pow(10, mintInfo.decimals)));

      const transaction = new Transaction().add(
        createAssociatedTokenAccountIdempotentInstruction(
          authority.publicKey,
          toAta,
          recipient,
          PUSD_MINT
        ),
        createTransferInstruction(
          fromAta,
          toAta,
          authority.publicKey,
          amountInBaseUnits
        )
      );

      const signature = await sendAndConfirmTransaction(connection, transaction, [authority], {
        commitment: 'confirmed',
        preflightCommitment: 'confirmed',
      });
      
      console.log(`--- Blockchain Payment Successful: ${signature} ---`);
      
      // Trigger background finalization check
      this.waitForConfirmation(signature, 'finalized').catch(e => console.warn('Finalization check failed', e));

      return signature;
    } catch (error) {
      console.error('On-chain payment failed:', error);
      throw error;
    }
  }
};
