import React from 'react';
import {Link} from 'react-router-dom';
import Hero from '@/views/hero';
import AbiForm from '@/views/etherscan';
import {useEthInfo} from '@/shared/providers/ethereum';


const Landing = (props) => {
  const {version, network} = useEthInfo();
  return (
    <Hero>
      <div className="columns">
        <div className="column is-two-thirds">
        </div>
        <div className="column">
          <AbiForm/>
        </div>
      </div>
    </Hero>
  );
};

export default Landing;