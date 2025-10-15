"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAdmin = addAdmin;
exports.removeAdmin = removeAdmin;
exports.checkIsAdmin = checkIsAdmin;
const ethers_1 = require("ethers");
const ethers_2 = require("ethers");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
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
const ADMIN_ROLE = (0, ethers_2.keccak256)((0, ethers_2.toUtf8Bytes)("ADMIN_ROLE"));
// ====== Provider & Wallet ======
// ====== Functions ======
/**
 * Grant admin role to an address
 */
function addAdmin(key, rpcUrl, contractAddress, address, role) {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers_1.ethers.Wallet(key, provider);
        const contract = new ethers_1.ethers.Contract(contractAddress, ABI, wallet);
        const tx = yield contract.grantRole(ADMIN_ROLE, address);
        console.log(`Transaction sent: ${tx.hash}`);
        yield tx.wait();
        console.log(`Admin role granted to ${address}`);
    });
}
/**
 * Revoke admin role from an address
 */
function removeAdmin(key, rpcUrl, contractAddress, address) {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers_1.ethers.Wallet(key, provider);
        const contract = new ethers_1.ethers.Contract(contractAddress, ABI, wallet);
        const tx = yield contract.revokeRole(ADMIN_ROLE, address);
        console.log(`Transaction sent: ${tx.hash}`);
        yield tx.wait();
        console.log(`Admin role revoked from ${address}`);
    });
}
/**
 * Check if an address is an admin
 */
function checkIsAdmin(address, rpcUrl, contractAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        const contract = new ethers_1.ethers.Contract(contractAddress, ABI, provider);
        const result = yield contract.isAdmin(address);
        console.log(`${address} is admin: ${result}`);
        return result;
    });
}
//# sourceMappingURL=eth-access-control-client.js.map