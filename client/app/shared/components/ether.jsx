import React, {Component} from 'react';
import ether from '@/shared/helpers/ether';

const Ether = ({wei, ...props}) => {
  if (!wei) {
    return '--';
  }
  return `${parseFloat(ether(wei, ether.units.WEI).to.eth()).toFixed(5)} Ξ`
}

export default Ether;
