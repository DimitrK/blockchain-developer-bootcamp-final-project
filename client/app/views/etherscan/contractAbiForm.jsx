import React, {useState, useCallback, useEffect, useMemo} from 'react';
import {Space, Button, Form} from 'antd';
import {useFormContext} from 'react-hook-form';
import {useController} from 'react-hook-form';
import EthAddressInput from '@/components/form/input/ethAddress';
import {useGetContractAbi} from '@/shared/hooks/useEtherScan';
import {useEtherScanAbiSetter} from '@/shared/providers/etherscanAbi';
import {ControlledFormInput} from '@/components/form/input';
import EtherInput from '@/components/form/input/ether';
import NumberInput from '@/components/form/input/number';

const AddressAbiForm = ({onValid}) => {
  const [query, setQuery] = useState();
  const {data, error, abort} = useGetContractAbi(query);
  const isFetching = query && !data;
  const isButtonDisabled = isFetching || error;
  const {register} = useFormContext();
  const setEtherscanAbi = useEtherScanAbiSetter();

  const handleEtherscanSearch = useCallback(
    address => {
      if (query !== address) {
        setQuery(address);
      }
    },
    [query]
  );

  const abortFetchingRequest = useCallback(() => {
    if (!query) {
      return;
    }
    setQuery(undefined);
    abort && abort();
  }, [abort, query]);

  useEffect(() => {
    setEtherscanAbi(data);
  }, [data]);

  const isLoading = !data && query ? true : false;

  const extraProps = useMemo(() => ({
    inputProps: {
      name: "abiContract",
      onAddressChange: handleEtherscanSearch,
      onChange: abortFetchingRequest
    }
  }), [handleEtherscanSearch, abortFetchingRequest])

  return (
    <>
    <ControlledFormInput
      {...extraProps}
      required
      as={EthAddressInput}
      label="smart contract"
      error={error && `Can not find valid contract on this address (${query})`}
      loading={isLoading}
    />
    </>
  );
};

export default AddressAbiForm;
