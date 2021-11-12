import React, {useState, useCallback} from 'react';
import {hot} from 'react-hot-loader/root';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import simpleStorage from './contracts/simpleStorageFactory';
import Header from './views/layout/header';
import Footer from './views/layout/footer';
import Landing from './views/landing';
import NotFoundPage from './views/not-found';
import useWalletAccount from '@/shared/hooks/useWalletAccount';
import styles from './app.scss';
import {Layout} from 'antd';
const {Content} = Layout;

const App = () => {
  const {account, error} = useWalletAccount();
  if (account) {
    window.web3.eth.defaultAccount = account;
  } else {
    return null;
  }

  return (
    <div className={styles.app}>
      <BrowserRouter className={styles.root}>
        <Layout>
          <Route path="/:active?" component={Header} />

          <Content>
            <Switch>
              <Route exact={true} path="/" component={Landing} />
              <Route component={NotFoundPage} />
            </Switch>
          </Content>

          <Footer />
        </Layout>
      </BrowserRouter>
    </div>
  );
};

export default App;
