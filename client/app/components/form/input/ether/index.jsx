import React, {useState, useCallback, useEffect, forwardRef} from 'react';
import {InputNumber, Input, Select} from 'antd';
import ether from '@/shared/helpers/ether';
import {$reactHookForm} from '../symbols';
const {Option} = Select;
const noop = _ => _;

const UnitSelect = (props) => (
  <Select {...props} defaultValue="wei" className="select-after">
    <Option value={ether.units.ETH}>ether</Option>
    <Option value={ether.units.GWEI}>gwei</Option>
    <Option value={ether.units.WEI}>wei</Option>
  </Select>
);

const EtherInput = forwardRef(({placeholder = '1', defaultValue, value: _value, onChange = noop, ...props}, ref) => {
  const [value, setValue] = useState(defaultValue || _value);
  const [unit, setUnit] = useState(ether.units.WEI);

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
        value: `${ether(value, unit).to.wei()}`
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
