import { ethers } from "ethers";
import { Wallet, JsonRpcProvider, Contract, keccak256, toUtf8Bytes } from "ethers";
import dotenv from 'dotenv';

dotenv.config();

// ====== Config ======
const RPC_URL = process.env.B_RPC_URL; // Replace with your network RPC
const PRIVATE_KEY = process.env.B_KEY; // Admin wallet private key
const CONTRACT_ADDRESS = process.env.ACCESS_CONTROL_CONTRACT_ADDRESS; // Deployed contract address

// ====== ABI (minimal) ======
const ABI = [
  "function grantRole(bytes32 role, address account) external",
  "function revokeRole(bytes32 role, address account) external",
  "function isAdmin(address account) public view returns (bool)"
];

// ====== Constants ======
const ADMIN_ROLE = keccak256(toUtf8Bytes("ADMIN_ROLE"));

// ====== Provider & Wallet ======
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

// ====== Functions ======

/**
 * Grant admin role to an address
 */
export async function addAdmin(address: string): Promise<void> {
  const tx = await contract.grantRole(ADMIN_ROLE, address);
  console.log(`Transaction sent: ${tx.hash}`);
  await tx.wait();
  console.log(`Admin role granted to ${address}`);
}

/**
 * Revoke admin role from an address
 */
export async function removeAdmin(address: string): Promise<void> {
  const tx = await contract.revokeRole(ADMIN_ROLE, address);
  console.log(`Transaction sent: ${tx.hash}`);
  await tx.wait();
  console.log(`Admin role revoked from ${address}`);
}

/**
 * Check if an address is an admin
 */
export async function checkIsAdmin(address: string): Promise<boolean> {
  const result: boolean = await contract.isAdmin(address);
  console.log(`${address} is admin: ${result}`);
  return result;
}
