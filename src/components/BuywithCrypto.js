import React from 'react';
import Web3 from 'web3';
import PropTypes from 'prop-types';
import { styled } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import { contractAddr } from '../properties/contractAddr';

const web3 = new Web3(window.web3.currentProvider);
const { abi } = require('../abi/ERC777.json');

const contract = new web3.eth.Contract(abi, contractAddr.T777R);

const ONBOARD_TEXT = 'Buy with Crypto';

BuywithCrypto.propTypes = {
  amountTransfer: PropTypes.string,
  toAddr: PropTypes.string
};

function BuywithCrypto({ amountTransfer, toAddr }) {
  const [buttonText] = React.useState(ONBOARD_TEXT);
  const [isDisabled] = React.useState(false);

  // console.log(amountTransfer);
  // console.log(toAddr);

  let acc = [];

  function ivkContractFuncBySEND(acct) {
    contract.methods
      .transfer(toAddr, web3.utils.toWei(amountTransfer, 'ether'))
      .send({
        from: acct,
        // value: web3.utils.toHex(web3.utils.toWei('100', 'gwei')),
        gasPrice: web3.utils.toHex(web3.utils.toWei('100', 'gwei')),
        // gas: web3.utils.toHex(42000),
        chainId: 4,
        data: ''
      })
      .then(console.log);
  }

  const onClick = () => {
    // Sending Ethereum to an address
    acc = window.ethereum.request({ method: 'eth_requestAccounts' });
    acc.then((result) => ivkContractFuncBySEND(result[0]));
  };
  return (
    <Button variant="contained" sx={{ mb: 5, mt: 2 }} disabled={isDisabled} onClick={onClick}>
      {buttonText}
    </Button>
  );
}

export default BuywithCrypto;
