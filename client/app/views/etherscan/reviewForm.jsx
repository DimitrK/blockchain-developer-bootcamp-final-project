import React, {useState, useEffect} from 'react';
import {useFormContext} from 'react-hook-form';
import {useEtherscanAbi} from '@/shared/providers/etherscanAbi';
import {Typography, Space, List, Card} from 'antd';
const {Paragraph, Text, Title} = Typography;

const getVariableName = param => Object.keys(param.value)[0];
const getVariableValue = param => param.value[getVariableName(param)];
const getMethodParamType = (method, paramIndex) => 'address';
const getFunctionSignature = ({abi, method, params = []}) => {
  debugger;
  const abiFn = getByName(abi, method);
  const methodTypes = abiFn.inputs.map(input => input.type);
  const encodedParams = params
    .map(getVariableValue)
    .map((val, i) => web3.eth.abi.encodeParameter(methodTypes[i], val).substring(2));
  const functionSignature = web3.eth.abi.encodeFunctionSignature(`${method}(${methodTypes.join(',')})`);
  const data = functionSignature + encodedParams.join('');
  return data;
};
const getByName = (abi, name) => {
  const func = abi.find(func => func.name === name);
  return func;
};

const FormReview = () => {
  const [gas, setGas] = useState();
  const abiData = useEtherscanAbi();
  const {getValues} = useFormContext();
  const {abiContract, abiMethod, abiParam = []} = getValues();

  useEffect(() => {
    const estimateGas = async () => {
      const gas = await web3.eth.estimateGas({
        to: abiContract,
        data: getFunctionSignature({abi: abiData, method: abiMethod, params: abiParam})
      });

      setGas(gas);
    }

    estimateGas();
  }, []);

  return (
    <div>
      <Title level={2}>Overview:</Title>
      <Space />
      <Paragraph>
        Calling method <Text code>{abiMethod}</Text> on address{' '}
        <Text type="danger" copyable>
          {abiContract}
        </Text>{' '}
        with params:
      </Paragraph>
      <Space />
      <Card>
        <List>
          {abiParam.map((p, i) => {
            return (
              <List.Item key={i}>
                <Text>
                  <Text code>{getVariableName(p)}</Text> : <Text copyable>{getVariableValue(p)}</Text>
                </Text>
              </List.Item>
            );
          })}
        </List>
        <Text>{getFunctionSignature({abi: abiData, method: abiMethod, params: abiParam})}</Text>
        {gas && <Text>Gas: {gas}</Text>}
      </Card>
    </div>
  );
};

export default FormReview;
