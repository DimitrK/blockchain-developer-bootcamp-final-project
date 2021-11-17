import React, {createContext, useContext, useState, useEffect} from 'react';

const EtherscanAbiValueContext = createContext();
const EtherscanAbiSetterContext = createContext();

export const EtherscanAbiProvider = ({children, value = []}) => {
  const [state, setState] = useState(value);

  // const update = useMemo(() => ({
  //   setEtherscanAbi: newAbi => setState(newAbi)
  // }), [])

  // useEffect(() => {
  //   setState(abi);
  // }, [abi]);

  return (
    <EtherscanAbiValueContext.Provider value={state}>
      <EtherscanAbiSetterContext.Provider value={setState}>
        {children}
      </EtherscanAbiSetterContext.Provider>
    </EtherscanAbiValueContext.Provider>
  );
};

export const useEtherscanAbi = () => {
  const context = useContext(EtherscanAbiValueContext);
  if (context === undefined) {
    throw new Error('useAbiState should be wrapped inside a EtherscanAbiValueContext');
  }
  return context;
};

export const useEtherScanAbiSetter = () => {
  const context = useContext(EtherscanAbiSetterContext);
  if (context === undefined) {
    throw new Error('useAbiSetter should be wrapped inside a EtherscanAbiSetterContext');
  }

  return context;
};

export const useAbi = () => {
  return [useEtherscanAbi(), setEtherScanAbi()];
};
