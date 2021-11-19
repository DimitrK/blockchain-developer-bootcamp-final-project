import React, {Component} from 'react';
import Address from '@/components/address';
import Ether from '@/shared/components/ether';
import {useWallet} from '@/shared/providers/wallet';
import {useEthInfo} from '@/shared/providers/ethereum';

const NetworkInfo = props => {
  const {balance, wallet, error} = useWallet();
  const {network} = useEthInfo();

  if (wallet > 0) {
    return (
      <div>
        <span className="has-text-success">{'\u2b24'}</span> &nbsp; {network} | 
        <Address address={wallet} toggleFull={true} /> | <Ether wei={balance} />
      </div>
    );
  } else {
    return null;
  }
};

export default NetworkInfo;