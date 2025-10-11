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
exports.createOffer = createOffer;
exports.releaseOffer = releaseOffer;
exports.markOfferPaid = markOfferPaid;
exports.getVaultTokenBalance = getVaultTokenBalance;
const ethers_1 = require("ethers");
const ethers_2 = require("ethers");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// ====== Config ======
const RPC_URL = process.env.B_RPC_URL; // Replace with your network RPC
const PRIVATE_KEY = process.env.B_KEY; // Admin wallet private key Seller's private key
const CONTRACT_ADDRESS = process.env.ESCROW_VAULT_CONTRACT_ADDRESS; // Deployed TradeEscrowVault contract
// ====== ABI (minimal) ======
const ABI = [
    "function createOffer(bytes32 ref, address counterparty, address token, bool isBuy, uint32 expiry, string fiatSymbol, uint64 fiatAmount, uint64 fiatToTokenRate) external",
    "function setWhitelist(address user, bool status) external",
    "function releaseOffer(bytes32 ref) external",
    "function markPaid(bytes32 ref) external",
    "event OfferCreated(bytes32 indexed ref, address indexed creator, address indexed counterparty, uint256 tokenAmount, address token, bool isBuy, uint32 expiry, bytes3 fiatSymbol, uint64 fiatAmount, uint64 fiatToTokenRate)"
];
// Minimal ERC20 ABI
const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function decimals() view returns (uint8)"
];
// ====== Provider & Wallet ======
const provider = new ethers_1.ethers.JsonRpcProvider(RPC_URL);
//const wallet = new ethers.Wallet(PRIVATE_KEY!, provider);
//const contract = new ethers.Contract(CONTRACT_ADDRESS!, ABI, wallet);
// ====== Constants ======
const DECIMALS = ethers_1.ethers.parseUnits("1", 18); // For scaling rates
// ====== Main: Create Offer ======
function createOffer(key_1, counterparty_1, token_1, fiatSymbol_1, fiatAmount_1, fiatToTokenRate_1) {
    return __awaiter(this, arguments, void 0, function* (key, counterparty, token, fiatSymbol, fiatAmount, fiatToTokenRate, isBuy = false, usdtAmt) {
        // Generate unique reference
        const wallet = new ethers_1.ethers.Wallet(key, provider);
        const contract = new ethers_1.ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
        const publicAddress = yield wallet.getAddress();
        console.log('fiat-amount ' + fiatAmount);
        const seed = `${wallet.address}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
        const ref = (0, ethers_2.keccak256)((0, ethers_2.toUtf8Bytes)(seed));
        const expiry = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
        //const rateScaled = ethers.toBigInt(Math.floor(fiatToTokenRate * 1e18)); // scaled to 18 decimals
        //const fiatAmountInt = BigInt(Math.floor(fiatAmount * 1e18));  
        const fiatAmountInt = ethers_1.ethers.parseUnits(fiatAmount, 18); // scaled to 1e18
        const rateScaled = ethers_1.ethers.parseUnits(fiatToTokenRate, 18); // scaled to 1e18
        const usdtAmt2 = ethers_1.ethers.parseUnits(usdtAmt, 18);
        const DECIMALS = BigInt(18);
        //let tokenAmount1 = Number(fiatAmount) * Number(fiatToTokenRate);
        //const usdtAmt = (fiatAmountInt * rateScaled) / (10n ** 18n)
        //const usdtAmt2 = ethers.formatUnits(usdtAmt, 18)
        console.log('usdt amt ' + usdtAmt + ' ' + usdtAmt2);
        //(uint256(fiatAmount) * uint256(fiatToTokenRate)) / DECIMALS;
        console.log("Public address:", publicAddress);
        console.log(`\n📦 Creating offer...`);
        console.log(`Ref: ${ref}`);
        console.log(`Counterparty: ${counterparty}`);
        console.log(`Token: ${token}`);
        console.log(`Fiat: ${fiatAmount} ${fiatSymbol} @ rate ${fiatToTokenRate}`);
        console.log(`Fiat: ${fiatAmountInt} ${fiatSymbol} @ rate ${rateScaled}`);
        const usdtAddress = ethers_1.ethers.getAddress(process.env.USDT_CONTRACT_ADDRESS);
        const usdtContract = new ethers_1.ethers.Contract(usdtAddress, ERC20_ABI, wallet);
        const approveTx = yield usdtContract.approve(CONTRACT_ADDRESS, usdtAmt2);
        yield approveTx.wait();
        console.log("USDT approved to spend USDT");
        // Send transaction
        const tx1 = yield contract.setWhitelist(counterparty, true);
        const tx2 = yield contract.setWhitelist(publicAddress, true);
        // Send transaction
        const tx = yield contract.createOffer(ref, counterparty, token, isBuy, expiry, fiatSymbol, fiatAmountInt, rateScaled);
        console.log(`🚀 Transaction sent: ${tx.hash}`);
        const receipt = yield tx.wait();
        console.log(`✅ Mined in block ${receipt.blockNumber}`);
        decodeReceipt(receipt);
        const txDetail = yield provider.getTransaction(tx.hash);
        console.log("Raw tx data:", txDetail.data);
        console.log(`\n🎉 Offer successfully created! Ref: ${ref}\n`);
        const ethBalance = yield provider.getBalance(CONTRACT_ADDRESS);
        console.log(`Vault ETH balance: ${ethers_1.ethers.formatEther(ethBalance)} ETH`);
        const tokenContract = new ethers_1.ethers.Contract(token, ERC20_ABI, provider);
        const balance = yield tokenContract.balanceOf(CONTRACT_ADDRESS);
        const decimals = yield tokenContract.decimals();
        console.log('bal ' + balance + ' ' + decimals);
        const bal = ethers_1.ethers.formatUnits(balance, decimals);
        console.log(`Vault Token Balance: ${bal}`);
        return { success: true, message: txDetail, txId: tx.hash, refNo: ref };
    });
}
// ====== Main: Release Offer ======
function releaseOffer(key, refNo) {
    return __awaiter(this, void 0, void 0, function* () {
        const wallet = new ethers_1.ethers.Wallet(key, provider);
        const contract = new ethers_1.ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
        const publicAddress = yield wallet.getAddress();
        console.log("Public address:", publicAddress);
        console.log(`\n📦 releasing offer...`);
        // Send transaction
        const tx = yield contract.releaseOffer(refNo);
        console.log(`🚀 Transaction sent: ${tx.hash}`);
        const receipt = yield tx.wait();
        console.log(`✅ Mined in block ${receipt.blockNumber}`);
        decodeData(receipt.data);
        console.log(`\n🎉 Offer successfully releas! Ref: \n`);
    });
}
// ====== Main: Release Offer ======
function markOfferPaid(key, refNo) {
    return __awaiter(this, void 0, void 0, function* () {
        const wallet = new ethers_1.ethers.Wallet(key, provider);
        const contract = new ethers_1.ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
        const publicAddress = yield wallet.getAddress();
        console.log("Public address:", publicAddress);
        console.log(`\n📦 mark paid offer...`);
        // Send transaction
        const tx = yield contract.markPaid(refNo);
        console.log(`🚀 Transaction sent: ${tx.hash}`);
        const receipt = yield tx.wait();
        console.log(`✅ Mined in block ${receipt.blockNumber}`);
        decodeData(receipt.data);
        console.log(`\n🎉 Offer successfully releas! Ref: \n`);
    });
}
function getVaultTokenBalance(token, contractAddr) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('contract addr ' + contractAddr);
        console.log('token addr ' + token);
        const ethBalance = yield provider.getBalance(CONTRACT_ADDRESS);
        console.log(`Vault ETH balance: ${ethers_1.ethers.formatEther(ethBalance)} ETH`);
        const tokenContract = new ethers_1.ethers.Contract(token, ERC20_ABI, provider);
        const balance = yield tokenContract.balanceOf(contractAddr);
        const decimals = yield tokenContract.decimals();
        console.log('bal ' + balance + ' ' + decimals);
        const bal = ethers_1.ethers.formatUnits(balance, decimals);
        console.log(`Vault Token Balance: ${bal}`);
        return { success: true, balance: bal };
    });
}
function decodeData(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const ABI = [
            "function createOffer(bytes32,address,address,bool,uint32,string,uint64,uint64)"
        ];
        const iface = new ethers_1.ethers.Interface(ABI);
        const decoded = iface.decodeFunctionData("createOffer", data);
        console.log(decoded);
    });
}
function decodeReceipt(receipt) {
    return __awaiter(this, void 0, void 0, function* () {
        const iface = new ethers_1.ethers.Interface(ABI);
        for (const log of receipt.logs) {
            try {
                const parsed = iface.parseLog(log);
                if (parsed.name === "OfferCreated") {
                    console.log("✅ OfferCreated Event:");
                    console.log({
                        ref: parsed.args.ref,
                        creator: parsed.args.creator,
                        counterparty: parsed.args.counterparty,
                        tokenAmount: parsed.args.tokenAmount.toString(),
                        token: parsed.args.token,
                        isBuy: parsed.args.isBuy,
                        expiry: parsed.args.expiry,
                        fiatSymbol: parsed.args.fiatSymbol,
                        fiatAmount: parsed.args.fiatAmount.toString(),
                        fiatToTokenRate: parsed.args.fiatToTokenRate.toString()
                    });
                }
            }
            catch (e) {
                // log didn't match ABI, ignore
            }
        }
    });
}
//# sourceMappingURL=eth-escrow-vault.js.map