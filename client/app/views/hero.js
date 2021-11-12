import React from 'react';

const Hero = ({ children }) => (
  <section className="hero">
    <div className="hero-body">
      <div className="container has-text-centered">{children}</div>
    </div>
  </section>
);

export default Hero;
