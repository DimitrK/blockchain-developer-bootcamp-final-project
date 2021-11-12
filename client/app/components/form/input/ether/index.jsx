import React, {useState, useCallback, useEffect, forwardRef} from 'react';
import {InputNumber, Input, Select} from 'antd';
import {$reactHookForm} from '../symbols';
const {Option} = Select;
const noop = _ => _;

const UnitSelect = (props) => (
  <Select {...props} defaultValue="wei" className="select-after">
    <Option value="18">ether</Option>
    <Option value="9">gwei</Option>
    <Option value="0">wei</Option>
  </Select>
);

const EtherInput = forwardRef(({placeholder = '1', defaultValue, value: _value, onChange = noop, ...props}, ref) => {
  const [value, setValue] = useState(defaultValue || _value);
  const [unit, setUnit] = useState('0');

  const handleValueChange = useCallback(e => {
    setValue(e.target.value);
  }, []);

  const handleUnitChange = useCallback(unit => {
    setUnit(unit);
  }, []);

  useEffect(() => {
    if (value?.toString() === _value?.toString()) {
      return;
    }

    onChange({
      target: {
        value: `${(Number(value) * 10 ** Number(unit))}`
      }
    });
  }, [unit, value, _value]);

  const visualValue = _value && _value / 10 ** unit || value;

  return (
    <Input
      ref={ref}
      {...props}
      addonBefore='payable'
      addonAfter={<UnitSelect onChange={handleUnitChange} value={unit} />}
      placeholder={placeholder}
      onChange={handleValueChange}
      value={visualValue}
    />
  );
});

EtherInput[$reactHookForm] = {
  rules: {
    validate: {
      onlyNumber: val => !isNaN(val) || 'amount can be only number'
    }
  }
}

export default EtherInput;
