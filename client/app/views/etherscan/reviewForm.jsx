import React, {useState, useEffect} from 'react';
import {useFormContext} from 'react-hook-form';
import {useEtherscanAbi} from '@/shared/providers/etherscanAbi';
import {useGetGasPrice} from '@/shared/hooks/useEtherScan';
import {Typography, Space, List, Card} from 'antd';
import ether from '@/shared/helpers/ether';
import Ether from '@/shared/components/ether';
const {Paragraph, Text, Title} = Typography;

const getVariableName = param => param && Object.keys(param.value)[0];
const getVariableValue = param => param && param.value[getVariableName(param)];
const getMethodParamType = (method, paramIndex) => 'address';
const checkIsPayable = param => getVariableName(param) === 'payable';
const getFunctionSignature = ({abi, method, params = []}) => {
  const abiFn = getByName(abi, method);
  const methodTypes = abiFn.inputs.map(input => input.type);
  const encodedParams = params
    .filter(p => !checkIsPayable(p))
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
  const {data: gasPriceResult, error: gasError} = useGetGasPrice();
  const {getValues} = useFormContext();
  const {abiContract, abiMethod, abiParam = []} = getValues();
  const payable = abiParam.find(checkIsPayable);
  const {ProposeGasPrice: gasPrice} = gasPriceResult || {};

  useEffect(() => {
    if (!gasPrice) {
      return;
    }
    const estimateGas = async () => {
      const gas = await web3.eth.estimateGas({
        to: abiContract,
        data: getFunctionSignature({abi: abiData, method: abiMethod, params: abiParam}),
        value: getVariableValue(payable)
      });

      setGas(gas);
    };

    estimateGas();
  }, [payable, gasPrice]);

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
          {gas && gasPrice && (
            <List.Item key={'gas'}>
              <Space>
                <div>
                  <Text keyboard>Total gas cost (in ether)</Text> :{' '}
                  <Text>
                    <Ether wei={gas * ether(gasPrice, ether.units.GWEI).to.wei()} />
                  </Text>
                </div>
                <Text type="secondary">
                  {' '}· Gas: {gas} | Gas price: {gasPrice}
                </Text>
              </Space>
            </List.Item>
          )}
        </List>
        <Text>{getFunctionSignature({abi: abiData, method: abiMethod, params: abiParam})}</Text>
      </Card>
    </div>
  );
};

export default FormReview;
