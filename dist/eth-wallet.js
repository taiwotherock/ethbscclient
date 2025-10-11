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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWalletWithPhraseEth = createWalletWithPhraseEth;
const ethers_1 = require("ethers");
function createWalletWithPhraseEth(chain, symbol) {
    return __awaiter(this, void 0, void 0, function* () {
        const wallet = ethers_1.Wallet.createRandom(); //.fromPhrase(mnemonic);
        console.log("Mnemonic word :" + wallet.mnemonic.phrase);
        console.log("Mnemonic pwd:" + wallet.mnemonic.password);
        //const mnemonic = Mnemonic.fromPhrase(seedPhrase);
        const hdWalletNode = ethers_1.HDNodeWallet.fromMnemonic(wallet.mnemonic, "m/44'/60'/0'/0");
        const hdWallet = hdWalletNode.derivePath('0');
        const address = hdWallet.address;
        const privateKey = hdWallet.privateKey.toString();
        console.log("Address:" + address);
        console.log("privateKey:" + privateKey);
        var response = { success: true, address: address.toString(), privateKey: privateKey,
            chain: chain, phrase: wallet.mnemonic.phrase, symbol: symbol };
        return response;
    });
}
createWalletWithPhraseEth('Base', 'ETH');
//# sourceMappingURL=eth-wallet.js.map