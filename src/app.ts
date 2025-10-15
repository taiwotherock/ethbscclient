import express from 'express';
import cors from 'cors'
import dotenv from 'dotenv';
import { generateBinanceWallet } from './createbnbwallet'
import { checkIsAdmin,addAdmin } from './eth-access-control-client'
import { swapPancake } from './eth-swap'
import { createOffer,releaseOffer,markOfferPaid,
  getVaultTokenBalance,getWalletBalance,
  pickOffer,updateWhiteOrBlackList,fetchOfferStatus } from './eth-escrow-vault'

import { depositIntoVault,withdrawFromVault,updateWhiteOrBlackListLend,
  createLoan,repayLoan,disburseLoanToMerchant,
  getBorrowerStats,getLenderStats,getProtocolStats
 } from './eth-lending'




dotenv.config();
const PORT = process.env._PORT;
const origins = process.env.CORS_ORIGIN


const app = express();
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  //listenDeposited().catch(console.error);
  return console.log(`Express is listening at http://localhost:${PORT}`);
});


  function validateToken(req: any)
  {
    const authHeader = req.headers['authorization']; // lowercase key
    const sourceCode = req.headers['x-source-code'];
    const clientId = req.headers['x-client-id'];
    const clientSecret = req.headers['x-client-secret'];

    console.log('header ' + sourceCode + ' ' + clientId)
    const xClientId = process.env.X_CLIENT_ID
    const xClientSecret = process.env.X_CLIENT_SECRET;
    const xSourceCode = process.env.X_SOURCE_CODE;

    console.log('source code ' + xSourceCode + ' ' + xClientId)
    console.log('source code ' + xSourceCode + ' ' + xClientId)
    if(xSourceCode == sourceCode && xClientId == clientId && xClientSecret == clientSecret)
      return true;
    
    return false;

  }

  app.get('/check-role/:address', async (req, res) => {
    try {
  
      if(!validateToken(req))
      {
        console.log(`Invalid authentication API key or token `)
        res.status(500).json({success:false,message:'Invalid authentication API key or token '})
        return;
      }
      const rpcUrl = req.headers['x-rpc-url'] as string;
      console.log(rpcUrl);
      const response = await checkIsAdmin(req.params.address,rpcUrl,req.query.contractAddress as string);
   
  
      res.json(response)
    
      //res.json(successResponse(response))
    } catch (error) {
     console.log(`Error: access control check role ` + error.message)
      res.status(500).json({success:false, message: error.message})
    }
  });

  app.post('/create-offer', async (req, res) => {
    try {
  
     
      const { key, token,counterparty,fiatSymbol,fiatAmount,fiatToTokenRate,isBuy,usdtAmt} = req.body;
      console.log("counterparty: "  + " " + counterparty);
      console.log("rate: "  + " " + fiatToTokenRate);
      console.log("is buy: "  + " " + isBuy);
      const response = await createOffer(key,counterparty,token,fiatSymbol,fiatAmount,fiatToTokenRate,isBuy,usdtAmt);

      res.json(response)
    
      //res.json(successResponse(response))
    } catch (error) {
      console.log(`Error: create offer ` + error.message)
      res.status(500).json({success:false, message: error.message})
    }
  })

   app.post('/release-offer', async (req, res) => {
    try {
  
     
      const { key, refNo,token} = req.body;
      console.log("refNo: "  + " " + refNo);
      const response = await releaseOffer(key,refNo,token);

      res.json(response)
 
    } catch (error) {
      console.log(`Error: release offer ` + error.message)
      res.status(500).json({success:false, message: error.message})
    }
  })

  app.post('/pick-offer', async (req, res) => {
    try {
  
     
      const { key, refNo,tokenAmount,isBuy} = req.body;
      console.log("refNo: "  + " " + refNo);
      const response = await pickOffer(key,refNo,isBuy,tokenAmount);

      res.json(response)
 
    } catch (error) {
      console.log(`Error: release offer ` + error.message)
      res.status(500).json({success:false, message: error.message})
    }
  })

  app.post('/mark-paid', async (req, res) => {
    try {
  
     
      const { key, refNo} = req.body;
      console.log("refNo: "  + " " + refNo);
      const response = await markOfferPaid(key,refNo);

      res.json(response)
 
    } catch (error) {
      console.log(`Error: release offer ` + error.message)
      res.status(500).json({success:false, message: error.message})
    }
  })

  app.post('/white-black-status', async (req, res) => {
    try {
  
      if(!validateToken(req))
      {
        console.log(`Invalid authentication API key or token `)
        res.status(500).json({success:false,message:'Invalid authentication API key or token '})
        return;
      }
     
      const { key, address, whiteOrBlack,status,ctype,rpcUrl,contractAddress} = req.body;
      console.log("address: "  + " " + address + ' ' + ctype);
      let response : any;
      
      if(ctype == 'ESCROW')
        response = await updateWhiteOrBlackList(key,address,status,whiteOrBlack);
      else 
        response = await updateWhiteOrBlackListLend(key,address,status,whiteOrBlack,rpcUrl,contractAddress);

      res.json(response)
 
    } catch (error) {
      console.log(`Error: release offer ` + error.message)
      res.status(500).json({success:false, message: error.message})
    }
  })

  app.post('/vault-balance', async (req, res) => {
    try {
  
     
      const { token, contractAddr} = req.body;
      console.log("refNo: "  + " " + token);
      const response = await getVaultTokenBalance(token,contractAddr);

      res.json(response)
 
    } catch (error) {
      console.log(`Error: vault balance ` + error.message)
      res.status(500).json({success:false, message: error.message})
    }
  })

  app.post('/swap-with-pancake', async (req, res) => {
    try {
  
     
      const { key, token1,token2, amountIn,symbol1,symbol2,rpcUrl} = req.body;
      console.log("refNo: "  + " " + token1);
      const response = await swapPancake(key,amountIn,token1,token2,symbol1,symbol2,rpcUrl);

      res.json(response)
 
    } catch (error) {
      console.log(`Error: swap ` + error.message)
      res.status(500).json({success:false, message: error.message})
    }
  })

  app.post('/balance', async (req, res) => {
    try {
  
     
      const {walletAddress,tokenAddress,symbol, rpcUrl,decimalNo} = req.body;
      console.log("refNo: "  + " " + walletAddress);
      const response = await getWalletBalance(tokenAddress,walletAddress,symbol,rpcUrl);

      res.json(response)
 
    } catch (error) {
      console.log(`Error: fetch balance ` + error.message)
      res.status(500).json({success:false, message: error.message})
    }
  })

  app.get('/fetch-offer/:ref', async (req, res) => {
    try {
  
      if(!validateToken(req))
      {
        console.log(`Invalid authentication API key or token `)
        res.status(500).json({success:false,message:'Invalid authentication API key or token '})
        return;
      }
      
      const response = await fetchOfferStatus(req.params.ref);
  
      res.json(response)
    
      //res.json(successResponse(response))
    } catch (error) {
     console.log(`Error: fetch offer ` + error.message)
      res.status(500).json({success:false, message: error.message})
    }
  });

  app.post('/fetch-tx-byid', async (req, res) => {
    try {

   
      const { chain,symbol,txId,rpcUrl} = req.body;
      var response : any;
      console.log('fetch status by id' + symbol + ' ' + txId +' ' + chain )
      if(chain == 'TRON') {

        response = ''; //await tranStatus(txId);
        res.json(response)
      }
    

      //res.json(successResponse(response))
    } catch (error) {
      console.log(`Error fetching transactions `)
      res.status(500).json({success:false,error:'error fetching transactions ' + error})
    }
  })

  app.post('/deposit-into-liquidity-pool', async (req, res) => {
    try {

      if(!validateToken(req))
      {
        console.log(`Invalid authentication API key or token `)
        res.status(500).json({success:false,message:'Invalid authentication API key or token '})
        return;
      }
  
      const { tokenAddress, amount,key, rpcUrl,contractAddress} = req.body;
      console.log("deposit into pool req: " + tokenAddress + " " + contractAddress);
      
      const response = await depositIntoVault(key,amount,rpcUrl,contractAddress,tokenAddress);
      res.json(response)
    
    } catch (error) {
      console.log(`Error deposit into pool `)
      res.status(500).json({success:false,message:'error deposit into pool ' + error})
    }
  })

  app.post('/withdraw-liquidity-pool', async (req, res) => {
    try {

      if(!validateToken(req))
      {
        console.log(`Invalid authentication API key or token `)
        res.status(500).json({success:false,message:'Invalid authentication API key or token '})
        return;
      }
  
      const { tokenAddress, amount,key, rpcUrl,contractAddress} = req.body;
      console.log("withdraw from pool req: " + tokenAddress + " " + contractAddress);
      
      const response = await withdrawFromVault(key,amount,rpcUrl,contractAddress,tokenAddress);
      res.json(response)
    
    } catch (error) {
      console.log(`Error withdraw into pool `)
      res.status(500).json({success:false,message:'error withdraw into pool ' + error})
    }
  })

  app.post('/create-loan', async (req, res) => {
    try {

      if(!validateToken(req))
      {
        console.log(`Invalid authentication API key or token `)
        res.status(500).json({success:false,message:'Invalid authentication API key or token '})
        return;
      }
  
      const { tokenAddress, amount,key, rpcUrl,contractAddress,refx,merchantAddress,fee} = req.body;
      console.log("create loan req: " + tokenAddress + " " + contractAddress);
      
      const response = await createLoan(key,amount,rpcUrl,contractAddress,
        tokenAddress,refx,merchantAddress,fee);
      res.json(response)
    
    } catch (error) {
      console.log(`Error create loan `)
      res.status(500).json({success:false,message:'error create loan ' + error})
    }
  })

  app.post('/repay-loan', async (req, res) => {
    try {

      if(!validateToken(req))
      {
        console.log(`Invalid authentication API key or token `)
        res.status(500).json({success:false,message:'Invalid authentication API key or token '})
        return;
      }
  
      const { tokenAddress, amount,key, rpcUrl,contractAddress,refx,merchantAddress,fee} = req.body;
      console.log("repay loan req: " + tokenAddress + " " + contractAddress);
      
      const response = await repayLoan(key,amount,rpcUrl,contractAddress,
        tokenAddress,refx);
      res.json(response)
    
    } catch (error) {
      console.log(`Error repay loan `)
      res.status(500).json({success:false,message:'error repay loan ' + error})
    }
  })

  app.post('/disburse-loan-merchant', async (req, res) => {
    try {

      if(!validateToken(req))
      {
        console.log(`Invalid authentication API key or token `)
        res.status(500).json({success:false,message:'Invalid authentication API key or token '})
        return;
      }
  
      const { tokenAddress, amount,key, rpcUrl,contractAddress,refx} = req.body;
      console.log("disburse-loan-merchant req: " + tokenAddress + " " + contractAddress);
      
      const response = await disburseLoanToMerchant(key,amount,rpcUrl,contractAddress,
        tokenAddress,refx);
      res.json(response)
    
    } catch (error) {
      console.log(`Error disburse-loan-merchant `)
      res.status(500).json({success:false,message:'error disburse-loan-merchant ' + error})
    }
  })

  app.post('/fetch-borrower-detail', async (req, res) => {
    try {

      if(!validateToken(req))
      {
        console.log(`Invalid authentication API key or token `)
        res.status(500).json({success:false,message:'Invalid authentication API key or token '})
        return;
      }
  
      const { tokenAddress, borrower, rpcUrl,contractAddress} = req.body;
      console.log("fetch-borrower-detail req: " + tokenAddress + " " + contractAddress);
      
      const response = await getBorrowerStats(tokenAddress,borrower,rpcUrl,contractAddress);
      res.json(response)
    
    } catch (error) {
      console.log(`Error fetch-borrower-detail `)
      res.status(500).json({success:false,message:'error fetch-borrower-detail ' + error})
    }
  })

  app.post('/fetch-lendingvault-detail', async (req, res) => {
    try {

      if(!validateToken(req))
      {
        console.log(`Invalid authentication API key or token `)
        res.status(500).json({success:false,message:'Invalid authentication API key or token '})
        return;
      }
  
      const { tokenAddress, rpcUrl,contractAddress} = req.body;
      console.log("fetch-lendingvault-detail req: " + tokenAddress + " " + contractAddress);
      
      const response = await getProtocolStats(tokenAddress,rpcUrl,contractAddress);
      res.json(response)
    
    } catch (error) {
      console.log(`Error fetch-lendingvault-detail `)
      res.status(500).json({success:false,message:'error fetch-lendingvault-detail ' + error})
    }
  })

  app.post('/fetch-lender-detail', async (req, res) => {
    try {

      if(!validateToken(req))
      {
        console.log(`Invalid authentication API key or token `)
        res.status(500).json({success:false,message:'Invalid authentication API key or token '})
        return;
      }
  
      const { tokenAddress,lender, rpcUrl,contractAddress} = req.body;
      console.log("fetch-lender-detail req: " + tokenAddress + " " + contractAddress);
      
      const response = await getLenderStats(tokenAddress,lender,rpcUrl,contractAddress);
      res.json(response)
    
    } catch (error) {
      console.log(`Error fetch-lender-detail `)
      res.status(500).json({success:false,message:'error fetch-lender-detail ' + error})
    }
  })




  