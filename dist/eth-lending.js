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
exports.depositIntoVault = depositIntoVault;
exports.withdrawFromVault = withdrawFromVault;
exports.updateWhiteOrBlackListLend = updateWhiteOrBlackListLend;
const ethers_1 = require("ethers");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// ====== Config ======
const RPC_URL = process.env.B_RPC_URL; // Replace with your network RPC
const PRIVATE_KEY = process.env.B_KEY; // Admin wallet private key Seller's private key
const CONTRACT_ADDRESS = ethers_1.ethers.getAddress(process.env.ESCROW_VAULT_CONTRACT_ADDRESS); // Deployed TradeEscrowVault contract
// ====== ABI (minimal) ======
const ABI = [
    "function depositToVault(address token, uint256 amount) external",
    "function withdrawFromVault(address token, uint256 amount) external",
    "function setWhitelist(address user, bool status) external",
];
// Minimal ERC20 ABI
const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function allowance(address owner, address spender) external",
    "function decimals() view returns (uint8)"
];
// ====== Provider & Wallet ======
//const wallet = new ethers.Wallet(PRIVATE_KEY!, provider);
//const contract = new ethers.Contract(CONTRACT_ADDRESS!, ABI, wallet);
// ====== Constants ======
const DECIMALS = ethers_1.ethers.parseUnits("1", 18); // For scaling rates
// ====== Main: Deposit into vault ======
function depositIntoVault(key, amount, rpcUrl, contractAddress, tokenAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        // Generate unique reference
        const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers_1.ethers.Wallet(key, provider);
        const contract = new ethers_1.ethers.Contract(contractAddress, ABI, wallet);
        const publicAddress = yield wallet.getAddress();
        console.log('amount ' + amount);
        console.log("Public address:", publicAddress);
        const usdtAddress = ethers_1.ethers.getAddress(tokenAddress); //USDT
        const usdtContract = new ethers_1.ethers.Contract(usdtAddress, ERC20_ABI, wallet);
        const decimalNo = yield usdtContract.decimals();
        console.log('decimalNo ' + decimalNo);
        const amountInt = ethers_1.ethers.parseUnits(amount, decimalNo); // scaled to 1e18
        console.log('usdt amt ' + amountInt);
        const userBalance = yield usdtContract.balanceOf(publicAddress);
        console.log("USDT user balance " + userBalance);
        console.log("USDT user balance " + ethers_1.ethers.parseUnits(userBalance.toString(), decimalNo));
        const approveTx = yield usdtContract.approve(contractAddress, amountInt);
        const tx3 = yield approveTx.wait();
        console.log(tx3);
        console.log("USDT approved to spend USDT ");
        console.log('contract address: ' + contractAddress);
        // Send transaction
        //function depositToVault(address token, uint256 amount) external
        console.log('processing...');
        const tx = yield contract.depositToVault(tokenAddress, amountInt);
        console.log(`🚀 Transaction sent: ${tx.hash}`);
        const receipt = yield tx.wait();
        console.log(`✅ Mined in block ${receipt.blockNumber}`);
        const userBalance2 = yield usdtContract.balanceOf(publicAddress);
        console.log("USDT user balance 2 " + userBalance2);
        console.log("USDT user balance 2 " + ethers_1.ethers.parseUnits(userBalance2.toString(), 18));
        console.log("USDT user balance 1 " + userBalance);
        if (userBalance2 < userBalance) {
            console.log('user balance reduce');
        }
        const txDetail = yield provider.getTransaction(tx.hash);
        console.log("Raw tx data:", txDetail.data);
        console.log(`\n🎉 Offer successfully created! Ref: `);
        const tokenContract = new ethers_1.ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const balance = yield tokenContract.balanceOf(contractAddress);
        const decimals = yield tokenContract.decimals();
        console.log('bal ' + balance + ' ' + decimals);
        const bal = ethers_1.ethers.formatUnits(balance, decimals);
        console.log(`Vault Token Balance: ${bal}`);
        return { success: true, message: txDetail, txId: tx.hash };
    });
}
// ====== Main: Withdraw into vault ======
function withdrawFromVault(key, amount, rpcUrl, contractAddress, tokenAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers_1.ethers.Wallet(key, provider);
        const contract = new ethers_1.ethers.Contract(contractAddress, ABI, wallet);
        const publicAddress = yield wallet.getAddress();
        console.log('amount ' + amount);
        console.log("Public address:", publicAddress);
        //fetch vault balance
        const vaultContract = new ethers_1.ethers.Contract(tokenAddress, ERC20_ABI, wallet);
        const balancev = yield vaultContract.balanceOf(contractAddress);
        const decimalNo = yield vaultContract.decimals();
        console.log('decimalNo ' + decimalNo);
        const vaultBal = ethers_1.ethers.parseUnits(balancev.toString(), decimalNo);
        console.log(' vault bal ' + vaultBal);
        if (vaultBal < Number(amount)) {
            return { success: false, message: 'Insufficient balance in vault ' + vaultBal, txId: '' };
        }
        const amountInt = ethers_1.ethers.parseUnits(amount, decimalNo); // scaled to 1e18
        console.log(' amt ' + amountInt);
        //fetch user balance
        const tokenContract = new ethers_1.ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const balance = yield tokenContract.balanceOf(publicAddress);
        const decimals = yield tokenContract.decimals();
        const userBal = ethers_1.ethers.parseUnits(balance.toString(), decimals);
        console.log(' user bal ' + userBal);
        console.log('contract address: ' + contractAddress);
        // Send transaction
        console.log('processing...');
        const tx = yield contract.withdrawFromVault(tokenAddress, amountInt);
        console.log(`🚀 Transaction sent: ${tx.hash}`);
        const receipt = yield tx.wait();
        console.log(`✅ Mined in block ${receipt.blockNumber}`);
        const userBalance2 = yield tokenContract.balanceOf(publicAddress);
        console.log("USDT user balance 2 " + userBalance2);
        console.log("USDT user balance 2 " + ethers_1.ethers.parseUnits(userBalance2.toString(), 18));
        console.log("USDT user balance 1 " + userBalance2);
        if (userBalance2 > balance) {
            console.log('user balance increase');
        }
        const txDetail = yield provider.getTransaction(tx.hash);
        console.log("Raw tx data:", txDetail.data);
        console.log(`\n🎉 Offer successfully created! Ref: `);
        //const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const balance3 = yield vaultContract.balanceOf(contractAddress);
        console.log('bal ' + balance3 + ' ' + decimalNo);
        const bal = ethers_1.ethers.formatUnits(balance3, decimalNo);
        console.log(`Vault Token Balance: ${bal}`);
        return { success: true, message: txDetail, txId: tx.hash };
    });
}
function updateWhiteOrBlackListLend(key, address, status, whiteOrBlack, rpcUrl, contractAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        // Send transaction
        const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers_1.ethers.Wallet(key, provider);
        const contract = new ethers_1.ethers.Contract(contractAddress, ABI, wallet);
        const publicAddress = yield wallet.getAddress();
        console.log("Public address:", publicAddress);
        console.log(`\n📦 white or black list r...` + address + ' ' + status
            + ' ' + whiteOrBlack);
        if (whiteOrBlack == 'W') {
            const tx1 = yield contract.setWhitelist(ethers_1.ethers.getAddress(address), status);
            const tx1res = tx1.wait();
            console.log(" tx1res setWhitelist " + tx1res);
            return { success: true, txId: tx1.hash, message: 'PENDING' };
        }
        else {
            const tx1 = yield contract.setBlacklist(ethers_1.ethers.getAddress(address), status);
            const tx1res = tx1.wait();
            console.log(" tx1res setBlacklist " + tx1res);
            return { success: true, txId: tx1.hash, message: 'PENDING' };
        }
    });
}
//# sourceMappingURL=eth-lending.js.map