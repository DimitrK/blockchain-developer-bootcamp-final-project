import React, {useMemo, useEffect, useState} from 'react';
import useSWR from 'swr';
import {getAbi} from '@/shared/services/etherscan';
// const options = {};
const options = {revalidateOnFocus: false};
const STATUS_OK = 'OK';
const STATUS_NOT_OK = 'NOTOK';
const noop = _ => _;

const getAbiSWRParams = (selector, ...params) => [new AbortController()].concat(params.length ? [selector, ...params] : []);

export const useGetContractAbi = address => {
  const [controller, ...abiSwrParams] = useMemo(() => getAbiSWRParams('api/contracts/abi', address), [address]);
  const {data: _data, error: _error} = useSWR(abiSwrParams.length ? abiSwrParams.concat(controller) : null, getAbi, options);
  const {data, error} = useMemo(() => {
    if (!address) {
      return {};
    }

    if (_data && _data.message === STATUS_OK) {
      return {data: _data && JSON.parse(_data.result), error: _error};
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
};
