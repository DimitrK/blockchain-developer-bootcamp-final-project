import {network} from './constants';
import capitalize from 'lodash/capitalize';

const getNetworkName = (chain) => {
  return capitalize(network[chain] || '');
};

export default getNetworkName;