import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

const RPC_URL = process.env.B_RPC_URL!;
const PANCAKE_ROUTER_ADDRESS = ethers.getAddress(process.env.PANCAKE_ROUTER_ADDRESS!);
const SLIPPAGE = parseFloat(process.env.SLIPPAGE || "0.005"); // 0.5%

const provider = new ethers.JsonRpcProvider(RPC_URL);

// Minimal ERC20 ABI
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

const WBNB_ABI = [
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

export async function swapPancake(key:string, amountIn: string, token1: string,
     token2: string
) {

    console.log('PANCAKE_ROUTER_ADDRESS ' + PANCAKE_ROUTER_ADDRESS)
    const wallet = new ethers.Wallet(key, provider);
    const router = new ethers.Contract(PANCAKE_ROUTER_ADDRESS, routerAbi, wallet);
    
    const FACTORY_V3 = ethers.getAddress("0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865");
    const factory = new ethers.Contract(FACTORY_V3, factoryAbi, provider);

    const WBNB = token1; // "0xae13d989dac2f0debff460ac112a837c89baa7cd";
    const USDT = token2; // "0x337610d27c682e347c9cd60bd4b3b107c9d34ddd";
    const fee = 2500; // try 100, 500, 2500, 10000

    const pool = await factory.getPool(WBNB, USDT, fee);
    console.log("Pool:", pool);


    const amountInWei = ethers.parseEther(amountIn);
    console.log("Wrapped BNB to WBNB:", amountInWei.toString());
     // 1️⃣ Native BNB balance
    const bnbBalance = await provider.getBalance(wallet.address);
    console.log("Native BNB Balance:", ethers.formatEther(bnbBalance), "BNB");

   
    //const wbnb = new ethers.Contract(token1, WBNB_ABI, wallet);

    
    console.log('amount in: ' + amountInWei);
    //const tx1 = await wbnb.deposit({ value: amountInWei });
    //await tx1.wait();

    const bnbBalance2 = await provider.getBalance(wallet.address);
    console.log("Native BNB Balance2 :", ethers.formatEther(bnbBalance2), "BNB");

    // 2️⃣ WBNB ERC20 balance
    //const wbnbContract = new ethers.Contract(token1, ERC20_ABI, provider);
    const wbnbContract = new ethers.Contract(token1, WBNB_ABI, wallet);
    const wbnbBalance = await wbnbContract.balanceOf(wallet.address);
    const decimals = await wbnbContract.decimals();

    console.log(
        `WBNB Balance: ${Number(ethers.formatUnits(wbnbBalance, decimals))} WBNB`
    );

    const usdtContract = new ethers.Contract(token2, WBNB_ABI, wallet);
    const usdtBalance = await usdtContract.balanceOf(wallet.address);
    const decimals1 = await usdtContract.decimals();

    console.log(
        `USDT Balance: ${Number(ethers.formatUnits(usdtBalance, decimals1))} USDT`
    );

    const approveTx = await wbnbContract.approve(PANCAKE_ROUTER_ADDRESS, amountInWei);
   await approveTx.wait();
   console.log("Router approved to spend WBNB");
 
    
    const deadline = Math.floor(Date.now() / 1000) + 1200; // +20 min


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

  /*
  const tx = await router.exactInputSingle(params, { value: amountInWei });
  console.log("Swap sent, tx hash:", tx.hash);

  const receipt = await tx.wait();
  console.log("Swap mined, block number:", receipt.blockNumber);
  */

  return null; //{success: true, txId: tx.hash, message: tx}
}

