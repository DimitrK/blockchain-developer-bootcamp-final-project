import React, {Component} from 'react';
import {Layout} from 'antd';
const {Footer} = Layout;

import './footer.scss';

export default class AppFooter extends Component {
  render() {
    return (
      <Footer>
        <p>
          <strong>Athens</strong> is a boilerplate Ethereum example DApp Built in Athens.
        </p>
      </Footer>
    );
  }
}
