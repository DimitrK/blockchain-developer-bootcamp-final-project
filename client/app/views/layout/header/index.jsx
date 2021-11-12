import React, {Component} from 'react';
import {NavLink} from 'react-router-dom';
import classNames from 'classnames';
import {Layout, Menu} from 'antd';
import {MailOutlined, AppstoreOutlined, SettingOutlined} from '@ant-design/icons';
import NetworkInfo from '@/views/layout/header/NetworkInfo';
import EtherplateWhiteLogoImage from '@/images/logos/etherplate-logo--white--lg.png';
import './header.scss';

const {Header} = Layout;

const AppHeader = () => {

  return (
    <Header>
      <div className="logo" />
      <Menu mode="horizontal" theme="dark">
        <Menu.Item key="app" icon={<AppstoreOutlined />}>
          Option
        </Menu.Item>
        <Menu.SubMenu key="SubMenu" icon={<SettingOutlined />} title="Ether">
          <Menu.Item key="setting:etherscan">
            <NavLink to="/etherscan" activeClassName="is-active" styleName="">
              <span>View on Etherscan</span>
            </NavLink>
          </Menu.Item>
          <Menu.Item key="setting:disconnect">
            <NavLink to="/disconnect" activeClassName="is-active">
              <span>Disconnect wallet</span>
            </NavLink>
          </Menu.Item>
        </Menu.SubMenu>
        {/* <Menu.Item><NetworkInfo /></Menu.Item> */}
      </Menu>
    </Header>
  );
};

export default AppHeader;
