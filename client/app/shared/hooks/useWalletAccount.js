import { useEffect, useState, useMemo, useCallback } from 'react';
import logger from '@/shared/logger';
import Web3 from 'web3';

function connect(handleAccountsChanged, handleAccountFailed) {
  ethereum
    .request({ method: 'eth_requestAccounts' })
    .then(handleAccountsChanged)
    .catch((err) => {
      if (err.code === 4001) {
        // EIP-1193 userRejectedRequest error
        // If this happens, the user rejected the connection request.
        logger.log('Please connect to MetaMask.');
      } else {
        logger.error(err);
      }
      handleAccountFailed(err);
    });
}

const useWalletAccount = () => {
  const [account, setAccount] = useState();
  const [error, setError] = useState();

  window.web3 = useMemo(() => new Web3(Web3.givenProvider), []);

  const handleAccountsChanged = useCallback((accounts) => {
    if (!ethereum.isConnected() || accounts.length === 0) {
      setAccount(undefined);
    }

    if (accounts[0] !== account) {
      setAccount(accounts[0]);
      // Do any other work!
    }

    setError(undefined);
  }, [account]);

  const handleConnected = useCallback(() => {
    ethereum.request({ method: 'eth_accounts' })
      .then(handleAccountsChanged);
  }, [handleAccountsChanged]);

  const handleChainChanged = (_chainId) => {
    window.location.reload();
  }

  useEffect(() => {
    if (!account) {
      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);
      ethereum.on('disconnect', handleAccountsChanged);
      ethereum.on('connect', handleConnected);
      connect(handleAccountsChanged, setError);
    }
  }, [account, handleAccountsChanged])

  return {account, error};
}

export default useWalletAccount;

// const getWeb3 = async () => {
//   const web3 = new Web3(Web3.givenProvider);

//   if (window.ethereum) {
//     await window.ethereum.enable();
//   }
//   ]}

//   return web3 = new 
// }