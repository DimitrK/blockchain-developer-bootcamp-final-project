import React, {useEffect, useState, useContext, useMemo, useCallback, createContext} from 'react';
import logger from '@/shared/logger';
import {useEthProviders} from './ethereum';

const WalletContext = createContext();

function connect(handleAccountsChanged, handleAccountFailed, ethereum) {
  ethereum
    .request({method: 'eth_requestAccounts'})
    .then(handleAccountsChanged)
    .catch(err => {
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

export const WalletProvider = ({children}) => {
  const providers = useEthProviders();
  const {ethereum, web3} = providers;
  const [account, setAccount] = useState();
  const [error, setError] = useState();
  const [balance, setBalance] = useState();
  const [subscription, setSubscription] = useState();

  const handleAccountsChanged = useCallback(
    accounts => {
      if (!ethereum.isConnected() || accounts.length === 0) {
        setAccount(undefined);
      }

      if (accounts[0] !== account) {
        setAccount(accounts[0]);
      }

      setError(undefined);
    },
    [account, ethereum]
  );

  const handleConnected = useCallback(() => {
    ethereum.request({method: 'eth_accounts'}).then(handleAccountsChanged);
  }, [handleAccountsChanged, ethereum]);


  // First page run, in case a wallet is already connected
  useEffect(() => {
    if (ethereum.isConnected()) {
      ethereum.request({method: 'eth_accounts'}).then(handleAccountsChanged);
    }
  }, []);

  // hook
  useEffect(() => {
    if (ethereum && !account) {
      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('disconnect', handleAccountsChanged);
      ethereum.on('connect', handleConnected);
    }

  }, [account, handleAccountsChanged, handleConnected, ethereum]);

  useEffect(() => {
    if (!account) {
      setBalance(undefined);
      subscription && subscription.unsubscribe(() => setSubscription());
      return;
    }
    if (subscription) {
      return;
    }
    web3.eth.getBalance(account).then(setBalance);
    const _subscription = web3.eth
      .subscribe('newBlockHeaders')
      .on('connected', () => {
        setSubscription(_subscription);
      })
      .on('data', () => {
        web3.eth.getBalance(account).then(setBalance);
      });
  }, [web3, account, subscription]);

  const actions = useMemo(
    () => ({
      connect: () => {
        !account && connect(handleAccountsChanged, setError, ethereum);
      },
      balance,
      wallet: account,
      error: error
    }),
    [connect, account, error, ethereum, web3, balance]
  );

  return <WalletContext.Provider value={actions}>{children}</WalletContext.Provider>;
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet should be wrapped inside a WalletContext');
  }
  return context;
};
