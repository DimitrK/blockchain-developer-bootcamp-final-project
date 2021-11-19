import config from '@/config';
import serializeResponse from '@/shared/helpers/serializeResponse';
import getEtherscanApiUrl from '@/shared/helpers/network/getEtherscanApiUrl';

const etherScanClient = async (query, abortController = {}) => {
  const url = process.env.ETHERSCAN_API_URL;
  const params = new URLSearchParams({
    apikey: process.env.ETHERSCAN_API_KEY,
    ...query
  });

  const ops = abortController instanceof AbortController ? {signal: abortController.signal} : {};
  const fetchResponse = await fetch(`${url}?${params.toString()}`, ops);
  const serialized = await serializeResponse(fetchResponse);

  return serialized;
};

export const getAbi = (path, address, controller) => {
  return etherScanClient({action: 'getabi', address, module: 'contract'}, controller);
};

export const getGasPrice = (controller) => {
  return etherScanClient({action: 'gasoracle', module: 'gastracker'}, controller);
}

