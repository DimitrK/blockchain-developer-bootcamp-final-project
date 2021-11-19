import React, {useState, useEffect} from 'react';
import {useFormContext} from 'react-hook-form';
import {Typography, Space, List, Card} from 'antd';
import {useEtherscanAbi} from '@/shared/providers/etherscanAbi';
import {useGetGasPrice} from '@/shared/hooks/useEtherScan';
import ether from '@/shared/helpers/ether';
import Ether from '@/shared/components/ether';

const {Paragraph, Text, Title} = Typography;

const getVariableName = param => param && Object.keys(param.value)[0];
const getVariableValue = param => param && param.value[getVariableName(param)];
const checkIsPayable = param => getVariableName(param) === 'payable';
const calculatePayableAmount = ({payable, gas, gasPrice} = {}) => {
  const BN = web3.utils.BN;
  const fee = new BN('160000000000000');

  const bnPayableAmount = new BN(getVariableValue(payable) || 0);
  const bnGas = new BN(gas);
  const bnGasCost = bnGas.mul(new BN(gasPrice));
  return bnPayableAmount.add(fee).add(bnGasCost).toString();
};

const calculateTxGas = ({gas: estimateGas, payable}) => {
  const BN = web3.utils.BN;
  const isPayable = !!getVariableValue(payable);
  const stipendGas = new BN('2300');
  const transferGas = new BN('21000');

  return new BN(estimateGas)
    .add(stipendGas)
    .add(isPayable ? transferGas : new BN(0))
    .toString();
};

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

const FormReview = ({computedData = []}) => {
  const [gas, setGas] = useState();
  const abiData = useEtherscanAbi();
  const {data: gasPriceResult, error: gasError} = useGetGasPrice();
  const {getValues} = useFormContext();
  const {abiContract, abiMethod, abiParam = []} = getValues();
  const payable = abiParam.find(checkIsPayable);
  const {ProposeGasPrice: proposedGasPriceInGwei} = gasPriceResult || {};
  const gasPrice = proposedGasPriceInGwei ? web3.utils.toWei(`${proposedGasPriceInGwei}`, 'gwei') : '0';

  const contract = new web3.eth.Contract(abiData, abiContract);
  const params = abiParam.filter(p => !checkIsPayable(p)).map(getVariableValue);
  const encoded = contract.methods[abiMethod](...params).encodeABI();

  useEffect(() => {
    if (!gasPrice) {
      return;
    }
    const estimateGas = async () => {
      const estimatedGas = await web3.eth.estimateGas({
        to: abiContract,
        data: encoded,
        value: getVariableValue(payable) || 0
      });

      setGas(estimateGas);
    };

    estimateGas();
  }, [payable, gasPrice]);

  computedData.current = [
    calculatePayableAmount({payable, gas, gasPrice}),
    abiContract,
    getVariableValue(payable) || 0,
    gas,
    calculateTxGas({gas, payable}),
    gasPrice,
    encoded
  ];

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
                    <Ether wei={calculateTxGas({gas, payable}) * ether(proposedGasPriceInGwei, ether.units.GWEI).to.wei()} />
                  </Text>
                  <Text>
                    <Ether wei={calculateTxGas({gas, payable}) * gasPrice} />
                  </Text>
                </div>
                <Text type="secondary">
                  {' '}
                  · Gas: {gas} | Gas price: {gasPrice}
                </Text>
              </Space>
            </List.Item>
          )}
        </List>
        <Text secondary>Debug:</Text>
        <Text secondary>{encoded}</Text>
      </Card>
    </div>
  );
};

export default FormReview;
