import React, {useState, useCallback, useEffect} from 'react';
import {useForm, FormProvider} from 'react-hook-form';
import {Steps, Button, Layout, Space, Divider} from 'antd';
import {EtherscanAbiProvider} from '@/shared/providers/etherscanAbi';
import ContractAbiForm from './contractAbiForm';
import CallbackAbiForm from './callbackAbiForm';
import ReviewForm from './reviewForm';
import styles from './styles.scss';
const {Content, Footer, Sider} = Layout;
const {Step} = Steps;

const getFormFromStep = step => {
  switch (step) {
    case 0:
      return <ContractAbiForm />;
    case 1:
      return <CallbackAbiForm />;
    case 2:
      return <ReviewForm />;
    default:
      return <p>The form has been submitted</p>
  }
};

const AbiForm = () => {
  const [step, setStep] = useState(0);
  const [stepEnabled, setStepEnabled] = useState(false);
  const methods = useForm({
    shouldFocusErrors: true,
    mode: 'onChange',
    reValidateMode: 'onChange'
  });
  const {trigger: validate} = methods;
  const isFirstStep = step === 0;
  const isLastStep = step === 2;

  const onSubmit = useCallback((data) => {
    console.log(data);
  }, []);

  const nextStep = useCallback(async (e) => {
    e.preventDefault();
    if (await validate()) {
      setStep(step => step + 1);
    }
  }, [validate]);

  const previousStep = useCallback((e) => {
    e.preventDefault();
    setStep(step => step - 1);
  }, []);

  return (
    <EtherscanAbiProvider>
      <FormProvider {...methods}>
        <form noValidate onSubmit={methods.handleSubmit(onSubmit)}>
          <p>Standard: 0x879a5031823942b52c0f0a770d97235e6227da34</p>
          <p>Payable: 0x5969c6afdf69ebf671f46ced3461d55969deef3c</p>
          <Layout className={styles.abiFormWizard}>
            <Layout>
              <Content>
                <div>{getFormFromStep(step)}</div>
              </Content>
              <Footer>
                <Divider />
                <Space>
                  <Button hidden={isFirstStep} disabled={isFirstStep} type="text" onClick={previousStep}>
                    Previous
                  </Button>
                  {isLastStep ? (
                    <Button type="primary" htmlType={'submit'}>
                      Done
                    </Button>
                  ) : (
                    <Button type="primary" onClick={nextStep}>
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
      </FormProvider>
    </EtherscanAbiProvider>
  );
};

export default AbiForm;
