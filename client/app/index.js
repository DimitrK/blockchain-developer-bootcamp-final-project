import React from 'react';
import {hot} from 'react-hot-loader/root';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import simpleStorage from '@/contracts/simpleStorageFactory';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import Landing from '@/components/landing';
import NotFoundPage from '@/components/not-found';
import useWalletAccount from './useWalletAccount';
import './app.scss';

const App = () => {
  const account = useWalletAccount();
  if (account) {
    window.web3.eth.defaultAccount = account;
  } else {
    return null;
  }
  return (
    <div styleName='app'>
      <BrowserRouter styleName="root">
        <Route path="/:active?" component={Header} />

        <main>
          <Switch>
            <Route exact={true} path="/" component={Landing} />
            <Route component={NotFoundPage} />
          </Switch>
        </main>

        <Footer />
      </BrowserRouter>
    </div>
  );
};

export default hot(App);
