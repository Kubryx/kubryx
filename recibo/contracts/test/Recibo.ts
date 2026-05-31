import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";

const INVOICE_ID = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as const;
const AMOUNT = 1_000_000n;

describe("Recibo", async function () {
  const { viem } = await network.create();
  const publicClient = await viem.getPublicClient();
  const [payer, freelancer] = await viem.getWalletClients();

  async function deployFixture() {
    const usdc = await viem.deployContract("MockERC20");
    const recibo = await viem.deployContract("Recibo", [usdc.address]);

    await usdc.write.mint([payer.account.address, AMOUNT]);
    await usdc.write.approve([recibo.address, AMOUNT], { account: payer.account });

    return { usdc, recibo };
  }

  it("payInvoice emits InvoicePaid", async function () {
    const { recibo } = await deployFixture();

    await viem.assertions.emitWithArgs(
      recibo.write.payInvoice([INVOICE_ID, freelancer.account.address, AMOUNT], {
        account: payer.account,
      }),
      recibo,
      "InvoicePaid",
      [
        INVOICE_ID,
        payer.account.address,
        freelancer.account.address,
        AMOUNT,
        (timestamp: bigint) => timestamp > 0n,
      ],
    );
  });

  it("second payInvoice for the same invoiceId reverts AlreadyPaid", async function () {
    const { recibo } = await deployFixture();

    await recibo.write.payInvoice([INVOICE_ID, freelancer.account.address, AMOUNT], {
      account: payer.account,
    });

    await viem.assertions.revertWithCustomError(
      recibo.write.payInvoice([INVOICE_ID, freelancer.account.address, AMOUNT], {
        account: payer.account,
      }),
      recibo,
      "AlreadyPaid",
    );
  });

  it("transferFrom failure reverts TransferFailed", async function () {
    const { usdc, recibo } = await deployFixture();

    await usdc.write.setFailTransfer([true]);

    await viem.assertions.revertWithCustomError(
      recibo.write.payInvoice([INVOICE_ID, freelancer.account.address, AMOUNT], {
        account: payer.account,
      }),
      recibo,
      "TransferFailed",
    );

    assert.equal(await recibo.read.paid([INVOICE_ID]), false);
  });

  it("insufficient allowance reverts TransferFailed", async function () {
    const usdc = await viem.deployContract("MockERC20");
    const recibo = await viem.deployContract("Recibo", [usdc.address]);

    await usdc.write.mint([payer.account.address, AMOUNT]);

    await viem.assertions.revertWithCustomError(
      recibo.write.payInvoice([INVOICE_ID, freelancer.account.address, AMOUNT], {
        account: payer.account,
      }),
      recibo,
      "TransferFailed",
    );

    assert.equal(await recibo.read.paid([INVOICE_ID]), false);
  });

  it("constructor reverts ZeroAddress when USDC is zero", async function () {
    await assert.rejects(
      () => viem.deployContract("Recibo", ["0x0000000000000000000000000000000000000000"]),
      (error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        return message.includes("ZeroAddress");
      },
    );
  });

  it("payInvoice reverts ZeroAddress when freelancer is zero", async function () {
    const { recibo } = await deployFixture();

    await viem.assertions.revertWithCustomError(
      recibo.write.payInvoice(
        [INVOICE_ID, "0x0000000000000000000000000000000000000000", AMOUNT],
        { account: payer.account },
      ),
      recibo,
      "ZeroAddress",
    );
  });

  it("reentrancy during transferFrom is blocked", async function () {
    const token = await viem.deployContract("ReentrantToken");
    const recibo = await viem.deployContract("Recibo", [token.address]);
    const otherInvoiceId =
      "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" as const;

    await token.write.mint([payer.account.address, AMOUNT * 2n]);
    await token.write.approve([recibo.address, AMOUNT * 2n], { account: payer.account });
    await token.write.configureReenter([
      recibo.address,
      otherInvoiceId,
      freelancer.account.address,
      AMOUNT,
    ]);

    await viem.assertions.revertWithCustomError(
      recibo.write.payInvoice([INVOICE_ID, freelancer.account.address, AMOUNT], {
        account: payer.account,
      }),
      recibo,
      "ReentrancyGuardReentrantCall",
    );

    assert.equal(await recibo.read.paid([INVOICE_ID]), false);
    assert.equal(await recibo.read.paid([otherInvoiceId]), false);
  });
});
