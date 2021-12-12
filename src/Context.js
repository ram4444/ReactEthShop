import React from 'react';

export const drupalHostname = {
  LOCAL: 'localhost',
  docker: 'containerHost',
  ext: 'mstdatalite.dionysbiz.xyz'
};

export const netId = {
  UNKNOWN: 'UNKNOWN',
  Mainnet: '0x1',
  Ropsten: '0x3',
  Rinkeby: '0x4',
  Goerli: '0x5'
};

export const erc777ContractAddr = {
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
  receiverAddr: receiverAddr.Acct2
});

export const ProdContext = React.createContext({
  drupalHostname: drupalHostname.docker,
  localNetId: netId.UNKNOWN,
  erc777ContractAddr: erc777ContractAddr.RealToken,
  receiverAddr: receiverAddr.Acct2
});
