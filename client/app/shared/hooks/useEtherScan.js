import React, {useMemo, useEffect, useState} from 'react';
import useSWR from 'swr';
import {getAbi, getGasPrice} from '@/shared/services/etherscan';
// const options = {};
const options = {revalidateOnFocus: false};
const STATUS_OK = 'OK';
const STATUS_NOT_OK = 'NOTOK';
const noop = _ => _;

const getAbiSWRParams = (selector, ...params) => [new AbortController()].concat(params.length ? [selector, ...params] : []);

const useEtherScanSWR = function(path, fetcher, ...params) {
  const hasSetParams = arguments.length === 2 || (arguments.length > 2 && params.filter(p => typeof p !== 'undefined').length > 0);
  const [controller, ...swrParams] = useMemo(() => getAbiSWRParams(path, ...params), params);
  const {data: _data, error: _error} = useSWR(hasSetParams ? swrParams.concat(controller) : null, fetcher, options);
  const {data, error} = useMemo(() => {
    if (!hasSetParams) {
      return {};
    }

    if (_data && _data.message === STATUS_OK) {
      let parsedDataResult;
      try {
        parsedDataResult = _data && typeof _data.result === 'string' ? JSON.parse(_data.result) : _data.result;
      } catch(e) {
        parsedDataResult = _data && _data.result;
      }
      return {data: parsedDataResult, error: _error};
    }

    const result = {data: _data, error: _error || (_data && _data.result)};

    return result
  }, [_data, _error]);

  useEffect(() => {
    return () => {
      controller.abort();
    };
  }, []);

  return {data, error, abort: controller.abort.bind(controller)};
}

export const useGetContractAbi = address => {
  return useEtherScanSWR('api/contracts/abi', getAbi, address);
};


export const useGetGasPrice = () => {
  return useEtherScanSWR('api/contracts/gas', getGasPrice);
}
