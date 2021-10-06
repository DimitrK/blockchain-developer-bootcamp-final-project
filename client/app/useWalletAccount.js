import { useEffect, useState, useMemo, useCallback } from 'react';
import Web3 from 'web3';
const web3PollInterval = 1000;

const _useWalletAccount = () => {
  const web3 = useMemo(() => new Web3(Web3.givenProvider), []);
  const [account, setAccount] = useState();
  const [candidateAccount, setCandidateAccount] = useState();

  let interval;

  useEffect(() => {
    if (!web3) {
      return;
    }
    clearInterval(interval);
    interval = setInterval(async () => {
      const [newAccount] = await ethereum.request({ method: 'eth_accounts' });
      if (newAccount !== account) {
        // window.ethereum.enable();
        setCandidateAccount(newAccount);
      }
      if (!account || candidateAccount === newAccount) {
        setAccount(newAccount);
      }
    }, web3PollInterval);

  }, [web3, account, candidateAccount]);

  return account;
};


function connect(handleAccountsChanged) {
  ethereum
    .request({ method: 'eth_requestAccounts' })
    .then(handleAccountsChanged)
    .catch((err) => {
      if (err.code === 4001) {
        // EIP-1193 userRejectedRequest error
        // If this happens, the user rejected the connection request.
        console.log('Please connect to MetaMask.');
      } else {
        console.error(err);
      }
    });
}

const useWalletAccount = () => {
  const [account, setAccount] = useState();
  console.log({p: Web3.givenProvider})
  window.web3 = useMemo(() => new Web3(Web3.givenProvider), []);

  const handleAccountsChanged = useCallback((accounts) => {
    if (!ethereum.isConnected() || accounts.length === 0) {
      setAccount(undefined);
    }

    if (accounts[0] !== account) {
      setAccount(accounts[0]);
      // Do any other work!
    }
  }, [account, setAccount]);

  const handleConnected = useCallback(() => {
    ethereum.request({ method: 'eth_accounts' })
      .then(handleAccountsChanged);
  }, [handleAccountsChanged]);

  const handleChainChanged = (_chainId) => {
    // We recommend reloading the page, unless you must do otherwise
    window.location.reload();
  }

  useEffect(() => {
    if (!account) {
      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);
      ethereum.on('disconnect', handleAccountsChanged);
      ethereum.on('connect', handleConnected);
      connect(handleAccountsChanged);
    }
  }, [account, handleAccountsChanged])

  return account;
}

export default useWalletAccount;
