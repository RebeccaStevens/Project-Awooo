/**
 * The entry point for the app.
 */

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { App } from './App';
import { register as registerServiceWorker } from './serviceWorker';

import './index.css';

console.info(`Environment: ${process.env.NODE_ENV}`);

ReactDOM.render(
  <App />,
  document.querySelector('#root')
);

if (process.env.NODE_ENV === 'production') {
  registerServiceWorker()
    .catch((error) => {
      console.error('Error during service worker registration:', error);
    });
} else {
  console.info('Skipping ServiceWorker register - not in production environment.');
}
