import React, {useState, useEffect} from 'react';
import {useFormContext} from 'react-hook-form';
import {Typography, Space, List, Card} from 'antd';
import {useEtherscanAbi} from '@/shared/providers/etherscanAbi';
import {useGetGasPrice} from '@/shared/hooks/useEtherScan';
import ether from '@/shared/helpers/ether';
import Ether from '@/shared/components/ether';
import logger from '@/shared/logger';
import getOracleAddress from '@/shared/helpers/network/getOracleAddress';

const {Paragraph, Text, Title} = Typography;

const getVariableName = param => param && Object.keys(param.value)[0];
const getVariableValue = param => param && param.value[getVariableName(param)];
const checkIsPayable = param => getVariableName(param) === 'payable';
const calculatePayableAmount = ({payable = '0', gas: estimateGas, gasPrice} = {}) => {
  const BN = web3.utils.BN;
  const fee = new BN('150000000000000000');

  const bnPayableAmount = new BN(payable);
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
  const isPayable = !!payable;
  const bnStipendGas = new BN(2300);
  const bnTransferGas = new BN(21000);
  const bnAutomationExecutionGas = new BN(21000);
  const bnPostTransferGas = new BN(20000)
  const bnEstimateGas = new BN(estimateGas);

  const totalGas = bnEstimateGas
    .add(bnStipendGas)
    .add(bnAutomationExecutionGas)
    .add(isPayable ? bnTransferGas : new BN(0))
    .add(bnPostTransferGas)
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
  const {abiContract, abiMethod, abiParams = []} = getValues();
  const payable = getVariableValue(abiParams.find(checkIsPayable)) || 0;
  const {ProposeGasPrice: proposedGasPriceInGwei} = gasPriceResult || {};
  const gasPrice = proposedGasPriceInGwei ? web3.utils.toWei(`${proposedGasPriceInGwei}`, 'gwei') : '0';

  const contract = new web3.eth.Contract(abiData, abiContract);
  const params = abiParams.filter(p => !checkIsPayable(p)).map(getVariableValue);
  const encoded = contract.methods[abiMethod](...params).encodeABI();

  useEffect(() => {
    if (!gasPrice) {
      return;
    }
    const estimateGas = async () => {
      const estimatedGas = await web3.eth.estimateGas({
        to: abiContract,
        data: encoded,
        value: payable
      });

      setGas(estimatedGas);
    };

    estimateGas();
  }, [payable, gasPrice]);

  if (gasPrice) {
    getOracleAddress().then(oracle => {
      console.table({gasPrice});
      const exampleOracleQuery = [
        web3.eth.abi.encodeParameter('uint256', 3000),
        3, //LT
        oracle
      ]
      computedData.current = [
        calculatePayableAmount({payable, gas, gasPrice}),
        abiContract,
        payable,
        gasPrice,
        encoded,
        ...exampleOracleQuery
      ];

    })
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
          {abiParams.map((p, i) => {
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
                    <Ether wei={calculateTxGas({gas, payable}) * gasPrice} />
                  </Text>
                </div>
                <Text type="secondary">
                  {' '}
                  · Gas: {calculateTxGas({gas, payable})} | Gas price: {gasPrice}
                </Text>
              </Space>
            </List.Item>
          )}
        </List>
      </Card>
    </div>
  );
};

export default FormReview;
