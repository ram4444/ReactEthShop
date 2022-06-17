import Web3 from 'web3';
import axios from 'axios';
import { urls } from '../properties/urls';

const { abiLocal } = require('../abi/ERC777.json');

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

export function getAbi(chain, contractAddr) {
    // Query the abi by the follow url as sample
    // const response = await fetch('https://api-ropsten.etherscan.io/api?module=contract&action=getabi&address=0xC1dcBB3E385Ef67f2173A375F63f5F4361C4d2f9&apikey=YourApiKeyToken');
    
    let apiURL;
    switch (chain) {
      case 'Rinkeby':
        apiURL = urls.etherscan_rinkeby;
        break;
      case 'Mainnet':
        apiURL = urls.etherscan_mainnet;
        break;
      default:
        apiURL = urls.etherscan_rinkeby;
    }
  
    return axios({
      method: 'get',
      url: apiURL+contractAddr,
      responseType: 'json',
    })
      .then((response) => {
        console.log(`HTTP call to ${chain} Etherscan is done`);
        console.log(response);
        return response;
    })
      
}

export async function triggerTransaction(chainName, contractAddr, paymentTokenName, fromAddr, toAddr, amount) {
    let abiUse;
    let contract;
    let walletExist=false;
    let targetChainId=''

    const chainListJSON = getChainlistJSON().then((response) =>
        console.log(response)
    )

    switch (chainName) {
      case 'Rinkeby':
        targetChainId = '0x4';
        break;
      case 'Mainnet':
        targetChainId = '0x1';
        break;
      default:
        targetChainId = '0x4';
    }
    
    // Check wallet exists
    walletExist = await checkWalletExist;


    // Change the current network to target chain
    if (window.ethereum.networkVersion !== targetChainId) {
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
    web3.eth.getGasPrice().then((result) => {
      
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
        case 'Mainnet':
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
        

        // Trigger Transaction
        if (paymentTokenName.includes("Ethereum")) {
            // Special handling for Ethereum
            console.log(`Read to send ${paymentTokenName} with no contract address`)
            web3.eth.sendTransaction({
                from: fromAddr, 
                to: toAddr, 
                value: web3.utils.toWei(amount, 'ether'), 
                gas: gasFee
            })
            .on('error', (error, receipt) => {
                console.log('error')
                console.log(error)
                // handleClose()
            })
            .then((receipt) => {
                console.log(receipt)
                // processReceipt(receipt, product, currencyName, chain, deliveryType)
                // handleClose()
            });
        } else {
            // Other Tokens
            console.log(`Read to send ${paymentTokenName}`)
            
            // Get the ABI from etherscan
            getAbi(chainName, contractAddr).then((response) => {
                if (response.data.status === '1') {
                    console.log(response.data.message);
                    abiUse = JSON.parse(response.data.result);
                    contract = new web3.eth.Contract(abiUse, contractAddr);
                
                } else {
                    // Use local ABI when fail to get
                    console.log(response.message);
                    console.log(response.result);
                    console.log('Query ABI from Etherscan fail, use local ABI file instead');
                    contract = new web3.eth.Contract(abiLocal, contractAddr);
                }
        
                contract.methods
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
                })
                .then((receipt) => {
                    console.log(receipt)
                    // processReceipt(receipt, product, currencyName, chain, deliveryType)
                });
                
            }) 
        }
  
    })
}

 