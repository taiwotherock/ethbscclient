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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const eth_access_control_client_1 = require("./eth-access-control-client");
const eth_swap_1 = require("./eth-swap");
const eth_escrow_vault_1 = require("./eth-escrow-vault");
dotenv_1.default.config();
const PORT = process.env._PORT;
const origins = process.env.CORS_ORIGIN;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.listen(PORT, () => {
    //listenDeposited().catch(console.error);
    return console.log(`Express is listening at http://localhost:${PORT}`);
});
function validateToken(req) {
    const authHeader = req.headers['authorization']; // lowercase key
    const sourceCode = req.headers['x-source-code'];
    const clientId = req.headers['x-client-id'];
    const clientSecret = req.headers['x-client-secret'];
    console.log('header ' + sourceCode + ' ' + clientId);
    const xClientId = process.env.X_CLIENT_ID;
    const xClientSecret = process.env.X_CLIENT_SECRET;
    const xSourceCode = process.env.X_SOURCE_CODE;
    console.log('source code ' + xSourceCode + ' ' + xClientId);
    console.log('source code ' + xSourceCode + ' ' + xClientId);
    if (xSourceCode == sourceCode && xClientId == clientId && xClientSecret == clientSecret)
        return true;
    return false;
}
app.get('/check-role/:address', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!validateToken(req)) {
            console.log(`Invalid authentication API key or token `);
            res.status(500).json({ success: false, message: 'Invalid authentication API key or token ' });
            return;
        }
        const response = yield (0, eth_access_control_client_1.checkIsAdmin)(req.params.address);
        res.json(response);
        //res.json(successResponse(response))
    }
    catch (error) {
        console.log(`Error: access control check role ` + error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}));
app.post('/create-offer', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key, token, counterparty, fiatSymbol, fiatAmount, fiatToTokenRate, isBuy, usdtAmt } = req.body;
        console.log("counterparty: " + " " + counterparty);
        console.log("rate: " + " " + fiatToTokenRate);
        console.log("is buy: " + " " + isBuy);
        const response = yield (0, eth_escrow_vault_1.createOffer)(key, counterparty, token, fiatSymbol, fiatAmount, fiatToTokenRate, isBuy, usdtAmt);
        res.json(response);
        //res.json(successResponse(response))
    }
    catch (error) {
        console.log(`Error: create offer ` + error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}));
app.post('/release-offer', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key, refNo, token } = req.body;
        console.log("refNo: " + " " + refNo);
        const response = yield (0, eth_escrow_vault_1.releaseOffer)(key, refNo, token);
        res.json(response);
    }
    catch (error) {
        console.log(`Error: release offer ` + error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}));
app.post('/pick-offer', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key, refNo, tokenAmount, isBuy } = req.body;
        console.log("refNo: " + " " + refNo);
        const response = yield (0, eth_escrow_vault_1.pickOffer)(key, refNo, isBuy, tokenAmount);
        res.json(response);
    }
    catch (error) {
        console.log(`Error: release offer ` + error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}));
app.post('/mark-paid', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key, refNo } = req.body;
        console.log("refNo: " + " " + refNo);
        const response = yield (0, eth_escrow_vault_1.markOfferPaid)(key, refNo);
        res.json(response);
    }
    catch (error) {
        console.log(`Error: release offer ` + error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}));
app.post('/white-black-status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!validateToken(req)) {
            console.log(`Invalid authentication API key or token `);
            res.status(500).json({ success: false, message: 'Invalid authentication API key or token ' });
            return;
        }
        const { key, address, whiteOrBlack, status } = req.body;
        console.log("address: " + " " + address);
        const response = yield (0, eth_escrow_vault_1.updateWhiteOrBlackList)(key, address, status, whiteOrBlack);
        res.json(response);
    }
    catch (error) {
        console.log(`Error: release offer ` + error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}));
app.post('/vault-balance', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, contractAddr } = req.body;
        console.log("refNo: " + " " + token);
        const response = yield (0, eth_escrow_vault_1.getVaultTokenBalance)(token, contractAddr);
        res.json(response);
    }
    catch (error) {
        console.log(`Error: vault balance ` + error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}));
app.post('/swap-with-pancake', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key, token1, token2, amountIn } = req.body;
        console.log("refNo: " + " " + token1);
        const response = yield (0, eth_swap_1.swapPancake)(key, amountIn, token1, token2);
        res.json(response);
    }
    catch (error) {
        console.log(`Error: swap ` + error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}));
app.post('/balance', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { walletAddress, tokenAddress, symbol, rpcUrl, decimalNo } = req.body;
        console.log("refNo: " + " " + walletAddress);
        const response = yield (0, eth_escrow_vault_1.getWalletBalance)(tokenAddress, walletAddress, symbol);
        res.json(response);
    }
    catch (error) {
        console.log(`Error: fetch balance ` + error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}));
app.get('/fetch-offer/:ref', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!validateToken(req)) {
            console.log(`Invalid authentication API key or token `);
            res.status(500).json({ success: false, message: 'Invalid authentication API key or token ' });
            return;
        }
        const response = yield (0, eth_escrow_vault_1.fetchOfferStatus)(req.params.ref);
        res.json(response);
        //res.json(successResponse(response))
    }
    catch (error) {
        console.log(`Error: fetch offer ` + error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}));
app.post('/fetch-tx-byid', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chain, symbol, txId, rpcUrl } = req.body;
        var response;
        console.log('fetch status by id' + symbol + ' ' + txId + ' ' + chain);
        if (chain == 'TRON') {
            response = ''; //await tranStatus(txId);
            res.json(response);
        }
        //res.json(successResponse(response))
    }
    catch (error) {
        console.log(`Error fetching transactions `);
        res.status(500).json({ success: false, error: 'error fetching transactions ' + error });
    }
}));
//# sourceMappingURL=app.js.map