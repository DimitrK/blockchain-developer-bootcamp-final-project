import React, {useEffect, useState, useContext, useMemo, createContext} from 'react';
import detectProvider from '@metamask/detect-provider';
import Web3 from 'web3';
import getNetworkName from '@/shared/helpers/network/getNetworkName';

const EthProviderContext = createContext();
const EthInfoContext = createContext();

export const EthereumProvider = ({children}) => {
  const [ethereum, setEthereum] = useState(window.ethereum || null);
  const [web3, setWeb3] = useState();
  const [version, setVersion] = useState(0);
  const [chain, setChain] = useState('');
  const [network, setNetwork] = useState('');

  useEffect(() => {
    const loadProviders = async () => {
      const detectedEth = await detectProvider();
      if (detectedEth !== ethereum) {
        console.warn('Different ethereum provider detected.');
        setEthereum(detectedEth);
      }

      window.web3 = new Web3(ethereum);
      setWeb3(window.web3);

      detectedEth && detectedEth.on('chainChanged', () => window.location.reload());
    };
    loadProviders();
  }, []);

  useEffect(() => {
    const loadEthInfo = async () => {
      const chainId = await ethereum.request({method: 'eth_chainId'});
      const chainNumber = parseInt(chainId, 16);
      setChain(chainNumber);
      setNetwork(getNetworkName(chainNumber));

      const netVersion = await ethereum.request({method: 'net_version'});
      setVersion(netVersion);
    };

    loadEthInfo();
  }, [ethereum]);


  const info = useMemo(
    () => ({
      version,
      chain,
      network
    }),
    [version, chain, network]
  );

  const providers = useMemo(
    () => ({
      web3,
      ethereum,
      getGasPrice: () => {}
    }),
    [ethereum, web3]
  );

  return (
    <EthProviderContext.Provider value={providers}>
      <EthInfoContext.Provider value={info}>{children}</EthInfoContext.Provider>
    </EthProviderContext.Provider>
  );
};

export const useEthInfo = () => {
  const context = useContext(EthInfoContext);
  if (context === undefined) {
    throw new Error('useAbiState should be wrapped inside a EtherscanAbiValueContext');
  }
  return context;
};

export const useEthProviders = () => {
  const context = useContext(EthProviderContext);
  if (context === undefined) {
    throw new Error('useAbiSetter should be wrapped inside a EtherscanAbiSetterContext');
  }

  return context;
};
