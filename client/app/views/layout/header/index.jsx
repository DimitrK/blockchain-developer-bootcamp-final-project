import React, {Component} from 'react';
import {NavLink} from 'react-router-dom';
import classNames from 'classnames';
import {Layout, Menu} from 'antd';
import {MailOutlined, AppstoreOutlined, SettingOutlined} from '@ant-design/icons';
import NetworkInfo from '@/views/layout/header/NetworkInfo';
import EtherplateWhiteLogoImage from '@/images/logos/etherplate-logo--white--lg.png';
import {useWallet} from '@/shared/providers/wallet';
import './header.scss';

const {Header} = Layout;

const AppHeader = () => {
  const {wallet, connect} = useWallet();
  return (
    <Header>
      <div className="logo" />
      <Menu mode="horizontal" theme="dark">
        <Menu.Item key="app" icon={<AppstoreOutlined />}>
          Option
        </Menu.Item>
        {!wallet && (
          <Menu.Item icon={<SettingOutlined />} title="Ether" key="setting:connect" onClick={connect}>
            <span>Connect wallet</span>
          </Menu.Item>
        )}
        <Menu.Item key="setting:wallet">
          <NetworkInfo />
        </Menu.Item>
      </Menu>
    </Header>
  );
};

export default AppHeader;
