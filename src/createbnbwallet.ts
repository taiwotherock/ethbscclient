import * as bip39 from 'bip39';
import hdkey from 'hdkey';
import { ethers } from 'ethers';

export async function generateBinanceWallet() {
  const mnemonic = bip39.generateMnemonic();
  const seed = await bip39.mnemonicToSeed(mnemonic);
  const root = hdkey.fromMasterSeed(seed);

  const derivationPath = "m/44'/60'/0'/0/0";
  const addrnode = root.derive(derivationPath);

  const privateKey = addrnode.privateKey.toString('hex');
  const wallet = new ethers.Wallet(privateKey);
  const address = wallet.address;

  console.log('address: ' + address);
  console.log('mnemonic: ' + mnemonic);
  console.log('privateKey: ' + privateKey);

  return {
    ticker: 'BNB',
    address: address,
    privateKey: privateKey,
    mnemonic: mnemonic,
  };
}

generateBinanceWallet();