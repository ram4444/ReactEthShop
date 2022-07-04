import React from 'react';

export const drupalHostname = {
  LOCAL: 'localhost',
  docker: 'containerHost',
  ext: 'mstdatalite.dionysbiz.xyz:8080'
};

export const netId = {
  UNKNOWN: 'UNKNOWN',
  Mainnet: '0x1',
  Ropsten: '0x3',
  Rinkeby: '0x4',
  Goerli: '0x5'
};

export const erc777ContractAddr = {
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  USDTRinkeby: '0x3B00Ef435fA4FcFF5C209a37d1f3dcff37c705aD',
  TestERC20: '0xbbeB26b6773feF8dBe9865A7023FA004E08C31FF',
  T777R: '0x055d329178e7b029D9a7D0B56406Ad5587788C39',
  RealToken: 'Not Confirm'
};

export const receiverAddr = {
  TestPayable: '0x13935ec2330AD3476A74f84088F130975Fe35301',
  Acct2: '0x9433f6A41dbb91e909688bCEE876d17a015B4a23'
};

// env
export const TestContext = React.createContext({
  drupalHostname: drupalHostname.ext,
  localNetId: netId.UNKNOWN,
  erc777ContractAddr: erc777ContractAddr.T777R,
  usdtContractAddr: erc777ContractAddr.USDTRinkeby,
  receiverAddr: receiverAddr.Acct2
});

export const ProdContext = React.createContext({
  drupalHostname: drupalHostname.docker,
  localNetId: netId.UNKNOWN,
  erc777ContractAddr: erc777ContractAddr.RealToken,
  usdtContractAddr: erc777ContractAddr.USDT,
  receiverAddr: receiverAddr.Acct2
});
