/**
 * The entry point for the app.
 */

import React from 'react';
import ReactDOM from 'react-dom';

import { App } from './App';

import './index.css';

if (process.env.NODE_ENV !== 'production') {
  console.info(`Environment: ${process.env.NODE_ENV}`);
}

ReactDOM.render(<App />, document.querySelector('#root'));
