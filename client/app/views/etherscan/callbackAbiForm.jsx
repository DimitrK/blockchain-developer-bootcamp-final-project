import React, {useState, useCallback, useMemo} from 'react';
import AbiMethodSelect from '@/views/etherscan/methodSelect';
import {Typography, Space, Form, Empty} from 'antd';
import {useEtherscanAbi} from '@/shared/providers/etherscanAbi';
import {useFormContext, useFieldArray} from 'react-hook-form';
import {ControlledFormInput} from '@/components/form/input';
import EthAddressInput from '@/components/form/input/ethAddress';
import EtherInput from '@/components/form/input/ether';
import NumberInput from '@/components/form/input/number';

const {Text} = Typography;

const formItemLayout = {
  labelCol: {
    xs: {span: 24},
    sm: {span: 6}
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 14}
  }
};

const getParameterFieldName = (field, index) => `abiParam.${index}.value.${field.name}`;

const CallbackAbiForm = props => {
  const formContextMethods = useFormContext();
  const fieldArrayMethods = useFieldArray({
    name: 'abi'
  });
  debugger;
  const {register, unregister} = formContextMethods;
  const {fields, replace, append} = fieldArrayMethods;
  const abiData = useEtherscanAbi();
  if (!abiData) return null;
  const [selectedMethod, setSelectedMethod] = useState();

  const onlyFunctions = useMemo(() => abiData.filter(dat => dat.type === 'function'), [abiData]);
  const getFuncByName = name => {
    const func = onlyFunctions.find(func => func.name === name);
    return func;
  };

  const handleFunctionSelected = useCallback(
    name => {
      const method = getFuncByName(name);
      setSelectedMethod(method);
      fields.forEach((field, i) => unregister(getParameterFieldName(field, i)));
      replace(method.inputs.map(({name, type}) => ({[name]: '', name, type})));
      if (method.payable || method.stateMutability === 'payable') {
        append({payable: 0, name: 'payable', type: 'ether'});
      }
    },
    [onlyFunctions, fields]
  );

  const inputs = useMemo(() => {
    return fields.map((field, index) => {
      const formFieldName = getParameterFieldName(field, index);
      const addedProps = {};

      let ResolvedInput;
      switch (field.type) {
        case 'address':
          addedProps.as = EthAddressInput;
          break;
        case field.type.match(/^u?int/)?.input:
          addedProps.as = NumberInput;
          addedProps.type = field.type;
          break;
        case 'ether':
          addedProps.label = 'Ether amount';
          addedProps.tooltip = 'You need to pay this amount';
          addedProps.as = EtherInput;
          break;
        default:
          break;
      }

      return (
        <ControlledFormInput
          {...addedProps}
          required
          key={field.id + '.label'}
          inputKey={field.id}
          label={field.name}
          name={formFieldName}
        />
      );
    });
  }, [fields, selectedMethod]);

  const inputProps = useMemo(() => ({
    methods: onlyFunctions,
    onChange: handleFunctionSelected
  }), [onlyFunctions, handleFunctionSelected])

  return onlyFunctions.length ? (
    <>
      <ControlledFormInput as={AbiMethodSelect} name="abiMethod" inputProps={inputProps} required label="Select method to execute"/>
      {selectedMethod && selectedMethod.inputs.length === 0 && (
        <div className="text-center">
          <Text type="secondary">You can not parametrize this call to smart contract</Text>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      )}
      {inputs}
    </>
  ) : (
    <div className="text-center">
      <Text type="secondary">No functions found</Text>
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
    </div>
  );
};

export default CallbackAbiForm;
//0x5969c6afdf69ebf671f46ced3461d55969deef3c
