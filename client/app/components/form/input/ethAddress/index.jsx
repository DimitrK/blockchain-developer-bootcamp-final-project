import React, {useState, useCallback, useEffect, forwardRef} from 'react';
import {Input} from 'antd';
import {$reactHookForm} from '../symbols';
const noop = _ => _;

const AddressInput = forwardRef(({onAddressChange = noop, placeholder = '0x0000000000000000000', defaultValue, value: _value, onChange = noop, ...props}, ref) => {
  const [address, setAddress] = useState();
  const [value, setValue] = useState(defaultValue || _value);
  // console.log({AddressInput: {value, _value, defaultValue, ...props}});
  const handleValueChange = useCallback(
    e => {
      setValue(e.target.value);
      onChange(e);
    },
    [onChange]
  );

  if (value && value.trim() && web3.utils.isAddress(value)) {
    if (value !== address) {
      setAddress(value);
    }
  } else {
    if (address) {
      setAddress('');
    }
  }

  useEffect(() => {
    if (address === undefined) {
      return;
    }
    onAddressChange(address);
  }, [address]);

  return <Input ref={ref} {...props} addonBefore="address" placeholder={placeholder} maxLength="42" onChange={handleValueChange} value={value} />;
});

AddressInput[$reactHookForm] = {
  rules: {
    validate: {
      isAddress: value => web3.utils.isAddress(value) || 'should be a valid address',
    },
  }
};

export default AddressInput;
