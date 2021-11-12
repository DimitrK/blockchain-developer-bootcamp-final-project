import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import Hero from '@/views/hero';
import AbiForm from '@/views/etherscan';

export default class Landing extends Component {
  render() {
    return (
      <Hero>
        <div className="columns">
          <div className="column is-two-thirds">
            <Link to="/tokens/new" className="button is-info is-large">
              <span>Buy a Token Now</span>
            </Link>
          </div>

          <div className="column">
            <AbiForm/>
          </div>
        </div>
      </Hero>
    );
  }
}
