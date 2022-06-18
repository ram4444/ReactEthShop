import Web3 from 'web3';
import axios from 'axios';
import { urls } from '../properties/urls';

const { abi } = require('../abi/ERC777.json');
const { localChainList } = require('../properties/localChainList');

const App = new Web3()
let web3

export async function checkWalletExist() {
    
  let walletFound = false;

  if (window.ethereum) {
    App.web3Provider = window.ethereum;
    try {
      // Request account access
      
      // Depricatd soon 
      // await window.ethereum.enable();
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      walletFound=true
      console.log('Wallet found')
    } catch (error) {
      // User denied account access...
      console.error("User denied account access")
    }
  } else if (window.web3) {
    App.web3Provider = window.web3.currentProvider;
    walletFound=true
    console.log('Wallet found [Legacy]')
  }
  // If no injected web3 instance is detected, fall back to Ganache
  else {
    console.error('web3 was undefined');
    walletFound=false
  }
  web3 = new Web3(App.web3Provider);
  // legacy 
  /*
  if (typeof web3 !== 'undefined') {
    console.log('Web3 found');
    window.web3 = new Web3(window.web3.currentProvider);
    // web3.eth.defaultAccount = web3.eth.accounts[0];
    walletFound=true
  } else {
    console.error('web3 was undefined');
    walletFound=false
  }
  */

  return walletFound;
  
}

checkWalletExist()

export function getChainlistJSON() {
  
  return axios({
    method: 'get',
    url: urls.chainlist,
    responseType: 'json',
    // crossDomain: true,
    // headers: { 'Access-Control-Allow-Origin': '*' }
  })
    .then((response) => {
    console.log(`HTTP call to ${urls.chainlist} is done`);
    console.log(response);
    return response;
  })
      
}

export function getEtherscanAbi(chain, contractAddr) {
    // Query the abi by the follow url as sample
    // const response = await fetch('https://api-ropsten.etherscan.io/api?module=contract&action=getabi&address=0xC1dcBB3E385Ef67f2173A375F63f5F4361C4d2f9&apikey=YourApiKeyToken');
    
    let apiURL;
    switch (chain) {
      case 'Rinkeby':
        apiURL = urls.etherscan_rinkeby;
        break;
      case 'Ethereum Mainnet':
        apiURL = urls.etherscan_mainnet;
        break;
      default:
        apiURL = urls.etherscan_rinkeby;
    }
  
    return axios({
      method: 'get',
      url: `${apiURL+contractAddr}&apikey=5AECWF2IJ7TIYABD8DVZ6FQR2R15MPRUCV`,
      responseType: 'json',
    })
      .then((response) => {
        console.log(`HTTP call to ${chain} Etherscan is done`);
        console.log(response);
        return response;
    })
      
}

export async function triggerTransaction(chainName, contractAddr, paymentTokenName, fromAddr, toAddr, amount, onSuccess, onFail) {
  let abiEtherscan;
  let contract;
  let walletExist=false;
  let targetChainId=''

  checkWalletExist()

  const chainListJSON = await getChainlistJSON().then((response) => {
    if (response.status === 200) {
      // return response.data
      console.log(localChainList)
      return localChainList
    } 
      return localChainList
    
  }
  )

  await chainListJSON.forEach((item)=>{
    if (chainName===item.name){
      targetChainId = item.chainId
    }
  })
  // console.log(targetChainId)
  
  // Check wallet exists
  walletExist = await checkWalletExist;


  // Change the current network to target chain
  if (window.ethereum.networkVersion !== targetChainId) {
    console.log('read to change network')
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: web3.utils.toHex(targetChainId) }]
      });
    } catch (err) {
      // This error code indicates that the chain has not been added to MetaMask
      if (err.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainName: 'Polygon Mainnet',
              chainId: web3.utils.toHex(targetChainId),
              // nativeCurrency: { name: 'MATIC', decimals: 18, symbol: 'MATIC' },
              // rpcUrls: ['https://polygon-rpc.com/']
            }
          ]
        });
      }
    }
  }

  // Get the gas price
  web3.eth.getGasPrice().then(async (result) => {
    
    console.log('GasFee in Wei')
    console.log(result)

    let gasFee
    let unit

    // Unit Adjustment
    if (paymentTokenName.includes("Tether")) {
      unit='mwei'
    } else {
      unit='ether'
    }

    switch (chainName) {
    case 'Rinkeby':
      // gasFee = web3.utils.toHex(web3.utils.toWei('100', 'gwei'))
      gasFee = web3.utils.toBN(Math.round(web3.utils.fromWei('188729959600000', 'gwei')))
      if (paymentTokenName.includes("Tether")) {
        unit='ether'
      }
      break;
    case 'Ethereum Mainnet':
      gasFee = web3.utils.toBN(Math.round(web3.utils.fromWei(result, 'gwei')))
      console.log(gasFee)
      break;
    default:
      // gasFee = web3.utils.toHex(web3.utils.toWei('100', 'gwei'))
      gasFee = web3.utils.toBN(Math.round(web3.utils.fromWei('188729959600000', 'gwei')))
      if (paymentTokenName.includes("Tether")) {
        unit='ether'
      }
    }
    
    let walletCall
    // Trigger Transaction
    if (paymentTokenName.includes("Ethereum")) {
      // Special handling for Ethereum
      console.log(`Read to send ${paymentTokenName} with no contract address`)
      walletCall = web3.eth.sendTransaction({
        from: fromAddr, 
        to: toAddr, 
        value: web3.utils.toWei(amount, 'ether'), 
        gas: gasFee
      })
      .on('error', (error, receipt) => {
        console.log('error')
        console.log(error)
        onFail(receipt)
      })
      .then((receipt) => {
        console.log(receipt)
        onSuccess(receipt)
      });
      return walletCall;
    } // else HIDDEN {
      // Other Tokens
      console.log(`Read to send ${paymentTokenName}`)
      
      // Get the ABI from etherscan
      getEtherscanAbi(chainName, contractAddr).then((response) => {
        if (response.data.status === '1') {
            console.log(response.data.message);
            abiEtherscan = JSON.parse(response.data.result);
            contract = new web3.eth.Contract(abiEtherscan, contractAddr);
        
        } else {
          // Use local ABI when fail to get
          console.log(response.data.message);
          console.log(response.data.result);
          console.log('Query ABI from Etherscan fail, use local ABI file instead');
          contract = new web3.eth.Contract(abi, contractAddr);
        }
        
        walletCall = contract.methods
        .transfer(toAddr, web3.utils.toWei(amount, unit))
        .send({
            from: fromAddr,
            // value: web3.utils.toHex(web3.utils.toWei('100', 'gwei')),
            gas: gasFee,
            // gas: web3.utils.toHex(42000),
            chainId: targetChainId,
            data: ''
        })
        .on('error', (error, receipt) => {
            console.log('error')
            console.log(error)
            onFail(receipt)
        })
        .then((receipt) => {
            console.log(receipt)
            onSuccess(receipt)
            // processReceipt(receipt, product, currencyName, chain, deliveryType)
        });

        return walletCall
          
      }) 
    // HIDDEN ELSE } 

  })
}

 