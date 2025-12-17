const { MerchantWalletModel } = require("../../models/merchant/walletModel");

exports.getMerchantWalletByFilter = (
  filter = {},
  projection = null,
  options = {}
) => {
  return MerchantWalletModel.findOne(filter, projection, options);
};

exports.updateMerchantWalletByFilter = (
  filter = {},
  updatedObj = {},
  options = {}
) => {
  return MerchantWalletModel.findOneAndUpdate(filter, updatedObj, options);
};

exports.merchantWalletData = async () => {
  try {
    const result = {
      inr: { image: "", name: "Indian Rupees (INR)", balance: 0 },
      btc: { image: "", name: "Bitcoin (BTC)", balance: 0 },
      bch: { image: "", name: "Bitcoin Cash (BCH)", balance: 0 },
      bnb: { image: "", name: "Binance Coin (BNB)", balance: 0 },
      eth: { image: "", name: "Ethereum (ETH)", balance: 0 },
      matic: { image: "", name: "Matic Network (MATIC)", balance: 0 },
      tron: { image: "", name: "TRON (TRX)", balance: 0 },
      trx: { image: "", name: "Tether (USDT)", balance: 0 },
      xrp: { image: "", name: "Ripple (XRP)", balance: 0 },
      sol: { image: "", name: "Solana (SOL)", balance: 0 },
      ltc: { image: "", name: "Litecoin (LTC)", balance: 0 },
    };

    return {
      message: "Wallet data created successfully",
      error: false,
      data: result,
    };
  } catch (err) {
    return {
      message: err.message || "Failed to generate wallet data",
      error: true,
      data: null,
    };
  }
};
