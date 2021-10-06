import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'

import classNames from 'classnames';

import NetworkInfo from '@/components/layout/header/NetworkInfo'

import EtherplateWhiteLogoImage from '@/images/logos/etherplate-logo--white--lg.png'

import './header.scss';

const Header = class extends Component {

  constructor (props) {
    super(props)
    this.state = {
      mobileNavActive: false
    }
  }

  handleBurgerClick = (event) => {
    event.preventDefault()

    this.setState({
      mobileNavActive: !this.state.mobileNavActive,
      something :false
    })
  }

  render () {
    return (
      <nav id="navbar" styleName="navbar">
        <div styleName="container">
          <div styleName="navbar-brand">
            <div styleName="navbar-item">
              <NavLink to="/">
                <img src={`/${EtherplateWhiteLogoImage}`} />
              </NavLink>
            </div>

            <a
              role="button"
              styleName={classNames('navbar-burger', { 'is-active': this.state.mobileNavActive })}
              data-target="navMenu"
              aria-label="menu"
              aria-expanded="false"
              onClick={this.handleBurgerClick}>
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
            </a>
          </div>

          <div
            id="navMenu"
            styleName={classNames('navbar-menu', { 'is-active': this.state.mobileNavActive })}>
            <div styleName="navbar-start">
              <div styleName="navbar-item">
                <NavLink to="/tokens/new" activeClassName="is-active"  styleName="">
                  <span>Purchase Token</span>
                </NavLink>
              </div>
              <div styleName='navbar-item'>
                <NavLink to="/tokens/all" activeClassName="is-active">
                  <span>All Tokens</span>
                </NavLink>
              </div>
              <div styleName="navbar-item">
                <NavLink to="/tokens/purchased" activeClassName="is-active">
                  <span>My Purchase History</span>
                </NavLink>
              </div>
            </div>
          </div>

          <NetworkInfo />
        </div>

      </nav>
    )
  }
}

export default Header;
