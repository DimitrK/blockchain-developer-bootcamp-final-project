import 'core-js/stable';
import 'regenerator-runtime/runtime';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import AppErrorBoundary from './app/appErrorBoundary';

export const init = elem => {
  ReactDOM.render(
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>,
    elem
  );
};

init(window.document.getElementById('application'));
