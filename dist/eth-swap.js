"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swapPancake = swapPancake;
const ethers_1 = require("ethers");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const RPC_URL = process.env.B_RPC_URL;
const PANCAKE_ROUTER_ADDRESS = ethers_1.ethers.getAddress(process.env.PANCAKE_ROUTER_ADDRESS);
const SLIPPAGE = parseFloat(process.env.SLIPPAGE || "0.005"); // 0.5%
const provider = new ethers_1.ethers.JsonRpcProvider(RPC_URL);
// Minimal ERC20 ABI
const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)"
];
const ERC20_ABI_FULL = [
    "function deposit() payable",
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)"
];
// Quoter ABI (v3)
const quoterAbi = [
    "function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external returns (uint256 amountOut)"
];
// Router ABI (v3)
const routerAbi = [
    "function exactInputSingle((address tokenIn,address tokenOut,uint24 fee,address recipient,uint256 deadline,uint256 amountIn,uint256 amountOutMinimum,uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)"
];
const factoryAbi = [
    "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address)"
];
function swapPancake(key, amountIn, token1, token2, symbol1, symbol2) {
    return __awaiter(this, void 0, void 0, function* () {
        //symbol1: string, symbol2: string, factoryAddress: 
        console.log('PANCAKE_ROUTER_ADDRESS ' + PANCAKE_ROUTER_ADDRESS);
        const wallet = new ethers_1.ethers.Wallet(key, provider);
        const router = new ethers_1.ethers.Contract(PANCAKE_ROUTER_ADDRESS, routerAbi, wallet);
        const FACTORY_V3 = ethers_1.ethers.getAddress("0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865");
        const factory = new ethers_1.ethers.Contract(FACTORY_V3, factoryAbi, provider);
        const address1 = token1; // "0xae13d989dac2f0debff460ac112a837c89baa7cd";
        const address2 = token2; // "0x337610d27c682e347c9cd60bd4b3b107c9d34ddd";
        const fee = 500; //2500; // try 100, 500, 2500, 10000
        const pool = yield factory.getPool(address1, address2, fee);
        console.log("Pool:", pool);
        let amountInWei;
        if (symbol1 == 'WBNB' || symbol1 == 'WETH' || symbol1 == 'ETH' || symbol1 == 'BNB') {
            amountInWei = ethers_1.ethers.parseEther(amountIn);
            console.log("Wrapped: " + symbol1 + " " + amountInWei.toString());
            // 1️⃣ Native BNB balance
            const bnbBalance = yield provider.getBalance(wallet.address);
            console.log("Native " + symbol1 + " Balance:", ethers_1.ethers.formatEther(bnbBalance), symbol1);
            console.log('amount in: ' + amountInWei);
            const bnbBalance2 = yield provider.getBalance(wallet.address);
            console.log("Native Balance2 :", ethers_1.ethers.formatEther(bnbBalance2), symbol1);
        }
        else {
            // 2️⃣  ERC20 balance
            //const wbnbContract = new ethers.Contract(token1, ERC20_ABI, provider);
            const contract1 = new ethers_1.ethers.Contract(token1, ERC20_ABI_FULL, wallet);
            const balance1 = yield contract1.balanceOf(wallet.address);
            const decimals = yield contract1.decimals();
            console.log(' balance1 & Decimals  ' + balance1 + ' ' + decimals);
            amountInWei = balance1; // Number(ethers.formatUnits(balance1, decimals));
            console.log(symbol1 + ' Balance 1 : ' + amountInWei);
            const approveTx = yield contract1.approve(PANCAKE_ROUTER_ADDRESS, amountInWei);
            yield approveTx.wait();
            console.log("Router approved to spend " + symbol1);
        }
        const contract2 = new ethers_1.ethers.Contract(token2, ERC20_ABI_FULL, wallet);
        const balance2 = yield contract2.balanceOf(wallet.address);
        const decimals1 = yield contract2.decimals();
        console.log(` Balance: ${Number(ethers_1.ethers.formatUnits(balance2, decimals1))} ` + symbol2);
        const deadline = Math.floor(Date.now() / 1000) + 1200; // +20 min
        console.log("Router amount in " + amountInWei);
        // 2️⃣ Apply slippage (0.5%)
        const slippage = 0.005;
        //const minUSDT = estimatedUSDT * BigInt(Math.floor((1 - slippage) * 1e6)) / BigInt(1e6);
        const params = {
            tokenIn: token1,
            tokenOut: token2,
            fee,
            recipient: wallet.address,
            deadline,
            amountIn: amountInWei,
            amountOutMinimum: 0, // set >0 for slippage protection
            sqrtPriceLimitX96: 0 // no limit
        };
        const tx = yield router.exactInputSingle(params, { value: 0 }); //amountInWei
        console.log("Swap sent, tx hash:", tx.hash);
        const receipt = yield tx.wait();
        console.log("Swap mined, block number:", receipt.blockNumber);
        return { success: true, txId: tx.hash, message: tx };
    });
}
//# sourceMappingURL=eth-swap.js.map