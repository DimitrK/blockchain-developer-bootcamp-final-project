import React, {useState, useCallback, useEffect, useRef} from 'react';
import {useForm, FormProvider} from 'react-hook-form';
import {Steps, Button, Layout, Space, Divider} from 'antd';
import {EtherscanAbiProvider} from '@/shared/providers/etherscanAbi';
import getAutomatonContract from '@/shared/helpers/network/getAutomatonContract';
import ContractAbiForm from './contractAbiForm';
import CallbackAbiForm from './callbackAbiForm';
import ReviewForm from './reviewForm';
import styles from './styles.scss';
import logger from '@/shared/logger';
import {useWallet} from '@/shared/providers/wallet';

const {Content, Footer, Sider} = Layout;
const {Step} = Steps;

const getFormFromStep = step => {
  switch (step) {
    case 0:
      return ContractAbiForm;
    case 1:
      return CallbackAbiForm;
    case 2:
      return ReviewForm;
    default:
      return () => <p>The form has been submitted</p>;
  }
};

export const _AbiForm = ({form, ...props}) => {
  const [step, setStep] = useState(0);
  const [stepEnabled, setStepEnabled] = useState(false);
  const [status, setStatus] = useState('initial'); // initial, fetching, error, completed
  const computedDataRef = useRef([]);
  const {wallet} = useWallet();

  const {trigger: validate} = form;
  const isFirstStep = step === 0;
  const isLastStep = step === 2;

  const onSubmit = useCallback(
    data => {
      const submitToContract = async () => {
        const automaton = await getAutomatonContract();
        const [value, ...params] = computedDataRef.current;
        logger.debug('Running setupAutomation:');
        logger.table({automaton, value});
        logger.table(params);
        return automaton.methods.setupAutomation(...params).send({from: wallet, value});
      };

      setStatus('fetching');
      submitToContract()
        .then(() => setStatus('completed'))
        .catch(e => logger.error(e) || setStatus('error'));
    },
    [wallet]
  );

  const nextStep = useCallback(
    async e => {
      e.preventDefault();
      if (await validate()) {
        setStep(step => step + 1);
      }
    },
    [validate]
  );

  const previousStep = useCallback(e => {
    e.preventDefault();
    setStep(step => step - 1);
  }, []);

  const StepView = getFormFromStep(step);

  return (
    <form {...props} noValidate onSubmit={form.handleSubmit(onSubmit)}>
      <p>Standard: 0x879a5031823942b52c0f0a770d97235e6227da34</p>
      <p>Payable: 0x5969c6afdf69ebf671f46ced3461d55969deef3c</p>
      <Layout className={styles.abiFormWizard}>
        <Layout>
          <Content>{isLastStep ? <StepView computedData={computedDataRef} /> : <StepView />}</Content>
          <Footer>
            <Divider />
            <Space>
              <Button hidden={isFirstStep} disabled={isFirstStep} type="text" onClick={previousStep}>
                Previous
              </Button>
              {isLastStep ? (
                <Button disabled={status === 'fetching'} type="primary" htmlType={'submit'}>
                  Done
                </Button>
              ) : (
                <Button disabled={status === 'fetching'} type="primary" onClick={nextStep}>
                  {isLastStep ? 'Done' : 'Next'}
                </Button>
              )}
            </Space>
          </Footer>
        </Layout>
        <Sider width={'40%'} theme="light">
          <Steps direction="vertical" current={step}>
            <Step
              title="Insert a valid contract address"
              description="Contract address should be validated in Etherscan"
            ></Step>
            <Step
              title="Define the operation"
              description="Each smart contract has a set of methods. Pick the one to execute"
            ></Step>
            <Step title="Setup the parameters" description="Enter the details on how to execute it"></Step>
          </Steps>
        </Sider>
      </Layout>
    </form>
  );
};

const AbiForm = props => {
  const methods = useForm({
    shouldFocusErrors: true,
    mode: 'onChange',
    reValidateMode: 'onChange'
  });

  return (
    <EtherscanAbiProvider>
      <FormProvider {...methods}>
        <_AbiForm {...props} form={methods} />
      </FormProvider>
    </EtherscanAbiProvider>
  );
};

export default AbiForm;
