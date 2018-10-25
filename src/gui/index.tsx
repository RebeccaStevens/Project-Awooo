/**
 * The entry point for the app.
 */

import React from 'react';
import ReactDOM from 'react-dom';

import { App } from './components/App';
import { DevInfo } from './components/DevInfo';

import './index.css';

ReactDOM.render(<App />, document.querySelector('#root'));

if (process.env.NODE_ENV !== 'production') {
  console.info(`Environment: ${process.env.NODE_ENV}`);

  const devInfoRoot = document.createElement('div');
  document.body.appendChild(devInfoRoot);
  ReactDOM.render(<DevInfo />, devInfoRoot);
}
