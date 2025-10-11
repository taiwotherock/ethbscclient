import { Wallet,Mnemonic, HDNodeWallet } from "ethers";



export async function createWalletWithPhraseEth(chain: string, symbol: string) {
   
    const wallet = Wallet.createRandom(); //.fromPhrase(mnemonic);

    
    console.log("Mnemonic word :" + wallet.mnemonic.phrase);
    console.log("Mnemonic pwd:" + wallet.mnemonic.password);

    //const mnemonic = Mnemonic.fromPhrase(seedPhrase);
    const hdWalletNode = HDNodeWallet.fromMnemonic(wallet.mnemonic, "m/44'/60'/0'/0");
    const hdWallet = hdWalletNode.derivePath('0');
    const address = hdWallet.address;
    const privateKey = hdWallet.privateKey.toString();
    console.log("Address:" + address);
    console.log("privateKey:" + privateKey);

    var response = {success:true,address: address.toString(), privateKey: privateKey, 
        chain: chain, phrase:wallet.mnemonic.phrase, symbol: symbol };
    
    return response;

  
}

createWalletWithPhraseEth('Base','ETH');
