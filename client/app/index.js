import React, {useState, useCallback} from 'react';
import {hot} from 'react-hot-loader/root';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
// import simpleStorage from './contracts/simpleStorageFactory';
import Header from './views/layout/header';
import Footer from './views/layout/footer';
import Landing from './views/landing';
import NotFoundPage from './views/not-found';
import useWalletAccount from '@/shared/hooks/useWalletAccount';
import {EthereumProvider} from '@/shared/providers/ethereum';
import {WalletProvider} from '@/shared/providers/wallet';
import styles from './app.scss';
import {Layout} from 'antd';
const {Content} = Layout;

const App = () => {
  return (
    <div className={styles.app}>
      <EthereumProvider>
        <WalletProvider>
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
        </WalletProvider>
      </EthereumProvider>
    </div>
  );
};

export default App;
