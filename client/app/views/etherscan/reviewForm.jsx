import React, {useState, useEffect} from 'react';
import {useFormContext} from 'react-hook-form';
import {Typography, Space, List, Card} from 'antd';
import {useEtherscanAbi} from '@/shared/providers/etherscanAbi';
import {useGetGasPrice} from '@/shared/hooks/useEtherScan';
import ether from '@/shared/helpers/ether';
import Ether from '@/shared/components/ether';
import logger from '@/shared/logger';

const {Paragraph, Text, Title} = Typography;

const getVariableName = param => param && Object.keys(param.value)[0];
const getVariableValue = param => param && param.value[getVariableName(param)];
const checkIsPayable = param => getVariableName(param) === 'payable';
const calculatePayableAmount = ({payable, gas: estimateGas, gasPrice} = {}) => {
  const BN = web3.utils.BN;
  const fee = new BN('160000000000001');

  const bnPayableAmount = new BN(getVariableValue(payable) || 0);
  const bnGas = new BN(calculateTxGas({gas: estimateGas, payable}));
  const bnGasCost = bnGas.mul(new BN(gasPrice));
  const bnTotalPayableAmount = bnPayableAmount.add(fee).add(bnGasCost).toString();

  return bnTotalPayableAmount;
};

const calculateTxGas = ({gas: estimateGas = 0, payable}) => {
  if (Number(estimateGas) <= 0) {
    return '0';
  }

  const BN = web3.utils.BN;
  const isPayable = !!getVariableValue(payable);
  const bnStipendGas = new BN(2300);
  const bnTransferGas = new BN(21000);
  const bnEstimateGas = new BN(estimateGas);

  const totalGas = bnEstimateGas
    .add(bnStipendGas)
    .add(isPayable ? bnTransferGas : new BN(0))
    .toString();

  logger.table({estimateGas, isPayable, totalGas});

  return totalGas;
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

      setGas(estimatedGas);
    };

    estimateGas();
  }, [payable, gasPrice]);

  if (gasPrice) {
    console.table({gasPrice});
    computedData.current = [
      calculatePayableAmount({payable, gas, gasPrice}),
      abiContract,
      getVariableValue(payable) || 0,
      gasPrice,
      encoded
    ];
  }

  gasError && logger.error(gasError);

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
                    <Ether
                      wei={calculateTxGas({gas, payable}) * ether(proposedGasPriceInGwei, ether.units.GWEI).to.wei()}
                    />
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
