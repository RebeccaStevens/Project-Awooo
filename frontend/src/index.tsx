/**
 * The entry point for the app.
 */

import React from 'react';
import ReactDOM from 'react-dom';

import { App } from './App';
import { register as registerServiceWorker } from './serviceWorker';

import './index.css';

if (process.env.NODE_ENV !== 'production') {
  console.info(`Environment: ${process.env.NODE_ENV}`);
}

ReactDOM.hydrate(<App />, document.querySelector('#root'));

if (process.env.NODE_ENV === 'production') {
  registerServiceWorker()
    .catch((_error) => {
      console.error('An error occurred during service worker registration - service worker not registered.');
    });
} else {
  console.info('Skipping ServiceWorker register - not in production environment.');
}
