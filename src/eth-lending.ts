import { ethers } from "ethers";
import { Wallet, JsonRpcProvider, Contract, keccak256, toUtf8Bytes } from "ethers";
import dotenv from 'dotenv';


dotenv.config();

// ====== Config ======
const RPC_URL = process.env.B_RPC_URL; // Replace with your network RPC
const PRIVATE_KEY = process.env.B_KEY; // Admin wallet private key Seller's private key
const CONTRACT_ADDRESS = ethers.getAddress(process.env.ESCROW_VAULT_CONTRACT_ADDRESS); // Deployed TradeEscrowVault contract

// ====== ABI (minimal) ======
const ABI = [
  "function depositToVault(address token, uint256 amount) external",
  "function withdrawFromVault(address token, uint256 amount) external",
  "function setWhitelist(address user, bool status) external",
  "function repayLoan(bytes32 ref, uint256 amount) external",
  "function disburseLoanToMerchant(bytes32 ref) external onlyCreditOfficer",
   "function createLoan(bytes32 ref,address token, address merchant, uint256 principal, uint256 fee)",
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
const DECIMALS = ethers.parseUnits("1", 18); // For scaling rates



// ====== Main: Deposit into vault ======
export async function depositIntoVault(key: string,
  amount: string,
  rpcUrl: string,
  contractAddress: string,
  tokenAddress: string
 ) {
    // Generate unique reference

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(key!, provider);
    const contract = new ethers.Contract(contractAddress!, ABI, wallet);
    const publicAddress = await wallet.getAddress();

    console.log('amount ' + amount)

    console.log("Public address:", publicAddress);
   
    const usdtAddress = ethers.getAddress(tokenAddress); //USDT
    const usdtContract = new ethers.Contract(usdtAddress, ERC20_ABI, wallet);
    const decimalNo = await usdtContract.decimals();
    console.log('decimalNo ' + decimalNo);

    const amountInt = ethers.parseUnits(amount, decimalNo); // scaled to 1e18
    console.log('usdt amt ' + amountInt);

    const userBalance = await usdtContract.balanceOf(publicAddress);
    console.log("USDT user balance " + userBalance);
    console.log("USDT user balance " + ethers.parseUnits(userBalance.toString(), decimalNo));
   
    const approveTx = await usdtContract.approve(contractAddress, amountInt);
    const tx3 = await approveTx.wait();
    console.log(tx3);
    console.log("USDT approved to spend USDT ");

    console.log('contract address: ' + contractAddress)
    
    // Send transaction
    //function depositToVault(address token, uint256 amount) external
    console.log('processing...')
    const tx = await contract.depositToVault(tokenAddress,amountInt);
       

    console.log(`🚀 Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✅ Mined in block ${receipt.blockNumber}`);
    

    const userBalance2 = await usdtContract.balanceOf(publicAddress);
    console.log("USDT user balance 2 " + userBalance2);
    console.log("USDT user balance 2 " + ethers.parseUnits(userBalance2.toString(), 18));
    console.log("USDT user balance 1 " + userBalance);
    if(userBalance2 < userBalance)
    {
         console.log('user balance reduce');
    }

     const txDetail = await provider.getTransaction(tx.hash);
    console.log("Raw tx data:", txDetail.data);
    console.log(`\n🎉 Offer successfully created! Ref: `);
   
  
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const balance: bigint = await tokenContract.balanceOf(contractAddress);
    const decimals: number = await tokenContract.decimals();
    console.log('bal ' + balance + ' ' + decimals);
    const bal = ethers.formatUnits(balance, decimals);
    console.log(`Vault Token Balance: ${bal}`);

    return {success: true, message: txDetail, txId: tx.hash  };
}

// ====== Main: Withdraw into vault ======
export async function withdrawFromVault(key: string,
  amount: string,
  rpcUrl: string,
  contractAddress: string,
  tokenAddress: string
 ) {
    

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(key!, provider);
    const contract = new ethers.Contract(contractAddress!, ABI, wallet);
    const publicAddress = await wallet.getAddress();

    console.log('amount ' + amount)

    console.log("Public address:", publicAddress);

   
    //fetch vault balance
    const vaultContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
    const balancev: bigint = await vaultContract.balanceOf(contractAddress);
    const decimalNo = await vaultContract.decimals();
    console.log('decimalNo ' + decimalNo);
    const vaultBal =  ethers.parseUnits(balancev.toString(), decimalNo);
    console.log(' vault bal ' + vaultBal);
    if(vaultBal < Number(amount))
    {
        return {success: false, message: 'Insufficient balance in vault ' + vaultBal, txId: ''  };
    }

    const amountInt = ethers.parseUnits(amount, decimalNo); // scaled to 1e18
    console.log(' amt ' + amountInt);

    //fetch user balance
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const balance: bigint = await tokenContract.balanceOf(publicAddress);
    const decimals: number = await tokenContract.decimals();
    const userBal =  ethers.parseUnits(balance.toString(), decimals);
    console.log(' user bal ' + userBal);
    console.log('contract address: ' + contractAddress)
    
    // Send transaction
     console.log('processing...')
     const tx = await contract.withdrawFromVault(tokenAddress,amountInt);
       
    console.log(`🚀 Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✅ Mined in block ${receipt.blockNumber}`);
    

    const userBalance2 = await tokenContract.balanceOf(publicAddress);
    console.log("USDT user balance 2 " + userBalance2);
    console.log("USDT user balance 2 " + ethers.parseUnits(userBalance2.toString(), 18));
    console.log("USDT user balance 1 " + userBalance2);
    if(userBalance2 > balance)
    {
         console.log('user balance increase');
    }

     const txDetail = await provider.getTransaction(tx.hash);
    console.log("Raw tx data:", txDetail.data);
    console.log(`\n🎉 Offer successfully created! Ref: `);
   
  
    //const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const balance3: bigint = await vaultContract.balanceOf(contractAddress);
    console.log('bal ' + balance3 + ' ' + decimalNo);
    const bal = ethers.formatUnits(balance3, decimalNo);
    console.log(`Vault Token Balance: ${bal}`);

    return {success: true, message: txDetail, txId: tx.hash  };
}

export async function updateWhiteOrBlackListLend(key:string,address:
     string,status: boolean, whiteOrBlack: string, rpcUrl: string, contractAddress: string) {

     // Send transaction

     const provider = new ethers.JsonRpcProvider(rpcUrl);
     const wallet = new ethers.Wallet(key!, provider);
    const contract = new ethers.Contract(contractAddress!, ABI, wallet);
    const publicAddress = await wallet.getAddress();

    console.log("Public address:", publicAddress);
    console.log(`\n📦 white or black list r...` + address + ' ' + status 
        + ' ' + whiteOrBlack);
    if(whiteOrBlack == 'W')
    {
        const tx1 = await contract.setWhitelist(ethers.getAddress(address),status);
        const tx1res = tx1.wait();
        console.log(" tx1res setWhitelist " + tx1res);
        return {success:true, txId: tx1.hash, message: 'PENDING'};
    }
    else
    {
        const tx1 = await contract.setBlacklist(ethers.getAddress(address),status);
        const tx1res = tx1.wait();
        console.log(" tx1res setBlacklist " + tx1res);
        return {success:true, txId: tx1.hash, message: 'PENDING'};
    }
  
}


// ====== Main: Deposit into vault ======
//"function createLoan(bytes32 ref,address token, address merchant, uint256 principal, uint256 fee)",
export async function createLoan(key: string,
  amount: string,
  rpcUrl: string,
  contractAddress: string,
  tokenAddress: string,
  refx: string,
  merchantAddress: string,
  fee: string,
 ) {
    // Generate unique reference

    const ref = keccak256(toUtf8Bytes(refx));
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(key!, provider);
    const contract = new ethers.Contract(contractAddress!, ABI, wallet);
    const publicAddress = await wallet.getAddress();

    console.log('amount ' + amount + " ref " + ref)

    console.log("Public address:", publicAddress);
   
    const tokenContractAddress = ethers.getAddress(tokenAddress); //USDT or USDC
    const tokenContract1 = new ethers.Contract(tokenContractAddress, ERC20_ABI, wallet);
    const decimalNo = await tokenContract1.decimals();
    const userBalance = await tokenContract1.balanceOf(publicAddress);
    const userBal = ethers.formatUnits(userBalance, decimalNo);
    console.log('decimalNo ' + decimalNo);
    console.log(" user balance " + userBalance);
    console.log(" user balance " + userBal);

    const amountInt = ethers.parseUnits(amount, decimalNo); // scaled to 1e18
    const feeInt = ethers.parseUnits(fee, decimalNo); 
    console.log('amt to send ' + amountInt);
    
    console.log(" user balance " + ethers.parseUnits(userBalance.toString(), decimalNo));
   
    const approveTx = await tokenContract1.approve(contractAddress, amountInt);
    const tx3 = await approveTx.wait();
    console.log(tx3);
    console.log(" approved to spend contract coin ");

    console.log('contract address: ' + contractAddress)
    
    // Send transaction
      console.log('processing...')
      //function createLoan(bytes32 ref,address token, address merchant, uint256 principal, uint256 fee)
    const tx = await contract.createLoan(ref,tokenAddress,merchantAddress,
       amountInt, feeInt);
       

    console.log(`🚀 Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✅ Mined in block ${receipt.blockNumber}`);
    

    const userBalance2 = await tokenContract1.balanceOf(publicAddress);
    console.log("USDT user balance 2 " + userBalance2);
    console.log("USDT user balance 2 " + ethers.parseUnits(userBalance2.toString(), 18));
    console.log("USDT user balance 1 " + userBalance);
    if(userBalance2 < userBalance)
    {
         console.log('user balance reduce');
    }

     const txDetail = await provider.getTransaction(tx.hash);
    console.log("Raw tx data:", txDetail.data);
    console.log(`\n🎉 Loan successfully created! Ref: `);
   
  
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const balance: bigint = await tokenContract.balanceOf(contractAddress);
    const decimals: number = await tokenContract.decimals();
    console.log('bal ' + balance + ' ' + decimals);
    const bal = ethers.formatUnits(balance, decimals);
    console.log(`Vault Token Balance: ${bal}`);

    return {success: true, message: txDetail, txId: tx.hash  };
}


export async function repayLoan(key: string,
  amount: string,
  rpcUrl: string,
  contractAddress: string,
  tokenAddress: string,
  refx: string,
 ) {
    // Generate unique reference

    const ref = keccak256(toUtf8Bytes(refx));
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(key!, provider);
    const contract = new ethers.Contract(contractAddress!, ABI, wallet);
    const publicAddress = await wallet.getAddress();

    console.log('amount ' + amount + " ref " + ref)

    console.log("Public address:", publicAddress);
   
    const tokenContractAddress = ethers.getAddress(tokenAddress); //USDT or USDC
    const tokenContract1 = new ethers.Contract(tokenContractAddress, ERC20_ABI, wallet);
    const decimalNo = await tokenContract1.decimals();
    const userBalance = await tokenContract1.balanceOf(publicAddress);
    const userBal = ethers.formatUnits(userBalance, decimalNo);
    console.log('decimalNo ' + decimalNo);
    console.log(" user balance " + userBalance);
    console.log(" user balance " + userBal);

    const amountInt = ethers.parseUnits(amount, decimalNo); // scaled to 1e18
    console.log('amt to send ' + amountInt);
    
    console.log(" user balance " + ethers.parseUnits(userBalance.toString(), decimalNo));
   
    const approveTx = await tokenContract1.approve(contractAddress, amountInt);
    const tx3 = await approveTx.wait();
    console.log(tx3);
    console.log(" approved to spend contract coin ");

    console.log('contract address: ' + contractAddress)
    
    // Send transaction
      console.log('processing...')
      //function createLoan(bytes32 ref,address token, address merchant, uint256 principal, uint256 fee)
    //function repayLoan(bytes32 ref, uint256 amount) external
      const tx = await contract.repayLoan(ref,amountInt);
       

    console.log(`🚀 Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✅ Mined in block ${receipt.blockNumber}`);
    

    const userBalance2 = await tokenContract1.balanceOf(publicAddress);
    console.log("USDT user balance 2 " + userBalance2);
    console.log("USDT user balance 2 " + ethers.parseUnits(userBalance2.toString(), 18));
    console.log("USDT user balance 1 " + userBalance);
    if(userBalance2 < userBalance)
    {
         console.log('user balance reduce');
    }

     const txDetail = await provider.getTransaction(tx.hash);
    console.log("Raw tx data:", txDetail.data);
    console.log(`\n🎉 Loan successfully created! Ref: `);
   
  
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const balance: bigint = await tokenContract.balanceOf(contractAddress);
    const decimals: number = await tokenContract.decimals();
    console.log('bal ' + balance + ' ' + decimals);
    const bal = ethers.formatUnits(balance, decimals);
    console.log(`Vault Token Balance: ${bal}`);

    return {success: true, message: txDetail, txId: tx.hash  };
}

//function disburseLoanToMerchant(bytes32 ref) external onlyCreditOfficer

export async function disburseLoanToMerchant(key: string,
  amount: string,
  rpcUrl: string,
  contractAddress: string,
  tokenAddress: string,
  refx: string
 ) {
    // Generate unique reference

    const ref = keccak256(toUtf8Bytes(refx));
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(key!, provider);
    const contract = new ethers.Contract(contractAddress!, ABI, wallet);
    const publicAddress = await wallet.getAddress();

    console.log('amount ' + amount + " ref " + ref)

    console.log("Public address:", publicAddress);
   
    const tokenContractAddress = ethers.getAddress(tokenAddress); //USDT or USDC
    const tokenContract1 = new ethers.Contract(tokenContractAddress, ERC20_ABI, wallet);


    console.log('contract address: ' + contractAddress)
    
    // Send transaction
      console.log('processing...')
      //function createLoan(bytes32 ref,address token, address merchant, uint256 principal, uint256 fee)
    //function repayLoan(bytes32 ref, uint256 amount) external
      const tx = await contract.disburseLoanToMerchant(ref);
       
    console.log(`🚀 Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✅ Mined in block ${receipt.blockNumber}`);
 

    return {success: true, message: 'PENDING', txId: tx.hash  };
}

/*
"function getBorrowerStats(address borrower, address token)",
  "function getLenderStats(address lender, address token) ",
  "function getProtocolStats(address token) ",
  */

export async function getProtocolStats(tokenAddress: string, rpcUrl: string, contractAddress: string) {
    

  const provider = new ethers.JsonRpcProvider(rpcUrl);
    const fetchAbi: string[] = [
  "function getProtocolStats(address token) external view returns (uint256 numLenders, uint256 numBorrowers, uint256 totalLenderDeposits, uint256 totalBorrowed, uint256 totalOutstanding, uint256 totalPaid);"
];
     // 2️⃣ Create contract instance
  const vault = new ethers.Contract(contractAddress, fetchAbi, provider);

  // 3️⃣ Call the view function
  const response = await vault.getProtocolStats(tokenAddress);
  console.log(response);

  // 4️⃣ Format response for readability
  const result = {
    //creator: offer.creator,
   
  };

  console.log("📦 Protocol Stats:", result);
  return result;
}



export async function getBorrowerStats(tokenAddress: string, borrower: string, rpcUrl: string, contractAddress: string) {
    

  const provider = new ethers.JsonRpcProvider(rpcUrl);
    const fetchAbi: string[] = [
  " function getBorrowerStats(address borrower, address token) " +
        " external view " +
        " returns (uint256 vaultBalance, uint256 totalPaidToPool" ];
     // 2️⃣ Create contract instance
  const vault = new ethers.Contract(contractAddress, fetchAbi, provider);

  // 3️⃣ Call the view function
  const response = await vault.getBorrowerStats(tokenAddress,borrower);
  console.log(response);

  // 4️⃣ Format response for readability
  const result = {
    //creator: offer.creator,
   
  };

  console.log("📦 Protocol Stats:", result);
  return result;
}

export async function getLenderStats(tokenAddress: string, lender: string, rpcUrl: string, contractAddress: string) {
    

  const provider = new ethers.JsonRpcProvider(rpcUrl);
    const fetchAbi: string[] = [
  " function getLenderStats(address lender, address token) "+
        " external  view returns ( " +
          "  uint256 deposit," +
           " uint256 poolShare," +
             "uint256 totalFeesEarned, " +
             " uint256 feesClaimed  ) "]
     // 2️⃣ Create contract instance
  const vault = new ethers.Contract(contractAddress, fetchAbi, provider);

  // 3️⃣ Call the view function
  const response = await vault.getLenderStats(lender,tokenAddress);
  console.log(response);

  // 4️⃣ Format response for readability
  const result = {
    //creator: offer.creator,
   
  };

  console.log("📦 Protocol Stats:", result);
  return result;
}
