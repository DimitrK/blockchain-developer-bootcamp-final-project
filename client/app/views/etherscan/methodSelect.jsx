import React, {forwardRef} from 'react';
import {Select, Space} from 'antd';
const {Option} = Select;

const AbiMethodSelect = forwardRef(({methods = [], ...props}, ref) => {
  const methodNames = methods.map(func => func.name);
  return (
    <Select {...props} defaultValue={props.defaultValue || props.value} showSearch={methods.length > 5} optionFilterProp="children" placeholder="Select a function" ref={ref}>
      {methodNames.map(name => (
        <Option key={name} value={name}>
          {name}
        </Option>
      ))}
    </Select>
  );
});

export default AbiMethodSelect;
