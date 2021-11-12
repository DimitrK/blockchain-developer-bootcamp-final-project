import React, {forwardRef} from 'react';
import {Select, Space} from 'antd';
import {useGetContractAbi} from '@/shared/hooks/useEtherScan';
const {Option} = Select;

const AbiMethodSelect = forwardRef(({methods = [], ...props}, ref) => {
  // console.log({AbiMethodSelect: props});
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
