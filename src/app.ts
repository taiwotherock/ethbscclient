import express from 'express';
import cors from 'cors'
import dotenv from 'dotenv';
import { generateBinanceWallet } from './createbnbwallet'
import { checkIsAdmin,addAdmin } from './eth-access-control-client'
import { swapPancake } from './eth-swap'
import { createOffer,releaseOffer,markOfferPaid,
  getVaultTokenBalance,getWalletBalance,
  pickOffer,updateWhiteOrBlackList,fetchOfferStatus } from './eth-escrow-vault'



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
      
      const response = await checkIsAdmin(req.params.address);
  
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
     
      const { key, address, whiteOrBlack,status} = req.body;
      console.log("address: "  + " " + address);
      const response = await updateWhiteOrBlackList(key,address,status,whiteOrBlack);

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
  
     
      const { key, token1,token2, amountIn,symbol1,symbol2} = req.body;
      console.log("refNo: "  + " " + token1);
      const response = await swapPancake(key,amountIn,token1,token2,symbol1,symbol2);

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
      const response = await getWalletBalance(tokenAddress,walletAddress,symbol);

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

  