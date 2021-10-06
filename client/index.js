import "core-js/stable";
import "regenerator-runtime/runtime";
import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';

export const init = elem => {
  ReactDOM.render(<App/>, elem);
};


init(window.document.getElementById('application'));