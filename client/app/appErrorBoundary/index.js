import React from 'react';
import {Result, Button} from 'antd';
import ErrorBoundary from '@/shared/components/errorBoundary';
import logger from '@/shared/logger';

const ErrorPage = () => (
  <Result
    status="500"
    title="This was not meant to happen"
    subTitle="Sorry, something went wrong. The team is informed and a fix is underway. Meanwhile try once again to use the platform"
    extra={
      <Button type="primary">Back Home</Button>
    }
  />
);

const AppErrorBoundary = ({children}) => {
  return (
    <ErrorBoundary logError={logger.error} renderError={ErrorPage}>
      {children}
    </ErrorBoundary>
  );
};


export default AppErrorBoundary;
