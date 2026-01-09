const ecc = require("tiny-secp256k1");
const { BIP32Factory } = require("bip32");
const bip32 = BIP32Factory(ecc);
const bip39 = require("bip39");
const bitcoinLib = require("bitcoinjs-lib");
const ethers = require("ethers");
const { TronWeb } = require("tronweb");
const hdkey = require("hdkey");
require("dotenv").config();

const { encryption } = require("../../utils/encryption");
const {
  MerchantCryptoAddressModel,
} = require("../../models/merchant/cryptoAddressModel");

exports.createMerchantCryptoAddress = (data) => {
  return MerchantCryptoAddressModel.create(data);
};

exports.getMerchantCryptoAddressById = (
  id,
  projections = null,
  options = {}
) => {
  return MerchantCryptoAddressModel.findById(id, projections, options);
};

exports.getMerchantCryptoAddressByFilter = (
  filters = {},
  projections = null,
  options = {}
) => {
  return MerchantCryptoAddressModel.findOne(filters, projections, options);
};

exports.getAllMerchantCryptoAddressByFilter = (
  filters = {},
  projections = null,
  options = {}
) => {
  return MerchantCryptoAddressModel.find(filters, projections, options);
};

exports.deleteMerchantCryptoaddressById = (id, options) => {
  return MerchantCryptoAddressModel.findByIdAndDelete(id, options);
};

exports.updateMerchantCryptoAddressByFilter = (
  filter = {},
  updateObj = {},
  options = {}
) => {
  return MerchantCryptoAddressModel.findOneAndUpdate(
    filter,
    updateObj,
    options
  );
};

exports.generateMerchantCryptoAddressData = async () => {
  try {
    let createAddressObj = {};

    //-----------------------create btc address-------------------------//
    //Define the network
    const network = bitcoinLib.networks.bitcoin; // use networks.testnet for testnet

    //Define the derivation path
    const path = `m/44'/0'/0'/0`; // use  m/44'/1'/0'/0 for testnet

    //create the mnemonic phrase
    let btcMnemonic = bip39.generateMnemonic();
    //encrypt the mnemonic phrase
    btcMnemonic = encryption(btcMnemonic);

    const seed = bip39.mnemonicToSeedSync(btcMnemonic);
    const root = bip32.fromSeed(seed, network);
    const account = root.derivePath(path);
    const node = account.derive(0).derive(0);

    //get the private key
    let btcPrivateKey = node.toWIF();

    //encrypt the private key
    btcPrivateKey = encryption(btcPrivateKey);

    //get the address of wallet
    const btcAddress = bitcoinLib.payments.p2pkh({
      pubkey: node.publicKey,
      network: network,
    }).address;

    createAddressObj["btc.address"] = btcAddress;
    createAddressObj["btc.mnemonic_phrase"] = btcMnemonic;
    createAddressObj["btc.private_key"] = btcPrivateKey;

    //-----------------------create erc-20 address-------------------------//
    const erc20Wallet = ethers.Wallet.createRandom();

    const erc20Address = erc20Wallet.address;
    let erc20PrivateKey = erc20Wallet.privateKey;
    let erc20MnemonicPhrase = erc20Wallet.mnemonic.phrase;

    //encrypt private key
    erc20PrivateKey = encryption(erc20PrivateKey);

    //encrypt the mnemonic phrase
    erc20MnemonicPhrase = encryption(erc20MnemonicPhrase);

    createAddressObj["erc20.address"] = erc20Address;
    createAddressObj["erc20.mnemonic_phrase"] = erc20MnemonicPhrase;
    createAddressObj["erc20.private_key"] = erc20PrivateKey;

    //-----------------------create trc-20 address-------------------------//

    const tronWeb = new TronWeb({
      fullHost: process.env.TRON_MAIN_NET_URL,
      solidityNode: process.env.TRON_SOLIDITY_NODE,
      eventServer: process.env.TRON_EVENT_NODE,
    });
    const mnemonicTrc20 = bip39.generateMnemonic();

    const seedTrc20 = await bip39.mnemonicToSeed(mnemonicTrc20);

    const pathTrc20 = "m/44'/195'/0'/0/0"; // TRON path
    const rootTrc20 = hdkey.fromMasterSeed(seedTrc20);
    const childTrc20 = rootTrc20.derive(pathTrc20);
    const privateKeyTrc20 = childTrc20.privateKey.toString("hex");
    const publicKeyTrc20 = childTrc20.publicKey.toString("hex");
    tronWeb.setPrivateKey(privateKeyTrc20);
    const addressTrc20 = tronWeb.address.fromPrivateKey(privateKeyTrc20);
    const hexAddressTrc20 = tronWeb.address.toHex(addressTrc20);

    createAddressObj["trc20.address"] = addressTrc20;
    createAddressObj["trc20.mnemonic_phrase"] = encryption(mnemonicTrc20);
    createAddressObj["trc20.private_key"] = encryption(privateKeyTrc20);
    createAddressObj["trc20.public_key"] = publicKeyTrc20;
    createAddressObj["trc20.hex_address"] = hexAddressTrc20;

    return {
      message: "Nodes data generated successfully",
      error: false,
      data: createAddressObj,
    };
  } catch (err) {
    console.log("error", err);
    return {
      message: err.message || "Error in generating crypto address data",
      error: true,
      data: null,
    };
  }
};

