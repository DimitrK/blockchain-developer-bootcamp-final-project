import React, {useEffect, useCallback, useState} from 'react';
import {Input} from 'antd';
import {$reactHookForm} from '../symbols';

const noop = _ => _;
const getAdditionalProps = (type, value) => {
  const moreProps = {};

  if (!value || isNaN(value)) {
    return;
  }
  let size = Number(type.replace(/[a-zA-Z]/g, ''));
  if (isNaN(size) || size > 256 || size < 2) {
    size = 256;
  }

  const intValue = BigInt(value);
  moreProps.value = `${value}`.replace(/[^0-9.]/g, '');

  if (type.startsWith('uint')) {
    const hexFs = Array(size / 4).fill('F');
    const maxNumber = BigInt(`0x${hexFs.join('')}`);

    moreProps.min = 0;
    moreProps.max = maxNumber;
    moreProps.maxLength = maxNumber.toString().length;
    moreProps.step = '1';

    if (intValue < 0) {
      moreProps.value = 0;
    }

    if (intValue > moreProps.max) {
      morePRops.value = maxNumber;
    }
  }

  if (type.startsWith('int')) {
    const hexFs = Array(size / 4 - 1).fill('F');
    hexFs.unshift('7');
    const maxNumber = BigInt(`0x${hexFs.join('')}`);
    moreProps.min = -maxNumber - BigInt(1);
    moreProps.max = maxNumber;
    moreProps.maxLength = maxNumber.toString().length;
    moreProps.step = '1';

    if (intValue < moreProps.min) {
      moreProps.value = moreProps.min;
    }

    if (intValue > moreProps.max) {
      morePRops.value = maxNumber;
    }
  }

  return JSON.parse(JSON.stringify(moreProps, (key, value) => {
    return typeof value === 'bigint' ? value.toString() : value;
  }));
};

const InputNumber = ({placeholder = '0', type = 'uint256', defaultValue, value: _value, onChange, ...props}) => {
  const [value, setValue] = useState(defaultValue || _value);
  const {value: moreValue, ...moreProps} = getAdditionalProps(type, value) || {};

  // console.log({InputNumber: {value, _value, ...props}})
  const handleChange = useCallback(
    e => {
      setValue(e.target.value);
    },
    [type, value]
  );

  useEffect(() => {
    if (moreValue !== value) {
      setValue(moreValue);
    }

    if (value === moreValue && value === _value) {
      return;
    }

    onChange({target: {value: moreValue}});
  }, [_value, value, moreValue]);

  return (
    <Input
      {...props}
      {...moreProps}
      value={moreValue && moreValue.toString() || _value}
      onChange={handleChange}
      addonBefore={type}
      placeholder={placeholder}
    />
  );
};

InputNumber[$reactHookForm] = {
  rules: {
    validate: {
      onlyNumber: val => !isNaN(val) || 'amount can be only number'
    }
  }
};

export default InputNumber;
