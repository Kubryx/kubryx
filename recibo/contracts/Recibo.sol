// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract Recibo is ReentrancyGuard {
    IERC20 public immutable usdc;

    error AlreadyPaid();
    error TransferFailed();
    error ZeroAddress();

    mapping(bytes32 => bool) public paid;

    event InvoicePaid(
        bytes32 indexed invoiceId,
        address indexed payer,
        address indexed freelancer,
        uint256 amount,
        uint256 timestamp
    );

    constructor(address _usdc) {
        if (_usdc == address(0)) revert ZeroAddress();
        usdc = IERC20(_usdc);
    }

    function payInvoice(
        bytes32 invoiceId,
        address freelancer,
        uint256 amount
    ) external nonReentrant {
        if (freelancer == address(0)) revert ZeroAddress();
        if (paid[invoiceId]) revert AlreadyPaid();

        paid[invoiceId] = true;

        if (!usdc.transferFrom(msg.sender, freelancer, amount)) {
            revert TransferFailed();
        }

        emit InvoicePaid(invoiceId, msg.sender, freelancer, amount, block.timestamp);
    }
}
